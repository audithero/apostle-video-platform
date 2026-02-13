/**
 * SDUI Deployment Artifact Management
 *
 * Handles uploading, retrieving, and managing deployment artifacts in Cloudflare R2.
 * Each deployment gets an immutable JSON artifact stored at a deterministic path.
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { env } from "@/lib/env.server";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

/* ------------------------------------------------------------------ */
/*  Key generation                                                     */
/* ------------------------------------------------------------------ */

/** Generates the R2 key for a deployment artifact */
export function getDeploymentArtifactKey(
  creatorId: string,
  deploymentId: string,
): string {
  return `deployments/${creatorId}/${deploymentId}/screen.json`;
}

/** Generates the R2 key for a deployment preview */
export function getPreviewArtifactKey(
  creatorId: string,
  deploymentId: string,
): string {
  return `deployments/${creatorId}/${deploymentId}/preview.json`;
}

/** Gets the public URL for a deployment artifact */
export function getArtifactPublicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`;
}

/* ------------------------------------------------------------------ */
/*  Upload / Download / Delete                                         */
/* ------------------------------------------------------------------ */

/** Upload a resolved SDUI JSON artifact to R2 */
export async function uploadArtifact(
  key: string,
  data: Record<string, unknown>,
): Promise<{ publicUrl: string }> {
  const body = JSON.stringify(data);

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: "application/json",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return { publicUrl: getArtifactPublicUrl(key) };
}

/** Download a deployment artifact from R2 */
export async function downloadArtifact(
  key: string,
): Promise<Record<string, unknown> | null> {
  try {
    const response = await r2Client.send(
      new GetObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      }),
    );

    const body = await response.Body?.transformToString();
    if (!body) return null;

    return JSON.parse(body) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Delete a deployment artifact from R2 */
export async function deleteArtifact(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}
