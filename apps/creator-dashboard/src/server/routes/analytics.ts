import { z } from "zod";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { course, courseModule, lesson } from "@/lib/db/schema/course";
import { enrollment, lessonProgress, quizAttempt } from "@/lib/db/schema/enrollment";
import { user } from "@/lib/db/schema/auth";
import { monthlyUsage, creditLedger, avatarPack, usageEvent } from "@/lib/db/schema/billing";
import { TIER_LIMITS, FAIR_USE_CAPS } from "@/lib/billing/tier-limits";
import { getOverageSummary } from "@/lib/billing/stripe-metered";

const dateRangeInput = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const analyticsRouter = createTRPCRouter({
  // Dashboard overview stats
  overview: creatorProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const creatorId = ctx.creator.id;
      const startDate = input?.startDate ? new Date(input.startDate) : undefined;
      const endDate = input?.endDate ? new Date(input.endDate) : undefined;

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const enrollmentConditions = [eq(enrollment.creatorId, creatorId)];
      if (startDate) { enrollmentConditions.push(gte(enrollment.enrolledAt, startDate)); }
      if (endDate) { enrollmentConditions.push(lte(enrollment.enrolledAt, endDate)); }

      const completionConditions = [
        eq(enrollment.creatorId, creatorId),
        sql`${enrollment.completedAt} IS NOT NULL`,
      ];
      if (startDate) { completionConditions.push(gte(enrollment.enrolledAt, startDate)); }
      if (endDate) { completionConditions.push(lte(enrollment.enrolledAt, endDate)); }

      // Run all 4 queries in parallel instead of sequentially
      const [courseStats, enrollmentStats, monthlyEnrollments, completions] = await Promise.all([
        db.select({ count: count() }).from(course)
          .where(and(eq(course.creatorId, creatorId), eq(course.status, "published"))),
        db.select({ count: count() }).from(enrollment)
          .where(and(...enrollmentConditions)),
        db.select({ count: count() }).from(enrollment)
          .where(and(eq(enrollment.creatorId, creatorId), gte(enrollment.enrolledAt, monthStart))),
        db.select({ count: count() }).from(enrollment)
          .where(and(...completionConditions)),
      ]);

      return {
        totalCourses: courseStats.at(0)?.count ?? 0,
        totalEnrollments: enrollmentStats.at(0)?.count ?? 0,
        monthlyEnrollments: monthlyEnrollments.at(0)?.count ?? 0,
        totalCompletions: completions.at(0)?.count ?? 0,
      };
    }),

  // Enrollment trends (daily for last N days)
  enrollmentTrend: creatorProcedure
    .input(
      z.object({
        days: z.number().min(7).max(90).default(30),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = input.startDate
        ? new Date(input.startDate)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - input.days);
            return d;
          })();
      const endDate = input.endDate ? new Date(input.endDate) : new Date();

      const results = await db
        .select({
          date: sql<string>`DATE(${enrollment.enrolledAt})`,
          count: count(),
        })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            gte(enrollment.enrolledAt, startDate),
            lte(enrollment.enrolledAt, endDate),
          ),
        )
        .groupBy(sql`DATE(${enrollment.enrolledAt})`)
        .orderBy(sql`DATE(${enrollment.enrolledAt})`);

      return results;
    }),

  // Course completion rates
  courseCompletionRates: creatorProcedure.query(async ({ ctx }) => {
    const courses = await db
      .select({
        courseId: course.id,
        courseTitle: course.title,
        totalEnrollments: sql<number>`COUNT(DISTINCT ${enrollment.id})`,
        completedEnrollments: sql<number>`COUNT(DISTINCT CASE WHEN ${enrollment.completedAt} IS NOT NULL THEN ${enrollment.id} END)`,
      })
      .from(course)
      .leftJoin(enrollment, eq(course.id, enrollment.courseId))
      .where(eq(course.creatorId, ctx.creator.id))
      .groupBy(course.id, course.title)
      .orderBy(desc(sql`COUNT(DISTINCT ${enrollment.id})`));

    return courses.map((c) => ({
      courseId: c.courseId,
      courseTitle: c.courseTitle,
      totalEnrollments: Number(c.totalEnrollments),
      completedEnrollments: Number(c.completedEnrollments),
      completionRate:
        Number(c.totalEnrollments) > 0
          ? Math.round((Number(c.completedEnrollments) / Number(c.totalEnrollments)) * 100)
          : 0,
    }));
  }),

  // Recent activity feed
  recentActivity: creatorProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const recentEnrollments = await db
        .select({
          type: sql<string>`'enrollment'`,
          studentName: user.name,
          courseTitle: course.title,
          createdAt: enrollment.enrolledAt,
        })
        .from(enrollment)
        .innerJoin(user, eq(enrollment.studentId, user.id))
        .innerJoin(course, eq(enrollment.courseId, course.id))
        .where(eq(enrollment.creatorId, ctx.creator.id))
        .orderBy(desc(enrollment.enrolledAt))
        .limit(input.limit);

      return recentEnrollments.map((e) => ({
        type: "enrollment" as const,
        message: `${e.studentName} enrolled in ${e.courseTitle}`,
        createdAt: e.createdAt,
      }));
    }),

  // Student engagement (active students)
  activeStudents: creatorProcedure
    .input(z.object({ days: z.number().default(30) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const [result] = await db
        .select({
          count: sql<number>`COUNT(DISTINCT ${lessonProgress.enrollmentId})`,
        })
        .from(lessonProgress)
        .innerJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            gte(lessonProgress.lastAccessedAt, startDate),
          ),
        );

      return { activeStudents: result?.count ?? 0 };
    }),

  // Revenue overview -- aggregates revenue from enrollment data
  revenueOverview: creatorProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const creatorId = ctx.creator.id;
      const startDate = input?.startDate ? new Date(input.startDate) : undefined;
      const endDate = input?.endDate ? new Date(input.endDate) : undefined;

      const conditions = [
        eq(enrollment.creatorId, creatorId),
        sql`${course.priceCents} IS NOT NULL AND ${course.priceCents} > 0`,
      ];
      if (startDate) { conditions.push(gte(enrollment.enrolledAt, startDate)); }
      if (endDate) { conditions.push(lte(enrollment.enrolledAt, endDate)); }

      // Build previous period query if date range is provided
      const prevPeriodQuery = (startDate && endDate)
        ? (() => {
            const periodMs = endDate.getTime() - startDate.getTime();
            const prevStart = new Date(startDate.getTime() - periodMs);
            return db
              .select({ totalRevenue: sql<number>`COALESCE(SUM(${course.priceCents}), 0)` })
              .from(enrollment)
              .innerJoin(course, eq(enrollment.courseId, course.id))
              .where(and(
                eq(enrollment.creatorId, creatorId),
                sql`${course.priceCents} IS NOT NULL AND ${course.priceCents} > 0`,
                gte(enrollment.enrolledAt, prevStart),
                lte(enrollment.enrolledAt, startDate),
              ));
          })()
        : Promise.resolve([{ totalRevenue: 0 }]);

      // Run all 3 queries in parallel
      const [revenueResults, prevResults, activeResults] = await Promise.all([
        db.select({
          totalRevenue: sql<number>`COALESCE(SUM(${course.priceCents}), 0)`,
          totalTransactions: count(),
        }).from(enrollment).innerJoin(course, eq(enrollment.courseId, course.id)).where(and(...conditions)),
        prevPeriodQuery,
        db.select({
          count: sql<number>`COUNT(DISTINCT ${enrollment.studentId})`,
        }).from(enrollment).where(and(
          eq(enrollment.creatorId, creatorId),
          ...(startDate ? [gte(enrollment.enrolledAt, startDate)] : []),
          ...(endDate ? [lte(enrollment.enrolledAt, endDate)] : []),
        )),
      ]);

      const revenueResult = revenueResults.at(0);
      const currentRevenue = Number(revenueResult?.totalRevenue ?? 0);
      const prevRevenue = Number(prevResults.at(0)?.totalRevenue ?? 0);
      const revenueChange = prevRevenue > 0
        ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
        : 0;
      const activeStudents = Number(activeResults.at(0)?.count ?? 0);

      return {
        totalRevenueCents: currentRevenue,
        totalTransactions: revenueResult?.totalTransactions ?? 0,
        revenueChangePct: revenueChange,
        previousRevenueCents: prevRevenue,
        arpu: activeStudents > 0 ? Math.round(currentRevenue / activeStudents) : 0,
        activeStudents,
      };
    }),

  // Daily revenue trend
  revenueTrend: creatorProcedure
    .input(
      z.object({
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        days: z.number().min(7).max(365).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = input.startDate
        ? new Date(input.startDate)
        : (() => {
            const d = new Date();
            d.setDate(d.getDate() - input.days);
            return d;
          })();
      const endDate = input.endDate ? new Date(input.endDate) : new Date();

      const results = await db
        .select({
          date: sql<string>`DATE(${enrollment.enrolledAt})`,
          revenue: sql<number>`COALESCE(SUM(${course.priceCents}), 0)`,
          count: count(),
        })
        .from(enrollment)
        .innerJoin(course, eq(enrollment.courseId, course.id))
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            gte(enrollment.enrolledAt, startDate),
            lte(enrollment.enrolledAt, endDate),
            sql`${course.priceCents} IS NOT NULL AND ${course.priceCents} > 0`,
          ),
        )
        .groupBy(sql`DATE(${enrollment.enrolledAt})`)
        .orderBy(sql`DATE(${enrollment.enrolledAt})`);

      return results.map((r) => ({
        date: r.date,
        revenue: Number(r.revenue),
        transactions: r.count,
      }));
    }),

  // Revenue by course
  revenueByCourse: creatorProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(enrollment.creatorId, ctx.creator.id),
        sql`${course.priceCents} IS NOT NULL AND ${course.priceCents} > 0`,
      ];
      if (input?.startDate) { conditions.push(gte(enrollment.enrolledAt, new Date(input.startDate))); }
      if (input?.endDate) { conditions.push(lte(enrollment.enrolledAt, new Date(input.endDate))); }

      const results = await db
        .select({
          courseId: course.id,
          courseTitle: course.title,
          revenue: sql<number>`COALESCE(SUM(${course.priceCents}), 0)`,
          enrollments: count(),
          priceType: course.priceType,
        })
        .from(enrollment)
        .innerJoin(course, eq(enrollment.courseId, course.id))
        .where(and(...conditions))
        .groupBy(course.id, course.title, course.priceType)
        .orderBy(desc(sql`SUM(${course.priceCents})`));

      return results.map((r) => ({
        courseId: r.courseId,
        courseTitle: r.courseTitle,
        revenueCents: Number(r.revenue),
        enrollments: r.enrollments,
        priceType: r.priceType,
      }));
    }),

  // Revenue by type (paid vs subscription_only)
  revenueByType: creatorProcedure
    .input(dateRangeInput.optional())
    .query(async ({ ctx, input }) => {
      const conditions = [
        eq(enrollment.creatorId, ctx.creator.id),
        sql`${course.priceCents} IS NOT NULL AND ${course.priceCents} > 0`,
      ];
      if (input?.startDate) { conditions.push(gte(enrollment.enrolledAt, new Date(input.startDate))); }
      if (input?.endDate) { conditions.push(lte(enrollment.enrolledAt, new Date(input.endDate))); }

      const results = await db
        .select({
          priceType: course.priceType,
          revenue: sql<number>`COALESCE(SUM(${course.priceCents}), 0)`,
          count: count(),
        })
        .from(enrollment)
        .innerJoin(course, eq(enrollment.courseId, course.id))
        .where(and(...conditions))
        .groupBy(course.priceType);

      return results.map((r) => ({
        type: r.priceType ?? "paid",
        revenueCents: Number(r.revenue),
        count: r.count,
      }));
    }),

  // Current billing period usage (for dashboard + usage page)
  currentUsage: creatorProcedure.query(async ({ ctx }) => {
    const creatorId = ctx.creator.id;
    const tier = ctx.creator.tier;
    const overageEnabled = ctx.creator.overageEnabled;

    // Get current billing period (current month)
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Run all 3 queries in parallel
    const [usageResults, creditBalances, packs] = await Promise.all([
      db.select().from(monthlyUsage)
        .where(and(
          eq(monthlyUsage.creatorId, creatorId),
          gte(monthlyUsage.periodStart, periodStart),
          lte(monthlyUsage.periodEnd, periodEnd),
        )).limit(1),
      db.select({ creditType: creditLedger.creditType, balance: creditLedger.balanceAfter })
        .from(creditLedger)
        .where(eq(creditLedger.creatorId, creatorId))
        .orderBy(desc(creditLedger.createdAt))
        .limit(5),
      db.select({
        minutesTotal: sql<number>`COALESCE(SUM(${avatarPack.minutesTotal}), 0)`,
        minutesUsed: sql<number>`COALESCE(SUM(${avatarPack.minutesUsed}), 0)`,
      }).from(avatarPack)
        .where(and(
          eq(avatarPack.creatorId, creatorId),
          sql`(${avatarPack.expiresAt} IS NULL OR ${avatarPack.expiresAt} > NOW())`,
        )),
    ]);

    const usage = usageResults.at(0);

    // Deduplicate to latest per type
    const creditMap = new Map<string, number>();
    for (const entry of creditBalances) {
      if (!creditMap.has(entry.creditType)) {
        creditMap.set(entry.creditType, entry.balance);
      }
    }

    const avatarMinutes = {
      total: Number(packs.at(0)?.minutesTotal ?? 0),
      used: Number(packs.at(0)?.minutesUsed ?? 0),
    };

    // Tier limits from canonical source
    const tierKey = (["launch", "grow", "scale", "pro"].includes(tier) ? tier : "launch") as keyof typeof TIER_LIMITS;
    const tierLimits = TIER_LIMITS[tierKey];

    // Resolve effective limits (handle -1 = unlimited with fair use caps)
    const effectiveLimit = (val: number, fairUseKey?: string): number => {
      if (val === -1) return fairUseKey ? (FAIR_USE_CAPS[fairUseKey] ?? 999) : 999;
      return val;
    };

    return {
      tier,
      overageEnabled,
      billingPeriod: {
        start: periodStart,
        end: periodEnd,
      },
      metrics: {
        videoStorageHours: (usage?.videoStorageSeconds ?? 0) / 3600,
        activeStudents: usage?.activeStudents ?? 0,
        emailsSent: usage?.emailsSent ?? 0,
      },
      aiCredits: {
        course: {
          used: usage?.aiCourseGenerations ?? 0,
          total: creditMap.get("ai_course") ?? tierLimits.aiCourseGenerations,
        },
        rewrite: {
          used: usage?.aiLessonRewrites ?? 0,
          total: creditMap.get("ai_rewrite") ?? effectiveLimit(tierLimits.aiLessonRewrites, "aiLessonRewrites"),
        },
        image: {
          used: usage?.aiImageGenerations ?? 0,
          total: creditMap.get("ai_image") ?? tierLimits.aiImageGenerations,
        },
        quiz: {
          used: usage?.aiQuizGenerations ?? 0,
          total: creditMap.get("ai_quiz") ?? effectiveLimit(tierLimits.aiQuizGenerations, "aiQuizGenerations"),
        },
      },
      avatarMinutes,
      limits: {
        videoStorageHours: tierLimits.videoStorageSeconds / 3600,
        students: tierLimits.students,
        emails: tierLimits.emailsPerMonth,
        courses: tierLimits.courses,
        aiCourse: tierLimits.aiCourseGenerations,
        aiRewrite: effectiveLimit(tierLimits.aiLessonRewrites, "aiLessonRewrites"),
        aiImage: tierLimits.aiImageGenerations,
        aiQuiz: effectiveLimit(tierLimits.aiQuizGenerations, "aiQuizGenerations"),
      },
    };
  }),

  // Daily usage events for charts
  usageEventTrend: creatorProcedure
    .input(
      z.object({
        eventType: z.enum(["video_upload", "student_added", "email_sent", "ai_generation", "avatar_minute"]),
        days: z.number().min(7).max(90).default(30),
      }),
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const results = await db
        .select({
          date: sql<string>`DATE(${usageEvent.recordedAt})`,
          total: sql<number>`COALESCE(SUM(${usageEvent.quantity}), 0)`,
        })
        .from(usageEvent)
        .where(
          and(
            eq(usageEvent.creatorId, ctx.creator.id),
            eq(usageEvent.eventType, input.eventType),
            gte(usageEvent.recordedAt, startDate),
          ),
        )
        .groupBy(sql`DATE(${usageEvent.recordedAt})`)
        .orderBy(sql`DATE(${usageEvent.recordedAt})`);

      return results.map((r) => ({
        date: r.date,
        total: Number(r.total),
      }));
    }),

  // Weekly student growth for usage dashboard
  studentGrowth: creatorProcedure
    .input(z.object({ weeks: z.number().min(2).max(12).default(4) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.weeks * 7);

      const results = await db
        .select({
          week: sql<string>`TO_CHAR(${enrollment.enrolledAt}, 'IYYY-IW')`,
          newEnrollments: count(),
        })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            gte(enrollment.enrolledAt, startDate),
          ),
        )
        .groupBy(sql`TO_CHAR(${enrollment.enrolledAt}, 'IYYY-IW')`)
        .orderBy(sql`TO_CHAR(${enrollment.enrolledAt}, 'IYYY-IW')`);

      // Build cumulative totals
      const [totalResult] = await db
        .select({ count: count() })
        .from(enrollment)
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            lte(enrollment.enrolledAt, startDate),
          ),
        );

      let runningTotal = totalResult?.count ?? 0;
      return results.map((r, i) => {
        runningTotal += r.newEnrollments;
        return {
          week: `W${String(i + 1)}`,
          new: r.newEnrollments,
          total: runningTotal,
        };
      });
    }),

  // ---- Engagement Analytics (Task 10.2) ----

  // Average quiz scores per course
  averageQuizScores: creatorProcedure.query(async ({ ctx }) => {
    const results = await db
      .select({
        courseId: course.id,
        courseTitle: course.title,
        avgScore: sql<number>`COALESCE(AVG(${quizAttempt.scorePercent}), 0)`,
        totalAttempts: count(),
        passRate: sql<number>`COALESCE(
          ROUND(COUNT(CASE WHEN ${quizAttempt.passed} = true THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0)),
          0
        )`,
      })
      .from(quizAttempt)
      .innerJoin(enrollment, eq(quizAttempt.enrollmentId, enrollment.id))
      .innerJoin(course, eq(enrollment.courseId, course.id))
      .where(
        and(
          eq(enrollment.creatorId, ctx.creator.id),
          sql`${quizAttempt.completedAt} IS NOT NULL`,
        ),
      )
      .groupBy(course.id, course.title)
      .orderBy(desc(sql`AVG(${quizAttempt.scorePercent})`));

    return results.map((r) => ({
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      avgScore: Math.round(Number(r.avgScore) * 10) / 10,
      totalAttempts: r.totalAttempts,
      passRate: Number(r.passRate),
    }));
  }),

  // Lesson drop-off analysis: for each course, shows lesson completion rates in order
  lessonDropoff: creatorProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify course belongs to creator
      const [courseRow] = await db
        .select({ id: course.id, title: course.title })
        .from(course)
        .where(and(eq(course.id, input.courseId), eq(course.creatorId, ctx.creator.id)))
        .limit(1);

      if (!courseRow) {
        return { courseTitle: "", lessons: [] };
      }

      // Get total enrollments for the course
      const [enrollmentCount] = await db
        .select({ count: count() })
        .from(enrollment)
        .where(eq(enrollment.courseId, input.courseId));

      const totalEnrollments = enrollmentCount?.count ?? 0;

      if (totalEnrollments === 0) {
        return { courseTitle: courseRow.title, lessons: [] };
      }

      // Get lessons in order with their completion counts
      const lessons = await db
        .select({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          moduleTitle: courseModule.title,
          sortOrder: lesson.sortOrder,
          moduleSortOrder: courseModule.sortOrder,
          completedCount: sql<number>`COUNT(CASE WHEN ${lessonProgress.status} = 'completed' THEN 1 END)`,
          startedCount: sql<number>`COUNT(CASE WHEN ${lessonProgress.status} IN ('in_progress', 'completed') THEN 1 END)`,
        })
        .from(lesson)
        .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
        .leftJoin(lessonProgress, eq(lesson.id, lessonProgress.lessonId))
        .where(eq(courseModule.courseId, input.courseId))
        .groupBy(lesson.id, lesson.title, courseModule.title, lesson.sortOrder, courseModule.sortOrder)
        .orderBy(courseModule.sortOrder, lesson.sortOrder);

      return {
        courseTitle: courseRow.title,
        lessons: lessons.map((l) => ({
          lessonId: l.lessonId,
          lessonTitle: l.lessonTitle,
          moduleTitle: l.moduleTitle,
          completionRate: Math.round((Number(l.completedCount) / totalEnrollments) * 100),
          startRate: Math.round((Number(l.startedCount) / totalEnrollments) * 100),
        })),
      };
    }),

  // Time to complete courses
  timeToComplete: creatorProcedure.query(async ({ ctx }) => {
    const results = await db
      .select({
        courseId: course.id,
        courseTitle: course.title,
        avgDays: sql<number>`COALESCE(
          AVG(EXTRACT(EPOCH FROM (${enrollment.completedAt} - ${enrollment.enrolledAt})) / 86400),
          0
        )`,
        minDays: sql<number>`COALESCE(
          MIN(EXTRACT(EPOCH FROM (${enrollment.completedAt} - ${enrollment.enrolledAt})) / 86400),
          0
        )`,
        maxDays: sql<number>`COALESCE(
          MAX(EXTRACT(EPOCH FROM (${enrollment.completedAt} - ${enrollment.enrolledAt})) / 86400),
          0
        )`,
        completedCount: count(),
      })
      .from(enrollment)
      .innerJoin(course, eq(enrollment.courseId, course.id))
      .where(
        and(
          eq(enrollment.creatorId, ctx.creator.id),
          sql`${enrollment.completedAt} IS NOT NULL`,
        ),
      )
      .groupBy(course.id, course.title)
      .orderBy(course.title);

    return results.map((r) => ({
      courseId: r.courseId,
      courseTitle: r.courseTitle,
      avgDays: Math.round(Number(r.avgDays) * 10) / 10,
      minDays: Math.round(Number(r.minDays) * 10) / 10,
      maxDays: Math.round(Number(r.maxDays) * 10) / 10,
      completedStudents: r.completedCount,
    }));
  }),

  // Student activity heatmap: day-of-week x hour-of-day from lesson progress
  studentActivityHeatmap: creatorProcedure
    .input(z.object({ days: z.number().min(7).max(90).default(30) }))
    .query(async ({ ctx, input }) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const results = await db
        .select({
          dayOfWeek: sql<number>`EXTRACT(DOW FROM ${lessonProgress.lastAccessedAt})`,
          hourOfDay: sql<number>`EXTRACT(HOUR FROM ${lessonProgress.lastAccessedAt})`,
          activityCount: count(),
        })
        .from(lessonProgress)
        .innerJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
        .where(
          and(
            eq(enrollment.creatorId, ctx.creator.id),
            gte(lessonProgress.lastAccessedAt, startDate),
          ),
        )
        .groupBy(
          sql`EXTRACT(DOW FROM ${lessonProgress.lastAccessedAt})`,
          sql`EXTRACT(HOUR FROM ${lessonProgress.lastAccessedAt})`,
        );

      return results.map((r) => ({
        dayOfWeek: Number(r.dayOfWeek),
        hourOfDay: Number(r.hourOfDay),
        count: r.activityCount,
      }));
    }),

  // Overage billing summary (for usage page)
  overageSummary: creatorProcedure.query(async ({ ctx }) => {
    return getOverageSummary(ctx.creator.id);
  }),

  // ---- Content Performance Analytics (Task 10.3) ----

  // Lesson-level performance: views, avg watch time, engagement ratio, completion rate
  lessonPerformance: creatorProcedure
    .input(z.object({ courseId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(enrollment.creatorId, ctx.creator.id)];
      if (input.courseId) {
        conditions.push(eq(enrollment.courseId, input.courseId));
      }

      const results = await db
        .select({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          moduleTitle: courseModule.title,
          courseTitle: course.title,
          courseId: course.id,
          lessonType: lesson.lessonType,
          videoDurationSeconds: lesson.videoDurationSeconds,
          moduleSortOrder: courseModule.sortOrder,
          lessonSortOrder: lesson.sortOrder,
          totalViews: sql<number>`COUNT(${lessonProgress.id})`,
          completedCount: sql<number>`COUNT(CASE WHEN ${lessonProgress.status} = 'completed' THEN 1 END)`,
          avgWatchTimeSeconds: sql<number>`COALESCE(AVG(${lessonProgress.progressSeconds}), 0)`,
          totalWatchTimeSeconds: sql<number>`COALESCE(SUM(${lessonProgress.progressSeconds}), 0)`,
        })
        .from(lesson)
        .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
        .innerJoin(course, eq(courseModule.courseId, course.id))
        .leftJoin(
          lessonProgress,
          eq(lesson.id, lessonProgress.lessonId),
        )
        .leftJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
        .where(eq(course.creatorId, ctx.creator.id))
        .groupBy(
          lesson.id,
          lesson.title,
          courseModule.title,
          course.title,
          course.id,
          lesson.lessonType,
          lesson.videoDurationSeconds,
          courseModule.sortOrder,
          lesson.sortOrder,
        )
        .orderBy(desc(sql`COUNT(${lessonProgress.id})`));

      return results.map((r) => {
        const avgWatch = Number(r.avgWatchTimeSeconds);
        const duration = r.videoDurationSeconds ?? 0;
        const engagementRatio = duration > 0 ? Math.min(Math.round((avgWatch / duration) * 100), 100) : null;
        const completionRate = Number(r.totalViews) > 0
          ? Math.round((Number(r.completedCount) / Number(r.totalViews)) * 100)
          : 0;

        return {
          lessonId: r.lessonId,
          lessonTitle: r.lessonTitle,
          moduleTitle: r.moduleTitle,
          courseTitle: r.courseTitle,
          courseId: r.courseId,
          lessonType: r.lessonType,
          videoDurationSeconds: duration,
          totalViews: Number(r.totalViews),
          completedCount: Number(r.completedCount),
          completionRate,
          avgWatchTimeSeconds: Math.round(avgWatch),
          totalWatchTimeSeconds: Number(r.totalWatchTimeSeconds),
          engagementRatio,
        };
      });
    }),

  // Content ranking: lessons sorted by engagement score
  contentRanking: creatorProcedure
    .input(
      z.object({
        courseId: z.string().optional(),
        sortBy: z.enum(["views", "engagement", "completion", "watchTime"]).default("engagement"),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const results = await db
        .select({
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          courseTitle: course.title,
          courseId: course.id,
          lessonType: lesson.lessonType,
          videoDurationSeconds: lesson.videoDurationSeconds,
          totalViews: sql<number>`COUNT(${lessonProgress.id})`,
          completedCount: sql<number>`COUNT(CASE WHEN ${lessonProgress.status} = 'completed' THEN 1 END)`,
          avgWatchTimeSeconds: sql<number>`COALESCE(AVG(${lessonProgress.progressSeconds}), 0)`,
        })
        .from(lesson)
        .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
        .innerJoin(course, eq(courseModule.courseId, course.id))
        .leftJoin(lessonProgress, eq(lesson.id, lessonProgress.lessonId))
        .leftJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
        .where(
          input.courseId
            ? and(eq(course.creatorId, ctx.creator.id), eq(course.id, input.courseId))
            : eq(course.creatorId, ctx.creator.id),
        )
        .groupBy(
          lesson.id,
          lesson.title,
          course.title,
          course.id,
          lesson.lessonType,
          lesson.videoDurationSeconds,
        )
        .limit(input.limit);

      const ranked = results.map((r) => {
        const avgWatch = Number(r.avgWatchTimeSeconds);
        const duration = r.videoDurationSeconds ?? 0;
        const engagementRatio = duration > 0 ? Math.min(Math.round((avgWatch / duration) * 100), 100) : null;
        const completionRate = Number(r.totalViews) > 0
          ? Math.round((Number(r.completedCount) / Number(r.totalViews)) * 100)
          : 0;

        // Composite engagement score: weighted blend of views, completion, and engagement ratio
        const viewScore = Math.min(Number(r.totalViews) / 10, 100); // normalize views
        const engScore = engagementRatio ?? 0;
        const compScore = completionRate;
        const compositeScore = Math.round(viewScore * 0.2 + engScore * 0.4 + compScore * 0.4);

        return {
          lessonId: r.lessonId,
          lessonTitle: r.lessonTitle,
          courseTitle: r.courseTitle,
          courseId: r.courseId,
          lessonType: r.lessonType,
          totalViews: Number(r.totalViews),
          completionRate,
          avgWatchTimeSeconds: Math.round(avgWatch),
          engagementRatio,
          compositeScore,
        };
      });

      // Sort by requested criteria
      switch (input.sortBy) {
        case "views": ranked.sort((a, b) => b.totalViews - a.totalViews); break;
        case "completion": ranked.sort((a, b) => b.completionRate - a.completionRate); break;
        case "watchTime": ranked.sort((a, b) => b.avgWatchTimeSeconds - a.avgWatchTimeSeconds); break;
        default: ranked.sort((a, b) => b.compositeScore - a.compositeScore); break;
      }

      return ranked;
    }),

  // Problem content: flag lessons with high drop-off or low engagement
  problemContent: creatorProcedure.query(async ({ ctx }) => {
    // Get all lessons with their metrics
    const results = await db
      .select({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        courseTitle: course.title,
        courseId: course.id,
        moduleTitle: courseModule.title,
        lessonType: lesson.lessonType,
        videoDurationSeconds: lesson.videoDurationSeconds,
        moduleSortOrder: courseModule.sortOrder,
        lessonSortOrder: lesson.sortOrder,
        totalViews: sql<number>`COUNT(${lessonProgress.id})`,
        completedCount: sql<number>`COUNT(CASE WHEN ${lessonProgress.status} = 'completed' THEN 1 END)`,
        avgWatchTimeSeconds: sql<number>`COALESCE(AVG(${lessonProgress.progressSeconds}), 0)`,
      })
      .from(lesson)
      .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
      .innerJoin(course, eq(courseModule.courseId, course.id))
      .leftJoin(lessonProgress, eq(lesson.id, lessonProgress.lessonId))
      .leftJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
      .where(eq(course.creatorId, ctx.creator.id))
      .groupBy(
        lesson.id,
        lesson.title,
        course.title,
        course.id,
        courseModule.title,
        lesson.lessonType,
        lesson.videoDurationSeconds,
        courseModule.sortOrder,
        lesson.sortOrder,
      )
      .having(sql`COUNT(${lessonProgress.id}) >= 3`); // Only flag if enough data

    const problems: Array<{
      lessonId: string;
      lessonTitle: string;
      courseTitle: string;
      courseId: string;
      moduleTitle: string;
      issues: string[];
      severity: "warning" | "critical";
      completionRate: number;
      engagementRatio: number | null;
      totalViews: number;
    }> = [];

    for (const r of results) {
      const issues: string[] = [];
      const views = Number(r.totalViews);
      const completed = Number(r.completedCount);
      const completionRate = views > 0 ? Math.round((completed / views) * 100) : 0;
      const avgWatch = Number(r.avgWatchTimeSeconds);
      const duration = r.videoDurationSeconds ?? 0;
      const engagementRatio = duration > 0 ? Math.min(Math.round((avgWatch / duration) * 100), 100) : null;

      // Flag: very low completion rate (< 30%)
      if (completionRate < 30) {
        issues.push(`Low completion rate (${completionRate}%)`);
      }

      // Flag: low engagement ratio for videos (< 40%)
      if (engagementRatio !== null && engagementRatio < 40) {
        issues.push(`Low engagement ratio (${engagementRatio}%)`);
      }

      // Flag: significant drop-off from previous lesson (detected by order)
      // This is a simplified check - viewers started but didn't complete
      if (views > 0 && completed === 0) {
        issues.push("No students completed this lesson");
      }

      if (issues.length > 0) {
        const severity = completionRate < 15 || (engagementRatio !== null && engagementRatio < 20)
          ? "critical"
          : "warning";

        problems.push({
          lessonId: r.lessonId,
          lessonTitle: r.lessonTitle,
          courseTitle: r.courseTitle,
          courseId: r.courseId,
          moduleTitle: r.moduleTitle,
          issues,
          severity,
          completionRate,
          engagementRatio,
          totalViews: views,
        });
      }
    }

    // Sort critical first, then by completion rate ascending
    problems.sort((a, b) => {
      if (a.severity !== b.severity) {
        return a.severity === "critical" ? -1 : 1;
      }
      return a.completionRate - b.completionRate;
    });

    return problems;
  }),

  // Engagement summary: overall engagement metrics
  engagementSummary: creatorProcedure.query(async ({ ctx }) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Run all 4 queries in parallel
    const [completionResults, quizResults, timeResults, recentResults] = await Promise.all([
      db.select({
        totalEnrollments: count(),
        completedCount: sql<number>`COUNT(CASE WHEN ${enrollment.completedAt} IS NOT NULL THEN 1 END)`,
      }).from(enrollment).where(eq(enrollment.creatorId, ctx.creator.id)),
      db.select({
        avgScore: sql<number>`COALESCE(AVG(${quizAttempt.scorePercent}), 0)`,
        totalAttempts: count(),
      }).from(quizAttempt)
        .innerJoin(enrollment, eq(quizAttempt.enrollmentId, enrollment.id))
        .where(and(eq(enrollment.creatorId, ctx.creator.id), sql`${quizAttempt.completedAt} IS NOT NULL`)),
      db.select({
        avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (${enrollment.completedAt} - ${enrollment.enrolledAt})) / 86400), 0)`,
      }).from(enrollment)
        .where(and(eq(enrollment.creatorId, ctx.creator.id), sql`${enrollment.completedAt} IS NOT NULL`)),
      db.select({ count: count() }).from(lessonProgress)
        .innerJoin(enrollment, eq(lessonProgress.enrollmentId, enrollment.id))
        .where(and(
          eq(enrollment.creatorId, ctx.creator.id),
          eq(lessonProgress.status, "completed"),
          gte(lessonProgress.completedAt, thirtyDaysAgo),
        )),
    ]);

    const completionResult = completionResults.at(0);
    const totalEnrollments = completionResult?.totalEnrollments ?? 0;
    const completedCount = Number(completionResult?.completedCount ?? 0);
    const quizResult = quizResults.at(0);
    const timeResult = timeResults.at(0);

    return {
      overallCompletionRate: totalEnrollments > 0
        ? Math.round((completedCount / totalEnrollments) * 100)
        : 0,
      avgQuizScore: Math.round(Number(quizResult?.avgScore ?? 0) * 10) / 10,
      totalQuizAttempts: quizResult?.totalAttempts ?? 0,
      avgTimeToCompleteDays: Math.round(Number(timeResult?.avgDays ?? 0) * 10) / 10,
      lessonsCompletedLast30Days: recentResults.at(0)?.count ?? 0,
    };
  }),
});
