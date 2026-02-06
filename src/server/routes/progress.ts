import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { userProgress, video } from "@/lib/db/schema";

export const progressRouter = createTRPCRouter({
  save: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        progressSeconds: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Check if progress record exists
      const [existing] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.videoId, input.videoId)
          )
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(userProgress)
          .set({
            progressSeconds: input.progressSeconds,
            lastWatchedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userProgress.id, existing.id))
          .returning();

        return updated;
      }

      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          videoId: input.videoId,
          progressSeconds: input.progressSeconds,
          lastWatchedAt: new Date(),
        })
        .returning();

      return created;
    }),

  markComplete: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [existing] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.videoId, input.videoId)
          )
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(userProgress)
          .set({
            completed: true,
            lastWatchedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userProgress.id, existing.id))
          .returning();

        return updated;
      }

      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          videoId: input.videoId,
          completed: true,
          lastWatchedAt: new Date(),
        })
        .returning();

      return created;
    }),

  toggleFavorite: protectedProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const [existing] = await db
        .select()
        .from(userProgress)
        .where(
          and(
            eq(userProgress.userId, userId),
            eq(userProgress.videoId, input.videoId)
          )
        )
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(userProgress)
          .set({
            favorite: !existing.favorite,
            updatedAt: new Date(),
          })
          .where(eq(userProgress.id, existing.id))
          .returning();

        return updated;
      }

      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          videoId: input.videoId,
          favorite: true,
        })
        .returning();

      return created;
    }),

  getContinueWatching: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const rows = await db
      .select({
        progress: userProgress,
        video: video,
      })
      .from(userProgress)
      .innerJoin(video, eq(userProgress.videoId, video.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.completed, false),
          eq(video.published, true)
        )
      )
      .orderBy(desc(userProgress.lastWatchedAt))
      .limit(10);

    return rows.map((row) => ({
      ...row.video,
      progressSeconds: row.progress.progressSeconds,
      lastWatchedAt: row.progress.lastWatchedAt,
    }));
  }),

  getFavorites: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const rows = await db
      .select({
        progress: userProgress,
        video: video,
      })
      .from(userProgress)
      .innerJoin(video, eq(userProgress.videoId, video.id))
      .where(
        and(
          eq(userProgress.userId, userId),
          eq(userProgress.favorite, true),
          eq(video.published, true)
        )
      )
      .orderBy(desc(userProgress.updatedAt));

    return rows.map((row) => ({
      ...row.video,
      progressSeconds: row.progress.progressSeconds,
      completed: row.progress.completed,
    }));
  }),
});
