import { adminClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { createAuthClient } from "better-auth/react";
import { env } from "@/lib/env.client";
import { ac, admin as adminRole, user as userRole } from "./permissions";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
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
