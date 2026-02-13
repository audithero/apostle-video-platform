import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Clock, Lock, Play, Users } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useQuery } from "@tanstack/react-query";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_public/courses/$slug")({
  component: CourseDetailPage,
  head: ({ params }) => ({
    meta: [
      ...seo({
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} | Apostle`,
        description: `Preview the ${params.slug.replace(/-/g, " ")} course on Apostle.`,
      }),
    ],
  }),
});

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const trpc = useTRPC();

  const { data: courseData, isLoading } = useQuery(
    trpc.courses.getPublishedBySlug.queryOptions({ slug })
  );

  useEffect(() => {
    if (courseData?.title) {
      document.title = `${courseData.title} | Apostle`;
    }
  }, [courseData?.title]);

  if (isLoading) {
    return (
      <div className="container px-6 py-12">
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

  if (!courseData) {
    return (
      <div className="container px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">Course Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The course you&apos;re looking for doesn&apos;t exist or isn&apos;t published yet.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = courseData.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0
  );

  return (
    <div className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gaspar-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gaspar-purple/20 via-transparent to-transparent" />
        <div className="container relative z-10 px-6 py-16 md:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
            <div>
              <Badge
                variant="secondary"
                className="rounded-full bg-white/10 text-white border-white/20"
              >
                {courseData.priceType === "free" ? "Free Course" : "Premium Course"}
              </Badge>
              <h1 className="mt-6 text-3xl font-bold text-white md:text-5xl lg:text-6xl leading-tight">
                {courseData.title}
              </h1>
              {courseData.description && (
                <p className="mt-6 max-w-xl text-lg text-white/70 leading-relaxed">
                  {courseData.description}
                </p>
              )}
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
                <span className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  {courseData.enrollmentCount} enrolled
                </span>
                <span className="flex items-center gap-2">
                  by {courseData.creatorBusinessName}
                </span>
              </div>
              <div className="mt-10">
                <Button
                  size="lg"
                  className="rounded-full px-10 uppercase tracking-wider text-sm bg-gaspar-purple text-white hover:bg-gaspar-purple/90"
                  asChild
                >
                  <Link to="/register">
                    {courseData.priceType === "free" ? "Enroll for Free" : "Enroll Now"}
                  </Link>
                </Button>
              </div>
            </div>
            {courseData.thumbnailUrl ? (
              <img
                src={courseData.thumbnailUrl}
                alt={courseData.title}
                className="aspect-video w-full rounded-2xl object-cover shadow-2xl"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-white/5">
                <Play className="size-16 text-white/30" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12 md:py-20">
        <div className="container px-6">
          <h2 className="text-2xl font-bold md:text-3xl">Course Content</h2>
          <p className="mt-2 text-muted-foreground">
            {courseData.modules.length} module{courseData.modules.length !== 1 ? "s" : ""} &middot; {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
          </p>

          <div className="mt-8 space-y-6">
            {courseData.modules.length > 0 ? (
              courseData.modules.map((mod, modIdx) => (
                <div key={mod.id}>
                  <h3 className="text-lg font-semibold">
                    Module {modIdx + 1}: {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {mod.description}
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    {mod.lessons.map((les, lesIdx) => (
                      <Card key={les.id}>
                        <CardContent className="flex items-center gap-4 py-3">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {lesIdx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-medium truncate">
                                {les.title}
                              </h4>
                              {les.isFreePreview ? (
                                <Badge variant="secondary" className="text-[0.6rem]">
                                  Preview
                                </Badge>
                              ) : (
                                <Lock className="size-3 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-[0.6rem] capitalize">
                              {les.lessonType}
                            </Badge>
                            {les.videoDurationSeconds ? (
                              <span className="flex items-center gap-1">
                                <Clock className="size-3" />
                                {formatDuration(les.videoDurationSeconds)}
                              </span>
                            ) : null}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-muted/50 p-8 text-center">
                <p className="text-muted-foreground">
                  Course content is being prepared. Check back soon!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20">
        <div className="container px-6">
          <div className="rounded-3xl bg-gaspar-navy px-8 py-16 text-center md:px-16">
            <h2 className="text-2xl font-bold text-white md:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/60">
              {courseData.priceType === "free"
                ? "This course is completely free. Create an account and start learning today."
                : "Enroll now and start your learning journey today."}
            </p>
            <Button
              size="lg"
              className="mt-8 rounded-full px-10 uppercase tracking-wider text-sm bg-gaspar-purple text-white hover:bg-gaspar-purple/90"
              asChild
            >
              <Link to="/register">
                {courseData.priceType === "free" ? "Enroll for Free" : "Enroll Now"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
