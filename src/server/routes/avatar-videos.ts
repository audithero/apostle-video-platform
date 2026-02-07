import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import Stripe from "stripe";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { avatarPack } from "@/lib/db/schema/billing";
import { createHeyGenClient } from "@/lib/heygen/client";
import { packBilling } from "@/lib/heygen/pack-billing";
import { env } from "@/lib/env.server";

const heygenClient = createHeyGenClient({ apiKey: env.HEYGEN_API_KEY ?? "" });

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

const PACK_CONFIG = {
  starter: { minutes: 10, priceCents: 25_00, label: "Starter" },
  creator: { minutes: 30, priceCents: 60_00, label: "Creator" },
  pro: { minutes: 60, priceCents: 99_00, label: "Pro" },
  studio: { minutes: 120, priceCents: 179_00, label: "Studio" },
} as const;

export const avatarVideosRouter = createTRPCRouter({
  // List available avatars
  listAvatars: creatorProcedure.query(async () => {
    const avatars = await heygenClient.listAvatars();
    return avatars;
  }),

  // List available voices
  listVoices: creatorProcedure.query(async () => {
    const voices = await heygenClient.listVoices();
    return voices;
  }),

  // Estimate cost for a script
  estimateCost: creatorProcedure
    .input(
      z.object({
        script: z.string().min(1),
      }),
    )
    .query(({ input }) => {
      const estimatedMinutes = heygenClient.estimateDurationMinutes(input.script);
      return { estimatedMinutes };
    }),

  // Get balance (FIFO across packs)
  getBalance: creatorProcedure.query(async ({ ctx }) => {
    const balance = await packBilling.getBalance(ctx.creator.id);
    return { balance };
  }),

  // Generate avatar video for a lesson
  generate: creatorProcedure
    .input(
      z.object({
        lessonId: z.string(),
        avatarId: z.string(),
        voiceId: z.string(),
        script: z.string().min(1).max(10_000),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const balance = await packBilling.getBalance(ctx.creator.id);
      const estimatedMinutes = heygenClient.estimateDurationMinutes(input.script);

      if (balance < estimatedMinutes) {
        throw new Error(
          `Insufficient avatar minutes. Need ${String(estimatedMinutes)}, have ${String(balance)}.`,
        );
      }

      // FIFO debit from oldest pack first
      await packBilling.debitMinutes(ctx.creator.id, estimatedMinutes);

      const result = await heygenClient.generateVideo({
        avatar_id: input.avatarId,
        voice_id: input.voiceId,
        script: input.script,
        title: input.title,
        dimension: { width: 1920, height: 1080 },
      });

      return {
        videoId: result.video_id,
        status: result.status,
        estimatedMinutes,
      };
    }),

  // Check video generation status
  getStatus: creatorProcedure
    .input(z.object({ videoId: z.string() }))
    .query(async ({ input }) => {
      const status = await heygenClient.getVideoStatus(input.videoId);
      return status;
    }),

  // Get avatar packs for creator (purchase history)
  getPacks: creatorProcedure.query(async ({ ctx }) => {
    const packs = await db
      .select()
      .from(avatarPack)
      .where(eq(avatarPack.creatorId, ctx.creator.id))
      .orderBy(desc(avatarPack.purchasedAt));
    return packs;
  }),

  // Create Stripe Checkout session for avatar pack purchase
  createCheckout: creatorProcedure
    .input(
      z.object({
        packType: z.enum(["starter", "creator", "pro", "studio"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const pack = PACK_CONFIG[input.packType];

      const session = await stripeClient.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${pack.label} Avatar Pack`,
                description: `${String(pack.minutes)} HeyGen avatar minutes`,
              },
              unit_amount: pack.priceCents,
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: "avatar_pack",
          creatorId: ctx.creator.id,
          packType: input.packType,
          minutes: String(pack.minutes),
        },
        success_url: `${env.SERVER_URL}/dashboard/avatar-packs?success=true&pack=${input.packType}`,
        cancel_url: `${env.SERVER_URL}/dashboard/avatar-packs?cancelled=true`,
        customer_email: ctx.session.user.email,
      });

      return { checkoutUrl: session.url };
    }),

  // Fulfill avatar pack after successful Stripe payment
  fulfillPack: creatorProcedure
    .input(
      z.object({
        packType: z.enum(["starter", "creator", "pro", "studio"]),
        stripePaymentId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const newPack = await packBilling.purchasePack(
        ctx.creator.id,
        input.packType,
        input.stripePaymentId ?? "",
      );

      return newPack;
    }),
});
