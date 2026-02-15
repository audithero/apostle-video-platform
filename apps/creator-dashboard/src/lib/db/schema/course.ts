import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  real,
} from "drizzle-orm/pg-core";
import { creator } from "./creator";

export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "published",
  "archived",
]);

export const courseTypeEnum = pgEnum("course_type", [
  "self_paced",
  "drip",
  "cohort",
]);

export const priceTypeEnum = pgEnum("price_type", [
  "free",
  "paid",
  "subscription_only",
]);

export const lessonTypeEnum = pgEnum("lesson_type", [
  "video",
  "text",
  "quiz",
  "assignment",
  "live",
]);

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "true_false",
  "short_answer",
  "file_upload",
]);

// Courses
export const course = pgTable(
  "course",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    status: courseStatusEnum("status").default("draft").notNull(),
    courseType: courseTypeEnum("course_type").default("self_paced").notNull(),
    dripIntervalDays: integer("drip_interval_days"),
    priceType: priceTypeEnum("price_type").default("free").notNull(),
    priceCents: integer("price_cents").default(0),
    currency: text("currency").default("usd"),
    sortOrder: integer("sort_order").default(0).notNull(),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    enrollmentCount: integer("enrollment_count").default(0).notNull(),
    completionRate: real("completion_rate").default(0),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("course_creator_id_idx").on(table.creatorId),
    uniqueIndex("course_creator_slug_idx").on(table.creatorId, table.slug),
    index("course_status_idx").on(table.status),
  ],
);

// Modules (sections within a course)
export const courseModule = pgTable(
  "course_module",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    dripDelayDays: integer("drip_delay_days").default(0),
    dripDate: timestamp("drip_date"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("module_course_id_idx").on(table.courseId),
  ],
);

// Lessons
export const lesson = pgTable(
  "lesson",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    moduleId: text("module_id")
      .notNull()
      .references(() => courseModule.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    contentHtml: text("content_html"),
    contentJson: jsonb("content_json"),
    lessonType: lessonTypeEnum("lesson_type").default("text").notNull(),
    videoUrl: text("video_url"),
    videoDurationSeconds: integer("video_duration_seconds"),
    videoStorageKey: text("video_storage_key"),
    thumbnailUrl: text("thumbnail_url"),
    sortOrder: integer("sort_order").default(0).notNull(),
    isFreePreview: boolean("is_free_preview").default(false).notNull(),
    aiGenerated: boolean("ai_generated").default(false).notNull(),
    // HeyGen avatar video fields
    heygenVideoId: text("heygen_video_id"),
    heygenVideoUrl: text("heygen_video_url"),
    heygenStatus: text("heygen_status"),
    // Denormalized courseId for query convenience
    courseId: text("course_id"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("lesson_module_id_idx").on(table.moduleId),
    index("lesson_course_id_idx").on(table.courseId),
  ],
);

// Quizzes (attached to lessons)
export const quiz = pgTable(
  "quiz",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    lessonId: text("lesson_id")
      .notNull()
      .unique()
      .references(() => lesson.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    passingScorePercent: integer("passing_score_percent").default(70),
    maxAttempts: integer("max_attempts"),
    timeLimitMinutes: integer("time_limit_minutes"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("quiz_lesson_id_idx").on(table.lessonId),
  ],
);

// Quiz questions
export const quizQuestion = pgTable(
  "quiz_question",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    quizId: text("quiz_id")
      .notNull()
      .references(() => quiz.id, { onDelete: "cascade" }),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").default("multiple_choice").notNull(),
    options: jsonb("options").$type<string[]>(),
    correctAnswer: jsonb("correct_answer").$type<string | string[]>(),
    explanation: text("explanation"),
    sortOrder: integer("sort_order").default(0).notNull(),
    points: integer("points").default(1).notNull(),
  },
  (table) => [
    index("quiz_question_quiz_id_idx").on(table.quizId),
  ],
);

// Certificates
export const certificate = pgTable("certificate", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id")
    .notNull()
    .unique()
    .references(() => course.id, { onDelete: "cascade" }),
  title: text("title").default("Certificate of Completion"),
  subtitle: text("subtitle"),
  logoUrl: text("logo_url"),
  backgroundImageUrl: text("background_image_url"),
  includeDate: boolean("include_date").default(true).notNull(),
  includeSerial: boolean("include_serial").default(true).notNull(),
  expirationDays: integer("expiration_days"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
});

// Relations
export const courseRelations = relations(course, ({ one, many }) => ({
  creator: one(creator, {
    fields: [course.creatorId],
    references: [creator.id],
  }),
  modules: many(courseModule),
  certificate: one(certificate, {
    fields: [course.id],
    references: [certificate.courseId],
  }),
}));

export const courseModuleRelations = relations(courseModule, ({ one, many }) => ({
  course: one(course, {
    fields: [courseModule.courseId],
    references: [course.id],
  }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one }) => ({
  module: one(courseModule, {
    fields: [lesson.moduleId],
    references: [courseModule.id],
  }),
  quiz: one(quiz, {
    fields: [lesson.id],
    references: [quiz.lessonId],
  }),
}));

export const quizRelations = relations(quiz, ({ one, many }) => ({
  lesson: one(lesson, {
    fields: [quiz.lessonId],
    references: [lesson.id],
  }),
  questions: many(quizQuestion),
}));

export const quizQuestionRelations = relations(quizQuestion, ({ one }) => ({
  quiz: one(quiz, {
    fields: [quizQuestion.quizId],
    references: [quiz.id],
  }),
}));

export const certificateRelations = relations(certificate, ({ one }) => ({
  course: one(course, {
    fields: [certificate.courseId],
    references: [course.id],
  }),
}));
