import { db } from "@/lib/db";
import { usageEvent, monthlyUsage } from "@/lib/db/schema/billing";
import { eq, and, gte, lte, sql } from "drizzle-orm";

type UsageEventType = "video_upload" | "student_added" | "email_sent" | "ai_generation" | "avatar_minute";

interface TrackOptions {
  creatorId: string;
  eventType: UsageEventType;
  quantity?: number;
  metadata?: Record<string, unknown>;
}

export const usageTracker = {
  async track({ creatorId, eventType, quantity = 1, metadata }: TrackOptions) {
    await db.insert(usageEvent).values({
      creatorId,
      eventType,
      quantity,
      metadata: metadata ?? null,
    });
  },

  async trackVideoUpload(creatorId: string, durationSeconds: number) {
    await this.track({
      creatorId,
      eventType: "video_upload",
      quantity: durationSeconds,
      metadata: { durationSeconds },
    });
  },

  async trackStudentAdded(creatorId: string) {
    await this.track({
      creatorId,
      eventType: "student_added",
      quantity: 1,
    });
  },

  async trackEmailSent(creatorId: string, count: number) {
    await this.track({
      creatorId,
      eventType: "email_sent",
      quantity: count,
      metadata: { count },
    });
  },

  async trackAiGeneration(creatorId: string, type: string, metadata?: Record<string, unknown>) {
    await this.track({
      creatorId,
      eventType: "ai_generation",
      quantity: 1,
      metadata: { type, ...metadata },
    });
  },

  async trackAvatarMinute(creatorId: string, minutes: number) {
    await this.track({
      creatorId,
      eventType: "avatar_minute",
      quantity: Math.ceil(minutes),
      metadata: { minutes },
    });
  },

  async getCurrentPeriodUsage(creatorId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [existing] = await db
      .select()
      .from(monthlyUsage)
      .where(
        and(
          eq(monthlyUsage.creatorId, creatorId),
          gte(monthlyUsage.periodStart, periodStart),
          lte(monthlyUsage.periodEnd, periodEnd),
        ),
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    // Aggregate from events for current period
    const events = await db
      .select({
        eventType: usageEvent.eventType,
        totalQuantity: sql<number>`COALESCE(SUM(${usageEvent.quantity}), 0)`,
      })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.creatorId, creatorId),
          gte(usageEvent.recordedAt, periodStart),
          lte(usageEvent.recordedAt, periodEnd),
        ),
      )
      .groupBy(usageEvent.eventType);

    const usage: Record<string, number> = {};
    for (const event of events) {
      usage[event.eventType] = Number(event.totalQuantity);
    }

    return {
      videoStorageSeconds: usage.video_upload ?? 0,
      activeStudents: usage.student_added ?? 0,
      emailsSent: usage.email_sent ?? 0,
      aiCourseGenerations: 0,
      aiLessonRewrites: 0,
      aiImageGenerations: 0,
      aiQuizGenerations: 0,
      avatarMinutesUsed: usage.avatar_minute ?? 0,
    };
  },

  async getAiUsageForPeriod(creatorId: string) {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const events = await db
      .select({
        aiType: sql<string>`${usageEvent.metadata}->>'type'`,
        count: sql<number>`COUNT(*)`,
      })
      .from(usageEvent)
      .where(
        and(
          eq(usageEvent.creatorId, creatorId),
          eq(usageEvent.eventType, "ai_generation"),
          gte(usageEvent.recordedAt, periodStart),
          lte(usageEvent.recordedAt, periodEnd),
        ),
      )
      .groupBy(sql`${usageEvent.metadata}->>'type'`);

    const aiUsage: Record<string, number> = {};
    for (const event of events) {
      if (event.aiType) {
        aiUsage[event.aiType] = Number(event.count);
      }
    }

    return {
      aiCourseGenerations: aiUsage.course ?? 0,
      aiLessonRewrites: aiUsage.rewrite ?? 0,
      aiImageGenerations: aiUsage.image ?? 0,
      aiQuizGenerations: aiUsage.quiz ?? 0,
    };
  },
};
