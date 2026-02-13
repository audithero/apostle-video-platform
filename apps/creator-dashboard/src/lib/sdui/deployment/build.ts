/**
 * SDUI Deployment Build Orchestrator
 *
 * Handles the full deployment pipeline:
 * 1. Validate instance has required data
 * 2. Resolve SDUI JSON (merge template + overrides + content bindings)
 * 3. Upload resolved artifact to R2
 * 4. Update deployment record with URLs and status
 */
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  sduiDeployment,
  sduiDeploymentLog,
  sduiTemplateInstance,
  sduiTemplateVersion,
} from "@/lib/db/schema/sdui";
import {
  getDeploymentArtifactKey,
  getPreviewArtifactKey,
  getArtifactPublicUrl,
  uploadArtifact,
} from "./artifact";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BuildResult {
  success: boolean;
  artifactUrl?: string;
  previewUrl?: string;
  error?: string;
  durationMs: number;
}

/* ------------------------------------------------------------------ */
/*  Log helper                                                         */
/* ------------------------------------------------------------------ */

async function log(
  deploymentId: string,
  level: "info" | "warning" | "error",
  message: string,
  metadata?: Record<string, unknown>,
) {
  await db.insert(sduiDeploymentLog).values({
    deploymentId,
    level,
    message,
    metadata,
  });
}

/* ------------------------------------------------------------------ */
/*  Build pipeline                                                     */
/* ------------------------------------------------------------------ */

export async function buildDeployment(
  deploymentId: string,
  creatorId: string,
): Promise<BuildResult> {
  const startTime = Date.now();

  try {
    // Mark as building
    await db
      .update(sduiDeployment)
      .set({ status: "building" })
      .where(eq(sduiDeployment.id, deploymentId));

    await log(deploymentId, "info", "Build started");

    // 1. Load deployment record
    const [deployment] = await db
      .select()
      .from(sduiDeployment)
      .where(eq(sduiDeployment.id, deploymentId))
      .limit(1);

    if (!deployment) {
      throw new Error("Deployment not found");
    }

    // 2. Load instance with its template version
    const [instance] = await db
      .select()
      .from(sduiTemplateInstance)
      .where(eq(sduiTemplateInstance.id, deployment.instanceId))
      .limit(1);

    if (!instance) {
      throw new Error("Template instance not found");
    }

    await log(deploymentId, "info", `Loaded instance: ${instance.name}`);

    // 3. Load template version JSON
    const [templateVersion] = await db
      .select()
      .from(sduiTemplateVersion)
      .where(eq(sduiTemplateVersion.id, instance.templateVersionId))
      .limit(1);

    if (!templateVersion) {
      throw new Error("Template version not found");
    }

    await log(
      deploymentId,
      "info",
      `Using template version ${String(templateVersion.version)}`,
    );

    // 4. Resolve SDUI JSON by merging template + overrides
    const resolvedJson = resolveScreenJson(
      templateVersion.templateJson,
      instance.themeOverrides as Record<string, unknown> | null,
      instance.sectionOverrides as Record<string, Record<string, unknown>> | null,
      instance.contentBindings as Array<{
        sectionId: string;
        bindingType: string;
        resourceId?: string;
      }> | null,
    );

    await log(deploymentId, "info", "SDUI JSON resolved");

    // 5. Upload artifact to R2
    const artifactKey = getDeploymentArtifactKey(creatorId, deploymentId);
    const { publicUrl: artifactUrl } = await uploadArtifact(
      artifactKey,
      resolvedJson,
    );

    await log(deploymentId, "info", "Artifact uploaded to R2", {
      key: artifactKey,
    });

    // 6. Generate preview URL
    const previewKey = getPreviewArtifactKey(creatorId, deploymentId);
    await uploadArtifact(previewKey, {
      ...resolvedJson,
      _preview: true,
      _deploymentId: deploymentId,
    });

    const previewUrl = getArtifactPublicUrl(previewKey);

    // 7. Mark previous live deployments as rolled_back for same instance+platform
    await db
      .update(sduiDeployment)
      .set({ status: "rolled_back", rolledBackAt: new Date() })
      .where(
        and(
          eq(sduiDeployment.instanceId, deployment.instanceId),
          eq(sduiDeployment.platform, deployment.platform),
          eq(sduiDeployment.status, "live"),
        ),
      );

    // 8. Update deployment to live
    const durationMs = Date.now() - startTime;

    await db
      .update(sduiDeployment)
      .set({
        status: "live",
        artifactUrl,
        previewUrl,
        resolvedJson,
        buildDurationMs: durationMs,
        deployedAt: new Date(),
      })
      .where(eq(sduiDeployment.id, deploymentId));

    await log(deploymentId, "info", `Build completed in ${String(durationMs)}ms`);

    return {
      success: true,
      artifactUrl,
      previewUrl,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - startTime;
    const errorMessage =
      err instanceof Error ? err.message : "Unknown build error";

    await db
      .update(sduiDeployment)
      .set({
        status: "failed",
        errorMessage,
        buildDurationMs: durationMs,
      })
      .where(eq(sduiDeployment.id, deploymentId));

    await log(deploymentId, "error", `Build failed: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      durationMs,
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Resolve SDUI JSON                                                  */
/* ------------------------------------------------------------------ */

/**
 * Merges template JSON with instance overrides and content bindings
 * to produce the final resolved screen JSON.
 */
function resolveScreenJson(
  templateJson: Record<string, unknown>,
  themeOverrides: Record<string, unknown> | null,
  sectionOverrides: Record<string, Record<string, unknown>> | null,
  contentBindings: Array<{
    sectionId: string;
    bindingType: string;
    resourceId?: string;
  }> | null,
): Record<string, unknown> {
  const resolved = { ...templateJson };

  // Apply theme overrides
  if (themeOverrides) {
    resolved.themeOverrides = themeOverrides;
  }

  // Apply section-level overrides
  if (sectionOverrides && Array.isArray(resolved.sections)) {
    resolved.sections = (
      resolved.sections as Array<Record<string, unknown>>
    ).map((section) => {
      const sectionId = section.id as string;
      const overrides = sectionOverrides[sectionId];
      if (overrides) {
        return {
          ...section,
          props: {
            ...(section.props as Record<string, unknown>),
            ...overrides,
          },
        };
      }
      return section;
    });
  }

  // Apply content bindings
  if (contentBindings && Array.isArray(resolved.sections)) {
    resolved.sections = (
      resolved.sections as Array<Record<string, unknown>>
    ).map((section) => {
      const sectionId = section.id as string;
      const binding = contentBindings.find((b) => b.sectionId === sectionId);
      if (binding) {
        return {
          ...section,
          _binding: {
            type: binding.bindingType,
            resourceId: binding.resourceId,
          },
        };
      }
      return section;
    });
  }

  // Add build metadata
  resolved._resolvedAt = new Date().toISOString();
  resolved._version = "1.0";

  return resolved;
}
