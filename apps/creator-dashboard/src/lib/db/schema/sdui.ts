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
} from "drizzle-orm/pg-core";
import { creator } from "./creator";

// SDUI enums
export const sduiTemplateStatusEnum = pgEnum("sdui_template_status", [
  "draft",
  "published",
  "archived",
]);

export const sduiTemplateCategoryEnum = pgEnum("sdui_template_category", [
  "landing",
  "learning",
  "community",
  "commerce",
  "dashboard",
  "general",
]);

export const sduiDeploymentStatusEnum = pgEnum("sdui_deployment_status", [
  "pending",
  "building",
  "live",
  "failed",
  "rolled_back",
]);

export const sduiDeploymentPlatformEnum = pgEnum("sdui_deployment_platform", [
  "web",
  "mobile_ios",
  "mobile_android",
  "tvos",
]);

export const sduiLogLevelEnum = pgEnum("sdui_log_level", [
  "info",
  "warning",
  "error",
]);

// SDUI Templates — master template definitions (owned by platform or creator)
export const sduiTemplate = pgTable(
  "sdui_template",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id").references(() => creator.id, {
      onDelete: "cascade",
    }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    category: sduiTemplateCategoryEnum("category")
      .default("general")
      .notNull(),
    status: sduiTemplateStatusEnum("status").default("draft").notNull(),
    isStarterTemplate: boolean("is_starter_template")
      .default(false)
      .notNull(),
    tags: jsonb("tags").$type<string[]>().default([]),
    currentVersionId: text("current_version_id"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sdui_template_creator_id_idx").on(table.creatorId),
    index("sdui_template_status_idx").on(table.status),
    index("sdui_template_category_idx").on(table.category),
    uniqueIndex("sdui_template_creator_slug_idx").on(
      table.creatorId,
      table.slug,
    ),
  ],
);

// SDUI Template Versions — immutable versioned snapshots of template JSON
export const sduiTemplateVersion = pgTable(
  "sdui_template_version",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    templateId: text("template_id")
      .notNull()
      .references(() => sduiTemplate.id, { onDelete: "cascade" }),
    version: integer("version").notNull(),
    templateJson: jsonb("template_json")
      .$type<Record<string, unknown>>()
      .notNull(),
    themeJson: jsonb("theme_json").$type<Record<string, unknown>>(),
    componentVersions: jsonb("component_versions").$type<
      Record<string, string>
    >(),
    changelog: text("changelog"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sdui_template_version_template_id_idx").on(table.templateId),
    uniqueIndex("sdui_template_version_unique_idx").on(
      table.templateId,
      table.version,
    ),
  ],
);

// SDUI Template Instances — creator's customized copy of a template
export const sduiTemplateInstance = pgTable(
  "sdui_template_instance",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => sduiTemplate.id, { onDelete: "cascade" }),
    templateVersionId: text("template_version_id")
      .notNull()
      .references(() => sduiTemplateVersion.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    contentBindings: jsonb("content_bindings")
      .$type<
        Array<{
          sectionId: string;
          bindingType: string;
          resourceId?: string;
          query?: Record<string, unknown>;
        }>
      >()
      .default([]),
    themeOverrides: jsonb("theme_overrides").$type<Record<string, unknown>>(),
    sectionOverrides: jsonb("section_overrides").$type<
      Record<string, Record<string, unknown>>
    >(),
    customCss: text("custom_css"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sdui_instance_creator_id_idx").on(table.creatorId),
    index("sdui_instance_template_id_idx").on(table.templateId),
    uniqueIndex("sdui_instance_creator_slug_idx").on(
      table.creatorId,
      table.slug,
    ),
  ],
);

// SDUI Deployments — deployment records linking instance version to a live URL
export const sduiDeployment = pgTable(
  "sdui_deployment",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    instanceId: text("instance_id")
      .notNull()
      .references(() => sduiTemplateInstance.id, { onDelete: "cascade" }),
    creatorId: text("creator_id")
      .notNull()
      .references(() => creator.id, { onDelete: "cascade" }),
    platform: sduiDeploymentPlatformEnum("platform").default("web").notNull(),
    status: sduiDeploymentStatusEnum("status").default("pending").notNull(),
    version: integer("version").notNull(),
    artifactUrl: text("artifact_url"),
    previewUrl: text("preview_url"),
    liveUrl: text("live_url"),
    resolvedJson: jsonb("resolved_json").$type<Record<string, unknown>>(),
    buildDurationMs: integer("build_duration_ms"),
    errorMessage: text("error_message"),
    deployedAt: timestamp("deployed_at"),
    rolledBackAt: timestamp("rolled_back_at"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sdui_deployment_instance_id_idx").on(table.instanceId),
    index("sdui_deployment_creator_id_idx").on(table.creatorId),
    index("sdui_deployment_status_idx").on(table.status),
  ],
);

// SDUI Deployment Logs — build/deploy event log for debugging
export const sduiDeploymentLog = pgTable(
  "sdui_deployment_log",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    deploymentId: text("deployment_id")
      .notNull()
      .references(() => sduiDeployment.id, { onDelete: "cascade" }),
    level: sduiLogLevelEnum("level").default("info").notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (table) => [
    index("sdui_deployment_log_deployment_id_idx").on(table.deploymentId),
  ],
);

// Relations
export const sduiTemplateRelations = relations(
  sduiTemplate,
  ({ one, many }) => ({
    creator: one(creator, {
      fields: [sduiTemplate.creatorId],
      references: [creator.id],
    }),
    versions: many(sduiTemplateVersion),
    instances: many(sduiTemplateInstance),
  }),
);

export const sduiTemplateVersionRelations = relations(
  sduiTemplateVersion,
  ({ one }) => ({
    template: one(sduiTemplate, {
      fields: [sduiTemplateVersion.templateId],
      references: [sduiTemplate.id],
    }),
  }),
);

export const sduiTemplateInstanceRelations = relations(
  sduiTemplateInstance,
  ({ one, many }) => ({
    creator: one(creator, {
      fields: [sduiTemplateInstance.creatorId],
      references: [creator.id],
    }),
    template: one(sduiTemplate, {
      fields: [sduiTemplateInstance.templateId],
      references: [sduiTemplate.id],
    }),
    templateVersion: one(sduiTemplateVersion, {
      fields: [sduiTemplateInstance.templateVersionId],
      references: [sduiTemplateVersion.id],
    }),
    deployments: many(sduiDeployment),
  }),
);

export const sduiDeploymentRelations = relations(
  sduiDeployment,
  ({ one, many }) => ({
    instance: one(sduiTemplateInstance, {
      fields: [sduiDeployment.instanceId],
      references: [sduiTemplateInstance.id],
    }),
    creator: one(creator, {
      fields: [sduiDeployment.creatorId],
      references: [creator.id],
    }),
    logs: many(sduiDeploymentLog),
  }),
);

export const sduiDeploymentLogRelations = relations(
  sduiDeploymentLog,
  ({ one }) => ({
    deployment: one(sduiDeployment, {
      fields: [sduiDeploymentLog.deploymentId],
      references: [sduiDeployment.id],
    }),
  }),
);
