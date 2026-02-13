import { db } from "@/lib/db";
import { affiliate, affiliateReferral } from "@/lib/db/schema/marketing";
import { eq, and, sql } from "drizzle-orm";

const COOKIE_NAME = "aff_ref";

/**
 * Extracts a referral code from a URL's `?ref=CODE` query parameter.
 * Returns the code or null if not present.
 */
export function extractReferralCode(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("ref");
  } catch {
    return null;
  }
}

/**
 * Returns a Set-Cookie header value for the affiliate referral cookie.
 * Called when a visitor arrives with `?ref=CODE`.
 *
 * @param code - The affiliate referral code
 * @param cookieDays - How many days the cookie should persist (default 30)
 */
export function createReferralCookie(code: string, cookieDays = 30): string {
  const maxAge = cookieDays * 24 * 60 * 60;
  return `${COOKIE_NAME}=${encodeURIComponent(code)}; Max-Age=${String(maxAge)}; Path=/; SameSite=Lax; Secure`;
}

/**
 * Parses the affiliate referral code from a Cookie header string.
 */
export function parseReferralCookie(cookieHeader: string): string | null {
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name === COOKIE_NAME) {
      const value = valueParts.join("=");
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

/**
 * Returns a Set-Cookie header value that clears the affiliate cookie.
 * Call this after a successful attribution to prevent double-counting.
 */
export function clearReferralCookie(): string {
  return `${COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
}

/**
 * Validates that a referral code belongs to an active affiliate
 * and returns the affiliate record if valid.
 */
export async function validateReferralCode(code: string): Promise<{
  valid: boolean;
  affiliateId: string | null;
  creatorId: string | null;
  commissionPercent: number | null;
  commissionFixedCents: number | null;
  cookieDays: number;
}> {
  const [aff] = await db
    .select({
      id: affiliate.id,
      creatorId: affiliate.creatorId,
      commissionPercent: affiliate.commissionPercent,
      commissionFixedCents: affiliate.commissionFixedCents,
      cookieDays: affiliate.cookieDays,
      status: affiliate.status,
    })
    .from(affiliate)
    .where(
      and(
        eq(affiliate.referralCode, code),
        eq(affiliate.status, "active"),
      ),
    )
    .limit(1);

  if (!aff) {
    return {
      valid: false,
      affiliateId: null,
      creatorId: null,
      commissionPercent: null,
      commissionFixedCents: null,
      cookieDays: 30,
    };
  }

  return {
    valid: true,
    affiliateId: aff.id,
    creatorId: aff.creatorId,
    commissionPercent: aff.commissionPercent,
    commissionFixedCents: aff.commissionFixedCents,
    cookieDays: aff.cookieDays ?? 30,
  };
}

/**
 * Attributes a purchase to an affiliate and records the referral.
 * Called during the enrollment/purchase flow when a referral cookie is present.
 *
 * @param referralCode - The affiliate's referral code (from cookie)
 * @param referredUserId - The user who made the purchase
 * @param amountCents - The purchase amount in cents
 * @param enrollmentId - Optional enrollment ID for the purchase
 * @returns The created referral record, or null if attribution failed
 */
export async function attributePurchase(
  referralCode: string,
  referredUserId: string,
  amountCents: number,
  enrollmentId?: string,
): Promise<{
  attributed: boolean;
  referralId: string | null;
  commissionCents: number;
}> {
  const validation = await validateReferralCode(referralCode);

  if (!validation.valid || !validation.affiliateId) {
    return { attributed: false, referralId: null, commissionCents: 0 };
  }

  // Calculate commission: use fixed amount if set, otherwise percentage
  const commissionCents = validation.commissionFixedCents
    ? validation.commissionFixedCents
    : Math.round((amountCents * (validation.commissionPercent ?? 20)) / 100);

  // Create the referral record
  const [referral] = await db
    .insert(affiliateReferral)
    .values({
      affiliateId: validation.affiliateId,
      referredUserId,
      referredEnrollmentId: enrollmentId ?? null,
      commissionCents,
    })
    .returning();

  // Update affiliate totals
  await db
    .update(affiliate)
    .set({
      totalReferrals: sql`${affiliate.totalReferrals} + 1`,
      totalEarningsCents: sql`${affiliate.totalEarningsCents} + ${commissionCents}`,
    })
    .where(eq(affiliate.id, validation.affiliateId));

  return {
    attributed: true,
    referralId: referral.id,
    commissionCents,
  };
}

/**
 * Middleware-style handler for processing referral codes from incoming requests.
 * Checks for `?ref=CODE` in the URL, validates it, and returns the appropriate
 * Set-Cookie header to set or refresh the attribution cookie.
 *
 * Use this in your request handler/middleware:
 * ```
 * const result = await handleReferralVisit(request.url, request.headers.get("cookie") ?? "");
 * if (result.setCookie) {
 *   response.headers.set("Set-Cookie", result.setCookie);
 * }
 * ```
 */
export async function handleReferralVisit(
  url: string,
  cookieHeader: string,
): Promise<{
  hasReferral: boolean;
  code: string | null;
  setCookie: string | null;
}> {
  // Check URL for ?ref=CODE
  const codeFromUrl = extractReferralCode(url);

  if (codeFromUrl) {
    // New referral code in URL - validate and set cookie
    const validation = await validateReferralCode(codeFromUrl);

    if (validation.valid) {
      return {
        hasReferral: true,
        code: codeFromUrl,
        setCookie: createReferralCookie(codeFromUrl, validation.cookieDays),
      };
    }

    // Invalid code - don't set cookie
    return { hasReferral: false, code: null, setCookie: null };
  }

  // No code in URL - check existing cookie
  const existingCode = parseReferralCookie(cookieHeader);

  if (existingCode) {
    return { hasReferral: true, code: existingCode, setCookie: null };
  }

  return { hasReferral: false, code: null, setCookie: null };
}
