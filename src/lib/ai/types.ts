/**
 * TypeScript types for the AI Course Generation service layer.
 *
 * These types model the structured output from Claude and DALL-E,
 * aligning with the Drizzle schema in `src/lib/db/schema/course.ts`.
 */

// ---------------------------------------------------------------------------
// Bloom's taxonomy level used to tag learning objectives
// ---------------------------------------------------------------------------
export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

// ---------------------------------------------------------------------------
// Course outline (top-level generation result)
// ---------------------------------------------------------------------------
export interface LessonOutline {
  /** Lesson title */
  readonly title: string;
  /** One-sentence description of the lesson */
  readonly description: string;
  /** Primary Bloom's taxonomy level this lesson targets */
  readonly bloomLevel: BloomLevel;
  /** 2-4 measurable learning objectives */
  readonly objectives: ReadonlyArray<string>;
  /** Suggested lesson type matching the DB enum */
  readonly lessonType: "video" | "text" | "quiz" | "assignment" | "live";
  /** Estimated duration in minutes */
  readonly estimatedMinutes: number;
  /** Whether this lesson should be a free preview */
  readonly isFreePreview: boolean;
}

export interface ModuleOutline {
  /** Module title */
  readonly title: string;
  /** Short module description / summary */
  readonly description: string;
  /** Ordered list of lessons within this module */
  readonly lessons: ReadonlyArray<LessonOutline>;
}

export interface CourseOutline {
  /** Course title */
  readonly title: string;
  /** Slug-friendly version of the title */
  readonly slug: string;
  /** 2-3 sentence course description */
  readonly description: string;
  /** Target audience description */
  readonly audience: string;
  /** Difficulty level */
  readonly level: "beginner" | "intermediate" | "advanced";
  /** Prerequisites (empty array if none) */
  readonly prerequisites: ReadonlyArray<string>;
  /** High-level learning outcomes for the entire course */
  readonly learningOutcomes: ReadonlyArray<string>;
  /** Ordered list of modules */
  readonly modules: ReadonlyArray<ModuleOutline>;
  /** Estimated total duration in hours */
  readonly estimatedHours: number;
}

// ---------------------------------------------------------------------------
// TipTap-compatible JSON content node structure
// ---------------------------------------------------------------------------
export interface TipTapMark {
  readonly type: string;
  readonly attrs?: Readonly<Record<string, string | number | boolean | null>>;
}

export interface TipTapNode {
  readonly type: string;
  readonly attrs?: Readonly<Record<string, string | number | boolean | null>>;
  readonly content?: ReadonlyArray<TipTapNode>;
  readonly marks?: ReadonlyArray<TipTapMark>;
  readonly text?: string;
}

export interface TipTapDocument {
  readonly type: "doc";
  readonly content: ReadonlyArray<TipTapNode>;
}

// ---------------------------------------------------------------------------
// Expanded lesson content
// ---------------------------------------------------------------------------
export interface GeneratedLesson {
  /** Lesson title (echoed back for correlation) */
  readonly title: string;
  /** Full lesson content as TipTap JSON document */
  readonly contentJson: TipTapDocument;
  /** Plain-text fallback / HTML content */
  readonly contentHtml: string;
  /** Key takeaways for the lesson */
  readonly keyTakeaways: ReadonlyArray<string>;
  /** Suggested discussion prompts or reflection questions */
  readonly discussionPrompts: ReadonlyArray<string>;
  /** Estimated reading time in minutes */
  readonly estimatedReadingMinutes: number;
}

// ---------------------------------------------------------------------------
// Quiz generation
// ---------------------------------------------------------------------------
export interface QuizOption {
  /** Display label (e.g. "A", "B", "C", "D") */
  readonly label: string;
  /** Option text */
  readonly text: string;
}

export interface GeneratedQuestion {
  /** The question text */
  readonly questionText: string;
  /** Question type matching the DB enum */
  readonly questionType: "multiple_choice" | "true_false" | "short_answer";
  /** Answer options (populated for multiple_choice and true_false) */
  readonly options: ReadonlyArray<QuizOption>;
  /** The correct answer - label for MC/TF, expected text for short answer */
  readonly correctAnswer: string;
  /** Explanation of why the answer is correct (active recall reinforcement) */
  readonly explanation: string;
  /** Bloom's taxonomy level this question tests */
  readonly bloomLevel: BloomLevel;
  /** Point value */
  readonly points: number;
}

export interface GeneratedQuiz {
  /** Quiz title */
  readonly title: string;
  /** Ordered list of questions */
  readonly questions: ReadonlyArray<GeneratedQuestion>;
  /** Recommended passing score as a percentage */
  readonly passingScorePercent: number;
  /** Recommended time limit in minutes (null for untimed) */
  readonly timeLimitMinutes: number | null;
}

// ---------------------------------------------------------------------------
// AI generation options and callbacks
// ---------------------------------------------------------------------------

/** Callback invoked during streaming generation with partial text chunks */
export type AIStreamCallback = (chunk: string) => void | Promise<void>;

export interface AIGenerationOptions {
  /** Optional streaming callback for real-time progress */
  readonly onStream?: AIStreamCallback;
  /** Maximum number of retry attempts on transient failures (default: 3) */
  readonly maxRetries?: number;
  /** Base delay in milliseconds for exponential backoff (default: 1000) */
  readonly baseDelayMs?: number;
  /** AbortSignal to cancel the generation */
  readonly signal?: AbortSignal;
}

// ---------------------------------------------------------------------------
// Image generation
// ---------------------------------------------------------------------------
export type ImageAspectRatio = "16:9" | "4:3";

export interface GeneratedImage {
  /** URL of the generated image (OpenAI temporary URL) */
  readonly url: string;
  /** The revised prompt that DALL-E actually used */
  readonly revisedPrompt: string;
}

// ---------------------------------------------------------------------------
// Generation input parameters
// ---------------------------------------------------------------------------
export interface OutlineInput {
  readonly topic: string;
  readonly audience: string;
  readonly level: "beginner" | "intermediate" | "advanced";
  readonly moduleCount: number;
}

export interface LessonInput {
  /** Context from the broader course outline (only title, description, and level are used) */
  readonly outlineContext: {
    readonly title: string;
    readonly description: string;
    readonly level: string;
  };
  /** Title of the specific lesson to expand */
  readonly lessonTitle: string;
  /** Learning objectives for this lesson */
  readonly lessonObjectives: ReadonlyArray<string>;
}

export interface QuizInput {
  /** The lesson content to generate questions from */
  readonly lessonContent: string;
  /** Number of questions to generate */
  readonly questionCount: number;
  /** Types of questions to include */
  readonly questionTypes: ReadonlyArray<"multiple_choice" | "true_false" | "short_answer">;
}

export interface SummaryInput {
  /** The full course content to summarize */
  readonly courseContent: string;
}

export interface RewriteInput {
  /** The current lesson content (HTML) to rewrite */
  readonly content: string;
  /** Specific instruction for how to modify the content */
  readonly instruction: string;
  /** Course context for the AI */
  readonly outlineContext: {
    readonly title: string;
    readonly description: string;
    readonly level: string;
  };
}

export interface ImageInput {
  /** Description of what the image should depict */
  readonly description: string;
  /** Desired aspect ratio */
  readonly aspectRatio: ImageAspectRatio;
}
