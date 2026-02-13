import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, publicProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { landingPage } from "@/lib/db/schema/marketing";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const landingPagesRouter = createTRPCRouter({
  list: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(landingPage)
      .where(eq(landingPage.creatorId, ctx.creator.id))
      .orderBy(desc(landingPage.updatedAt));
  }),

  getById: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [result] = await db
        .select()
        .from(landingPage)
        .where(and(eq(landingPage.id, input.id), eq(landingPage.creatorId, ctx.creator.id)))
        .limit(1);
      return result ?? null;
    }),

  // Public: get published page by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string(), creatorId: z.string() }))
    .query(async ({ input }) => {
      const [result] = await db
        .select()
        .from(landingPage)
        .where(
          and(
            eq(landingPage.slug, input.slug),
            eq(landingPage.creatorId, input.creatorId),
            eq(landingPage.status, "published"),
          ),
        )
        .limit(1);
      return result ?? null;
    }),

  create: creatorProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        templateJson: z.array(z.record(z.string(), z.unknown())).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = slugify(input.title);

      const existing = await db
        .select({ id: landingPage.id })
        .from(landingPage)
        .where(and(eq(landingPage.creatorId, ctx.creator.id), eq(landingPage.slug, slug)))
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const [page] = await db
        .insert(landingPage)
        .values({
          creatorId: ctx.creator.id,
          title: input.title,
          slug,
          pageJson: input.templateJson ?? [],
        })
        .returning();

      return page;
    }),

  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        pageJson: z.array(z.record(z.string(), z.unknown())).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        ogImageUrl: z.string().optional(),
        canonicalUrl: z.string().url().or(z.literal("")).optional(),
        noindex: z.boolean().optional(),
        jsonLd: z.record(z.string(), z.unknown()).optional(),
        status: z.enum(["draft", "published"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(landingPage)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(landingPage.id, id), eq(landingPage.creatorId, ctx.creator.id)))
        .returning();
      return updated;
    }),

  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(landingPage)
        .where(and(eq(landingPage.id, input.id), eq(landingPage.creatorId, ctx.creator.id)));
      return { success: true };
    }),
});
