import type { SDUIScreen } from "@platform/sdui-schema";

export const communityHubTemplate: SDUIScreen = {
  id: "tpl-community-hub",
  name: "Community Hub",
  slug: "community-hub",
  description: "Community feed, leaderboard, badge showcase",
  sections: [
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Community",
        subtitle: "Connect, share, and grow with fellow learners.",
        backgroundImage: "",
        ctaText: "New Post",
        ctaAction: { type: "showModal", payload: { modalId: "new-post" } },
        alignment: "center",
        overlayOpacity: 0.3,
      },
      style: { padding: "2rem 1.5rem" },
    },
    {
      id: "feed",
      type: "CommunityFeed",
      props: {
        maxPosts: 15,
        showReactions: true,
        showComments: true,
        channelId: "",
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "2rem 1.5rem" },
    },
    {
      id: "sidebar-heading",
      type: "TextBlock",
      props: {
        content: "<h3>Leaderboard</h3>",
        alignment: "center",
        maxWidth: "600px",
      },
      style: { padding: "2rem 1.5rem 0.5rem" },
    },
    {
      id: "leaderboard",
      type: "LeaderboardWidget",
      props: {
        maxEntries: 10,
        timeframe: "weekly",
        showPoints: true,
      },
      style: { maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem 2rem" },
    },
    {
      id: "badges-heading",
      type: "TextBlock",
      props: {
        content: "<h3>Badges & Achievements</h3><p>Earn badges by participating in the community and completing courses.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "2rem 1.5rem 0.5rem" },
    },
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          { name: "First Post", icon: "MessageCircle", description: "Made your first community post", earned: false },
          { name: "Helpful", icon: "ThumbsUp", description: "Received 10 reactions on your posts", earned: false },
          { name: "Streak Master", icon: "Flame", description: "Maintained a 7-day learning streak", earned: false },
          { name: "Course Complete", icon: "GraduationCap", description: "Completed your first course", earned: false },
          { name: "Top Learner", icon: "Trophy", description: "Reached the top 10 on the leaderboard", earned: false },
          { name: "Mentor", icon: "Users", description: "Helped 5 other students with answers", earned: false },
        ],
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
  ],
};
