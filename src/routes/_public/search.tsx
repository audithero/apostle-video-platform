import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = useSearch({ from: "/_public/search" });
  const navigate = useNavigate();
  const trpc = useTRPC();

  const { data: videos, isLoading } = useQuery(
    trpc.videos.list.queryOptions({ search: q })
  );

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("q") as string;
    navigate({
      to: "/search",
      search: { q: query },
    });
  };

  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">Search</h1>
        <p className="mt-3 text-muted-foreground">
          Find videos, series, and content across the platform.
        </p>
      </div>

      <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-xl gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search videos..."
            className="h-12 rounded-xl border-border/60 pl-11 text-base shadow-sm focus-visible:border-primary/40 focus-visible:ring-primary/20"
          />
        </div>
        <Button type="submit" className="h-12 rounded-xl px-6">
          Search
        </Button>
      </form>

      <div className="mx-auto mt-12 max-w-4xl">
        {!q ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-gaspar-lavender/15">
              <SearchIcon className="size-8 text-primary" />
            </div>
            <p className="mt-6 text-lg text-muted-foreground">
              Enter a search term to find videos.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-2xl border-border/40">
                <Skeleton className="aspect-video w-full" />
                <CardContent className="pt-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div>
            <p className="mb-6 text-sm text-muted-foreground">
              {videos.length} result{videos.length !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <Link key={video.id} to="/watch/$slug" params={{ slug: video.slug }}>
                  <Card className="group overflow-hidden rounded-2xl border-border/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
                    <div className="relative overflow-hidden">
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-gaspar-lavender/10">
                          <SearchIcon className="size-10 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="pt-4 pb-5">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{video.title}</h3>
                        {video.isFree && (
                          <Badge variant="secondary" className="shrink-0 rounded-full bg-emerald-100 text-emerald-700">
                            Free
                          </Badge>
                        )}
                      </div>
                      {video.description && (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {video.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-gaspar-pink/30">
              <SearchIcon className="size-8 text-muted-foreground" />
            </div>
            <p className="mt-6 text-lg text-muted-foreground">
              No results found for &ldquo;{q}&rdquo;. Try a different search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
