import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

config();

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional().default("http://localhost:3000"),
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string(),
    BETTER_AUTH_SECRET: z.string(),

    // Stripe
    STRIPE_SECRET_KEY: z.string(),
    STRIPE_WEBHOOK_SECRET: z.string(),

    // Mux
    MUX_TOKEN_ID: z.string(),
    MUX_TOKEN_SECRET: z.string(),
    MUX_WEBHOOK_SECRET: z.string(),
    MUX_SIGNING_KEY_ID: z.string().optional(),
    MUX_SIGNING_KEY_PRIVATE: z.string().optional(),

    // Cloudflare R2
    R2_ACCOUNT_ID: z.string(),
    R2_ACCESS_KEY_ID: z.string(),
    R2_SECRET_ACCESS_KEY: z.string(),
    R2_BUCKET_NAME: z.string(),
    R2_PUBLIC_URL: z.string().url(),
  },

  clientPrefix: "VITE_",
  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
