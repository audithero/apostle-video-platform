/**
 * Meta Conversions API (CAPI) server-side event tracking.
 * Used for sending purchase events server-side for better attribution.
 *
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/
 */

import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { creatorSettings } from "@/lib/db/schema/creator";
import { eq } from "drizzle-orm";

interface CAPIEvent {
  eventName: "Purchase" | "Lead" | "CompleteRegistration" | "ViewContent";
  eventTime: number;
  userData: {
    email?: string;
    firstName?: string;
    lastName?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    contentName?: string;
    contentIds?: string[];
    contentType?: string;
  };
  eventSourceUrl?: string;
  eventId?: string;
}

function hashSHA256(value: string): string {
  return createHash("sha256").update(value.toLowerCase().trim()).digest("hex");
}

/**
 * Send a server-side event to Meta Conversions API.
 * Requires META_CAPI_ACCESS_TOKEN env var (optional - will no-op without it).
 */
export async function sendMetaCAPIEvent(
  creatorId: string,
  event: CAPIEvent,
): Promise<{ success: boolean; error?: string }> {
  // Get the creator's Meta Pixel ID
  const [settings] = await db
    .select({ metaPixelId: creatorSettings.metaPixelId })
    .from(creatorSettings)
    .where(eq(creatorSettings.creatorId, creatorId))
    .limit(1);

  const pixelId = settings?.metaPixelId;
  if (!pixelId) {
    return { success: false, error: "No Meta Pixel configured" };
  }

  // Access token from env (optional)
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  if (!accessToken) {
    return { success: false, error: "META_CAPI_ACCESS_TOKEN not configured" };
  }

  // Hash user data per Meta requirements
  const userData: Record<string, string> = {};
  if (event.userData.email) {
    userData.em = hashSHA256(event.userData.email);
  }
  if (event.userData.firstName) {
    userData.fn = hashSHA256(event.userData.firstName);
  }
  if (event.userData.lastName) {
    userData.ln = hashSHA256(event.userData.lastName);
  }
  if (event.userData.clientIpAddress) {
    userData.client_ip_address = event.userData.clientIpAddress;
  }
  if (event.userData.clientUserAgent) {
    userData.client_user_agent = event.userData.clientUserAgent;
  }
  if (event.userData.fbc) {
    userData.fbc = event.userData.fbc;
  }
  if (event.userData.fbp) {
    userData.fbp = event.userData.fbp;
  }

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime,
        event_id: event.eventId ?? crypto.randomUUID(),
        event_source_url: event.eventSourceUrl,
        action_source: "website",
        user_data: userData,
        custom_data: event.customData
          ? {
              value: event.customData.value,
              currency: event.customData.currency ?? "USD",
              content_name: event.customData.contentName,
              content_ids: event.customData.contentIds,
              content_type: event.customData.contentType ?? "product",
            }
          : undefined,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: `Meta CAPI error: ${errorBody}` };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Meta CAPI request failed: ${message}` };
  }
}

/**
 * Convenience function for sending a purchase event.
 */
export async function sendPurchaseEvent(
  creatorId: string,
  opts: {
    email: string;
    firstName?: string;
    value: number;
    currency: string;
    courseName: string;
    courseId: string;
    ipAddress?: string;
    userAgent?: string;
  },
): Promise<void> {
  await sendMetaCAPIEvent(creatorId, {
    eventName: "Purchase",
    eventTime: Math.floor(Date.now() / 1000),
    userData: {
      email: opts.email,
      firstName: opts.firstName,
      clientIpAddress: opts.ipAddress,
      clientUserAgent: opts.userAgent,
    },
    customData: {
      value: opts.value,
      currency: opts.currency,
      contentName: opts.courseName,
      contentIds: [opts.courseId],
      contentType: "product",
    },
  });
}
