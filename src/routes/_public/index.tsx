import { createFileRoute, Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_public/")({
  component: HomePage,
});

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

function HomePage() {
  const trpc = useTRPC();
  const { data: seriesList, isLoading } = useQuery(
    trpc.series.list.queryOptions()
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-muted/20 via-transparent to-transparent" />

        <motion.div
          className="container relative z-10 flex flex-col items-center text-center px-4"
          initial="hidden"
          animate="visible"
        >
          <motion.p
            custom={0}
            variants={fadeUp}
            className="text-xs font-medium uppercase tracking-[0.4em] text-muted-foreground"
          >
            Stream Exclusive Content
          </motion.p>
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mt-6 max-w-4xl text-4xl font-bold uppercase tracking-tight md:text-7xl lg:text-8xl leading-[0.9]"
          >
            Premium Cooking Shows
          </motion.h1>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-8 max-w-xl text-base text-muted-foreground md:text-lg leading-relaxed"
          >
            Stream exclusive cooking shows and culinary masterclasses from
            world-class chefs. Learn new techniques, discover recipes, and
            elevate your cooking.
          </motion.p>
          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="rounded-full px-8 uppercase tracking-wider text-sm" asChild>
              <Link to="/shows">
                <Play className="mr-2 size-4" />
                Browse Shows
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8 uppercase tracking-wider text-sm" asChild>
              <Link to="/pricing">View Plans</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Series */}
      <section className="container py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Explore</p>
          <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-4xl">Featured Series</h2>
        </motion.div>
        {isLoading ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {seriesList.slice(0, 6).map((series, i) => (
              <motion.div
                key={series.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
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
          <p className="mt-10 text-center text-muted-foreground">
            No series available yet. Check back soon!
          </p>
        )}
      </section>

      {/* How it Works */}
      <section className="border-t border-border/50 py-20 md:py-28">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Getting Started</p>
            <h2 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-4xl">How It Works</h2>
          </motion.div>
          <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            {[
              {
                step: "01",
                title: "Browse Shows",
                description: "Explore our curated collection of cooking series from top chefs around the world.",
              },
              {
                step: "02",
                title: "Subscribe",
                description: "Choose a plan that works for you and get unlimited access to all premium content.",
              },
              {
                step: "03",
                title: "Start Watching",
                description: "Stream high-quality cooking lessons anytime, anywhere, on any device.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="flex flex-col items-center text-center md:items-start md:text-left"
              >
                <span className="text-5xl font-bold text-foreground/10">{item.step}</span>
                <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container text-center"
        >
          <h2 className="text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Ready to Start Cooking?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Join thousands of home cooks who are elevating their skills.
          </p>
          <Button size="lg" className="mt-10 rounded-full px-10 uppercase tracking-wider text-sm" asChild>
            <Link to="/pricing">Get Started</Link>
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
