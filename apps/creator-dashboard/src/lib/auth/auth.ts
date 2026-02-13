import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, mcp, openAPI } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import ResetPasswordEmail from "@/components/emails/reset-password-email";
import VerifyEmail from "@/components/emails/verify-email";
import WelcomeEmail from "@/components/emails/welcome-email";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema/auth";
import { sendEmail } from "@/lib/resend";
import { env } from "../env.server";
import { ac, admin as adminRole, user as userRole, creatorRole } from "./permissions";

const stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  secret: env.BETTER_AUTH_SECRET,
  basePath: "/api/auth",
  baseURL: env.SERVER_URL,
  trustedOrigins: [env.SERVER_URL],
  onAPIError: {
    throw: true,
    onError: (error) => {
      console.error("auth onAPIError", error);
    },
    errorURL: "/login",
  },
  rateLimit: {
    enabled: true,
    max: 100,
    window: 10,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  logger: {
    enabled: true,
    level: "info",
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await sendEmail({
              subject: "Welcome to Apostle",
              template: WelcomeEmail({
                username: user.name || user.email,
              }),
              to: user.email,
            });
          } catch (err) {
            console.error("Failed to send welcome email:", err);
          }
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      enabled: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    async sendResetPassword({ url, user }) {
      await sendEmail({
        subject: "Reset your password",
        template: ResetPasswordEmail({
          resetLink: url,
          username: user.email,
        }),
        to: user.email,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ url, user }) => {
      await sendEmail({
        subject: "Verify your email",
        template: VerifyEmail({
          url,
          username: user.email,
        }),
        to: user.email,
      });
    },
  },

  plugins: [
    openAPI(),
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
      ac,
      roles: {
        user: userRole,
        admin: adminRole,
        creator: creatorRole,
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          // Launch tier
          {
            name: "launch-monthly",
            priceId: env.STRIPE_PRICE_LAUNCH_MONTHLY ?? "price_launch_monthly",
          },
          {
            name: "launch-annual",
            priceId: env.STRIPE_PRICE_LAUNCH_ANNUAL ?? "price_launch_annual",
            freeTrial: { days: 14 },
          },
          // Grow tier
          {
            name: "grow-monthly",
            priceId: env.STRIPE_PRICE_GROW_MONTHLY ?? "price_grow_monthly",
          },
          {
            name: "grow-annual",
            priceId: env.STRIPE_PRICE_GROW_ANNUAL ?? "price_grow_annual",
            freeTrial: { days: 14 },
          },
          // Scale tier
          {
            name: "scale-monthly",
            priceId: env.STRIPE_PRICE_SCALE_MONTHLY ?? "price_scale_monthly",
          },
          {
            name: "scale-annual",
            priceId: env.STRIPE_PRICE_SCALE_ANNUAL ?? "price_scale_annual",
            freeTrial: { days: 14 },
          },
          // Pro tier
          {
            name: "pro-monthly",
            priceId: env.STRIPE_PRICE_PRO_MONTHLY ?? "price_pro_monthly",
          },
          {
            name: "pro-annual",
            priceId: env.STRIPE_PRICE_PRO_ANNUAL ?? "price_pro_annual",
            freeTrial: { days: 14 },
          },
        ],
      },
    }),
    mcp({
      loginPage: "/login",
    }),
    tanstackStartCookies(), // keep last
  ],
});
