import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { course, courseModule, lesson, quiz, quizQuestion } from "@/lib/db/schema/course";

/**
 * Verify that a lesson belongs to the current creator via lesson -> module -> course chain.
 * Returns the lesson's moduleId if valid, null otherwise.
 */
async function verifyLessonOwnership(lessonId: string, creatorId: string): Promise<string | null> {
  const [lessonRecord] = await db
    .select({ moduleId: lesson.moduleId })
    .from(lesson)
    .where(eq(lesson.id, lessonId))
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
    .where(and(eq(course.id, mod.courseId), eq(course.creatorId, creatorId)))
    .limit(1);

  return owned ? lessonRecord.moduleId : null;
}

/**
 * Verify that a module belongs to the current creator.
 */
async function verifyModuleOwnership(moduleId: string, creatorId: string): Promise<boolean> {
  const [mod] = await db
    .select({ courseId: courseModule.courseId })
    .from(courseModule)
    .where(eq(courseModule.id, moduleId))
    .limit(1);
  if (!mod) return false;

  const [owned] = await db
    .select({ id: course.id })
    .from(course)
    .where(and(eq(course.id, mod.courseId), eq(course.creatorId, creatorId)))
    .limit(1);

  return !!owned;
}

export const lessonsRouter = createTRPCRouter({
  // Get lesson by ID with quiz data
  getById: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const moduleId = await verifyLessonOwnership(input.id, ctx.creator.id);
      if (!moduleId) return null;

      const [result] = await db
        .select()
        .from(lesson)
        .where(eq(lesson.id, input.id))
        .limit(1);

      if (!result) return null;

      // If quiz type, get quiz data
      let quizData = null;
      if (result.lessonType === "quiz") {
        const [quizRecord] = await db
          .select()
          .from(quiz)
          .where(eq(quiz.lessonId, input.id))
          .limit(1);

        if (quizRecord) {
          const questions = await db
            .select()
            .from(quizQuestion)
            .where(eq(quizQuestion.quizId, quizRecord.id))
            .orderBy(asc(quizQuestion.sortOrder));
          quizData = { ...quizRecord, questions };
        }
      }

      return { ...result, quiz: quizData };
    }),

  // Create lesson
  create: creatorProcedure
    .input(
      z.object({
        moduleId: z.string(),
        title: z.string().min(1).max(200),
        lessonType: z.enum(["video", "text", "quiz", "assignment", "live"]).default("text"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify module ownership
      const isOwned = await verifyModuleOwnership(input.moduleId, ctx.creator.id);
      if (!isOwned) return null;

      // Get max sort order in module
      const existing = await db
        .select({ sortOrder: lesson.sortOrder })
        .from(lesson)
        .where(eq(lesson.moduleId, input.moduleId))
        .orderBy(asc(lesson.sortOrder));

      const maxSort = existing.length > 0 ? Math.max(...existing.map((l) => l.sortOrder)) : -1;

      const [newLesson] = await db
        .insert(lesson)
        .values({
          moduleId: input.moduleId,
          title: input.title,
          lessonType: input.lessonType,
          sortOrder: maxSort + 1,
        })
        .returning();

      // If quiz type, create an empty quiz
      if (input.lessonType === "quiz") {
        await db.insert(quiz).values({
          lessonId: newLesson.id,
          title: input.title,
        });
      }

      return newLesson;
    }),

  // Update lesson metadata
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        lessonType: z.enum(["video", "text", "quiz", "assignment", "live"]).optional(),
        videoUrl: z.string().optional(),
        videoDurationSeconds: z.number().optional(),
        videoStorageKey: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        isFreePreview: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const moduleId = await verifyLessonOwnership(input.id, ctx.creator.id);
      if (!moduleId) return null;

      const { id, ...updates } = input;
      const [updated] = await db
        .update(lesson)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(lesson.id, id))
        .returning();
      return updated;
    }),

  // Update lesson content (separate mutation for autosave)
  updateContent: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        contentHtml: z.string().optional(),
        contentJson: z.unknown().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const moduleId = await verifyLessonOwnership(input.id, ctx.creator.id);
      if (!moduleId) return null;

      const { id, ...content } = input;
      const [updated] = await db
        .update(lesson)
        .set({ ...content, updatedAt: new Date() })
        .where(eq(lesson.id, id))
        .returning();
      return updated;
    }),

  // Delete lesson
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const moduleId = await verifyLessonOwnership(input.id, ctx.creator.id);
      if (!moduleId) return { success: false };

      await db.delete(lesson).where(eq(lesson.id, input.id));
      return { success: true };
    }),

  // Reorder lessons (within and across modules)
  reorder: creatorProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            id: z.string(),
            moduleId: z.string(),
            sortOrder: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify all target modules belong to this creator
      const moduleIds = [...new Set(input.items.map((item) => item.moduleId))];
      for (const modId of moduleIds) {
        const isOwned = await verifyModuleOwnership(modId, ctx.creator.id);
        if (!isOwned) return { success: false };
      }

      await Promise.all(
        input.items.map((item) =>
          db
            .update(lesson)
            .set({ moduleId: item.moduleId, sortOrder: item.sortOrder })
            .where(eq(lesson.id, item.id)),
        ),
      );
      return { success: true };
    }),

  // Quiz CRUD within lessons
  updateQuiz: creatorProcedure
    .input(
      z.object({
        lessonId: z.string(),
        title: z.string().optional(),
        passingScorePercent: z.number().min(0).max(100).optional(),
        maxAttempts: z.number().min(1).optional().nullable(),
        timeLimitMinutes: z.number().min(1).optional().nullable(),
        questions: z
          .array(
            z.object({
              id: z.string().optional(), // undefined = new question
              questionText: z.string().min(1),
              questionType: z.enum(["multiple_choice", "true_false", "short_answer", "file_upload"]),
              options: z.array(z.string()).optional(),
              correctAnswer: z.union([z.string(), z.array(z.string())]).optional(),
              explanation: z.string().optional(),
              sortOrder: z.number(),
              points: z.number().default(1),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const moduleId = await verifyLessonOwnership(input.lessonId, ctx.creator.id);
      if (!moduleId) return null;

      const { lessonId, questions, ...quizUpdates } = input;

      // Update or create quiz
      let [quizRecord] = await db
        .select()
        .from(quiz)
        .where(eq(quiz.lessonId, lessonId))
        .limit(1);

      if (!quizRecord) {
        [quizRecord] = await db
          .insert(quiz)
          .values({ lessonId, title: quizUpdates.title ?? "Quiz" })
          .returning();
      } else if (Object.keys(quizUpdates).length > 0) {
        [quizRecord] = await db
          .update(quiz)
          .set(quizUpdates)
          .where(eq(quiz.id, quizRecord.id))
          .returning();
      }

      // Update questions if provided
      if (questions) {
        // Delete all existing questions and re-insert
        await db.delete(quizQuestion).where(eq(quizQuestion.quizId, quizRecord.id));

        if (questions.length > 0) {
          await db.insert(quizQuestion).values(
            questions.map((q) => ({
              quizId: quizRecord.id,
              questionText: q.questionText,
              questionType: q.questionType,
              options: q.options ?? null,
              correctAnswer: q.correctAnswer ?? null,
              explanation: q.explanation ?? null,
              sortOrder: q.sortOrder,
              points: q.points,
            })),
          );
        }
      }

      return quizRecord;
    }),
});
