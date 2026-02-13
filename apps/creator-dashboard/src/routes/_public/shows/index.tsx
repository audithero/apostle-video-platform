import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
        className="mx-auto max-w-3xl text-center"
      >
        <Badge variant="outline" className="rounded-full border-primary/30 px-4 py-1 text-xs font-medium uppercase tracking-widest text-primary">
          Library
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">All Shows</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Browse our complete library of premium series and masterclasses.
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
                <Card className="group overflow-hidden rounded-2xl border-border/40 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/10">
                  <div className="relative overflow-hidden">
                    {series.thumbnailUrl ? (
                      <img
                        src={series.thumbnailUrl}
                        alt={series.title}
                        className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center bg-gaspar-lavender/10">
                        <Play className="size-12 text-primary/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute bottom-3 left-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <Badge className="rounded-full bg-white/90 text-foreground backdrop-blur-sm">
                        <Play className="mr-1 size-3" /> Watch Now
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="pt-5 pb-6">
                    <h3 className="text-lg font-semibold">{series.title}</h3>
                    {series.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
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
          <div className="mx-auto flex size-24 items-center justify-center rounded-full bg-gaspar-lavender/15">
            <Play className="size-10 text-primary" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">No Shows Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Check back soon for new shows and masterclasses.
          </p>
        </motion.div>
      )}
    </div>
  );
}
