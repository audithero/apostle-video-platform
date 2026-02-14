import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { webhookConfig, webhookLog } from "@/lib/db/schema/marketing";
import { randomBytes } from "node:crypto";
import { validateWebhookUrl } from "@/lib/integrations/webhook-url-validation";

const WEBHOOK_EVENT_TYPES = [
  "enrollment.created",
  "enrollment.completed",
  "payment.succeeded",
  "payment.failed",
  "student.created",
  "quiz.completed",
  "certificate.issued",
] as const;

export const webhooksRouter = createTRPCRouter({
  // List webhook configs for creator
  list: creatorProcedure.query(async ({ ctx }) => {
    const configs = await db
      .select()
      .from(webhookConfig)
      .where(eq(webhookConfig.creatorId, ctx.creator.id))
      .orderBy(desc(webhookConfig.createdAt));
    return configs;
  }),

  // Create a new webhook config
  create: creatorProcedure
    .input(
      z.object({
        url: z.string().url(),
        events: z.array(z.string()).min(1),
        secret: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        validateWebhookUrl(input.url);
      } catch (err) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err instanceof Error ? err.message : "Invalid webhook URL",
        });
      }

      const secret = input.secret ?? randomBytes(32).toString("hex");
      const [config] = await db
        .insert(webhookConfig)
        .values({
          creatorId: ctx.creator.id,
          url: input.url,
          events: input.events,
          secret,
          active: true,
        })
        .returning();
      return config;
    }),

  // Update a webhook config
  update: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        url: z.string().url().optional(),
        events: z.array(z.string()).min(1).optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.url) {
        try {
          validateWebhookUrl(input.url);
        } catch (err) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: err instanceof Error ? err.message : "Invalid webhook URL",
          });
        }
      }

      const { id, ...updates } = input;
      const [updated] = await db
        .update(webhookConfig)
        .set(updates)
        .where(
          and(
            eq(webhookConfig.id, id),
            eq(webhookConfig.creatorId, ctx.creator.id),
          ),
        )
        .returning();
      return updated;
    }),

  // Delete a webhook config
  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(webhookConfig)
        .where(
          and(
            eq(webhookConfig.id, input.id),
            eq(webhookConfig.creatorId, ctx.creator.id),
          ),
        );
      return { success: true };
    }),

  // Get recent delivery logs for a webhook config
  getLogs: creatorProcedure
    .input(
      z.object({
        webhookConfigId: z.string(),
        limit: z.number().min(1).max(100).default(50),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const [config] = await db
        .select({ id: webhookConfig.id })
        .from(webhookConfig)
        .where(
          and(
            eq(webhookConfig.id, input.webhookConfigId),
            eq(webhookConfig.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!config) return [];

      const logs = await db
        .select()
        .from(webhookLog)
        .where(eq(webhookLog.webhookConfigId, input.webhookConfigId))
        .orderBy(desc(webhookLog.deliveredAt))
        .limit(input.limit);

      return logs;
    }),

  // Get all recent logs across all webhooks for this creator
  getRecentLogs: creatorProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const logs = await db
        .select({
          log: webhookLog,
          webhookUrl: webhookConfig.url,
        })
        .from(webhookLog)
        .innerJoin(webhookConfig, eq(webhookLog.webhookConfigId, webhookConfig.id))
        .where(eq(webhookConfig.creatorId, ctx.creator.id))
        .orderBy(desc(webhookLog.deliveredAt))
        .limit(input.limit);

      return logs;
    }),

  // Regenerate secret for a webhook config
  regenerateSecret: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const newSecret = randomBytes(32).toString("hex");
      const [updated] = await db
        .update(webhookConfig)
        .set({ secret: newSecret })
        .where(
          and(
            eq(webhookConfig.id, input.id),
            eq(webhookConfig.creatorId, ctx.creator.id),
          ),
        )
        .returning();
      return updated;
    }),

  // Get available event types
  getEventTypes: creatorProcedure.query(() => {
    return WEBHOOK_EVENT_TYPES.map((type) => ({
      value: type,
      label: type
        .split(".")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(" "),
    }));
  }),
});
