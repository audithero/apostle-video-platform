import { z } from "zod";
import { eq, and, desc, asc, sql, gt, inArray } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import {
  communityPost,
  communityComment,
  communityReaction,
  communityChannel,
  keywordFilter,
  blockedMember,
  moderationLog,
} from "@/lib/db/schema/community";
import { user } from "@/lib/db/schema/auth";

export const communityPostsRouter = createTRPCRouter({
  // List posts in a channel (paginated)
  list: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        limit: z.number().min(1).max(50).default(20),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const conditions = [eq(communityPost.channelId, input.channelId)];

      if (input.cursor) {
        const [cursorPost] = await db
          .select({ createdAt: communityPost.createdAt })
          .from(communityPost)
          .where(eq(communityPost.id, input.cursor))
          .limit(1);

        if (cursorPost) {
          conditions.push(
            sql`${communityPost.createdAt} < ${cursorPost.createdAt}`,
          );
        }
      }

      const posts = await db
        .select({
          post: communityPost,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(communityPost)
        .innerJoin(user, eq(communityPost.authorId, user.id))
        .where(and(...conditions))
        .orderBy(desc(communityPost.pinned), desc(communityPost.createdAt))
        .limit(input.limit + 1);

      const hasMore = posts.length > input.limit;
      if (hasMore) posts.pop();

      return {
        posts,
        nextCursor: hasMore ? posts.at(-1)?.post.id : undefined,
      };
    }),

  // Create post
  create: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        title: z.string().optional(),
        contentHtml: z.string().optional(),
        contentJson: z.unknown().optional(),
        mediaUrls: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newPost] = await db
        .insert(communityPost)
        .values({
          channelId: input.channelId,
          authorId: ctx.session.user.id,
          title: input.title,
          contentHtml: input.contentHtml,
          contentJson: input.contentJson,
          mediaUrls: input.mediaUrls,
        })
        .returning();

      return newPost;
    }),

  // Update post
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        contentHtml: z.string().optional(),
        contentJson: z.unknown().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(communityPost)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(communityPost.id, id), eq(communityPost.authorId, ctx.session.user.id)))
        .returning();
      return updated;
    }),

  // Delete post (author or creator)
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Allow author or admin to delete
      await db
        .delete(communityPost)
        .where(and(eq(communityPost.id, input.id), eq(communityPost.authorId, ctx.session.user.id)));
      return { success: true };
    }),

  // Pin/unpin post (creator only - must own the channel)
  togglePin: creatorProcedure
    .input(z.object({ id: z.string(), pinned: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Verify post belongs to a channel owned by this creator
      const [post] = await db
        .select({ channelId: communityPost.channelId })
        .from(communityPost)
        .where(eq(communityPost.id, input.id))
        .limit(1);
      if (!post) return null;

      const [channel] = await db
        .select({ id: communityChannel.id })
        .from(communityChannel)
        .where(and(eq(communityChannel.id, post.channelId), eq(communityChannel.creatorId, ctx.creator.id)))
        .limit(1);
      if (!channel) return null;

      const [updated] = await db
        .update(communityPost)
        .set({ pinned: input.pinned })
        .where(eq(communityPost.id, input.id))
        .returning();
      return updated;
    }),

  // Flag post
  flagPost: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(communityPost)
        .set({ status: "flagged" })
        .where(eq(communityPost.id, input.id))
        .returning();
      return updated;
    }),

  // Add comment
  addComment: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        content: z.string().min(1),
        parentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newComment] = await db
        .insert(communityComment)
        .values({
          postId: input.postId,
          authorId: ctx.session.user.id,
          content: input.content,
          parentId: input.parentId,
        })
        .returning();

      // Increment comment count
      await db
        .update(communityPost)
        .set({
          commentsCount: sql`${communityPost.commentsCount} + 1`,
        })
        .where(eq(communityPost.id, input.postId));

      return newComment;
    }),

  // Get comments for a post (threaded)
  getComments: protectedProcedure
    .input(z.object({ postId: z.string() }))
    .query(async ({ input }) => {
      const comments = await db
        .select({
          comment: communityComment,
          authorName: user.name,
          authorImage: user.image,
        })
        .from(communityComment)
        .innerJoin(user, eq(communityComment.authorId, user.id))
        .where(eq(communityComment.postId, input.postId))
        .orderBy(asc(communityComment.createdAt));

      // Build tree (2 levels max)
      const topLevel = comments.filter((c) => !c.comment.parentId);
      return topLevel.map((parent) => ({
        ...parent,
        replies: comments.filter((c) => c.comment.parentId === parent.comment.id),
      }));
    }),

  // Toggle reaction
  toggleReaction: protectedProcedure
    .input(
      z.object({
        postId: z.string(),
        reactionType: z.enum(["like", "love", "fire", "clap"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if reaction exists
      const [existing] = await db
        .select()
        .from(communityReaction)
        .where(
          and(
            eq(communityReaction.postId, input.postId),
            eq(communityReaction.userId, ctx.session.user.id),
            eq(communityReaction.reactionType, input.reactionType),
          ),
        )
        .limit(1);

      if (existing) {
        // Remove reaction
        await db.delete(communityReaction).where(eq(communityReaction.id, existing.id));
        await db
          .update(communityPost)
          .set({ likesCount: sql`GREATEST(${communityPost.likesCount} - 1, 0)` })
          .where(eq(communityPost.id, input.postId));
        return { added: false };
      }

      // Add reaction
      await db.insert(communityReaction).values({
        postId: input.postId,
        userId: ctx.session.user.id,
        reactionType: input.reactionType,
      });
      await db
        .update(communityPost)
        .set({ likesCount: sql`${communityPost.likesCount} + 1` })
        .where(eq(communityPost.id, input.postId));

      return { added: true };
    }),

  // Check for new posts since timestamp (polling)
  checkNew: protectedProcedure
    .input(
      z.object({
        channelId: z.string(),
        since: z.date(),
      }),
    )
    .query(async ({ input }) => {
      const [result] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(communityPost)
        .where(
          and(
            eq(communityPost.channelId, input.channelId),
            gt(communityPost.createdAt, input.since),
          ),
        );

      return { newPosts: result?.count ?? 0 };
    }),

  // Moderation: list flagged posts (only in creator's channels)
  listFlagged: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select({
        post: communityPost,
        authorName: user.name,
        authorEmail: user.email,
      })
      .from(communityPost)
      .innerJoin(user, eq(communityPost.authorId, user.id))
      .innerJoin(communityChannel, eq(communityPost.channelId, communityChannel.id))
      .where(and(eq(communityPost.status, "flagged"), eq(communityChannel.creatorId, ctx.creator.id)))
      .orderBy(desc(communityPost.createdAt));
  }),

  // Moderation: set post status (with logging - only for creator's channels)
  moderate: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["visible", "flagged", "hidden"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify post belongs to creator's channel
      const [post] = await db
        .select({ channelId: communityPost.channelId })
        .from(communityPost)
        .where(eq(communityPost.id, input.id))
        .limit(1);
      if (!post) return null;

      const [channel] = await db
        .select({ id: communityChannel.id })
        .from(communityChannel)
        .where(and(eq(communityChannel.id, post.channelId), eq(communityChannel.creatorId, ctx.creator.id)))
        .limit(1);
      if (!channel) return null;

      const [updated] = await db
        .update(communityPost)
        .set({ status: input.status })
        .where(eq(communityPost.id, input.id))
        .returning();

      const actionMap = { visible: "dismiss_flag", flagged: "flag_post", hidden: "hide_post" } as const;
      await db.insert(moderationLog).values({
        creatorId: ctx.creator.id,
        moderatorId: ctx.session.user.id,
        action: actionMap[input.status],
        targetType: "post",
        targetId: input.id,
      });

      return updated;
    }),

  // Moderation: bulk moderate posts (only for creator's channels)
  bulkModerate: creatorProcedure
    .input(
      z.object({
        postIds: z.array(z.string()).min(1).max(100),
        status: z.enum(["visible", "hidden"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const actionLabel = input.status === "hidden" ? "hide_post" : "dismiss_flag";

      // Verify all posts belong to creator's channels
      const posts = await db
        .select({ id: communityPost.id, channelId: communityPost.channelId })
        .from(communityPost)
        .innerJoin(communityChannel, eq(communityPost.channelId, communityChannel.id))
        .where(and(
          inArray(communityPost.id, input.postIds),
          eq(communityChannel.creatorId, ctx.creator.id),
        ));

      const ownedPostIds = new Set(posts.map((p) => p.id));

      await Promise.all(
        input.postIds
          .filter((postId) => ownedPostIds.has(postId))
          .map(async (postId) => {
            await db
              .update(communityPost)
              .set({ status: input.status })
              .where(eq(communityPost.id, postId));

            await db.insert(moderationLog).values({
              creatorId: ctx.creator.id,
              moderatorId: ctx.session.user.id,
              action: actionLabel,
              targetType: "post",
              targetId: postId,
              details: "Bulk action",
            });
          }),
      );

      return { success: true, count: ownedPostIds.size };
    }),

  // ---- Keyword Filters ----

  listKeywordFilters: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(keywordFilter)
      .where(eq(keywordFilter.creatorId, ctx.creator.id))
      .orderBy(asc(keywordFilter.createdAt));
  }),

  addKeywordFilter: creatorProcedure
    .input(
      z.object({
        keyword: z.string().min(1).max(200),
        action: z.enum(["flag", "hide", "block"]).default("flag"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await db
        .insert(keywordFilter)
        .values({
          creatorId: ctx.creator.id,
          keyword: input.keyword.toLowerCase().trim(),
          action: input.action,
        })
        .returning();
      return created;
    }),

  removeKeywordFilter: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(keywordFilter)
        .where(and(eq(keywordFilter.id, input.id), eq(keywordFilter.creatorId, ctx.creator.id)));
      return { success: true };
    }),

  // ---- Blocked Members ----

  listBlockedMembers: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select({
        blocked: blockedMember,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
      })
      .from(blockedMember)
      .innerJoin(user, eq(blockedMember.userId, user.id))
      .where(eq(blockedMember.creatorId, ctx.creator.id))
      .orderBy(desc(blockedMember.blockedAt));
  }),

  blockMember: creatorProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await db
        .insert(blockedMember)
        .values({
          creatorId: ctx.creator.id,
          userId: input.userId,
          reason: input.reason,
        })
        .onConflictDoNothing()
        .returning();

      // Log the action
      await db.insert(moderationLog).values({
        creatorId: ctx.creator.id,
        moderatorId: ctx.session.user.id,
        action: "block_user",
        targetType: "user",
        targetId: input.userId,
        details: input.reason,
      });

      return created ?? { id: "already_blocked" };
    }),

  unblockMember: creatorProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(blockedMember)
        .where(and(eq(blockedMember.creatorId, ctx.creator.id), eq(blockedMember.userId, input.userId)));

      await db.insert(moderationLog).values({
        creatorId: ctx.creator.id,
        moderatorId: ctx.session.user.id,
        action: "unblock_user",
        targetType: "user",
        targetId: input.userId,
      });

      return { success: true };
    }),

  // ---- Moderation Log ----

  getModerationLog: creatorProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(moderationLog.creatorId, ctx.creator.id)];

      if (input.cursor) {
        const [cursorEntry] = await db
          .select({ createdAt: moderationLog.createdAt })
          .from(moderationLog)
          .where(eq(moderationLog.id, input.cursor))
          .limit(1);

        if (cursorEntry) {
          conditions.push(
            sql`${moderationLog.createdAt} < ${cursorEntry.createdAt}`,
          );
        }
      }

      const entries = await db
        .select({
          log: moderationLog,
          moderatorName: user.name,
        })
        .from(moderationLog)
        .innerJoin(user, eq(moderationLog.moderatorId, user.id))
        .where(and(...conditions))
        .orderBy(desc(moderationLog.createdAt))
        .limit(input.limit + 1);

      const hasMore = entries.length > input.limit;
      if (hasMore) entries.pop();

      return {
        entries,
        nextCursor: hasMore ? entries.at(-1)?.log.id : undefined,
      };
    }),
});
