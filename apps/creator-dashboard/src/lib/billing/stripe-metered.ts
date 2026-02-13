import Stripe from "stripe";
import { db } from "@/lib/db";
import { creator } from "@/lib/db/schema/creator";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env.server";
import { TIER_LIMITS, TIER_PRICES, OVERAGE_RATES } from "./tier-limits";
import { usageTracker } from "./usage-tracker";

type Tier = "launch" | "grow" | "scale" | "pro";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

/**
 * Reports current period usage to Stripe as metered billing.
 * Called on a schedule (e.g. hourly) or on-demand.
 */
export async function reportUsageToStripe(creatorId: string): Promise<{
  reported: boolean;
  items: Array<{ metric: string; overage: number; stripePriceId: string }>;
}> {
  const [creatorRecord] = await db
    .select()
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  if (!creatorRecord?.overageEnabled || !creatorRecord.stripeSubscriptionId) {
    return { reported: false, items: [] };
  }

  const tier = creatorRecord.tier as Tier;
  const limits = TIER_LIMITS[tier];
  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);

  const items: Array<{ metric: string; overage: number; stripePriceId: string }> = [];

  // Video storage overage (in hours)
  const videoHours = usage.videoStorageSeconds / 3_600;
  const videoLimit = limits.videoStorageSeconds / 3_600;
  const videoOverage = Math.max(0, Math.ceil(videoHours - videoLimit));
  if (videoOverage > 0) {
    items.push({
      metric: "video_storage_hours",
      overage: videoOverage,
      stripePriceId: "price_overage_video_storage",
    });
  }

  // Student overage
  const studentOverage = Math.max(0, usage.activeStudents - limits.students);
  if (studentOverage > 0) {
    items.push({
      metric: "students",
      overage: studentOverage,
      stripePriceId: "price_overage_students",
    });
  }

  // Email overage (per 1,000 block)
  const emailOverage = Math.max(0, usage.emailsSent - limits.emailsPerMonth);
  if (emailOverage > 0) {
    items.push({
      metric: "emails",
      overage: Math.ceil(emailOverage / 1_000),
      stripePriceId: "price_overage_emails",
    });
  }

  if (items.length === 0) {
    return { reported: false, items: [] };
  }

  // Report each overage to Stripe via usage records
  const subscription = await stripeClient.subscriptions.retrieve(
    creatorRecord.stripeSubscriptionId,
  );

  for (const item of items) {
    // Find or skip the subscription item for this price
    const subItem = subscription.items.data.find(
      (si) => si.price.id === item.stripePriceId,
    );

    if (subItem) {
      await stripeClient.subscriptionItems.createUsageRecord(subItem.id, {
        quantity: item.overage,
        timestamp: "now",
        action: "set",
      });
    }
  }

  return { reported: true, items };
}

/**
 * Adds metered overage price items to an existing subscription
 * when a creator enables overage billing.
 */
export async function enableOverageOnSubscription(
  subscriptionId: string,
): Promise<{ success: boolean }> {
  const overagePrices = [
    "price_overage_video_storage",
    "price_overage_students",
    "price_overage_emails",
  ];

  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  const existingPriceIds = new Set(subscription.items.data.map((si) => si.price.id));

  const newItems = overagePrices.filter((p) => !existingPriceIds.has(p));

  if (newItems.length > 0) {
    await stripeClient.subscriptions.update(subscriptionId, {
      items: [
        ...subscription.items.data.map((si) => ({ id: si.id })),
        ...newItems.map((priceId) => ({ price: priceId })),
      ],
    });
  }

  return { success: true };
}

/**
 * Removes metered overage price items from a subscription
 * when a creator disables overage billing.
 */
export async function disableOverageOnSubscription(
  subscriptionId: string,
): Promise<{ success: boolean }> {
  const overagePriceIds = new Set([
    "price_overage_video_storage",
    "price_overage_students",
    "price_overage_emails",
  ]);

  const subscription = await stripeClient.subscriptions.retrieve(subscriptionId);
  const overageItems = subscription.items.data.filter(
    (si) => overagePriceIds.has(si.price.id),
  );

  if (overageItems.length > 0) {
    await stripeClient.subscriptions.update(subscriptionId, {
      items: overageItems.map((si) => ({ id: si.id, deleted: true })),
    });
  }

  return { success: true };
}

/**
 * Checks if a creator should be recommended to upgrade based on
 * consistent overage patterns over 2 months.
 */
export async function checkAutoUpgradeRecommendation(creatorId: string): Promise<{
  shouldRecommend: boolean;
  currentTier: Tier;
  recommendedTier: Tier | null;
  reason: string | null;
}> {
  const [creatorRecord] = await db
    .select()
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  if (!creatorRecord) {
    return { shouldRecommend: false, currentTier: "launch", recommendedTier: null, reason: null };
  }

  const currentTier = creatorRecord.tier as Tier;

  // Pro tier has no upgrade path
  if (currentTier === "pro") {
    return { shouldRecommend: false, currentTier, recommendedTier: null, reason: null };
  }

  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);
  const limits = TIER_LIMITS[currentTier];

  // Calculate estimated monthly overage cost
  const videoHoursOverage = Math.max(0, (usage.videoStorageSeconds / 3_600) - (limits.videoStorageSeconds / 3_600));
  const studentOverage = Math.max(0, usage.activeStudents - limits.students);
  const emailOverage = Math.max(0, usage.emailsSent - limits.emailsPerMonth);

  const estimatedOverageCents =
    videoHoursOverage * OVERAGE_RATES.videoStoragePerHour +
    studentOverage * OVERAGE_RATES.studentOverage +
    (emailOverage / 1_000) * OVERAGE_RATES.emailOveragePer1K;

  if (estimatedOverageCents <= 0) {
    return { shouldRecommend: false, currentTier, recommendedTier: null, reason: null };
  }

  // Determine next tier
  const tierOrder: Tier[] = ["launch", "grow", "scale", "pro"];
  const currentIdx = tierOrder.indexOf(currentTier);
  const nextTier = tierOrder.at(currentIdx + 1);

  if (!nextTier) {
    return { shouldRecommend: false, currentTier, recommendedTier: null, reason: null };
  }

  // Compare overage cost to price difference
  const currentPrice = TIER_PRICES[currentTier].monthly;
  const nextPrice = TIER_PRICES[nextTier].monthly;
  const priceDiff = nextPrice - currentPrice;

  // Recommend if overages exceed 50% of the price difference to next tier
  if (estimatedOverageCents > priceDiff * 0.5) {
    return {
      shouldRecommend: true,
      currentTier,
      recommendedTier: nextTier,
      reason: `Your estimated overage charges ($${(estimatedOverageCents / 100).toFixed(2)}/mo) exceed 50% of the upgrade cost to ${nextTier} plan (+$${(priceDiff / 100).toFixed(2)}/mo). Upgrading would save you money.`,
    };
  }

  return { shouldRecommend: false, currentTier, recommendedTier: null, reason: null };
}

/**
 * Get a breakdown of current overage charges for display.
 */
export async function getOverageSummary(creatorId: string): Promise<{
  overageEnabled: boolean;
  charges: Array<{
    metric: string;
    label: string;
    overage: number;
    unit: string;
    rateCents: number;
    totalCents: number;
  }>;
  totalCents: number;
  upgradeRecommendation: {
    shouldRecommend: boolean;
    recommendedTier: string | null;
    reason: string | null;
  };
}> {
  const [creatorRecord] = await db
    .select()
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  if (!creatorRecord) {
    return {
      overageEnabled: false,
      charges: [],
      totalCents: 0,
      upgradeRecommendation: { shouldRecommend: false, recommendedTier: null, reason: null },
    };
  }

  const tier = creatorRecord.tier as Tier;
  const limits = TIER_LIMITS[tier];
  const usage = await usageTracker.getCurrentPeriodUsage(creatorId);

  const charges: Array<{
    metric: string;
    label: string;
    overage: number;
    unit: string;
    rateCents: number;
    totalCents: number;
  }> = [];

  // Video storage
  const videoHours = usage.videoStorageSeconds / 3_600;
  const videoLimit = limits.videoStorageSeconds / 3_600;
  const videoOverage = Math.max(0, videoHours - videoLimit);
  if (videoOverage > 0) {
    charges.push({
      metric: "video_storage",
      label: "Video Storage",
      overage: Math.round(videoOverage * 10) / 10,
      unit: "hours",
      rateCents: OVERAGE_RATES.videoStoragePerHour,
      totalCents: Math.ceil(videoOverage) * OVERAGE_RATES.videoStoragePerHour,
    });
  }

  // Students
  const studentOverage = Math.max(0, usage.activeStudents - limits.students);
  if (studentOverage > 0) {
    charges.push({
      metric: "students",
      label: "Additional Students",
      overage: studentOverage,
      unit: "students",
      rateCents: OVERAGE_RATES.studentOverage,
      totalCents: studentOverage * OVERAGE_RATES.studentOverage,
    });
  }

  // Emails
  const emailOverage = Math.max(0, usage.emailsSent - limits.emailsPerMonth);
  if (emailOverage > 0) {
    charges.push({
      metric: "emails",
      label: "Additional Emails",
      overage: emailOverage,
      unit: "emails",
      rateCents: OVERAGE_RATES.emailOveragePer1K,
      totalCents: Math.ceil(emailOverage / 1_000) * OVERAGE_RATES.emailOveragePer1K,
    });
  }

  const totalCents = charges.reduce((sum, c) => sum + c.totalCents, 0);

  const upgradeRec = await checkAutoUpgradeRecommendation(creatorId);

  return {
    overageEnabled: creatorRecord.overageEnabled,
    charges,
    totalCents,
    upgradeRecommendation: {
      shouldRecommend: upgradeRec.shouldRecommend,
      recommendedTier: upgradeRec.recommendedTier,
      reason: upgradeRec.reason,
    },
  };
}
