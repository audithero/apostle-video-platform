/**
 * SDUI Deployment Rollback
 *
 * Handles rollback logic for deployments.
 * Since every deployment is an immutable artifact in R2,
 * rollback simply updates the routing to point to a previous deployment.
 */
import { eq, and, desc, ne } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  sduiDeployment,
  sduiDeploymentLog,
} from "@/lib/db/schema/sdui";

/* ------------------------------------------------------------------ */
/*  Rollback to specific deployment                                    */
/* ------------------------------------------------------------------ */

/**
 * Rollback to a specific previous deployment.
 * This makes the target deployment "live" and marks the current live one as "rolled_back".
 */
export async function rollbackToDeployment(
  deploymentId: string,
  creatorId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Load the target deployment
    const [target] = await db
      .select()
      .from(sduiDeployment)
      .where(
        and(
          eq(sduiDeployment.id, deploymentId),
          eq(sduiDeployment.creatorId, creatorId),
        ),
      )
      .limit(1);

    if (!target) {
      return { success: false, error: "Deployment not found" };
    }

    if (!target.artifactUrl) {
      return {
        success: false,
        error: "Deployment has no artifact — cannot rollback to an unbuilt deployment",
      };
    }

    // Mark current live deployment(s) as rolled_back
    // Include creatorId check for defense-in-depth multi-tenant isolation
    await db
      .update(sduiDeployment)
      .set({ status: "rolled_back", rolledBackAt: new Date() })
      .where(
        and(
          eq(sduiDeployment.instanceId, target.instanceId),
          eq(sduiDeployment.platform, target.platform),
          eq(sduiDeployment.status, "live"),
          eq(sduiDeployment.creatorId, creatorId),
        ),
      );

    // Make the target deployment live again
    await db
      .update(sduiDeployment)
      .set({
        status: "live",
        deployedAt: new Date(),
        rolledBackAt: null,
      })
      .where(eq(sduiDeployment.id, deploymentId));

    // Log the rollback
    await db.insert(sduiDeploymentLog).values({
      deploymentId,
      level: "info",
      message: `Rolled back to deployment v${String(target.version)}`,
    });

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown rollback error";
    return { success: false, error: message };
  }
}

/* ------------------------------------------------------------------ */
/*  Get rollback candidates                                            */
/* ------------------------------------------------------------------ */

/**
 * Returns previous deployments that can be rolled back to.
 * Only deployments with artifacts (successfully built) are eligible.
 */
export async function getRollbackCandidates(
  instanceId: string,
  creatorId: string,
  platform: "web" | "mobile_ios" | "mobile_android" | "tvos" = "web",
  limit = 10,
) {
  return db
    .select({
      id: sduiDeployment.id,
      version: sduiDeployment.version,
      status: sduiDeployment.status,
      artifactUrl: sduiDeployment.artifactUrl,
      previewUrl: sduiDeployment.previewUrl,
      deployedAt: sduiDeployment.deployedAt,
      buildDurationMs: sduiDeployment.buildDurationMs,
      createdAt: sduiDeployment.createdAt,
    })
    .from(sduiDeployment)
    .where(
      and(
        eq(sduiDeployment.instanceId, instanceId),
        eq(sduiDeployment.creatorId, creatorId),
        eq(sduiDeployment.platform, platform),
        ne(sduiDeployment.status, "pending"),
        ne(sduiDeployment.status, "building"),
      ),
    )
    .orderBy(desc(sduiDeployment.version))
    .limit(limit);
}
