import type { SDUIScreen } from "@platform/sdui-schema";

export const liveEventTemplate: SDUIScreen = {
  id: "tpl-live-event",
  name: "Live Event",
  slug: "live-event",
  description: "Live event banner, video player, community feed",
  sections: [
    {
      id: "banner",
      type: "LiveEventBanner",
      props: {
        title: "Live Workshop: Topic Title",
        startTime: "",
        hostName: "Host Name",
        hostAvatar: "",
        joinUrl: "",
      },
      style: { padding: "0 0 1rem" },
    },
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
      style: { maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 2rem" },
    },
    {
      id: "event-description",
      type: "TextBlock",
      props: {
        content:
          "<h2>About This Event</h2><p>Describe what participants will learn in this live session. Include agenda items, prerequisites, and any materials they should have ready.</p>",
        alignment: "left",
        maxWidth: "800px",
      },
      style: { padding: "0 1.5rem 2rem", maxWidth: "960px", margin: "0 auto" },
    },
    {
      id: "chat-heading",
      type: "TextBlock",
      props: {
        content: "<h3>Live Chat</h3>",
        alignment: "left",
        maxWidth: "800px",
      },
      style: { padding: "1rem 1.5rem 0.5rem", maxWidth: "960px", margin: "0 auto" },
    },
    {
      id: "live-chat",
      type: "CommunityFeed",
      props: {
        maxPosts: 20,
        showReactions: true,
        showComments: false,
        channelId: "",
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
  ],
};
