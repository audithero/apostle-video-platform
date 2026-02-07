import { z } from "zod";
import { eq, and, desc, asc, like, count } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, publicProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import {
  course,
  courseModule,
  lesson,
  quiz,
  quizQuestion,
} from "@/lib/db/schema/course";
import { enrollment } from "@/lib/db/schema/enrollment";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const coursesRouter = createTRPCRouter({
  // List courses for creator dashboard
  list: creatorProcedure
    .input(
      z.object({
        status: z.enum(["draft", "published", "archived"]).optional(),
        search: z.string().optional(),
        cursor: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(course.creatorId, ctx.creator.id)];

      if (input.status) {
        conditions.push(eq(course.status, input.status));
      }
      if (input.search) {
        conditions.push(like(course.title, `%${input.search}%`));
      }

      const courses = await db
        .select()
        .from(course)
        .where(and(...conditions))
        .orderBy(asc(course.sortOrder), desc(course.createdAt))
        .limit(input.limit + 1);

      const hasMore = courses.length > input.limit;
      if (hasMore) courses.pop();

      return {
        courses,
        nextCursor: hasMore ? courses.at(-1)?.id : undefined,
      };
    }),

  // Get single course by slug (public, for student-facing)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), creatorId: z.string() }))
    .query(async ({ input }) => {
      const [result] = await db
        .select()
        .from(course)
        .where(and(eq(course.slug, input.slug), eq(course.creatorId, input.creatorId)))
        .limit(1);

      return result ?? null;
    }),

  // Get course by ID with full details (creator only)
  getById: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [result] = await db
        .select()
        .from(course)
        .where(and(eq(course.id, input.id), eq(course.creatorId, ctx.creator.id)))
        .limit(1);

      if (!result) return null;

      // Get modules with lessons
      const modules = await db
        .select()
        .from(courseModule)
        .where(eq(courseModule.courseId, input.id))
        .orderBy(asc(courseModule.sortOrder));

      const modulesWithLessons = await Promise.all(
        modules.map(async (mod) => {
          const lessons_ = await db
            .select()
            .from(lesson)
            .where(eq(lesson.moduleId, mod.id))
            .orderBy(asc(lesson.sortOrder));
          return { ...mod, lessons: lessons_ };
        }),
      );

      // Get enrollment count
      const [enrollmentStats] = await db
        .select({ count: count() })
        .from(enrollment)
        .where(eq(enrollment.courseId, input.id));

      return {
        ...result,
        modules: modulesWithLessons,
        enrollmentCount: enrollmentStats?.count ?? 0,
      };
    }),

  // Create course
  create: creatorProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        courseType: z.enum(["self_paced", "drip", "cohort"]).default("self_paced"),
        priceType: z.enum(["free", "paid", "subscription_only"]).default("free"),
        priceCents: z.number().min(0).default(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = slugify(input.title);

      // Handle slug collision
      const existing = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.creatorId, ctx.creator.id), eq(course.slug, slug)))
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const [newCourse] = await db
        .insert(course)
        .values({
          creatorId: ctx.creator.id,
          title: input.title,
          slug,
          description: input.description,
          courseType: input.courseType,
          priceType: input.priceType,
          priceCents: input.priceCents,
        })
        .returning();

      return newCourse;
    }),

  // Update course
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        courseType: z.enum(["self_paced", "drip", "cohort"]).optional(),
        dripIntervalDays: z.number().min(0).optional(),
        priceType: z.enum(["free", "paid", "subscription_only"]).optional(),
        priceCents: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;

      const [updated] = await db
        .update(course)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(course.id, id), eq(course.creatorId, ctx.creator.id)))
        .returning();

      return updated;
    }),

  // Delete course
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(course)
        .where(and(eq(course.id, input.id), eq(course.creatorId, ctx.creator.id)));
      return { success: true };
    }),

  // Duplicate course (deep copy)
  duplicate: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get original course
      const [original] = await db
        .select()
        .from(course)
        .where(and(eq(course.id, input.id), eq(course.creatorId, ctx.creator.id)))
        .limit(1);

      if (!original) return null;

      // Create new course
      const newSlug = `${original.slug}-copy-${Date.now().toString(36)}`;
      const [newCourse] = await db
        .insert(course)
        .values({
          creatorId: ctx.creator.id,
          title: `${original.title} (Copy)`,
          slug: newSlug,
          description: original.description,
          thumbnailUrl: original.thumbnailUrl,
          courseType: original.courseType,
          priceType: original.priceType,
          priceCents: original.priceCents,
          status: "draft",
        })
        .returning();

      // Copy modules and lessons
      const modules = await db
        .select()
        .from(courseModule)
        .where(eq(courseModule.courseId, input.id))
        .orderBy(asc(courseModule.sortOrder));

      for (const mod of modules) {
        const [newModule] = await db
          .insert(courseModule)
          .values({
            courseId: newCourse.id,
            title: mod.title,
            description: mod.description,
            sortOrder: mod.sortOrder,
            dripDelayDays: mod.dripDelayDays,
          })
          .returning();

        const lessons_ = await db
          .select()
          .from(lesson)
          .where(eq(lesson.moduleId, mod.id))
          .orderBy(asc(lesson.sortOrder));

        for (const les of lessons_) {
          const [newLesson] = await db
            .insert(lesson)
            .values({
              moduleId: newModule.id,
              title: les.title,
              contentHtml: les.contentHtml,
              contentJson: les.contentJson,
              lessonType: les.lessonType,
              videoUrl: les.videoUrl,
              videoDurationSeconds: les.videoDurationSeconds,
              thumbnailUrl: les.thumbnailUrl,
              sortOrder: les.sortOrder,
              isFreePreview: les.isFreePreview,
            })
            .returning();

          // Copy quiz if exists
          if (les.lessonType === "quiz") {
            const [originalQuiz] = await db
              .select()
              .from(quiz)
              .where(eq(quiz.lessonId, les.id))
              .limit(1);

            if (originalQuiz) {
              const [newQuiz] = await db
                .insert(quiz)
                .values({
                  lessonId: newLesson.id,
                  title: originalQuiz.title,
                  passingScorePercent: originalQuiz.passingScorePercent,
                  maxAttempts: originalQuiz.maxAttempts,
                  timeLimitMinutes: originalQuiz.timeLimitMinutes,
                })
                .returning();

              const questions = await db
                .select()
                .from(quizQuestion)
                .where(eq(quizQuestion.quizId, originalQuiz.id));

              if (questions.length > 0) {
                await db.insert(quizQuestion).values(
                  questions.map((q) => ({
                    quizId: newQuiz.id,
                    questionText: q.questionText,
                    questionType: q.questionType,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    sortOrder: q.sortOrder,
                    points: q.points,
                  })),
                );
              }
            }
          }
        }
      }

      return newCourse;
    }),

  // Update sort order for multiple courses
  updateSortOrder: creatorProcedure
    .input(
      z.object({
        items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.items.map((item) =>
          db
            .update(course)
            .set({ sortOrder: item.sortOrder })
            .where(and(eq(course.id, item.id), eq(course.creatorId, ctx.creator.id))),
        ),
      );
      return { success: true };
    }),
});
