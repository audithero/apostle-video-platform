import { z } from "zod";
import { eq, and, asc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { communityChannel } from "@/lib/db/schema/community";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const communityChannelsRouter = createTRPCRouter({
  // List channels for a creator (public - students see this)
  list: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      return db
        .select()
        .from(communityChannel)
        .where(eq(communityChannel.creatorId, input.creatorId))
        .orderBy(asc(communityChannel.sortOrder));
    }),

  // List my channels (creator only - for creator dashboard)
  myChannels: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(communityChannel)
      .where(eq(communityChannel.creatorId, ctx.creator.id))
      .orderBy(asc(communityChannel.sortOrder));
  }),

  // Create channel (creator only)
  create: creatorProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        channelType: z.enum(["feed", "chat"]).default("feed"),
        accessLevel: z.enum(["public", "members", "specific_course"]).default("members"),
        accessCourseId: z.string().optional(),
        iconEmoji: z.string().default("💬"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = slugify(input.name);

      const existing = await db
        .select({ id: communityChannel.id })
        .from(communityChannel)
        .where(and(eq(communityChannel.creatorId, ctx.creator.id), eq(communityChannel.slug, slug)))
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      // Get max sort order
      const channels = await db
        .select({ sortOrder: communityChannel.sortOrder })
        .from(communityChannel)
        .where(eq(communityChannel.creatorId, ctx.creator.id));

      const maxSort = channels.length > 0 ? Math.max(...channels.map((c) => c.sortOrder)) : -1;

      const [newChannel] = await db
        .insert(communityChannel)
        .values({
          creatorId: ctx.creator.id,
          name: input.name,
          slug,
          description: input.description,
          channelType: input.channelType,
          accessLevel: input.accessLevel,
          accessCourseId: input.accessCourseId,
          iconEmoji: input.iconEmoji,
          sortOrder: maxSort + 1,
        })
        .returning();

      return newChannel;
    }),

  // Update channel
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        channelType: z.enum(["feed", "chat"]).optional(),
        accessLevel: z.enum(["public", "members", "specific_course"]).optional(),
        accessCourseId: z.string().optional().nullable(),
        iconEmoji: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(communityChannel)
        .set(updates)
        .where(and(eq(communityChannel.id, id), eq(communityChannel.creatorId, ctx.creator.id)))
        .returning();
      return updated;
    }),

  // Delete channel
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(communityChannel)
        .where(and(eq(communityChannel.id, input.id), eq(communityChannel.creatorId, ctx.creator.id)));
      return { success: true };
    }),

  // Reorder channels
  reorder: creatorProcedure
    .input(
      z.object({
        items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.items.map((item) =>
          db
            .update(communityChannel)
            .set({ sortOrder: item.sortOrder })
            .where(and(eq(communityChannel.id, item.id), eq(communityChannel.creatorId, ctx.creator.id))),
        ),
      );
      return { success: true };
    }),
});
