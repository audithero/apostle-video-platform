import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { creator, creatorSettings } from "@/lib/db/schema/creator";
import { user } from "@/lib/db/schema/auth";
import { enableOverageOnSubscription, disableOverageOnSubscription } from "@/lib/billing/stripe-metered";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export const creatorSettingsRouter = createTRPCRouter({
  // Get creator profile
  getProfile: creatorProcedure.query(async ({ ctx }) => {
    return ctx.creator;
  }),

  // Get creator settings
  getSettings: creatorProcedure.query(async ({ ctx }) => {
    const [settings] = await db
      .select()
      .from(creatorSettings)
      .where(eq(creatorSettings.creatorId, ctx.creator.id))
      .limit(1);

    return settings ?? null;
  }),

  // Create creator profile (onboarding)
  createProfile: protectedProcedure
    .input(
      z.object({
        businessName: z.string().min(1).max(200),
        slug: z.string().min(1).max(100).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Prevent duplicate creator profiles for the same user
      const [existingCreator] = await db
        .select({ id: creator.id })
        .from(creator)
        .where(eq(creator.userId, ctx.session.user.id))
        .limit(1);

      if (existingCreator) {
        throw new Error("Creator profile already exists for this user");
      }

      let slug = input.slug ?? slugify(input.businessName);

      if (!slug) {
        throw new Error("Could not generate a valid URL slug from that business name. Please provide a slug manually.");
      }

      // Check slug uniqueness
      const existingSlug = await db
        .select({ id: creator.id })
        .from(creator)
        .where(eq(creator.slug, slug))
        .limit(1);

      if (existingSlug.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const [newCreator] = await db
        .insert(creator)
        .values({
          userId: ctx.session.user.id,
          businessName: input.businessName,
          slug,
        })
        .returning();

      // Create default settings
      await db.insert(creatorSettings).values({
        creatorId: newCreator.id,
      });

      // Update user role to creator
      await db
        .update(user)
        .set({ role: "creator" })
        .where(eq(user.id, ctx.session.user.id));

      return newCreator;
    }),

  // Update creator profile
  updateProfile: creatorProcedure
    .input(
      z.object({
        businessName: z.string().min(1).max(200).optional(),
        logoUrl: z.string().optional(),
        brandColor: z.string().optional(),
        timezone: z.string().optional(),
        customDomain: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(creator)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(creator.id, ctx.creator.id))
        .returning();
      return updated;
    }),

  // Update creator settings (branding, integrations, etc.)
  updateSettings: creatorProcedure
    .input(
      z.object({
        emailFromName: z.string().optional(),
        emailReplyTo: z.string().email().optional(),
        checkoutLogo: z.string().optional(),
        checkoutAccentColor: z.string().optional(),
        metaPixelId: z.string().optional().nullable(),
        ga4Id: z.string().optional().nullable(),
        gtmId: z.string().optional().nullable(),
        tiktokPixelId: z.string().optional().nullable(),
        customHeadCode: z.string().optional(),
        customCss: z.string().optional(),
        brandSecondaryColor: z.string().optional(),
        fontFamily: z.string().optional(),
        faviconUrl: z.string().optional(),
        seoDefaults: z
          .object({
            metaTitle: z.string().optional(),
            metaDescription: z.string().optional(),
            ogImageUrl: z.string().optional(),
          })
          .optional(),
        checkoutTestimonials: z
          .array(
            z.object({
              name: z.string(),
              text: z.string(),
              imageUrl: z.string().optional(),
              role: z.string().optional(),
            }),
          )
          .optional(),
        checkoutGuaranteeBadge: z
          .object({
            enabled: z.boolean(),
            text: z.string(),
            days: z.number(),
          })
          .optional(),
        checkoutOrderBump: z
          .object({
            enabled: z.boolean(),
            title: z.string(),
            description: z.string(),
            priceId: z.string(),
            priceCents: z.number(),
          })
          .optional(),
        checkoutCustomFields: z
          .array(
            z.object({
              id: z.string(),
              label: z.string(),
              type: z.enum(["text", "select"]),
              required: z.boolean(),
              options: z.array(z.string()).optional(),
            }),
          )
          .optional(),
        gamificationEnabled: z.boolean().optional(),
        gamificationPointValues: z
          .object({
            post: z.number(),
            comment: z.number(),
            reaction_received: z.number(),
            lesson_completed: z.number(),
            course_completed: z.number(),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [existing] = await db
        .select()
        .from(creatorSettings)
        .where(eq(creatorSettings.creatorId, ctx.creator.id))
        .limit(1);

      if (existing) {
        const [updated] = await db
          .update(creatorSettings)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(creatorSettings.creatorId, ctx.creator.id))
          .returning();
        return updated;
      }

      const [created] = await db
        .insert(creatorSettings)
        .values({ creatorId: ctx.creator.id, ...input })
        .returning();
      return created;
    }),

  // Public: Get pixel/analytics settings for a creator (used in student-facing pages)
  getPixelSettings: protectedProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      const [settings] = await db
        .select({
          metaPixelId: creatorSettings.metaPixelId,
          ga4Id: creatorSettings.ga4Id,
          gtmId: creatorSettings.gtmId,
          tiktokPixelId: creatorSettings.tiktokPixelId,
        })
        .from(creatorSettings)
        .where(eq(creatorSettings.creatorId, input.creatorId))
        .limit(1);

      return settings ?? null;
    }),

  // Verify custom domain DNS (checks CNAME record)
  verifyDomain: creatorProcedure.mutation(async ({ ctx }) => {
    const domain = ctx.creator.customDomain;
    if (!domain) {
      return { verified: false, error: "No custom domain configured" };
    }

    try {
      // Use Node.js DNS module to resolve CNAME
      const { promises: dns } = await import("node:dns");
      const records = await dns.resolveCname(domain);
      const targetHost = "cname.apostle.tv";
      const isVerified = records.some(
        (record) => record.toLowerCase() === targetHost || record.toLowerCase() === `${targetHost}.`,
      );

      if (isVerified) {
        await db
          .update(creator)
          .set({
            domainVerified: true,
            domainVerifiedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(creator.id, ctx.creator.id));

        return { verified: true, records };
      }

      return {
        verified: false,
        error: `CNAME record found but does not point to ${targetHost}. Found: ${records.join(", ")}`,
        records,
      };
    } catch (err) {
      // Reset verified status if it was previously verified
      if (ctx.creator.domainVerified) {
        await db
          .update(creator)
          .set({ domainVerified: false, updatedAt: new Date() })
          .where(eq(creator.id, ctx.creator.id));
      }

      const message = err instanceof Error ? err.message : "DNS lookup failed";
      return { verified: false, error: `Could not resolve domain: ${message}` };
    }
  }),

  // Get domain status (for settings page)
  getDomainStatus: creatorProcedure.query(async ({ ctx }) => {
    return {
      customDomain: ctx.creator.customDomain,
      domainVerified: ctx.creator.domainVerified,
      domainVerifiedAt: ctx.creator.domainVerifiedAt,
      slug: ctx.creator.slug,
      subdomain: `${ctx.creator.slug}.apostle.tv`,
    };
  }),

  // Resolve creator by custom domain (used by tenant middleware)
  resolveByDomain: protectedProcedure
    .input(z.object({ domain: z.string() }))
    .query(async ({ input }) => {
      const [result] = await db
        .select({
          id: creator.id,
          slug: creator.slug,
          businessName: creator.businessName,
          domainVerified: creator.domainVerified,
        })
        .from(creator)
        .where(eq(creator.customDomain, input.domain))
        .limit(1);

      return result ?? null;
    }),

  // Toggle overage billing (integrates with Stripe metered subscriptions)
  toggleOverage: creatorProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // Sync with Stripe if subscription exists
      if (ctx.creator.stripeSubscriptionId) {
        if (input.enabled) {
          await enableOverageOnSubscription(ctx.creator.stripeSubscriptionId);
        } else {
          await disableOverageOnSubscription(ctx.creator.stripeSubscriptionId);
        }
      }

      const [updated] = await db
        .update(creator)
        .set({ overageEnabled: input.enabled, updatedAt: new Date() })
        .where(eq(creator.id, ctx.creator.id))
        .returning();
      return updated;
    }),
});
