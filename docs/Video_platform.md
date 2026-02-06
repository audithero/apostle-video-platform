# Building a cooking show subscription platform on fullstack-start-template

**This document provides a complete, implementation-ready blueprint for building a gated video subscription platform on top of the CarlosZiegler/fullstack-start-template repo.** The stack combines TanStack Start (Vite 6+, React 19) with Better Auth, Drizzle ORM on Neon Postgres, Mux for video, Stripe for billing, and Cloudflare R2 for static assets. Every section below contains specific package versions, configuration patterns, and architecture decisions a developer can follow step-by-step.

---

## The foundation: what the template gives you

The CarlosZiegler/fullstack-start-template is a **266+ star, production-ready TanStack Start boilerplate** using **Bun** as its package manager (confirmed by `bun.lock` in root). The project has migrated to the post-Vinxi architecture where TanStack Start runs as a Vite plugin via `vite.config.ts`, not `app.config.ts`.

### File structure at a glance

```
fullstack-start-template/
├── src/
│   ├── app/                  # Root layout, entry point
│   ├── components/           # Reusable UI (shadcn/ui)
│   ├── features/             # Feature-specific logic (auth, org, AI)
│   ├── hooks/                # Custom React hooks
│   ├── lib/
│   │   ├── auth/             # Better Auth server + client
│   │   ├── db/               # Drizzle ORM setup + schema
│   │   ├── intl/             # i18next i18n
│   │   ├── trpc/             # tRPC client + server
│   │   ├── ai/               # MCP tools, AI utilities
│   │   ├── env.client.ts     # T3 Env (type-safe client vars)
│   │   ├── env.server.ts     # T3 Env (server vars)
│   │   └── resend.ts         # Email via Resend + React Email
│   ├── routes/
│   │   ├── __root.tsx        # Root route layout
│   │   ├── (auth)/           # Protected route group
│   │   ├── (public)/         # Public route group
│   │   ├── api/auth/         # Better Auth handler
│   │   ├── api/ai/           # AI endpoints (MCP, Vercel chat)
│   │   └── dashboard/        # Dashboard pages
│   └── styles/               # CSS/Tailwind
├── drizzle.config.ts
├── vite.config.ts
├── bun.lock
├── biome.json                # Linting (Biome, not ESLint)
├── components.json           # shadcn/ui config
├── Dockerfile / compose.yaml # Docker + nginx
└── package.json
```

### Core dependencies (confirmed)

| Layer | Technology | Version Range |
|-------|-----------|---------------|
| Framework | `@tanstack/react-start` | Latest (Vite 6+ plugin) |
| UI | React 19, Tailwind CSS (likely v4), shadcn/ui | Latest |
| Routing | `@tanstack/react-router` (file-based) | Latest |
| API | tRPC v11 (`@trpc/server`, `@trpc/client`, `@trpc/tanstack-react-query`) | ^11.x |
| Database | `drizzle-orm` + `@neondatabase/serverless` | ^0.38+ |
| Auth | `better-auth` | Latest |
| Forms | `react-hook-form`, `@tanstack/react-form`, `zod` | Latest |
| Email | `resend` + `@react-email/*` | Latest |
| Monitoring | Sentry | Latest |
| i18n | `i18next` + `react-i18next` | Latest |
| State | `@tanstack/react-query`, `@tanstack/db` | ^5.x |

The Vite config uses `tanstackStart()` plugin alongside `@neondatabase/vite-plugin-postgres` (auto-provisions a Neon database) and `vite-tsconfig-paths`. The drizzle config points to `src/lib/db/schema.ts` with dialect `postgresql`.

### Environment variables the template expects

```env
DATABASE_URL=              # Neon connection string (auto-provisioned by Vite plugin)
BETTER_AUTH_SECRET=        # Min 32 chars (openssl rand -base64 32)
BETTER_AUTH_URL=           # e.g., http://localhost:3000
RESEND_API_KEY=            # Transactional email
OPENAI_API_KEY=            # For AI features
SENTRY_DSN=                # Error monitoring
```

Better Auth creates four core tables: **user** (id, name, email, emailVerified, image, createdAt, updatedAt), **session** (id, expiresAt, token, ipAddress, userAgent, userId), **account** (id, accountId, providerId, userId, accessToken, refreshToken, password, etc.), and **verification** (id, identifier, value, expiresAt). Routes under `(auth)/` are protected; the auth API mounts at `/api/auth/*`.

---

## Database schema: the complete Drizzle definition

The schema below extends Better Auth's four core tables with six application tables. All IDs use `text` (Better Auth's default UUID-as-string pattern). Column names use **snake_case in PostgreSQL** mapped to **camelCase in TypeScript**—matching Better Auth's convention.

### PostgreSQL enums

```typescript
// src/lib/db/schema.ts
import { relations } from "drizzle-orm";
import {
  pgTable, pgEnum, text, integer, boolean, timestamp,
  jsonb, index, uniqueIndex, primaryKey, real,
} from "drizzle-orm/pg-core";

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active", "canceled", "past_due", "trialing", "paused", "unpaid",
]);

export const videoStatusEnum = pgEnum("video_status", [
  "processing", "ready", "error",
]);

export const publishStatusEnum = pgEnum("publish_status", [
  "draft", "published", "archived",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "visible", "flagged", "hidden", "under_review",
]);
```

### Reusable timestamp columns

```typescript
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow().notNull().$onUpdateFn(() => new Date()),
};
```

### Better Auth tables (auto-generated, shown for reference)

```typescript
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  role: text("role").default("user"),        // Added by admin plugin
  banned: boolean("banned"),                  // Added by admin plugin
  banReason: text("ban_reason"),
  stripeCustomerId: text("stripe_customer_id"), // Added by stripe plugin
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  token: text("token").notNull().unique(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
}, (t) => [index("session_user_id_idx").on(t.userId)]);

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true, mode: "date" }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true, mode: "date" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).notNull(),
}, (t) => [index("account_user_id_idx").on(t.userId)]);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }),
});
```

### Application tables

```typescript
// The subscription table is auto-managed by @better-auth/stripe plugin.
// Shown here for awareness — do NOT add a unique constraint on referenceId.
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull(),
  referenceId: text("reference_id").notNull(), // user.id
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  status: text("status").notNull(),
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end"),
  seats: integer("seats"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  ...timestamps,
}, (t) => [
  index("sub_ref_id_idx").on(t.referenceId),
  index("sub_stripe_cust_idx").on(t.stripeCustomerId),
  index("sub_status_idx").on(t.status),
]);

export const series = pgTable("series", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  thumbnailUrl: text("thumbnail_url"),
  publishStatus: publishStatusEnum("publish_status").notNull().default("draft"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (t) => [
  index("series_publish_idx").on(t.publishStatus),
  index("series_sort_idx").on(t.sortOrder),
]);

export const videos = pgTable("video", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  muxAssetId: text("mux_asset_id"),
  muxPlaybackId: text("mux_playback_id"),
  muxUploadId: text("mux_upload_id"),
  duration: integer("duration"),              // seconds
  thumbnailUrl: text("thumbnail_url"),
  recipePdfUrl: text("recipe_pdf_url"),
  videoStatus: videoStatusEnum("video_status").notNull().default("processing"),
  publishStatus: publishStatusEnum("publish_status").notNull().default("draft"),
  isFree: boolean("is_free").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
}, (t) => [
  index("video_mux_asset_idx").on(t.muxAssetId),
  index("video_publish_idx").on(t.publishStatus),
  index("video_free_idx").on(t.isFree),
  index("video_sort_idx").on(t.sortOrder),
]);

export const seriesVideos = pgTable("series_video", {
  seriesId: text("series_id").notNull().references(() => series.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
}, (t) => [
  primaryKey({ columns: [t.seriesId, t.videoId] }),
  index("sv_position_idx").on(t.seriesId, t.position),
]);

export const userProgress = pgTable("user_progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  progressSeconds: integer("progress_seconds").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  lastWatchedAt: timestamp("last_watched_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  ...timestamps,
}, (t) => [
  uniqueIndex("progress_user_video_idx").on(t.userId, t.videoId),
  index("progress_continue_idx").on(t.userId, t.lastWatchedAt),
]);

export const comments = pgTable("comment", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  videoId: text("video_id").notNull().references(() => videos.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),               // Self-ref for threading
  content: text("content").notNull(),
  status: commentStatusEnum("status").notNull().default("visible"),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
  ...timestamps,
}, (t) => [
  index("comment_video_idx").on(t.videoId),
  index("comment_parent_idx").on(t.parentId),
  index("comment_video_created_idx").on(t.videoId, t.createdAt),
]);
```

### Drizzle relations

```typescript
export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  subscriptions: many(subscription),
  progress: many(userProgress),
  comments: many(comments),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, { fields: [subscription.referenceId], references: [user.id] }),
}));

export const seriesRelations = relations(series, ({ many }) => ({
  seriesVideos: many(seriesVideos),
}));

export const videoRelations = relations(videos, ({ many }) => ({
  seriesVideos: many(seriesVideos),
  progress: many(userProgress),
  comments: many(comments),
}));

export const seriesVideosRelations = relations(seriesVideos, ({ one }) => ({
  series: one(series, { fields: [seriesVideos.seriesId], references: [series.id] }),
  video: one(videos, { fields: [seriesVideos.videoId], references: [videos.id] }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(user, { fields: [userProgress.userId], references: [user.id] }),
  video: one(videos, { fields: [userProgress.videoId], references: [videos.id] }),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  user: one(user, { fields: [comments.userId], references: [user.id] }),
  video: one(videos, { fields: [comments.videoId], references: [videos.id] }),
  parent: one(comments, { fields: [comments.parentId], references: [comments.id], relationName: "thread" }),
  replies: many(comments, { relationName: "thread" }),
}));
```

Type exports use the standard `typeof table.$inferSelect` and `$inferInsert` pattern for all tables.

---

## Better Auth configuration with Stripe and admin plugins

The **@better-auth/stripe** plugin (v1.4.12) eliminates manual Stripe integration. It auto-creates customers on signup, manages the subscription table, processes webhooks, and exposes client-side methods for checkout, portal, and cancellation. The **admin** plugin adds RBAC with role/ban fields on the user table.

### Server-side auth config

```typescript
// src/lib/auth/index.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { stripe } from "@better-auth/stripe";
import { admin } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import Stripe from "stripe";
import { db } from "../db";
import * as schema from "../db/schema";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: { enabled: true },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "monthly",
            priceId: process.env.STRIPE_MONTHLY_PRICE_ID!,
            limits: { videos: -1 },
          },
          {
            name: "annual",
            priceId: process.env.STRIPE_ANNUAL_PRICE_ID!,
            limits: { videos: -1 },
            freeTrial: { days: 7 },
          },
        ],
        getCheckoutSessionParams: async () => ({
          allow_promotion_codes: true,
        }),
        onSubscriptionComplete: async ({ subscription, plan }) => {
          console.log(`Subscription ${subscription.id} activated on ${plan.name}`);
        },
        onSubscriptionCancel: async ({ subscription }) => {
          console.log(`Subscription ${subscription.id} canceled`);
        },
      },
      onEvent: async (event) => {
        if (event.type === "invoice.payment_failed") {
          // Send dunning email via Resend
        }
      },
    }),
    tanstackStartCookies(), // MUST be last plugin
  ],
});
```

### Client-side auth config

```typescript
// src/lib/auth/client.ts
import { createAuthClient } from "better-auth/client";
import { stripeClient } from "@better-auth/stripe/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    stripeClient({ subscription: true }),
    adminClient(),
  ],
});
```

### Key Stripe integration details

The webhook endpoint auto-registers at **`/api/auth/stripe/webhook`** — point your Stripe dashboard webhook to this URL. Events handled automatically: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`. Handle additional events via the `onEvent` callback.

**Stripe CLI for local development:**
```bash
stripe listen --forward-to http://localhost:3000/api/auth/stripe/webhook
```

The plugin adds `stripeCustomerId` to the user table and manages the entire subscription table. The `referenceId` field intentionally has **no unique constraint** to allow resubscription after cancellation. Trial abuse prevention is automatic — once a user has trialed, they cannot trial again on any plan.

### Client-side subscription actions

```typescript
// Subscribe (redirects to Stripe Checkout)
await authClient.subscription.upgrade({
  plan: "annual",
  successUrl: "/dashboard",
  cancelUrl: "/pricing",
});

// Open billing portal
await authClient.subscription.billingPortal({
  returnUrl: "/account",
});

// Cancel subscription
await authClient.subscription.cancel({
  returnUrl: "/account",
});

// List user's subscriptions
const { data } = await authClient.useListSubscriptions();
```

---

## Route protection and content gating

TanStack Start uses `beforeLoad` on **pathless layout routes** (prefixed with `_`) as the primary pattern for route guards. This runs server-side during SSR before any child routes load.

### Auth guard (pathless layout)

```typescript
// src/routes/_authed.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await auth.api.getSession({ headers });
  return session || null;
});

export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    return { session };
  },
  component: () => <Outlet />,
});
```

### Admin guard (nested under _authed)

```typescript
// src/routes/_authed/admin.tsx
import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/admin")({
  beforeLoad: async ({ context }) => {
    if (context.session.user.role !== "admin") {
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  );
}
```

### Composable middleware for content gating

TanStack Start's `createMiddleware` enables a chain that checks auth → subscription → generates Mux tokens:

```typescript
// src/middleware/auth.ts
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const authMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) throw new Error("Unauthorized");
    return next({ context: { session } });
  }
);

// src/middleware/subscription.ts
export const subscriptionMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const sub = await db.query.subscription.findFirst({
      where: and(
        eq(subscription.referenceId, context.session.user.id),
        inArray(subscription.status, ["active", "trialing"])
      ),
    });
    if (!sub) throw new Error("Subscription required");
    return next({ context: { subscription: sub } });
  });
```

---

## Mux video integration

Install three packages: **`@mux/mux-player-react` (^3.10.2)**, **`@mux/mux-node` (^12.8.1)**, and **`@mux/mux-uploader-react` (^1.3.0)**.

### Server-side Mux client

```typescript
// src/lib/mux.ts
import Mux from "@mux/mux-node";

export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID!,
  tokenSecret: process.env.MUX_TOKEN_SECRET!,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
});
```

**Environment variables to add:**
```env
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=
MUX_SIGNING_KEY=              # Signing key ID for JWT
MUX_PRIVATE_KEY=              # Base64-encoded RSA private key
```

### Direct uploads from admin dashboard (recommended)

Direct uploads send files straight from the browser to Mux — no server bandwidth consumed. The flow is: admin requests upload URL → server creates it via `mux.video.uploads.create()` → browser uploads via MuxUploader → Mux sends webhooks as asset processes.

**Server function to create upload URL:**
```typescript
export const createMuxUpload = createServerFn({ method: "POST" })
  .middleware([adminMiddleware])
  .handler(async ({ data }) => {
    const upload = await mux.video.uploads.create({
      cors_origin: process.env.BETTER_AUTH_URL || "*",
      new_asset_settings: {
        playback_policies: ["signed"],      // Use signed for gated content
        video_quality: "basic",
        passthrough: data.videoId,          // Link to your DB record
      },
    });
    return { uploadId: upload.id, uploadUrl: upload.url };
  });
```

**Admin upload component:**
```tsx
import MuxUploader from "@mux/mux-uploader-react";

function VideoUploader({ videoId }: { videoId: string }) {
  return (
    <MuxUploader
      endpoint={async () => {
        const { uploadUrl } = await createMuxUpload({ data: { videoId } });
        return uploadUrl;
      }}
      pausable
      onSuccess={() => toast.success("Upload complete! Processing...")}
      onUploadError={() => toast.error("Upload failed")}
    />
  );
}
```

### Mux webhook handler

```typescript
// src/routes/api/webhooks/mux.ts
import { createFileRoute } from "@tanstack/react-router";
import { mux } from "@/lib/mux";
import { db } from "@/lib/db";
import { videos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const Route = createFileRoute("/api/webhooks/mux")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const body = await request.text();
        const event = mux.webhooks.unwrap(body, request.headers);

        switch (event.type) {
          case "video.upload.asset_created":
            await db.update(videos)
              .set({ muxAssetId: event.data.asset_id })
              .where(eq(videos.muxUploadId, event.data.id));
            break;
          case "video.asset.ready":
            await db.update(videos).set({
              videoStatus: "ready",
              muxPlaybackId: event.data.playback_ids?.[0]?.id,
              duration: Math.round(event.data.duration || 0),
            }).where(eq(videos.muxAssetId, event.data.id));
            break;
          case "video.asset.errored":
            await db.update(videos)
              .set({ videoStatus: "error" })
              .where(eq(videos.muxAssetId, event.data.id));
            break;
        }
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      },
    },
  },
});
```

### Signed playback tokens for content protection

Generate tokens server-side only for authorized subscribers. Use `Mux.jwt.sign()` with separate token types:

```typescript
// src/server/video-access.ts
export const getVideoAccess = createServerFn({ method: "GET" })
  .middleware([subscriptionMiddleware])
  .handler(async ({ data, context }) => {
    const video = await db.query.videos.findFirst({
      where: eq(videos.slug, data.slug),
    });
    if (!video?.muxPlaybackId) throw new Error("Video not found");
    if (!video.isFree && !context.subscription) {
      throw new Error("Subscription required");
    }

    const opts = {
      keyId: process.env.MUX_SIGNING_KEY!,
      keySecret: process.env.MUX_PRIVATE_KEY!,
      expiration: "4h" as const,
    };

    return {
      playbackId: video.muxPlaybackId,
      tokens: {
        playback: Mux.jwt.sign(video.muxPlaybackId, { ...opts, type: "video" }),
        thumbnail: Mux.jwt.sign(video.muxPlaybackId, { ...opts, type: "thumbnail" }),
        storyboard: Mux.jwt.sign(video.muxPlaybackId, { ...opts, type: "storyboard" }),
      },
    };
  });
```

### Video player with progress tracking

```tsx
import MuxPlayer from "@mux/mux-player-react/lazy";

function VideoPlayer({ playbackId, tokens, videoId, userId, initialProgress }) {
  const playerRef = useRef(null);
  const lastSaved = useRef(0);

  const handleTimeUpdate = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const current = Math.floor(player.currentTime);
    // Debounce: save every 10 seconds
    if (Math.abs(current - lastSaved.current) >= 10) {
      lastSaved.current = current;
      saveProgress({ data: { videoId, progressSeconds: current } });
    }
  }, [videoId]);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={playbackId}
      tokens={tokens}
      startTime={initialProgress}
      loading="viewport"
      accentColor="#E85D04"
      onTimeUpdate={handleTimeUpdate}
      onEnded={() => markComplete({ data: { videoId } })}
      metadata={{ video_id: videoId, viewer_user_id: userId }}
    />
  );
}
```

### Mux pricing for the Launch plan

The **Launch plan costs $20/month** and includes **$100 in credits**. Basic quality video encoding is free. Storage starts at **$0.0024/min/month** at 720p. Delivery is **$0.0008/min** after the first **100K free delivery minutes/month** (included in all plans). Cold storage automatically applies to inactive assets for up to 60% savings. For a platform with ~100 videos at 10 minutes each, monthly cost stays well within the $100 credit.

---

## Cloudflare R2 for thumbnails and recipe PDFs

R2's S3-compatible API uses `@aws-sdk/client-s3` (^3.971.0) and `@aws-sdk/s3-request-presigner`. **Critical fix**: since SDK v3.729.0+, you must add `requestChecksumCalculation: "WHEN_REQUIRED"` to avoid checksum header errors with R2.

### R2 client configuration

```typescript
// src/lib/r2.ts
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_SUPPORTED",
});
```

### Presigned upload URL generation (tRPC procedure)

```typescript
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export const uploadRouter = router({
  getPresignedUrl: adminProcedure
    .input(z.object({
      fileType: z.enum(["thumbnail", "pdf"]),
      contentType: z.string(),
      filename: z.string(),
    }))
    .mutation(async ({ input }) => {
      const ext = input.filename.split(".").pop();
      const prefix = input.fileType === "thumbnail" ? "thumbnails" : "pdfs";
      const key = `${prefix}/${randomUUID()}.${ext}`;

      const url = await getSignedUrl(r2Client, new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        ContentType: input.contentType,
      }), { expiresIn: 600 });

      return { url, key, publicUrl: `https://assets.yourdomain.com/${key}` };
    }),
});
```

The client uploads directly to R2 via `fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } })`, then calls a confirm mutation to store the URL in the database. Presigned URLs expire in **max 7 days (604,800 seconds)**. They only work with the S3 API domain, not custom domains.

### R2 pricing estimate: effectively free

For a cooking show platform with ~500 thumbnails (~100MB) and ~100 PDFs (~200MB), total storage is **~0.3 GB** — well within R2's **10 GB free tier**. At 1,000 daily active users, monthly read operations stay under the **10 million free Class B operations**. Egress is always free. **Estimated monthly cost: $0.00.** Even at 10× scale, you'd stay within free tier limits.

Configure a **public bucket with custom domain** (e.g., `assets.yourdomain.com`) for serving thumbnails. Use presigned GET URLs for premium recipe PDFs that should be access-controlled. Set `Cache-Control: public, max-age=31536000, immutable` on thumbnails since UUID-based keys guarantee uniqueness.

---

## Comments system with threaded replies

### tRPC router for comments

```typescript
export const commentsRouter = router({
  list: publicProcedure
    .input(z.object({
      videoId: z.string(),
      cursor: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ input }) => {
      // Fetch root comments with up to 2 levels of replies
      const items = await db.query.comments.findMany({
        where: and(
          eq(comments.videoId, input.videoId),
          isNull(comments.parentId),
          isNull(comments.deletedAt)
        ),
        with: {
          user: { columns: { id: true, name: true, image: true } },
          replies: {
            where: isNull(comments.deletedAt),
            with: {
              user: { columns: { id: true, name: true, image: true } },
              replies: {
                where: isNull(comments.deletedAt),
                with: { user: { columns: { id: true, name: true, image: true } } },
              },
            },
            orderBy: [asc(comments.createdAt)],
          },
        },
        orderBy: [desc(comments.createdAt)],
        limit: input.limit,
      });
      return { items, nextCursor: items.length === input.limit ? items.at(-1)?.id : undefined };
    }),

  create: protectedProcedure
    .input(z.object({
      videoId: z.string(),
      parentId: z.string().optional(),
      content: z.string().min(1).max(2000).trim(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Enforce max depth of 2
      if (input.parentId) {
        const parent = await db.query.comments.findFirst({
          where: eq(comments.id, input.parentId),
        });
        if (parent?.parentId) {
          const grandparent = await db.query.comments.findFirst({
            where: eq(comments.id, parent.parentId),
          });
          if (grandparent?.parentId) throw new Error("Max nesting depth reached");
        }
      }
      return db.insert(comments).values({
        id: crypto.randomUUID(),
        userId: ctx.session.user.id,
        videoId: input.videoId,
        parentId: input.parentId ?? null,
        content: input.content,
      }).returning();
    }),

  delete: protectedProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await db.update(comments)
        .set({ deletedAt: new Date() })
        .where(and(eq(comments.id, input.commentId), eq(comments.userId, ctx.session.user.id)));
    }),

  flag: protectedProcedure
    .input(z.object({
      commentId: z.string(),
      reason: z.enum(["spam", "harassment", "inappropriate", "other"]),
    }))
    .mutation(async ({ input }) => {
      await db.update(comments)
        .set({ status: "flagged" })
        .where(eq(comments.id, input.commentId));
    }),

  // Admin moderation
  listFlagged: adminProcedure.query(async () => {
    return db.query.comments.findMany({
      where: eq(comments.status, "flagged"),
      with: { user: true, video: { columns: { title: true, slug: true } } },
      orderBy: [desc(comments.createdAt)],
    });
  }),

  adminDelete: adminProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(comments).where(eq(comments.id, input.commentId));
    }),

  approve: adminProcedure
    .input(z.object({ commentId: z.string() }))
    .mutation(async ({ input }) => {
      await db.update(comments)
        .set({ status: "visible" })
        .where(eq(comments.id, input.commentId));
    }),
});
```

For real-time updates, use **polling with React Query** (`refetchInterval: 30000`) rather than tRPC subscriptions — WebSocket support in TanStack Start / Nitro is not well-supported. Add optimistic updates via `onMutate` to make the UI feel instant.

---

## PWA setup with Serwist has a critical caveat

Both `@serwist/vite` (v9.5.0) and `vite-plugin-pwa` have a **confirmed production build incompatibility** with TanStack Start as of early 2026. The service worker generates correctly in dev mode but **fails to build for production** due to Vite 6 Environment API conflicts with TanStack Start's multi-environment build system (tracked in serwist/serwist#300 and TanStack/router#4988).

### Recommended workaround: post-build service worker generation

Use a custom script that runs `workbox-build injectManifest` after the Vite build completes:

```bash
bun install serwist @serwist/vite @serwist/window workbox-build -D
```

### Service worker for a video platform

The key insight is that **video content must never be cached** — it's streamed from Mux. Cache static assets aggressively, use stale-while-revalidate for thumbnails, and network-first for API calls:

```typescript
// src/sw.ts
import { Serwist, CacheFirst, NetworkFirst, NetworkOnly,
  StaleWhileRevalidate, ExpirationPlugin, CacheableResponsePlugin } from "serwist";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    { // Static assets: cache-first (hashed filenames = immutable)
      matcher: ({ request }) => ["style", "script", "font"].includes(request.destination),
      handler: new CacheFirst({
        cacheName: "static-assets",
        plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 86400 })],
      }),
    },
    { // Thumbnails: stale-while-revalidate
      matcher: ({ request }) => request.destination === "image",
      handler: new StaleWhileRevalidate({
        cacheName: "image-cache",
        plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 7 * 86400 })],
      }),
    },
    { // API/tRPC: network-first with 3s timeout
      matcher: ({ url }) => url.pathname.startsWith("/api/") || url.pathname.startsWith("/trpc/"),
      handler: new NetworkFirst({ cacheName: "api-cache", networkTimeoutSeconds: 3 }),
    },
    { // Video streams: NEVER cache
      matcher: ({ url }) => url.hostname.includes("stream") || url.hostname.includes("mux"),
      handler: new NetworkOnly(),
    },
    { // Auth routes: never cache
      matcher: ({ url }) => url.pathname.startsWith("/api/auth/"),
      handler: new NetworkOnly(),
    },
  ],
});
serwist.addEventListeners();
```

### Web app manifest

```json
{
  "name": "CookShow - Premium Cooking Videos",
  "short_name": "CookShow",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#E85D04",
  "background_color": "#FFFFFF",
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "categories": ["food", "entertainment"]
}
```

Register the service worker in `__root.tsx` with a simple `useEffect` that calls `navigator.serviceWorker.register("/sw.js")` — use manual registration rather than the virtual import as a production workaround.

---

## Recommended project file structure

Building on the template's existing `src/` convention with TanStack Router's file-based routing:

```
src/
├── routes/
│   ├── __root.tsx                    # HTML shell, manifest link, RegisterSW
│   ├── index.tsx                     # Landing page (/)
│   ├── pricing.tsx                   # Pricing page with Stripe checkout
│   ├── offline.tsx                   # PWA offline fallback
│   │
│   ├── _public.tsx                   # Public layout (header/footer)
│   ├── _public/
│   │   ├── shows/
│   │   │   ├── index.tsx             # Browse series (/shows)
│   │   │   └── $slug.tsx             # Series detail (/shows/:slug)
│   │   ├── watch/
│   │   │   └── $slug.tsx             # Video player page (/watch/:slug)
│   │   └── search.tsx
│   │
│   ├── _auth.tsx                     # Auth layout (centered card)
│   ├── _auth/
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── _authed.tsx                   # Auth guard (redirect if not logged in)
│   ├── _authed/
│   │   ├── account.tsx               # Account settings, billing portal
│   │   ├── favorites.tsx
│   │   ├── admin.tsx                 # Admin guard + sidebar layout
│   │   └── admin/
│   │       ├── index.tsx             # Admin dashboard
│   │       ├── videos/
│   │       │   ├── index.tsx         # Video CRUD list
│   │       │   ├── new.tsx           # Create video + MuxUploader
│   │       │   └── $id.edit.tsx      # Edit video
│   │       ├── series/
│   │       │   ├── index.tsx
│   │       │   └── new.tsx
│   │       ├── comments.tsx          # Moderation queue
│   │       └── users.tsx             # User management
│   │
│   └── api/
│       ├── auth/$.ts                 # Better Auth handler (incl Stripe webhook)
│       ├── trpc/$.ts                 # tRPC handler
│       └── webhooks/
│           └── mux.ts                # Mux webhook handler
│
├── lib/
│   ├── auth/
│   │   ├── index.ts                  # Better Auth server config
│   │   └── client.ts                 # Better Auth client
│   ├── db/
│   │   ├── index.ts                  # Drizzle client (neon + drizzle-orm)
│   │   └── schema.ts                 # All table definitions + relations
│   ├── trpc/
│   │   ├── client.ts                 # tRPC React client
│   │   ├── server.ts                 # tRPC init, context, base procedures
│   │   ├── router.ts                 # Root appRouter (merges sub-routers)
│   │   └── routers/
│   │       ├── videos.ts
│   │       ├── series.ts
│   │       ├── comments.ts
│   │       ├── progress.ts
│   │       └── admin.ts
│   ├── mux.ts                        # Mux client singleton
│   ├── r2.ts                         # R2 S3Client singleton
│   ├── env.server.ts                 # T3 Env server vars
│   └── env.client.ts                 # T3 Env client vars
│
├── middleware/
│   ├── auth.ts                       # Auth middleware (createMiddleware)
│   └── subscription.ts               # Subscription check middleware
│
├── components/
│   ├── ui/                           # shadcn/ui (auto-generated)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── AdminSidebar.tsx
│   ├── video/
│   │   ├── VideoPlayer.tsx           # MuxPlayer wrapper with progress
│   │   ├── VideoCard.tsx
│   │   └── VideoUploader.tsx         # MuxUploader for admin
│   ├── comments/
│   │   ├── CommentThread.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentForm.tsx
│   └── pwa/
│       ├── RegisterSW.tsx
│       └── InstallPrompt.tsx
│
├── hooks/
│   ├── useFileUpload.ts              # R2 presigned URL upload
│   └── useInstallPrompt.ts
│
├── styles/
│   └── globals.css
│
└── sw.ts                             # Service worker source
```

### Where to add new things

| What | Where |
|------|-------|
| New page | `src/routes/` following file-based routing conventions |
| New DB table | `src/lib/db/schema.ts` (add table + relation + type export) |
| New tRPC router | `src/lib/trpc/routers/` then merge in `router.ts` |
| New middleware | `src/middleware/` |
| New UI component | `src/components/` (feature-specific subfolder) |
| New server function | Co-locate in the route file or in `src/lib/` |
| shadcn/ui component | `bunx shadcn@latest add button` → lands in `src/components/ui/` |

---

## All environment variables needed

```env
# Existing (from template)
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
RESEND_API_KEY=
SENTRY_DSN=

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_ANNUAL_PRICE_ID=price_...

# Mux
MUX_TOKEN_ID=
MUX_TOKEN_SECRET=
MUX_WEBHOOK_SECRET=
MUX_SIGNING_KEY=
MUX_PRIVATE_KEY=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
```

---

## All packages to install

```bash
# Video
bun add @mux/mux-player-react@^3.10.2 @mux/mux-node@^12.8.1 @mux/mux-uploader-react@^1.3.0

# Payments
bun add @better-auth/stripe stripe

# Storage
bun add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# PWA (dev dependency)
bun add -D serwist @serwist/vite workbox-build
```

The template already includes `better-auth`, `drizzle-orm`, `@neondatabase/serverless`, `@tanstack/react-start`, `@trpc/server`, `@trpc/client`, `zod`, `react-hook-form`, `@tanstack/react-form`, `resend`, and all shadcn/ui dependencies. No additional installs needed for those.

## Conclusion: architecture decisions and what to build first

The Better Auth Stripe plugin dramatically simplifies the billing layer — it handles customer creation, subscription state management, webhooks, and the checkout redirect in a single plugin configuration. This means the developer avoids building a separate webhook handler for Stripe (it's auto-registered at `/api/auth/stripe/webhook`). The Mux integration is equally clean: direct uploads from the admin dashboard bypass your server entirely, and signed playback tokens generated server-side in middleware ensure only subscribers can watch premium content.

**Build order recommendation**: Start with the database schema and run migrations. Wire up the Better Auth + Stripe + Admin plugins. Add the pathless layout routes for auth/admin guards. Build the admin video CRUD with MuxUploader. Add the Mux webhook handler. Build the public video player with signed tokens. Layer in comments and progress tracking. Add R2 uploads for thumbnails and PDFs. PWA comes last since it has known build issues requiring workarounds.

The single largest technical risk is the **Serwist/TanStack Start production build incompatibility** — plan for the post-build workaround from the start rather than discovering it late. Everything else in this stack has mature, well-documented integration paths.