import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Library</p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-5xl">All Shows</h1>
        <p className="mt-4 text-muted-foreground">
          Browse our complete library of cooking series.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl border-border/50">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="pt-4">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="mt-2 h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : seriesList && seriesList.length > 0 ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series, i) => (
            <motion.div
              key={series.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <Link to="/shows/$slug" params={{ slug: series.slug }}>
                <Card className="group overflow-hidden rounded-2xl border-border/50 transition-all duration-300 hover:border-foreground/20 hover:shadow-2xl hover:shadow-foreground/5">
                  {series.thumbnailUrl ? (
                    <img
                      src={series.thumbnailUrl}
                      alt={series.title}
                      className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted">
                      <Play className="size-12 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="pt-5 pb-6">
                    <h3 className="font-semibold text-lg">{series.title}</h3>
                    {series.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                        {series.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-24 text-center"
        >
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-muted">
            <Play className="size-10 text-muted-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No Shows Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon for new cooking shows.
          </p>
        </motion.div>
      )}
    </div>
  );
}
