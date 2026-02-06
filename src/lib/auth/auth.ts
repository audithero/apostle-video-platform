import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI } from "better-auth/plugins";
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
import { ac, admin as adminRole, user as userRole } from "./permissions";

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
          await sendEmail({
            subject: "Welcome to Apostle",
            template: WelcomeEmail({
              username: user.name || user.email,
            }),
            to: user.email,
          });
        },
      },
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
      },
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "monthly",
            priceId: "price_monthly", // Replace with actual Stripe price ID
            annualDiscountPriceId: undefined,
          },
          {
            name: "annual",
            priceId: "price_annual", // Replace with actual Stripe price ID
            freeTrial: {
              days: 7,
            },
          },
        ],
      },
    }),
    tanstackStartCookies(), // keep last
  ],
});
