import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});

function HomePage() {
  const trpc = useTRPC();
  const { data: seriesList, isLoading } = useQuery(
    trpc.series.list.queryOptions()
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted py-20 md:py-32">
        <div className="container flex flex-col items-center text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
            Premium Cooking Shows
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Stream exclusive cooking shows and culinary masterclasses from
            world-class chefs. Learn new techniques, discover recipes, and
            elevate your cooking.
          </p>
          <div className="mt-10 flex gap-4">
            <Button size="lg" asChild>
              <Link to="/shows">
                <Play className="mr-2 size-5" />
                Browse Shows
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/pricing">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Series */}
      <section className="container py-16">
        <h2 className="mb-8 text-3xl font-bold">Featured Series</h2>
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        ) : seriesList && seriesList.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.slice(0, 6).map((series) => (
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
          <p className="text-center text-muted-foreground">
            No series available yet. Check back soon!
          </p>
        )}
      </section>

      {/* How it Works */}
      <section className="border-t bg-muted/50 py-16">
        <div className="container">
          <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="size-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Browse Shows</h3>
              <p className="mt-2 text-muted-foreground">
                Explore our curated collection of cooking series from top chefs
                around the world.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Star className="size-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Subscribe</h3>
              <p className="mt-2 text-muted-foreground">
                Choose a plan that works for you and get unlimited access to all
                premium content.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Play className="size-8 text-primary" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">Start Watching</h3>
              <p className="mt-2 text-muted-foreground">
                Stream high-quality cooking lessons anytime, anywhere, on any
                device.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-16 text-center">
        <h2 className="text-3xl font-bold">Ready to Start Cooking?</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join thousands of home cooks who are elevating their skills.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link to="/pricing">Get Started</Link>
        </Button>
      </section>
    </div>
  );
}
