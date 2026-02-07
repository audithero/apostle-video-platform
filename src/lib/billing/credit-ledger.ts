import { db } from "@/lib/db";
import { creditLedger, creditTypeEnum } from "@/lib/db/schema/billing";
import { eq, and, desc, sql } from "drizzle-orm";

type CreditType = (typeof creditTypeEnum.enumValues)[number];
type Tier = "launch" | "grow" | "scale" | "pro";

// Monthly credit allocations per tier
const MONTHLY_CREDITS: Record<Tier, Record<CreditType, number>> = {
  launch: {
    ai_course: 2,
    ai_rewrite: 10,
    ai_image: 10,
    ai_quiz: 5,
    avatar_minute: 0,
  },
  grow: {
    ai_course: 5,
    ai_rewrite: 30,
    ai_image: 50,
    ai_quiz: 20,
    avatar_minute: 0,
  },
  scale: {
    ai_course: 15,
    ai_rewrite: 100,
    ai_image: 200,
    ai_quiz: 1_000, // "unlimited" with fair use cap
    avatar_minute: 0,
  },
  pro: {
    ai_course: 30,
    ai_rewrite: 500, // "unlimited" with fair use cap
    ai_image: 500,
    ai_quiz: 1_000,
    avatar_minute: 0,
  },
};

export const creditLedgerService = {
  async getBalance(creatorId: string, creditType: CreditType): Promise<number> {
    const [latest] = await db
      .select({ balanceAfter: creditLedger.balanceAfter })
      .from(creditLedger)
      .where(
        and(
          eq(creditLedger.creatorId, creatorId),
          eq(creditLedger.creditType, creditType),
        ),
      )
      .orderBy(desc(creditLedger.createdAt))
      .limit(1);

    return latest?.balanceAfter ?? 0;
  },

  async getAllBalances(creatorId: string): Promise<Record<CreditType, number>> {
    const types: CreditType[] = ["ai_course", "ai_rewrite", "ai_image", "ai_quiz", "avatar_minute"];
    const balances: Record<string, number> = {};

    // Get latest balance for each type in a single query
    const results = await db
      .select({
        creditType: creditLedger.creditType,
        balanceAfter: sql<number>`(
          SELECT ${creditLedger.balanceAfter}
          FROM ${creditLedger} AS cl2
          WHERE cl2.creator_id = ${creditLedger.creatorId}
            AND cl2.credit_type = ${creditLedger.creditType}
          ORDER BY cl2.created_at DESC
          LIMIT 1
        )`,
      })
      .from(creditLedger)
      .where(eq(creditLedger.creatorId, creatorId))
      .groupBy(creditLedger.creditType, creditLedger.creatorId);

    for (const row of results) {
      balances[row.creditType] = row.balanceAfter;
    }

    // Fill in missing types with 0
    for (const type of types) {
      if (!(type in balances)) {
        balances[type] = 0;
      }
    }

    return balances as Record<CreditType, number>;
  },

  async allocateMonthlyCredits(creatorId: string, tier: Tier): Promise<void> {
    const allocations = MONTHLY_CREDITS[tier];

    for (const [type, amount] of Object.entries(allocations)) {
      if (amount <= 0) continue;

      // Reset balance to the monthly allocation (credits don't roll over)
      await db.insert(creditLedger).values({
        creatorId,
        creditType: type as CreditType,
        amount,
        balanceAfter: amount,
        description: `Monthly ${tier} tier allocation`,
      });
    }
  },

  async debitCredit(
    creatorId: string,
    creditType: CreditType,
    amount: number,
    description: string,
  ): Promise<{ success: boolean; remaining: number }> {
    return db.transaction(async (tx) => {
      // Get latest balance within transaction for atomicity
      const [latest] = await tx
        .select({ balanceAfter: creditLedger.balanceAfter })
        .from(creditLedger)
        .where(
          and(
            eq(creditLedger.creatorId, creatorId),
            eq(creditLedger.creditType, creditType),
          ),
        )
        .orderBy(desc(creditLedger.createdAt))
        .limit(1);

      const currentBalance = latest?.balanceAfter ?? 0;

      if (currentBalance < amount) {
        return { success: false, remaining: currentBalance };
      }

      const newBalance = currentBalance - amount;

      await tx.insert(creditLedger).values({
        creatorId,
        creditType,
        amount: -amount,
        balanceAfter: newBalance,
        description,
      });

      return { success: true, remaining: newBalance };
    });
  },

  async creditAmount(
    creatorId: string,
    creditType: CreditType,
    amount: number,
    description: string,
    stripePaymentId?: string,
  ): Promise<number> {
    const currentBalance = await this.getBalance(creatorId, creditType);
    const newBalance = currentBalance + amount;

    await db.insert(creditLedger).values({
      creatorId,
      creditType,
      amount,
      balanceAfter: newBalance,
      description,
      stripePaymentId: stripePaymentId ?? null,
    });

    return newBalance;
  },

  async purchaseAddon(
    creatorId: string,
    addonType: "boost" | "unlimited",
    stripePaymentId: string,
  ): Promise<void> {
    // Boost = 2x credits, Unlimited = fair-use cap
    const multiplier = addonType === "boost" ? 2 : 10;
    const types: CreditType[] = ["ai_course", "ai_rewrite", "ai_image", "ai_quiz"];

    for (const type of types) {
      const currentBalance = await this.getBalance(creatorId, type);
      const bonus = currentBalance * (multiplier - 1);

      await db.insert(creditLedger).values({
        creatorId,
        creditType: type,
        amount: bonus,
        balanceAfter: currentBalance + bonus,
        description: `AI ${addonType} add-on purchase`,
        stripePaymentId,
      });
    }
  },
};
