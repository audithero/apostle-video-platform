import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { course, courseModule, lesson } from "@/lib/db/schema/course";

export const modulesRouter = createTRPCRouter({
  // List modules for a course
  list: creatorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify course ownership
      const [courseRecord] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, input.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);

      if (!courseRecord) return [];

      const modules = await db
        .select()
        .from(courseModule)
        .where(eq(courseModule.courseId, input.courseId))
        .orderBy(asc(courseModule.sortOrder));

      // Get lessons for each module
      const result = await Promise.all(
        modules.map(async (mod) => {
          const lessons = await db
            .select()
            .from(lesson)
            .where(eq(lesson.moduleId, mod.id))
            .orderBy(asc(lesson.sortOrder));
          return { ...mod, lessons };
        }),
      );

      return result;
    }),

  // Create module
  create: creatorProcedure
    .input(
      z.object({
        courseId: z.string(),
        title: z.string().min(1).max(200),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify course ownership
      const [courseRecord] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, input.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);

      if (!courseRecord) return null;

      // Get max sort order
      const existing = await db
        .select({ sortOrder: courseModule.sortOrder })
        .from(courseModule)
        .where(eq(courseModule.courseId, input.courseId))
        .orderBy(asc(courseModule.sortOrder));

      const maxSort = existing.length > 0 ? Math.max(...existing.map((m) => m.sortOrder)) : -1;

      const [newModule] = await db
        .insert(courseModule)
        .values({
          courseId: input.courseId,
          title: input.title,
          description: input.description,
          sortOrder: maxSort + 1,
        })
        .returning();

      return newModule;
    }),

  // Update module
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        dripDelayDays: z.number().min(0).optional(),
        dripDate: z.string().datetime().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, dripDate, ...rest } = input;

      // Verify ownership via module -> course
      const [mod] = await db
        .select({ courseId: courseModule.courseId })
        .from(courseModule)
        .where(eq(courseModule.id, id))
        .limit(1);
      if (!mod) return null;

      const [owned] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, mod.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);
      if (!owned) return null;

      const updates: Record<string, unknown> = { ...rest };
      if (dripDate !== undefined) {
        updates.dripDate = new Date(dripDate);
      }
      const [updated] = await db
        .update(courseModule)
        .set(updates)
        .where(eq(courseModule.id, id))
        .returning();
      return updated;
    }),

  // Delete module
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership via module -> course
      const [mod] = await db
        .select({ courseId: courseModule.courseId })
        .from(courseModule)
        .where(eq(courseModule.id, input.id))
        .limit(1);
      if (!mod) return { success: false };

      const [owned] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, mod.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);
      if (!owned) return { success: false };

      await db.delete(courseModule).where(eq(courseModule.id, input.id));
      return { success: true };
    }),

  // Reorder modules
  reorder: creatorProcedure
    .input(
      z.object({
        courseId: z.string(),
        items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify course ownership
      const [owned] = await db
        .select({ id: course.id })
        .from(course)
        .where(and(eq(course.id, input.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);
      if (!owned) return { success: false };

      await Promise.all(
        input.items.map((item) =>
          db
            .update(courseModule)
            .set({ sortOrder: item.sortOrder })
            .where(and(eq(courseModule.id, item.id), eq(courseModule.courseId, input.courseId))),
        ),
      );
      return { success: true };
    }),
});
