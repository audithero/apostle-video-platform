import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_public/shows/")({
  component: ShowsPage,
  head: () => ({
    meta: [
      ...seo({
        title: "Shows | Apostle",
        description:
          "Browse our complete library of premium cooking series and culinary masterclasses from world-class chefs.",
      }),
    ],
  }),
});

function ShowsPage() {
  const trpc = useTRPC();
  const { data: seriesList, isLoading } = useQuery(
    trpc.series.list.queryOptions()
  );

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">All Shows</h1>
      <p className="mt-2 text-muted-foreground">
        Browse our complete library of cooking series.
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full rounded-t-xl" />
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : seriesList && seriesList.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series) => (
            <Link key={series.id} to="/shows/$slug" params={{ slug: series.slug }}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                {series.thumbnailUrl ? (
                  <img
                    src={series.thumbnailUrl}
                    alt={series.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <Play className="size-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="pt-4">
                  <h3 className="font-semibold">{series.title}</h3>
                  {series.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {series.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <Play className="mx-auto size-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Shows Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon for new cooking shows.
          </p>
        </div>
      )}
    </div>
  );
}
