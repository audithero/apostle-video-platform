import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env.server";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

interface PresignedUploadOptions {
  key: string;
  contentType: string;
  maxSizeBytes?: number;
  expiresIn?: number; // seconds, default 600 (10 min)
}

/** Content types that are safe to serve inline (not executable in browsers). */
const SAFE_INLINE_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "video/mp4", "video/webm", "audio/mpeg", "audio/ogg",
  "application/pdf",
]);

export async function getPresignedUploadUrl({
  key,
  contentType,
  expiresIn = 600,
}: PresignedUploadOptions): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    // Force download for non-safe types to prevent XSS via uploaded HTML/SVG
    ...(SAFE_INLINE_TYPES.has(contentType) ? {} : { ContentDisposition: "attachment" }),
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });

  return {
    uploadUrl,
    key,
    publicUrl: `${env.R2_PUBLIC_URL}/${key}`,
  };
}

export async function getPresignedDownloadUrl(
  key: string,
  expiresIn = 14400, // 4 hours default
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(r2Client, command, { expiresIn });
}

export function generateVideoKey(creatorId: string, lessonId: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "mp4";
  const timestamp = Date.now();
  return `creators/${creatorId}/videos/${lessonId}/${String(timestamp)}.${ext}`;
}

export function generateImageKey(creatorId: string, purpose: string, filename: string): string {
  const ext = filename.split(".").pop() ?? "png";
  const timestamp = Date.now();
  return `creators/${creatorId}/images/${purpose}/${String(timestamp)}.${ext}`;
}

export function generateCertificateKey(creatorId: string, serial: string): string {
  return `creators/${creatorId}/certificates/${serial}.pdf`;
}

export function getPublicUrl(key: string): string {
  return `${env.R2_PUBLIC_URL}/${key}`;
}
