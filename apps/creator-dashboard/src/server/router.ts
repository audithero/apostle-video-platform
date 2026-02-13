import { createTRPCRouter } from "@/lib/trpc/init";
import { videosRouter } from "./routes/videos";
import { seriesRouter } from "./routes/series";
import { commentsRouter } from "./routes/comments";
import { progressRouter } from "./routes/progress";
import { uploadsRouter } from "./routes/uploads";
import { adminRouter } from "./routes/admin";
import { coursesRouter } from "./routes/courses";
import { modulesRouter } from "./routes/modules";
import { lessonsRouter } from "./routes/lessons";
import { enrollmentsRouter } from "./routes/enrollments";
import { communityChannelsRouter } from "./routes/community-channels";
import { communityPostsRouter } from "./routes/community-posts";
import { emailMarketingRouter } from "./routes/email-marketing";
import { landingPagesRouter } from "./routes/landing-pages";
import { analyticsRouter } from "./routes/analytics";
import { creatorSettingsRouter } from "./routes/creator-settings";
import { avatarVideosRouter } from "./routes/avatar-videos";
import { certificatesRouter } from "./routes/certificates";
import { aiRouter } from "./routes/ai";
import { affiliatesRouter } from "./routes/affiliates";
import { couponsRouter } from "./routes/coupons";
import { videoUploadsRouter } from "./routes/video-uploads";
import { webhooksRouter } from "./routes/webhooks";
import { gamificationRouter } from "./routes/gamification";
import { sduiRouter } from "./routes/sdui";

export const trpcRouter = createTRPCRouter({
  // Existing routers (video platform)
  videos: videosRouter,
  series: seriesRouter,
  comments: commentsRouter,
  progress: progressRouter,
  uploads: uploadsRouter,
  admin: adminRouter,

  // Course creator platform
  courses: coursesRouter,
  modules: modulesRouter,
  lessons: lessonsRouter,
  enrollments: enrollmentsRouter,
  communityChannels: communityChannelsRouter,
  communityPosts: communityPostsRouter,
  emailMarketing: emailMarketingRouter,
  landingPages: landingPagesRouter,
  analytics: analyticsRouter,
  creatorSettings: creatorSettingsRouter,
  avatarVideos: avatarVideosRouter,
  certificates: certificatesRouter,
  ai: aiRouter,
  affiliates: affiliatesRouter,
  coupons: couponsRouter,
  videoUploads: videoUploadsRouter,
  webhooks: webhooksRouter,
  gamification: gamificationRouter,

  // SDUI system
  sdui: sduiRouter,
});

export type TRPCRouter = typeof trpcRouter;
