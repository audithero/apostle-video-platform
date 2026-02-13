import { relations } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  boolean,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { creator } from "./creator";

export const channelTypeEnum = pgEnum("channel_type", [
  "feed",
  "chat",
]);

export const channelAccessEnum = pgEnum("channel_access", [
  "public",
  "members",
  "specific_course",
]);

export const postStatusEnum = pgEnum("post_status", [
  "visible",
  "flagged",
  "hidden",
]);

export const reactionTypeEnum = pgEnum("reaction_type", [
  "like",
  "love",
  "fire",
  "clap",
]);

// Community channels
export const communityChannel = pgTable(
  "community_channel",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    channelType: channelTypeEnum("channel_type").default("feed").notNull(),
    accessLevel: channelAccessEnum("access_level").default("members").notNull(),
    accessCourseId: text("access_course_id"),
    iconEmoji: text("icon_emoji").default("💬"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("community_channel_creator_id_idx").on(table.creatorId),
    uniqueIndex("community_channel_creator_slug_idx").on(table.creatorId, table.slug),
  ],
);

// Community posts
export const communityPost = pgTable(
  "community_post",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    channelId: text("channel_id")
      .notNull()
      .references(() => communityChannel.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title"),
    contentHtml: text("content_html"),
    contentJson: jsonb("content_json"),
    mediaUrls: jsonb("media_urls").$type<string[]>(),
    pinned: boolean("pinned").default(false).notNull(),
    status: postStatusEnum("status").default("visible").notNull(),
    likesCount: integer("likes_count").default(0).notNull(),
    commentsCount: integer("comments_count").default(0).notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("community_post_channel_id_idx").on(table.channelId),
    index("community_post_author_id_idx").on(table.authorId),
    index("community_post_created_at_idx").on(table.createdAt),
  ],
);

// Community comments
export const communityComment = pgTable(
  "community_comment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPost.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    parentId: text("parent_id"),
    content: text("content").notNull(),
    status: postStatusEnum("status").default("visible").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("community_comment_post_id_idx").on(table.postId),
  ],
);

// Community reactions
export const communityReaction = pgTable(
  "community_reaction",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    postId: text("post_id")
      .notNull()
      .references(() => communityPost.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reactionType: reactionTypeEnum("reaction_type").default("like").notNull(),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("community_reaction_unique_idx").on(table.postId, table.userId, table.reactionType),
  ],
);

// Gamification
export const gamificationPoints = pgTable(
  "gamification_points",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    totalPoints: integer("total_points").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    updatedAt: timestamp("updated_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("gamification_user_creator_idx").on(table.userId, table.creatorId),
  ],
);

export const pointEvent = pgTable(
  "point_event",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    points: integer("points").notNull(),
    reason: text("reason").notNull(),
    referenceId: text("reference_id"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("point_event_user_creator_idx").on(table.userId, table.creatorId),
    index("point_event_created_at_idx").on(table.createdAt),
  ],
);

// Keyword filters for auto-moderation
export const keywordFilter = pgTable(
  "keyword_filter",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    keyword: text("keyword").notNull(),
    action: text("action").notNull().default("flag"), // "flag" | "hide" | "block"
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("keyword_filter_creator_id_idx").on(table.creatorId),
  ],
);

// Blocked community members
export const blockedMember = pgTable(
  "blocked_member",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason"),
    blockedAt: timestamp("blocked_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    uniqueIndex("blocked_member_creator_user_idx").on(table.creatorId, table.userId),
  ],
);

// Moderation action log
export const moderationLog = pgTable(
  "moderation_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    moderatorId: text("moderator_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(), // "hide_post" | "delete_post" | "dismiss_flag" | "block_user" | "unblock_user"
    targetType: text("target_type").notNull(), // "post" | "comment" | "user"
    targetId: text("target_id").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at").$defaultFn(() => new Date()).notNull(),
  },
  (table) => [
    index("moderation_log_creator_id_idx").on(table.creatorId),
    index("moderation_log_created_at_idx").on(table.createdAt),
  ],
);

// Relations
export const communityChannelRelations = relations(communityChannel, ({ one, many }) => ({
  creator: one(creator, {
    fields: [communityChannel.creatorId],
    references: [creator.id],
  }),
  posts: many(communityPost),
}));

export const communityPostRelations = relations(communityPost, ({ one, many }) => ({
  channel: one(communityChannel, {
    fields: [communityPost.channelId],
    references: [communityChannel.id],
  }),
  author: one(user, {
    fields: [communityPost.authorId],
    references: [user.id],
  }),
  comments: many(communityComment),
  reactions: many(communityReaction),
}));

export const communityCommentRelations = relations(communityComment, ({ one, many }) => ({
  post: one(communityPost, {
    fields: [communityComment.postId],
    references: [communityPost.id],
  }),
  author: one(user, {
    fields: [communityComment.authorId],
    references: [user.id],
  }),
  parent: one(communityComment, {
    fields: [communityComment.parentId],
    references: [communityComment.id],
    relationName: "commentReplies",
  }),
  replies: many(communityComment, {
    relationName: "commentReplies",
  }),
}));

export const communityReactionRelations = relations(communityReaction, ({ one }) => ({
  post: one(communityPost, {
    fields: [communityReaction.postId],
    references: [communityPost.id],
  }),
  user: one(user, {
    fields: [communityReaction.userId],
    references: [user.id],
  }),
}));

export const gamificationPointsRelations = relations(gamificationPoints, ({ one }) => ({
  user: one(user, {
    fields: [gamificationPoints.userId],
    references: [user.id],
  }),
  creator: one(creator, {
    fields: [gamificationPoints.creatorId],
    references: [creator.id],
  }),
}));

export const pointEventRelations = relations(pointEvent, ({ one }) => ({
  user: one(user, {
    fields: [pointEvent.userId],
    references: [user.id],
  }),
  creator: one(creator, {
    fields: [pointEvent.creatorId],
    references: [creator.id],
  }),
}));

export const keywordFilterRelations = relations(keywordFilter, ({ one }) => ({
  creator: one(creator, {
    fields: [keywordFilter.creatorId],
    references: [creator.id],
  }),
}));

export const blockedMemberRelations = relations(blockedMember, ({ one }) => ({
  creator: one(creator, {
    fields: [blockedMember.creatorId],
    references: [creator.id],
  }),
  user: one(user, {
    fields: [blockedMember.userId],
    references: [user.id],
  }),
}));

export const moderationLogRelations = relations(moderationLog, ({ one }) => ({
  creator: one(creator, {
    fields: [moderationLog.creatorId],
    references: [creator.id],
  }),
  moderator: one(user, {
    fields: [moderationLog.moderatorId],
    references: [user.id],
  }),
}));
