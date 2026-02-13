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

export interface StarterTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly icon: string;
  readonly screen: SDUIScreen;
}

export const STARTER_TEMPLATES: ReadonlyArray<StarterTemplate> = [
  {
    id: "course-landing",
    name: "Course Landing Page",
    description: "Hero, curriculum, instructor bio, pricing, testimonials, CTA",
    category: "landing",
    icon: "GraduationCap",
    screen: courseLandingTemplate,
  },
  {
    id: "homepage",
    name: "Homepage",
    description: "Hero, course grid, community feed, leaderboard",
    category: "general",
    icon: "Home",
    screen: homepageTemplate,
  },
  {
    id: "lesson-player",
    name: "Lesson Player",
    description: "Video player, curriculum accordion, progress bar",
    category: "learning",
    icon: "Play",
    screen: lessonPlayerTemplate,
  },
  {
    id: "community-hub",
    name: "Community Hub",
    description: "Community feed, leaderboard, badge showcase",
    category: "community",
    icon: "Users",
    screen: communityHubTemplate,
  },
  {
    id: "checkout",
    name: "Checkout Page",
    description: "Pricing table, testimonials, guarantee badge, CTA",
    category: "commerce",
    icon: "DollarSign",
    screen: checkoutTemplate,
  },
  {
    id: "student-dashboard",
    name: "Student Dashboard",
    description: "Progress bars, streak counter, course grid",
    category: "dashboard",
    icon: "BarChart3",
    screen: studentDashboardTemplate,
  },
  {
    id: "certificate-gallery",
    name: "Certificate Gallery",
    description: "Certificate display, badge showcase",
    category: "general",
    icon: "Trophy",
    screen: certificateGalleryTemplate,
  },
  {
    id: "live-event",
    name: "Live Event",
    description: "Live event banner, video player, community feed",
    category: "general",
    icon: "Radio",
    screen: liveEventTemplate,
  },
  {
    id: "culinary-masterclass",
    name: "Culinary Masterclass",
    description:
      "Cinematic cooking course with recipe cards, chef profile, and step-by-step culinary instruction",
    category: "landing",
    icon: "ChefHat",
    screen: culinaryMasterclassTemplate,
  },
  {
    id: "fitness-performance",
    name: "Fitness Performance",
    description:
      "High-energy fitness program with workout cards, streak tracking, progress rings, and motivational design",
    category: "landing",
    icon: "Dumbbell",
    screen: fitnessPerformanceTemplate,
  },
  {
    id: "wealth-academy",
    name: "Wealth Academy",
    description:
      "Professional finance course with portfolio insights, knowledge assessments, and trust-building design",
    category: "landing",
    icon: "Landmark",
    screen: wealthAcademyTemplate,
  },
  {
    id: "trading-mastery",
    name: "Trading Mastery",
    description:
      "Data-driven trading course with strategy cards, risk/reward diagrams, and terminal-inspired design",
    category: "landing",
    icon: "TrendingUp",
    screen: tradingMasteryTemplate,
  },
  {
    id: "creative-studio",
    name: "Creative Studio",
    description:
      "Project-based creative course with student gallery, skill progression, and expressive design",
    category: "landing",
    icon: "Palette",
    screen: creativeStudioTemplate,
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
