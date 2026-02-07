import { z } from "zod";
import { eq, and, desc, gte, or, isNull, sql } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { coupon } from "@/lib/db/schema/marketing";

export const couponsRouter = createTRPCRouter({
  // List coupons for creator
  list: creatorProcedure.query(async ({ ctx }) => {
    const coupons = await db
      .select()
      .from(coupon)
      .where(eq(coupon.creatorId, ctx.creator.id))
      .orderBy(desc(coupon.createdAt));
    return coupons;
  }),

  // Create coupon
  create: creatorProcedure
    .input(
      z.object({
        code: z.string().min(3).max(50).toUpperCase(),
        discountType: z.enum(["percent", "fixed"]),
        discountValue: z.number().min(1),
        courseIds: z.array(z.string()).optional(),
        maxRedemptions: z.number().optional(),
        validUntil: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check code uniqueness for this creator
      const [existing] = await db
        .select({ id: coupon.id })
        .from(coupon)
        .where(
          and(
            eq(coupon.creatorId, ctx.creator.id),
            eq(coupon.code, input.code),
          ),
        )
        .limit(1);

      if (existing) {
        throw new Error("Coupon code already exists");
      }

      const [created] = await db
        .insert(coupon)
        .values({
          creatorId: ctx.creator.id,
          code: input.code,
          discountType: input.discountType,
          discountValue: input.discountValue,
          maxRedemptions: input.maxRedemptions ?? null,
          validUntil: input.validUntil ?? null,
          appliesTo: input.courseIds ? { courseIds: input.courseIds } : null,
        })
        .returning();

      return created;
    }),

  // Update coupon
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        maxRedemptions: z.number().optional().nullable(),
        validUntil: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(coupon)
        .set(updates)
        .where(
          and(
            eq(coupon.id, id),
            eq(coupon.creatorId, ctx.creator.id),
          ),
        )
        .returning();
      return updated;
    }),

  // Delete coupon
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(coupon)
        .where(
          and(
            eq(coupon.id, input.id),
            eq(coupon.creatorId, ctx.creator.id),
          ),
        );
      return { success: true };
    }),

  // Validate coupon (student-facing)
  validate: protectedProcedure
    .input(
      z.object({
        code: z.string(),
        creatorId: z.string(),
        courseId: z.string().optional(),
      }),
    )
    .query(async ({ input }) => {
      const now = new Date();

      const [found] = await db
        .select()
        .from(coupon)
        .where(
          and(
            eq(coupon.creatorId, input.creatorId),
            eq(coupon.code, input.code.toUpperCase()),
            or(
              isNull(coupon.validUntil),
              gte(coupon.validUntil, now),
            ),
          ),
        )
        .limit(1);

      if (!found) {
        return { valid: false as const, message: "Invalid or expired coupon" };
      }

      // Check max redemptions
      if (found.maxRedemptions !== null && found.currentRedemptions >= found.maxRedemptions) {
        return { valid: false as const, message: "Coupon usage limit reached" };
      }

      // Check course restriction
      if (found.appliesTo?.courseIds && input.courseId) {
        if (!found.appliesTo.courseIds.includes(input.courseId)) {
          return { valid: false as const, message: "Coupon not valid for this course" };
        }
      }

      return {
        valid: true as const,
        discountType: found.discountType,
        discountValue: found.discountValue,
        code: found.code,
      };
    }),

  // Redeem coupon (atomically validate + increment to prevent race conditions)
  redeem: protectedProcedure
    .input(z.object({ couponId: z.string() }))
    .mutation(async ({ input }) => {
      // Atomic: only increment if still within limits
      const result = await db
        .update(coupon)
        .set({
          currentRedemptions: sql`${coupon.currentRedemptions} + 1`,
        })
        .where(
          and(
            eq(coupon.id, input.couponId),
            // Only apply if within redemption limit (null = unlimited)
            or(
              isNull(coupon.maxRedemptions),
              sql`${coupon.currentRedemptions} < ${coupon.maxRedemptions}`,
            ),
            // Only apply if not expired
            or(
              isNull(coupon.validUntil),
              gte(coupon.validUntil, new Date()),
            ),
          ),
        )
        .returning();

      if (result.length === 0) {
        return { success: false, message: "Coupon no longer available" };
      }

      return { success: true };
    }),
});
