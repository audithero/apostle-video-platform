import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema/creator";
import { eq } from "drizzle-orm";
import { TIER_LIMITS, OVERAGE_RATES } from "./tier-limits";
import { usageTracker } from "./usage-tracker";
import { reportUsageToStripe, enableOverageOnSubscription, disableOverageOnSubscription } from "./stripe-metered";

type Tier = "launch" | "grow" | "scale" | "pro";

interface OverageResult {
  creatorId: string;
  tier: Tier;
  overageEnabled: boolean;
  metrics: Array<{
    metric: string;
    current: number;
    limit: number;
    overage: number;
    chargeCents: number;
  }>;
  totalChargeCents: number;
  reportedToStripe: boolean;
}

/**
 * Combined function that checks current usage against tier limits and
 * reports overages to Stripe if the creator has overage billing enabled.
 *
 * This is the main entry point for scheduled overage checks (e.g. hourly cron).
 */
export async function checkAndReportOverages(creatorId: string): Promise<OverageResult> {
  const [creatorRecord] = await db
    .select()
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  if (!creatorRecord) {
    return {
      creatorId,
      tier: "launch",
      overageEnabled: false,
      metrics: [],
      totalChargeCents: 0,
      reportedToStripe: false,
    };
  }

  const tier = creatorRecord.tier as Tier;
  const limits = TIER_LIMITS[tier];
  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);

  const metrics: OverageResult["metrics"] = [];

  // Video storage (seconds -> hours for comparison)
  const videoHours = usage.videoStorageSeconds / 3_600;
  const videoLimitHours = limits.videoStorageSeconds / 3_600;
  const videoOverage = Math.max(0, videoHours - videoLimitHours);
  if (videoOverage > 0) {
    metrics.push({
      metric: "video_storage_hours",
      current: Math.round(videoHours * 10) / 10,
      limit: videoLimitHours,
      overage: Math.round(videoOverage * 10) / 10,
      chargeCents: Math.ceil(videoOverage) * OVERAGE_RATES.videoStoragePerHour,
    });
  }

  // Students
  const studentOverage = Math.max(0, usage.activeStudents - limits.students);
  if (studentOverage > 0) {
    metrics.push({
      metric: "students",
      current: usage.activeStudents,
      limit: limits.students,
      overage: studentOverage,
      chargeCents: studentOverage * OVERAGE_RATES.studentOverage,
    });
  }

  // Emails
  const emailOverage = Math.max(0, usage.emailsSent - limits.emailsPerMonth);
  if (emailOverage > 0) {
    metrics.push({
      metric: "emails",
      current: usage.emailsSent,
      limit: limits.emailsPerMonth,
      overage: emailOverage,
      chargeCents: Math.ceil(emailOverage / 1_000) * OVERAGE_RATES.emailOveragePer1K,
    });
  }

  const totalChargeCents = metrics.reduce((sum, m) => sum + m.chargeCents, 0);

  // Report to Stripe if overages exist and billing is enabled
  let reportedToStripe = false;
  if (creatorRecord.overageEnabled && metrics.length > 0 && creatorRecord.stripeSubscriptionId) {
    const result = await reportUsageToStripe(creatorId);
    reportedToStripe = result.reported;
  }

  return {
    creatorId,
    tier,
    overageEnabled: creatorRecord.overageEnabled,
    metrics,
    totalChargeCents,
    reportedToStripe,
  };
}

// Re-export subscription management functions for convenience
export { enableOverageOnSubscription, disableOverageOnSubscription };
