import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Photographers' Corner — Active photography community hub
 *
 * Design language: Warm, inviting, slightly editorial. Encourages participation
 * with visible activity and recognition. Inspired by Behance, 500px, Glass.
 *
 * Typography: Rounded sans (Nunito) + condensed accent (Barlow Condensed)
 * Palette: Warm charcoal (#2D2D2D), amber accent (#F59E0B), soft cream (#FEF9EF),
 *          warm gray (#A3A3A3), surface dark (#3A3A3A), gold highlight (#FBBF24).
 */
export const communityHubTemplate: SDUIScreen = {
  id: "tpl-community-hub",
  name: "Community Hub",
  slug: "community-hub",
  description:
    "Photographers' Corner — active community with feed, leaderboard, and badge showcase for photography students",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Warm Welcome                                              */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Photographers' Corner",
        subtitle:
          "Welcome to the community. Share your shots, get honest feedback, celebrate each other's wins, and grow together. Whether you just picked up a camera or you're refining your style — this is your space.",
        backgroundImage: "",
        ctaText: "Share Your Work",
        ctaAction: { type: "showModal", payload: { modalId: "new-post" } },
        alignment: "center",
        overlayOpacity: 0.45,
      },
      style: {
        minHeight: "50vh",
        fontFamily: '"Nunito", sans-serif',
        backgroundColor: "#2D2D2D",
        borderBottom: "3px solid #F59E0B",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Community Feed                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "feed-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Barlow Condensed, sans-serif; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: #FEF9EF; margin-bottom: 0.25rem;">Latest from the Community</h2><p style="color: #A3A3A3; font-size: 0.95rem;">Portfolio shares, questions, challenges, and conversations from fellow photographers.</p>',
        alignment: "left",
        maxWidth: "800px",
      },
      style: {
        padding: "3rem 1.5rem 1rem",
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "#2D2D2D",
      },
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
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
        backgroundColor: "#2D2D2D",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Leaderboard — Top Contributors                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "leaderboard-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Barlow Condensed, sans-serif; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: #2D2D2D; margin-bottom: 0.25rem;">Top Contributors This Week</h2><p style="color: #A3A3A3; font-size: 0.95rem;">Earned through posting, giving feedback, winning challenges, and helping others improve.</p>',
        alignment: "center",
        maxWidth: "600px",
      },
      style: {
        padding: "3rem 1.5rem 1rem",
        backgroundColor: "#FEF9EF",
      },
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
        backgroundColor: "#FEF9EF",
        borderBottom: "1px solid rgba(245, 158, 11, 0.2)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Badges & Achievements                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "badges-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Barlow Condensed, sans-serif; font-size: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em; color: #FEF9EF; margin-bottom: 0.25rem;">Badges & Achievements</h2><p style="color: #A3A3A3; font-size: 0.95rem;">Earn recognition for your contributions. Badges appear on your profile and community posts.</p>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "3rem 1.5rem 1rem",
        backgroundColor: "#2D2D2D",
      },
    },
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          {
            name: "First Shot",
            icon: "Camera",
            description: "Shared your first photo with the community",
            earned: true,
          },
          {
            name: "Gallery Feature",
            icon: "Image",
            description: "Had a photo featured in the weekly gallery spotlight",
            earned: true,
          },
          {
            name: "Critique Master",
            icon: "MessageCircle",
            description: "Gave thoughtful feedback on 25+ community posts",
            earned: true,
          },
          {
            name: "Weekly Challenge",
            icon: "Trophy",
            description: "Won a weekly photography challenge",
            earned: false,
          },
          {
            name: "Mentor",
            icon: "Users",
            description: "Helped 10 students improve their technique through 1-on-1 feedback",
            earned: false,
          },
          {
            name: "Portfolio Pro",
            icon: "Award",
            description: "Completed the final portfolio project with a score of 90% or higher",
            earned: false,
          },
        ],
      },
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#2D2D2D",
      },
    },
  ],
};
