import { z } from "zod";
import { eq, and, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { affiliate, affiliateReferral } from "@/lib/db/schema/marketing";
import { user } from "@/lib/db/schema/auth";

export const affiliatesRouter = createTRPCRouter({
  // List affiliates for creator (with aggregated stats)
  list: creatorProcedure.query(async ({ ctx }) => {
    const affiliates = await db
      .select()
      .from(affiliate)
      .where(eq(affiliate.creatorId, ctx.creator.id))
      .orderBy(desc(affiliate.createdAt));

    // Enrich with user info and live referral stats
    const enriched = await Promise.all(
      affiliates.map(async (aff) => {
        const [userData] = await db
          .select({ name: user.name, email: user.email })
          .from(user)
          .where(eq(user.id, aff.userId))
          .limit(1);

        const [stats] = await db
          .select({
            totalReferrals: sql<number>`COUNT(*)::int`,
            totalRevenueCents: sql<number>`COALESCE(SUM(${affiliateReferral.commissionCents}), 0)::int`,
            pendingCount: sql<number>`COUNT(*) FILTER (WHERE ${affiliateReferral.status} = 'pending')::int`,
            approvedCount: sql<number>`COUNT(*) FILTER (WHERE ${affiliateReferral.status} = 'approved')::int`,
            paidCount: sql<number>`COUNT(*) FILTER (WHERE ${affiliateReferral.status} = 'paid')::int`,
          })
          .from(affiliateReferral)
          .where(eq(affiliateReferral.affiliateId, aff.id));

        return {
          ...aff,
          userName: userData?.name ?? "Unknown",
          userEmail: userData?.email ?? "",
          referralStats: {
            totalReferrals: stats?.totalReferrals ?? 0,
            totalRevenueCents: stats?.totalRevenueCents ?? 0,
            pendingCount: stats?.pendingCount ?? 0,
            approvedCount: stats?.approvedCount ?? 0,
            paidCount: stats?.paidCount ?? 0,
          },
        };
      }),
    );

    return enriched;
  }),

  // Invite affiliate by email - finds or creates user association
  invite: creatorProcedure
    .input(
      z.object({
        email: z.string().email(),
        commissionPercent: z.number().min(1).max(80).default(20),
        cookieDays: z.number().min(1).max(180).default(30),
        customCode: z.string().min(3).max(50).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Look up user by email
      const [existingUser] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, input.email))
        .limit(1);

      if (!existingUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No user found with that email. They must create an account first.",
        });
      }

      // Check if already an affiliate for this creator
      const [existing] = await db
        .select({ id: affiliate.id })
        .from(affiliate)
        .where(
          and(
            eq(affiliate.creatorId, ctx.creator.id),
            eq(affiliate.userId, existingUser.id),
          ),
        )
        .limit(1);

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This user is already an affiliate.",
        });
      }

      const referralCode =
        input.customCode ?? `ref-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

      const [created] = await db
        .insert(affiliate)
        .values({
          creatorId: ctx.creator.id,
          userId: existingUser.id,
          commissionPercent: input.commissionPercent,
          cookieDays: input.cookieDays,
          referralCode,
        })
        .returning();

      return created;
    }),

  // Update affiliate settings
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["active", "paused"]).optional(),
        commissionPercent: z.number().min(1).max(80).optional(),
        cookieDays: z.number().min(1).max(180).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updates: Record<string, unknown> = {};
      if (input.status !== undefined) updates.status = input.status;
      if (input.commissionPercent !== undefined) updates.commissionPercent = input.commissionPercent;
      if (input.cookieDays !== undefined) updates.cookieDays = input.cookieDays;

      const [updated] = await db
        .update(affiliate)
        .set(updates)
        .where(
          and(
            eq(affiliate.id, input.id),
            eq(affiliate.creatorId, ctx.creator.id),
          ),
        )
        .returning();

      if (!updated) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
      }

      return updated;
    }),

  // Get referrals for an affiliate
  getReferrals: creatorProcedure
    .input(z.object({ affiliateId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify affiliate belongs to creator
      const [aff] = await db
        .select()
        .from(affiliate)
        .where(
          and(
            eq(affiliate.id, input.affiliateId),
            eq(affiliate.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!aff) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
      }

      const referrals = await db
        .select({
          id: affiliateReferral.id,
          referredUserId: affiliateReferral.referredUserId,
          referredEnrollmentId: affiliateReferral.referredEnrollmentId,
          commissionCents: affiliateReferral.commissionCents,
          status: affiliateReferral.status,
          createdAt: affiliateReferral.createdAt,
          paidAt: affiliateReferral.paidAt,
        })
        .from(affiliateReferral)
        .where(eq(affiliateReferral.affiliateId, input.affiliateId))
        .orderBy(desc(affiliateReferral.createdAt));

      // Enrich with user names
      const enriched = await Promise.all(
        referrals.map(async (ref) => {
          const [refUser] = await db
            .select({ name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, ref.referredUserId))
            .limit(1);

          return {
            ...ref,
            referredUserName: refUser?.name ?? "Unknown",
            referredUserEmail: refUser?.email ?? "",
          };
        }),
      );

      return enriched;
    }),

  // Record a referral (called during enrollment via server-side logic)
  recordReferral: protectedProcedure
    .input(
      z.object({
        referralCode: z.string(),
        enrollmentId: z.string().optional(),
        amountCents: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [aff] = await db
        .select()
        .from(affiliate)
        .where(
          and(
            eq(affiliate.referralCode, input.referralCode),
            eq(affiliate.status, "active"),
          ),
        )
        .limit(1);

      if (!aff) {
        return null; // Silently skip invalid/inactive codes
      }

      const commissionCents = aff.commissionFixedCents
        ? aff.commissionFixedCents
        : Math.round((input.amountCents * (aff.commissionPercent ?? 20)) / 100);

      const [referral] = await db
        .insert(affiliateReferral)
        .values({
          affiliateId: aff.id,
          referredUserId: ctx.session.user.id,
          referredEnrollmentId: input.enrollmentId ?? null,
          commissionCents,
        })
        .returning();

      // Increment affiliate counters
      await db
        .update(affiliate)
        .set({
          totalReferrals: sql`${affiliate.totalReferrals} + 1`,
          totalEarningsCents: sql`${affiliate.totalEarningsCents} + ${commissionCents}`,
        })
        .where(eq(affiliate.id, aff.id));

      return referral;
    }),

  // Approve referral commissions (batch)
  approveReferrals: creatorProcedure
    .input(z.object({ referralIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      let approved = 0;

      for (const referralId of input.referralIds) {
        // Verify referral belongs to one of creator's affiliates
        const [ref] = await db
          .select({
            id: affiliateReferral.id,
            affiliateId: affiliateReferral.affiliateId,
          })
          .from(affiliateReferral)
          .innerJoin(affiliate, eq(affiliateReferral.affiliateId, affiliate.id))
          .where(
            and(
              eq(affiliateReferral.id, referralId),
              eq(affiliate.creatorId, ctx.creator.id),
              eq(affiliateReferral.status, "pending"),
            ),
          )
          .limit(1);

        if (ref) {
          await db
            .update(affiliateReferral)
            .set({ status: "approved" })
            .where(eq(affiliateReferral.id, referralId));
          approved += 1;
        }
      }

      return { approved };
    }),

  // Mark referrals as paid (batch)
  markPaid: creatorProcedure
    .input(z.object({ referralIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      let paid = 0;

      for (const referralId of input.referralIds) {
        const [ref] = await db
          .select({
            id: affiliateReferral.id,
            affiliateId: affiliateReferral.affiliateId,
          })
          .from(affiliateReferral)
          .innerJoin(affiliate, eq(affiliateReferral.affiliateId, affiliate.id))
          .where(
            and(
              eq(affiliateReferral.id, referralId),
              eq(affiliate.creatorId, ctx.creator.id),
              eq(affiliateReferral.status, "approved"),
            ),
          )
          .limit(1);

        if (ref) {
          await db
            .update(affiliateReferral)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(affiliateReferral.id, referralId));
          paid += 1;
        }
      }

      return { paid };
    }),

  // Payout export CSV data
  payoutExport: creatorProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "paid"]).optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(affiliate.creatorId, ctx.creator.id)];

      const referrals = await db
        .select({
          referralId: affiliateReferral.id,
          affiliateCode: affiliate.referralCode,
          affiliateUserId: affiliate.userId,
          commissionCents: affiliateReferral.commissionCents,
          status: affiliateReferral.status,
          createdAt: affiliateReferral.createdAt,
          paidAt: affiliateReferral.paidAt,
        })
        .from(affiliateReferral)
        .innerJoin(affiliate, eq(affiliateReferral.affiliateId, affiliate.id))
        .where(
          input.status
            ? and(...conditions, eq(affiliateReferral.status, input.status))
            : and(...conditions),
        )
        .orderBy(desc(affiliateReferral.createdAt));

      // Enrich with user info for CSV
      const rows = await Promise.all(
        referrals.map(async (ref) => {
          const [affUser] = await db
            .select({ name: user.name, email: user.email })
            .from(user)
            .where(eq(user.id, ref.affiliateUserId))
            .limit(1);

          return {
            referralId: ref.referralId,
            affiliateName: affUser?.name ?? "Unknown",
            affiliateEmail: affUser?.email ?? "",
            affiliateCode: ref.affiliateCode,
            commissionCents: ref.commissionCents,
            commissionDollars: (ref.commissionCents / 100).toFixed(2),
            status: ref.status,
            date: ref.createdAt.toISOString().split("T").at(0) ?? "",
            paidAt: ref.paidAt?.toISOString().split("T").at(0) ?? "",
          };
        }),
      );

      return rows;
    }),

  // Delete affiliate
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(affiliate)
        .where(
          and(
            eq(affiliate.id, input.id),
            eq(affiliate.creatorId, ctx.creator.id),
          ),
        );
      return { success: true };
    }),

  // Get referral link base URL for an affiliate
  getReferralLink: creatorProcedure
    .input(z.object({ affiliateId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [aff] = await db
        .select({ referralCode: affiliate.referralCode })
        .from(affiliate)
        .where(
          and(
            eq(affiliate.id, input.affiliateId),
            eq(affiliate.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!aff) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
      }

      return {
        code: aff.referralCode,
        // The referral link template - creator can share with affiliate
        linkTemplate: `?ref=${aff.referralCode}`,
      };
    }),
});
