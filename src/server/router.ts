import { createTRPCRouter } from "@/lib/trpc/init";
import { videosRouter } from "./routes/videos";
import { seriesRouter } from "./routes/series";
import { commentsRouter } from "./routes/comments";
import { progressRouter } from "./routes/progress";
import { uploadsRouter } from "./routes/uploads";
import { adminRouter } from "./routes/admin";

export const trpcRouter = createTRPCRouter({
  videos: videosRouter,
  series: seriesRouter,
  comments: commentsRouter,
  progress: progressRouter,
  uploads: uploadsRouter,
  admin: adminRouter,
});

export type TRPCRouter = typeof trpcRouter;
