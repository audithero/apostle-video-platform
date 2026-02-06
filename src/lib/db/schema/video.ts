import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const videoStatusEnum = pgEnum("video_status", [
  "pending",
  "uploading",
  "processing",
  "ready",
  "errored",
]);

export const series = pgTable("series", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  published: boolean("published").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const video = pgTable("video", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),

  // Mux fields
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  muxUploadId: text("mux_upload_id"),
  status: videoStatusEnum("status").default("pending").notNull(),
  duration: integer("duration"),

  // Access control
  isFree: boolean("is_free").default(false).notNull(),
  published: boolean("published").default(false).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),

  // Optional downloadable PDF
  pdfUrl: text("pdf_url"),
  pdfName: text("pdf_name"),

  createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
});

export const seriesVideo = pgTable(
  "series_video",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    seriesId: text("series_id")
      .notNull()
      .references(() => series.id, { onDelete: "cascade" }),
    videoId: text("video_id")
      .notNull()
      .references(() => video.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(0).notNull(),
  },
  (table) => [
    uniqueIndex("series_video_unique").on(table.seriesId, table.videoId),
  ]
);

// Relations
export const seriesRelations = relations(series, ({ many }) => ({
  seriesVideos: many(seriesVideo),
}));

export const videoRelations = relations(video, ({ many }) => ({
  seriesVideos: many(seriesVideo),
}));

export const seriesVideoRelations = relations(seriesVideo, ({ one }) => ({
  series: one(series, {
    fields: [seriesVideo.seriesId],
    references: [series.id],
  }),
  video: one(video, {
    fields: [seriesVideo.videoId],
    references: [video.id],
  }),
}));
