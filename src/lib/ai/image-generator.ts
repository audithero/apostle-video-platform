/**
 * DALL-E 3 integration for generating course-related images.
 *
 * Supports 16:9 (thumbnails) and 4:3 (lesson illustrations) aspect ratios
 * via the OpenAI Images API.
 */

import OpenAI from "openai";
import { env } from "@/lib/env.server";
import type { GeneratedImage, ImageAspectRatio, ImageInput } from "./types";
import { IMAGE_PROMPT_TEMPLATE, interpolateTemplate } from "./prompts";

// ---------------------------------------------------------------------------
// Client singleton
// ---------------------------------------------------------------------------

let openaiClient: OpenAI | null = null;

const getClient = (): OpenAI => {
  if (openaiClient) {
    return openaiClient;
  }
  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
};

// ---------------------------------------------------------------------------
// Aspect ratio to DALL-E size mapping
// ---------------------------------------------------------------------------

const ASPECT_RATIO_TO_SIZE: Readonly<Record<ImageAspectRatio, "1792x1024" | "1024x1024">> = {
  "16:9": "1792x1024",
  "4:3": "1024x1024",
} as const;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates a course-related image using DALL-E 3.
 *
 * @param input - The description and desired aspect ratio
 * @returns The generated image URL and the revised prompt DALL-E used
 *
 * @example
 * ```ts
 * const image = await generateCourseImage({
 *   description: "A course about machine learning fundamentals",
 *   aspectRatio: "16:9",
 * });
 * ```
 */
export const generateCourseImage = async (input: ImageInput): Promise<GeneratedImage> => {
  const client = getClient();

  const prompt = interpolateTemplate(IMAGE_PROMPT_TEMPLATE, {
    description: input.description,
  });

  const size = ASPECT_RATIO_TO_SIZE[input.aspectRatio];

  const response = await client.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size,
    quality: "standard",
    response_format: "url",
  });

  const imageData = response.data?.at(0);
  if (!imageData?.url) {
    throw new Error("DALL-E returned no image data");
  }

  return {
    url: imageData.url,
    revisedPrompt: imageData.revised_prompt ?? prompt,
  };
};
