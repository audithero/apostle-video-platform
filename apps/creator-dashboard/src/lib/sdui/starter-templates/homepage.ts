import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Horizon Academy — Multi-course learning platform homepage
 *
 * Design language: Modern, confident, aspirational. Clean lines with bold
 * typography and purposeful whitespace. Inspired by Coursera, Maven, Buildspace.
 *
 * Typography: Sans display (Inter) + geometric accent (Space Grotesk)
 * Palette: Deep indigo (#1a1a2e), electric blue (#0066FF), soft gray (#f0f0f5),
 *          white (#FFFFFF), slate text (#334155), muted (#94a3b8).
 */
export const homepageTemplate: SDUIScreen = {
  id: "tpl-homepage",
  name: "Homepage",
  slug: "homepage",
  description:
    "Horizon Academy multi-course platform with hero, featured courses, community feed, and leaderboard",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Aspirational Entry Point                                  */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Your Journey to Mastery Starts Here",
        subtitle:
          "Horizon Academy brings together world-class instructors, hands-on projects, and a community of 12,000+ learners. Find the course that changes everything.",
        backgroundImage: "",
        ctaText: "Browse Courses",
        ctaAction: { type: "navigate", payload: { url: "/courses" } },
        alignment: "center",
        overlayOpacity: 0.5,
      },
      style: {
        minHeight: "80vh",
        fontFamily: '"Space Grotesk", sans-serif',
        backgroundColor: "#1a1a2e",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Featured Courses Heading                                         */
    /* ---------------------------------------------------------------- */
    {
      id: "courses-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Space Grotesk, sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a2e;">Featured Courses</h2><p style="font-size: 1.1rem; color: #94a3b8; line-height: 1.6;">Curated by our team from the most popular and highest-rated courses across 12,000+ enrolled students.</p>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "4rem 1.5rem 1.5rem",
        backgroundColor: "#f0f0f5",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Course Grid                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "course-grid",
      type: "CourseGrid",
      props: {
        columns: 3,
        gap: "1.5rem",
        showPrice: true,
        showEnrollCount: true,
      },
      style: {
        padding: "0 1.5rem 4rem",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#f0f0f5",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Community Section                                                */
    /* ---------------------------------------------------------------- */
    {
      id: "community-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Space Grotesk, sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #FFFFFF;">What Our Community Is Saying</h2><p style="font-size: 1.1rem; color: #94a3b8; line-height: 1.6;">Real conversations from students sharing wins, asking questions, and helping each other level up.</p>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "4rem 1.5rem 1.5rem",
        backgroundColor: "#1a1a2e",
      },
    },
    {
      id: "community",
      type: "CommunityFeed",
      props: {
        maxPosts: 5,
        showReactions: true,
        showComments: true,
        channelId: "",
      },
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#1a1a2e",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Leaderboard                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "leaderboard-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Space Grotesk, sans-serif; font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a2e;">Top Learners This Month</h2><p style="font-size: 1.05rem; color: #94a3b8; line-height: 1.6;">Consistency wins. These students have earned the most points through course completions, community contributions, and streak bonuses.</p>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "4rem 1.5rem 1.5rem",
        backgroundColor: "#f0f0f5",
      },
    },
    {
      id: "leaderboard",
      type: "LeaderboardWidget",
      props: {
        maxEntries: 10,
        timeframe: "monthly",
        showPoints: true,
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#f0f0f5",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Bottom CTA                                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "cta-bottom",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 560px; margin: 0 auto;"><h2 style="font-family: Space Grotesk, sans-serif; font-size: 1.75rem; color: #FFFFFF; margin-bottom: 0.75rem;">Ready to Start Learning?</h2><p style="color: #94a3b8; line-height: 1.7; margin-bottom: 2rem;">Join 12,000+ students already building new skills on Horizon Academy. Your first lesson is just a click away.</p></div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: {
        padding: "4rem 1.5rem 1rem",
        backgroundColor: "#1a1a2e",
      },
    },
    {
      id: "cta-button",
      type: "CTAButton",
      props: {
        text: "Explore All Courses",
        action: { type: "navigate", payload: { url: "/courses" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "0 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#1a1a2e",
      },
    },
  ],
};
