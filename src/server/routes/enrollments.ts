import { z } from "zod";
import { eq, and, desc, asc, count, max, sql, like, or, inArray } from "drizzle-orm";
import { createTRPCRouter, creatorProcedure, protectedProcedure } from "@/lib/trpc/init";
import { db } from "@/lib/db";
import { course, courseModule, lesson, quiz, quizQuestion } from "@/lib/db/schema/course";
import { enrollment, lessonProgress, quizAttempt, studentNote } from "@/lib/db/schema/enrollment";
import { creator } from "@/lib/db/schema/creator";
import { user } from "@/lib/db/schema/auth";

export const enrollmentsRouter = createTRPCRouter({
  // Student: Get my enrollments with progress + creator info
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        enrollment: enrollment,
        courseTitle: course.title,
        courseSlug: course.slug,
        courseThumbnail: course.thumbnailUrl,
        courseId: course.id,
        creatorName: creator.businessName,
        creatorAvatarUrl: creator.logoUrl,
      })
      .from(enrollment)
      .innerJoin(course, eq(enrollment.courseId, course.id))
      .innerJoin(creator, eq(enrollment.creatorId, creator.id))
      .where(eq(enrollment.studentId, ctx.session.user.id))
      .orderBy(desc(enrollment.enrolledAt));

    // Enrich each enrollment with lesson counts and progress
    const enriched = await Promise.all(
      rows.map(async (row) => {
        const [lessonCount] = await db
          .select({ count: count() })
          .from(lesson)
          .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
          .where(eq(courseModule.courseId, row.courseId));

        const [completedCount] = await db
          .select({ count: count() })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.enrollmentId, row.enrollment.id),
              eq(lessonProgress.status, "completed"),
            ),
          );

        const [lastAccess] = await db
          .select({ lastAt: max(lessonProgress.lastAccessedAt) })
          .from(lessonProgress)
          .where(eq(lessonProgress.enrollmentId, row.enrollment.id));

        const totalLessons = lessonCount?.count ?? 0;
        const completedLessons = completedCount?.count ?? 0;

        return {
          id: row.enrollment.id,
          courseId: row.courseId,
          title: row.courseTitle,
          slug: row.courseSlug,
          thumbnailUrl: row.courseThumbnail,
          creatorName: row.creatorName,
          creatorAvatarUrl: row.creatorAvatarUrl,
          totalLessons,
          completedLessons,
          progressPercent:
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0,
          lastAccessedAt: lastAccess?.lastAt ?? row.enrollment.enrolledAt,
          enrolledAt: row.enrollment.enrolledAt,
          completedAt: row.enrollment.completedAt,
        };
      }),
    );

    return enriched;
  }),

  // Student: Get a single course with full module/lesson tree + progress (for course player)
  getStudentCourse: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify enrollment
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      // Get the course with creator info
      const [courseData] = await db
        .select({
          id: course.id,
          title: course.title,
          slug: course.slug,
          courseType: course.courseType,
          dripIntervalDays: course.dripIntervalDays,
          creatorId: course.creatorId,
          creatorName: creator.businessName,
        })
        .from(course)
        .innerJoin(creator, eq(course.creatorId, creator.id))
        .where(eq(course.id, input.courseId))
        .limit(1);

      if (!courseData) return null;

      // Get modules with lessons
      const modules = await db
        .select()
        .from(courseModule)
        .where(eq(courseModule.courseId, input.courseId))
        .orderBy(asc(courseModule.sortOrder));

      const modulesWithLessons = await Promise.all(
        modules.map(async (mod) => {
          const lessons_ = await db
            .select()
            .from(lesson)
            .where(eq(lesson.moduleId, mod.id))
            .orderBy(asc(lesson.sortOrder));
          return { ...mod, lessons: lessons_ };
        }),
      );

      // Get all lesson progress for this enrollment
      const progress = await db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, enroll.id));

      const progressMap = new Map(progress.map((p) => [p.lessonId, p]));

      // Compute drip lock status for modules
      const enrolledAt = enroll.enrolledAt;
      const now = new Date();

      const enrichedModules = modulesWithLessons.map((mod) => {
        let isLocked = false;
        let unlockDate: Date | null = null;

        if (
          courseData.courseType === "drip" &&
          mod.dripDelayDays &&
          mod.dripDelayDays > 0
        ) {
          const unlock = new Date(enrolledAt);
          unlock.setDate(unlock.getDate() + mod.dripDelayDays);
          if (now < unlock) {
            isLocked = true;
            unlockDate = unlock;
          }
        }

        if (mod.dripDate && now < mod.dripDate) {
          isLocked = true;
          unlockDate = mod.dripDate;
        }

        return {
          id: mod.id,
          title: mod.title,
          sortOrder: mod.sortOrder,
          isLocked,
          unlockDate,
          lessons: mod.lessons.map((les) => {
            const prog = progressMap.get(les.id);
            return {
              id: les.id,
              title: les.title,
              lessonType: les.lessonType,
              videoDurationSeconds: les.videoDurationSeconds,
              videoUrl: les.videoUrl,
              contentHtml: les.contentHtml,
              isFreePreview: les.isFreePreview,
              isCompleted: prog?.status === "completed",
              progressSeconds: prog?.progressSeconds ?? 0,
              status: (prog?.status ?? "not_started") as
                | "not_started"
                | "in_progress"
                | "completed",
            };
          }),
        };
      });

      return {
        ...courseData,
        enrollmentId: enroll.id,
        enrolledAt: enroll.enrolledAt,
        completedAt: enroll.completedAt,
        certificateSerial: enroll.certificateSerial,
        certificatePdfUrl: enroll.certificatePdfUrl,
        modules: enrichedModules,
      };
    }),

  // Student: Get enrollment progress for a course
  getCourseProgress: protectedProcedure
    .input(z.object({ courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      const progress = await db
        .select()
        .from(lessonProgress)
        .where(eq(lessonProgress.enrollmentId, enroll.id));

      const totalLessons = await db
        .select({ count: count() })
        .from(lesson)
        .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
        .where(eq(courseModule.courseId, input.courseId));

      const completedLessons = progress.filter((p) => p.status === "completed").length;
      const total = totalLessons.at(0)?.count ?? 0;

      return {
        enrollment: enroll,
        lessonProgress: progress,
        completedLessons,
        totalLessons: total,
        percentComplete: total > 0 ? Math.round((completedLessons / total) * 100) : 0,
      };
    }),

  // Student: Save lesson progress
  saveLessonProgress: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        lessonId: z.string(),
        progressSeconds: z.number().optional(),
        status: z.enum(["not_started", "in_progress", "completed"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      const [existing] = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.enrollmentId, enroll.id),
            eq(lessonProgress.lessonId, input.lessonId),
          ),
        )
        .limit(1);

      if (existing) {
        const updates: Record<string, unknown> = {
          lastAccessedAt: new Date(),
        };
        if (input.progressSeconds !== undefined) {
          updates.progressSeconds = input.progressSeconds;
        }
        if (input.status) {
          updates.status = input.status;
          if (input.status === "completed") {
            updates.completedAt = new Date();
          }
        }

        const [updated] = await db
          .update(lessonProgress)
          .set(updates)
          .where(eq(lessonProgress.id, existing.id))
          .returning();

        // Auto-check course completion when a lesson is marked complete
        if (input.status === "completed" && !enroll.completedAt) {
          const [totalLessonsCount] = await db
            .select({ count: count() })
            .from(lesson)
            .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
            .where(eq(courseModule.courseId, input.courseId));

          const [completedLessonsCount] = await db
            .select({ count: count() })
            .from(lessonProgress)
            .where(
              and(
                eq(lessonProgress.enrollmentId, enroll.id),
                eq(lessonProgress.status, "completed"),
              ),
            );

          if (
            totalLessonsCount &&
            completedLessonsCount &&
            totalLessonsCount.count > 0 &&
            completedLessonsCount.count >= totalLessonsCount.count
          ) {
            await db
              .update(enrollment)
              .set({ completedAt: new Date() })
              .where(eq(enrollment.id, enroll.id));
          }
        }

        return updated;
      }

      const [created] = await db
        .insert(lessonProgress)
        .values({
          enrollmentId: enroll.id,
          lessonId: input.lessonId,
          progressSeconds: input.progressSeconds ?? 0,
          status: input.status ?? "in_progress",
          completedAt: input.status === "completed" ? new Date() : null,
        })
        .returning();

      // Auto-check course completion when a lesson is marked complete
      if (input.status === "completed" && !enroll.completedAt) {
        const [totalLessons] = await db
          .select({ count: count() })
          .from(lesson)
          .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
          .where(eq(courseModule.courseId, input.courseId));

        const [completedLessons] = await db
          .select({ count: count() })
          .from(lessonProgress)
          .where(
            and(
              eq(lessonProgress.enrollmentId, enroll.id),
              eq(lessonProgress.status, "completed"),
            ),
          );

        if (
          totalLessons &&
          completedLessons &&
          totalLessons.count > 0 &&
          completedLessons.count >= totalLessons.count
        ) {
          await db
            .update(enrollment)
            .set({ completedAt: new Date() })
            .where(eq(enrollment.id, enroll.id));
        }
      }

      return created;
    }),

  // Student: Submit quiz attempt
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        quizId: z.string(),
        answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      const [attempt] = await db
        .insert(quizAttempt)
        .values({
          enrollmentId: enroll.id,
          quizId: input.quizId,
          answers: input.answers,
          completedAt: new Date(),
        })
        .returning();

      return attempt;
    }),

  // Creator: Enroll a student
  enrollStudent: creatorProcedure
    .input(
      z.object({
        studentId: z.string(),
        courseId: z.string(),
        source: z.enum(["direct", "affiliate", "import"]).default("direct"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [newEnrollment] = await db
        .insert(enrollment)
        .values({
          studentId: input.studentId,
          courseId: input.courseId,
          creatorId: ctx.creator.id,
          source: input.source,
        })
        .onConflictDoNothing()
        .returning();

      return newEnrollment;
    }),

  // Creator: List enrollments for a course
  listByCourse: creatorProcedure
    .input(
      z.object({
        courseId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const enrollments = await db
        .select({
          enrollment: enrollment,
          studentName: user.name,
          studentEmail: user.email,
        })
        .from(enrollment)
        .innerJoin(user, eq(enrollment.studentId, user.id))
        .where(
          and(
            eq(enrollment.courseId, input.courseId),
            eq(enrollment.creatorId, ctx.creator.id),
          ),
        )
        .orderBy(desc(enrollment.enrolledAt))
        .limit(input.limit + 1);

      const hasMore = enrollments.length > input.limit;
      if (hasMore) enrollments.pop();

      return { enrollments, hasMore };
    }),

  // Student: Save note
  saveNote: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        lessonId: z.string(),
        content: z.string().min(1),
        timestampSeconds: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      const [note] = await db
        .insert(studentNote)
        .values({
          enrollmentId: enroll.id,
          lessonId: input.lessonId,
          content: input.content,
          timestampSeconds: input.timestampSeconds,
        })
        .returning();

      return note;
    }),

  // Student: Get notes for a lesson
  getNotes: protectedProcedure
    .input(z.object({ courseId: z.string(), lessonId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return [];

      return db
        .select()
        .from(studentNote)
        .where(
          and(
            eq(studentNote.enrollmentId, enroll.id),
            eq(studentNote.lessonId, input.lessonId),
          ),
        )
        .orderBy(asc(studentNote.createdAt));
    }),

  // Student: Delete a note
  deleteNote: protectedProcedure
    .input(z.object({ noteId: z.string(), courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      const [note] = await db
        .select()
        .from(studentNote)
        .where(
          and(
            eq(studentNote.id, input.noteId),
            eq(studentNote.enrollmentId, enroll.id),
          ),
        )
        .limit(1);

      if (!note) return null;

      await db.delete(studentNote).where(eq(studentNote.id, input.noteId));
      return { success: true };
    }),

  // Student: Get quiz with questions (excludes correctAnswer for active quiz)
  getQuizForStudent: protectedProcedure
    .input(z.object({ lessonId: z.string() }))
    .query(async ({ input }) => {
      const [quizRecord] = await db
        .select()
        .from(quiz)
        .where(eq(quiz.lessonId, input.lessonId))
        .limit(1);

      if (!quizRecord) return null;

      const questions = await db
        .select({
          id: quizQuestion.id,
          questionText: quizQuestion.questionText,
          questionType: quizQuestion.questionType,
          options: quizQuestion.options,
          sortOrder: quizQuestion.sortOrder,
          points: quizQuestion.points,
        })
        .from(quizQuestion)
        .where(eq(quizQuestion.quizId, quizRecord.id))
        .orderBy(asc(quizQuestion.sortOrder));

      return { ...quizRecord, questions };
    }),

  // Student: Get quiz attempts for retry logic
  getQuizAttempts: protectedProcedure
    .input(z.object({ courseId: z.string(), quizId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return [];

      return db
        .select()
        .from(quizAttempt)
        .where(
          and(
            eq(quizAttempt.enrollmentId, enroll.id),
            eq(quizAttempt.quizId, input.quizId),
          ),
        )
        .orderBy(desc(quizAttempt.completedAt));
    }),

  // Student: Submit quiz with server-side scoring
  submitQuizWithScoring: protectedProcedure
    .input(
      z.object({
        courseId: z.string(),
        quizId: z.string(),
        answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.studentId, ctx.session.user.id),
            eq(enrollment.courseId, input.courseId),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      // Get quiz and questions for scoring
      const [quizRecord] = await db
        .select()
        .from(quiz)
        .where(eq(quiz.id, input.quizId))
        .limit(1);

      if (!quizRecord) return null;

      const questions = await db
        .select()
        .from(quizQuestion)
        .where(eq(quizQuestion.quizId, input.quizId));

      // Score the quiz
      let earnedPoints = 0;
      let totalPoints = 0;
      const questionResults: Record<string, { correct: boolean; correctAnswer: string | string[] | null }> = {};

      for (const q of questions) {
        totalPoints += q.points;
        const studentAnswer = input.answers[q.id];
        const correctAnswer = q.correctAnswer;

        let isCorrect = false;
        if (correctAnswer !== null && correctAnswer !== undefined && studentAnswer !== undefined) {
          if (Array.isArray(correctAnswer)) {
            if (Array.isArray(studentAnswer)) {
              isCorrect =
                correctAnswer.length === studentAnswer.length &&
                correctAnswer.every((a) => studentAnswer.includes(a));
            }
          } else {
            isCorrect =
              String(studentAnswer).toLowerCase().trim() ===
              String(correctAnswer).toLowerCase().trim();
          }
        }

        if (isCorrect) {
          earnedPoints += q.points;
        }

        questionResults[q.id] = {
          correct: isCorrect,
          correctAnswer: q.correctAnswer,
        };
      }

      const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
      const passed = scorePercent >= (quizRecord.passingScorePercent ?? 70);

      const [attempt] = await db
        .insert(quizAttempt)
        .values({
          enrollmentId: enroll.id,
          quizId: input.quizId,
          answers: input.answers,
          scorePercent,
          passed,
          completedAt: new Date(),
        })
        .returning();

      return {
        attempt,
        scorePercent,
        passed,
        questionResults,
        passingScorePercent: quizRecord.passingScorePercent ?? 70,
      };
    }),

  // Student: Get recently accessed lessons across all courses
  recentlyAccessed: protectedProcedure.query(async ({ ctx }) => {
    const enrollments_ = await db
      .select()
      .from(enrollment)
      .where(eq(enrollment.studentId, ctx.session.user.id));

    if (enrollments_.length === 0) return [];

    const allProgress: Array<{
      lessonId: string;
      lastAccessedAt: Date | null;
      courseId: string;
      courseTitle: string;
    }> = [];

    for (const enroll of enrollments_) {
      const progress = await db
        .select({
          lessonId: lessonProgress.lessonId,
          lastAccessedAt: lessonProgress.lastAccessedAt,
          lessonTitle: lesson.title,
        })
        .from(lessonProgress)
        .innerJoin(lesson, eq(lessonProgress.lessonId, lesson.id))
        .where(eq(lessonProgress.enrollmentId, enroll.id))
        .orderBy(desc(lessonProgress.lastAccessedAt))
        .limit(5);

      const [courseInfo] = await db
        .select({ title: course.title })
        .from(course)
        .where(eq(course.id, enroll.courseId))
        .limit(1);

      for (const p of progress) {
        allProgress.push({
          lessonId: p.lessonId,
          lastAccessedAt: p.lastAccessedAt,
          courseId: enroll.courseId,
          courseTitle: courseInfo?.title ?? "Unknown",
        });
      }
    }

    return allProgress
      .sort((a, b) => {
        const aTime = a.lastAccessedAt?.getTime() ?? 0;
        const bTime = b.lastAccessedAt?.getTime() ?? 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }),

  // ── Creator: Student Management ───────────────────────────────────────

  // Creator: List all students across all courses (searchable, filterable, paginated)
  listAllStudents: creatorProcedure
    .input(
      z.object({
        search: z.string().optional(),
        courseId: z.string().optional(),
        status: z.enum(["all", "active", "completed", "inactive"]).default("all"),
        limit: z.number().min(1).max(100).default(25),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(enrollment.creatorId, ctx.creator.id)];

      if (input.courseId) {
        conditions.push(eq(enrollment.courseId, input.courseId));
      }

      // Base query: distinct students enrolled with this creator
      const baseQuery = db
        .select({
          studentId: user.id,
          studentName: user.name,
          studentEmail: user.email,
          studentImage: user.image,
          firstEnrolledAt: sql<Date>`min(${enrollment.enrolledAt})`.as("first_enrolled_at"),
          enrollmentCount: sql<number>`count(distinct ${enrollment.courseId})::int`.as("enrollment_count"),
          completedCount: sql<number>`count(case when ${enrollment.completedAt} is not null then 1 end)::int`.as("completed_count"),
          lastActivity: sql<Date>`max(${enrollment.enrolledAt})`.as("last_activity"),
        })
        .from(enrollment)
        .innerJoin(user, eq(enrollment.studentId, user.id))
        .where(and(...conditions))
        .groupBy(user.id, user.name, user.email, user.image);

      // Apply search filter on the CTE / subquery
      let query = baseQuery.$dynamic();

      if (input.search) {
        const searchTerm = `%${input.search}%`;
        conditions.push(
          or(
            like(user.name, searchTerm),
            like(user.email, searchTerm),
          )!,
        );
        // Rebuild with search condition
        query = db
          .select({
            studentId: user.id,
            studentName: user.name,
            studentEmail: user.email,
            studentImage: user.image,
            firstEnrolledAt: sql<Date>`min(${enrollment.enrolledAt})`.as("first_enrolled_at"),
            enrollmentCount: sql<number>`count(distinct ${enrollment.courseId})::int`.as("enrollment_count"),
            completedCount: sql<number>`count(case when ${enrollment.completedAt} is not null then 1 end)::int`.as("completed_count"),
            lastActivity: sql<Date>`max(${enrollment.enrolledAt})`.as("last_activity"),
          })
          .from(enrollment)
          .innerJoin(user, eq(enrollment.studentId, user.id))
          .where(and(...conditions))
          .groupBy(user.id, user.name, user.email, user.image)
          .$dynamic();
      }

      const rows = await query
        .orderBy(sql`last_activity desc`)
        .limit(input.limit)
        .offset(input.offset);

      // Enrich with lesson progress stats for each student
      const enriched = await Promise.all(
        rows.map(async (row) => {
          // Get lesson progress across all enrollments with this creator
          const studentEnrollments = await db
            .select({ id: enrollment.id, courseId: enrollment.courseId, completedAt: enrollment.completedAt })
            .from(enrollment)
            .where(
              and(
                eq(enrollment.studentId, row.studentId),
                eq(enrollment.creatorId, ctx.creator.id),
              ),
            );

          const enrollmentIds = studentEnrollments.map((e) => e.id);
          let completedLessons = 0;
          let totalLessons = 0;
          let lastAccessedAt: Date | null = null;

          if (enrollmentIds.length > 0) {
            const [progress] = await db
              .select({
                completed: sql<number>`count(case when ${lessonProgress.status} = 'completed' then 1 end)::int`,
                total: sql<number>`count(*)::int`,
                lastAccess: max(lessonProgress.lastAccessedAt),
              })
              .from(lessonProgress)
              .where(inArray(lessonProgress.enrollmentId, enrollmentIds));

            completedLessons = progress?.completed ?? 0;
            totalLessons = progress?.total ?? 0;
            lastAccessedAt = progress?.lastAccess ?? null;
          }

          // Determine activity status
          const daysSinceActive = lastAccessedAt
            ? Math.floor((Date.now() - lastAccessedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 999;
          const activityStatus: "active" | "inactive" | "completed" =
            row.completedCount > 0 && row.completedCount >= row.enrollmentCount
              ? "completed"
              : daysSinceActive <= 30
                ? "active"
                : "inactive";

          return {
            studentId: row.studentId,
            name: row.studentName,
            email: row.studentEmail,
            image: row.studentImage,
            enrolledCourses: row.enrollmentCount,
            completedCourses: row.completedCount,
            completedLessons,
            totalLessons,
            lastAccessedAt,
            firstEnrolledAt: row.firstEnrolledAt,
            status: activityStatus,
          };
        }),
      );

      // Filter by status if not "all"
      const filtered =
        input.status === "all"
          ? enriched
          : enriched.filter((s) => s.status === input.status);

      // Get total count for pagination
      const [totalRow] = await db
        .select({ total: sql<number>`count(distinct ${enrollment.studentId})::int` })
        .from(enrollment)
        .where(eq(enrollment.creatorId, ctx.creator.id));

      return {
        students: filtered,
        total: totalRow?.total ?? 0,
      };
    }),

  // Creator: Get detailed info about a single student
  getStudentDetail: creatorProcedure
    .input(z.object({ studentId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Get student info
      const [studentInfo] = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          createdAt: user.createdAt,
        })
        .from(user)
        .where(eq(user.id, input.studentId))
        .limit(1);

      if (!studentInfo) return null;

      // Get all enrollments for this student under this creator
      const enrollments_ = await db
        .select({
          enrollmentId: enrollment.id,
          courseId: enrollment.courseId,
          courseTitle: course.title,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          source: enrollment.source,
          certificateSerial: enrollment.certificateSerial,
        })
        .from(enrollment)
        .innerJoin(course, eq(enrollment.courseId, course.id))
        .where(
          and(
            eq(enrollment.studentId, input.studentId),
            eq(enrollment.creatorId, ctx.creator.id),
          ),
        )
        .orderBy(desc(enrollment.enrolledAt));

      // Enrich each enrollment with progress
      const enrollmentsWithProgress = await Promise.all(
        enrollments_.map(async (enroll) => {
          const [lessonStats] = await db
            .select({
              completed: sql<number>`count(case when ${lessonProgress.status} = 'completed' then 1 end)::int`,
              total: sql<number>`count(*)::int`,
            })
            .from(lessonProgress)
            .where(eq(lessonProgress.enrollmentId, enroll.enrollmentId));

          // Get total lessons in the course
          const [courseTotal] = await db
            .select({ count: count() })
            .from(lesson)
            .innerJoin(courseModule, eq(lesson.moduleId, courseModule.id))
            .where(eq(courseModule.courseId, enroll.courseId));

          // Get quiz attempts
          const attempts = await db
            .select({
              quizId: quizAttempt.quizId,
              scorePercent: quizAttempt.scorePercent,
              passed: quizAttempt.passed,
              completedAt: quizAttempt.completedAt,
              quizTitle: quiz.title,
            })
            .from(quizAttempt)
            .innerJoin(quiz, eq(quizAttempt.quizId, quiz.id))
            .where(eq(quizAttempt.enrollmentId, enroll.enrollmentId))
            .orderBy(desc(quizAttempt.completedAt));

          return {
            ...enroll,
            completedLessons: lessonStats?.completed ?? 0,
            totalLessonsStarted: lessonStats?.total ?? 0,
            totalLessonsInCourse: courseTotal?.count ?? 0,
            progressPercent:
              courseTotal && courseTotal.count > 0
                ? Math.round(((lessonStats?.completed ?? 0) / courseTotal.count) * 100)
                : 0,
            quizAttempts: attempts,
          };
        }),
      );

      return {
        student: studentInfo,
        enrollments: enrollmentsWithProgress,
      };
    }),

  // Creator: Revoke a student's enrollment
  revokeEnrollment: creatorProcedure
    .input(z.object({ enrollmentId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify the enrollment belongs to this creator
      const [enroll] = await db
        .select()
        .from(enrollment)
        .where(
          and(
            eq(enrollment.id, input.enrollmentId),
            eq(enrollment.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!enroll) return null;

      await db.delete(enrollment).where(eq(enrollment.id, input.enrollmentId));
      return { success: true };
    }),

  // Creator: List creator's courses (for filter dropdown)
  creatorCourses: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select({ id: course.id, title: course.title })
      .from(course)
      .where(eq(course.creatorId, ctx.creator.id))
      .orderBy(asc(course.title));
  }),
});
