import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
    <div className="container py-12">
      <h1 className="text-3xl font-bold">Search</h1>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={q}
            placeholder="Search videos..."
            className="pl-10"
          />
        </div>
      </form>

      <div className="mt-8">
        {!q ? (
          <p className="text-muted-foreground">
            Enter a search term to find videos.
          </p>
        ) : isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {videos.length} result{videos.length !== 1 ? "s" : ""} for "{q}"
            </p>
            {videos.map((video) => (
              <Link key={video.id} to="/watch/$slug" params={{ slug: video.slug }}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex gap-4 py-4">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="h-20 w-36 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-20 w-36 shrink-0 items-center justify-center rounded bg-muted">
                        <Search className="size-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{video.title}</h3>
                        {video.isFree && <Badge variant="secondary">Free</Badge>}
                      </div>
                      {video.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {video.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No results found for "{q}". Try a different search term.
          </p>
        )}
      </div>
    </div>
  );
}
