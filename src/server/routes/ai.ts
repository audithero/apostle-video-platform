import { z } from "zod";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { generateOutline, expandLesson, generateQuiz, generateSummary, rewriteContent } from "@/lib/ai/course-generator";
import { generateCourseImage } from "@/lib/ai/image-generator";
import { creditLedgerService } from "@/lib/billing/credit-ledger";
import { usageTracker } from "@/lib/billing/usage-tracker";

export const aiRouter = createTRPCRouter({
  // Generate course outline
  generateOutline: creatorProcedure
    .input(
      z.object({
        topic: z.string().min(3).max(500),
        audience: z.string().min(3).max(500),
        level: z.enum(["beginner", "intermediate", "advanced"]),
        moduleCount: z.number().min(2).max(12),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check AI credits
      const balance = await creditLedgerService.getBalance(ctx.creator.id, "ai_course");
      if (balance < 1) {
        throw new Error("Insufficient AI course credits");
      }

      // Debit credit
      await creditLedgerService.debitCredit(
        ctx.creator.id,
        "ai_course",
        1,
        `Course outline: ${input.topic}`,
      );

      // Track usage
      await usageTracker.trackAiGeneration(ctx.creator.id, "outline");

      const outline = await generateOutline(input);
      return outline;
    }),

  // Expand a lesson into full content
  expandLesson: creatorProcedure
    .input(
      z.object({
        outlineContext: z.object({
          title: z.string(),
          description: z.string(),
          level: z.string(),
        }),
        lessonTitle: z.string(),
        lessonObjectives: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await usageTracker.trackAiGeneration(ctx.creator.id, "lesson_expand");

      const lesson = await expandLesson(input);
      return lesson;
    }),

  // Generate quiz for a lesson
  generateQuiz: creatorProcedure
    .input(
      z.object({
        lessonContent: z.string().min(10),
        questionCount: z.number().min(1).max(20).default(5),
        questionTypes: z
          .array(z.enum(["multiple_choice", "true_false", "short_answer"]))
          .default(["multiple_choice", "true_false"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const balance = await creditLedgerService.getBalance(ctx.creator.id, "ai_quiz");
      if (balance < 1) {
        throw new Error("Insufficient AI quiz credits");
      }

      await creditLedgerService.debitCredit(
        ctx.creator.id,
        "ai_quiz",
        1,
        "Quiz generation",
      );

      await usageTracker.trackAiGeneration(ctx.creator.id, "ai_quiz");

      const quiz = await generateQuiz(input);
      return quiz;
    }),

  // Generate course summary
  generateSummary: creatorProcedure
    .input(
      z.object({
        courseContent: z.string().min(10),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await usageTracker.trackAiGeneration(ctx.creator.id, "summary");
      const summary = await generateSummary(input);
      return summary;
    }),

  // Generate course image
  generateImage: creatorProcedure
    .input(
      z.object({
        description: z.string().min(3).max(500),
        aspectRatio: z.enum(["16:9", "4:3"]).default("16:9"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const balance = await creditLedgerService.getBalance(ctx.creator.id, "ai_image");
      if (balance < 1) {
        throw new Error("Insufficient AI image credits");
      }

      await creditLedgerService.debitCredit(
        ctx.creator.id,
        "ai_image",
        1,
        `Image: ${input.description.slice(0, 50)}`,
      );

      await usageTracker.trackAiGeneration(ctx.creator.id, "ai_image");

      const image = await generateCourseImage(input);
      return image;
    }),

  // Rewrite/enhance lesson content
  rewriteLesson: creatorProcedure
    .input(
      z.object({
        content: z.string().min(10),
        instruction: z.string().min(3).max(500),
        outlineContext: z.object({
          title: z.string(),
          description: z.string(),
          level: z.string(),
        }),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const balance = await creditLedgerService.getBalance(ctx.creator.id, "ai_rewrite");
      if (balance < 1) {
        throw new Error("Insufficient AI rewrite credits");
      }

      await creditLedgerService.debitCredit(
        ctx.creator.id,
        "ai_rewrite",
        1,
        "Lesson rewrite",
      );

      await usageTracker.trackAiGeneration(ctx.creator.id, "ai_rewrite");

      const rewritten = await rewriteContent(input);
      return rewritten;
    }),

  // Get AI credit balances
  getCredits: creatorProcedure.query(async ({ ctx }) => {
    const balances = await creditLedgerService.getAllBalances(ctx.creator.id);
    return balances;
  }),
});
