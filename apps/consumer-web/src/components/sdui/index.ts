import type { ComponentType } from "react";

import HeroSection from "./HeroSection";
import TextBlock from "./TextBlock";
import ImageBlock from "./ImageBlock";
import CTAButton from "./CTAButton";
import CourseGrid from "./CourseGrid";
import LessonCard from "./LessonCard";
import ContentRow from "./ContentRow";
import VideoPlayer from "./VideoPlayer";
import CurriculumAccordion from "./CurriculumAccordion";
import PricingTable from "./PricingTable";
import InstructorBio from "./InstructorBio";
import TestimonialCarousel from "./TestimonialCarousel";
import ProgressBar from "./ProgressBar";
import StreakCounter from "./StreakCounter";
import CommunityFeed from "./CommunityFeed";
import LiveEventBanner from "./LiveEventBanner";
import QuizBlock from "./QuizBlock";
import CertificateDisplay from "./CertificateDisplay";
import BadgeShowcase from "./BadgeShowcase";
import LeaderboardWidget from "./LeaderboardWidget";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SDUIComponentType = ComponentType<Record<string, unknown> & { children?: React.ReactNode }>;

export const componentMap: Record<string, SDUIComponentType> = {
  HeroSection: HeroSection as SDUIComponentType,
  TextBlock: TextBlock as SDUIComponentType,
  ImageBlock: ImageBlock as SDUIComponentType,
  CTAButton: CTAButton as SDUIComponentType,
  CourseGrid: CourseGrid as SDUIComponentType,
  LessonCard: LessonCard as SDUIComponentType,
  ContentRow: ContentRow as SDUIComponentType,
  VideoPlayer: VideoPlayer as SDUIComponentType,
  CurriculumAccordion: CurriculumAccordion as SDUIComponentType,
  PricingTable: PricingTable as SDUIComponentType,
  InstructorBio: InstructorBio as SDUIComponentType,
  TestimonialCarousel: TestimonialCarousel as SDUIComponentType,
  ProgressBar: ProgressBar as SDUIComponentType,
  StreakCounter: StreakCounter as SDUIComponentType,
  CommunityFeed: CommunityFeed as SDUIComponentType,
  LiveEventBanner: LiveEventBanner as SDUIComponentType,
  QuizBlock: QuizBlock as SDUIComponentType,
  CertificateDisplay: CertificateDisplay as SDUIComponentType,
  BadgeShowcase: BadgeShowcase as SDUIComponentType,
  LeaderboardWidget: LeaderboardWidget as SDUIComponentType,
};
