declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        "stream-type"?: string;
        "playback-id"?: string;
        "metadata-video-title"?: string;
      }, HTMLElement>;
    }
  }
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/features/auth/auth-hooks";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_public/watch/$slug")({
  component: WatchPage,
  head: ({ params }) => ({
    meta: [
      ...seo({
        title: `Watch | Apostle`,
        description: `Watch premium cooking content on Apostle.`,
      }),
      { name: "og:type", content: "video.other" },
      {
        name: "og:url",
        content: `https://apostle.tv/watch/${params.slug}`,
      },
    ],
  }),
});

function WatchPage() {
  const { slug } = Route.useParams();
  const { data: session } = useSession();
  const trpc = useTRPC();
  const progressInterval = useRef<ReturnType<typeof setInterval>>(null);
  const currentTimeRef = useRef(0);

  const { data: video, isLoading } = useQuery(
    trpc.videos.getBySlug.queryOptions({ slug })
  );

  // Update document title dynamically when video data loads
  useEffect(() => {
    if (video?.title) {
      document.title = `${video.title} | Apostle`;
    }
  }, [video?.title]);

  const saveProgress = useMutation(
    trpc.progress.save.mutationOptions()
  );

  const hasActiveSubscription = !!(session as Record<string, unknown>)?.activeSubscription;
  const hasAccess = video?.isFree || (session?.user && hasActiveSubscription);

  useEffect(() => {
    if (!video || !session?.user) return;

    progressInterval.current = setInterval(() => {
      if (currentTimeRef.current > 0) {
        saveProgress.mutate({
          videoId: video.id,
          progressSeconds: Math.floor(currentTimeRef.current),
        });
      }
    }, 30000);

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      if (currentTimeRef.current > 0 && video) {
        saveProgress.mutate({
          videoId: video.id,
          progressSeconds: Math.floor(currentTimeRef.current),
        });
      }
    };
  }, [video?.id, session?.user]);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="aspect-video w-full rounded-lg" />
        <Skeleton className="mt-6 h-10 w-1/2" />
        <Skeleton className="mt-4 h-6 w-3/4" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Video Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The video you're looking for doesn't exist.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/shows">Browse Shows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      {/* Video Player or Paywall */}
      {hasAccess ? (
        <div className="mx-auto max-w-5xl">
          {video.muxPlaybackId ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <mux-player
                stream-type="on-demand"
                playback-id={video.muxPlaybackId}
                metadata-video-title={video.title}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
              <p className="text-muted-foreground">
                Video is being processed. Please check back soon.
              </p>
            </div>
          )}
        </div>
      ) : (
        <Paywall />
      )}

      {/* Video Info */}
      <div className="mx-auto mt-8 max-w-5xl">
        <h1 className="text-2xl font-bold md:text-3xl">{video.title}</h1>
        {video.description && (
          <p className="mt-4 text-muted-foreground">{video.description}</p>
        )}

        {video.pdfUrl && hasAccess && (
          <div className="mt-6">
            <Button variant="outline" asChild>
              <a href={video.pdfUrl} target="_blank" rel="noopener noreferrer">
                Download Recipe PDF
              </a>
            </Button>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12">
          <CommentThread videoId={video.id} />
        </div>
      </div>
    </div>
  );
}

function Paywall() {
  const { data: session } = useSession();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg bg-muted/50 border">
        <Lock className="size-16 text-muted-foreground" />
        <h2 className="mt-4 text-2xl font-bold">Premium Content</h2>
        <p className="mt-2 text-muted-foreground">
          Subscribe to watch this video and unlock all premium content.
        </p>
        <div className="mt-6 flex gap-4">
          {session?.user ? (
            <Button asChild>
              <Link to="/pricing">View Plans</Link>
            </Button>
          ) : (
            <>
              <Button asChild>
                <Link to="/register">Sign Up</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentThread({ videoId }: { videoId: string }) {
  const { data: session } = useSession();
  const trpc = useTRPC();
  const { data: comments, isLoading } = useQuery(
    trpc.comments.listByVideo.queryOptions({ videoId })
  );

  const addComment = useMutation(trpc.comments.create.mutationOptions());
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = formData.get("body") as string;
    if (!body.trim()) return;

    addComment.mutate(
      { videoId, body },
      {
        onSuccess: () => {
          formRef.current?.reset();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comments</CardTitle>
      </CardHeader>
      <CardContent>
        {session?.user && (
          <form ref={formRef} onSubmit={handleSubmit} className="mb-6">
            <textarea
              name="body"
              placeholder="Add a comment..."
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none min-h-[80px]"
              required
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={addComment.isPending}>
                {addComment.isPending ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {comment.user?.name?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {comment.user?.name ?? "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "stream-type"?: string;
          "playback-id"?: string;
          "metadata-video-title"?: string;
        },
        HTMLElement
      >;
    }
  }
}
