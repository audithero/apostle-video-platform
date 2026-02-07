/**
 * HeyGen webhook handler for video generation status updates.
 * This is registered as an API route, not a tRPC router.
 */

import { db } from "@/lib/db";
import { lesson } from "@/lib/db/schema/course";
import { eq } from "drizzle-orm";
import { verifyHeyGenWebhook } from "@/lib/heygen/webhook";
import type { HeyGenWebhookPayload } from "@/lib/heygen/types";
import { env } from "@/lib/env.server";

export async function handleHeygenWebhook(
  body: string,
  signature: string,
): Promise<{ success: boolean; message: string }> {
  // Verify webhook signature
  const secret = env.HEYGEN_WEBHOOK_SECRET ?? "";
  const isValid = verifyHeyGenWebhook(body, signature, secret);
  if (!isValid) {
    return { success: false, message: "Invalid signature" };
  }

  const payload: HeyGenWebhookPayload = JSON.parse(body);

  // Find the lesson with this video ID
  const [targetLesson] = await db
    .select({ id: lesson.id })
    .from(lesson)
    .where(eq(lesson.heygenVideoId, payload.video_id))
    .limit(1);

  if (!targetLesson) {
    return { success: true, message: "No matching lesson found" };
  }

  switch (payload.event_type) {
    case "video.completed": {
      await db
        .update(lesson)
        .set({
          heygenVideoUrl: payload.video_url ?? null,
          heygenStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, targetLesson.id));
      break;
    }

    case "video.failed": {
      await db
        .update(lesson)
        .set({
          heygenStatus: "failed",
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, targetLesson.id));
      break;
    }

    case "video.expired": {
      await db
        .update(lesson)
        .set({
          heygenStatus: "expired",
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, targetLesson.id));
      break;
    }
  }

  return { success: true, message: `Processed ${payload.event_type}` };
}
