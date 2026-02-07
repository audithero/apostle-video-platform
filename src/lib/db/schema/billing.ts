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
} from "drizzle-orm/pg-core";
import { creator } from "./creator";

export const usageEventTypeEnum = pgEnum("usage_event_type", [
  "video_upload",
  "student_added",
  "email_sent",
  "ai_generation",
  "avatar_minute",
]);

export const creditTypeEnum = pgEnum("credit_type", [
  "ai_course",
  "ai_rewrite",
  "ai_image",
  "ai_quiz",
  "avatar_minute",
]);

export const avatarPackTypeEnum = pgEnum("avatar_pack_type", [
  "starter",
  "creator",
  "pro",
  "studio",
]);

// Usage events (event-sourced billing actions)
export const usageEvent = pgTable(
  "usage_event",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    eventType: usageEventTypeEnum("event_type").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    recordedAt: timestamp("recorded_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("usage_event_creator_id_idx").on(table.creatorId),
    index("usage_event_type_idx").on(table.eventType),
    index("usage_event_recorded_at_idx").on(table.recordedAt),
  ],
);

// Monthly usage aggregation
export const monthlyUsage = pgTable(
  "monthly_usage",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    periodStart: timestamp("period_start").notNull(),
    periodEnd: timestamp("period_end").notNull(),
    videoStorageSeconds: integer("video_storage_seconds").default(0).notNull(),
    activeStudents: integer("active_students").default(0).notNull(),
    emailsSent: integer("emails_sent").default(0).notNull(),
    aiCourseGenerations: integer("ai_course_generations").default(0).notNull(),
    aiLessonRewrites: integer("ai_lesson_rewrites").default(0).notNull(),
    aiImageGenerations: integer("ai_image_generations").default(0).notNull(),
    aiQuizGenerations: integer("ai_quiz_generations").default(0).notNull(),
    avatarMinutesUsed: real("avatar_minutes_used").default(0).notNull(),
  },
  (table) => [
    index("monthly_usage_creator_id_idx").on(table.creatorId),
    index("monthly_usage_period_idx").on(table.periodStart, table.periodEnd),
  ],
);

// Credit ledger (double-entry style)
export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    creditType: creditTypeEnum("credit_type").notNull(),
    amount: integer("amount").notNull(), // positive = credit, negative = debit
    balanceAfter: integer("balance_after").notNull(),
    description: text("description"),
    stripePaymentId: text("stripe_payment_id"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("credit_ledger_creator_id_idx").on(table.creatorId),
    index("credit_ledger_type_idx").on(table.creditType),
    index("credit_ledger_created_at_idx").on(table.createdAt),
  ],
);

// Avatar packs (prepaid HeyGen minutes)
export const avatarPack = pgTable(
  "avatar_pack",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    packType: avatarPackTypeEnum("pack_type").notNull(),
    minutesTotal: real("minutes_total").notNull(),
    minutesUsed: real("minutes_used").default(0).notNull(),
    stripePaymentId: text("stripe_payment_id"),
    purchasedAt: timestamp("purchased_at").$defaultFn(() => new Date()).notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("avatar_pack_creator_id_idx").on(table.creatorId),
  ],
);

// Relations
export const usageEventRelations = relations(usageEvent, ({ one }) => ({
  creator: one(creator, {
    fields: [usageEvent.creatorId],
    references: [creator.id],
  }),
}));

export const monthlyUsageRelations = relations(monthlyUsage, ({ one }) => ({
  creator: one(creator, {
    fields: [monthlyUsage.creatorId],
    references: [creator.id],
  }),
}));

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
  creator: one(creator, {
    fields: [creditLedger.creatorId],
    references: [creator.id],
  }),
}));

export const avatarPackRelations = relations(avatarPack, ({ one }) => ({
  creator: one(creator, {
    fields: [avatarPack.creatorId],
    references: [creator.id],
  }),
}));
