import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Lock, Play } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_public/shows/$slug")({
  component: SeriesDetailPage,
  head: ({ params }) => ({
    meta: [
      ...seo({
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | Apostle`,
        description: `Watch the ${params.slug.replace(/-/g, " ")} series on Apostle - premium cooking shows and culinary masterclasses.`,
      }),
      {
        name: "og:url",
        content: `https://apostle.tv/shows/${params.slug}`,
      },
    ],
  }),
});

function SeriesDetailPage() {
  const { slug } = Route.useParams();
  const trpc = useTRPC();

  const { data: series, isLoading } = useQuery(
    trpc.series.getBySlug.queryOptions({ slug })
  );

  // Update document title dynamically when series data loads
  useEffect(() => {
    if (series?.title) {
      document.title = `${series.title} | Apostle`;
    }
  }, [series?.title]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-4 h-6 w-3/4" />
        <Skeleton className="mt-8 aspect-video w-full max-w-2xl rounded-lg" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-2xl font-bold">Series Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The series you're looking for doesn't exist.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/shows">Browse Shows</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div>
          {series.thumbnailUrl ? (
            <img
              src={series.thumbnailUrl}
              alt={series.title}
              className="aspect-video w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
              <Play className="size-16 text-muted-foreground" />
            </div>
          )}
          <h1 className="mt-6 text-3xl font-bold">{series.title}</h1>
          {series.description && (
            <p className="mt-4 text-muted-foreground">{series.description}</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold">Episodes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {series.videos?.length ?? 0} episodes
          </p>
        </div>
      </div>

      {/* Episode List */}
      <div className="mt-8">
        <div className="space-y-3">
          {series.videos && series.videos.length > 0 ? (
            series.videos.map((video, index) => (
              <Link
                key={video.id}
                to="/watch/$slug"
                params={{ slug: video.slug }}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{video.title}</h3>
                        {video.isFree ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <Lock className="size-3.5 text-muted-foreground" />
                        )}
                      </div>
                      {video.description && (
                        <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                          {video.description}
                        </p>
                      )}
                    </div>
                    {video.duration && (
                      <div className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="size-3.5" />
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No episodes available yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
