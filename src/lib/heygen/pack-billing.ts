import { db } from "@/lib/db";
import { avatarPack } from "@/lib/db/schema/billing";
import type { avatarPackTypeEnum } from "@/lib/db/schema/billing";
import { eq, asc, sql, and, or, gt, isNull } from "drizzle-orm";

type PackType = (typeof avatarPackTypeEnum.enumValues)[number];

const PACK_CONFIG: Record<PackType, { minutes: number; priceCents: number }> = {
  starter: { minutes: 10, priceCents: 25_00 },
  creator: { minutes: 30, priceCents: 60_00 },
  pro: { minutes: 60, priceCents: 99_00 },
  studio: { minutes: 120, priceCents: 179_00 },
};

export const packBilling = {
  /**
   * Create an avatar pack record after a successful Stripe payment.
   */
  async purchasePack(
    creatorId: string,
    packType: PackType,
    stripePaymentId: string,
  ) {
    const config = PACK_CONFIG[packType];

    const [pack] = await db
      .insert(avatarPack)
      .values({
        creatorId,
        packType,
        minutesTotal: config.minutes,
        minutesUsed: 0,
        stripePaymentId,
      })
      .returning();

    return pack;
  },

  /**
   * Debit minutes using FIFO: consume from the oldest non-expired pack first.
   * Returns the actual minutes debited (may be less than requested if balance is insufficient).
   */
  async debitMinutes(
    creatorId: string,
    minutes: number,
  ): Promise<{ debited: number; remaining: number }> {
    return db.transaction(async (tx) => {
      const now = new Date();

      // Get all packs with remaining minutes within transaction for atomicity
      const packs = await tx
        .select()
        .from(avatarPack)
        .where(
          and(
            eq(avatarPack.creatorId, creatorId),
            sql`${avatarPack.minutesTotal} - ${avatarPack.minutesUsed} > 0`,
            or(isNull(avatarPack.expiresAt), gt(avatarPack.expiresAt, now)),
          ),
        )
        .orderBy(asc(avatarPack.purchasedAt));

      let remaining = minutes;
      let totalDebited = 0;

      for (const pack of packs) {
        if (remaining <= 0) break;

        const available = pack.minutesTotal - pack.minutesUsed;
        const toDebit = Math.min(available, remaining);

        await tx
          .update(avatarPack)
          .set({ minutesUsed: pack.minutesUsed + toDebit })
          .where(eq(avatarPack.id, pack.id));

        totalDebited += toDebit;
        remaining -= toDebit;
      }

      // Calculate remaining balance within same transaction
      const [result] = await tx
        .select({
          total: sql<number>`COALESCE(SUM(${avatarPack.minutesTotal} - ${avatarPack.minutesUsed}), 0)`,
        })
        .from(avatarPack)
        .where(
          and(
            eq(avatarPack.creatorId, creatorId),
            sql`${avatarPack.minutesTotal} - ${avatarPack.minutesUsed} > 0`,
            or(isNull(avatarPack.expiresAt), gt(avatarPack.expiresAt, now)),
          ),
        );

      return { debited: totalDebited, remaining: result?.total ?? 0 };
    });
  },

  /**
   * Get total remaining avatar minutes across all non-expired packs.
   */
  async getBalance(creatorId: string): Promise<number> {
    const now = new Date();

    const [result] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${avatarPack.minutesTotal} - ${avatarPack.minutesUsed}), 0)`,
      })
      .from(avatarPack)
      .where(
        and(
          eq(avatarPack.creatorId, creatorId),
          sql`${avatarPack.minutesTotal} - ${avatarPack.minutesUsed} > 0`,
          or(isNull(avatarPack.expiresAt), gt(avatarPack.expiresAt, now)),
        ),
      );

    return result?.total ?? 0;
  },

  /**
   * Get all packs for a creator (for displaying purchase history).
   */
  async getPacks(creatorId: string) {
    return db
      .select()
      .from(avatarPack)
      .where(eq(avatarPack.creatorId, creatorId))
      .orderBy(asc(avatarPack.purchasedAt));
  },
};
