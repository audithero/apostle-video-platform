import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const CARD_ACCENTS = [
  "gaspar-card-cream",
  "gaspar-card-blue",
  "gaspar-card-pink",
  "gaspar-card-navy",
] as const;

const PILL_TAGS = ["Course", "Premium", "Exclusive", "New", "Featured", "Popular"] as const;

function HomePage() {
  const trpc = useTRPC();
  const { data: coursesList, isLoading } = useQuery(
    trpc.courses.listPublished.queryOptions()
  );

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative flex min-h-[70vh] md:min-h-[92vh] items-center justify-center overflow-hidden">
        {/* Deep gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gaspar-navy via-gaspar-navy to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gaspar-purple/20 via-transparent to-transparent" />

        <motion.div
          className="container relative z-10 flex flex-col items-center text-center px-6 py-20"
          initial="hidden"
          animate="visible"
        >
          <motion.span
            custom={0}
            variants={fadeUp}
            className="pill border-white/20 text-white/70 bg-white/5"
          >
            Learn From The Best
          </motion.span>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="mt-8 max-w-5xl text-5xl font-bold uppercase tracking-tight text-white md:text-7xl lg:text-[5.5rem] leading-[0.95]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Premium Online Courses
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-8 max-w-lg text-base text-white/60 md:text-lg leading-relaxed"
          >
            Explore expert-led courses and masterclasses across cooking,
            photography, and more. Learn at your own pace with structured
            lessons and hands-on projects.
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              className="rounded-full px-8 uppercase tracking-wider text-sm bg-gaspar-purple text-white hover:bg-gaspar-purple/90"
              asChild
            >
              <Link to="/" hash="courses">
                <Play className="mr-2 size-4" />
                Browse Courses
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 uppercase tracking-wider text-sm border-white/25 text-white hover:bg-white/10 hover:text-white bg-transparent"
              asChild
            >
              <Link to="/pricing">View Plans</Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-12 md:py-28">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
          >
            <div>
              <span className="pill border-border text-muted-foreground">Explore</span>
              <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl lg:text-5xl">
                Featured Courses
              </h2>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-3xl bg-muted">
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-6">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="mt-4 h-6 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : coursesList && coursesList.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coursesList.slice(0, 6).map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.05 }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link to="/courses/$slug" params={{ slug: c.slug }}>
                    <div
                      className={`group overflow-hidden rounded-3xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`}
                    >
                      {c.thumbnailUrl ? (
                        <img
                          src={c.thumbnailUrl}
                          alt={c.title}
                          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] w-full items-center justify-center">
                          <Play className="size-14 opacity-20" />
                        </div>
                      )}
                      <div className="p-6">
                        <span className="pill border-current/20 text-[0.65rem]">
                          {c.priceType === "free" ? "Free" : PILL_TAGS[i % PILL_TAGS.length]}
                        </span>
                        <h3 className="mt-4 text-xl font-semibold leading-tight">
                          {c.title}
                        </h3>
                        {c.description && (
                          <p className="mt-2 line-clamp-2 text-sm opacity-70 leading-relaxed">
                            {c.description}
                          </p>
                        )}
                        <p className="mt-3 text-xs text-muted-foreground">
                          by {c.creatorBusinessName}
                        </p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="mt-8 md:mt-16 flex flex-col items-center text-center">
              <div className="rounded-3xl bg-muted/50 p-8 md:p-16">
                <p className="text-lg text-muted-foreground">
                  No courses available yet. Check back soon!
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-12 md:py-28">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <span className="pill border-border text-muted-foreground">Getting Started</span>
            <h2 className="mt-4 text-3xl font-bold uppercase tracking-tight md:text-4xl lg:text-5xl">
              How It Works
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-3 md:gap-6">
            {[
              {
                step: "01",
                title: "Browse Courses",
                description: "Explore our curated collection of expert-led courses across a range of topics.",
                accent: "gaspar-card-cream",
              },
              {
                step: "02",
                title: "Enroll",
                description: "Sign up for free courses or choose a plan to unlock premium content.",
                accent: "gaspar-card-blue",
              },
              {
                step: "03",
                title: "Start Learning",
                description: "Work through structured lessons at your own pace, anytime, anywhere.",
                accent: "gaspar-card-pink",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className={`${item.accent} flex flex-col rounded-3xl p-8 md:p-10`}
              >
                <span className="pill w-fit border-current/20 text-[0.65rem]">
                  Step {item.step}
                </span>
                <h3 className="mt-6 text-2xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm opacity-70 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-28">
        <div className="container px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.05 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gaspar-navy px-8 py-16 text-center md:px-16 md:py-24"
          >
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-gaspar-purple/20 via-transparent to-transparent" />

            <div className="relative z-10">
              <span className="pill border-white/20 text-white/60 bg-white/5">
                Start Today
              </span>
              <h2 className="mt-6 text-3xl font-bold uppercase tracking-tight text-white md:text-5xl lg:text-6xl">
                Ready to Start Learning?
              </h2>
              <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
                Join thousands of learners who are elevating their skills.
              </p>
              <Button
                size="lg"
                className="mt-10 rounded-full px-10 uppercase tracking-wider text-sm bg-gaspar-purple text-white hover:bg-gaspar-purple/90"
                asChild
              >
                <Link to="/pricing">Get Started</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
