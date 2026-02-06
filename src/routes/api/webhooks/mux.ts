import { createFileRoute } from "@tanstack/react-router";
import { db } from "@/lib/db";
import { video } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/lib/env.server";

async function verifyMuxSignature(
  body: string,
  signature: string | null,
): Promise<boolean> {
  if (!signature) return false;

  const parts = signature.split(",");
  const timestampPart = parts.find((p) => p.startsWith("t="));
  const signaturePart = parts.find((p) => p.startsWith("v1="));

  if (!timestampPart || !signaturePart) return false;

  const timestamp = timestampPart.slice(2);
  const expectedSignature = signaturePart.slice(3);

  const payload = `${timestamp}.${body}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.MUX_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computedSignature = Array.from(new Uint8Array(signed))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === expectedSignature;
}

export const Route = createFileRoute("/api/webhooks/mux")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.text();
        const signature = request.headers.get("mux-signature");

        const isValid = await verifyMuxSignature(body, signature);
        if (!isValid) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: any;
        try {
          event = JSON.parse(body);
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { type, data } = event;

        switch (type) {
          case "video.asset.ready": {
            const assetId = data.id as string;
            const playbackId = data.playback_ids?.[0]?.id as string | undefined;
            const durationSeconds = data.duration
              ? Math.round(data.duration)
              : null;

            await db
              .update(video)
              .set({
                status: "ready",
                muxPlaybackId: playbackId ?? null,
                duration: durationSeconds,
                updatedAt: new Date(),
              })
              .where(eq(video.muxAssetId, assetId));
            break;
          }

          case "video.asset.created": {
            const assetId = data.id as string;
            const uploadId = data.upload_id as string | undefined;

            if (uploadId) {
              await db
                .update(video)
                .set({
                  muxAssetId: assetId,
                  status: "processing",
                  updatedAt: new Date(),
                })
                .where(eq(video.muxUploadId, uploadId));
            }
            break;
          }

          case "video.asset.errored": {
            const assetId = data.id as string;

            await db
              .update(video)
              .set({
                status: "errored",
                updatedAt: new Date(),
              })
              .where(eq(video.muxAssetId, assetId));
            break;
          }
        }

        return new Response("OK", { status: 200 });
      },
    },
  },
});
