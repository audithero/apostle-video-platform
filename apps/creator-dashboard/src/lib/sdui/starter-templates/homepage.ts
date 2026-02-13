import type { SDUIScreen } from "@platform/sdui-schema";

export const homepageTemplate: SDUIScreen = {
  id: "tpl-homepage",
  name: "Homepage",
  slug: "homepage",
  description: "Hero, course grid, community feed, leaderboard",
  sections: [
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Welcome to Your Learning Platform",
        subtitle:
          "Explore courses, connect with the community, and track your progress — all in one place.",
        backgroundImage: "",
        ctaText: "Browse Courses",
        ctaAction: { type: "navigate", payload: { url: "/courses" } },
        alignment: "center",
        overlayOpacity: 0.4,
      },
    },
    {
      id: "courses-heading",
      type: "TextBlock",
      props: {
        content: "<h2>Featured Courses</h2><p>Start your journey with our most popular courses.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "3rem 1.5rem 1rem" },
    },
    {
      id: "course-grid",
      type: "CourseGrid",
      props: {
        columns: 3,
        gap: "1.5rem",
        showPrice: true,
        showEnrollCount: true,
      },
      style: { padding: "0 1.5rem 3rem", maxWidth: "1200px", margin: "0 auto" },
    },
    {
      id: "community-heading",
      type: "TextBlock",
      props: {
        content: "<h2>Community</h2><p>See what students are sharing and discussing.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "2rem 1.5rem 1rem" },
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
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
    {
      id: "leaderboard-heading",
      type: "TextBlock",
      props: {
        content: "<h2>Top Learners This Week</h2>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "2rem 1.5rem 1rem" },
    },
    {
      id: "leaderboard",
      type: "LeaderboardWidget",
      props: {
        maxEntries: 10,
        timeframe: "weekly",
        showPoints: true,
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
      },
    },
  ],
};
