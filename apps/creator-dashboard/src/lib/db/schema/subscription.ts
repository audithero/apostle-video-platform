import { relations } from "drizzle-orm";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";

// This table is managed by the Better Auth Stripe plugin.
// It will be auto-created by `bunx @better-auth/cli generate`.
// We define it here so Drizzle is aware of it for queries and relations.
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status"),
  periodicType: text("periodic_type"),
  startedAt: timestamp("started_at"),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.referenceId],
    references: [user.id],
  }),
}));
