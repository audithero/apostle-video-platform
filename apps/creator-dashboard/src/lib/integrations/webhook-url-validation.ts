/**
 * SSRF protection for webhook URLs.
 * Blocks requests to private/internal networks, localhost, and cloud metadata endpoints.
 */

const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "[::1]",
  "[::0]",
  "metadata.google.internal",
  "169.254.169.254",
]);

const BLOCKED_HOSTNAME_SUFFIXES = [
  ".local",
  ".internal",
  ".localhost",
];

/**
 * Returns true if the given IPv4 address string is in a private/reserved range.
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return false;
  }
  const [a, b] = parts;
  // 10.0.0.0/8
  if (a === 10) return true;
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true;
  // 127.0.0.0/8 (loopback)
  if (a === 127) return true;
  // 169.254.0.0/16 (link-local / cloud metadata)
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  return false;
}

/**
 * Validates that a webhook URL is safe to fetch (not targeting internal infrastructure).
 * Throws an error if the URL is blocked.
 */
export function validateWebhookUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid webhook URL");
  }

  // Only allow HTTPS (and HTTP for development, but block private ranges)
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Webhook URL must use HTTPS or HTTP protocol");
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block known dangerous hostnames
  if (BLOCKED_HOSTNAMES.has(hostname)) {
    throw new Error("Webhook URL must not point to localhost or internal services");
  }

  // Block hostnames with dangerous suffixes
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      throw new Error("Webhook URL must not point to internal services");
    }
  }

  // Block IP addresses in private ranges
  if (isPrivateIPv4(hostname)) {
    throw new Error("Webhook URL must not point to private IP addresses");
  }

  // Block IPv6 loopback/private embedded in brackets
  const bareIPv6 = hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : null;
  if (bareIPv6) {
    const lower = bareIPv6.toLowerCase();
    if (lower === "::1" || lower === "::0" || lower === "::" || lower.startsWith("fe80:") || lower.startsWith("fc") || lower.startsWith("fd")) {
      throw new Error("Webhook URL must not point to private IPv6 addresses");
    }
  }

  // Block cloud metadata endpoints by path pattern (AWS, GCP, Azure)
  if (hostname === "169.254.169.254") {
    throw new Error("Webhook URL must not point to cloud metadata endpoints");
  }

  // Block non-standard ports commonly used for internal services
  if (parsed.port && parsed.port !== "443" && parsed.port !== "80") {
    const portNum = Number.parseInt(parsed.port, 10);
    // Allow common webhook receiver ports but block very low ports and known internal service ports
    if (portNum < 1024 && portNum !== 80 && portNum !== 443) {
      throw new Error("Webhook URL uses a restricted port");
    }
  }
}
