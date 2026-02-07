import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { course, courseModule, lesson } from "@/lib/db/schema/course";
import { getPresignedUploadUrl, generateVideoKey, getPublicUrl } from "@/lib/storage/r2-upload";
import { usageTracker } from "@/lib/billing/usage-tracker";
import { checkCanPerformAction } from "@/lib/billing/tier-limits";

export const videoUploadsRouter = createTRPCRouter({
  // Get presigned upload URL for lesson video
  getUploadUrl: creatorProcedure
    .input(
      z.object({
        lessonId: z.string(),
        filename: z.string(),
        contentType: z.string().refine(
          (ct) => ct.startsWith("video/"),
          "Must be a video content type",
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check usage limits (checkCanPerformAction is sync: tier, metric, currentUsage, overageEnabled)
      // For now, pass 0 as currentUsage since we don't track it here yet
      const canUpload = checkCanPerformAction(ctx.creator.tier, "videoStorageSeconds", 0, false);
      if (!canUpload.allowed) {
        throw new Error(canUpload.reason ?? "Video storage limit reached");
      }

      const key = generateVideoKey(ctx.creator.id, input.lessonId, input.filename);

      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        key,
        contentType: input.contentType,
        expiresIn: 900, // 15 minutes
      });

      return {
        uploadUrl,
        key,
        publicUrl,
      };
    }),

  // Confirm video upload and update lesson
  confirmUpload: creatorProcedure
    .input(
      z.object({
        lessonId: z.string(),
        storageKey: z.string(),
        durationSeconds: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify lesson ownership via lesson -> module -> course chain
      const [lessonRecord] = await db
        .select({ moduleId: lesson.moduleId })
        .from(lesson)
        .where(eq(lesson.id, input.lessonId))
        .limit(1);
      if (!lessonRecord) return null;

      const [mod] = await db
        .select({ courseId: courseModule.courseId })
        .from(courseModule)
        .where(eq(courseModule.id, lessonRecord.moduleId))
        .limit(1);
      if (!mod) return null;

      const [owned] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, mod.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);
      if (!owned) return null;

      const publicUrl = getPublicUrl(input.storageKey);

      const [updated] = await db
        .update(lesson)
        .set({
          videoUrl: publicUrl,
          videoStorageKey: input.storageKey,
          videoDurationSeconds: input.durationSeconds,
          lessonType: "video",
          updatedAt: new Date(),
        })
        .where(eq(lesson.id, input.lessonId))
        .returning();

      // Track usage
      const durationHours = (input.durationSeconds ?? 0) / 3600;
      if (durationHours > 0) {
        await usageTracker.trackVideoUpload(ctx.creator.id, durationHours);
      }

      return updated;
    }),

  // Get presigned upload URL for image (thumbnails, course images)
  getImageUploadUrl: creatorProcedure
    .input(
      z.object({
        purpose: z.enum(["thumbnail", "course-cover", "certificate-bg", "logo", "favicon"]),
        filename: z.string(),
        contentType: z.string().refine(
          (ct) => ct.startsWith("image/"),
          "Must be an image content type",
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ext = input.filename.split(".").pop() ?? "png";
      const timestamp = Date.now();
      const key = `creators/${ctx.creator.id}/images/${input.purpose}/${String(timestamp)}.${ext}`;

      const { uploadUrl, publicUrl } = await getPresignedUploadUrl({
        key,
        contentType: input.contentType,
        expiresIn: 600,
      });

      return {
        uploadUrl,
        key,
        publicUrl,
      };
    }),
});
