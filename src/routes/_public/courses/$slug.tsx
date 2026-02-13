import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, Clock, Play, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match ? match[1] : null;
}

interface LessonRef {
  id: string;
  title: string;
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  lessonType: string;
  moduleName: string;
  moduleIndex: number;
  lessonIndex: number;
}

function CourseDetailPage() {
  const { slug } = Route.useParams();
  const trpc = useTRPC();
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));

  const { data: courseData, isLoading } = useQuery(
    trpc.courses.getPublishedBySlug.queryOptions({ slug }),
  );

  // Build flat lesson list for navigation
  const allLessons: LessonRef[] = courseData
    ? courseData.modules.flatMap((mod, modIdx) =>
        mod.lessons.map((les, lesIdx) => ({
          id: les.id,
          title: les.title,
          videoUrl: les.videoUrl,
          videoDurationSeconds: les.videoDurationSeconds,
          lessonType: les.lessonType,
          moduleName: mod.title,
          moduleIndex: modIdx,
          lessonIndex: lesIdx,
        })),
      )
    : [];

  // Set first video lesson as active on load
  useEffect(() => {
    if (allLessons.length > 0 && !activeLessonId) {
      const firstVideo = allLessons.find(
        (l) => l.videoUrl && extractYouTubeId(l.videoUrl),
      );
      if (firstVideo) {
        setActiveLessonId(firstVideo.id);
        setExpandedModules(new Set([firstVideo.moduleIndex]));
      }
    }
  }, [allLessons.length, activeLessonId]);

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
        <Skeleton className="mt-8 aspect-video w-full max-w-4xl rounded-lg" />
        <div className="mt-8 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
          The course you&apos;re looking for doesn&apos;t exist or isn&apos;t
          published yet.
        </p>
        <Button className="mt-6" asChild>
          <Link to="/">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  const totalLessons = courseData.modules.reduce(
    (acc, mod) => acc + mod.lessons.length,
    0,
  );

  const activeLesson = allLessons.find((l) => l.id === activeLessonId);
  const activeYouTubeId =
    activeLesson?.videoUrl ? extractYouTubeId(activeLesson.videoUrl) : null;

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const selectLesson = (lessonId: string, moduleIndex: number) => {
    setActiveLessonId(lessonId);
    setExpandedModules((prev) => new Set([...prev, moduleIndex]));
    // Scroll to player
    document.getElementById("video-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-background">
      {/* Hero - compact */}
      <section className="relative overflow-hidden bg-gaspar-navy">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gaspar-purple/20 via-transparent to-transparent" />
        <div className="container relative z-10 px-6 py-10 md:py-16">
          <Badge
            variant="secondary"
            className="rounded-full bg-white/10 text-white border-white/20"
          >
            {courseData.priceType === "free" ? "Free Course" : "Premium Course"}
          </Badge>
          <h1 className="mt-4 text-2xl font-bold text-white md:text-4xl lg:text-5xl leading-tight">
            {courseData.title}
          </h1>
          {courseData.description && (
            <p className="mt-4 max-w-2xl text-base text-white/70 leading-relaxed">
              {courseData.description}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-6 text-sm text-white/60">
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
        </div>
      </section>

      {/* Video Player + Lesson List */}
      <section className="py-8 md:py-12" id="video-player">
        <div className="container px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Main video area */}
            <div>
              {activeYouTubeId ? (
                <div className="overflow-hidden rounded-2xl bg-black shadow-2xl">
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeYouTubeId}?rel=0&modestbranding=1`}
                      title={activeLesson?.title ?? "Video"}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 size-full"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted">
                  <div className="text-center">
                    <Play className="mx-auto size-12 text-muted-foreground/40" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Select a lesson to start watching
                    </p>
                  </div>
                </div>
              )}

              {/* Active lesson info */}
              {activeLesson && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Module {activeLesson.moduleIndex + 1}: {activeLesson.moduleName}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">
                    {activeLesson.title}
                  </h2>
                  {activeLesson.videoDurationSeconds ? (
                    <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="size-3.5" />
                      {formatDuration(activeLesson.videoDurationSeconds)}
                    </p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Lesson sidebar */}
            <div className="lg:max-h-[calc(56.25vw*0.6+200px)] lg:overflow-y-auto lg:pr-1">
              <h3 className="text-lg font-semibold mb-4">Course Content</h3>
              <div className="space-y-2">
                {courseData.modules.map((mod, modIdx) => {
                  const isExpanded = expandedModules.has(modIdx);
                  const moduleDuration = mod.lessons.reduce(
                    (sum, l) => sum + (l.videoDurationSeconds ?? 0),
                    0,
                  );

                  return (
                    <div
                      key={mod.id}
                      className="overflow-hidden rounded-xl border border-border"
                    >
                      {/* Module header */}
                      <button
                        type="button"
                        onClick={() => toggleModule(modIdx)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            toggleModule(modIdx);
                          }
                        }}
                        className="flex w-full items-center gap-3 bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
                      >
                        <ChevronDown
                          className={`size-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "" : "-rotate-90"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Module {modIdx + 1}: {mod.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {mod.lessons.length} lesson
                            {mod.lessons.length !== 1 ? "s" : ""}
                            {moduleDuration > 0 &&
                              ` \u00B7 ${formatDuration(moduleDuration)}`}
                          </p>
                        </div>
                      </button>

                      {/* Lessons */}
                      {isExpanded && (
                        <div className="divide-y divide-border">
                          {mod.lessons.map((les, lesIdx) => {
                            const isActive = les.id === activeLessonId;
                            const hasVideo =
                              les.videoUrl && extractYouTubeId(les.videoUrl);

                            return (
                              <button
                                key={les.id}
                                type="button"
                                onClick={() =>
                                  hasVideo && selectLesson(les.id, modIdx)
                                }
                                onKeyDown={(e) => {
                                  if (
                                    hasVideo &&
                                    (e.key === "Enter" || e.key === " ")
                                  ) {
                                    e.preventDefault();
                                    selectLesson(les.id, modIdx);
                                  }
                                }}
                                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                                  isActive
                                    ? "bg-gaspar-purple/10 border-l-2 border-l-gaspar-purple"
                                    : hasVideo
                                      ? "hover:bg-muted/60 cursor-pointer"
                                      : "opacity-50 cursor-default"
                                }`}
                              >
                                <div
                                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                                    isActive
                                      ? "bg-gaspar-purple text-white"
                                      : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {hasVideo ? (
                                    <Play
                                      className="size-3 ml-0.5"
                                      fill="currentColor"
                                    />
                                  ) : (
                                    <span className="text-xs">
                                      {lesIdx + 1}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                                  >
                                    {les.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {les.videoDurationSeconds ? (
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="size-3" />
                                        {formatDuration(
                                          les.videoDurationSeconds,
                                        )}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
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
                {courseData.priceType === "free"
                  ? "Enroll for Free"
                  : "Enroll Now"}
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
