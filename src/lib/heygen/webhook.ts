import { createHmac, timingSafeEqual } from "node:crypto";
import type { HeyGenWebhookPayload } from "./types";

export function verifyHeyGenWebhook(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const computed = createHmac("sha256", secret).update(payload).digest("hex");

  if (computed.length !== signature.length) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(computed, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

export function parseWebhookPayload(body: string): HeyGenWebhookPayload {
  return JSON.parse(body) as HeyGenWebhookPayload;
}
