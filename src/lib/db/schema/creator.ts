import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const tierEnum = pgEnum("tier", [
  "launch",
  "grow",
  "scale",
  "pro",
]);

export const creator = pgTable(
  "creator",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    businessName: text("business_name").notNull(),
    slug: text("slug").notNull().unique(),
    customDomain: text("custom_domain"),
    domainVerified: boolean("domain_verified").default(false).notNull(),
    domainVerifiedAt: timestamp("domain_verified_at"),
    logoUrl: text("logo_url"),
    brandColor: text("brand_color").default("#6366f1"),
    timezone: text("timezone").default("UTC"),
    tier: tierEnum("tier").default("launch").notNull(),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    subscriptionStatus: text("subscription_status").default("trialing"),
    trialEndsAt: timestamp("trial_ends_at"),
    overageEnabled: boolean("overage_enabled").default(false).notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("creator_user_id_idx").on(table.userId),
    index("creator_slug_idx").on(table.slug),
    index("creator_custom_domain_idx").on(table.customDomain),
  ],
);

export const creatorSettings = pgTable("creator_settings", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  creatorId: text("creator_id")
    .notNull()
    .unique()
    .references(() => creator.id, { onDelete: "cascade" }),
  emailFromName: text("email_from_name"),
  emailReplyTo: text("email_reply_to"),
  checkoutLogo: text("checkout_logo"),
  checkoutAccentColor: text("checkout_accent_color"),
  metaPixelId: text("meta_pixel_id"),
  ga4Id: text("ga4_id"),
  gtmId: text("gtm_id"),
  tiktokPixelId: text("tiktok_pixel_id"),
  customHeadCode: text("custom_head_code"),
  customCss: text("custom_css"),
  brandSecondaryColor: text("brand_secondary_color"),
  fontFamily: text("font_family"),
  faviconUrl: text("favicon_url"),
  seoDefaults: jsonb("seo_defaults").$type<{
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string;
  }>(),
  // Checkout customization (Task 12.4)
  checkoutTestimonials: jsonb("checkout_testimonials").$type<Array<{
    name: string;
    text: string;
    imageUrl?: string;
    role?: string;
  }>>(),
  checkoutGuaranteeBadge: jsonb("checkout_guarantee_badge").$type<{
    enabled: boolean;
    text: string;
    days: number;
  }>(),
  checkoutOrderBump: jsonb("checkout_order_bump").$type<{
    enabled: boolean;
    title: string;
    description: string;
    priceId: string;
    priceCents: number;
  }>(),
  checkoutCustomFields: jsonb("checkout_custom_fields").$type<Array<{
    id: string;
    label: string;
    type: "text" | "select";
    required: boolean;
    options?: string[];
  }>>(),
  // Gamification config (Task 7.4)
  gamificationEnabled: boolean("gamification_enabled").default(true),
  gamificationPointValues: jsonb("gamification_point_values").$type<{
    post: number;
    comment: number;
    reaction_received: number;
    lesson_completed: number;
    course_completed: number;
  }>(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

// Relations
export const creatorRelations = relations(creator, ({ one }) => ({
  user: one(user, {
    fields: [creator.userId],
    references: [user.id],
  }),
  settings: one(creatorSettings, {
    fields: [creator.id],
    references: [creatorSettings.creatorId],
  }),
}));

export const creatorSettingsRelations = relations(creatorSettings, ({ one }) => ({
  creator: one(creator, {
    fields: [creatorSettings.creatorId],
    references: [creator.id],
  }),
}));
