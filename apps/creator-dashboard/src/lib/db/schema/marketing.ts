import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  boolean,
  real,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { creator } from "./creator";

export const pageStatusEnum = pgEnum("page_status", [
  "draft",
  "published",
]);

export const sequenceTriggerEnum = pgEnum("sequence_trigger", [
  "enrollment",
  "purchase",
  "tag_added",
  "manual",
]);

export const sequenceStatusEnum = pgEnum("sequence_status", [
  "active",
  "paused",
  "draft",
]);

export const broadcastStatusEnum = pgEnum("broadcast_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
]);

export const discountTypeEnum = pgEnum("discount_type", [
  "percent",
  "fixed",
]);

export const affiliateStatusEnum = pgEnum("affiliate_status", [
  "active",
  "paused",
]);

export const referralStatusEnum = pgEnum("referral_status", [
  "pending",
  "approved",
  "paid",
]);

// Landing pages
export const landingPage = pgTable(
  "landing_page",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    pageJson: jsonb("page_json").$type<Record<string, unknown>[]>(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogImageUrl: text("og_image_url"),
    canonicalUrl: text("canonical_url"),
    noindex: boolean("noindex").default(false).notNull(),
    jsonLd: jsonb("json_ld").$type<Record<string, unknown>>(),
    status: pageStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("landing_page_creator_id_idx").on(table.creatorId),
    uniqueIndex("landing_page_creator_slug_idx").on(table.creatorId, table.slug),
  ],
);

// Email sequences
export const emailSequence = pgTable(
  "email_sequence",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    triggerType: sequenceTriggerEnum("trigger_type").notNull(),
    triggerCourseId: text("trigger_course_id"),
    status: sequenceStatusEnum("status").default("draft").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("email_sequence_creator_id_idx").on(table.creatorId),
  ],
);

// Email sequence steps
export const emailSequenceStep = pgTable(
  "email_sequence_step",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    sequenceId: text("sequence_id")
      .notNull()
      .references(() => emailSequence.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html"),
    bodyJson: jsonb("body_json"),
    delayHours: integer("delay_hours").default(24).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    sentCount: integer("sent_count").default(0).notNull(),
    openCount: integer("open_count").default(0).notNull(),
    clickCount: integer("click_count").default(0).notNull(),
  },
  (table) => [
    index("email_sequence_step_sequence_id_idx").on(table.sequenceId),
  ],
);

// Email broadcasts
export const emailBroadcast = pgTable(
  "email_broadcast",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    bodyHtml: text("body_html"),
    bodyJson: jsonb("body_json"),
    segmentFilter: jsonb("segment_filter").$type<Record<string, unknown>>(),
    status: broadcastStatusEnum("status").default("draft").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    sentAt: timestamp("sent_at"),
    totalSent: integer("total_sent").default(0),
    totalOpened: integer("total_opened").default(0),
    totalClicked: integer("total_clicked").default(0),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("email_broadcast_creator_id_idx").on(table.creatorId),
  ],
);

// Coupons
export const coupon = pgTable(
  "coupon",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    code: text("code").notNull(),
    discountType: discountTypeEnum("discount_type").notNull(),
    discountValue: integer("discount_value").notNull(),
    maxRedemptions: integer("max_redemptions"),
    currentRedemptions: integer("current_redemptions").default(0).notNull(),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    appliesTo: jsonb("applies_to").$type<{ courseIds?: string[]; all?: boolean }>(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("coupon_creator_id_idx").on(table.creatorId),
    uniqueIndex("coupon_creator_code_idx").on(table.creatorId, table.code),
  ],
);

// Affiliates
export const affiliate = pgTable(
  "affiliate",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    commissionPercent: real("commission_percent").default(20),
    commissionFixedCents: integer("commission_fixed_cents"),
    cookieDays: integer("cookie_days").default(30),
    referralCode: text("referral_code").notNull().unique(),
    totalReferrals: integer("total_referrals").default(0).notNull(),
    totalEarningsCents: integer("total_earnings_cents").default(0).notNull(),
    status: affiliateStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("affiliate_creator_id_idx").on(table.creatorId),
    index("affiliate_user_id_idx").on(table.userId),
  ],
);

// Affiliate referrals
export const affiliateReferral = pgTable(
  "affiliate_referral",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    affiliateId: text("affiliate_id")
      .notNull()
      .references(() => affiliate.id, { onDelete: "cascade" }),
    referredUserId: text("referred_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    referredEnrollmentId: text("referred_enrollment_id"),
    commissionCents: integer("commission_cents").default(0).notNull(),
    status: referralStatusEnum("status").default("pending").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    paidAt: timestamp("paid_at"),
  },
  (table) => [
    index("affiliate_referral_affiliate_id_idx").on(table.affiliateId),
  ],
);

// Webhook configs (for Zapier/custom integrations)
export const webhookConfig = pgTable(
  "webhook_config",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    events: jsonb("events").$type<string[]>().notNull(),
    active: boolean("active").default(true).notNull(),
    secret: text("secret"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("webhook_config_creator_id_idx").on(table.creatorId),
  ],
);

// Webhook delivery logs
export const webhookLog = pgTable(
  "webhook_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    webhookConfigId: text("webhook_config_id")
      .notNull()
      .references(() => webhookConfig.id, { onDelete: "cascade" }),
    event: text("event").notNull(),
    payload: jsonb("payload"),
    statusCode: integer("status_code"),
    responseBody: text("response_body"),
    attemptNumber: integer("attempt_number").default(1).notNull(),
    deliveredAt: timestamp("delivered_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("webhook_log_config_id_idx").on(table.webhookConfigId),
  ],
);

// Relations
export const landingPageRelations = relations(landingPage, ({ one }) => ({
  creator: one(creator, {
    fields: [landingPage.creatorId],
    references: [creator.id],
  }),
}));

export const emailSequenceRelations = relations(emailSequence, ({ one, many }) => ({
  creator: one(creator, {
    fields: [emailSequence.creatorId],
    references: [creator.id],
  }),
  steps: many(emailSequenceStep),
}));

export const emailSequenceStepRelations = relations(emailSequenceStep, ({ one }) => ({
  sequence: one(emailSequence, {
    fields: [emailSequenceStep.sequenceId],
    references: [emailSequence.id],
  }),
}));

export const emailBroadcastRelations = relations(emailBroadcast, ({ one }) => ({
  creator: one(creator, {
    fields: [emailBroadcast.creatorId],
    references: [creator.id],
  }),
}));

export const couponRelations = relations(coupon, ({ one }) => ({
  creator: one(creator, {
    fields: [coupon.creatorId],
    references: [creator.id],
  }),
}));

export const affiliateRelations = relations(affiliate, ({ one, many }) => ({
  creator: one(creator, {
    fields: [affiliate.creatorId],
    references: [creator.id],
  }),
  user: one(user, {
    fields: [affiliate.userId],
    references: [user.id],
  }),
  referrals: many(affiliateReferral),
}));

export const affiliateReferralRelations = relations(affiliateReferral, ({ one }) => ({
  affiliate: one(affiliate, {
    fields: [affiliateReferral.affiliateId],
    references: [affiliate.id],
  }),
  referredUser: one(user, {
    fields: [affiliateReferral.referredUserId],
    references: [user.id],
  }),
}));

export const webhookConfigRelations = relations(webhookConfig, ({ one, many }) => ({
  creator: one(creator, {
    fields: [webhookConfig.creatorId],
    references: [creator.id],
  }),
  logs: many(webhookLog),
}));

export const webhookLogRelations = relations(webhookLog, ({ one }) => ({
  webhookConfig: one(webhookConfig, {
    fields: [webhookLog.webhookConfigId],
    references: [webhookConfig.id],
  }),
}));
