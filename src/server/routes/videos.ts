import { z } from "zod";
import { eq, desc, and, ilike, asc } from "drizzle-orm";
import { createTRPCRouter, publicProcedure, adminProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { video, seriesVideo, series } from "@/lib/db/schema";
import { mux } from "@/lib/mux";

export const videosRouter = createTRPCRouter({
  list: publicProcedure
    .input(
      z
        .object({
          published: z.boolean().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const conditions = [];

      if (input?.published !== undefined) {
        conditions.push(eq(video.published, input.published));
      }
      if (input?.search) {
        conditions.push(ilike(video.title, `%${input.search}%`));
      }

      const rows = await db
        .select({
          video: video,
          seriesId: seriesVideo.seriesId,
          seriesTitle: series.title,
          seriesSlug: series.slug,
        })
        .from(video)
        .leftJoin(seriesVideo, eq(video.id, seriesVideo.videoId))
        .leftJoin(series, eq(seriesVideo.seriesId, series.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(video.sortOrder), desc(video.createdAt));

      return rows.map((row) => ({
        ...row.video,
        series: row.seriesId
          ? { id: row.seriesId, title: row.seriesTitle, slug: row.seriesSlug }
          : null,
      }));
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          video: video,
          seriesId: seriesVideo.seriesId,
          seriesTitle: series.title,
          seriesSlug: series.slug,
        })
        .from(video)
        .leftJoin(seriesVideo, eq(video.id, seriesVideo.videoId))
        .leftJoin(series, eq(seriesVideo.seriesId, series.id))
        .where(eq(video.slug, input.slug))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        ...row.video,
        series: row.seriesId
          ? { id: row.seriesId, title: row.seriesTitle, slug: row.seriesSlug }
          : null,
      };
    }),

  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          video: video,
          seriesId: seriesVideo.seriesId,
          seriesTitle: series.title,
          seriesSlug: series.slug,
        })
        .from(video)
        .leftJoin(seriesVideo, eq(video.id, seriesVideo.videoId))
        .leftJoin(series, eq(seriesVideo.seriesId, series.id))
        .where(eq(video.id, input.id))
        .limit(1);

      if (rows.length === 0) return null;

      const row = rows[0];
      return {
        ...row.video,
        series: row.seriesId
          ? { id: row.seriesId, title: row.seriesTitle, slug: row.seriesSlug }
          : null,
      };
    }),

  create: adminProcedure
    .input(
      z.object({
        title: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        isFree: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const [newVideo] = await db
        .insert(video)
        .values({
          title: input.title,
          slug: input.slug,
          description: input.description,
          isFree: input.isFree,
        })
        .returning();

      return newVideo;
    }),

  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).optional(),
        slug: z.string().min(1).optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        pdfUrl: z.string().optional(),
        pdfName: z.string().optional(),
        isFree: z.boolean().optional(),
        published: z.boolean().optional(),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      const [updated] = await db
        .update(video)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(video.id, id))
        .returning();

      return updated;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select()
        .from(video)
        .where(eq(video.id, input.id))
        .limit(1);

      if (existing?.muxAssetId) {
        try {
          await mux.video.assets.delete(existing.muxAssetId);
        } catch {
          // Asset may already be deleted in Mux
        }
      }

      await db.delete(video).where(eq(video.id, input.id));

      return { success: true };
    }),

  createMuxUpload: adminProcedure
    .input(z.object({ videoId: z.string() }))
    .mutation(async ({ input }) => {
      const upload = await mux.video.uploads.create({
        cors_origin: "*",
        new_asset_settings: {
          playback_policy: ["public"],
        },
      });

      await db
        .update(video)
        .set({
          muxUploadId: upload.id,
          status: "uploading",
          updatedAt: new Date(),
        })
        .where(eq(video.id, input.videoId));

      return { uploadUrl: upload.url, uploadId: upload.id };
    }),
});
