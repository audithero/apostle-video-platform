import { Resend } from "resend";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { env } from "@/lib/env.server";
import { db } from "@/lib/db";
import { creatorSettings, creator } from "@/lib/db/schema/creator";
import { eq } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

let resendClient: Resend | null = null;

function getClient(): Resend {
  if (resendClient) return resendClient;
  resendClient = new Resend(env.RESEND_API_KEY);
  return resendClient;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SendEmailParams {
  to: string | string[];
  subject: string;
  template: ReactElement;
  replyTo?: string;
  from?: string;
}

interface SendCreatorEmailParams {
  creatorId: string;
  to: string | string[];
  subject: string;
  template: ReactElement;
}

interface BatchEmailParams {
  creatorId: string;
  recipients: string[];
  subject: string;
  template: ReactElement;
}

interface EmailResult {
  id: string;
}

// ---------------------------------------------------------------------------
// Core send function
// ---------------------------------------------------------------------------

export async function sendEmail({
  to,
  subject,
  template,
  replyTo,
  from,
}: SendEmailParams): Promise<EmailResult | null> {
  const client = getClient();
  const html = await render(template);

  const { data, error } = await client.emails.send({
    from: from ?? env.EMAIL_FROM ?? "noreply@example.com",
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    replyTo,
  });

  if (error) {
    throw new Error(`Email send failed: ${error.message}`);
  }

  return data ?? null;
}

// ---------------------------------------------------------------------------
// Creator-branded send (resolves creator's from name / reply-to)
// ---------------------------------------------------------------------------

/**
 * Sanitize email header values to prevent header injection attacks.
 * Strips newlines, carriage returns, and null bytes.
 */
function sanitizeEmailHeader(value: string): string {
  return value.replace(/[\r\n\0]/g, "").trim().slice(0, 255);
}

export async function sendCreatorEmail({
  creatorId,
  to,
  subject,
  template,
}: SendCreatorEmailParams): Promise<EmailResult | null> {
  const [creatorRecord] = await db
    .select({ businessName: creator.businessName })
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  const [settings] = await db
    .select({
      emailFromName: creatorSettings.emailFromName,
      emailReplyTo: creatorSettings.emailReplyTo,
    })
    .from(creatorSettings)
    .where(eq(creatorSettings.creatorId, creatorId))
    .limit(1);

  const fromName = sanitizeEmailHeader(
    settings?.emailFromName ?? creatorRecord?.businessName ?? "Course Creator",
  );
  const fromAddress = env.EMAIL_FROM ?? "noreply@example.com";
  const from = `${fromName} <${fromAddress}>`;
  const replyTo = settings?.emailReplyTo ? sanitizeEmailHeader(settings.emailReplyTo) : undefined;

  return sendEmail({
    to,
    subject,
    template,
    from,
    replyTo,
  });
}

// ---------------------------------------------------------------------------
// Batch send (Resend batch API, max 100 per call)
// ---------------------------------------------------------------------------

const BATCH_SIZE = 100;

export async function sendBatchEmails({
  creatorId,
  recipients,
  subject,
  template,
}: BatchEmailParams): Promise<{ sent: number; failed: number }> {
  const client = getClient();

  const [creatorRecord] = await db
    .select({ businessName: creator.businessName })
    .from(creator)
    .where(eq(creator.id, creatorId))
    .limit(1);

  const [settings] = await db
    .select({
      emailFromName: creatorSettings.emailFromName,
      emailReplyTo: creatorSettings.emailReplyTo,
    })
    .from(creatorSettings)
    .where(eq(creatorSettings.creatorId, creatorId))
    .limit(1);

  const fromName = sanitizeEmailHeader(
    settings?.emailFromName ?? creatorRecord?.businessName ?? "Course Creator",
  );
  const fromAddress = env.EMAIL_FROM ?? "noreply@example.com";
  const from = `${fromName} <${fromAddress}>`;
  const replyTo = settings?.emailReplyTo ? sanitizeEmailHeader(settings.emailReplyTo) : undefined;
  const html = await render(template);

  let sent = 0;
  let failed = 0;

  // Process in chunks of BATCH_SIZE
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE);

    const emails = chunk.map((to) => ({
      from,
      to: [to],
      subject,
      html,
      reply_to: replyTo,
    }));

    const { data, error } = await client.batch.send(emails);

    if (error) {
      failed += chunk.length;
    } else {
      sent += data?.data?.length ?? chunk.length;
    }
  }

  return { sent, failed };
}
