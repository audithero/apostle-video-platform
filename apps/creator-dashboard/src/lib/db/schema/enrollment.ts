import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { creator } from "./creator";
import { course, lesson, quiz } from "./course";

export const enrollmentSourceEnum = pgEnum("enrollment_source", [
  "direct",
  "affiliate",
  "import",
]);

export const lessonStatusEnum = pgEnum("lesson_status", [
  "not_started",
  "in_progress",
  "completed",
]);

// Enrollments
export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    studentId: text("student_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").$defaultFn(() => new Date()).notNull(),
    completedAt: timestamp("completed_at"),
    certificateIssuedAt: timestamp("certificate_issued_at"),
    certificateSerial: text("certificate_serial"),
    certificatePdfUrl: text("certificate_pdf_url"),
    source: enrollmentSourceEnum("source").default("direct").notNull(),
  },
  (table) => [
    uniqueIndex("enrollment_student_course_idx").on(table.studentId, table.courseId),
    index("enrollment_creator_id_idx").on(table.creatorId),
    index("enrollment_course_id_idx").on(table.courseId),
  ],
);

// Lesson progress
export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollment.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    status: lessonStatusEnum("status").default("not_started").notNull(),
    progressSeconds: integer("progress_seconds").default(0),
    completedAt: timestamp("completed_at"),
    lastAccessedAt: timestamp("last_accessed_at").$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("lesson_progress_enrollment_lesson_idx").on(table.enrollmentId, table.lessonId),
    index("lesson_progress_enrollment_id_idx").on(table.enrollmentId),
  ],
);

// Quiz attempts
export const quizAttempt = pgTable(
  "quiz_attempt",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollment.id, { onDelete: "cascade" }),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    answers: jsonb("answers").$type<Record<string, string | string[]>>(),
    scorePercent: real("score_percent"),
    passed: boolean("passed").default(false),
    startedAt: timestamp("started_at").$defaultFn(() => new Date()).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("quiz_attempt_enrollment_id_idx").on(table.enrollmentId),
    index("quiz_attempt_quiz_id_idx").on(table.quizId),
  ],
);

// Student notes (timestamped notes during video lessons)
export const studentNote = pgTable(
  "student_note",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    enrollmentId: text("enrollment_id")
      .notNull()
      .references(() => enrollment.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    timestampSeconds: integer("timestamp_seconds"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("student_note_enrollment_id_idx").on(table.enrollmentId),
    index("student_note_lesson_id_idx").on(table.lessonId),
  ],
);

// Relations
export const enrollmentRelations = relations(enrollment, ({ one, many }) => ({
  student: one(user, {
    fields: [enrollment.studentId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
  creator: one(creator, {
    fields: [enrollment.creatorId],
    references: [creator.id],
  }),
  lessonProgress: many(lessonProgress),
  quizAttempts: many(quizAttempt),
  notes: many(studentNote),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [lessonProgress.enrollmentId],
    references: [enrollment.id],
  }),
  lesson: one(lesson, {
    fields: [lessonProgress.lessonId],
    references: [lesson.id],
  }),
}));

export const quizAttemptRelations = relations(quizAttempt, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [quizAttempt.enrollmentId],
    references: [enrollment.id],
  }),
  quiz: one(quiz, {
    fields: [quizAttempt.quizId],
    references: [quiz.id],
  }),
}));

export const studentNoteRelations = relations(studentNote, ({ one }) => ({
  enrollment: one(enrollment, {
    fields: [studentNote.enrollmentId],
    references: [enrollment.id],
  }),
  lesson: one(lesson, {
    fields: [studentNote.lessonId],
    references: [lesson.id],
  }),
}));
