import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema/creator";
import { eq } from "drizzle-orm";
import { TIER_LIMITS, OVERAGE_RATES } from "./tier-limits";
import { usageTracker } from "./usage-tracker";

type Tier = "launch" | "grow" | "scale" | "pro";

interface OverageCheck {
  metric: string;
  usedPercent: number;
  overageAmount: number;
  action: "allow" | "warn" | "soft_block" | "hard_block";
  message: string;
}

/**
 * Checks a specific metric for overage status and returns the appropriate action.
 */
export async function checkOverageStatus(
  creatorId: string,
  tier: Tier,
  metric: "videoStorageSeconds" | "students" | "emailsPerMonth" | "courses",
): Promise<OverageCheck> {
  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);
  const limits = TIER_LIMITS[tier];

  let currentValue = 0;
  let limit = 0;

  switch (metric) {
    case "videoStorageSeconds": {
      currentValue = usage.videoStorageSeconds;
      limit = limits.videoStorageSeconds;
      break;
    }
    case "students": {
      currentValue = usage.activeStudents;
      limit = limits.students;
      break;
    }
    case "emailsPerMonth": {
      currentValue = usage.emailsSent;
      limit = limits.emailsPerMonth;
      break;
    }
    case "courses": {
      limit = limits.courses;
      // Courses use a different counting mechanism (count from DB, not events)
      currentValue = 0;
      break;
    }
  }

  if (limit === -1) {
    // Unlimited
    return {
      metric,
      usedPercent: 0,
      overageAmount: 0,
      action: "allow",
      message: "Unlimited",
    };
  }

  const usedPercent = limit > 0 ? (currentValue / limit) * 100 : 0;

  // Under 80% - allow
  if (usedPercent < 80) {
    return {
      metric,
      usedPercent,
      overageAmount: 0,
      action: "allow",
      message: "Within limits",
    };
  }

  // 80-100% - warn
  if (usedPercent < 100) {
    return {
      metric,
      usedPercent,
      overageAmount: 0,
      action: "warn",
      message: `Approaching ${metric} limit (${Math.round(usedPercent)}% used)`,
    };
  }

  // Check if creator has overage billing enabled
  const [creatorRecord] = await db
    .select({ overageEnabled: creator.overageEnabled })
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  const overageEnabled = creatorRecord?.overageEnabled ?? false;
  const overageAmount = currentValue - limit;

  // 100-110% - soft block unless overage enabled
  if (usedPercent < 110) {
    if (overageEnabled) {
      return {
        metric,
        usedPercent,
        overageAmount,
        action: "allow",
        message: `Over limit, overage billing active (${Math.round(usedPercent)}% used)`,
      };
    }
    return {
      metric,
      usedPercent,
      overageAmount,
      action: "soft_block",
      message: `${metric} limit reached. Enable overage billing or upgrade to continue.`,
    };
  }

  // Over 110% - hard block unless overage enabled
  if (overageEnabled) {
    return {
      metric,
      usedPercent,
      overageAmount,
      action: "allow",
      message: `Significantly over limit, overage billing active (${Math.round(usedPercent)}% used)`,
    };
  }

  return {
    metric,
    usedPercent,
    overageAmount,
    action: "hard_block",
    message: `${metric} significantly over limit. Upgrade required.`,
  };
}

/**
 * Calculate overage charges for the current billing period.
 */
export async function calculateOverageCharges(
  creatorId: string,
  tier: Tier,
): Promise<{ metric: string; overage: number; rate: number; charge: number }[]> {
  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);
  const limits = TIER_LIMITS[tier];
  const rates = OVERAGE_RATES;
  const charges: { metric: string; overage: number; rate: number; charge: number }[] = [];

  // Video storage (convert seconds to hours for comparison)
  const videoHoursUsed = usage.videoStorageSeconds / 3_600;
  const videoHoursLimit = limits.videoStorageSeconds / 3_600;
  const videoOverage = Math.max(0, videoHoursUsed - videoHoursLimit);
  if (videoOverage > 0) {
    charges.push({
      metric: "videoStorageHours",
      overage: videoOverage,
      rate: rates.videoStoragePerHour,
      charge: Math.ceil(videoOverage) * rates.videoStoragePerHour,
    });
  }

  // Students
  const studentOverage = Math.max(0, usage.activeStudents - limits.students);
  if (studentOverage > 0) {
    charges.push({
      metric: "students",
      overage: studentOverage,
      rate: rates.studentOverage,
      charge: studentOverage * rates.studentOverage,
    });
  }

  // Emails
  const emailOverage = Math.max(0, usage.emailsSent - limits.emailsPerMonth);
  if (emailOverage > 0) {
    charges.push({
      metric: "emailsPerMonth",
      overage: emailOverage,
      rate: rates.emailOveragePer1K / 1_000,
      charge: Math.ceil(emailOverage / 1_000) * rates.emailOveragePer1K,
    });
  }

  return charges;
}
