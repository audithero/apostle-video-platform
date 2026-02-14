import { z } from "zod";
import { and, desc, eq, or } from "drizzle-orm";
import {
  createTRPCRouter,
  creatorProcedure,
  publicProcedure,
} from "@/lib/trpc/init";
import { db } from "@/lib/db";
import {
  sduiTemplate,
  sduiTemplateVersion,
  sduiTemplateInstance,
  sduiDeployment,
  sduiDeploymentLog,
} from "@/lib/db/schema/sdui";
import { creator } from "@/lib/db/schema/creator";
import { buildDeployment } from "@/lib/sdui/deployment/build";
import { rollbackToDeployment } from "@/lib/sdui/deployment/rollback";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const templatesRouter = createTRPCRouter({
  list: creatorProcedure
    .input(
      z
        .object({
          category: z
            .enum([
              "landing",
              "learning",
              "community",
              "commerce",
              "dashboard",
              "general",
            ])
            .optional(),
          status: z.enum(["draft", "published", "archived"]).optional(),
          includeStarter: z.boolean().default(true),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [];

      if (input?.category) {
        conditions.push(eq(sduiTemplate.category, input.category));
      }
      if (input?.status) {
        conditions.push(eq(sduiTemplate.status, input.status));
      }

      if (input?.includeStarter !== false) {
        conditions.push(
          or(eq(sduiTemplate.creatorId, ctx.creator.id), eq(sduiTemplate.isStarterTemplate, true)),
        );
      } else {
        conditions.push(eq(sduiTemplate.creatorId, ctx.creator.id));
      }

      return db
        .select()
        .from(sduiTemplate)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(sduiTemplate.updatedAt));
    }),

  get: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [template] = await db
        .select()
        .from(sduiTemplate)
        .where(
          and(
            eq(sduiTemplate.id, input.id),
            or(eq(sduiTemplate.creatorId, ctx.creator.id), eq(sduiTemplate.isStarterTemplate, true)),
          ),
        )
        .limit(1);

      if (!template) {
        return null;
      }

      const latestVersion = template.currentVersionId
        ? await db
            .select()
            .from(sduiTemplateVersion)
            .where(eq(sduiTemplateVersion.id, template.currentVersionId))
            .limit(1)
            .then((rows) => rows.at(0) ?? null)
        : null;

      return { ...template, latestVersion };
    }),

  create: creatorProcedure
    .input(
      z.object({
        name: z.string().min(1).max(200),
        description: z.string().optional(),
        category: z
          .enum([
            "landing",
            "learning",
            "community",
            "commerce",
            "dashboard",
            "general",
          ])
          .default("general"),
        templateJson: z.record(z.string(), z.unknown()).optional(),
        themeJson: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      let slug = slugify(input.name);

      const existing = await db
        .select({ id: sduiTemplate.id })
        .from(sduiTemplate)
        .where(
          and(
            eq(sduiTemplate.creatorId, ctx.creator.id),
            eq(sduiTemplate.slug, slug),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const [template] = await db
        .insert(sduiTemplate)
        .values({
          creatorId: ctx.creator.id,
          name: input.name,
          slug,
          description: input.description,
          category: input.category,
        })
        .returning();

      if (input.templateJson) {
        const [version] = await db
          .insert(sduiTemplateVersion)
          .values({
            templateId: template.id,
            version: 1,
            templateJson: input.templateJson,
            themeJson: input.themeJson,
          })
          .returning();

        await db
          .update(sduiTemplate)
          .set({ currentVersionId: version.id })
          .where(eq(sduiTemplate.id, template.id));

        return { ...template, currentVersionId: version.id };
      }

      return template;
    }),

  saveVersion: creatorProcedure
    .input(
      z.object({
        templateId: z.string(),
        templateJson: z.record(z.string(), z.unknown()),
        themeJson: z.record(z.string(), z.unknown()).optional(),
        componentVersions: z.record(z.string(), z.string()).optional(),
        changelog: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [template] = await db
        .select()
        .from(sduiTemplate)
        .where(
          and(
            eq(sduiTemplate.id, input.templateId),
            eq(sduiTemplate.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!template) {
        throw new Error("Template not found");
      }

      const [latestVersion] = await db
        .select({ version: sduiTemplateVersion.version })
        .from(sduiTemplateVersion)
        .where(eq(sduiTemplateVersion.templateId, input.templateId))
        .orderBy(desc(sduiTemplateVersion.version))
        .limit(1);

      const nextVersion = (latestVersion?.version ?? 0) + 1;

      const [version] = await db
        .insert(sduiTemplateVersion)
        .values({
          templateId: input.templateId,
          version: nextVersion,
          templateJson: input.templateJson,
          themeJson: input.themeJson,
          componentVersions: input.componentVersions,
          changelog: input.changelog,
        })
        .returning();

      await db
        .update(sduiTemplate)
        .set({ currentVersionId: version.id, updatedAt: new Date() })
        .where(eq(sduiTemplate.id, input.templateId));

      return version;
    }),

  delete: creatorProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(sduiTemplate)
        .set({ status: "archived", updatedAt: new Date() })
        .where(
          and(
            eq(sduiTemplate.id, input.id),
            eq(sduiTemplate.creatorId, ctx.creator.id),
          ),
        );
      return { success: true };
    }),
});

const instancesRouter = createTRPCRouter({
  list: creatorProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(sduiTemplateInstance)
      .where(eq(sduiTemplateInstance.creatorId, ctx.creator.id))
      .orderBy(desc(sduiTemplateInstance.updatedAt));
  }),

  get: creatorProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [instance] = await db
        .select()
        .from(sduiTemplateInstance)
        .where(
          and(
            eq(sduiTemplateInstance.id, input.id),
            eq(sduiTemplateInstance.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!instance) {
        return null;
      }

      const [templateVersion] = await db
        .select()
        .from(sduiTemplateVersion)
        .where(eq(sduiTemplateVersion.id, instance.templateVersionId))
        .limit(1);

      return { ...instance, templateVersion: templateVersion ?? null };
    }),

  create: creatorProcedure
    .input(
      z.object({
        templateId: z.string(),
        name: z.string().min(1).max(200),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify the template exists AND the creator has access
      // (either it's their own template or a starter template)
      const [template] = await db
        .select()
        .from(sduiTemplate)
        .where(
          and(
            eq(sduiTemplate.id, input.templateId),
            or(eq(sduiTemplate.creatorId, ctx.creator.id), eq(sduiTemplate.isStarterTemplate, true)),
          ),
        )
        .limit(1);

      if (!template || !template.currentVersionId) {
        throw new Error("Template not found or has no version");
      }

      let slug = slugify(input.name);

      const existing = await db
        .select({ id: sduiTemplateInstance.id })
        .from(sduiTemplateInstance)
        .where(
          and(
            eq(sduiTemplateInstance.creatorId, ctx.creator.id),
            eq(sduiTemplateInstance.slug, slug),
          ),
        )
        .limit(1);

      if (existing.length > 0) {
        slug = `${slug}-${Date.now().toString(36)}`;
      }

      const [instance] = await db
        .insert(sduiTemplateInstance)
        .values({
          creatorId: ctx.creator.id,
          templateId: input.templateId,
          templateVersionId: template.currentVersionId,
          name: input.name,
          slug,
        })
        .returning();

      return instance;
    }),

  updateBindings: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        contentBindings: z.array(
          z.object({
            sectionId: z.string(),
            bindingType: z.string(),
            resourceId: z.string().optional(),
            query: z.record(z.string(), z.unknown()).optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(sduiTemplateInstance)
        .set({
          contentBindings: input.contentBindings,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sduiTemplateInstance.id, input.id),
            eq(sduiTemplateInstance.creatorId, ctx.creator.id),
          ),
        )
        .returning();
      return updated;
    }),

  updateTheme: creatorProcedure
    .input(
      z.object({
        id: z.string(),
        themeOverrides: z.record(z.string(), z.unknown()),
        sectionOverrides: z
          .record(z.string(), z.record(z.string(), z.unknown()))
          .optional(),
        customCss: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(sduiTemplateInstance)
        .set({
          themeOverrides: input.themeOverrides,
          sectionOverrides: input.sectionOverrides,
          customCss: input.customCss,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(sduiTemplateInstance.id, input.id),
            eq(sduiTemplateInstance.creatorId, ctx.creator.id),
          ),
        )
        .returning();
      return updated;
    }),
});

const deploymentsRouter = createTRPCRouter({
  list: creatorProcedure
    .input(
      z
        .object({
          instanceId: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const conditions = [eq(sduiDeployment.creatorId, ctx.creator.id)];

      if (input?.instanceId) {
        conditions.push(eq(sduiDeployment.instanceId, input.instanceId));
      }

      return db
        .select()
        .from(sduiDeployment)
        .where(and(...conditions))
        .orderBy(desc(sduiDeployment.createdAt));
    }),

  create: creatorProcedure
    .input(
      z.object({
        instanceId: z.string(),
        platform: z
          .enum(["web", "mobile_ios", "mobile_android", "tvos"])
          .default("web"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [instance] = await db
        .select()
        .from(sduiTemplateInstance)
        .where(
          and(
            eq(sduiTemplateInstance.id, input.instanceId),
            eq(sduiTemplateInstance.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!instance) {
        throw new Error("Instance not found");
      }

      const [latestDeployment] = await db
        .select({ version: sduiDeployment.version })
        .from(sduiDeployment)
        .where(
          and(
            eq(sduiDeployment.instanceId, input.instanceId),
            eq(sduiDeployment.platform, input.platform),
          ),
        )
        .orderBy(desc(sduiDeployment.version))
        .limit(1);

      const nextVersion = (latestDeployment?.version ?? 0) + 1;

      const [deployment] = await db
        .insert(sduiDeployment)
        .values({
          instanceId: input.instanceId,
          creatorId: ctx.creator.id,
          platform: input.platform,
          version: nextVersion,
          status: "pending",
        })
        .returning();

      await db.insert(sduiDeploymentLog).values({
        deploymentId: deployment.id,
        level: "info",
        message: `Deployment v${nextVersion} created for ${input.platform}`,
      });

      // Trigger the build pipeline (runs synchronously for now)
      const buildResult = await buildDeployment(
        deployment.id,
        ctx.creator.id,
      );

      if (!buildResult.success) {
        return {
          ...deployment,
          status: "failed" as const,
          error: buildResult.error,
        };
      }

      // Return updated deployment with build info
      const [updated] = await db
        .select()
        .from(sduiDeployment)
        .where(eq(sduiDeployment.id, deployment.id))
        .limit(1);

      return updated ?? deployment;
    }),

  rollback: creatorProcedure
    .input(
      z.object({
        deploymentId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await rollbackToDeployment(
        input.deploymentId,
        ctx.creator.id,
      );

      if (!result.success) {
        throw new Error(result.error ?? "Rollback failed");
      }

      const [updated] = await db
        .select()
        .from(sduiDeployment)
        .where(eq(sduiDeployment.id, input.deploymentId))
        .limit(1);

      return updated;
    }),

  getLogs: creatorProcedure
    .input(z.object({ deploymentId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [deployment] = await db
        .select({ id: sduiDeployment.id })
        .from(sduiDeployment)
        .where(
          and(
            eq(sduiDeployment.id, input.deploymentId),
            eq(sduiDeployment.creatorId, ctx.creator.id),
          ),
        )
        .limit(1);

      if (!deployment) {
        throw new Error("Deployment not found");
      }

      return db
        .select()
        .from(sduiDeploymentLog)
        .where(eq(sduiDeploymentLog.deploymentId, input.deploymentId))
        .orderBy(desc(sduiDeploymentLog.createdAt));
    }),
});

const renderRouter = createTRPCRouter({
  resolve: publicProcedure
    .input(
      z.object({
        domain: z.string().optional(),
        creatorSlug: z.string().optional(),
        path: z.string().default("/"),
      }),
    )
    .query(async ({ input }) => {
      let creatorId: string | undefined;

      if (input.domain) {
        const [creatorRecord] = await db
          .select({ id: creator.id })
          .from(creator)
          .where(eq(creator.customDomain, input.domain))
          .limit(1);
        creatorId = creatorRecord?.id;
      } else if (input.creatorSlug) {
        const [creatorRecord] = await db
          .select({ id: creator.id })
          .from(creator)
          .where(eq(creator.slug, input.creatorSlug))
          .limit(1);
        creatorId = creatorRecord?.id;
      }

      if (!creatorId) {
        return null;
      }

      const [liveDeployment] = await db
        .select({
          resolvedJson: sduiDeployment.resolvedJson,
          liveUrl: sduiDeployment.liveUrl,
          version: sduiDeployment.version,
          instanceId: sduiDeployment.instanceId,
        })
        .from(sduiDeployment)
        .innerJoin(
          sduiTemplateInstance,
          eq(sduiDeployment.instanceId, sduiTemplateInstance.id),
        )
        .where(
          and(
            eq(sduiDeployment.creatorId, creatorId),
            eq(sduiDeployment.status, "live"),
            eq(sduiDeployment.platform, "web"),
            eq(sduiTemplateInstance.slug, input.path.replace(/^\//, "") || "home"),
          ),
        )
        .orderBy(desc(sduiDeployment.version))
        .limit(1);

      if (!liveDeployment) {
        return null;
      }

      return {
        screen: liveDeployment.resolvedJson,
        version: liveDeployment.version,
        instanceId: liveDeployment.instanceId,
      };
    }),
});

export const sduiRouter = createTRPCRouter({
  templates: templatesRouter,
  instances: instancesRouter,
  deployments: deploymentsRouter,
  render: renderRouter,
});
