import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema/creator";
import { monthlyUsage } from "@/lib/db/schema/billing";
import { eq, desc } from "drizzle-orm";
import { TIER_LIMITS, TIER_PRICES, OVERAGE_RATES } from "./tier-limits";

type Tier = "launch" | "grow" | "scale" | "pro";

const TIER_ORDER: Tier[] = ["launch", "grow", "scale", "pro"];

interface OverageCost {
  videoStorageCents: number;
  studentCents: number;
  emailCents: number;
  totalCents: number;
}

interface UpgradeRecommendation {
  shouldRecommend: boolean;
  currentTier: Tier;
  recommendedTier: Tier | null;
  currentPriceMonthly: number;
  upgradePriceMonthly: number;
  avgMonthlyOverageCents: number;
  consecutiveMonthsOverLimit: number;
  reason: string | null;
  breakdown: {
    overageCostFormatted: string;
    upgradeCostFormatted: string;
    savingsFormatted: string;
  } | null;
}

/**
 * Calculate overage costs for a given month's usage against a specific tier.
 */
function calculateOverageCosts(
  usage: { videoStorageSeconds: number; activeStudents: number; emailsSent: number },
  tier: Tier,
): OverageCost {
  const limits = TIER_LIMITS[tier];

  const videoHoursOver = Math.max(0, (usage.videoStorageSeconds / 3_600) - (limits.videoStorageSeconds / 3_600));
  const studentsOver = Math.max(0, usage.activeStudents - limits.students);
  const emailsOver = Math.max(0, usage.emailsSent - limits.emailsPerMonth);

  const videoStorageCents = Math.ceil(videoHoursOver) * OVERAGE_RATES.videoStoragePerHour;
  const studentCents = studentsOver * OVERAGE_RATES.studentOverage;
  const emailCents = Math.ceil(emailsOver / 1_000) * OVERAGE_RATES.emailOveragePer1K;

  return {
    videoStorageCents,
    studentCents,
    emailCents,
    totalCents: videoStorageCents + studentCents + emailCents,
  };
}

/**
 * Checks if a creator should be recommended to upgrade based on consecutive months
 * of overages exceeding 50% of the next tier's price difference.
 *
 * Examines the last 2 months of usage data to detect the pattern.
 */
export async function shouldRecommendUpgrade(creatorId: string): Promise<UpgradeRecommendation> {
  const [creatorRecord] = await db
    .select()
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  const noRecommendation = (tier: Tier): UpgradeRecommendation => ({
    shouldRecommend: false,
    currentTier: tier,
    recommendedTier: null,
    currentPriceMonthly: TIER_PRICES[tier].monthly,
    upgradePriceMonthly: 0,
    avgMonthlyOverageCents: 0,
    consecutiveMonthsOverLimit: 0,
    reason: null,
    breakdown: null,
  });

  if (!creatorRecord) {
    return noRecommendation("launch");
  }

  const currentTier = creatorRecord.tier as Tier;
  const currentIdx = TIER_ORDER.indexOf(currentTier);

  // Pro tier has no upgrade path
  if (currentTier === "pro" || currentIdx >= TIER_ORDER.length - 1) {
    return noRecommendation(currentTier);
  }

  const nextTier = TIER_ORDER[currentIdx + 1];

  // Get last 2 months of usage
  const recentUsage = await db
    .select()
    .from(monthlyUsage)
    .where(eq(monthlyUsage.creatorId, creatorId))
    .orderBy(desc(monthlyUsage.periodStart))
    .limit(2);

  if (recentUsage.length === 0) {
    return noRecommendation(currentTier);
  }

  // Calculate overage costs for each month
  const monthlyOverages = recentUsage.map((month) =>
    calculateOverageCosts(
      {
        videoStorageSeconds: month.videoStorageSeconds,
        activeStudents: month.activeStudents,
        emailsSent: month.emailsSent,
      },
      currentTier,
    ),
  );

  const priceDiff = TIER_PRICES[nextTier].monthly - TIER_PRICES[currentTier].monthly;
  const threshold = priceDiff * 0.5;

  // Count consecutive months where overages exceed 50% of upgrade cost
  let consecutiveMonths = 0;
  for (const overage of monthlyOverages) {
    if (overage.totalCents > threshold) {
      consecutiveMonths += 1;
    } else {
      break;
    }
  }

  const avgOverage = monthlyOverages.length > 0
    ? Math.round(monthlyOverages.reduce((sum, o) => sum + o.totalCents, 0) / monthlyOverages.length)
    : 0;

  // Recommend if 2 consecutive months exceed threshold
  if (consecutiveMonths >= 2) {
    const overageDollars = (avgOverage / 100).toFixed(2);
    const upgradeDollars = (priceDiff / 100).toFixed(2);
    const currentDollars = (TIER_PRICES[currentTier].monthly / 100).toFixed(2);
    const nextDollars = (TIER_PRICES[nextTier].monthly / 100).toFixed(2);
    const totalCurrentCost = TIER_PRICES[currentTier].monthly + avgOverage;
    const savings = totalCurrentCost - TIER_PRICES[nextTier].monthly;

    return {
      shouldRecommend: true,
      currentTier,
      recommendedTier: nextTier,
      currentPriceMonthly: TIER_PRICES[currentTier].monthly,
      upgradePriceMonthly: TIER_PRICES[nextTier].monthly,
      avgMonthlyOverageCents: avgOverage,
      consecutiveMonthsOverLimit: consecutiveMonths,
      reason: `You've paid an average of $${overageDollars}/mo in overages for ${String(consecutiveMonths)} consecutive months. Upgrading from ${currentTier} ($${currentDollars}/mo) to ${nextTier} ($${nextDollars}/mo) costs just $${upgradeDollars}/mo more and includes all your current usage${savings > 0 ? `, saving you $${(savings / 100).toFixed(2)}/mo` : ""}.`,
      breakdown: {
        overageCostFormatted: `$${overageDollars}/mo avg overages`,
        upgradeCostFormatted: `$${upgradeDollars}/mo to upgrade to ${nextTier}`,
        savingsFormatted: savings > 0 ? `$${(savings / 100).toFixed(2)}/mo savings` : "Break even",
      },
    };
  }

  // Even if not 2 consecutive months, show a softer recommendation if current month is high
  if (consecutiveMonths === 1 && avgOverage > threshold) {
    return {
      shouldRecommend: false, // Not a strong recommendation yet
      currentTier,
      recommendedTier: nextTier,
      currentPriceMonthly: TIER_PRICES[currentTier].monthly,
      upgradePriceMonthly: TIER_PRICES[nextTier].monthly,
      avgMonthlyOverageCents: avgOverage,
      consecutiveMonthsOverLimit: 1,
      reason: `Your overage charges ($${(avgOverage / 100).toFixed(2)}) are approaching the upgrade cost to ${nextTier}. If this continues next month, we'll recommend upgrading.`,
      breakdown: null,
    };
  }

  return {
    ...noRecommendation(currentTier),
    avgMonthlyOverageCents: avgOverage,
  };
}
