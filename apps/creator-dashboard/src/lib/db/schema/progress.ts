import { relations } from "drizzle-orm";
import { boolean, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { video } from "./video";

export const userProgress = pgTable(
  "user_progress",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => video.id, { onDelete: "cascade" }),
    progressSeconds: integer("progress_seconds").default(0).notNull(),
    completed: boolean("completed").default(false).notNull(),
    favorite: boolean("favorite").default(false).notNull(),
    lastWatchedAt: timestamp("last_watched_at").$defaultFn(() => new Date()).notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("user_progress_unique").on(table.userId, table.videoId),
  ]
);

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, {
    fields: [userProgress.userId],
    references: [user.id],
  }),
  video: one(video, {
    fields: [userProgress.videoId],
    references: [video.id],
  }),
}));
