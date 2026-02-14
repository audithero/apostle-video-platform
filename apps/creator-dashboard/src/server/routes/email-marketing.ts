import { z } from "zod";
import { eq, and, desc, asc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import {
  emailSequence,
  emailSequenceStep,
  emailBroadcast,
} from "@/lib/db/schema/marketing";

export const emailMarketingRouter = createTRPCRouter({
  // === Sequences ===
  listSequences: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(emailSequence)
      .where(eq(emailSequence.creatorId, ctx.creator.id))
      .orderBy(desc(emailSequence.createdAt));
  }),

  getSequence: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [seq] = await db
        .select()
        .from(emailSequence)
        .where(and(eq(emailSequence.id, input.id), eq(emailSequence.creatorId, ctx.creator.id)))
        .limit(1);

      if (!seq) return null;

      const steps = await db
        .select()
        .from(emailSequenceStep)
        .where(eq(emailSequenceStep.sequenceId, seq.id))
        .orderBy(asc(emailSequenceStep.sortOrder));

      return { ...seq, steps };
    }),

  createSequence: creatorProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        triggerType: z.enum(["enrollment", "purchase", "tag_added", "manual"]),
        triggerCourseId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newSequence] = await db
        .insert(emailSequence)
        .values({
          creatorId: ctx.creator.id,
          name: input.name,
          triggerType: input.triggerType,
          triggerCourseId: input.triggerCourseId,
        })
        .returning();
      return newSequence;
    }),

  updateSequence: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        status: z.enum(["active", "paused", "draft"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(emailSequence)
        .set(updates)
        .where(and(eq(emailSequence.id, id), eq(emailSequence.creatorId, ctx.creator.id)))
        .returning();
      return updated;
    }),

  deleteSequence: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(emailSequence)
        .where(and(eq(emailSequence.id, input.id), eq(emailSequence.creatorId, ctx.creator.id)));
      return { success: true };
    }),

  // Sequence steps
  addStep: creatorProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        subject: z.string().min(1),
        bodyHtml: z.string().max(500_000).optional(),
        bodyJson: z.unknown().optional(),
        delayHours: z.number().min(0).default(24),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify sequence belongs to this creator
      const [seq] = await db
        .select({ id: emailSequence.id })
        .from(emailSequence)
        .where(and(eq(emailSequence.id, input.sequenceId), eq(emailSequence.creatorId, ctx.creator.id)))
        .limit(1);
      if (!seq) return null;

      const existing = await db
        .select({ sortOrder: emailSequenceStep.sortOrder })
        .from(emailSequenceStep)
        .where(eq(emailSequenceStep.sequenceId, input.sequenceId));

      const maxSort = existing.length > 0 ? Math.max(...existing.map((s) => s.sortOrder)) : -1;

      const [step] = await db
        .insert(emailSequenceStep)
        .values({
          sequenceId: input.sequenceId,
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyJson: input.bodyJson,
          delayHours: input.delayHours,
          sortOrder: maxSort + 1,
        })
        .returning();

      return step;
    }),

  updateStep: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string().optional(),
        bodyHtml: z.string().max(500_000).optional(),
        bodyJson: z.unknown().optional(),
        delayHours: z.number().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify step -> sequence belongs to this creator
      const [step] = await db
        .select({ sequenceId: emailSequenceStep.sequenceId })
        .from(emailSequenceStep)
        .where(eq(emailSequenceStep.id, input.id))
        .limit(1);
      if (!step) return null;

      const [seq] = await db
        .select({ id: emailSequence.id })
        .from(emailSequence)
        .where(and(eq(emailSequence.id, step.sequenceId), eq(emailSequence.creatorId, ctx.creator.id)))
        .limit(1);
      if (!seq) return null;

      const { id, ...updates } = input;
      const [updated] = await db
        .update(emailSequenceStep)
        .set(updates)
        .where(eq(emailSequenceStep.id, id))
        .returning();
      return updated;
    }),

  deleteStep: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify step -> sequence belongs to this creator
      const [step] = await db
        .select({ sequenceId: emailSequenceStep.sequenceId })
        .from(emailSequenceStep)
        .where(eq(emailSequenceStep.id, input.id))
        .limit(1);
      if (!step) return { success: false };

      const [seq] = await db
        .select({ id: emailSequence.id })
        .from(emailSequence)
        .where(and(eq(emailSequence.id, step.sequenceId), eq(emailSequence.creatorId, ctx.creator.id)))
        .limit(1);
      if (!seq) return { success: false };

      await db.delete(emailSequenceStep).where(eq(emailSequenceStep.id, input.id));
      return { success: true };
    }),

  reorderSteps: creatorProcedure
    .input(
      z.object({
        sequenceId: z.string(),
        items: z.array(z.object({ id: z.string(), sortOrder: z.number() })),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify sequence belongs to this creator
      const [seq] = await db
        .select({ id: emailSequence.id })
        .from(emailSequence)
        .where(and(eq(emailSequence.id, input.sequenceId), eq(emailSequence.creatorId, ctx.creator.id)))
        .limit(1);
      if (!seq) return { success: false };

      await Promise.all(
        input.items.map((item) =>
          db
            .update(emailSequenceStep)
            .set({ sortOrder: item.sortOrder })
            .where(and(eq(emailSequenceStep.id, item.id), eq(emailSequenceStep.sequenceId, input.sequenceId))),
        ),
      );
      return { success: true };
    }),

  // === Broadcasts ===
  listBroadcasts: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(emailBroadcast)
      .where(eq(emailBroadcast.creatorId, ctx.creator.id))
      .orderBy(desc(emailBroadcast.createdAt));
  }),

  getBroadcast: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [result] = await db
        .select()
        .from(emailBroadcast)
        .where(and(eq(emailBroadcast.id, input.id), eq(emailBroadcast.creatorId, ctx.creator.id)))
        .limit(1);
      return result ?? null;
    }),

  createBroadcast: creatorProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        bodyHtml: z.string().max(500_000).optional(),
        bodyJson: z.unknown().optional(),
        segmentFilter: z.record(z.string(), z.unknown()).optional(),
        scheduledAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [broadcast] = await db
        .insert(emailBroadcast)
        .values({
          creatorId: ctx.creator.id,
          subject: input.subject,
          bodyHtml: input.bodyHtml,
          bodyJson: input.bodyJson,
          segmentFilter: input.segmentFilter,
          status: input.scheduledAt ? "scheduled" : "draft",
          scheduledAt: input.scheduledAt,
        })
        .returning();
      return broadcast;
    }),

  updateBroadcast: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        subject: z.string().optional(),
        bodyHtml: z.string().max(500_000).optional(),
        bodyJson: z.unknown().optional(),
        segmentFilter: z.record(z.string(), z.unknown()).optional(),
        status: z.enum(["draft", "scheduled"]).optional(),
        scheduledAt: z.date().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input;
      const [updated] = await db
        .update(emailBroadcast)
        .set(updates)
        .where(and(eq(emailBroadcast.id, id), eq(emailBroadcast.creatorId, ctx.creator.id)))
        .returning();
      return updated;
    }),

  deleteBroadcast: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(emailBroadcast)
        .where(and(eq(emailBroadcast.id, input.id), eq(emailBroadcast.creatorId, ctx.creator.id)));
      return { success: true };
    }),
});
