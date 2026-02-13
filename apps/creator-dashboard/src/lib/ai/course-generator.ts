/**
 * AI Course Generation service powered by OpenRouter.
 *
 * Every method supports:
 *   - Retry with exponential backoff on transient failures
 *   - Structured JSON output parsing
 *   - AbortSignal cancellation
 */

import { env } from "@/lib/env.server";
import type {
  AIGenerationOptions,
  AIStreamCallback,
  CourseOutline,
  GeneratedLesson,
  GeneratedQuiz,
  LessonInput,
  OutlineInput,
  QuizInput,
  RewriteInput,
  SummaryInput,
} from "./types";
import {
  LESSON_SYSTEM_PROMPT,
  LESSON_USER_TEMPLATE,
  OUTLINE_SYSTEM_PROMPT,
  OUTLINE_USER_TEMPLATE,
  QUIZ_SYSTEM_PROMPT,
  QUIZ_USER_TEMPLATE,
  REWRITE_SYSTEM_PROMPT,
  REWRITE_USER_TEMPLATE,
  SUMMARY_SYSTEM_PROMPT,
  SUMMARY_USER_TEMPLATE,
  interpolateTemplate,
} from "./prompts";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OPENROUTER_MODEL = "anthropic/claude-3.7-sonnet";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY_MS = 1_000;
const MAX_TOKENS_OUTLINE = 8_192;
const MAX_TOKENS_LESSON = 8_192;
const MAX_TOKENS_QUIZ = 4_096;
const MAX_TOKENS_REWRITE = 8_192;
const MAX_TOKENS_SUMMARY = 2_048;

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

const getApiKey = (): string => {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return apiKey;
};

// ---------------------------------------------------------------------------
// Retry logic with exponential backoff
// ---------------------------------------------------------------------------

interface RetryConfig {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly signal?: AbortSignal;
}

const isTransientError = (error: unknown): boolean => {
  // Check for API errors with retryable status codes
  if (
    error instanceof Error
    && "status" in error
    && typeof (error as Error & { status: number }).status === "number"
  ) {
    const status = (error as Error & { status: number }).status;
    // Retry on rate limits (429), server errors (500, 502, 503), and overloaded (529)
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 529;
  }
  // Retry on network errors
  if (error instanceof TypeError && (error.message.includes("fetch") || error.message.includes("network"))) {
    return true;
  }
  return false;
};

const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    }, { once: true });
  });
};

const withRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    try {
      if (config.signal?.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      return await operation();
    } catch (error) {
      lastError = error;

      // Do not retry on abort
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      // Do not retry on non-transient errors or if we exhausted retries
      if (!isTransientError(error) || attempt === config.maxRetries) {
        throw error;
      }

      // Exponential backoff with jitter
      const jitter = Math.random() * 0.5 + 0.75; // 0.75 - 1.25x
      const delay = config.baseDelayMs * (2 ** attempt) * jitter;
      await sleep(delay, config.signal);
    }
  }

  // Unreachable in practice, but TypeScript needs it
  throw lastError;
};

// ---------------------------------------------------------------------------
// Streaming + JSON extraction helpers
// ---------------------------------------------------------------------------

interface StreamingGenerationParams {
  readonly model: string;
  readonly systemPrompt: string;
  readonly userMessage: string;
  readonly maxTokens: number;
  readonly onStream?: AIStreamCallback;
  readonly signal?: AbortSignal;
}

const callOpenRouter = async (params: StreamingGenerationParams): Promise<string> => {
  const apiKey = getApiKey();

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://apostle-video-platform.vercel.app",
      "X-Title": "Apostle Course Creator",
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userMessage },
      ],
      max_tokens: params.maxTokens,
      temperature: 0.7,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    const error = new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
    (error as Error & { status: number }).status = response.status;
    throw error;
  }

  const data = await response.json() as { choices: Array<{ message: { content: string } }> };
  const content = data.choices?.at(0)?.message?.content;

  if (!content) {
    throw new Error("No content in OpenRouter response");
  }

  // Call stream callback with full content for compatibility
  if (params.onStream) {
    await params.onStream(content);
  }

  return content;
};

/**
 * Extracts a JSON object from a string that may contain surrounding text.
 * Finds the first `{` and the last `}` and attempts to parse the substring.
 */
const extractJson = <T>(raw: string): T => {
  const firstBrace = raw.indexOf("{");
  const lastBrace = raw.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response");
  }

  const jsonString = raw.slice(firstBrace, lastBrace + 1);

  try {
    return JSON.parse(jsonString) as T;
  } catch (parseError) {
    throw new Error(
      `Failed to parse JSON from AI response: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
    );
  }
};

// ---------------------------------------------------------------------------
// Resolve options with defaults
// ---------------------------------------------------------------------------

interface ResolvedOptions {
  readonly maxRetries: number;
  readonly baseDelayMs: number;
  readonly onStream?: AIStreamCallback;
  readonly signal?: AbortSignal;
}

const resolveOptions = (options?: AIGenerationOptions): ResolvedOptions => ({
  maxRetries: options?.maxRetries ?? DEFAULT_MAX_RETRIES,
  baseDelayMs: options?.baseDelayMs ?? DEFAULT_BASE_DELAY_MS,
  onStream: options?.onStream,
  signal: options?.signal,
});

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a structured course outline using Claude Sonnet.
 *
 * @param input - Topic, audience, level, and module count
 * @param options - Streaming callback, retry config, and abort signal
 * @returns A structured CourseOutline object
 *
 * @example
 * ```ts
 * const outline = await generateOutline(
 *   { topic: "React Hooks", audience: "Junior developers", level: "intermediate", moduleCount: 4 },
 *   { onStream: (chunk) => process.stdout.write(chunk) },
 * );
 * ```
 */
export const generateOutline = async (
  input: OutlineInput,
  options?: AIGenerationOptions,
): Promise<CourseOutline> => {
  const resolved = resolveOptions(options);

  const userMessage = interpolateTemplate(OUTLINE_USER_TEMPLATE, {
    topic: input.topic,
    audience: input.audience,
    level: input.level,
    moduleCount: input.moduleCount,
  });

  const raw = await withRetry(
    () => callOpenRouter({
      model: OPENROUTER_MODEL,
      systemPrompt: OUTLINE_SYSTEM_PROMPT,
      userMessage,
      maxTokens: MAX_TOKENS_OUTLINE,
      onStream: resolved.onStream,
      signal: resolved.signal,
    }),
    { maxRetries: resolved.maxRetries, baseDelayMs: resolved.baseDelayMs, signal: resolved.signal },
  );

  return extractJson<CourseOutline>(raw);
};

/**
 * Expands a single lesson from an outline into full educational content using Claude Sonnet.
 *
 * @param input - The course outline context, lesson title, and objectives
 * @param options - Streaming callback, retry config, and abort signal
 * @returns A GeneratedLesson with TipTap JSON content and HTML fallback
 *
 * @example
 * ```ts
 * const lesson = await expandLesson({
 *   outlineContext: courseOutline,
 *   lessonTitle: "Understanding Variables",
 *   lessonObjectives: ["Define what a variable is", "Create variables in Python"],
 * });
 * ```
 */
export const expandLesson = async (
  input: LessonInput,
  options?: AIGenerationOptions,
): Promise<GeneratedLesson> => {
  const resolved = resolveOptions(options);

  const objectivesList = input.lessonObjectives
    .map((obj, idx) => `${idx + 1}. ${obj}`)
    .join("\n");

  const userMessage = interpolateTemplate(LESSON_USER_TEMPLATE, {
    courseTitle: input.outlineContext.title,
    courseDescription: input.outlineContext.description,
    courseLevel: input.outlineContext.level,
    lessonTitle: input.lessonTitle,
    lessonObjectives: objectivesList,
  });

  const raw = await withRetry(
    () => callOpenRouter({
      model: OPENROUTER_MODEL,
      systemPrompt: LESSON_SYSTEM_PROMPT,
      userMessage,
      maxTokens: MAX_TOKENS_LESSON,
      onStream: resolved.onStream,
      signal: resolved.signal,
    }),
    { maxRetries: resolved.maxRetries, baseDelayMs: resolved.baseDelayMs, signal: resolved.signal },
  );

  return extractJson<GeneratedLesson>(raw);
};

/**
 * Generates quiz questions from lesson content using Claude Haiku.
 *
 * @param input - Lesson content, question count, and allowed question types
 * @param options - Streaming callback, retry config, and abort signal
 * @returns A GeneratedQuiz with questions, passing score, and time limit
 *
 * @example
 * ```ts
 * const quiz = await generateQuiz({
 *   lessonContent: "Variables are named containers...",
 *   questionCount: 5,
 *   questionTypes: ["multiple_choice", "true_false"],
 * });
 * ```
 */
export const generateQuiz = async (
  input: QuizInput,
  options?: AIGenerationOptions,
): Promise<GeneratedQuiz> => {
  const resolved = resolveOptions(options);

  const userMessage = interpolateTemplate(QUIZ_USER_TEMPLATE, {
    lessonContent: input.lessonContent,
    questionCount: input.questionCount,
    questionTypes: input.questionTypes.join(", "),
  });

  const raw = await withRetry(
    () => callOpenRouter({
      model: OPENROUTER_MODEL,
      systemPrompt: QUIZ_SYSTEM_PROMPT,
      userMessage,
      maxTokens: MAX_TOKENS_QUIZ,
      onStream: resolved.onStream,
      signal: resolved.signal,
    }),
    { maxRetries: resolved.maxRetries, baseDelayMs: resolved.baseDelayMs, signal: resolved.signal },
  );

  return extractJson<GeneratedQuiz>(raw);
};

/**
 * Summary / description shape returned by generateSummary.
 */
interface CourseSummary {
  readonly shortDescription: string;
  readonly fullDescription: string;
  readonly tags: ReadonlyArray<string>;
  readonly targetAudience: string;
  readonly keySkills: ReadonlyArray<string>;
}

/**
 * Generates a marketing-ready course summary using Claude Haiku.
 *
 * @param input - The full course content to summarize
 * @param options - Streaming callback, retry config, and abort signal
 * @returns A CourseSummary with short/long descriptions, tags, and key skills
 *
 * @example
 * ```ts
 * const summary = await generateSummary({
 *   courseContent: JSON.stringify(courseOutline),
 * });
 * ```
 */
export const generateSummary = async (
  input: SummaryInput,
  options?: AIGenerationOptions,
): Promise<CourseSummary> => {
  const resolved = resolveOptions(options);

  const userMessage = interpolateTemplate(SUMMARY_USER_TEMPLATE, {
    courseContent: input.courseContent,
  });

  const raw = await withRetry(
    () => callOpenRouter({
      model: OPENROUTER_MODEL,
      systemPrompt: SUMMARY_SYSTEM_PROMPT,
      userMessage,
      maxTokens: MAX_TOKENS_SUMMARY,
      onStream: resolved.onStream,
      signal: resolved.signal,
    }),
    { maxRetries: resolved.maxRetries, baseDelayMs: resolved.baseDelayMs, signal: resolved.signal },
  );

  return extractJson<CourseSummary>(raw);
};

/**
 * Rewrites or enhances existing lesson content using Claude Sonnet.
 *
 * @param input - The current content, rewrite instruction, and course context
 * @param options - Streaming callback, retry config, and abort signal
 * @returns A GeneratedLesson with the rewritten content
 *
 * @example
 * ```ts
 * const result = await rewriteContent({
 *   content: "<p>Current lesson HTML...</p>",
 *   instruction: "Simplify the language for beginners",
 *   outlineContext: { title: "React Hooks", description: "...", level: "intermediate" },
 * });
 * ```
 */
export const rewriteContent = async (
  input: RewriteInput,
  options?: AIGenerationOptions,
): Promise<GeneratedLesson> => {
  const resolved = resolveOptions(options);

  const userMessage = interpolateTemplate(REWRITE_USER_TEMPLATE, {
    instruction: input.instruction,
    courseTitle: input.outlineContext.title,
    courseDescription: input.outlineContext.description,
    courseLevel: input.outlineContext.level,
    content: input.content,
  });

  const raw = await withRetry(
    () => callOpenRouter({
      model: OPENROUTER_MODEL,
      systemPrompt: REWRITE_SYSTEM_PROMPT,
      userMessage,
      maxTokens: MAX_TOKENS_REWRITE,
      onStream: resolved.onStream,
      signal: resolved.signal,
    }),
    { maxRetries: resolved.maxRetries, baseDelayMs: resolved.baseDelayMs, signal: resolved.signal },
  );

  return extractJson<GeneratedLesson>(raw);
};
