import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Live Workshop — "Building Your First API" with Ryan Park
 *
 * Design language: Developer-focused dark mode with code-editor aesthetic.
 * Inspired by Twitch dev streams, VS Code Live Share, and Discord Stage.
 *
 * Typography: "JetBrains Mono" for code feel + "Inter" body text
 * Palette: Deep purple (#1E1033) base, electric violet (#8B5CF6),
 *          warm white (#F8F7FF) text, muted lavender (#A78BFA) secondary.
 */
export const liveEventTemplate: SDUIScreen = {
  id: "tpl-live-event",
  name: "Live Event",
  slug: "live-event",
  description:
    "Developer live workshop with video stream, detailed agenda, and real-time chat for Ryan Park's API building session",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Live Event Banner                                                */
    /* ---------------------------------------------------------------- */
    {
      id: "banner",
      type: "LiveEventBanner",
      props: {
        title: "Live Workshop: Building Your First API",
        startTime: "2025-03-15T14:00:00-05:00",
        hostName: "Ryan Park",
        hostAvatar: "",
        joinUrl: "",
      },
      style: {
        padding: "0 0 1rem",
        backgroundColor: "#1E1033",
        borderBottom: "2px solid rgba(139, 92, 246, 0.3)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Video Player                                                     */
    /* ---------------------------------------------------------------- */
    {
      id: "video",
      type: "VideoPlayer",
      props: {
        videoUrl: "",
        autoplay: false,
        controls: true,
        poster: "",
        aspectRatio: "16:9",
      },
      style: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "1.5rem 1.5rem 2rem",
        backgroundColor: "#1E1033",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Instructor Introduction                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "instructor-intro",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; gap: 1.25rem; align-items: flex-start; max-width: 800px;"><div style="flex-shrink: 0; width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #6D28D9); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; color: #F8F7FF; font-family: Inter, system-ui, sans-serif;">RP</div><div><h3 style="font-family: Inter, system-ui, sans-serif; font-size: 1.1rem; color: #F8F7FF; font-weight: 700; margin: 0;">Ryan Park</h3><p style="font-family: Inter, system-ui, sans-serif; color: #A78BFA; font-size: 0.9rem; margin: 0.25rem 0 0.75rem;">Senior Engineer, ex-Stripe &middot; 10 years building production APIs</p><p style="font-family: Inter, system-ui, sans-serif; color: #C4B5FD; font-size: 0.95rem; line-height: 1.7;">Ryan spent 4 years at Stripe building payment APIs that process millions of requests daily. He now teaches developers how to design, build, and deploy APIs that are clean, secure, and production-ready.</p></div></div>',
        alignment: "left",
        maxWidth: "800px",
      },
      style: {
        padding: "0 1.5rem 2.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "#1E1033",
        borderBottom: "1px solid rgba(139, 92, 246, 0.15)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Event Description & Agenda                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "event-description",
      type: "TextBlock",
      props: {
        content:
          '<div style="max-width: 800px;"><h2 style="font-family: JetBrains Mono, Fira Code, monospace; font-size: 1.5rem; color: #F8F7FF; font-weight: 700; margin-bottom: 1rem;">// Workshop Agenda</h2><p style="font-family: Inter, system-ui, sans-serif; color: #C4B5FD; line-height: 1.8; margin-bottom: 2rem;">In this 2-hour hands-on session, you\'ll go from zero to a deployed REST API. We\'ll write real code together — bring your laptop and follow along.</p><div style="display: flex; flex-direction: column; gap: 1rem;"><div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08); border-radius: 10px; border-left: 3px solid #8B5CF6;"><div style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; white-space: nowrap; min-width: 55px;">2:00</div><div><div style="font-family: Inter, system-ui, sans-serif; color: #F8F7FF; font-weight: 600; font-size: 0.95rem;">REST Fundamentals</div><div style="color: #A78BFA; font-size: 0.85rem; margin-top: 0.2rem;">HTTP methods, status codes, resource design, and API conventions</div></div></div><div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08); border-radius: 10px; border-left: 3px solid #8B5CF6;"><div style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; white-space: nowrap; min-width: 55px;">2:25</div><div><div style="font-family: Inter, system-ui, sans-serif; color: #F8F7FF; font-weight: 600; font-size: 0.95rem;">Express.js Setup</div><div style="color: #A78BFA; font-size: 0.85rem; margin-top: 0.2rem;">Project scaffolding, routing, middleware, and error handling patterns</div></div></div><div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08); border-radius: 10px; border-left: 3px solid #8B5CF6;"><div style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; white-space: nowrap; min-width: 55px;">2:55</div><div><div style="font-family: Inter, system-ui, sans-serif; color: #F8F7FF; font-weight: 600; font-size: 0.95rem;">Database Integration</div><div style="color: #A78BFA; font-size: 0.85rem; margin-top: 0.2rem;">Connecting PostgreSQL, writing queries, ORM basics with Drizzle</div></div></div><div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08); border-radius: 10px; border-left: 3px solid #8B5CF6;"><div style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; white-space: nowrap; min-width: 55px;">3:20</div><div><div style="font-family: Inter, system-ui, sans-serif; color: #F8F7FF; font-weight: 600; font-size: 0.95rem;">Authentication Basics</div><div style="color: #A78BFA; font-size: 0.85rem; margin-top: 0.2rem;">JWT tokens, protected routes, and session management</div></div></div><div style="display: flex; gap: 1rem; align-items: flex-start; padding: 1rem 1.25rem; background: rgba(139, 92, 246, 0.08); border-radius: 10px; border-left: 3px solid #8B5CF6;"><div style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; white-space: nowrap; min-width: 55px;">3:45</div><div><div style="font-family: Inter, system-ui, sans-serif; color: #F8F7FF; font-weight: 600; font-size: 0.95rem;">Deployment</div><div style="color: #A78BFA; font-size: 0.85rem; margin-top: 0.2rem;">Deploying to Railway, environment variables, and production checklist</div></div></div></div><div style="margin-top: 2rem; padding: 1.25rem; background: rgba(248, 247, 255, 0.05); border-radius: 10px; border: 1px solid rgba(139, 92, 246, 0.15);"><h4 style="font-family: JetBrains Mono, monospace; color: #8B5CF6; font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em;">Prerequisites</h4><ul style="font-family: Inter, system-ui, sans-serif; color: #C4B5FD; font-size: 0.9rem; line-height: 1.8; padding-left: 1.25rem; margin: 0;"><li>Basic JavaScript knowledge (variables, functions, async/await)</li><li>Node.js v18+ installed on your machine</li><li>A code editor (VS Code recommended)</li><li>A free Railway or Render account for deployment</li></ul></div></div>',
        alignment: "left",
        maxWidth: "800px",
      },
      style: {
        padding: "2.5rem 1.5rem 3rem",
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "#1E1033",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Live Chat Heading                                                */
    /* ---------------------------------------------------------------- */
    {
      id: "chat-heading",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; align-items: center; gap: 0.75rem;"><div style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);"></div><h3 style="font-family: JetBrains Mono, monospace; font-size: 1.15rem; color: #F8F7FF; font-weight: 600; margin: 0;">Workshop Chat &mdash; Ask Questions Live</h3></div>',
        alignment: "left",
        maxWidth: "800px",
      },
      style: {
        padding: "2rem 1.5rem 1rem",
        maxWidth: "960px",
        margin: "0 auto",
        backgroundColor: "#1E1033",
        borderTop: "1px solid rgba(139, 92, 246, 0.15)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Community Feed / Live Chat                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "live-chat",
      type: "CommunityFeed",
      props: {
        maxPosts: 20,
        showReactions: true,
        showComments: false,
        channelId: "",
      },
      style: {
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#1E1033",
      },
    },
  ],
};
