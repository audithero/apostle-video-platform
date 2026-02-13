import { env } from "./env.server";

/**
 * Generate a signed JWT for Mux playback.
 * Requires MUX_SIGNING_KEY_ID and MUX_SIGNING_KEY_PRIVATE to be set.
 */
export async function generateMuxToken(
  playbackId: string,
  type: "video" | "thumbnail" | "storyboard" = "video"
): Promise<string> {
  const signingKeyId = env.MUX_SIGNING_KEY_ID;
  const signingKeyPrivate = env.MUX_SIGNING_KEY_PRIVATE;

  if (!signingKeyId || !signingKeyPrivate) {
    // If no signing keys, return the playback ID directly (unsigned)
    return playbackId;
  }

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 60 * 60; // 1 hour expiry

  // Build JWT header
  const header = {
    typ: "JWT",
    alg: "RS256",
    kid: signingKeyId,
  };

  // Build JWT payload
  const payload: Record<string, unknown> = {
    sub: playbackId,
    aud: type === "video" ? "v" : type === "thumbnail" ? "t" : "s",
    exp,
    kid: signingKeyId,
  };

  // Encode
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // Sign with RSA-SHA256
  const privateKeyPem = Buffer.from(signingKeyPrivate, "base64").toString("utf-8");
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${signingInput}.${encodedSignature}`;
}

function base64UrlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const lines = pem.split("\n").filter((line) => !line.startsWith("-----"));
  const base64 = lines.join("");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
