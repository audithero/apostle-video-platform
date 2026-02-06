import { z } from "zod";
import { eq, and, asc, desc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { series, seriesVideo, video } from "@/lib/db/schema";

export const seriesRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const condition =
        input?.published !== undefined
          ? eq(series.published, input.published)
          : undefined;

      const rows = await db
        .select()
        .from(series)
        .where(condition)
        .orderBy(asc(series.sortOrder), desc(series.createdAt));

      return rows;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const result = await db.query.series.findFirst({
        where: eq(series.slug, input.slug),
        with: {
          seriesVideos: {
            orderBy: [asc(seriesVideo.sortOrder)],
            with: {
              video: true,
            },
          },
        },
      });

      if (!result) return null;

      return {
        ...result,
        videos: result.seriesVideos.map((sv) => ({
          ...sv.video,
          sortOrder: sv.sortOrder,
        })),
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const [newSeries] = await db
        .insert(series)
        .values({
          title: input.title,
          slug: input.slug,
          description: input.description,
          thumbnailUrl: input.thumbnailUrl,
        })
        .returning();

      return newSeries;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        published: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const [updated] = await db
        .update(series)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(series.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(series).where(eq(series.id, input.id));
      return { success: true };
    }),

  addVideo: adminProcedure
    .input(
      z.object({
        seriesId: z.string(),
        videoId: z.string(),
        sortOrder: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const [entry] = await db
        .insert(seriesVideo)
        .values({
          seriesId: input.seriesId,
          videoId: input.videoId,
          sortOrder: input.sortOrder,
        })
        .returning();

      return entry;
    }),

  removeVideo: adminProcedure
    .input(
      z.object({
        seriesId: z.string(),
        videoId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await db
        .delete(seriesVideo)
        .where(
          and(
            eq(seriesVideo.seriesId, input.seriesId),
            eq(seriesVideo.videoId, input.videoId)
          )
        );

      return { success: true };
    }),

  reorderVideos: adminProcedure
    .input(
      z.object({
        seriesId: z.string(),
        videoIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      for (let i = 0; i < input.videoIds.length; i++) {
        await db
          .update(seriesVideo)
          .set({ sortOrder: i })
          .where(
            and(
              eq(seriesVideo.seriesId, input.seriesId),
              eq(seriesVideo.videoId, input.videoIds[i])
            )
          );
      }

      return { success: true };
    }),
});
