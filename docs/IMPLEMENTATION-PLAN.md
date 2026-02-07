# Implementation Plan - Course Creator Platform v2

## Architecture Decisions (Adapting PRD to Existing Codebase)

### What We Keep (Already Working)
- **Database**: Neon Postgres + Drizzle ORM (NOT switching to Turso - too disruptive)
- **Auth**: Better Auth with Stripe plugin (extend, don't replace)
- **Email**: Keep Resend for now (add SES later if needed)
- **Video**: Keep Mux for existing videos, add R2+HLS for new course videos
- **Storage**: Cloudflare R2 (already configured)
- **Framework**: TanStack Start + React 19 + TanStack Router
- **UI**: shadcn/ui + Tailwind (56+ components already installed)
- **API**: tRPC v11

### What We Build New
- Multi-tenant architecture (creator_id on all new tables)
- 30+ new database tables for courses, community, billing, marketing
- Course builder with 3-panel layout, DnD, TipTap editor
- AI course generation pipeline (Claude + DALL-E)
- HeyGen avatar video integration
- Student-facing branded portal
- Community platform (channels, posts, reactions, gamification)
- Landing page builder (block-based)
- Email marketing (broadcasts, sequences, templates)
- Analytics dashboard (revenue, engagement, content)
- Credit/usage metering system
- Affiliate program

## Sprint Execution Order

### Sprint 1: Foundation (Tasks 1.1 - 2.4, 3.1, 3.2)
Priority: P0 - Must complete first

1. **Schema Extension** - Add all 30+ new tables to existing Drizzle schema
2. **Multi-tenant middleware** - creator_id scoping
3. **Tier limits & usage metering** - Config + tracking service
4. **Credit ledger** - Double-entry credit system
5. **Course/Module/Lesson CRUD** - tRPC routers

### Sprint 2: Course Builder & Student Portal (Tasks 3.3, 3.4, 6.1, 6.2, 12.1)
Priority: P0 - Core product

6. **Course Builder UI** - 3-panel layout with DnD
7. **Video Upload** - R2 presigned URLs + processing
8. **Student Portal** - Branded layout + course player
9. **Dashboard Home** - Creator overview page

### Sprint 3: AI & Avatar (Tasks 4.1-4.3, 5.1-5.2)
Priority: P0 - Key differentiator

10. **AI Service Layer** - Claude + DALL-E clients
11. **AI Prompts** - Template library
12. **AI Wizard UI** - Multi-step generation flow
13. **HeyGen Client** - API integration
14. **Avatar Workflow** - End-to-end video generation

### Sprint 4: Community & Email (Tasks 7.1-7.3, 9.1-9.3)
Priority: P1

15. **Community channels** - CRUD + access control
16. **Community feed** - Posts, comments, reactions
17. **Community moderation** - Queue + auto-flagging
18. **Email client** - SES/Resend + templates
19. **Email broadcasts** - Compose + send + track
20. **Email sequences** - Automation builder

### Sprint 5: Marketing & Analytics (Tasks 8.1-8.2, 10.1-10.2, 11.1-11.2)
Priority: P1

21. **Page builder** - Block-based engine
22. **Page templates** - 6 starter templates
23. **Revenue analytics** - MRR, revenue charts
24. **Engagement analytics** - Completion, drop-off
25. **Pixel integration** - Meta, GA4, GTM
26. **Webhook integration** - Zapier-compatible

### Sprint 6: Polish (Remaining P1/P2 tasks)
All remaining tasks from the PRD
