import type { SDUIScreen } from "@platform/sdui-schema";
import { courseLandingTemplate } from "./course-landing";
import { homepageTemplate } from "./homepage";
import { lessonPlayerTemplate } from "./lesson-player";
import { communityHubTemplate } from "./community-hub";
import { checkoutTemplate } from "./checkout";
import { studentDashboardTemplate } from "./student-dashboard";
import { certificateGalleryTemplate } from "./certificate-gallery";
import { liveEventTemplate } from "./live-event";
import { culinaryMasterclassTemplate } from "./culinary-masterclass";
import { fitnessPerformanceTemplate } from "./fitness-performance";
import { wealthAcademyTemplate } from "./wealth-academy";
import { tradingMasteryTemplate } from "./trading-mastery";
import { creativeStudioTemplate } from "./creative-studio";

/** Visual layout type for mini-mockup in template cards */
export type MockupBlock =
  | { readonly type: "hero"; readonly height: number }
  | { readonly type: "nav" }
  | { readonly type: "grid"; readonly cols: number; readonly rows: number }
  | { readonly type: "sidebar-layout" }
  | { readonly type: "text-block"; readonly lines: number }
  | { readonly type: "cta" }
  | { readonly type: "cards"; readonly count: number }
  | { readonly type: "video" }
  | { readonly type: "pricing"; readonly tiers: number }
  | { readonly type: "stats"; readonly count: number }
  | { readonly type: "testimonials"; readonly count: number }
  | { readonly type: "badges"; readonly count: number }
  | { readonly type: "progress" }
  | { readonly type: "chat" }
  | { readonly type: "form" };

export interface TemplatePreview {
  readonly gradient: string;
  readonly heroTitle: string;
  readonly heroSubtitle: string;
  readonly sectionPreview: ReadonlyArray<string>;
  /** Miniature page mockup blocks for visual card thumbnail */
  readonly mockup: ReadonlyArray<MockupBlock>;
  /** Accent color for mockup highlights */
  readonly accentColor: string;
}

export interface StarterTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly icon: string;
  readonly screen: SDUIScreen;
  readonly preview: TemplatePreview;
}

export const STARTER_TEMPLATES: ReadonlyArray<StarterTemplate> = [
  {
    id: "course-landing",
    name: "Course Landing Page",
    description:
      "Photography masterclass with hero, curriculum, instructor bio, pricing, and testimonials",
    category: "landing",
    icon: "GraduationCap",
    screen: courseLandingTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #0D1B2A 0%, #1B3A5C 60%, #D4A853 100%)",
      heroTitle: "Master Digital Photography",
      heroSubtitle: "From camera basics to portfolio-ready shots",
      sectionPreview: ["Hero", "Curriculum", "Instructor", "Pricing", "Testimonials"],
      accentColor: "#D4A853",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 40 },
        { type: "stats", count: 3 },
        { type: "text-block", lines: 2 },
        { type: "cards", count: 3 },
        { type: "testimonials", count: 2 },
      ],
    },
  },
  {
    id: "homepage",
    name: "Homepage",
    description:
      "Multi-course academy homepage with featured courses, community, and leaderboard",
    category: "general",
    icon: "Home",
    screen: homepageTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0066FF 100%)",
      heroTitle: "Your Journey to Mastery Starts Here",
      heroSubtitle: "Explore courses, connect with the community",
      sectionPreview: ["Hero", "Course Grid", "Community", "Leaderboard"],
      accentColor: "#0066FF",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 36 },
        { type: "grid", cols: 3, rows: 2 },
        { type: "text-block", lines: 2 },
        { type: "stats", count: 4 },
      ],
    },
  },
  {
    id: "lesson-player",
    name: "Lesson Player",
    description:
      "Mid-lesson view with video player, progress tracking, and curriculum navigation",
    category: "learning",
    icon: "Play",
    screen: lessonPlayerTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1E293B 0%, #1E3A5F 50%, #3B82F6 100%)",
      heroTitle: "Understanding Light & Shadow",
      heroSubtitle: "Module 2 of 4 — 42% complete",
      sectionPreview: ["Progress", "Video", "Lesson Info", "Curriculum"],
      accentColor: "#3B82F6",
      mockup: [
        { type: "nav" },
        { type: "progress" },
        { type: "video" },
        { type: "sidebar-layout" },
        { type: "text-block", lines: 3 },
      ],
    },
  },
  {
    id: "community-hub",
    name: "Community Hub",
    description:
      "Active community with discussion feed, contributor leaderboard, and achievement badges",
    category: "community",
    icon: "Users",
    screen: communityHubTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #2D2D2D 0%, #3D3520 50%, #F59E0B 100%)",
      heroTitle: "Photographers' Corner",
      heroSubtitle: "Share your work, get inspired",
      sectionPreview: ["Hero", "Feed", "Leaderboard", "Badges"],
      accentColor: "#F59E0B",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 28 },
        { type: "sidebar-layout" },
        { type: "cards", count: 2 },
        { type: "badges", count: 6 },
      ],
    },
  },
  {
    id: "checkout",
    name: "Checkout Page",
    description:
      "Web dev bootcamp checkout with pricing tiers, testimonials, and money-back guarantee",
    category: "commerce",
    icon: "DollarSign",
    screen: checkoutTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #0F172A 0%, #0E2D3F 50%, #06B6D4 100%)",
      heroTitle: "Invest in Your Developer Career",
      heroSubtitle: "Join 8,500+ graduates building the web",
      sectionPreview: ["Heading", "Pricing", "Guarantee", "Testimonials"],
      accentColor: "#06B6D4",
      mockup: [
        { type: "nav" },
        { type: "text-block", lines: 2 },
        { type: "pricing", tiers: 3 },
        { type: "cta" },
        { type: "testimonials", count: 3 },
      ],
    },
  },
  {
    id: "student-dashboard",
    name: "Student Dashboard",
    description:
      "Active student view with streak tracking, progress bars, and enrolled courses",
    category: "dashboard",
    icon: "BarChart3",
    screen: studentDashboardTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #7C3AED 0%, #4C2889 50%, #10B981 100%)",
      heroTitle: "Welcome back, Alex!",
      heroSubtitle: "7-day streak — 65% overall progress",
      sectionPreview: ["Welcome", "Streak", "Progress", "Courses"],
      accentColor: "#10B981",
      mockup: [
        { type: "nav" },
        { type: "stats", count: 4 },
        { type: "progress" },
        { type: "cards", count: 3 },
        { type: "badges", count: 4 },
      ],
    },
  },
  {
    id: "certificate-gallery",
    name: "Certificate Gallery",
    description:
      "Achievement showcase with earned certificates, completion dates, and badge milestones",
    category: "general",
    icon: "Trophy",
    screen: certificateGalleryTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1B4332 0%, #2D5A3D 50%, #CD7F32 100%)",
      heroTitle: "Your Achievements",
      heroSubtitle: "3 certificates earned, 4 badges unlocked",
      sectionPreview: ["Heading", "Certificates", "Badges"],
      accentColor: "#CD7F32",
      mockup: [
        { type: "nav" },
        { type: "text-block", lines: 2 },
        { type: "grid", cols: 3, rows: 1 },
        { type: "badges", count: 6 },
        { type: "stats", count: 3 },
      ],
    },
  },
  {
    id: "live-event",
    name: "Live Event",
    description:
      "Live workshop page with event banner, video stream, and real-time chat",
    category: "general",
    icon: "Radio",
    screen: liveEventTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1E1033 0%, #2D1B69 50%, #8B5CF6 100%)",
      heroTitle: "Building Your First API",
      heroSubtitle: "Live workshop with Ryan Park",
      sectionPreview: ["Event Banner", "Video", "Description", "Live Chat"],
      accentColor: "#8B5CF6",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 32 },
        { type: "video" },
        { type: "chat" },
        { type: "text-block", lines: 2 },
      ],
    },
  },
  {
    id: "culinary-masterclass",
    name: "Culinary Masterclass",
    description:
      "Cinematic cooking course with recipe cards, chef profile, and step-by-step culinary instruction",
    category: "landing",
    icon: "ChefHat",
    screen: culinaryMasterclassTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1A1008 0%, #2D1A0A 50%, #C44D2A 100%)",
      heroTitle: "Master the Art of Italian Cooking",
      heroSubtitle: "From handmade pasta to authentic regional sauces",
      sectionPreview: ["Hero", "Overview", "Curriculum", "Chef Bio", "Testimonials", "Pricing"],
      accentColor: "#C44D2A",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 44 },
        { type: "stats", count: 3 },
        { type: "cards", count: 3 },
        { type: "testimonials", count: 2 },
        { type: "pricing", tiers: 2 },
      ],
    },
  },
  {
    id: "fitness-performance",
    name: "Fitness Performance",
    description:
      "High-energy fitness program with workout cards, streak tracking, progress rings, and motivational design",
    category: "landing",
    icon: "Dumbbell",
    screen: fitnessPerformanceTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #0A0A0A 0%, #0A1A0A 50%, #00FF87 100%)",
      heroTitle: "TRANSFORM YOUR BODY IN 8 WEEKS",
      heroSubtitle: "A progressive training program by elite coaches",
      sectionPreview: ["Hero", "Overview", "Streak", "Progress", "Curriculum", "Testimonials"],
      accentColor: "#00FF87",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 40 },
        { type: "stats", count: 4 },
        { type: "progress" },
        { type: "cards", count: 3 },
        { type: "cta" },
      ],
    },
  },
  {
    id: "wealth-academy",
    name: "Wealth Academy",
    description:
      "Professional finance course with portfolio insights, knowledge assessments, and trust-building design",
    category: "landing",
    icon: "Landmark",
    screen: wealthAcademyTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #0A1628 0%, #152238 50%, #C4A35A 100%)",
      heroTitle: "Build Wealth That Lasts",
      heroSubtitle: "From budgeting basics to advanced portfolio strategy",
      sectionPreview: ["Hero", "Overview", "Curriculum", "Instructor", "Testimonials", "Pricing"],
      accentColor: "#C4A35A",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 40 },
        { type: "text-block", lines: 2 },
        { type: "cards", count: 4 },
        { type: "testimonials", count: 3 },
        { type: "pricing", tiers: 3 },
      ],
    },
  },
  {
    id: "trading-mastery",
    name: "Trading Mastery",
    description:
      "Data-driven trading course with strategy cards, risk/reward diagrams, and terminal-inspired design",
    category: "landing",
    icon: "TrendingUp",
    screen: tradingMasteryTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #0D1117 0%, #0D2117 50%, #00C853 100%)",
      heroTitle: "Master Options Trading",
      heroSubtitle: "Systematic strategies used by professional traders",
      sectionPreview: ["Hero", "Overview", "Curriculum", "Instructor", "Testimonials", "Pricing"],
      accentColor: "#00C853",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 36 },
        { type: "stats", count: 4 },
        { type: "cards", count: 3 },
        { type: "text-block", lines: 2 },
        { type: "pricing", tiers: 3 },
      ],
    },
  },
  {
    id: "creative-studio",
    name: "Creative Studio",
    description:
      "Project-based creative course with student gallery, skill progression, and expressive design",
    category: "landing",
    icon: "Palette",
    screen: creativeStudioTemplate,
    preview: {
      gradient: "linear-gradient(135deg, #1A1A1A 0%, #2A1A3A 50%, #7B61FF 100%)",
      heroTitle: "Design With Purpose",
      heroSubtitle: "From blank canvas to portfolio-ready work",
      sectionPreview: ["Hero", "Overview", "Curriculum", "Instructor", "Gallery", "Pricing"],
      accentColor: "#7B61FF",
      mockup: [
        { type: "nav" },
        { type: "hero", height: 38 },
        { type: "text-block", lines: 2 },
        { type: "grid", cols: 3, rows: 2 },
        { type: "testimonials", count: 2 },
        { type: "cta" },
      ],
    },
  },
];

export {
  courseLandingTemplate,
  homepageTemplate,
  lessonPlayerTemplate,
  communityHubTemplate,
  checkoutTemplate,
  studentDashboardTemplate,
  certificateGalleryTemplate,
  liveEventTemplate,
  culinaryMasterclassTemplate,
  fitnessPerformanceTemplate,
  wealthAcademyTemplate,
  tradingMasteryTemplate,
  creativeStudioTemplate,
};
