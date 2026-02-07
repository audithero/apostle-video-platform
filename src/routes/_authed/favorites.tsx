import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const trpc = useTRPC();
  const { data: favorites, isLoading } = useQuery(
    trpc.progress.getFavorites.queryOptions()
  );

  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold">My Favorites</h1>
      <p className="mt-2 text-muted-foreground">
        Videos you've saved to watch later.
      </p>

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video w-full rounded-t-xl" />
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <Link
              key={fav.id}
              to="/watch/$slug"
              params={{ slug: fav.slug }}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                {fav.thumbnailUrl ? (
                  <img
                    src={fav.thumbnailUrl}
                    alt={fav.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <Play className="size-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{fav.title}</h3>
                    {fav.isFree && (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </div>
                  {fav.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {fav.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <Heart className="mx-auto size-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">No Favorites Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Start watching videos and add them to your favorites.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/shows">Browse Shows</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
