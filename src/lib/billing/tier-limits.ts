import type { tierEnum } from "@/lib/db/schema/creator";

type Tier = (typeof tierEnum.enumValues)[number];

interface TierLimits {
  courses: number; // -1 = unlimited
  videoStorageSeconds: number;
  students: number;
  emailsPerMonth: number;
  aiCourseGenerations: number;
  aiLessonRewrites: number; // -1 = unlimited (fair use)
  aiImageGenerations: number;
  aiQuizGenerations: number; // -1 = unlimited
}

export const TIER_LIMITS: Record<Tier, TierLimits> = {
  launch: {
    courses: 3,
    videoStorageSeconds: 5 * 3600, // 5 hours
    students: 100,
    emailsPerMonth: 2_500,
    aiCourseGenerations: 2,
    aiLessonRewrites: 10,
    aiImageGenerations: 10,
    aiQuizGenerations: 5,
  },
  grow: {
    courses: 10,
    videoStorageSeconds: 25 * 3600, // 25 hours
    students: 1_000,
    emailsPerMonth: 10_000,
    aiCourseGenerations: 5,
    aiLessonRewrites: 30,
    aiImageGenerations: 50,
    aiQuizGenerations: 20,
  },
  scale: {
    courses: 25,
    videoStorageSeconds: 100 * 3600, // 100 hours
    students: 5_000,
    emailsPerMonth: 25_000,
    aiCourseGenerations: 15,
    aiLessonRewrites: 100,
    aiImageGenerations: 200,
    aiQuizGenerations: -1,
  },
  pro: {
    courses: -1,
    videoStorageSeconds: 250 * 3600, // 250 hours
    students: 15_000,
    emailsPerMonth: 50_000,
    aiCourseGenerations: 30,
    aiLessonRewrites: -1, // fair use cap at 500
    aiImageGenerations: 500,
    aiQuizGenerations: -1,
  },
};

// Fair use caps for "unlimited" features
export const FAIR_USE_CAPS: Record<string, number> = {
  aiLessonRewrites: 500,
  aiQuizGenerations: 1_000,
  courses: 500,
};

// Overage pricing (per unit, in cents)
export const OVERAGE_RATES = {
  videoStoragePerHour: 200, // $2/hr
  studentOverage: 10, // $0.10/student
  emailOveragePer1K: 150, // $1.50/1K
};

// Tier monthly prices in cents
export const TIER_PRICES = {
  launch: { monthly: 2_900, annual: 2_400 },
  grow: { monthly: 7_900, annual: 6_500 },
  scale: { monthly: 14_900, annual: 12_500 },
  pro: { monthly: 19_900, annual: 16_500 },
} as const;

export interface UsageMetric {
  current: number;
  limit: number;
  percent: number;
  isUnlimited: boolean;
  nearLimit: boolean; // >60%
  atWarning: boolean; // >80%
  atLimit: boolean; // >=100%
  overLimit: boolean; // >100%
}

export interface UsageStatus {
  courses: UsageMetric;
  videoStorage: UsageMetric;
  students: UsageMetric;
  emails: UsageMetric;
  aiCourseGenerations: UsageMetric;
  aiLessonRewrites: UsageMetric;
  aiImageGenerations: UsageMetric;
  aiQuizGenerations: UsageMetric;
  tier: Tier;
  overageEnabled: boolean;
}

export function calculateUsageMetric(current: number, limit: number): UsageMetric {
  const isUnlimited = limit === -1;
  const effectiveLimit = isUnlimited ? current + 1 : limit;
  const percent = isUnlimited ? 0 : effectiveLimit > 0 ? (current / effectiveLimit) * 100 : 0;

  return {
    current,
    limit,
    percent: Math.round(percent * 10) / 10,
    isUnlimited,
    nearLimit: !isUnlimited && percent >= 60,
    atWarning: !isUnlimited && percent >= 80,
    atLimit: !isUnlimited && percent >= 100,
    overLimit: !isUnlimited && percent > 100,
  };
}

export function checkCanPerformAction(
  tier: Tier,
  metric: keyof TierLimits,
  currentUsage: number,
  overageEnabled: boolean,
): { allowed: boolean; reason?: string } {
  const limit = TIER_LIMITS[tier][metric];

  if (limit === -1) {
    // Check fair use cap
    const fairUseCap = FAIR_USE_CAPS[metric];
    if (fairUseCap && currentUsage >= fairUseCap) {
      return { allowed: false, reason: `Fair use limit of ${String(fairUseCap)} reached` };
    }
    return { allowed: true };
  }

  if (currentUsage < limit) {
    return { allowed: true };
  }

  // At or over limit
  const graceLimit = Math.ceil(limit * 1.1); // 10% grace buffer
  if (overageEnabled && currentUsage < graceLimit) {
    return { allowed: true };
  }

  if (overageEnabled) {
    return { allowed: true }; // Overages enabled, bill them
  }

  return {
    allowed: false,
    reason: `${metric} limit of ${String(limit)} reached. Upgrade your plan or enable overages.`,
  };
}
