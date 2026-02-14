import { createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { webhookConfig, webhookLog } from "@/lib/db/schema/marketing";
import { eq, and } from "drizzle-orm";
import { validateWebhookUrl } from "@/lib/integrations/webhook-url-validation";

type WebhookEventType =
  | "enrollment.created"
  | "enrollment.completed"
  | "payment.succeeded"
  | "payment.failed"
  | "student.created"
  | "quiz.completed"
  | "certificate.issued";

const MAX_RETRIES = 3;

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export async function dispatchWebhook(
  creatorId: string,
  event: WebhookEventType,
  data: Record<string, unknown>,
): Promise<void> {
  // Get all active webhook configs for this creator that listen to this event
  const configs = await db
    .select()
    .from(webhookConfig)
    .where(and(eq(webhookConfig.creatorId, creatorId), eq(webhookConfig.active, true)));

  const matchingConfigs = configs.filter((c) => {
    const events = c.events as string[];
    return events.includes(event);
  });

  for (const config of matchingConfigs) {
    // Defense-in-depth: re-validate URL at dispatch time in case it was
    // modified directly in the database or the validation rules changed
    try {
      validateWebhookUrl(config.url);
    } catch {
      // Log the blocked attempt and skip this webhook
      await db.insert(webhookLog).values({
        webhookConfigId: config.id,
        event,
        payload: data,
        statusCode: 0,
        responseBody: "Blocked: webhook URL failed SSRF validation",
        attemptNumber: 1,
      });
      continue;
    }
    await deliverWebhook(config, event, data);
  }
}

async function deliverWebhook(
  config: typeof webhookConfig.$inferSelect,
  event: string,
  data: Record<string, unknown>,
): Promise<void> {
  const payload = JSON.stringify({
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Webhook-Event": event,
      };

      if (config.secret) {
        headers["X-Webhook-Signature"] = signPayload(payload, config.secret);
      }

      const response = await fetch(config.url, {
        method: "POST",
        headers,
        body: payload,
        signal: AbortSignal.timeout(10_000),
      });

      const responseBody = await response.text().catch(() => "");

      // Log delivery
      await db.insert(webhookLog).values({
        webhookConfigId: config.id,
        event,
        payload: JSON.parse(payload) as Record<string, unknown>,
        statusCode: response.status,
        responseBody: responseBody.slice(0, 1000),
        attemptNumber: attempt,
      });

      if (response.ok) return;

      // Don't retry on 4xx (client errors)
      if (response.status >= 400 && response.status < 500) return;
    } catch {
      // Log failed attempt
      await db.insert(webhookLog).values({
        webhookConfigId: config.id,
        event,
        payload: JSON.parse(payload) as Record<string, unknown>,
        statusCode: 0,
        responseBody: "Connection failed",
        attemptNumber: attempt,
      });
    }

    // Exponential backoff before retry
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => {
        setTimeout(resolve, 2 ** attempt * 1000);
      });
    }
  }
}
