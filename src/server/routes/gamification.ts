import { z } from "zod";
import { eq, and, inArray, desc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { gamificationPoints, pointEvent } from "@/lib/db/schema/community";
import { user } from "@/lib/db/schema/auth";
import { gamificationService } from "@/lib/community/gamification";

export const gamificationRouter = createTRPCRouter({
  // Get leaderboard for a creator's community
  getLeaderboard: protectedProcedure
    .input(
      z.object({
        creatorId: z.string(),
        timeframe: z.enum(["7d", "30d", "all"]).default("all"),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const leaderboard = await gamificationService.getLeaderboard(
        input.creatorId,
        input.timeframe,
        input.limit,
      );

      if (leaderboard.length === 0) return [];

      // Enrich with user details
      const userIds = leaderboard.map((entry) => entry.userId);
      const users = await db
        .select({ id: user.id, name: user.name, image: user.image })
        .from(user)
        .where(inArray(user.id, userIds));

      const userMap = new Map(users.map((u) => [u.id, u]));

      return leaderboard.map((entry, idx) => {
        const userData = userMap.get(entry.userId);
        return {
          rank: idx + 1,
          userId: entry.userId,
          name: userData?.name ?? "Unknown",
          image: userData?.image ?? null,
          totalPoints: entry.totalPoints,
          level: entry.level,
        };
      });
    }),

  // Get current user's gamification stats
  getMyStats: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ ctx, input }) => {
      return gamificationService.getUserStats(ctx.session.user.id, input.creatorId);
    }),

  // Get point history for current user
  getMyHistory: protectedProcedure
    .input(
      z.object({
        creatorId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      const events = await db
        .select()
        .from(pointEvent)
        .where(
          and(
            eq(pointEvent.userId, ctx.session.user.id),
            eq(pointEvent.creatorId, input.creatorId),
          ),
        )
        .orderBy(desc(pointEvent.createdAt))
        .limit(input.limit);

      return events;
    }),

  // Creator: get gamification overview
  getOverview: creatorProcedure.query(async ({ ctx }) => {
    const allPoints = await db
      .select()
      .from(gamificationPoints)
      .where(eq(gamificationPoints.creatorId, ctx.creator.id));

    const totalMembers = allPoints.length;
    const totalPointsAwarded = allPoints.reduce((sum, p) => sum + p.totalPoints, 0);
    const avgPoints = totalMembers > 0 ? Math.round(totalPointsAwarded / totalMembers) : 0;
    const levelDistribution = Array.from({ length: 10 }, (_, i) => ({
      level: i + 1,
      count: allPoints.filter((p) => p.level === i + 1).length,
    }));

    return {
      totalMembers,
      totalPointsAwarded,
      avgPoints,
      levelDistribution,
    };
  }),
});
