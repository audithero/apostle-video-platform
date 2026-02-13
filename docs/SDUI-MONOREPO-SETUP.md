# SDUI Monorepo Architecture: Setup Guide for Claude Code Agents

> **Purpose**: This document instructs Claude Code agents on how to set up and structure the Server-Driven UI monorepo for a white-label OTT/course platform. It covers repo structure, the relationship between the existing TanStack Start creator dashboard and new consumer apps, shared packages, and the critical architectural decisions that must be followed.

---

## Decision 1: Use the Existing Repo — Do NOT Create a New One

The existing TanStack Start application already contains the core infrastructure. Starting a new repo would duplicate auth, database, API, and storage layers that are already working. The visual builder, SDUI API endpoints, template management, and deployment pipeline are **features within the existing creator-facing dashboard**, not a separate product.

### What stays in the existing app

The existing TanStack Start app becomes the **creator dashboard** — the command center where creators design templates, manage content, view analytics, send emails, and deploy apps. New features are added as route groups:

```
/dashboard/builder        ← Visual template builder (Craft.js)
/dashboard/templates      ← Template marketplace and management
/dashboard/deployments    ← Build status, app store submissions
/dashboard/analytics      ← Engagement, revenue, student metrics
/dashboard/email          ← Email marketing automations
/dashboard/community      ← Community management
/dashboard/settings       ← Branding, domain, app configuration
```

These sit alongside whatever routes already exist (courses, content management, auth, billing, etc.).

### What gets created as new packages/apps

Two new apps and two shared packages are added to make this a **Turborepo monorepo**:

```
/apps
  /creator-dashboard    ← EXISTING TanStack Start app (move here)
  /consumer-web         ← NEW: react-native-web consumer site
  /consumer-mobile      ← NEW: React Native + react-native-tvos app shell
/packages
  /sdui-schema          ← NEW: Shared TypeScript types for SDUI JSON
  /component-registry   ← NEW: Shared component definitions
```

---

## Decision 2: Web Templates Use react-native-web for Visual Parity

The consumer-facing **web** experience uses `react-native-web` to render the exact same SDUI components as the mobile and TV apps. This guarantees that one template design looks identical everywhere.

### How it works

```
Creator designs template in builder (TanStack Start dashboard)
        │
        ▼
    Saves SDUI JSON to Turso
        │
        ▼
┌──────────────────────────────────────────────┐
│  Consumer accesses content via:                │
│                                                │
│  📱 iOS/Android app    → React Native          │
│  📺 Apple TV/Android TV → react-native-tvos    │
│  🌐 Web browser        → react-native-web      │
│                                                │
│  ALL THREE render the same SDUI JSON           │
│  using the same component registry             │
└──────────────────────────────────────────────┘
```

### Component mapping (react-native-web)

| React Native Component | Web DOM Output |
|---|---|
| `<View>` | `<div>` with flexbox defaults |
| `<Text>` | `<div>` with text semantics |
| `<Image>` | `<img>` |
| `<ScrollView>` | `<div>` with overflow scroll |
| `<TouchableOpacity>` | `<div>` with click handler |
| `<FlatList>` | Virtualized `<div>` list |

Styles authored in JavaScript convert to **atomic CSS classes** at runtime. Layout is flexbox-based, so the same style objects produce identical layouts on web and native.

### Web consumer routing

The web consumer app lives at the creator's custom domain (e.g., `courses.janedoe.com`). Cloudflare Workers handle domain → creator resolution:

```
Student visits courses.janedoe.com
        │
        ▼
Cloudflare Worker looks up domain → creator_id
        │
        ▼
Fetches SDUI template JSON + content from Turso
        │
        ▼
Renders via react-native-web SDUI renderer
        │
        ▼
Student sees fully styled course platform
```

---

## Monorepo Setup Instructions

### Step 1: Initialize Turborepo at the project root

```bash
npx create-turbo@latest --skip-install
```

Or manually add to root `package.json`:

```json
{
  "name": "platform",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "devDependencies": {
    "turbo": "^2.x"
  }
}
```

Create `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".output/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Step 2: Move existing TanStack Start app

```bash
mkdir -p apps
mv <existing-app-contents> apps/creator-dashboard/
```

Update the app's `package.json` name:

```json
{
  "name": "@platform/creator-dashboard"
}
```

### Step 3: Create shared SDUI schema package

```bash
mkdir -p packages/sdui-schema/src
```

`packages/sdui-schema/package.json`:

```json
{
  "name": "@platform/sdui-schema",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

`packages/sdui-schema/src/index.ts` — the canonical SDUI type definitions:

```typescript
// ============================================================
// SDUI SCHEMA — THE SINGLE SOURCE OF TRUTH
// ============================================================
// This package defines every type used in the SDUI pipeline.
// The creator dashboard, consumer-web, and consumer-mobile
// ALL import from here. Never duplicate these types.
// ============================================================

// --- Core primitives ---

export type Platform = 'ios' | 'android' | 'tvos' | 'web';

export type ComponentType =
  | 'HeroSection'
  | 'VideoPlayer'
  | 'LessonCard'
  | 'CourseGrid'
  | 'ContentRow'
  | 'PricingTable'
  | 'InstructorBio'
  | 'CurriculumAccordion'
  | 'ProgressBar'
  | 'CommunityFeed'
  | 'LiveEventBanner'
  | 'TestimonialCarousel'
  | 'CTAButton'
  | 'TextBlock'
  | 'ImageBlock'
  | 'QuizBlock'
  | 'CertificateDisplay'
  | 'BadgeShowcase'
  | 'LeaderboardWidget'
  | 'StreakCounter';

// --- Actions ---

export type ActionType =
  | 'navigate'
  | 'deepLink'
  | 'openUrl'
  | 'apiCall'
  | 'showModal'
  | 'showSheet'
  | 'dismiss'
  | 'haptic'
  | 'toast'
  | 'analytics'
  | 'enroll'
  | 'playVideo';

export interface SDUIAction {
  type: ActionType;
  destination?: string;
  params?: Record<string, unknown>;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  confirmMessage?: string;
}

// --- Animation ---

export interface SDUIAnimation {
  from?: Record<string, number>;
  animate?: Record<string, number>;
  exit?: Record<string, number>;
  transition?: {
    type: 'spring' | 'timing';
    duration?: number;
    damping?: number;
    stiffness?: number;
  };
}

// --- Visibility & Conditions ---

export interface VisibilityCondition {
  field: string;          // e.g., 'user.enrolledCourses'
  operator: 'gt' | 'lt' | 'eq' | 'neq' | 'contains' | 'exists';
  value: unknown;
}

// --- Section (the building block of every screen) ---

export interface SDUISection {
  id: string;
  componentType: ComponentType;
  props: Record<string, unknown>;
  actions?: Record<string, SDUIAction>;
  children?: SDUISection[];
  animation?: SDUIAnimation;
  visibility?: VisibilityCondition[];
  platformOverrides?: Partial<Record<Platform, Partial<SDUISection>>>;
  dataEndpoint?: {
    url: string;
    ttl: number;            // Cache TTL in seconds
    refreshOnFocus?: boolean;
  };
  updateStrategy?: 'static' | 'polling' | 'realtime';
  subscriptionChannel?: string;
  fallbackType?: ComponentType;
  minClientVersion?: string;
  logging?: {
    impressionId: string;
    sectionPosition: number;
  };
}

// --- Screen (what the consumer app fetches and renders) ---

export interface SDUIScreen {
  id: string;
  title?: string;
  layout: {
    type: 'scroll' | 'tabs' | 'grid' | 'fixed';
    backgroundColor?: string;
    safeArea?: boolean;
    refreshable?: boolean;
  };
  sections: SDUISection[];
  meta?: {
    cacheKey: string;
    version: number;
    generatedAt: string;
  };
}

// --- Template (what the creator edits in the builder) ---

export interface SDUITemplate {
  id: string;
  name: string;
  slug: string;
  category: string;
  industry?: string;
  style?: string;
  screens: Record<string, SDUIScreen>;  // screenId → screen definition
  theme: SDUITheme;
  componentVersions: Record<ComponentType, string>;
  platforms: Platform[];
  status: 'draft' | 'published' | 'archived';
}

// --- Theme (brand customization layer) ---

export interface SDUITheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono?: string;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  darkMode?: boolean;
}

// --- API Response Envelope ---

export interface SDUIResponse {
  screen: SDUIScreen;
  user?: {
    id: string;
    enrolledCourseIds: string[];
    completedLessonIds: string[];
    xp: number;
    streakDays: number;
  };
  experiment?: {
    id: string;
    variant: string;
  };
}

// --- Component Registry Metadata ---

export interface ComponentRegistryEntry {
  type: ComponentType;
  category: 'layout' | 'content' | 'interactive' | 'gamification' | 'media';
  platforms: Platform[];
  inputs: ComponentInput[];
  defaultProps: Record<string, unknown>;
}

export interface ComponentInput {
  name: string;
  type: 'string' | 'text' | 'number' | 'boolean' | 'color'
      | 'image' | 'video' | 'url' | 'select' | 'richtext'
      | 'action' | 'array' | 'object';
  required?: boolean;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];  // For 'select' type
  description?: string;
}
```

### Step 4: Create shared component registry package

```bash
mkdir -p packages/component-registry/src
```

`packages/component-registry/package.json`:

```json
{
  "name": "@platform/component-registry",
  "version": "1.0.0",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "dependencies": {
    "@platform/sdui-schema": "workspace:*"
  },
  "scripts": {
    "build": "tsc",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.x"
  }
}
```

`packages/component-registry/src/index.ts`:

```typescript
import type { ComponentRegistryEntry, ComponentType } from '@platform/sdui-schema';

// ============================================================
// COMPONENT REGISTRY
// ============================================================
// Defines the metadata for every SDUI component.
// This is the "menu" of what creators can drag into templates,
// and what consumer apps know how to render.
//
// RULE: Every component listed here MUST have:
//   1. A web implementation (react-native-web) in consumer-web
//   2. A native implementation (React Native) in consumer-mobile
//   3. A builder implementation (React) in creator-dashboard
// ============================================================

export const COMPONENT_REGISTRY: Record<ComponentType, ComponentRegistryEntry> = {
  HeroSection: {
    type: 'HeroSection',
    category: 'layout',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'title', type: 'string', required: true, description: 'Main headline' },
      { name: 'subtitle', type: 'text', description: 'Supporting text below title' },
      { name: 'backgroundImage', type: 'image', description: 'Full-width background image' },
      { name: 'backgroundVideo', type: 'video', description: 'Auto-playing background video (muted)' },
      { name: 'ctaText', type: 'string', defaultValue: 'Get Started' },
      { name: 'ctaAction', type: 'action' },
      { name: 'overlayGradient', type: 'boolean', defaultValue: true },
      { name: 'alignment', type: 'select', defaultValue: 'center', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ]},
    ],
    defaultProps: {
      title: 'Your Course Title',
      subtitle: 'A compelling description of what students will learn',
      ctaText: 'Enroll Now',
      overlayGradient: true,
      alignment: 'center',
    },
  },

  VideoPlayer: {
    type: 'VideoPlayer',
    category: 'media',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'videoUrl', type: 'video', required: true },
      { name: 'posterImage', type: 'image' },
      { name: 'autoPlay', type: 'boolean', defaultValue: false },
      { name: 'showControls', type: 'boolean', defaultValue: true },
      { name: 'aspectRatio', type: 'select', defaultValue: '16:9', options: [
        { label: '16:9', value: '16:9' },
        { label: '4:3', value: '4:3' },
        { label: '1:1', value: '1:1' },
      ]},
    ],
    defaultProps: { autoPlay: false, showControls: true, aspectRatio: '16:9' },
  },

  LessonCard: {
    type: 'LessonCard',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'title', type: 'string', required: true },
      { name: 'duration', type: 'string' },
      { name: 'thumbnail', type: 'image' },
      { name: 'icon', type: 'select', defaultValue: 'video', options: [
        { label: 'Video', value: 'video' },
        { label: 'Text', value: 'text' },
        { label: 'Quiz', value: 'quiz' },
        { label: 'Assignment', value: 'assignment' },
      ]},
      { name: 'isLocked', type: 'boolean', defaultValue: false },
      { name: 'isCompleted', type: 'boolean', defaultValue: false },
      { name: 'onPress', type: 'action' },
    ],
    defaultProps: { icon: 'video', isLocked: false, isCompleted: false },
  },

  CourseGrid: {
    type: 'CourseGrid',
    category: 'layout',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'columns', type: 'number', defaultValue: 2 },
      { name: 'gap', type: 'number', defaultValue: 16 },
      { name: 'cardStyle', type: 'select', defaultValue: 'poster', options: [
        { label: 'Poster (2:3)', value: 'poster' },
        { label: 'Landscape (16:9)', value: 'landscape' },
        { label: 'Square (1:1)', value: 'square' },
      ]},
    ],
    defaultProps: { columns: 2, gap: 16, cardStyle: 'poster' },
  },

  ContentRow: {
    type: 'ContentRow',
    category: 'layout',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'title', type: 'string', required: true },
      { name: 'subtitle', type: 'string' },
      { name: 'showSeeAll', type: 'boolean', defaultValue: true },
      { name: 'seeAllAction', type: 'action' },
      { name: 'cardStyle', type: 'select', defaultValue: 'landscape', options: [
        { label: 'Poster (2:3)', value: 'poster' },
        { label: 'Landscape (16:9)', value: 'landscape' },
        { label: 'Square (1:1)', value: 'square' },
      ]},
      { name: 'scrollDirection', type: 'select', defaultValue: 'horizontal', options: [
        { label: 'Horizontal', value: 'horizontal' },
        { label: 'Vertical', value: 'vertical' },
      ]},
    ],
    defaultProps: { showSeeAll: true, cardStyle: 'landscape', scrollDirection: 'horizontal' },
  },

  PricingTable: {
    type: 'PricingTable',
    category: 'interactive',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'plans', type: 'array', required: true },
      { name: 'highlightedPlan', type: 'string' },
      { name: 'showToggle', type: 'boolean', defaultValue: true, description: 'Monthly/Annual toggle' },
    ],
    defaultProps: { showToggle: true },
  },

  InstructorBio: {
    type: 'InstructorBio',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'name', type: 'string', required: true },
      { name: 'avatar', type: 'image' },
      { name: 'bio', type: 'richtext' },
      { name: 'credentials', type: 'array' },
      { name: 'socialLinks', type: 'array' },
    ],
    defaultProps: {},
  },

  CurriculumAccordion: {
    type: 'CurriculumAccordion',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'modules', type: 'array', required: true },
      { name: 'showDuration', type: 'boolean', defaultValue: true },
      { name: 'showLessonCount', type: 'boolean', defaultValue: true },
      { name: 'expandFirst', type: 'boolean', defaultValue: true },
    ],
    defaultProps: { showDuration: true, showLessonCount: true, expandFirst: true },
  },

  ProgressBar: {
    type: 'ProgressBar',
    category: 'gamification',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'value', type: 'number', required: true, description: '0-100' },
      { name: 'label', type: 'string' },
      { name: 'showPercentage', type: 'boolean', defaultValue: true },
      { name: 'animated', type: 'boolean', defaultValue: true },
    ],
    defaultProps: { showPercentage: true, animated: true },
  },

  StreakCounter: {
    type: 'StreakCounter',
    category: 'gamification',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'currentStreak', type: 'number', required: true },
      { name: 'bestStreak', type: 'number' },
      { name: 'showFlame', type: 'boolean', defaultValue: true },
    ],
    defaultProps: { showFlame: true },
  },

  CommunityFeed: {
    type: 'CommunityFeed',
    category: 'interactive',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'feedType', type: 'select', defaultValue: 'recent', options: [
        { label: 'Recent', value: 'recent' },
        { label: 'Popular', value: 'popular' },
        { label: 'Following', value: 'following' },
      ]},
      { name: 'showComposer', type: 'boolean', defaultValue: true },
      { name: 'maxItems', type: 'number', defaultValue: 20 },
    ],
    defaultProps: { feedType: 'recent', showComposer: true, maxItems: 20 },
  },

  LiveEventBanner: {
    type: 'LiveEventBanner',
    category: 'media',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'title', type: 'string', required: true },
      { name: 'scheduledAt', type: 'string', required: true, description: 'ISO 8601 datetime' },
      { name: 'thumbnail', type: 'image' },
      { name: 'showCountdown', type: 'boolean', defaultValue: true },
      { name: 'onPress', type: 'action' },
    ],
    defaultProps: { showCountdown: true },
  },

  TestimonialCarousel: {
    type: 'TestimonialCarousel',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'testimonials', type: 'array', required: true },
      { name: 'autoPlay', type: 'boolean', defaultValue: true },
      { name: 'interval', type: 'number', defaultValue: 5000, description: 'ms between slides' },
    ],
    defaultProps: { autoPlay: true, interval: 5000 },
  },

  CTAButton: {
    type: 'CTAButton',
    category: 'interactive',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'label', type: 'string', required: true },
      { name: 'variant', type: 'select', defaultValue: 'filled', options: [
        { label: 'Filled', value: 'filled' },
        { label: 'Outlined', value: 'outlined' },
        { label: 'Ghost', value: 'ghost' },
      ]},
      { name: 'size', type: 'select', defaultValue: 'md', options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]},
      { name: 'fullWidth', type: 'boolean', defaultValue: false },
      { name: 'onPress', type: 'action', required: true },
    ],
    defaultProps: { variant: 'filled', size: 'md', fullWidth: false },
  },

  TextBlock: {
    type: 'TextBlock',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'content', type: 'richtext', required: true },
      { name: 'maxLines', type: 'number', description: 'Truncate after N lines' },
    ],
    defaultProps: {},
  },

  ImageBlock: {
    type: 'ImageBlock',
    category: 'content',
    platforms: ['ios', 'android', 'tvos', 'web'],
    inputs: [
      { name: 'src', type: 'image', required: true },
      { name: 'alt', type: 'string', required: true },
      { name: 'aspectRatio', type: 'select', defaultValue: 'auto', options: [
        { label: 'Auto', value: 'auto' },
        { label: '16:9', value: '16:9' },
        { label: '4:3', value: '4:3' },
        { label: '1:1', value: '1:1' },
      ]},
      { name: 'borderRadius', type: 'number', defaultValue: 8 },
    ],
    defaultProps: { aspectRatio: 'auto', borderRadius: 8 },
  },

  QuizBlock: {
    type: 'QuizBlock',
    category: 'interactive',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'questions', type: 'array', required: true },
      { name: 'showScore', type: 'boolean', defaultValue: true },
      { name: 'allowRetry', type: 'boolean', defaultValue: true },
      { name: 'passingScore', type: 'number', defaultValue: 70, description: 'Percentage' },
    ],
    defaultProps: { showScore: true, allowRetry: true, passingScore: 70 },
  },

  CertificateDisplay: {
    type: 'CertificateDisplay',
    category: 'gamification',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'courseName', type: 'string', required: true },
      { name: 'studentName', type: 'string', required: true },
      { name: 'completedDate', type: 'string' },
      { name: 'downloadable', type: 'boolean', defaultValue: true },
    ],
    defaultProps: { downloadable: true },
  },

  BadgeShowcase: {
    type: 'BadgeShowcase',
    category: 'gamification',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'badges', type: 'array', required: true },
      { name: 'layout', type: 'select', defaultValue: 'grid', options: [
        { label: 'Grid', value: 'grid' },
        { label: 'Row', value: 'row' },
      ]},
      { name: 'showLocked', type: 'boolean', defaultValue: true },
    ],
    defaultProps: { layout: 'grid', showLocked: true },
  },

  LeaderboardWidget: {
    type: 'LeaderboardWidget',
    category: 'gamification',
    platforms: ['ios', 'android', 'web'],
    inputs: [
      { name: 'maxEntries', type: 'number', defaultValue: 10 },
      { name: 'showCurrentUser', type: 'boolean', defaultValue: true },
      { name: 'timeframe', type: 'select', defaultValue: 'weekly', options: [
        { label: 'Daily', value: 'daily' },
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'All Time', value: 'alltime' },
      ]},
    ],
    defaultProps: { maxEntries: 10, showCurrentUser: true, timeframe: 'weekly' },
  },
};

// Helper: get components available for a specific platform
export function getComponentsForPlatform(platform: import('@platform/sdui-schema').Platform) {
  return Object.values(COMPONENT_REGISTRY).filter(c => c.platforms.includes(platform));
}

// Helper: get components by category
export function getComponentsByCategory(category: ComponentRegistryEntry['category']) {
  return Object.values(COMPONENT_REGISTRY).filter(c => c.category === category);
}
```

### Step 5: Create consumer-web app

```bash
mkdir -p apps/consumer-web
```

This is a lightweight app (Vite + React + react-native-web) that:

1. Receives a request at a creator's custom domain
2. Resolves the creator via Cloudflare Workers
3. Fetches the SDUI template JSON from the API
4. Renders it using the recursive SDUI renderer with react-native-web

`apps/consumer-web/package.json`:

```json
{
  "name": "@platform/consumer-web",
  "version": "1.0.0",
  "dependencies": {
    "react": "^19.x",
    "react-dom": "^19.x",
    "react-native-web": "^0.19.x",
    "@platform/sdui-schema": "workspace:*",
    "@platform/component-registry": "workspace:*"
  }
}
```

Core recursive renderer (`apps/consumer-web/src/SDUIRenderer.tsx`):

```tsx
import type { SDUISection } from '@platform/sdui-schema';
import { WEB_COMPONENTS } from './components';

interface Props {
  section: SDUISection;
}

export function SDUIRenderer({ section }: Props) {
  const Component = WEB_COMPONENTS[section.componentType];

  // Unknown component → graceful fallback (ignore-unknown pattern)
  if (!Component) {
    if (__DEV__) console.warn(`Unknown component: ${section.componentType}`);
    return null;
  }

  return (
    <Component {...section.props} actions={section.actions}>
      {section.children?.map((child) => (
        <SDUIRenderer key={child.id} section={child} />
      ))}
    </Component>
  );
}
```

### Step 6: Create consumer-mobile app

```bash
npx create-expo-app apps/consumer-mobile --template blank-typescript
```

Then install react-native-tvos fork:

```bash
cd apps/consumer-mobile
npx expo install react-native@npm:react-native-tvos
```

This app's `package.json` should include:

```json
{
  "name": "@platform/consumer-mobile",
  "dependencies": {
    "@platform/sdui-schema": "workspace:*",
    "@platform/component-registry": "workspace:*"
  }
}
```

The native SDUI renderer follows the same recursive pattern as the web renderer, but uses React Native components instead of react-native-web.

---

## How the Three Apps Talk to Each Other

### API Layer (lives in creator-dashboard)

The TanStack Start app exposes server functions that both consumer apps call:

```
GET  /api/sdui/screen/:screenId       → Returns SDUIResponse for a screen
GET  /api/sdui/template/:creatorId    → Returns full template for a creator
GET  /api/content/courses/:courseId    → Returns course content data
POST /api/content/progress             → Updates student progress
POST /api/analytics/event              → Tracks engagement events
```

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    TURSO DATABASE                         │
│                                                           │
│  templates          → SDUI JSON definitions               │
│  template_instances → Creator customizations               │
│  courses            → Content data                         │
│  lessons            → Lesson content blocks                │
│  student_progress   → Completions, XP, streaks            │
│  deployments        → Build status per platform            │
│  analytics_events   → Raw engagement events                │
│                                                           │
└──────────────┬───────────────────────────┬───────────────┘
               │                           │
     TanStack Start                TanStack Start
     Server Functions              Server Functions
               │                           │
    ┌──────────┴──────────┐     ┌──────────┴──────────┐
    │  creator-dashboard  │     │  SDUI API Layer      │
    │  (visual builder,   │     │  (serves to consumer │
    │   CMS, analytics)   │     │   apps via REST)     │
    └─────────────────────┘     └──────────┬───────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          │                │                │
                   consumer-web    consumer-mobile   consumer-mobile
                   (react-native   (iOS/Android)    (tvOS/Android TV)
                    -web)
```

### Shared Types Guarantee Consistency

Because all three apps import from `@platform/sdui-schema`, any schema change in one place propagates everywhere. TypeScript catches mismatches at compile time:

```typescript
// In creator-dashboard (saving a template):
import type { SDUITemplate } from '@platform/sdui-schema';
const template: SDUITemplate = { ... }; // TypeScript validates

// In consumer-web (rendering a screen):
import type { SDUIScreen } from '@platform/sdui-schema';
const screen: SDUIScreen = await fetchScreen(screenId); // Same types

// In consumer-mobile (rendering a screen):
import type { SDUISection } from '@platform/sdui-schema';
function renderSection(section: SDUISection) { ... } // Same types
```

---

## Critical Rules for Claude Code Agents

### DO:
- Add new features as routes within `/apps/creator-dashboard`
- Import all SDUI types from `@platform/sdui-schema` — never duplicate
- Add new component types to BOTH the schema enum AND the component registry
- Implement every new component in all three apps (builder, web, mobile)
- Use Turso/Drizzle for all data storage — the existing connection is already configured
- Use BullMQ for async jobs (builds, video transcoding, email sends)
- Store binary assets (images, videos, builds) in Cloudflare R2
- Use Better Auth session checks in all API routes

### DON'T:
- Create a separate API server — TanStack Start server functions ARE the API
- Store SDUI JSON in R2 — it goes in Turso (it's structured data, not a file)
- Build separate design systems for web and mobile — use the shared component registry
- Hardcode component types as strings — always use the `ComponentType` union type
- Skip the fallback pattern in renderers — unknown components must render `null`, not crash
- Use Expo EAS for layout/theme changes — those flow through the SDUI API layer, not OTA updates

---

## File Tree After Setup

```
platform/
├── turbo.json
├── package.json                      (workspaces: apps/*, packages/*)
├── apps/
│   ├── creator-dashboard/            ← EXISTING TanStack Start app
│   │   ├── app/
│   │   │   ├── routes/
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── builder.tsx        ← Visual template builder
│   │   │   │   │   ├── templates.tsx      ← Template marketplace
│   │   │   │   │   ├── deployments.tsx    ← Build status dashboard
│   │   │   │   │   ├── analytics.tsx      ← Engagement analytics
│   │   │   │   │   ├── email.tsx          ← Email marketing
│   │   │   │   │   └── settings.tsx       ← Branding, domains
│   │   │   │   ├── api/
│   │   │   │   │   ├── sdui/              ← SDUI API endpoints
│   │   │   │   │   ├── content/           ← Content API
│   │   │   │   │   └── analytics/         ← Analytics ingestion
│   │   │   │   └── ...existing routes
│   │   │   └── ...existing app files
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── consumer-web/                 ← NEW: react-native-web consumer
│   │   ├── src/
│   │   │   ├── SDUIRenderer.tsx           ← Recursive renderer
│   │   │   ├── components/                ← Web implementations of all SDUI components
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── VideoPlayer.tsx
│   │   │   │   ├── LessonCard.tsx
│   │   │   │   └── ...one file per ComponentType
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── consumer-mobile/              ← NEW: React Native + react-native-tvos
│       ├── src/
│       │   ├── SDUIRenderer.tsx           ← Recursive renderer (native)
│       │   ├── components/                ← Native implementations
│       │   │   ├── HeroSection.tsx
│       │   │   ├── VideoPlayer.tsx
│       │   │   ├── LessonCard.tsx
│       │   │   └── ...one file per ComponentType
│       │   ├── navigation/
│       │   ├── hooks/
│       │   └── utils/
│       ├── app.config.js                  ← Dynamic Expo config for white-labeling
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── sdui-schema/                  ← Shared SDUI type definitions
│   │   ├── src/
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── component-registry/           ← Shared component metadata
│       ├── src/
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
└── .github/
    └── workflows/
        ├── ci.yml                         ← Typecheck + lint all packages
        └── deploy.yml                     ← Deploy creator-dashboard + consumer-web
```

---

## Implementation Order for Claude Code Agents

### Sprint 1 (Weeks 1-2): Foundation
1. Convert existing repo to Turborepo monorepo structure
2. Create `@platform/sdui-schema` package with all types
3. Create `@platform/component-registry` package with full registry
4. Add SDUI API routes to creator-dashboard (`/api/sdui/*`)
5. Verify existing auth, database, and R2 still work after restructure

### Sprint 2 (Weeks 3-4): Consumer Web
1. Scaffold `consumer-web` with Vite + React + react-native-web
2. Implement recursive SDUI renderer
3. Build first 5 components: HeroSection, VideoPlayer, LessonCard, CTAButton, TextBlock
4. Wire up to SDUI API — fetch and render a test template
5. Add Cloudflare Workers domain routing for multi-tenant

### Sprint 3 (Weeks 5-6): Visual Builder MVP
1. Install Craft.js in creator-dashboard
2. Build component palette with drag-and-drop from registry
3. Build property panel that reads `inputs` from registry
4. Implement iframe preview with react-native-web renderer
5. Save/load template JSON to Turso

### Sprint 4 (Weeks 7-8): Consumer Mobile
1. Scaffold consumer-mobile with Expo + react-native-tvos
2. Implement native SDUI renderer (same recursive pattern)
3. Port first 5 components to React Native
4. Wire up to SDUI API
5. Test on iOS simulator and Android emulator

### Sprint 5 (Weeks 9-10): Template System
1. Build template marketplace UI in creator-dashboard
2. Implement template versioning with customization layers
3. Build device frame preview (iPhone/Android/TV mockups)
4. Add theme customization panel (colors, fonts, logo)
5. Free template library (8 starter templates)

### Sprint 6 (Weeks 11-12): Deployment Pipeline
1. BullMQ job queue for builds
2. Codemagic API integration for native builds
3. Deployment status dashboard with WebSocket progress
4. Preview URL generation
5. App Store Connect + Google Play submission automation
