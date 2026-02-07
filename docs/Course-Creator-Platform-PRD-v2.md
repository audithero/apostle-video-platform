# PRODUCT REQUIREMENTS DOCUMENT
## Course Creator Platform
### Feature Brief for Claude Code Agent Team

**Comprehensive UI/UX + Backend Implementation Specification**

Version 2.0 | February 2026 | Apostle Digital

| Field | Value |
|---|---|
| Document Type | PRD + Agent Task List |
| Total Tasks | 53 executable tasks across 12 modules |
| Target Stack | TanStack Start, Neon Postgres, R2, Better Auth, Stripe |
| Pricing Tiers | $29 / $79 / $149 / $199 per month |
| Competitors | Kajabi, Teachable, Thinkific, Uscreen, Whop |
| Gross Margins | 60-99% across all tiers (verified) |

---

# 1. Executive Summary

This PRD defines the complete feature set, database schemas, API contracts, file paths, and acceptance criteria for building a world-class course creator platform. Every section is structured as executable tasks that Claude Code agents can pick up and ship independently.

## 1.1 Strategic Position

We are building the platform that bridges the gap between Uscreen (video-first OTT, no LMS), Kajabi (marketing-first, expensive, no OTT), and Whop (marketplace-first, no course tools). Our unfair advantages:

- **Zero transaction fees:** at every tier (Teachable charges 7.5% on Starter, Skool 10% on Hobby)
- **AI course generation:** included in base tiers (unique in market - no competitor does this natively)
- **HeyGen avatar videos:** as affordable add-on ($2-6/min vs Synthesia $1.80-2.97/min, but integrated natively)
- **R2 zero-egress model:** structurally impossible for S3/CloudFront-based competitors to match our margins
- **75-99% gross margins:** even worst-case power users on Pro tier yield 60.5% margins

## 1.2 Pricing Architecture (Locked)

| Tier | Monthly | Annual | Courses | Video | Students | Emails | Margin |
|---|---|---|---|---|---|---|---|
| **Launch** | $29 | $24/mo | 3 | 5 hrs | 100 | 2,500 | 94-99% |
| **Grow** | $79 | $65/mo | 10 | 25 hrs | 1,000 | 10,000 | 83-90% |
| **Scale** | $149 | $125/mo | 25 | 100 hrs | 5,000 | 25,000 | 75-85% |
| **Pro** | $199 | $165/mo | Unlimited | 250 hrs | 15,000 | 50,000 | 60-76% |

## 1.3 AI Credit Allocation per Tier

| AI Feature | Launch | Grow | Scale | Pro |
|---|---|---|---|---|
| AI course generations | 2/mo | 5/mo | 15/mo | 30/mo |
| AI lesson rewrites | 10/mo | 30/mo | 100/mo | Unlimited* |
| AI image generations | 10/mo | 50/mo | 200/mo | 500/mo |
| AI quiz generation | 5/mo | 20/mo | Unlimited | Unlimited |
| Max API cost ceiling | ~$1.50 | ~$5.00 | ~$15.00 | ~$30.00 |

*Unlimited = fair use cap at 500 rewrites/month*

## 1.4 HeyGen Avatar Video Pricing (Add-on, Never Bundled)

| Pack | Minutes | Price | Per-min | Our Cost | Margin |
|---|---|---|---|---|---|
| Starter | 10 | $25 | $2.50 | $5.00 | 80% |
| Creator | 30 | $60 | $2.00 | $15.00 | 75% |
| Pro | 60 | $99 | $1.65 | $30.00 | 70% |
| Studio | 120 | $179 | $1.49 | $60.00 | 66% |

---

# 2. Technical Architecture

## 2.1 Stack Decisions (Locked)

| Layer | Technology | Rationale |
|---|---|---|
| Framework | TanStack Start + React 19 | SSR, file-based routing, server functions |
| Database | Neon Postgres + Drizzle ORM | Serverless Postgres, branching, $0-25/mo |
| Auth | Better Auth + Stripe plugin | Auto customer creation, subscription management |
| Storage | Cloudflare R2 | Zero egress, S3-compatible, $0.015/GB/mo |
| Video | R2 + HLS.js (self-hosted) | No per-minute delivery fees, signed URLs |
| Email | Amazon SES | $0.10/1,000 emails, highest deliverability |
| Payments | Stripe (via Better Auth plugin) | 0% platform fee, automatic webhook handling |
| AI Generation | Claude API + DALL-E 3 | Best quality/cost ratio for content generation |
| Avatar Video | HeyGen API v2 | $0.50/min standard, $3/min Avatar IV |
| Rich Text | TipTap (ProseMirror) | Extensible, collaborative, markdown support |
| DnD | @dnd-kit/sortable | Accessible, performant, React-native |
| Charts | Recharts | React-native, responsive, composable |
| UI | shadcn/ui + Tailwind v4 | Customizable, accessible, no runtime cost |
| Monitoring | Sentry | Error tracking, performance monitoring |

## 2.2 Multi-Tenant Architecture

Each creator (tenant) operates within a single Neon Postgres database with row-level isolation via creator_id foreign keys. Neon's serverless driver handles connection pooling and scaling. The creator_id column exists on every tenant-scoped table.

## 2.3 Project File Structure

All new routes, schemas, and components follow this structure. Agents must create files in the correct locations:

- `src/routes/` - File-based routing (TanStack Router)
- `src/routes/_authed/` - Protected creator routes (auth guard)
- `src/routes/_authed/admin/` - Platform admin routes
- `src/routes/_public/` - Public student-facing routes
- `src/lib/db/schema/` - Drizzle table definitions (modular: auth.ts, creator.ts, course.ts, enrollment.ts, billing.ts, community.ts, marketing.ts)
- `src/server/routes/` - tRPC sub-routers by domain
- `src/lib/ai/` - AI generation services (Claude, DALL-E, HeyGen)
- `src/lib/billing/` - Usage metering, credit tracking, Stripe helpers
- `src/lib/email/` - SES client, template rendering, queue
- `src/components/ui/` - shadcn/ui base components
- `src/components/course/` - Course builder components
- `src/components/community/` - Community feed/chat components
- `src/components/analytics/` - Dashboard chart components
- `src/components/page-builder/` - Landing page builder blocks

---

# 3. Module 1: Database Schema & Multi-Tenancy

This module establishes the complete database schema for the platform. Every table listed here must be created before any feature module can begin. The schema supports multi-tenancy via creator_id, usage metering via event tables, and AI credit tracking via a ledger system.

## 3.1 Core Tables

These extend Better Auth's auto-generated user/session/account/verification tables:

### Creator Profile & Subscription

- **creators** - id, user_id (FK), business_name, slug, custom_domain, logo_url, brand_color, timezone, tier (enum: launch/grow/scale/pro), stripe_customer_id, stripe_subscription_id, subscription_status, trial_ends_at, created_at, updated_at
- **creator_settings** - creator_id (FK), email_from_name, email_reply_to, checkout_logo, checkout_accent_color, meta_pixel_id, ga4_id, gtm_id, custom_head_code, custom_css, seo_defaults (JSON)

### Course & Content

- **courses** - id, creator_id (FK), title, slug, description, thumbnail_url, status (draft/published/archived), course_type (self_paced/drip/cohort), drip_interval_days, price_type (free/paid/subscription_only), price_cents, currency, sort_order, ai_generated (boolean), enrollment_count, completion_rate, created_at, updated_at
- **modules** - id, course_id (FK), title, description, sort_order, drip_delay_days, created_at
- **lessons** - id, module_id (FK), title, content_html, content_json (TipTap JSON), lesson_type (video/text/quiz/assignment/live), video_url, video_duration_seconds, video_storage_key (R2 key), thumbnail_url, sort_order, is_free_preview, ai_generated, created_at, updated_at
- **quizzes** - id, lesson_id (FK), title, passing_score_percent, max_attempts, time_limit_minutes, created_at
- **quiz_questions** - id, quiz_id (FK), question_text, question_type (multiple_choice/true_false/short_answer/file_upload), options (JSON array), correct_answer (JSON), explanation, sort_order, points
- **certificates** - id, course_id (FK), title, subtitle, logo_url, background_image_url, include_date, include_serial, expiration_days, created_at

### Student & Progress

- **enrollments** - id, student_id (FK user), course_id (FK), creator_id (FK), enrolled_at, completed_at, certificate_issued_at, certificate_serial, source (direct/affiliate/import)
- **lesson_progress** - id, enrollment_id (FK), lesson_id (FK), status (not_started/in_progress/completed), progress_seconds, completed_at, last_accessed_at
- **quiz_attempts** - id, enrollment_id (FK), quiz_id (FK), answers (JSON), score_percent, passed, started_at, completed_at
- **student_notes** - id, enrollment_id (FK), lesson_id (FK), content, timestamp_seconds, created_at

### Community

- **community_channels** - id, creator_id (FK), name, slug, description, channel_type (feed/chat), access_level (public/members/specific_course), icon_emoji, sort_order, created_at
- **community_posts** - id, channel_id (FK), author_id (FK user), title, content_html, content_json, media_urls (JSON array), pinned, status (visible/flagged/hidden), likes_count, comments_count, created_at, updated_at
- **community_comments** - id, post_id (FK), author_id (FK user), parent_id (self-ref), content, status, created_at
- **community_reactions** - id, post_id (FK), user_id (FK), reaction_type (like/love/fire/clap), created_at

### Billing, Usage & Credits

- **usage_events** - id, creator_id (FK), event_type (video_upload/student_added/email_sent/ai_generation/avatar_minute), quantity, metadata (JSON), recorded_at
- **monthly_usage** - id, creator_id (FK), period_start, period_end, video_storage_hours, active_students, emails_sent, ai_course_generations, ai_lesson_rewrites, ai_image_generations, ai_quiz_generations, avatar_minutes_used
- **credit_ledger** - id, creator_id (FK), credit_type (ai_course/ai_rewrite/ai_image/ai_quiz/avatar_minute), amount (positive=credit, negative=debit), balance_after, description, stripe_payment_id, created_at
- **avatar_packs** - id, creator_id (FK), pack_type (starter/creator/pro/studio), minutes_total, minutes_used, stripe_payment_id, purchased_at, expires_at

### Marketing & Sales

- **landing_pages** - id, creator_id (FK), title, slug, page_json (block editor JSON), meta_title, meta_description, og_image_url, status (draft/published), created_at, updated_at
- **email_sequences** - id, creator_id (FK), name, trigger_type (enrollment/purchase/tag_added/manual), status (active/paused/draft), created_at
- **email_sequence_steps** - id, sequence_id (FK), subject, body_html, body_json, delay_hours, sort_order, sent_count, open_count, click_count
- **email_broadcasts** - id, creator_id (FK), subject, body_html, body_json, segment_filter (JSON), status (draft/scheduled/sending/sent), scheduled_at, sent_at, total_sent, total_opened, total_clicked
- **coupons** - id, creator_id (FK), code, discount_type (percent/fixed), discount_value, max_redemptions, current_redemptions, valid_from, valid_until, applies_to (JSON - course IDs or all), created_at
- **affiliates** - id, creator_id (FK), user_id (FK), commission_percent, commission_fixed_cents, cookie_days, referral_code, total_referrals, total_earnings_cents, status (active/paused), created_at
- **affiliate_referrals** - id, affiliate_id (FK), referred_user_id (FK), referred_enrollment_id (FK), commission_cents, status (pending/approved/paid), created_at, paid_at

---

### TASK 1.1: Create Complete Drizzle Schema

| Field | Detail |
|---|---|
| **Description** | Define ALL tables listed in Section 3.1 using Drizzle ORM with PostgreSQL dialect (Neon). Include all indexes, foreign keys, enums, and relations. Use UUID IDs, snake_case columns, and timestamp with timezone. |
| **Files** | `src/lib/db/schema/` (modular files), `src/lib/db/index.ts`, `drizzle.config.ts` |
| **Acceptance** | All tables created. drizzle-kit push succeeds. TypeScript types export correctly. Relations are queryable. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 1.2: Database Migration & Seed Script

| Field | Detail |
|---|---|
| **Description** | Create migration files and a seed script that creates: 1 admin user, 1 demo creator with Launch tier, 2 sample courses with modules/lessons/quizzes, 10 sample students with enrollments and progress, sample community posts. |
| **Files** | `src/lib/db/seed.ts`, `drizzle/` (migrations folder) |
| **Acceptance** | bun run seed creates reproducible demo data. All foreign keys valid. Seed is idempotent. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 2 hours |

### TASK 1.3: Multi-Tenant Middleware

| Field | Detail |
|---|---|
| **Description** | Create TanStack Start middleware that extracts creator_id from: (a) subdomain for student-facing routes, (b) session for creator dashboard routes, (c) custom domain lookup for white-label sites. All downstream queries must be scoped to the resolved creator_id. |
| **Files** | `src/middleware/tenant.ts`, `src/middleware/auth.ts` |
| **Acceptance** | Requests to creator.platform.com resolve correct creator. Custom domains resolve via creators table. Unauthorized cross-tenant access returns 403. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 3 hours |

---

# 4. Module 2: Authentication, Billing & Usage Metering

This module handles creator authentication, Stripe subscription billing with our 4-tier model, usage tracking against tier limits, overage billing, and the credit system for AI features.

## 4.1 Authentication Flow

Better Auth handles core auth with these plugins: admin (RBAC), stripe (subscription management), tanstackStartCookies. Two user types exist: creators (role=creator) who manage courses, and students (role=student) who are enrolled by creators. Creators sign up via the marketing site. Students are created per-creator via magic link or email/password within the creator's branded experience.

## 4.2 Stripe Product Architecture

Create these Stripe products and prices:

- **Product: Platform Subscription** - 4 prices (Launch monthly $29, Grow monthly $79, Scale monthly $149, Pro monthly $199) + 4 annual prices ($24/mo, $65/mo, $125/mo, $165/mo billed annually)
- **Product: AI Boost Add-on** - $9/month (2x AI credits)
- **Product: AI Unlimited Add-on** - $29/month (fair-use unlimited)
- **Product: Avatar Minutes** - 4 one-time prices (Starter $25, Creator $60, Pro $99, Studio $179)
- **Product: Overage** - Video Storage ($2/hr metered), Student Overage ($0.10/student metered), Email Overage ($1.50/1K metered)

## 4.3 Usage Metering Architecture

Usage is tracked in real-time via an event-sourced pattern. Every billable action writes to usage_events. A background job (cron, every hour) aggregates into monthly_usage. The usage check middleware runs on every creator action and compares current usage against tier limits.

Tier limits are defined as a config object, not in the database:

- **Launch:** 3 courses, 5 hrs video (18000 sec), 100 students, 2500 emails, 2 AI courses, 10 rewrites, 10 images, 5 quizzes
- **Grow:** 10 courses, 25 hrs video, 1000 students, 10000 emails, 5 AI courses, 30 rewrites, 50 images, 20 quizzes
- **Scale:** 25 courses, 100 hrs video, 5000 students, 25000 emails, 15 AI courses, 100 rewrites, 200 images, unlimited quizzes
- **Pro:** unlimited courses, 250 hrs video, 15000 students, 50000 emails, 30 AI courses, unlimited rewrites, 500 images, unlimited quizzes

## 4.4 Overage Mechanics

Three-strike soft cap system (Supabase model):

1. Notify at 80% of any limit via in-app banner + email
2. Warn at 100% with modal: upgrade tier or enable overages
3. At 110% (10% grace buffer), begin billing overages if enabled, otherwise hard-stop

Spend cap is ON by default. Creator must explicitly disable to allow overage billing. When hitting limit, show modal with math comparing overage cost vs upgrade cost.

---

### TASK 2.1: Better Auth Configuration with Stripe Plugin

| Field | Detail |
|---|---|
| **Description** | Configure Better Auth with: email/password auth, admin plugin (roles: admin, creator, student), stripe plugin with all 4 tier plans (monthly + annual = 8 prices), tanstackStartCookies plugin. Configure createCustomerOnSignUp, onSubscriptionComplete, onSubscriptionCancel, and onEvent for failed payments (trigger dunning email via SES). |
| **Files** | `src/lib/auth/index.ts`, `src/lib/auth/client.ts` |
| **Acceptance** | Creator signup creates Stripe customer. Checkout redirects work for all 8 plans. Subscription status syncs automatically. Cancel/reactivate works. Trial (14 days, CC required) prevents repeat trials. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 2.2: Tier Limits Configuration & Usage Check Middleware

| Field | Detail |
|---|---|
| **Description** | Create a TIER_LIMITS constant object defining all limits per tier. Create TanStack Start middleware that: loads creator's current tier, queries monthly_usage for current billing period, compares against limits, returns { withinLimits, usagePercent, nearLimit, atLimit, overLimit } for each metric. Attach to all creator route context. |
| **Files** | `src/lib/billing/tier-limits.ts`, `src/middleware/usage.ts` |
| **Acceptance** | Middleware correctly identifies usage state for all 6 metered dimensions. Returns accurate percentages. Handles billing period boundaries correctly. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 3 hours |

### TASK 2.3: Usage Event Tracking Service

| Field | Detail |
|---|---|
| **Description** | Create a UsageTracker service with methods: trackVideoUpload(creatorId, durationSeconds), trackStudentAdded(creatorId), trackEmailSent(creatorId, count), trackAiGeneration(creatorId, type, metadata), trackAvatarMinute(creatorId, minutes). Each writes to usage_events table. Include a batch-write mode for high-frequency events (emails) using a 10-second in-memory buffer that flushes to DB. |
| **Files** | `src/lib/billing/usage-tracker.ts` |
| **Acceptance** | All 6 event types tracked correctly. Batch writes don't lose events on process restart (flush on SIGTERM). Monthly aggregation query returns correct totals. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 3 hours |

### TASK 2.4: Credit Ledger System

| Field | Detail |
|---|---|
| **Description** | Implement credit_ledger with double-entry-style tracking. Methods: allocateMonthlyCredits(creatorId, tier) - called on billing cycle start, debitCredit(creatorId, type, amount, description), getBalance(creatorId, type), purchaseAddon(creatorId, addonType, stripePaymentId). Credits reset monthly (no rollover). Add-on credits stack on top of base allocation. |
| **Files** | `src/lib/billing/credit-ledger.ts` |
| **Acceptance** | Monthly allocation correctly credits per tier table. Debit fails gracefully when insufficient credits (returns { success: false, remaining: 0 }). Balance queries are O(1) via balance_after column. Add-on purchases correctly increase limits. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 3 hours |

### TASK 2.5: Usage Dashboard UI

| Field | Detail |
|---|---|
| **Description** | Build creator dashboard showing: usage bars for each metered dimension (video storage, students, emails) with color-coded thresholds (green <60%, yellow 60-80%, orange 80-100%, red >100%). AI credits remaining as counters with circular progress rings. Avatar minutes pack balance. Upgrade CTA appears when any metric >80%. Overage toggle with cost estimate. |
| **Files** | `src/routes/_authed/dashboard/usage.tsx`, `src/components/billing/UsageBar.tsx`, `src/components/billing/CreditCounter.tsx` |
| **Acceptance** | All 6 usage metrics display correctly. Colors match thresholds. Upgrade modal shows price comparison. Overage toggle persists to DB. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 2.6: Pricing Page with Tier Comparison

| Field | Detail |
|---|---|
| **Description** | Public pricing page showing all 4 tiers with feature comparison matrix. Monthly/annual toggle with savings badge. Each tier has a CTA that redirects to Stripe Checkout via Better Auth stripe plugin. Include AI credits comparison row, avatar video row (shows 'Add-on' for all tiers). Highlight 'Most Popular' on Grow tier. |
| **Files** | `src/routes/_public/pricing.tsx`, `src/components/billing/PricingCard.tsx`, `src/components/billing/TierComparison.tsx` |
| **Acceptance** | All 8 checkout links work (4 monthly + 4 annual). Feature matrix matches Section 1.2. Annual savings displayed correctly. Mobile responsive. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

### TASK 2.7: Overage Billing Integration

| Field | Detail |
|---|---|
| **Description** | When creator disables spend cap, create Stripe metered subscription items for overage products. On each hourly aggregation, if any metric exceeds tier limit, report usage to Stripe via stripe.subscriptionItems.createUsageRecord(). Auto-upgrade recommendation: if overages > 50% of next tier price for 2 consecutive months, surface banner. |
| **Files** | `src/lib/billing/overage-billing.ts`, `src/lib/billing/auto-upgrade.ts` |
| **Acceptance** | Overage usage records appear in Stripe dashboard. Creator sees overage charges on invoice. Auto-upgrade banner triggers correctly. Spend cap re-enable stops overage tracking. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

---

# 5. Module 3: Course Builder

The course builder is the core product. It must be more intuitive than Kajabi's builder while including features Uscreen completely lacks (quizzes, certificates, structured progress). Every interaction should feel snappy - optimistic updates, drag-and-drop, and inline editing.

## 5.1 Course Builder UX Architecture

Three-panel layout: (Left) course outline tree with collapsible modules, (Center) content editor for selected lesson, (Right) settings panel for the selected item. The outline tree uses @dnd-kit/sortable for reordering modules and lessons. Lessons support 5 types: Video, Text, Quiz, Assignment, and Live Session.

## 5.2 Rich Text Editor

TipTap (ProseMirror-based) with these extensions: StarterKit (paragraphs, headings, lists, code blocks), Image (R2 upload), Video embed, Table, Highlight, TaskList, Placeholder, CharacterCount, Typography (smart quotes), CodeBlockLowlight, Mention (for tagging students in community). Export to HTML for email and JSON for the editor.

---

### TASK 3.1: Course CRUD with tRPC Router

| Field | Detail |
|---|---|
| **Description** | Create courses tRPC router with: create, update, delete, list (with pagination, search, status filter), getBySlug, duplicate, updateSortOrder. All mutations scoped to creator_id via middleware. Slug auto-generates from title (with collision handling). Include enrollment_count and completion_rate as computed fields on list queries. |
| **Files** | `src/server/routes/courses.ts` |
| **Acceptance** | CRUD operations work. Slug uniqueness enforced per-creator. Duplicate creates deep copy (modules + lessons + quizzes). Sort order persists. Pagination works with cursor-based approach. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 3 hours |

### TASK 3.2: Module & Lesson CRUD

| Field | Detail |
|---|---|
| **Description** | Create modules and lessons tRPC routers. Modules: create, update, delete, reorder. Lessons: create (with type), update, delete, reorder (within module and across modules via drag), updateContent (separate mutation for autosave). Implement optimistic reordering - the UI updates immediately, server confirms. |
| **Files** | `src/server/routes/modules.ts`, `src/server/routes/lessons.ts` |
| **Acceptance** | Modules nest under courses correctly. Lessons nest under modules. Cross-module drag works (lesson moves from Module A to Module B). Autosave debounces at 2 seconds. Delete cascades correctly. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 3.3: Course Builder UI - Three Panel Layout

| Field | Detail |
|---|---|
| **Description** | Build the course builder page at /dashboard/courses/[id]/edit. Left panel: course outline tree using @dnd-kit/sortable with collapsible modules, drag handles, lesson type icons, and inline rename. Center panel: TipTap editor for text lessons, video upload for video lessons, quiz builder for quiz lessons. Right panel: settings (publish status, drip schedule, free preview toggle, SEO fields). |
| **Files** | `src/routes/_authed/dashboard/courses/$id.edit.tsx`, `src/components/course/CourseOutline.tsx`, `src/components/course/LessonEditor.tsx`, `src/components/course/CourseSettings.tsx` |
| **Acceptance** | Three-panel layout renders. DnD reordering works for modules and lessons (including cross-module). TipTap editor loads/saves content. Settings panel updates in real-time. Mobile: collapses to single panel with tab navigation. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 8 hours |

### TASK 3.4: Video Upload to R2 with HLS Processing

| Field | Detail |
|---|---|
| **Description** | Implement direct upload from browser to R2 via presigned URLs. After upload, trigger a Cloudflare Worker or background job that uses FFmpeg (via a processing service) to transcode to HLS (360p, 720p, 1080p) and generate thumbnail. Store HLS manifest and segments in R2. Update lesson with video_url (HLS manifest), video_duration_seconds, and thumbnail_url. Track upload against creator's video storage limit. |
| **Files** | `src/lib/storage/r2-upload.ts`, `src/lib/video/hls-processor.ts`, `src/components/course/VideoUploader.tsx` |
| **Acceptance** | Upload progress bar shows correctly. Video transcodes to 3 quality levels. HLS manifest plays in standard video players. Duration extracted accurately. Storage usage tracked. Upload rejected when at tier limit. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 6 hours |

### TASK 3.5: Quiz Builder UI

| Field | Detail |
|---|---|
| **Description** | Build quiz creation interface within the lesson editor. Support 4 question types: multiple choice (single correct), checkbox (multiple correct), true/false, short answer. Each question has: question text, options (for MC/checkbox), correct answer, explanation (shown after attempt), point value. Drag-and-drop question reordering. Configure passing score % and max attempts on the quiz. |
| **Files** | `src/components/course/QuizBuilder.tsx`, `src/components/course/QuestionEditor.tsx` |
| **Acceptance** | All 4 question types create/edit correctly. Options add/remove dynamically. Correct answer selection works. Preview mode shows quiz as student would see it. Passing score configurable 0-100%. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 3.6: Certificate Designer

| Field | Detail |
|---|---|
| **Description** | Build certificate template editor. Creator configures: logo upload, title text, subtitle text, background image/color, whether to include completion date, serial number, and expiration. Preview renders a certificate with placeholder data. On course completion (100% lessons + passing quiz if required), auto-generate PDF certificate using React-PDF or Puppeteer, store in R2, and email to student. |
| **Files** | `src/components/course/CertificateDesigner.tsx`, `src/lib/certificates/generate.ts` |
| **Acceptance** | Certificate preview renders with creator's branding. PDF generates correctly on completion trigger. Serial number is unique. Student can download from their dashboard. LinkedIn share link works. |
| **Priority** | P2 - Medium |
| **Estimate** | 4 hours |

### TASK 3.7: Drip Content Scheduling

| Field | Detail |
|---|---|
| **Description** | Implement drip content at the module level. Creator sets drip_delay_days per module (0 = immediately available, 7 = available 7 days after enrollment). The student-facing course player checks enrollment date + module drip delay to determine visibility. Locked modules show with a lock icon and 'Available in X days' countdown. Option for date-based drip (specific calendar dates for cohort courses). |
| **Files** | `src/lib/courses/drip-scheduler.ts`, `src/components/course/DripConfig.tsx` |
| **Acceptance** | Modules correctly lock/unlock based on enrollment date + delay. Countdown timer accurate. Date-based drip works for cohort courses. Creator can preview drip schedule as a timeline. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

---

# 6. Module 4: AI Course Generation Engine

This is our primary differentiator against every competitor. No platform natively integrates AI course generation with credit-based pricing into their core product. The AI engine uses a multi-step pipeline: outline generation, lesson content expansion, quiz generation, and image generation. Each step is independently regenerable.

## 6.1 AI Pipeline Architecture

The pipeline follows a chain-of-thought pattern with model selection optimized for cost:

1. **Outline Generation (Claude Sonnet):** Creator provides topic + target audience + skill level + desired length. AI generates course title, description, module structure, and lesson titles. Cost: ~$0.05 per outline.
2. **Lesson Content Expansion (Claude Sonnet):** For each lesson in the approved outline, generate comprehensive content in TipTap JSON format with headings, paragraphs, lists, callout boxes, and code blocks where relevant. Cost: ~$0.08 per lesson.
3. **Quiz Generation (Claude Haiku):** For each module, generate quiz questions based on the lesson content. Auto-detect appropriate question types. Cost: ~$0.01 per quiz.
4. **Summary & Description (Claude Haiku):** Generate course description, module summaries, and SEO meta description. Cost: ~$0.01.
5. **Image Generation (DALL-E 3):** Generate course thumbnail and per-lesson illustrations in a consistent style. Cost: ~$0.04 per image.

Total cost for a full 10-module course with quizzes and images: $0.50-$2.00. We charge this against monthly credits worth $29-199/month = 15-60x markup.

## 6.2 Streaming UX

Course generation uses server-sent events (SSE) to stream progress to the UI. The creator sees a real-time progress panel showing: current step (outline/lessons/quizzes/images), streaming text as it generates, a progress bar, and the ability to pause/cancel. Each generated section appears in an editable preview card that the creator can accept, regenerate, or manually edit before publishing.

---

### TASK 4.1: AI Service Layer - Claude & DALL-E Clients

| Field | Detail |
|---|---|
| **Description** | Create AI service with: generateOutline(topic, audience, level, moduleCount), expandLesson(outlineContext, lessonTitle, lessonObjectives), generateQuiz(lessonContent, questionCount, questionTypes), generateSummary(courseContent), generateImage(description, style). Each method handles: API key rotation, retry with exponential backoff, token counting for billing, streaming support. Use Claude Sonnet for outline/lessons, Haiku for quizzes/summaries, DALL-E 3 for images. |
| **Files** | `src/lib/ai/course-generator.ts`, `src/lib/ai/image-generator.ts`, `src/lib/ai/prompts.ts` |
| **Acceptance** | All 5 generation methods work. Streaming returns partial results. Token counts accurate within 5%. Retry handles 429/500 errors. API keys validated on startup. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 6 hours |

### TASK 4.2: AI Prompt Templates

| Field | Detail |
|---|---|
| **Description** | Create a comprehensive prompt library with system prompts and user prompt templates for each generation step. Prompts must specify: output format (TipTap JSON for lessons, structured JSON for outlines/quizzes), pedagogical best practices (learning objectives, Bloom's taxonomy alignment, active recall), and content style guidelines. Include few-shot examples in each prompt. |
| **Files** | `src/lib/ai/prompts.ts` (expanded), `src/lib/ai/prompt-templates/` (one file per step) |
| **Acceptance** | Outline prompt generates well-structured 5-15 module courses. Lesson prompt generates 800-2000 word lessons with proper formatting. Quiz prompt generates varied question types with plausible distractors. All outputs parse as valid JSON. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 4.3: AI Course Generation Wizard UI

| Field | Detail |
|---|---|
| **Description** | Build a multi-step wizard at /dashboard/courses/new/ai. Step 1: Input (topic, audience, level, module count, tone). Step 2: Outline Review (editable tree of modules/lessons, add/remove/rename). Step 3: Generation Progress (SSE stream showing real-time generation with progress bar). Step 4: Review & Edit (full course preview with per-section regenerate buttons). Step 5: Publish (final review, set pricing, publish). |
| **Files** | `src/routes/_authed/dashboard/courses/new/ai.tsx`, `src/components/ai/GenerationWizard.tsx`, `src/components/ai/OutlineEditor.tsx`, `src/components/ai/GenerationProgress.tsx`, `src/components/ai/ContentReview.tsx` |
| **Acceptance** | Wizard flows through all 5 steps. SSE streaming shows real-time progress. Regenerate button works per-section without re-generating the entire course. Credit deduction happens at generation start. Insufficient credits shows upgrade modal. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 8 hours |

### TASK 4.4: AI Image Generation for Courses

| Field | Detail |
|---|---|
| **Description** | Integrate DALL-E 3 for generating: course thumbnail (16:9, consistent brand style), per-lesson illustrations (4:3, matching style), and quiz header images. Creator can: auto-generate images during course creation, regenerate individual images, upload custom images to replace AI ones. Store generated images in R2. Debit AI image credits on generation. |
| **Files** | `src/lib/ai/image-generator.ts`, `src/components/ai/ImageGenerator.tsx` |
| **Acceptance** | Images generate in consistent style across a course. 16:9 and 4:3 aspect ratios correct. Images upload to R2 and URL persists. Regenerate replaces old image. Credit deduction accurate. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

### TASK 4.5: AI Lesson Rewrite & Enhancement

| Field | Detail |
|---|---|
| **Description** | Within the lesson editor, add AI actions: Rewrite (regenerate entire lesson), Simplify (reduce complexity), Expand (add more detail), Add Examples (generate practical examples), Fix Grammar, Translate (to any language). Each action takes the current lesson content as context and returns modified TipTap JSON. Show a diff view before applying changes. |
| **Files** | `src/components/ai/LessonAIActions.tsx`, `src/lib/ai/lesson-enhancer.ts` |
| **Acceptance** | All 6 AI actions produce meaningful improvements. Diff view clearly shows changes. Creator can accept or reject changes. Credit deduction per action. Undo restores previous version. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

---

# 7. Module 5: HeyGen Avatar Video Integration

HeyGen avatar videos are our premium add-on product with 66-80% margins. This integration allows creators to generate professional presenter videos for their course lessons using AI avatars, without ever appearing on camera. This is priced strictly per-minute via prepaid packs - NEVER included in base subscription tiers.

## 7.1 HeyGen API Integration Architecture

The integration follows this flow: Creator selects avatar and voice from HeyGen's catalog. Creator writes or AI-generates a script for the lesson. Script is submitted to HeyGen's POST /v2/video/generate endpoint. HeyGen processes the video (2-10 minutes depending on length). Webhook fires on completion with video URL. Video is downloaded from HeyGen, uploaded to R2, and linked to the lesson. Creator's avatar pack balance is debited by the video duration.

## 7.2 Avatar Video Types & Pricing

- **Stock avatars (standard quality):** $2.00/min to creator ($0.50/min our cost = 75% margin)
- **Stock avatars (Avatar IV / hyper-realistic):** $6.00/min to creator ($3.00/min our cost = 50% margin)
- **Custom avatar from creator's photo:** $99 one-time setup + standard per-minute rates

---

### TASK 5.1: HeyGen API Client

| Field | Detail |
|---|---|
| **Description** | Create HeyGen API client wrapping v2 endpoints: listAvatars() - GET /v2/avatars, listVoices() - GET /v2/voices, generateVideo(avatarId, voiceId, script, options) - POST /v2/video/generate, getVideoStatus(videoId) - GET /v2/video_status.get, downloadVideo(videoId). Include: API key management, webhook signature verification, rate limit handling (respect X-RateLimit headers), retry logic for 429s, cost calculation per request based on script word count (estimate ~150 words/minute). |
| **Files** | `src/lib/heygen/client.ts`, `src/lib/heygen/types.ts`, `src/lib/heygen/webhook.ts` |
| **Acceptance** | Avatar listing returns all available avatars with previews. Voice listing returns languages and styles. Video generation submits correctly. Webhook receives completion events. Rate limits respected. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 5.2: Avatar Video Generation Workflow

| Field | Detail |
|---|---|
| **Description** | Build the end-to-end workflow: (1) Creator opens avatar video panel in lesson editor, (2) Selects avatar from gallery with preview thumbnails, (3) Selects voice with audio preview, (4) Writes script or clicks 'AI Generate Script' (uses lesson content to generate a presenter script via Claude), (5) Shows estimated duration and cost in minutes, (6) Checks avatar pack balance - if insufficient, shows purchase modal, (7) Submits to HeyGen, (8) Shows processing status with estimated completion time, (9) On completion, video appears in lesson editor, (10) Creator can preview, regenerate, or delete. |
| **Files** | `src/components/heygen/AvatarSelector.tsx`, `src/components/heygen/VoiceSelector.tsx`, `src/components/heygen/ScriptEditor.tsx`, `src/components/heygen/VideoGenerationStatus.tsx`, `src/lib/heygen/workflow.ts` |
| **Acceptance** | Full 10-step workflow completes end-to-end. Script AI generation produces natural presenter narration. Duration estimate is accurate within 10%. Pack balance checks prevent overdraft. Processing status updates via polling (every 10s). Video plays correctly in lesson after completion. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 8 hours |

### TASK 5.3: Avatar Pack Purchase Flow

| Field | Detail |
|---|---|
| **Description** | Build avatar pack purchase UI and Stripe integration. Show 4 packs (Starter/Creator/Pro/Studio) with per-minute price breakdown. Purchase creates Stripe one-time payment session. On successful payment: create avatar_packs record with minutes_total, credit the credit_ledger with avatar_minute credits. Show pack balance and usage history in dashboard. |
| **Files** | `src/components/heygen/PackPurchase.tsx`, `src/routes/_authed/dashboard/avatar-packs.tsx`, `src/lib/heygen/pack-billing.ts` |
| **Acceptance** | All 4 pack purchases process correctly via Stripe. Pack minutes are immediately available after payment. Usage history shows each video generation with minutes consumed. Multiple packs stack (use oldest first - FIFO). Expired packs (if applicable) handled gracefully. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

### TASK 5.4: HeyGen Webhook Handler

| Field | Detail |
|---|---|
| **Description** | Create webhook endpoint at /api/webhooks/heygen. Handle events: video.completed (download video from HeyGen URL, upload to R2, update lesson.video_url, debit avatar pack minutes), video.failed (notify creator via in-app notification + email, refund minutes to pack balance), video.expired. Verify webhook signature. Implement idempotency via video_id dedup. |
| **Files** | `src/routes/api/webhooks/heygen.ts` |
| **Acceptance** | Webhook endpoint responds 200 to all valid events. Video download + R2 upload works. Lesson record updated with video URL. Failed videos refund minutes. Duplicate webhooks are idempotent. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

---

# 8. Module 6: Student-Facing Experience

The student experience must be best-in-class. This is what creators show to their paying students. It needs to feel like a premium product - fast, intuitive, and engaging. The student portal runs on the creator's custom domain or subdomain with full branding.

---

### TASK 6.1: Student Portal Layout & Branding

| Field | Detail |
|---|---|
| **Description** | Build the student-facing shell that loads the creator's brand settings: logo, brand color, custom CSS. Layout: top nav (logo, course navigation, profile dropdown), main content area, mobile-responsive. The portal runs at creator-slug.platform.com or creator's custom domain. Apply brand_color to buttons, links, and accents. Apply custom_css as a style tag. |
| **Files** | `src/routes/_public/_student.tsx`, `src/components/student/StudentLayout.tsx`, `src/components/student/BrandedNav.tsx` |
| **Acceptance** | Portal renders with creator's logo and colors. Custom domain resolves correctly. Custom CSS applies without breaking layout. Mobile navigation works. Dark/light mode respects creator settings. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 6.2: Course Player with Progress Tracking

| Field | Detail |
|---|---|
| **Description** | Build the course player page. Left sidebar: course outline with completion checkmarks, current lesson highlighted, locked lessons grayed with countdown. Center: lesson content (video player with HLS.js for video lessons, rendered TipTap content for text lessons, quiz interface for quiz lessons). Progress auto-saves: video position every 10 seconds, lesson marked complete on scroll-to-bottom (text) or video end or quiz pass. Overall course progress bar in the header. |
| **Files** | `src/routes/_public/_student/courses/$slug.tsx`, `src/components/student/CoursePlayer.tsx`, `src/components/student/LessonViewer.tsx`, `src/components/student/VideoPlayer.tsx` |
| **Acceptance** | HLS video plays with quality selection. Progress saves and restores on return. Lesson completion triggers correctly for all 3 types. Overall progress percentage accurate. Drip-locked content shows correctly. Mobile: full-width video with collapsible outline. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 8 hours |

### TASK 6.3: Quiz Taking Experience

| Field | Detail |
|---|---|
| **Description** | Build the student quiz interface. Show questions one at a time or all at once (configurable). Timer display if time limit set. For multiple choice: radio buttons with hover states. For checkboxes: multi-select. For short answer: text input. For file upload: drag-and-drop zone. On submit: show score, passing/failing status, correct answers with explanations, and option to retry if attempts remaining. |
| **Files** | `src/components/student/QuizPlayer.tsx`, `src/components/student/QuestionRenderer.tsx` |
| **Acceptance** | All 4 question types render and accept input correctly. Timer counts down and auto-submits. Score calculation accurate. Explanations shown for incorrect answers. Retry respects max_attempts. Quiz results saved to quiz_attempts. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 6.4: Student Dashboard

| Field | Detail |
|---|---|
| **Description** | Build the student's home dashboard showing: enrolled courses with progress bars and 'Continue' buttons, recently accessed lessons, completed courses with certificate download links, community activity feed, and notification bell. The 'Continue' button deep-links to the last accessed lesson at the exact video timestamp. |
| **Files** | `src/routes/_public/_student/dashboard.tsx`, `src/components/student/CourseCard.tsx`, `src/components/student/ContinueLearning.tsx` |
| **Acceptance** | All enrolled courses display with accurate progress. Continue button resumes at exact position. Completed courses show certificate link. Recent activity orders correctly. Empty states have clear CTAs. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 6.5: Certificate Download & Sharing

| Field | Detail |
|---|---|
| **Description** | When a student completes a course and meets certificate requirements (if configured), auto-generate a PDF certificate with the creator's branding, student name, course title, completion date, and unique serial number. Store in R2. Email to student. Provide download link and social sharing buttons (LinkedIn Add to Profile URL, Twitter/X share, Facebook share) on the student dashboard. |
| **Files** | `src/lib/certificates/generate-pdf.ts`, `src/components/student/CertificateCard.tsx` |
| **Acceptance** | PDF renders with all configured fields. Serial number unique. Download works. LinkedIn share opens correct URL. Email delivery confirmed. |
| **Priority** | P2 - Medium |
| **Estimate** | 3 hours |

### TASK 6.6: Student Notes System

| Field | Detail |
|---|---|
| **Description** | Allow students to take timestamped notes during video lessons. Notes panel slides out from the right side. Each note is linked to the current video timestamp - clicking a note seeks to that point. Notes persist across sessions. Export notes as PDF or markdown. |
| **Files** | `src/components/student/NotesPanel.tsx`, `src/server/routes/notes.ts` |
| **Acceptance** | Notes save with correct timestamp. Clicking note seeks video. Notes persist and load on return. Export generates clean document. Mobile: notes accessible via bottom sheet. |
| **Priority** | P2 - Medium |
| **Estimate** | 3 hours |

---

# 9. Module 7: Community Platform

Community is the retention engine. Kajabi just redesigned their community in 2025. Skool's entire value prop is community + courses. We need channels, posts, reactions, moderation, and gamification to match or exceed them.

---

### TASK 7.1: Community Channel Management

| Field | Detail |
|---|---|
| **Description** | Build channel CRUD for creators: create/edit/delete channels, set channel type (feed or chat), access level (public/members-only/specific-course), custom emoji icon, sort order. Feed channels support threaded posts. Chat channels support real-time messages. Channel list renders in the student sidebar. |
| **Files** | `src/server/routes/community-channels.ts`, `src/components/community/ChannelManager.tsx` |
| **Acceptance** | CRUD works. Access levels enforced (non-enrolled students can't see course-specific channels). Feed and chat types render differently. Sort order persists via drag-and-drop. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

### TASK 7.2: Community Feed - Posts & Comments

| Field | Detail |
|---|---|
| **Description** | Build the community feed for feed-type channels. Posts support: rich text (TipTap), image uploads (R2), video uploads (short-form, max 60 seconds), polls (multi-option, single or multi-answer), and GIF picker. Threaded comments up to 2 levels deep. Reactions on posts (like, love, fire, clap). Pin posts. Infinite scroll with cursor-based pagination. Polling for new posts (every 30 seconds). |
| **Files** | `src/components/community/PostFeed.tsx`, `src/components/community/PostComposer.tsx`, `src/components/community/PostCard.tsx`, `src/components/community/CommentThread.tsx`, `src/server/routes/community-posts.ts` |
| **Acceptance** | Posts create with all media types. Comments thread correctly to 2 levels. Reactions toggle on/off. Pinned posts stay at top. Pagination loads smoothly. New post poll shows notification badge. Image/video uploads to R2. |
| **Priority** | P1 - High |
| **Estimate** | 6 hours |

### TASK 7.3: Community Moderation Tools

| Field | Detail |
|---|---|
| **Description** | Build moderation suite for creators: reported content queue (posts reported by members), bulk actions (hide/delete/ban author), keyword filter list (auto-flag posts containing configured words), member blocking (blocks community access without canceling subscription), moderation log (audit trail of all mod actions). Auto-flag posts with >3 reports. |
| **Files** | `src/components/community/ModerationQueue.tsx`, `src/lib/community/auto-moderator.ts`, `src/routes/_authed/dashboard/community/moderation.tsx` |
| **Acceptance** | Report button works for members. Queue shows all flagged content. Bulk actions process correctly. Keyword filter catches configured words. Block prevents posting. Mod log records all actions with timestamp and moderator. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 7.4: Gamification System

| Field | Detail |
|---|---|
| **Description** | Implement points, levels, and leaderboard (Kajabi/Skool model). Points awarded for: posting (5 pts), commenting (3 pts), receiving a reaction (1 pt), completing a lesson (10 pts), completing a course (100 pts). Creator configures point values. Levels defined by point thresholds (Level 1: 0pts, Level 2: 50pts, etc up to Level 10). Leaderboard shows 7-day, 30-day, and all-time rankings. Level badge displays on profile and posts. |
| **Files** | `src/lib/community/gamification.ts`, `src/components/community/Leaderboard.tsx`, `src/components/community/LevelBadge.tsx` |
| **Acceptance** | Points accrue correctly for all action types. Level calculation accurate. Leaderboard sorts correctly for all 3 timeframes. Badge renders on posts and profile. Creator can customize point values. |
| **Priority** | P2 - Medium |
| **Estimate** | 4 hours |

---

# 10. Module 8: Landing Page Builder

Every course needs a sales page. Kajabi's page builder is one of their strongest features. We need a block-based builder that's simpler than Kajabi but produces professional results. Priority is speed-to-publish for creators, not pixel-perfect customization.

---

### TASK 8.1: Block-Based Page Builder Engine

| Field | Detail |
|---|---|
| **Description** | Build a section-based page builder. Each page is a vertical stack of sections. Each section contains blocks. Block types: Hero (headline + subtitle + CTA + background image/video), Text (rich text), Image (single + gallery), Video (embed or R2-hosted), Testimonials (carousel of quote cards), Pricing (renders course offer with checkout button), FAQ (accordion), CTA (button + text), Countdown Timer, Instructor Bio, Curriculum (auto-renders course outline), Custom HTML. Sections have configurable: background color/image, padding, max-width. |
| **Files** | `src/components/page-builder/PageBuilder.tsx`, `src/components/page-builder/blocks/` (one file per block type), `src/lib/page-builder/block-types.ts` |
| **Acceptance** | All 12 block types render in editor and preview. Sections drag to reorder. Block settings panel edits all properties. Page saves as JSON. Preview mode shows pixel-accurate rendering. Mobile responsive preview toggle. |
| **Priority** | P1 - High |
| **Estimate** | 8 hours |

### TASK 8.2: Landing Page Templates

| Field | Detail |
|---|---|
| **Description** | Create 6 starter templates: (1) Course Sales Page (hero + curriculum + testimonials + pricing + FAQ), (2) Free Lead Magnet (hero + benefits + email capture form), (3) Webinar Registration (countdown + speaker bio + agenda + register form), (4) Coming Soon (hero + email waitlist), (5) About / Instructor (bio + credentials + courses), (6) Minimal (hero + CTA). Each template is a pre-configured page_json that creators can customize. |
| **Files** | `src/lib/page-builder/templates/` (one JSON per template), `src/components/page-builder/TemplateSelector.tsx` |
| **Acceptance** | All 6 templates load correctly. Creator can modify any element. Template selection on new page creation. Templates render with creator's brand colors applied. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 8.3: Custom Domain & SSL

| Field | Detail |
|---|---|
| **Description** | Allow creators to connect custom domains. Flow: creator enters domain in settings, we provide a CNAME record to add (pointing to our edge), verify DNS propagation, provision SSL via Cloudflare for SaaS. Store custom_domain on creators table. Tenant middleware resolves custom domains via DB lookup (cached in edge KV). Include subdomain option: creator-slug.platform.com (free on all tiers). |
| **Files** | `src/lib/domains/custom-domain.ts`, `src/routes/_authed/dashboard/settings/domain.tsx`, `src/middleware/tenant.ts` (updated) |
| **Acceptance** | CNAME verification works. SSL provisions automatically. Custom domain serves creator's branded portal. Subdomain works on all tiers. DNS propagation checker shows status in UI. |
| **Priority** | P2 - Medium |
| **Estimate** | 4 hours |

### TASK 8.4: SEO Controls

| Field | Detail |
|---|---|
| **Description** | Add per-page SEO settings: meta title (max 70 chars with counter), meta description (max 160 chars), OG image upload, canonical URL, noindex toggle. Auto-generate sitemap.xml at /sitemap.xml with all published landing pages and courses. Add JSON-LD structured data for courses (Course schema) and pages (WebPage schema). Creator-level defaults in creator_settings for fallback OG image and site description. |
| **Files** | `src/components/page-builder/SEOPanel.tsx`, `src/routes/api/sitemap.xml.ts`, `src/lib/seo/structured-data.ts` |
| **Acceptance** | SEO fields save and render in HTML head. OG image appears in social share previews. Sitemap generates with correct URLs. Structured data validates in Google's Rich Results Test. Character counters show limits. |
| **Priority** | P2 - Medium |
| **Estimate** | 3 hours |

---

# 11. Module 9: Email Marketing System

Creators need built-in email marketing to avoid paying for Mailchimp or ConvertKit on top of the platform fee. We use Amazon SES ($0.10/1,000 emails) to keep costs negligible. The email system includes broadcasts, sequences, and transactional emails with a visual builder.

---

### TASK 9.1: SES Email Client & Template Rendering

| Field | Detail |
|---|---|
| **Description** | Create email sending service using Amazon SES v2 SDK. Methods: sendTransactional(to, template, data), sendBroadcast(segment, template, data), sendSequenceStep(to, step). Render templates using React Email components (converts React to HTML). Include: DKIM/SPF setup guide, bounce/complaint webhook handler, automatic suppression list management, send rate throttling (respect SES limits). |
| **Files** | `src/lib/email/ses-client.ts`, `src/lib/email/renderer.ts`, `src/lib/email/templates/` (base templates) |
| **Acceptance** | Transactional emails send and deliver to inbox (not spam). HTML renders correctly across Gmail, Outlook, Apple Mail. Bounces auto-add to suppression list. Complaint webhook processes correctly. Rate limiting prevents SES throttling. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 9.2: Email Broadcast System

| Field | Detail |
|---|---|
| **Description** | Build broadcast email UI: compose with rich text editor (React Email compatible blocks: text, image, button, divider, columns), subject line with personalization tokens ({first_name}, {course_name}), audience segmentation (all students, specific course enrollees, tag-based, active/inactive), send now or schedule, A/B testing for subject lines (2 variants, 10% test, winner to rest). Track: sent, delivered, opened, clicked, bounced, unsubscribed. |
| **Files** | `src/routes/_authed/dashboard/email/broadcasts.tsx`, `src/components/email/BroadcastComposer.tsx`, `src/components/email/SegmentBuilder.tsx`, `src/lib/email/broadcast-sender.ts` |
| **Acceptance** | Broadcast composes and sends to selected segment. Personalization tokens replace correctly. Schedule sends at configured time. A/B test splits audience and picks winner. Analytics track all 6 metrics. Unsubscribe link works. |
| **Priority** | P1 - High |
| **Estimate** | 6 hours |

### TASK 9.3: Email Sequence (Automation) Builder

| Field | Detail |
|---|---|
| **Description** | Build visual sequence builder. Trigger types: enrollment in course, purchase complete, tag added, manual add. Each step: email (subject + body), wait (configurable hours/days), condition (if opened previous email, if clicked link, if completed lesson). Visual flow: vertical timeline with cards for each step, drag to reorder, click to edit. Sequence states: draft, active, paused. |
| **Files** | `src/routes/_authed/dashboard/email/sequences.tsx`, `src/components/email/SequenceBuilder.tsx`, `src/lib/email/sequence-engine.ts` |
| **Acceptance** | Sequence triggers fire correctly on all 4 trigger types. Wait steps delay accurately. Condition branches work (opened/clicked/completed checks). Sequence pauses/resumes without losing position. Visual builder is intuitive with drag-and-drop. |
| **Priority** | P1 - High |
| **Estimate** | 6 hours |

### TASK 9.4: Transactional Email Templates

| Field | Detail |
|---|---|
| **Description** | Create branded email templates for all platform events: welcome email (after signup), enrollment confirmation, lesson drip notification (new content available), quiz results, certificate issued, payment receipt, payment failed (dunning), subscription canceling, subscription canceled, community mention notification, password reset. All templates use creator's branding (logo, brand_color). |
| **Files** | `src/lib/email/templates/` (one React Email component per template) |
| **Acceptance** | All 12 templates render with creator branding. Dynamic data inserts correctly. Templates pass HTML email validation. Preview in email composer shows accurate rendering. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

---

# 12. Module 10: Creator Analytics Dashboard

Creators need data to grow their business. The analytics dashboard shows revenue, student engagement, content performance, and marketing metrics. This directly competes with Kajabi's analytics (which includes a 6-month MRR forecast).

---

### TASK 10.1: Revenue Analytics

| Field | Detail |
|---|---|
| **Description** | Build revenue dashboard showing: MRR (monthly recurring revenue from course subscriptions and platform fee), total revenue (current month, last month, YoY), revenue by course, revenue by payment type (one-time vs subscription), ARPU (average revenue per student), LTV (lifetime value estimate based on churn rate), refunds. All with date range picker and chart visualization using Recharts. Include MRR trend chart (line) and revenue breakdown (stacked bar). |
| **Files** | `src/routes/_authed/dashboard/analytics/revenue.tsx`, `src/components/analytics/MRRChart.tsx`, `src/components/analytics/RevenueBreakdown.tsx` |
| **Acceptance** | MRR calculates correctly from active subscriptions. Revenue totals match Stripe data. Charts render with date range filtering. ARPU and LTV formulas are accurate. Export as CSV. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 10.2: Student Engagement Analytics

| Field | Detail |
|---|---|
| **Description** | Build engagement dashboard: total enrolled students, active students (logged in within 30 days), course completion rates (bar chart per course), average quiz scores, lesson drop-off analysis (which lessons have lowest completion), time-to-complete distribution, most/least popular lessons. Student activity heatmap (hour-of-day vs day-of-week when students are most active). |
| **Files** | `src/routes/_authed/dashboard/analytics/engagement.tsx`, `src/components/analytics/CompletionRates.tsx`, `src/components/analytics/DropoffAnalysis.tsx` |
| **Acceptance** | All metrics calculate correctly. Completion rates per course accurate. Drop-off analysis identifies the correct lesson. Heatmap renders with accurate data. Date range filtering works. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 10.3: Content Performance Analytics

| Field | Detail |
|---|---|
| **Description** | Build content analytics: views per lesson, average watch time vs video duration (engagement ratio), video completion rates, most re-watched segments, content ratings (if enabled). Show a ranked table of all lessons sorted by engagement. Identify 'problem' content (high drop-off, low completion) with warning indicators. |
| **Files** | `src/routes/_authed/dashboard/analytics/content.tsx`, `src/components/analytics/ContentTable.tsx` |
| **Acceptance** | Lesson ranking sorts by multiple metrics. Watch time calculation accurate. Problem content flagged with appropriate thresholds. Data loads within 2 seconds for creators with up to 1000 lessons. |
| **Priority** | P2 - Medium |
| **Estimate** | 3 hours |

---

# 13. Module 11: Integrations & Tracking

Creators need to connect their marketing stack. Based on our competitive audit, these are the integrations creators actually use and switch platforms over when missing.

---

### TASK 11.1: Analytics Pixel Integration

| Field | Detail |
|---|---|
| **Description** | Build integration settings page for: Meta Pixel (pixel_id + Conversions API access token for server-side events), Google Analytics 4 (measurement_id), Google Tag Manager (container_id), TikTok Pixel (pixel_id). Store in creator_settings. Inject scripts in the student-facing portal's <head>. For Meta CAPI: send server-side events for Purchase, Lead, ViewContent via Cloudflare Worker to avoid ad blockers. |
| **Files** | `src/routes/_authed/dashboard/settings/integrations.tsx`, `src/lib/integrations/meta-pixel.ts`, `src/lib/integrations/ga4.ts`, `src/lib/integrations/gtm.ts` |
| **Acceptance** | All 4 tracking pixels fire on student page views. Meta CAPI sends server-side purchase events. GA4 receives enhanced ecommerce events. Pixels only load on student portal, not creator dashboard. Validation checks pixel IDs before saving. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 11.2: Zapier Webhook Integration

| Field | Detail |
|---|---|
| **Description** | Implement outbound webhooks that fire on key events: enrollment.created, enrollment.completed, payment.succeeded, payment.failed, student.created, quiz.completed, certificate.issued. Each webhook sends a JSON payload with event data to creator-configured URLs. Include Zapier-compatible webhook format. Creator can configure up to 10 webhook URLs with event selection per URL. Include webhook logs showing last 50 deliveries with status codes and retry capability. |
| **Files** | `src/routes/_authed/dashboard/settings/webhooks.tsx`, `src/lib/integrations/webhook-dispatcher.ts` |
| **Acceptance** | All 7 event types fire webhooks correctly. JSON payload includes all relevant data. Failed deliveries retry 3 times with exponential backoff. Webhook logs show payload, status code, and timing. Zapier test trigger works. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 11.3: Affiliate Program

| Field | Detail |
|---|---|
| **Description** | Build native affiliate system. Creator invites affiliates (by email). Each affiliate gets: unique referral link (creator-domain.com/?ref=CODE), personalized coupon code, dashboard showing clicks/conversions/earnings. Cookie-based attribution with configurable window (30/60/90 days). Commission: percentage of sale (configurable per affiliate and per course). Payouts: manual approval, export for PayPal mass payment, or Stripe Connect payouts. Affiliate dashboard: see referred students, earnings, pending payouts. |
| **Files** | `src/routes/_authed/dashboard/affiliates.tsx`, `src/routes/_public/_student/ref/[code].tsx`, `src/lib/affiliates/tracking.ts`, `src/lib/affiliates/commission.ts` |
| **Acceptance** | Referral links set correct cookies. Attribution tracks across sessions. Commission calculates correctly on purchase. Affiliate dashboard shows accurate data. Payout export generates valid CSV. Cookie window configurable and respected. |
| **Priority** | P2 - Medium |
| **Estimate** | 6 hours |

---

# 14. Module 12: Creator Dashboard & Settings

The creator dashboard is the command center. It must load fast, show actionable metrics at a glance, and provide quick access to all platform features. This is where creators spend 80% of their time.

---

### TASK 12.1: Dashboard Home / Overview

| Field | Detail |
|---|---|
| **Description** | Build the creator dashboard home page showing: revenue summary (today, this week, this month with sparklines), new enrollments (count + trend), active students, usage meters (video storage, students, emails vs tier limits as mini progress bars), recent activity feed (new enrollments, payments, community posts), and quick action buttons (Create Course, Send Email, View Analytics). Load all data via parallel tRPC queries. |
| **Files** | `src/routes/_authed/dashboard/index.tsx`, `src/components/dashboard/MetricCard.tsx`, `src/components/dashboard/ActivityFeed.tsx`, `src/components/dashboard/QuickActions.tsx` |
| **Acceptance** | Dashboard loads in under 2 seconds. All metrics accurate. Sparklines show 7-day trends. Usage meters color-coded by threshold. Activity feed shows last 20 events. Quick actions navigate correctly. |
| **Priority** | P0 - Critical Path |
| **Estimate** | 4 hours |

### TASK 12.2: Creator Branding Settings

| Field | Detail |
|---|---|
| **Description** | Build branding configuration page: logo upload (R2), brand color picker (hex with preview), secondary color, font selection (from Google Fonts list), custom CSS textarea with syntax highlighting, favicon upload. Preview panel shows how branding looks on the student portal in real-time. Changes save and propagate immediately to the student-facing site. |
| **Files** | `src/routes/_authed/dashboard/settings/branding.tsx`, `src/components/settings/ColorPicker.tsx`, `src/components/settings/FontSelector.tsx`, `src/components/settings/BrandPreview.tsx` |
| **Acceptance** | All branding elements save and reflect on student portal. Color picker shows hex input and visual picker. Font selection loads Google Fonts preview. Custom CSS applies without breaking layout. Favicon renders in browser tab. |
| **Priority** | P1 - High |
| **Estimate** | 3 hours |

### TASK 12.3: Student Management

| Field | Detail |
|---|---|
| **Description** | Build student list view with: search by name/email, filter by course enrollment, filter by status (active/inactive/completed), sort by name/enrollment date/last active. Bulk actions: tag, send email, export CSV. Individual student view: profile info, enrollment history, progress per course, quiz scores, payment history, community activity. Manual actions: grant course access, revoke access, reset password link. |
| **Files** | `src/routes/_authed/dashboard/students/index.tsx`, `src/routes/_authed/dashboard/students/$id.tsx`, `src/components/students/StudentTable.tsx` |
| **Acceptance** | Search returns results within 500ms. Filters combine correctly. Bulk actions process up to 100 students. Individual view loads all data. CSV export includes all visible columns. Manual access grant works immediately. |
| **Priority** | P1 - High |
| **Estimate** | 4 hours |

### TASK 12.4: Checkout Customization

| Field | Detail |
|---|---|
| **Description** | Build checkout settings: checkout page logo, accent color, testimonials section (add/remove testimonials with photo + quote + name), guarantee badge (text + icon), order bump (add a second offer at checkout with a checkbox), custom fields (up to 3 text fields). Checkout preview shows exactly what the student will see. The actual checkout uses Stripe Checkout with metadata for custom fields. |
| **Files** | `src/routes/_authed/dashboard/settings/checkout.tsx`, `src/components/settings/CheckoutPreview.tsx` |
| **Acceptance** | Checkout customizations render on actual Stripe Checkout (via metadata + Stripe Checkout custom_fields). Testimonials display. Order bump adds second item to payment. Preview is pixel-accurate to final checkout. |
| **Priority** | P2 - Medium |
| **Estimate** | 3 hours |

---

# 15. Sprint Planning & Execution Order

Tasks are organized into 6 two-week sprints. Dependencies are respected - no task starts before its prerequisites ship. The critical path (P0 tasks) must complete in Sprints 1-2 to have a functional MVP.

## Sprint 1: Foundation (Weeks 1-2)

**Goal: Database schema, auth, billing, and basic course CRUD operational.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 1.1 | Create Complete Drizzle Schema | P0 | 4h |
| 1.2 | Database Migration & Seed Script | P0 | 2h |
| 1.3 | Multi-Tenant Middleware | P0 | 3h |
| 2.1 | Better Auth + Stripe Plugin Config | P0 | 4h |
| 2.2 | Tier Limits & Usage Middleware | P0 | 3h |
| 2.3 | Usage Event Tracking Service | P0 | 3h |
| 2.4 | Credit Ledger System | P0 | 3h |
| 3.1 | Course CRUD with tRPC | P0 | 3h |
| 3.2 | Module & Lesson CRUD | P0 | 4h |

**Sprint 1 Total: 29 hours**

## Sprint 2: Course Builder & Student Portal (Weeks 3-4)

**Goal: Creators can build courses and students can take them.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 3.3 | Course Builder UI - Three Panel Layout | P0 | 8h |
| 3.4 | Video Upload to R2 + HLS Processing | P0 | 6h |
| 6.1 | Student Portal Layout & Branding | P0 | 4h |
| 6.2 | Course Player with Progress Tracking | P0 | 8h |
| 12.1 | Dashboard Home / Overview | P0 | 4h |

**Sprint 2 Total: 30 hours**

## Sprint 3: AI Engine & Avatar (Weeks 5-6)

**Goal: AI course generation and HeyGen avatar videos operational.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 4.1 | AI Service Layer - Claude & DALL-E | P0 | 6h |
| 4.2 | AI Prompt Templates | P0 | 4h |
| 4.3 | AI Course Generation Wizard | P0 | 8h |
| 5.1 | HeyGen API Client | P0 | 4h |
| 5.2 | Avatar Video Generation Workflow | P0 | 8h |

**Sprint 3 Total: 30 hours**

## Sprint 4: Community & Email (Weeks 7-8)

**Goal: Community platform and email marketing operational.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 7.1 | Community Channel Management | P1 | 3h |
| 7.2 | Community Feed - Posts & Comments | P1 | 6h |
| 7.3 | Community Moderation Tools | P1 | 4h |
| 9.1 | SES Email Client & Templates | P1 | 4h |
| 9.2 | Email Broadcast System | P1 | 6h |
| 9.3 | Email Sequence Builder | P1 | 6h |

**Sprint 4 Total: 29 hours**

## Sprint 5: Marketing & Analytics (Weeks 9-10)

**Goal: Landing pages, analytics, integrations, and remaining features.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 8.1 | Block-Based Page Builder | P1 | 8h |
| 8.2 | Landing Page Templates | P1 | 4h |
| 10.1 | Revenue Analytics | P1 | 4h |
| 10.2 | Student Engagement Analytics | P1 | 4h |
| 11.1 | Analytics Pixel Integration | P1 | 4h |
| 11.2 | Zapier Webhook Integration | P1 | 4h |

**Sprint 5 Total: 28 hours**

## Sprint 6: Polish & Remaining Features (Weeks 11-12)

**Goal: All P2 features, remaining P1 items, QA, and launch prep.**

| Task | Title | Priority | Hours |
|---|---|---|---|
| 2.5 | Usage Dashboard UI | P1 | 4h |
| 2.6 | Pricing Page | P1 | 3h |
| 2.7 | Overage Billing Integration | P1 | 4h |
| 3.5 | Quiz Builder UI | P1 | 4h |
| 3.6 | Certificate Designer | P2 | 4h |
| 3.7 | Drip Content Scheduling | P1 | 3h |
| 4.4 | AI Image Generation | P1 | 3h |
| 4.5 | AI Lesson Rewrite & Enhancement | P1 | 4h |
| 5.3 | Avatar Pack Purchase Flow | P1 | 3h |
| 5.4 | HeyGen Webhook Handler | P1 | 3h |
| 6.3-6.6 | Student Quiz, Dashboard, Certs, Notes | P1-P2 | 14h |
| 7.4 | Gamification System | P2 | 4h |
| 8.3-8.4 | Custom Domains & SEO | P2 | 7h |
| 9.4 | Transactional Email Templates | P1 | 4h |
| 10.3 | Content Performance Analytics | P2 | 3h |
| 11.3 | Affiliate Program | P2 | 6h |
| 12.2-12.4 | Branding, Students, Checkout Settings | P1-P2 | 10h |

**Sprint 6 Total: 76 hours (parallelizable across multiple agents)**

## Total Effort Summary

| Category | Tasks | Estimated Hours |
|---|---|---|
| **P0 - Critical Path** | 19 tasks | ~110 hours |
| **P1 - High Priority** | 24 tasks | ~98 hours |
| **P2 - Medium Priority** | 10 tasks | ~44 hours |
| **TOTAL** | **53 tasks** | **~252 hours** |

**With 3 parallel Claude Code agents, the critical path completes in ~37 hours (Sprint 1-2). Full platform achievable in 12 weeks.**

---

# 16. Competitive Feature Comparison

This matrix shows exactly where we beat every competitor. Green-highlighted cells are our advantages.

| Feature | Us | Kajabi | Teachable | Uscreen | Whop |
|---|---|---|---|---|---|
| Starter Price | **$29/mo** ✅ | $89/mo | $29/mo* | $49/mo | $0+10% |
| Transaction Fee | **0%** ✅ | 0% | 7.5%* | 5-10% | 2.9-10% |
| AI Course Gen | **Included** ✅ | Basic | No | No | No |
| Avatar Video | **$2/min** ✅ | No | No | No | No |
| Quizzes | **Yes (4 types)** ✅ | Yes | Yes | No | No |
| Certificates | Yes | Yes | Yes | No | No |
| Community | Full | Full | Basic | Full | Full |
| Email Marketing | **Built-in** ✅ | Built-in | No | Basic | No |
| Page Builder | Yes | Yes | Basic | Basic | No |
| Affiliates | Built-in | Growth+ | No | Via Zapier | Built-in |
| Custom Domain | **All tiers** ✅ | All tiers | Paid plans | All tiers | No |
| Gamification | Yes | Yes | No | Streaks | No |
| White Label | Pro tier | $199/mo+ | $309/mo | Add-on | No |

*Teachable Starter includes 7.5% transaction fee on top of Stripe processing fees*

---

# 17. Agent Execution Guidelines

## 17.1 Code Standards

- TypeScript strict mode everywhere. No 'any' types.
- All tRPC procedures must use Zod input validation.
- All database queries must be scoped to creator_id (multi-tenant).
- Use optimistic updates for all mutations that affect UI state.
- Mobile-first responsive design. Test at 375px, 768px, 1280px.
- All forms use React Hook Form + Zod for validation.
- Error boundaries on every route. User-friendly error messages.
- Loading skeletons for all async data (never show blank screens).
- Accessibility: all interactive elements have ARIA labels. Keyboard navigable.

## 17.2 Testing Requirements

- Every tRPC router must have integration tests covering: happy path, auth failure, validation failure, and edge cases.
- Every UI component with user interaction must have basic interaction tests.
- Usage metering must have property-based tests verifying: credits never go negative, usage never exceeds limits without overage flag, billing cycle boundaries handled correctly.
- AI generation must have snapshot tests for prompt templates ensuring no regressions.

## 17.3 Security Requirements

- All student-facing routes check enrollment status. No data leaks between creators.
- All file uploads validate Content-Type and file size limits server-side.
- All presigned URLs expire within 10 minutes (uploads) or 4 hours (video playback).
- Rate limiting: 100 requests/minute per creator for API, 10 requests/minute for AI generation.
- Webhook endpoints verify signatures (Stripe, HeyGen). Reject unsigned requests.
- SQL injection impossible via Drizzle ORM parameterized queries. XSS prevented via React auto-escaping + TipTap sanitization.

---

*This PRD contains 53 executable tasks across 12 modules. Go build something world-class.*
