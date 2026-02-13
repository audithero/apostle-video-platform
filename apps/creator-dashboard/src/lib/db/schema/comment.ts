import { relations } from "drizzle-orm";
import { pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { video } from "./video";

export const commentStatusEnum = pgEnum("comment_status", [
  "visible",
  "flagged",
  "hidden",
]);

export const comment = pgTable("comment", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  videoId: text("video_id")
    .notNull()
    .references(() => video.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  body: text("body").notNull(),
  status: commentStatusEnum("status").default("visible").notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const commentRelations = relations(comment, ({ one, many }) => ({
  video: one(video, {
    fields: [comment.videoId],
    references: [video.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
  parent: one(comment, {
    fields: [comment.parentId],
    references: [comment.id],
    relationName: "commentReplies",
  }),
  replies: many(comment, {
    relationName: "commentReplies",
  }),
}));
