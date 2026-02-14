import { type ComponentType } from "react";

import CulinaryPreview from "./culinary";
import FitnessPreview from "./fitness";
import CheckoutPreview from "./checkout";
import HomepagePreview from "./homepage";
import CourseLandingPreview from "./course-landing";
import WealthPreview from "./wealth";
import TradingPreview from "./trading";
import CreativePreview from "./creative";
import CommunityPreview from "./community";
import LessonPlayerPreview from "./lesson-player";
import StudentDashboardPreview from "./student-dashboard";
import LiveEventPreview from "./live-event";
import CertificatePreview from "./certificate";

/**
 * Maps starter template slugs to bespoke full-page preview components.
 * These replicate the superdesign HTML drafts in React with inline CSSProperties.
 * Falls back to generic section-by-section rendering for custom/unknown templates.
 */
export const BESPOKE_PREVIEWS: Record<string, ComponentType> = {
  "culinary-masterclass": CulinaryPreview,
  "fitness-performance": FitnessPreview,
  checkout: CheckoutPreview,
  homepage: HomepagePreview,
  "course-landing": CourseLandingPreview,
  "wealth-academy": WealthPreview,
  "trading-mastery": TradingPreview,
  "creative-studio": CreativePreview,
  "community-hub": CommunityPreview,
  "lesson-player": LessonPlayerPreview,
  "student-dashboard": StudentDashboardPreview,
  "live-event": LiveEventPreview,
  "certificate-gallery": CertificatePreview,
};
