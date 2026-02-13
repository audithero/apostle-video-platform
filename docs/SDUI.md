# Server-driven UI template system with visual builder: the definitive PRD

**This PRD defines the complete architecture for a visual template builder, SDUI rendering pipeline, and integrated module ecosystem that will power a white-label OTT/course platform.** The system enables non-technical creators to visually design multi-platform apps (iOS, Android, tvOS, web), preview changes in real-time, and deploy to app stores with a single click — all while building compound switching costs through deeply integrated analytics, email, gamification, community, and ad monetization modules. The technical foundation is TanStack Start (React), Turso/Drizzle ORM, Better Auth with Stripe, Cloudflare R2, BullMQ, and React Native + react-native-tvos for consumer apps.

---

## 1. Visual template builder architecture

### 1.1 Core editor framework: Craft.js + iframe preview hybrid

The visual builder uses **Craft.js** as its core editor engine, chosen for its resolver-based component registration, flat node serialization, and full React integration — combined with an **iframe-based preview** for CSS isolation and accurate rendering.

**Component registration** works through Craft.js's resolver pattern, where React components are registered as a key-value map on the `<Editor>` component. Each component defines a static `craft` property with settings panels, drag rules, and default props:

```tsx
<Editor resolver={{ HeroSection, VideoPlayer, LessonCard, PricingTable, CourseGrid }}>
  <Frame>
    <Element is={Container} canvas>
      <HeroSection title="My Course" />
    </Element>
  </Frame>
</Editor>
```

Components expose their editable properties through a `craft.related.settings` component, rendered in the sidebar when selected. The `useNode()` hook provides `setProp()` for real-time property updates and `connect(drag(ref))` connectors for drag-and-drop behavior. **Craft.js uses its own custom DnD system** — not react-dnd — with positioning logic borrowed from GrapesJS.

**Serialization** produces a flat JSON node map (not a nested tree), where each node references parent/children by ID:

```json
{
  "ROOT": {
    "type": { "resolvedName": "Container" },
    "props": { "background": "#1a1a2e", "padding": 20 },
    "nodes": ["node-hero", "node-curriculum"],
    "linkedNodes": {}
  },
  "node-hero": {
    "type": { "resolvedName": "HeroSection" },
    "props": { "title": "Master React Native", "subtitle": "Build production apps", "ctaText": "Enroll Now" },
    "parent": "ROOT"
  }
}
```

This flat structure is superior for random access and partial updates — critical for real-time editing operations. The JSON is compressed with `lzutf8` before storage in Turso.

**The iframe preview architecture** (inspired by Builder.io and GrapesJS) renders the actual template inside an iframe for complete CSS isolation, while the editor controls live in the parent window. Communication uses `postMessage` with origin validation:

```
┌─────────────────────────────┐
│  Parent Window (Editor UI)  │
│  - Component palette        │
│  - Property panels          │   postMessage (JSON patches)
│  - Layer tree / navigator   │ ──────────────────────────→
│  - Template JSON state      │                            │
│                             │   ┌─────────────────────┐  │
│                             │   │  iframe (Preview)    │  │
│                             │   │  - Renders template  │  │
│                             │   │  - CSS-isolated      │  │
│                             │   │  - Selection overlay │  │
│                             │   └─────────────────────┘  │
└─────────────────────────────┘
```

JSON patches (generated via Immer.js, following Webstudio's open-source pattern) are sent on each edit, enabling sub-100ms preview updates without full re-renders. The iframe uses Nanostores for reactive state management, subscribing to specific node changes and re-rendering only affected components.

### 1.2 Component registration system for SDUI

Every component in the system serves dual duty: it renders in the visual builder AND maps to a React Native component on the consumer app. The registration schema defines both builder behavior and SDUI rendering metadata:

```tsx
const componentRegistry = {
  HeroSection: {
    component: HeroSectionWeb,           // Web/builder React component
    nativeComponent: 'HeroSection',       // React Native component name
    category: 'Layout',
    icon: 'layout',
    inputs: [
      { name: 'title', type: 'string', required: true },
      { name: 'subtitle', type: 'text' },
      { name: 'backgroundImage', type: 'file', allowedTypes: ['image/*'] },
      { name: 'ctaText', type: 'string', defaultValue: 'Get Started' },
      { name: 'ctaAction', type: 'action', actionTypes: ['navigate', 'enroll', 'openUrl'] },
      { name: 'overlayGradient', type: 'boolean', defaultValue: true },
    ],
    craft: {
      rules: { canDrag: true, canMoveIn: ['Text', 'Button'] },
      related: { settings: HeroSettings },
    },
    platforms: ['ios', 'android', 'tvos', 'web'],
    responsive: { mobile: { layout: 'stack' }, tablet: { layout: 'side-by-side' }, tv: { layout: 'cinematic' } },
  }
};
```

This unified registry pattern (synthesized from Builder.io's `registerComponent`, Plasmic's prop types, and Shopify's section schema) ensures that every component the creator drags onto the canvas will render correctly across all target platforms.

### 1.3 Responsive breakpoint system

Following Webflow's model, the builder supports **5 breakpoints** with bidirectional cascade: Mobile (320px), Tablet (768px), Desktop (1024px, base), Large Desktop (1440px), and TV (1920px). Styles set at Desktop cascade both up and down; overriding at a breakpoint breaks inheritance for that direction. The property panel shows inherited vs. overridden values with visual indicators.

Platform-specific overrides handle tvOS focus management (spatial navigation, focus guides) and mobile touch targets (minimum 44pt), stored as platform-specific prop variants in the template JSON.

### 1.4 Section and block architecture

Templates follow **Shopify's section/block hierarchy**: screens are composed of sections (hero, curriculum, instructor bio, pricing), and sections contain configurable blocks (individual lesson cards, testimonial items, feature bullets). This two-level hierarchy balances flexibility with simplicity — creators rearrange sections, configure blocks, but never face the complexity of arbitrary nesting.

Each section defines its schema (following Shopify's `{% schema %}` pattern) with typed settings: `string`, `text`, `number`, `range`, `select`, `color`, `image_picker`, `url`, `video_url`, `richtext`. Settings are stored as JSON in Turso alongside the section's layout definition.

---

## 2. Live preview system for multi-platform templates

### 2.1 Primary approach: react-native-web SDUI renderer

The live preview uses **react-native-web** to render React Native components directly in the browser, wrapped in device frame mockups. This approach delivers **~50-200ms update latency**, covers ~90% of core React Native components, and runs entirely client-side with zero server cost.

The preview architecture:

```
┌─────────────────────┐     postMessage      ┌──────────────────────────┐
│   Visual Builder    │ ──────────────────→   │  Preview iframe          │
│   (Craft.js editor) │   (template JSON)     │  (react-native-web)      │
│                     │                       │                          │
│   Generates SDUI    │ ←────────────────     │  ┌────────────────────┐  │
│   JSON on each edit │   (interaction        │  │  Device Mockup     │  │
│                     │    events)            │  │  ┌──────────────┐  │  │
│                     │                       │  │  │ SDUI Renderer│  │  │
│                     │                       │  │  │ (recursive)  │  │  │
│                     │                       │  │  └──────────────┘  │  │
│                     │                       │  └────────────────────┘  │
└─────────────────────┘                       └──────────────────────────┘
```

The SDUI recursive renderer maps component types from the template JSON to react-native-web components:

```tsx
const componentRegistry = {
  View: RNView, Text: RNText, Image: RNImage,
  ScrollView: RNScrollView, HeroSection, VideoPlayer,
  LessonCard, PricingTable, CourseGrid, ProgressBar,
};

function SDUIRenderer({ node }) {
  if (typeof node === 'string') return <Text>{node}</Text>;
  const Component = componentRegistry[node.type];
  if (!Component) return null;
  return (
    <Component {...node.props}>
      {node.children?.map((child, i) => <SDUIRenderer key={i} node={child} />)}
    </Component>
  );
}
```

react-native-web maps React Native primitives to DOM elements: `<View>` → `<div>` with flexbox defaults, `<Text>` → `<div>` with text semantics, `<Image>` → `<img>`, `<ScrollView>` → `<div>` with overflow scroll. Styles authored in JS convert to **atomic CSS classes** at runtime.

### 2.2 Device frame previews

The preview iframe renders inside CSS device mockups for **four form factors**: iPhone (390×844), Android phone (412×915), iPad/tablet (1024×768), and Apple TV (1920×1080). Users toggle between devices using a toolbar above the preview.

For TV previews, the renderer simulates **spatial navigation** by mapping keyboard arrow keys to focus changes, rendering focus states with highlighted borders. The `TVFocusGuideView` component gets a web polyfill that traps focus within defined regions. Layout accuracy is high; only parallax animations and native focus effects cannot be perfectly replicated.

### 2.3 Enhanced native preview (optional)

For creators who need exact native fidelity, the system offers two enhanced preview modes:

- **Expo Go QR scanning**: Generates a QR code that opens the template in Expo Go on the creator's physical device, with real-time updates via WebSocket through the Expo Snack SDK
- **Appetize.io embed**: Embeds a streaming cloud simulator iframe for iOS/tvOS devices, providing 100% native fidelity at the cost of ~200-500ms input lag and usage-based pricing ($40-400/month)

The react-native-web preview serves as the primary, always-available preview; enhanced modes are progressive enhancements for final QA.

---

## 3. SDUI rendering pipeline and content architecture

### 3.1 SDUI JSON schema design (modeled on Airbnb's Ghost Platform)

The SDUI schema follows Airbnb's **section-based architecture**, the most proven enterprise SDUI pattern. Screens are composed of typed sections, each with props and server-defined actions:

```json
{
  "screen": {
    "id": "course-detail",
    "layout": { "type": "scroll", "backgroundColor": "#FFFFFF" },
    "sections": [
      {
        "id": "hero",
        "componentType": "HeroMedia",
        "props": {
          "imageUrl": "https://r2.example.com/hero.jpg",
          "videoUrl": "https://stream.example.com/trailer.m3u8",
          "overlayGradient": true
        }
      },
      {
        "id": "course-meta",
        "componentType": "CourseMetaHeader",
        "props": {
          "title": "Introduction to Design",
          "instructor": { "name": "Jane Doe", "avatarUrl": "..." },
          "rating": 4.8,
          "enrolledCount": 12500,
          "duration": "6h 30m"
        }
      },
      {
        "id": "cta",
        "componentType": "PrimaryButton",
        "props": { "label": "Enroll Now — $49", "style": "filled" },
        "actions": {
          "onPress": {
            "type": "navigate",
            "destination": "/checkout",
            "params": { "courseId": "course-123" }
          }
        }
      },
      {
        "id": "curriculum",
        "componentType": "AccordionList",
        "props": {
          "items": [
            {
              "title": "Module 1: Foundations",
              "subtitle": "4 lessons · 45 min",
              "children": [
                {
                  "componentType": "LessonRow",
                  "props": { "title": "What is Design?", "duration": "12 min", "icon": "video", "isLocked": false },
                  "actions": { "onPress": { "type": "navigate", "destination": "/lesson/lesson-1" } }
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

**Action types** supported by the client renderer: `navigate` (in-app screen), `deepLink` (external), `apiCall` (server mutation), `openUrl` (browser), `showModal`, `showSheet`, `dismiss`, `haptic`, `toast`, `analytics`. This server-defined action system enables the builder to bind user interactions without app updates.

### 3.2 Content model for course/OTT platform

The content hierarchy stored in Turso via Drizzle ORM:

| Content Type | Key Fields |
|---|---|
| **Course** | title, slug, description, thumbnail (R2 URL), instructorId (ref), modules[], categoryId, tags[], price, status (draft/published/archived), dripConfig |
| **Module** | title, description, order, lessons[], prerequisites[] |
| **Lesson** | title, contentBlocks[] (SDUI JSON), duration, isFree, order |
| **Video Block** | videoUrl (R2/HLS), duration, transcript, captions[], thumbnail |
| **Text Block** | body (TipTap JSON), format |
| **Quiz** | questions[], passingScore, maxAttempts, timeLimit |
| **Assignment** | title, description, rubric, submissionType |
| **Certificate** | templateId, fields[], completionCriteria |
| **Student Progress** | userId, courseId, completedLessons[], quizScores{}, streakDays, xpEarned, lastAccessedAt |

**Drip content scheduling** supports four modes: fixed-date release, enrollment-relative (N days after enrollment), first-access-relative, and prerequisite-based (must complete prior lessons). The system stores enrollment timestamps per user and evaluates access rules at request time. BullMQ scheduled jobs trigger email notifications when content unlocks.

### 3.3 Content vs. layout separation

The system maintains a clean separation between **content** (CMS-managed, presentation-agnostic data like course titles, video URLs, quiz questions) and **layout** (SDUI-managed screen structure, component types, ordering, actions). The visual builder stores both: content documents in Turso and screen definitions as SDUI JSON referencing content by ID. The API layer resolves references at request time, hydrating SDUI screens with current content data.

### 3.4 Rich text editing with TipTap

**TipTap** is the rich text editor, chosen for its extension ecosystem, JSON output, and native collaboration support. It wraps ProseMirror with a dramatically simpler API:

- **Extension system**: Everything (nodes, marks, plugins) is an extension. Custom Node Views render React components inside the editor for video embeds, quiz blocks, code snippets, and interactive elements
- **JSON output**: Stores content as ProseMirror-compatible JSON that maps naturally to SDUI components
- **Collaboration**: Native Yjs integration via `@tiptap/extension-collaboration` or Liveblocks via `@liveblocks/react-tiptap` for managed infrastructure
- **SDUI mapping**: TipTap JSON nodes (`heading`, `paragraph`, `image`) transform server-side to SDUI components (`Heading`, `Paragraph`, `ImageBlock`) for mobile rendering

For collaborative editing, the system uses **Yjs CRDTs** (self-hosted via y-websocket or Hocuspocus), enabling Google Docs-style real-time co-editing with presence awareness, live cursors, and conflict-free merging. CRDTs are favored over Operational Transforms for their offline support, P2P capability, and simpler architecture.

---

## 4. The data pipeline from builder to consumer app

### 4.1 End-to-end flow

```
CREATOR (Visual Builder)
    │
    │ Saves template JSON + content to Turso
    ▼
CONTENT STORE (Turso + Drizzle ORM)
    │
    │ • Template SDUI JSON (sections, layout, component types)
    │ • Content data (courses, lessons, videos, quizzes)
    │ • Creator settings (branding, colors, fonts)
    │ • Schedule/drip configuration
    │
    │ API request from consumer app (TanStack Start server functions)
    ▼
SDUI API LAYER (TanStack Start server functions)
    │
    │ • Resolves content references into SDUI JSON
    │ • Applies drip rules (checks enrollment date + current date)
    │ • Applies user progress (completed lessons, XP, streaks)
    │ • Applies A/B test variants (feature flags)
    │ • Personalizes for user segment
    │ • Returns composed SDUI screen response
    ▼
CONSUMER APP RENDERER (React Native + react-native-tvos)
    │
    │ Component Registry maps componentType → native component
    │ Layout Engine interprets layout directives (scroll, grid, tabs)
    │ Action Handler maps action types → navigation/API calls
    │ Offline Cache stores last SDUI response in AsyncStorage
    │
    ▼
END USER sees the app
```

### 4.2 Backward compatibility and versioning

The SDUI client must handle unknown component types gracefully. When the server sends a `componentType` the client doesn't recognize, it renders a fallback (empty view or placeholder). Following **Duolingo's SDUI versioning pattern**: the client caches the UI configuration locally, guaranteeing it can always render. If the client version is too old for the latest layout, the server sends only updated content data; the client renders using its cached (older) layout with fresh content. This eliminates the need for manual version checks.

---

## 5. Integrated modules that create compound switching costs

### 5.1 The compound switching cost thesis

The platform's moat is **not any single feature** but the compounding effect of deeply integrated modules on a shared data layer. Research on Shopify (61% of GMV through Shopify Payments, 16,000+ app ecosystem), HubSpot (61% of Pro+ customers landing with multiple hubs, 100%+ net revenue retention), and Notion (estimated $15K-$50K enterprise migration costs) proves that multi-product platforms with shared data create switching costs that grow exponentially with each module adopted.

**The core principle (HubSpot's "Clydesdale Rule")**: One Clydesdale pulls 1,000 lbs; two Clydesdales pull 4,000 lbs. Products built on shared data, shared UI, and shared user identity create value greater than the sum of their parts.

### 5.2 Module roadmap prioritized by switching cost impact

**Phase 1 — Foundation (Months 1-6): Data gravity**

- **Course builder + video hosting** (★★★★★): Content is the primary gravity. Once courses are uploaded, structured with modules/lessons, and generating student progress data, migration becomes a multi-week undertaking
- **Analytics dashboard** (★★★★★): Historical data creates irreplaceable institutional knowledge. Metrics include completion rates, drop-off points, revenue per course, LTV per student, engagement heatmaps, cohort analysis, funnel conversion. Modeled on YouTube Studio's tab structure (Overview → Content → Audience → Revenue → Trends)
- **Built-in email marketing** (★★★★☆): Event-triggered automations connected to course events — enrollment welcome sequences, module completion congratulations, inactivity re-engagement, course completion upsells, streak break recovery. Tag-based segmentation by progress, engagement level, purchase history, and quiz performance (following Kajabi's model). These automated workflows connected to platform events cannot be replicated by third-party email tools

**Phase 2 — Engagement (Months 6-12): Emotional lock-in**

- **Gamification system** (★★★★★): XP points (10 per lesson, 50 per module, 25 bonus for perfect quizzes), daily learning streaks (Duolingo data shows **3.6x retention lift** for 7-day streaks, **14% day-14 retention increase** from streak wagers), tiered badges (Course Completion, Speed Learner, Quiz Champion), weekly leaderboards with promotion/demotion. This creates non-exportable achievement history — the quintessential compound switching cost
- **Community platform** (★★★★★): Lesson-level discussions embedded within each lesson (not a separate forum), auto-created cohort groups, live Q&A integration, peer accountability partners, activity feeds showing peer completions. Community creates relational switching costs — social capital, reputation, and relationships cannot be migrated

**Phase 3 — Monetization (Months 12-18): Revenue dependency**

- **SSAI ad management** (★★★★☆): Server-side ad insertion stitches ads directly into video streams before delivery — ad-blocker resistant with **98% average completion rates**. Support AVOD (free with ads), SVOD (premium subscription), and hybrid tiers. Uses VAST protocol for ad delivery, VMAP for mid-roll timing, SCTE-35 markers for break positions
- **Sales funnels and landing pages** (★★★★☆): Marketing infrastructure deeply integrated with course events, email automation, and analytics
- **Affiliate management** (★★★☆☆): Creates an external ecosystem of promoters invested in the platform

**Phase 4 — Ecosystem (Months 18-24): Network effects**

- **Integration marketplace** (★★★★★): Third-party developer ecosystem (the Shopify App Store model). Once creators integrate a dozen tools, replacing the entire stack becomes prohibitive
- **AI-powered features** (★★★★☆): AI tutor, content generation, personalized learning paths — compounds with data from all other modules
- **Payments/commerce** (★★★☆☆): Native payment processing creates financial dependency and data continuity

### 5.3 How modules compound on the shared data layer

All modules operate on a **unified student profile** stored in Turso: enrollment history, lesson completions, quiz scores, watch time, community activity, gamification state, email engagement, ad interactions, purchase history, and device data. Each module enriches this profile, and every other module benefits:

- Analytics data feeds email segmentation → email triggers gamification notifications → gamification drives community activity → community signals feed analytics → analytics inform content strategy → content drives engagement → engagement attracts higher CPM advertisers → ad revenue data feeds analytics → cycle compounds

A creator using all modules faces replacing: video content (days/weeks), historical analytics (irreplaceable), email automations (dozens of sequences), student streaks/XP/badges (emotional devastation), community relationships (unexportable social capital), ad monetization (CPM optimization), landing pages (marketing infrastructure), affiliate relationships (external ecosystem), and mobile app presence (App Store listing). This is the compound moat.

---

## 6. Modern dashboard UI that feels world-class

### 6.1 Performance architecture stack

The creator dashboard is built on **TanStack Start** with a carefully layered performance stack:

```
TanStack Start (full-stack SSR + streaming)
├── TanStack Router (preloading, parallel loaders, view transitions)
├── TanStack Query v5 (SWR caching, optimistic updates)
├── shadcn/ui + Radix UI + Tailwind CSS (component layer)
├── Motion (Framer Motion) (page transitions, layout animations)
├── WebSocket (real-time status updates)
└── Cmd+K command menu (keyboard-first navigation)
```

### 6.2 TanStack Router configuration for instant navigation

Route preloading on hover/intent is the single highest-impact performance technique. Combined with parallel loaders and deferred data, it eliminates the perception of loading:

```typescript
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',        // Preload on hover/touch
  defaultPreloadDelay: 50,          // Start fast
  defaultPreloadStaleTime: 30_000,  // Cache preloaded data 30s
  defaultViewTransition: true,      // Smooth View Transitions API
  context: { queryClient },
});

// Route definition with parallel loading + deferred data
export const Route = createFileRoute('/dashboard/analytics')({
  beforeLoad: async ({ context }) => {
    if (!context.auth) throw redirect({ to: '/login' });
  },
  loader: ({ context }) => {
    // Critical data: await it
    const overview = context.queryClient.ensureQueryData(analyticsOverviewOptions());
    // Non-critical data: don't await, stream later
    context.queryClient.prefetchQuery(recentActivityOptions());
    return { overview };
  },
  pendingComponent: AnalyticsSkeleton,
});

function AnalyticsPage() {
  const { overview } = Route.useLoaderData();
  return (
    <div>
      <OverviewCards data={overview} />
      <Suspense fallback={<ChartSkeleton />}>
        <ActivityChart />  {/* Streams after critical data */}
      </Suspense>
    </div>
  );
}
```

**Parallel loaders** are fundamental: `beforeLoad` runs sequentially (parent→child) for auth checks, while `loader` runs in parallel across all matched routes. This eliminates data waterfalls.

### 6.3 Optimistic updates for instant interaction feel

Every mutation uses TanStack Query's cache-level optimistic pattern — snapshot previous state, update cache immediately, rollback on error:

```typescript
const updateTemplate = useMutation({
  mutationFn: saveTemplateApi,
  onMutate: async (newTemplate) => {
    await queryClient.cancelQueries({ queryKey: ['template', newTemplate.id] });
    const previous = queryClient.getQueryData(['template', newTemplate.id]);
    queryClient.setQueryData(['template', newTemplate.id], newTemplate);
    return { previous };
  },
  onError: (err, vars, context) => {
    queryClient.setQueryData(['template', context.previous.id], context.previous);
    toast.error('Save failed — changes reverted');
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['template'] }),
});
```

### 6.4 Component foundation: shadcn/ui pattern

shadcn/ui's copy-paste model delivers polished, accessible components without runtime dependencies. Components are generated as local `.tsx` files — full ownership, no tree-shaking concerns. The stack: **Radix UI** for accessible primitives (Dialog, Popover, ScrollArea with WAI-ARIA, keyboard nav, screen reader support), **Tailwind CSS** for utility styling, **CVA (Class Variance Authority)** for variant management, and **CSS variables** (`--primary`, `--background`, `--foreground`) for consistent theming including dark mode.

### 6.5 Animation and transition layer

The dashboard uses three complementary animation systems:

**View Transitions API** for page-level transitions (TanStack Router integration with `defaultViewTransition: true`). Default cross-fade between routes, with direction-aware slide animations based on route hierarchy. Progressive enhancement: Chrome 111+, Safari 18+; falls back to instant navigation.

**Motion (Framer Motion)** for component-level animations. `AnimatePresence` with `mode="popLayout"` for route transitions with exit animations. `layoutId` for magic-motion morphing between list and detail views — a course card in the list smoothly morphs into the full course editor. FLIP animations automatically handled.

**Skeleton loading** built into every data component. Skeletons match actual content shape/spacing precisely, use shimmer animation (left-to-right gradient), and integrate with `<Suspense>` boundaries for streaming SSR. Skeletons are only shown for loads >200ms to avoid flash.

### 6.6 Keyboard-first design (Linear-inspired)

A global **Cmd+K command menu** provides instant access to every action: navigate to any screen, search courses/students/templates, toggle dark mode, access keyboard shortcuts reference. Individual shortcuts: `E` for edit, `D` for duplicate, `⌫` for delete, `/` for search focus. The command registry pattern maps shortcuts to action handlers with context-aware availability.

### 6.7 Real-time updates via WebSocket

Deployment status, build progress, student enrollments, and analytics updates stream via WebSocket with these optimizations:

- **Batch state updates**: Buffer WebSocket messages in a ref, flush at ~100ms intervals to prevent render thrashing
- **Diff-based protocol**: Only changed fields transmitted, reducing bandwidth 80%+
- **Virtualized lists**: `@tanstack/react-virtual` for course lists, student tables, and analytics feeds with 10,000+ items
- **Reconnection**: Exponential backoff retries with ping/pong heartbeats every 30s

---

## 7. Deployment pipeline that makes complex tech feel simple

### 7.1 State machine: from edit to live

```
DRAFT ──→ PREVIEWING ──→ QUEUED ──→ BUILDING ──→ BUILT ──→ SUBMITTING ──→ IN REVIEW ──→ LIVE
  ↑           │              │           │          │           │              │           │
  └───────────┘              └───────────┘          │           │              │           │
    (back to edit)         (retry on failure)        │           │              │           │
                                                    ↓           ↓              ↓           │
                                                  FAILED    FAILED         REJECTED        │
                                                    │           │              │           │
                                                    └───────────┴──────────────┘           │
                                                         (back to DRAFT with guidance)     │
                                                                                           │
                                                    LIVE → ROLLBACK → (instant for web,    │
                                                           resubmit for app stores)         
```

Each platform (iOS, Android, tvOS, web) tracks independently through this state machine, using BullMQ for job orchestration.

### 7.2 Multi-platform progress UI

The deployment dashboard shows per-platform cards with human-readable status:

| Technical Step | Creator-Facing Label | Icon |
|---|---|---|
| Queued / waiting for worker | "Preparing your app..." | ⏳ |
| Installing dependencies | "Setting things up..." | 🔧 |
| Compiling source | "Building your app..." | 🔨 |
| Running tests | "Checking everything works..." | ✅ |
| Signing binary | "Securing your app..." | 🔒 |
| Uploading to store | "Sending to App Store..." | 📤 |
| Store review | "Apple is reviewing..." | 👀 |
| Published | "Your app is live!" | 🎉 |
| Failed | "Something went wrong" | ⚠️ |

Each card shows a determinate progress bar during build steps, an estimated time remaining, and a contextual detail line. Error messages are translated from technical failures to human language: instead of "Build failed: exit code 1" → "We ran into an issue building your Android app. Our team has been notified and will fix this automatically."

### 7.3 Immutable deployments and instant rollback

Following Vercel's model, every build produces an **immutable deployment artifact** stored in Cloudflare R2. Rollback is instant for web (re-point domain to previous artifact, no rebuild) and requires resubmission for app stores. A "Version History" panel shows past versions with screenshot thumbnails and one-click "Revert to this version."

### 7.4 Preview sharing

Each build generates a unique **preview URL** (following Vercel/Netlify patterns) shareable with stakeholders who don't need platform accounts. Preview URLs include a toolbar showing template name, "Draft" status, device viewport selector, and "Share preview" button. For app builds, the preview link opens a react-native-web rendered version; for native fidelity, an Appetize.io streaming session.

### 7.5 Notification system

| Event | Notification |
|---|---|
| Build started | "We've started building your app! ~10 min" |
| Build completed | "Your iOS app has been built successfully" |
| Build failed | "We hit a snag. We're looking into it." |
| Submitted to store | "Your app has been submitted to Apple for review" |
| Store approved | "🎉 Your iOS app is now live!" |
| Store rejected | "Apple requested changes. Here's what's needed:" |

Notifications delivered via in-dashboard toast (real-time WebSocket), email, and optional push notifications for the creator's mobile device.

---

## 8. Template marketplace and discovery

### 8.1 Browse and filter architecture

Templates organized by primary filters: **Content Type** (Course Landing, Lesson Page, Dashboard, Checkout, Homepage), **Industry** (Business, Health, Creative, Tech, Education, Fitness), **Style** (Minimal, Bold, Corporate, Playful, Dark), and **Price** (Free with plan / Premium one-time purchase). Secondary filters for specific features: Video Player Style, Progress Tracking, Certificate Display, Community Section, Pricing Table.

Smart collections surface editorial curation: "Trending This Week," "New Arrivals," "Staff Picks," "Quick Start Templates." Sort options: Popularity, Newest, Price, Rating.

### 8.2 Preview experience

The template preview borrows Squarespace's standout pattern: **showing the creator's actual content** in the template, not generic lorem ipsum. When previewing a course template, the system pulls the creator's existing course title, description, lesson titles, and instructor photo into the template structure. This dramatically reduces decision uncertainty.

For first-time creators without content, **industry-specific demo datasets** pre-populate realistic content (e.g., "Introduction to Photography" with lesson thumbnails, instructor bio, pricing card). Multi-device preview toggles (phone/tablet/TV/desktop) render the template at each viewport. An "Instant Customization" panel allows color scheme, font, and logo changes right in the preview, before committing.

### 8.3 Template versioning with creator customizations

The template versioning system uses a **layered architecture** separating three concerns:

- **Template structure** (layout, sections, component types): Managed by template author, updatable
- **Content data** (text, images, videos): Owned by creator, never overwritten
- **Creator customizations** (colors, fonts, CSS overrides, section reordering): Stored in Turso as a customization overlay, preserved across template updates

Following the SDUI partial-update pattern (inspired by Duolingo): when a template updates, the system checks each section. Unchanged sections receive the update automatically. Customized sections are preserved with a notification: "New version available for [Section Name] — Preview changes." Bug fixes and minor styling auto-apply; layout changes require explicit creator approval.

The section-based architecture (Shopify OS 2.0 pattern) enables granular updates — individual sections update independently without affecting the whole template.

### 8.4 Business model

**Freemium base**: 8-12 high-quality free templates included with every platform subscription. **Premium marketplace**: One-time purchase ($29-$99) for premium templates, with 70/30 revenue split (creator/platform) aligned with app store norms. "Try before you buy" following Shopify's model: customize the template freely, pay only when publishing.

---

## 9. Technical implementation specifications

### 9.1 Database schema (Turso + Drizzle ORM)

Key tables:

```typescript
// Template definition
export const templates = sqliteTable('templates', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique(),
  category: text('category'),
  industry: text('industry'),
  style: text('style'),
  price: integer('price').default(0), // cents
  sdui_json: text('sdui_json').notNull(), // Compressed SDUI screen definition
  component_versions: text('component_versions'), // JSON: component→version map
  platforms: text('platforms'), // JSON array: ['ios','android','tvos','web']
  thumbnail_url: text('thumbnail_url'),
  preview_data: text('preview_data'), // Demo content JSON
  status: text('status').default('draft'),
  created_at: integer('created_at', { mode: 'timestamp' }),
  updated_at: integer('updated_at', { mode: 'timestamp' }),
});

// Creator's customized template instance
export const templateInstances = sqliteTable('template_instances', {
  id: text('id').primaryKey(),
  template_id: text('template_id').references(() => templates.id),
  creator_id: text('creator_id').references(() => users.id),
  customizations: text('customizations'), // JSON: color/font/logo overrides
  section_overrides: text('section_overrides'), // JSON: per-section customizations
  content_bindings: text('content_bindings'), // JSON: section→content ID mappings
  template_version: integer('template_version'),
  status: text('status').default('draft'),
});

// Deployment tracking
export const deployments = sqliteTable('deployments', {
  id: text('id').primaryKey(),
  instance_id: text('instance_id').references(() => templateInstances.id),
  platform: text('platform').notNull(), // 'ios' | 'android' | 'tvos' | 'web'
  status: text('status').default('queued'),
  build_log_url: text('build_log_url'),
  artifact_url: text('artifact_url'), // R2 URL for build artifact
  preview_url: text('preview_url'),
  version: text('version'),
  created_at: integer('created_at', { mode: 'timestamp' }),
  published_at: integer('published_at', { mode: 'timestamp' }),
});
```

### 9.2 BullMQ job orchestration

Build jobs orchestrated through BullMQ queues:

- **`template-build`**: Generates platform-specific app bundles from SDUI JSON + creator customizations
- **`app-submit`**: Uploads build artifacts to App Store Connect / Google Play Console
- **`content-publish`**: Processes scheduled content releases and drip unlocks
- **`email-trigger`**: Sends event-triggered emails (enrollment, completion, streak break)
- **`analytics-aggregate`**: Processes raw events into dashboard-ready aggregates
- **`video-transcode`**: Transcodes uploaded videos to HLS for streaming, stores in R2

Each queue has retry logic with exponential backoff, dead letter queues for persistent failures, and WebSocket status broadcasting to the creator dashboard.

### 9.3 Cloudflare R2 storage organization

```
r2-bucket/
├── templates/
│   ├── {templateId}/
│   │   ├── thumbnail.webp
│   │   ├── preview-screenshots/
│   │   └── assets/
├── creators/
│   ├── {creatorId}/
│   │   ├── brand/
│   │   │   ├── logo.svg
│   │   │   └── favicon.ico
│   │   ├── content/
│   │   │   ├── videos/ (HLS segments)
│   │   │   ├── images/
│   │   │   └── downloads/
├── deployments/
│   ├── {deploymentId}/
│   │   ├── ios-build.ipa
│   │   ├── android-build.aab
│   │   └── web-bundle/
```

### 9.4 Authentication and authorization (Better Auth + Stripe)

Better Auth handles creator authentication with Stripe integration for subscription management. Three permission levels:

- **Platform admin**: Full system access, template marketplace management
- **Creator**: Template customization, content management, deployment, analytics for their own courses
- **Collaborator**: Invited by creator with scoped permissions (content only, design only, analytics view only)

Stripe webhooks sync subscription status to Better Auth sessions, gating feature access by plan tier (free templates only vs. premium marketplace, number of courses, email sends/month, analytics depth).

---

## 10. Performance optimization priorities

### 10.1 Ranked by impact-to-effort ratio

| Priority | Technique | What It Does | Effort |
|---|---|---|---|
| **P0** | TanStack Router `defaultPreload: 'intent'` | Data ready before user clicks | Low |
| **P0** | Parallel loaders in route definitions | Eliminates data waterfalls | Low |
| **P0** | TanStack Start streaming SSR | Fast initial page load | Built-in |
| **P0** | Skeleton loading in every data component | Smooth perceived loading | Medium |
| **P0** | Optimistic updates for all mutations | Instant interaction feedback | Medium |
| **P1** | shadcn/ui + Radix + Tailwind foundation | Polish + accessibility | Medium |
| **P1** | Cmd+K command menu | Power-user velocity | Medium |
| **P1** | SWR caching for dashboard data | Fresh data without loading states | Low |
| **P1** | View Transitions API | Smooth page transitions | Low |
| **P1** | WebSocket for real-time status | Live deployment/content status | Medium |
| **P2** | Motion layout animations (layoutId) | Magic motion effects | Medium |
| **P2** | Virtualized lists (TanStack Virtual) | Handle 10K+ item lists | Medium |
| **P2** | IndexedDB draft storage | Offline draft saving | High |
| **P3** | Local-first sync engine | Zero-latency interactions | Very High |

### 10.2 The 80/20 rule

**Route preloading + optimistic updates + skeleton loading account for ~80% of perceived performance improvement with ~20% of implementation effort.** These three techniques should ship in the initial release. View Transitions, Motion animations, and local-first patterns are progressive enhancements for subsequent releases.

---

## 11. Key architectural decisions and rationale

### Why Craft.js over GrapesJS or Builder.io

**Craft.js** provides the right primitives (node management, DnD, serialization) while leaving all UI decisions to the implementer. GrapesJS is HTML-centric (models map to DOM elements, not React components). Builder.io is a hosted service with vendor lock-in. Craft.js's main limitations — no iframe isolation (addressed by our hybrid approach), no built-in undo/redo (implement via state history stack), and resolver-dependent deserialization (addressed by a shared component registry) — are all solvable.

### Why flat node map over nested tree

Craft.js's flat node map (UUID → node data) is superior for this use case. Random access to any node is O(1). Partial updates only touch affected nodes. Undo/redo stores minimal diffs. The trade-off — less intuitive for tree traversal — is minor since the visual builder rarely needs full-tree operations.

### Why react-native-web over Expo Snack or Appetize.io for primary preview

react-native-web runs entirely client-side with zero infrastructure cost, delivers sub-200ms latency, and covers ~90% of core components. Expo Snack requires server-side bundling (Snackager service). Appetize.io has usage-based pricing and streaming latency. The SDUI recursive renderer pattern means preview fidelity is limited only by the component registry — and since we control both the builder components and the native components, coverage is effectively 100% for our component vocabulary.

### Why TipTap over Lexical

TipTap has the larger extension ecosystem, more community resources, and ProseMirror handles large documents better. Its JSON output (ProseMirror document schema) maps cleanly to SDUI components. Both support Yjs collaboration; TipTap's integration is more mature. Lexical has better React-native patterns, but TipTap's headless architecture and static renderer (server-side rendering without an editor instance) are critical for the SDUI pipeline.

### Why CRDTs (Yjs) over Operational Transforms

CRDTs provide full offline support, don't require a central server for conflict resolution, and have simpler mental models. Joseph Gentle, former Google Wave engineer, has publicly stated "CRDTs are the future." Yjs is the fastest CRDT implementation in benchmarks, with optimizations for merging sequential operations and garbage collecting deleted content. The trade-off — document metadata growth from tombstones — is manageable with Yjs's built-in garbage collection.

---

## Conclusion: what makes this system defensible

This PRD describes a system where every component reinforces every other. The visual builder produces SDUI JSON that renders identically across four platforms. The template marketplace drives adoption while customization layers prevent lock-out anxiety. The deployment pipeline abstracts away app store complexity. And the integrated module ecosystem — analytics feeding email, email triggering gamification, gamification driving community, community enriching analytics — creates compound switching costs that grow with every month a creator uses the platform.

Three architectural bets distinguish this system from existing solutions. First, the **unified component registry** that serves triple duty: builder canvas rendering, react-native-web preview, and native app rendering from a single source of truth. Second, the **section-based SDUI schema** (modeled on Airbnb's Ghost Platform) that separates content from layout, enabling server-controlled updates without app store resubmission. Third, the **layered template versioning** that preserves creator customizations across template updates — solving the problem that has plagued WordPress and Shopify themes for decades.

The technical foundation — TanStack Start's parallel loaders and streaming SSR, Turso's edge-distributed SQLite, BullMQ's reliable job processing, and Cloudflare R2's cost-effective storage — provides the performance infrastructure for a dashboard that feels as responsive as Linear while handling the complexity of multi-platform app deployment. The path from here is execution: build the component registry, implement the SDUI renderer, ship the builder with 8 free templates, and let compound switching costs do the rest.