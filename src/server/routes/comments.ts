import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
} from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { comment, user } from "@/lib/db/schema";

export const commentsRouter = createTRPCRouter({
  listByVideo: publicProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const rows = await db
        .select({
          comment: comment,
          userName: user.name,
          userImage: user.image,
        })
        .from(comment)
        .leftJoin(user, eq(comment.userId, user.id))
        .where(
          and(
            eq(comment.videoId, input.videoId),
            eq(comment.status, "visible")
          )
        )
        .orderBy(desc(comment.createdAt));

      // Group into top-level comments and replies
      const topLevel = rows.filter((r) => !r.comment.parentId);
      const replies = rows.filter((r) => r.comment.parentId);

      return topLevel.map((row) => ({
        ...row.comment,
        user: { name: row.userName, image: row.userImage },
        replies: replies
          .filter((r) => r.comment.parentId === row.comment.id)
          .map((r) => ({
            ...r.comment,
            user: { name: r.userName, image: r.userImage },
          })),
      }));
    }),

  create: protectedProcedure
    .input(
      z.object({
        videoId: z.string(),
        body: z.string().min(1).max(2000),
        parentId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [newComment] = await db
        .insert(comment)
        .values({
          videoId: input.videoId,
          userId: ctx.session.user.id,
          body: input.body,
          parentId: input.parentId,
        })
        .returning();

      return newComment;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(comment)
        .where(eq(comment.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Comment not found" });
      }

      const isOwner = existing.userId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "admin";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own comments",
        });
      }

      await db.delete(comment).where(eq(comment.id, input.id));

      return { success: true };
    }),

  flag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(comment)
        .set({ status: "flagged", updatedAt: new Date() })
        .where(eq(comment.id, input.id))
        .returning();

      return updated;
    }),

  listFlagged: adminProcedure.query(async () => {
    const rows = await db
      .select({
        comment: comment,
        userName: user.name,
        userImage: user.image,
      })
      .from(comment)
      .leftJoin(user, eq(comment.userId, user.id))
      .where(eq(comment.status, "flagged"))
      .orderBy(desc(comment.createdAt));

    return rows.map((row) => ({
      ...row.comment,
      user: { name: row.userName, image: row.userImage },
    }));
  }),

  moderate: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["visible", "hidden"]),
      })
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(comment)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(comment.id, input.id))
        .returning();

      return updated;
    }),
});
