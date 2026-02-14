import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Lock,
  Menu,
  PlayCircle,
  Share2,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/lib/trpc/react";
import { PixelScripts } from "@/components/analytics/PixelScripts";

export const Route = createFileRoute("/_authed/learn/$courseId")({
  component: CoursePlayerPage,
});

// -- Types -------------------------------------------------------------------

type LessonType = "video" | "text" | "quiz" | "assignment" | "live";

interface PlayerLesson {
  readonly id: string;
  readonly title: string;
  readonly lessonType: LessonType;
  readonly videoDurationSeconds: number | null;
  readonly videoUrl: string | null;
  readonly contentHtml: string | null;
  readonly isFreePreview: boolean;
  readonly isCompleted: boolean;
  readonly progressSeconds: number;
  readonly status: "not_started" | "in_progress" | "completed";
}

interface PlayerModule {
  readonly id: string;
  readonly title: string;
  readonly sortOrder: number;
  readonly isLocked: boolean;
  readonly unlockDate: Date | null;
  readonly lessons: ReadonlyArray<PlayerLesson>;
}

interface PlayerCourse {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly creatorId: string;
  readonly creatorName: string;
  readonly enrollmentId: string;
  readonly enrolledAt: Date | string;
  readonly completedAt?: Date | string | null;
  readonly certificateSerial?: string | null;
  readonly certificatePdfUrl?: string | null;
  readonly modules: ReadonlyArray<PlayerModule>;
}

// -- Helpers -----------------------------------------------------------------

const allLessons = (course: PlayerCourse): ReadonlyArray<PlayerLesson> =>
  course.modules.flatMap((mod) => (mod.isLocked ? [] : [...mod.lessons]));

const flatIndex = (
  lessons: ReadonlyArray<PlayerLesson>,
  lessonId: string,
): number => lessons.findIndex((l) => l.id === lessonId);

const lessonTypeIcon = (type: LessonType) => {
  switch (type) {
    case "video":
      return <PlayCircle className="size-4 shrink-0" />;
    case "quiz":
      return <HelpCircle className="size-4 shrink-0" />;
    default:
      return <FileText className="size-4 shrink-0" />;
  }
};

const formatDurationFromSeconds = (seconds: number | null): string => {
  if (seconds === null) return "";
  const minutes = Math.round(seconds / 60);
  return `${String(minutes)} min`;
};

const formatUnlockDate = (date: Date): string => {
  const d = new Date(date);
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return formatter.format(d);
};

const PROGRESS_SAVE_INTERVAL_MS = 10_000;

// -- Drip Countdown ----------------------------------------------------------

function useDripCountdown(unlockDate: Date | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!unlockDate) return;
    const interval = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(interval);
  }, [unlockDate]);

  if (!unlockDate) return "";

  const target = new Date(unlockDate).getTime();
  const diff = target - now;
  if (diff <= 0) return "Available now";

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) return `${String(days)}d ${String(hours)}h remaining`;
  if (hours > 0) return `${String(hours)}h ${String(minutes)}m remaining`;
  return `${String(minutes)}m remaining`;
}

// -- Certificate Banner ------------------------------------------------------

interface CertificateBannerProps {
  readonly course: PlayerCourse;
  readonly overallProgress: number;
}

function CertificateBanner({ course, overallProgress }: CertificateBannerProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { courseId } = Route.useParams();

  const generateMutation = useMutation(
    trpc.certificates.generate.mutationOptions({
      onSuccess: () => {
        toast.success("Certificate generated!");
        queryClient.invalidateQueries({
          queryKey: trpc.enrollments.getStudentCourse.queryOptions({ courseId }).queryKey,
        });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to generate certificate");
      },
    }),
  );

  const isComplete = overallProgress === 100;
  const hasCertificate = Boolean(course.certificateSerial);

  if (!isComplete) return null;

  const shareText = `I just completed "${course.title}" and earned my certificate!`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(course.certificatePdfUrl ?? "")}`;
  const xShareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Course Complete!</CardTitle>
            <CardDescription>
              Congratulations on completing {course.title}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasCertificate ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="size-4 text-amber-600" />
              <span>Certificate ID: <span className="font-mono">{course.certificateSerial}</span></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {course.certificatePdfUrl && (
                <Button type="button" size="sm" asChild>
                  <a href={course.certificatePdfUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="size-3.5" />
                    Download PDF
                  </a>
                </Button>
              )}
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={linkedInShareUrl} target="_blank" rel="noopener noreferrer">
                  <Share2 className="size-3.5" />
                  LinkedIn
                </a>
              </Button>
              <Button type="button" variant="outline" size="sm" asChild>
                <a href={xShareUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Share on X
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => generateMutation.mutate({ enrollmentId: course.enrollmentId })}
            disabled={generateMutation.isPending}
          >
            <Award className="size-3.5" />
            {generateMutation.isPending ? "Generating..." : "Generate Certificate"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// -- Page component ----------------------------------------------------------

function CoursePlayerPage() {
  const { courseId } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: courseData, isLoading, isError } = useQuery(
    trpc.enrollments.getStudentCourse.queryOptions({ courseId }),
  );

  const saveProgressMutation = useMutation(
    trpc.enrollments.saveLessonProgress.mutationOptions(),
  );

  // Cast to our local interface (the API shape matches)
  const course = courseData as PlayerCourse | null | undefined;

  // Fetch creator's analytics pixel settings for injection
  const { data: pixelSettings } = useQuery(
    trpc.creatorSettings.getPixelSettings.queryOptions(
      { creatorId: course?.creatorId ?? "" },
      { enabled: Boolean(course?.creatorId) },
    ),
  );

  const lessons = useMemo(
    () => (course ? allLessons(course) : []),
    [course],
  );

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const overallProgress =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Track which lesson is currently viewed
  const [activeLessonId, setActiveLessonId] = useState<string>("");

  // Initialize activeLessonId when course loads
  useEffect(() => {
    if (course && activeLessonId === "") {
      const available = allLessons(course);
      const firstIncomplete = available.find((l) => !l.isCompleted);
      setActiveLessonId(firstIncomplete?.id ?? available.at(0)?.id ?? "");
    }
  }, [course, activeLessonId]);

  // Track which modules are expanded
  const [expandedModules, setExpandedModules] = useState<ReadonlySet<string>>(
    new Set(),
  );

  // Expand module containing active lesson when it changes
  useEffect(() => {
    if (course && activeLessonId) {
      const moduleWithActive = course.modules.find((mod) =>
        mod.lessons.some((l) => l.id === activeLessonId),
      );
      if (moduleWithActive) {
        setExpandedModules((prev) => {
          if (prev.has(moduleWithActive.id)) return prev;
          return new Set([...prev, moduleWithActive.id]);
        });
      }
    }
  }, [course, activeLessonId]);

  // Mobile sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeLesson = useMemo(
    () => lessons.find((l) => l.id === activeLessonId) ?? null,
    [lessons, activeLessonId],
  );

  const currentIndex = flatIndex(lessons, activeLessonId);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < lessons.length - 1;

  // Video progress tracking with debounced save
  const videoTimeRef = useRef(0);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval>>(null);

  // Set up periodic progress saving for video lessons
  useEffect(() => {
    if (!activeLesson || activeLesson.lessonType !== "video" || !course) return;

    // Initialize video time from saved progress
    videoTimeRef.current = activeLesson.progressSeconds;

    saveIntervalRef.current = setInterval(() => {
      if (videoTimeRef.current > 0) {
        saveProgressMutation.mutate({
          courseId,
          lessonId: activeLesson.id,
          progressSeconds: Math.floor(videoTimeRef.current),
          status: "in_progress",
        });
      }
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
      // Save progress on cleanup
      if (videoTimeRef.current > 0 && activeLesson) {
        saveProgressMutation.mutate({
          courseId,
          lessonId: activeLesson.id,
          progressSeconds: Math.floor(videoTimeRef.current),
          status: "in_progress",
        });
      }
    };
  }, [activeLesson?.id, activeLesson?.lessonType, courseId]);

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  const navigateToLesson = useCallback(
    (lessonId: string) => {
      setActiveLessonId(lessonId);
      setIsSidebarOpen(false);
    },
    [],
  );

  const handlePrevious = useCallback(() => {
    if (hasPrevious) {
      const prevLesson = lessons.at(currentIndex - 1);
      if (prevLesson) {
        navigateToLesson(prevLesson.id);
      }
    }
  }, [hasPrevious, lessons, currentIndex, navigateToLesson]);

  const handleNext = useCallback(() => {
    if (hasNext) {
      const nextLesson = lessons.at(currentIndex + 1);
      if (nextLesson) {
        navigateToLesson(nextLesson.id);
      }
    }
  }, [hasNext, lessons, currentIndex, navigateToLesson]);

  const handleMarkComplete = useCallback(() => {
    if (!activeLessonId) return;

    saveProgressMutation.mutate(
      {
        courseId,
        lessonId: activeLessonId,
        status: "completed",
      },
      {
        onSuccess: () => {
          // Invalidate the course data to refresh completion state
          queryClient.invalidateQueries({
            queryKey: trpc.enrollments.getStudentCourse.queryOptions({ courseId }).queryKey,
          });
        },
      },
    );
  }, [activeLessonId, courseId, saveProgressMutation, queryClient, trpc]);

  const handleVideoTimeUpdate = useCallback((time: number) => {
    videoTimeRef.current = time;
  }, []);

  const handleVideoEnded = useCallback(() => {
    if (!activeLessonId) return;
    saveProgressMutation.mutate(
      {
        courseId,
        lessonId: activeLessonId,
        status: "completed",
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.enrollments.getStudentCourse.queryOptions({ courseId }).queryKey,
          });
        },
      },
    );
  }, [activeLessonId, courseId, saveProgressMutation, queryClient, trpc]);

  // -- Loading state ---
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col">
        <div className="border-b bg-background px-4 py-3">
          <div className="flex items-center gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-48" />
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <aside className="hidden w-80 shrink-0 border-r lg:block">
            <div className="space-y-4 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </aside>
          <div className="flex-1 p-10">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="mt-4 h-8 w-1/2" />
            <Skeleton className="mt-8 aspect-video w-full" />
          </div>
        </div>
      </div>
    );
  }

  // -- Error / not enrolled ---
  if (isError || !course) {
    return (
      <div className="container py-16 text-center">
        <AlertCircle className="mx-auto size-16 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">
          {isError ? "Something went wrong" : "Course Not Found"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {isError
            ? "We could not load this course. Please try again."
            : "You may not be enrolled in this course, or it does not exist."}
        </p>
        <Button className="mt-6" type="button" asChild>
          <Link to="/my-courses">Back to My Courses</Link>
        </Button>
      </div>
    );
  }

  // Sidebar content (shared between desktop sidebar and mobile sheet)
  const sidebarContent = (
    <SidebarNav
      course={course}
      activeLessonId={activeLessonId}
      expandedModules={expandedModules}
      onToggleModule={toggleModule}
      onSelectLesson={navigateToLesson}
    />
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* Analytics pixel injection for creator tracking */}
      {pixelSettings && (
        <PixelScripts
          metaPixelId={pixelSettings.metaPixelId}
          ga4Id={pixelSettings.ga4Id}
          gtmId={pixelSettings.gtmId}
          tiktokPixelId={pixelSettings.tiktokPixelId}
        />
      )}
      {/* Top progress bar */}
      <div className="border-b bg-background px-4 py-3">
        <div className="flex items-center gap-4">
          <Link
            to="/my-courses"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            aria-label="Back to my courses"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">My Courses</span>
          </Link>

          <Separator orientation="vertical" className="h-5" />

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="truncate text-sm font-semibold">{course.title}</h1>
            <div className="hidden items-center gap-2 sm:flex">
              <Progress
                value={overallProgress}
                className="h-2 w-32"
                aria-label={`Overall course progress: ${String(overallProgress)}%`}
              />
              <span className="text-xs text-muted-foreground">
                {`${String(overallProgress)}%`}
              </span>
            </div>
          </div>

          {/* Mobile sidebar toggle */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open course navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b p-4">
                <SheetTitle className="text-left text-sm">
                  Course Contents
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-5rem)]">
                {sidebarContent}
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile progress bar (visible on small screens) */}
        <div className="mt-2 flex items-center gap-2 sm:hidden">
          <Progress
            value={overallProgress}
            className="h-2 flex-1"
            aria-label={`Overall course progress: ${String(overallProgress)}%`}
          />
          <span className="text-xs text-muted-foreground">
            {`${String(overallProgress)}%`}
          </span>
        </div>
      </div>

      {/* Main area: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden w-80 shrink-0 border-r lg:block">
          <ScrollArea className="h-full">
            {sidebarContent}
          </ScrollArea>
        </aside>

        {/* Lesson content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Certificate completion banner */}
          {overallProgress === 100 && (
            <div className="p-6 pb-0 lg:p-10 lg:pb-0">
              <CertificateBanner course={course} overallProgress={overallProgress} />
            </div>
          )}

          {activeLesson ? (
            <LessonContent
              lesson={activeLesson}
              onMarkComplete={handleMarkComplete}
              onVideoTimeUpdate={handleVideoTimeUpdate}
              onVideoEnded={handleVideoEnded}
              isMarkingComplete={saveProgressMutation.isPending}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-muted-foreground">
              <p>Select a lesson to begin.</p>
            </div>
          )}

          {/* Navigation footer */}
          <div className="border-t bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                disabled={!hasPrevious}
                onClick={handlePrevious}
              >
                <ArrowLeft className="mr-2 size-4" />
                Previous
              </Button>

              <span className="text-xs text-muted-foreground">
                {`${String(currentIndex + 1)} of ${String(lessons.length)}`}
              </span>

              <Button
                type="button"
                disabled={!hasNext}
                onClick={handleNext}
              >
                Next Lesson
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Sidebar Navigation ------------------------------------------------------

interface SidebarNavProps {
  readonly course: PlayerCourse;
  readonly activeLessonId: string;
  readonly expandedModules: ReadonlySet<string>;
  readonly onToggleModule: (moduleId: string) => void;
  readonly onSelectLesson: (lessonId: string) => void;
}

function SidebarNav({
  course,
  activeLessonId,
  expandedModules,
  onToggleModule,
  onSelectLesson,
}: SidebarNavProps) {
  return (
    <nav aria-label="Course navigation" className="py-2">
      {course.modules.map((mod) => {
        const completedInModule = mod.lessons.filter(
          (l) => l.isCompleted,
        ).length;
        const totalInModule = mod.lessons.length;
        const isExpanded = expandedModules.has(mod.id);

        return (
          <Collapsible
            key={mod.id}
            open={isExpanded && !mod.isLocked}
            onOpenChange={() => {
              if (!mod.isLocked) {
                onToggleModule(mod.id);
              }
            }}
          >
            <CollapsibleTrigger
              className={cn(
                "flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium hover:bg-accent/50",
                mod.isLocked && "cursor-not-allowed opacity-60",
              )}
              disabled={mod.isLocked}
            >
              {mod.isLocked ? (
                <Lock className="size-4 shrink-0 text-muted-foreground" />
              ) : isExpanded ? (
                <ChevronDown className="size-4 shrink-0" />
              ) : (
                <ChevronRight className="size-4 shrink-0" />
              )}

              <div className="flex flex-1 flex-col gap-0.5">
                <span className="leading-snug">{mod.title}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {mod.isLocked && mod.unlockDate
                    ? <LockedModuleCountdown unlockDate={mod.unlockDate} />
                    : `${String(completedInModule)} / ${String(totalInModule)} complete`}
                </span>
              </div>

              {!mod.isLocked && completedInModule === totalInModule && totalInModule > 0 && (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              )}
            </CollapsibleTrigger>

            <CollapsibleContent>
              <ul className="pb-1">
                {mod.lessons.map((lessonItem) => {
                  const isActive = lessonItem.id === activeLessonId;

                  return (
                    <li key={lessonItem.id}>
                      <button
                        type="button"
                        onClick={() => onSelectLesson(lessonItem.id)}
                        className={cn(
                          "flex w-full items-center gap-3 px-4 py-2 pl-10 text-left text-sm transition-colors hover:bg-accent/50",
                          isActive && "bg-accent font-medium",
                        )}
                      >
                        {lessonItem.isCompleted ? (
                          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                        ) : (
                          lessonTypeIcon(lessonItem.lessonType)
                        )}

                        <span className="flex-1 truncate">{lessonItem.title}</span>

                        {lessonItem.videoDurationSeconds !== null && (
                          <span className="text-xs text-muted-foreground">
                            {formatDurationFromSeconds(lessonItem.videoDurationSeconds)}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </nav>
  );
}

// -- Locked Module Countdown -------------------------------------------------

function LockedModuleCountdown({ unlockDate }: { readonly unlockDate: Date }) {
  const countdown = useDripCountdown(unlockDate);
  return (
    <span className="flex items-center gap-1">
      <Clock className="size-3" />
      {countdown === "Available now"
        ? countdown
        : `Unlocks ${formatUnlockDate(unlockDate)} (${countdown})`}
    </span>
  );
}

// -- Lesson Content ----------------------------------------------------------

interface LessonContentProps {
  readonly lesson: PlayerLesson;
  readonly onMarkComplete: () => void;
  readonly onVideoTimeUpdate: (time: number) => void;
  readonly onVideoEnded: () => void;
  readonly isMarkingComplete: boolean;
}

function LessonContent({
  lesson,
  onMarkComplete,
  onVideoTimeUpdate,
  onVideoEnded,
  isMarkingComplete,
}: LessonContentProps) {
  const lessonType = lesson.lessonType;
  const typeLabel =
    lessonType === "video"
      ? "Video"
      : lessonType === "quiz"
        ? "Quiz"
        : lessonType === "assignment"
          ? "Assignment"
          : "Reading";

  return (
    <div className="flex-1 p-6 lg:p-10">
      {/* Lesson header */}
      <div className="flex items-center gap-3">
        {lessonTypeIcon(lessonType)}
        <Badge variant="outline">{typeLabel}</Badge>
        {lesson.videoDurationSeconds !== null && (
          <span className="text-sm text-muted-foreground">
            {formatDurationFromSeconds(lesson.videoDurationSeconds)}
          </span>
        )}
        {lesson.isCompleted && (
          <Badge variant="secondary" className="ml-auto">
            <CheckCircle2 className="mr-1 size-3" />
            Completed
          </Badge>
        )}
      </div>

      <h2 className="mt-4 text-2xl font-bold">{lesson.title}</h2>

      <Separator className="my-6" />

      {/* Lesson body by type */}
      {lessonType === "video" && (
        <VideoLessonBody
          lesson={lesson}
          onTimeUpdate={onVideoTimeUpdate}
          onEnded={onVideoEnded}
          onMarkComplete={onMarkComplete}
          isMarkingComplete={isMarkingComplete}
        />
      )}

      {(lessonType === "text" || lessonType === "assignment") && (
        <TextLessonBody
          lesson={lesson}
          onMarkComplete={onMarkComplete}
          isMarkingComplete={isMarkingComplete}
        />
      )}

      {lessonType === "quiz" && (
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed p-8 text-center">
            <HelpCircle className="mx-auto size-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Ready for the Quiz?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This quiz will test your understanding of the material covered
              in this module. You can retake it as many times as you need.
            </p>
            <Button type="button" className="mt-6">
              Start Quiz
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// -- Video Lesson Body -------------------------------------------------------

function VideoLessonBody({
  lesson,
  onTimeUpdate,
  onEnded,
  onMarkComplete,
  isMarkingComplete,
}: {
  readonly lesson: PlayerLesson;
  readonly onTimeUpdate: (time: number) => void;
  readonly onEnded: () => void;
  readonly onMarkComplete: () => void;
  readonly isMarkingComplete: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Seek to saved position when video loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video || lesson.progressSeconds <= 0) return;

    const handleLoaded = () => {
      if (lesson.progressSeconds > 0 && lesson.progressSeconds < video.duration) {
        video.currentTime = lesson.progressSeconds;
      }
    };

    video.addEventListener("loadedmetadata", handleLoaded);
    return () => video.removeEventListener("loadedmetadata", handleLoaded);
  }, [lesson.id, lesson.progressSeconds]);

  return (
    <div className="space-y-6">
      {lesson.videoUrl ? (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- captions not yet available */}
          <video
            ref={videoRef}
            src={lesson.videoUrl}
            className="size-full"
            controls
            onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
            onEnded={onEnded}
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
          <div className="text-center">
            <PlayCircle className="mx-auto size-16 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Video is being processed. Please check back soon.
            </p>
          </div>
        </div>
      )}

      {lesson.contentHtml && (
        <article
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.contentHtml) }}
        />
      )}

      {!lesson.isCompleted && (
        <Button
          type="button"
          variant="outline"
          onClick={onMarkComplete}
          disabled={isMarkingComplete}
        >
          <CheckCircle2 className="mr-2 size-4" />
          {isMarkingComplete ? "Saving..." : "Mark as Complete"}
        </Button>
      )}
    </div>
  );
}

// -- Text Lesson Body --------------------------------------------------------

function TextLessonBody({
  lesson,
  onMarkComplete,
  isMarkingComplete,
}: {
  readonly lesson: PlayerLesson;
  readonly onMarkComplete: () => void;
  readonly isMarkingComplete: boolean;
}) {
  return (
    <div className="space-y-6">
      {lesson.contentHtml ? (
        <article
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(lesson.contentHtml) }}
        />
      ) : (
        <p className="text-muted-foreground">
          This lesson has no content yet.
        </p>
      )}

      {!lesson.isCompleted && (
        <Button
          type="button"
          onClick={onMarkComplete}
          disabled={isMarkingComplete}
          className="mt-4"
        >
          <CheckCircle2 className="mr-2 size-4" />
          {isMarkingComplete ? "Saving..." : "Mark as Complete"}
        </Button>
      )}
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "mux-player": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          "stream-type"?: string;
          "playback-id"?: string;
          "metadata-video-title"?: string;
        },
        HTMLElement
      >;
    }
  }
}
