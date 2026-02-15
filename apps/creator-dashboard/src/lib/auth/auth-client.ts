import { adminClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";
import { ac, admin as adminRole, user as userRole } from "./permissions";

/**
 * Use the current origin in the browser (same-origin auth), or fall back to
 * VITE_SERVER_URL for SSR / dev where window isn't available.
 */
const authBaseURL =
  typeof window !== "undefined"
    ? window.location.origin
    : (import.meta.env.VITE_SERVER_URL as string | undefined) ?? "";

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [
    adminClient({
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
      },
    }),
    stripeClient({
      subscription: true,
    }),
  ],
});

export type AuthClient = ReturnType<typeof createAuthClient>;
