import { db } from "@/lib/db";
import { gamificationPoints, pointEvent } from "@/lib/db/schema/community";
import { eq, and, desc, gte, sql } from "drizzle-orm";

// Default point values (creator can customize)
const DEFAULT_POINT_VALUES = {
  post: 5,
  comment: 3,
  reaction_received: 1,
  lesson_completed: 10,
  course_completed: 100,
} as const;

// Level thresholds
const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500] as const;

function calculateLevel(totalPoints: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalPoints >= threshold) {
      level = LEVEL_THRESHOLDS.indexOf(threshold) + 1;
    }
  }
  return Math.min(level, 10);
}

export const gamificationService = {
  async awardPoints(
    userId: string,
    creatorId: string,
    reason: keyof typeof DEFAULT_POINT_VALUES,
    referenceId?: string,
  ): Promise<{ points: number; totalPoints: number; level: number }> {
    return db.transaction(async (tx) => {
      const pointsAwarded = DEFAULT_POINT_VALUES[reason];

      // Record the point event
      await tx.insert(pointEvent).values({
        userId,
        creatorId,
        points: pointsAwarded,
        reason,
        referenceId,
      });

      // Update or create gamification record atomically
      const [existing] = await tx
        .select()
        .from(gamificationPoints)
        .where(
          and(
            eq(gamificationPoints.userId, userId),
            eq(gamificationPoints.creatorId, creatorId),
          ),
        )
        .limit(1);

      let totalPoints: number;
      let level: number;

      if (existing) {
        totalPoints = existing.totalPoints + pointsAwarded;
        level = calculateLevel(totalPoints);

        await tx
          .update(gamificationPoints)
          .set({
            totalPoints,
            level,
            updatedAt: new Date(),
          })
          .where(eq(gamificationPoints.id, existing.id));
      } else {
        totalPoints = pointsAwarded;
        level = calculateLevel(totalPoints);

        await tx.insert(gamificationPoints).values({
          userId,
          creatorId,
          totalPoints,
          level,
        });
      }

      return { points: pointsAwarded, totalPoints, level };
    });
  },

  async getLeaderboard(
    creatorId: string,
    timeframe: "7d" | "30d" | "all" = "all",
    limit = 20,
  ) {
    if (timeframe === "all") {
      return db
        .select({
          userId: gamificationPoints.userId,
          totalPoints: gamificationPoints.totalPoints,
          level: gamificationPoints.level,
        })
        .from(gamificationPoints)
        .where(eq(gamificationPoints.creatorId, creatorId))
        .orderBy(desc(gamificationPoints.totalPoints))
        .limit(limit);
    }

    // Time-based leaderboard from events
    const days = timeframe === "7d" ? 7 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db
      .select({
        userId: pointEvent.userId,
        totalPoints: sql<number>`SUM(${pointEvent.points})`,
        level: sql<number>`1`, // placeholder - calculated client side
      })
      .from(pointEvent)
      .where(
        and(
          eq(pointEvent.creatorId, creatorId),
          gte(pointEvent.createdAt, startDate),
        ),
      )
      .groupBy(pointEvent.userId)
      .orderBy(desc(sql`SUM(${pointEvent.points})`))
      .limit(limit);
  },

  async getUserStats(userId: string, creatorId: string) {
    const [stats] = await db
      .select()
      .from(gamificationPoints)
      .where(
        and(
          eq(gamificationPoints.userId, userId),
          eq(gamificationPoints.creatorId, creatorId),
        ),
      )
      .limit(1);

    return stats ?? { totalPoints: 0, level: 1 };
  },
};
