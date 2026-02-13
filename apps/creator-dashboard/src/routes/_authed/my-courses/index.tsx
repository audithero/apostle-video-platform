import { useState, useMemo, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  Award,
  Bell,
  BookOpen,
  Clock,
  Download,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  PlayCircle,
  Search,
  Share2,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc/react";

export const Route = createFileRoute("/_authed/my-courses/")({
  component: MyCoursesPage,
});

// -- Types -------------------------------------------------------------------

type FilterTab = "all" | "in-progress" | "completed";

interface EnrolledCourse {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly slug: string;
  readonly thumbnailUrl: string | null;
  readonly creatorName: string;
  readonly creatorAvatarUrl: string | null;
  readonly progressPercent: number;
  readonly totalLessons: number;
  readonly completedLessons: number;
  readonly lastAccessedAt: Date;
  readonly enrolledAt: Date;
  readonly completedAt: Date | null;
  readonly certificateSerial?: string | null;
  readonly certificatePdfUrl?: string | null;
}

// -- Helpers -----------------------------------------------------------------

const initials = (name: string): string =>
  name
    .split(" ")
    .map((part) => part.at(0) ?? "")
    .join("")
    .toUpperCase();

const matchesFilter = (course: EnrolledCourse, filter: FilterTab): boolean => {
  if (filter === "completed") return course.progressPercent === 100;
  if (filter === "in-progress")
    return course.progressPercent > 0 && course.progressPercent < 100;
  return true;
};

// -- Page component ----------------------------------------------------------

function MyCoursesPage() {
  const trpc = useTRPC();
  const { data: enrollments, isLoading, isError } = useQuery(
    trpc.enrollments.myEnrollments.queryOptions(),
  );

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const courses: ReadonlyArray<EnrolledCourse> = useMemo(
    () => (enrollments ?? []) as ReadonlyArray<EnrolledCourse>,
    [enrollments],
  );

  const filteredCourses = useMemo(() => {
    let results = courses.filter((course) =>
      matchesFilter(course, activeTab),
    );

    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      results = results.filter(
        (course) =>
          course.title.toLowerCase().includes(query) ||
          course.creatorName.toLowerCase().includes(query),
      );
    }

    return results;
  }, [courses, activeTab, searchQuery]);

  const counts = useMemo(
    () => ({
      all: courses.length,
      inProgress: courses.filter(
        (c) => c.progressPercent > 0 && c.progressPercent < 100,
      ).length,
      completed: courses.filter((c) => c.progressPercent === 100).length,
    }),
    [courses],
  );

  const completedCourses = useMemo(
    () => courses.filter((c) => c.progressPercent === 100),
    [courses],
  );

  const inProgressCourses = useMemo(
    () =>
      courses
        .filter((c) => c.progressPercent > 0 && c.progressPercent < 100)
        .sort((a, b) => {
          const aTime = new Date(a.lastAccessedAt).getTime();
          const bTime = new Date(b.lastAccessedAt).getTime();
          return bTime - aTime;
        })
        .slice(0, 3),
    [courses],
  );

  return (
    <div className="container py-12">
      {/* Header with notification bell */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground">
            Continue learning where you left off.
          </p>
        </div>
        <NotificationBell />
      </div>

      {/* Continue Learning Section */}
      {inProgressCourses.length > 0 && (
        <section className="mt-8" aria-label="Continue learning">
          <h2 className="text-lg font-semibold">Continue Learning</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.map((course) => (
              <ContinueLearningCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        </section>
      )}

      {/* Completed courses with certificates */}
      {completedCourses.length > 0 && (
        <section className="mt-10" aria-label="Completed courses with certificates">
          <h2 className="text-lg font-semibold">
            <Trophy className="mr-2 inline-block size-5 text-amber-500" />
            Certificates Earned
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <CertificateCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-10" />

      {/* Community Activity Feed */}
      <CommunityActivitySection />

      <Separator className="my-10" />

      {/* Search + Filter controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as FilterTab)}
        >
          <TabsList>
            <TabsTrigger value="all">
              {`All (${String(counts.all)})`}
            </TabsTrigger>
            <TabsTrigger value="in-progress">
              {`In Progress (${String(counts.inProgress)})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              {`Completed (${String(counts.completed)})`}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <label className="sr-only" htmlFor="course-search">
            Search courses
          </label>
          <Input
            id="course-search"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {isError ? (
        <div className="mt-16 text-center">
          <AlertCircle className="mx-auto size-16 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">
            We could not load your courses. Please try refreshing the page.
          </p>
        </div>
      ) : isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardContent className="pt-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-4 h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState variant="no-enrollments" />
      ) : (
        <EmptyState variant="no-results" />
      )}
    </div>
  );
}

// -- Notification Bell -------------------------------------------------------

function NotificationBell() {
  const trpc = useTRPC();
  const { data: recentActivity } = useQuery(
    trpc.enrollments.recentlyAccessed.queryOptions(),
  );

  // Use recently accessed as a proxy for activity notifications
  const notificationCount = recentActivity?.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="relative shrink-0"
          aria-label={`Notifications${notificationCount > 0 ? `, ${String(notificationCount)} new` : ""}`}
        >
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {notificationCount > 9 ? "9+" : String(notificationCount)}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
        </div>
        <ScrollArea className="max-h-72">
          {recentActivity && recentActivity.length > 0 ? (
            <div className="divide-y">
              {recentActivity.map((item) => (
                <Link
                  key={item.lessonId}
                  to="/learn/$courseId"
                  params={{ courseId: item.courseId }}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <PlayCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.courseTitle}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.lastAccessedAt
                        ? `Accessed ${formatDistanceToNow(new Date(item.lastAccessedAt), { addSuffix: true })}`
                        : "Recently accessed"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center">
              <Bell className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

// -- Continue Learning Card --------------------------------------------------

function ContinueLearningCard({ course }: { readonly course: EnrolledCourse }) {
  return (
    <Link
      to="/learn/$courseId"
      params={{ courseId: course.courseId }}
      className="group block"
    >
      <Card className="overflow-hidden border-primary/20 transition-all hover:border-primary/40 hover:shadow-md">
        <div className="flex items-center gap-4 p-4">
          {/* Thumbnail */}
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="size-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
              <BookOpen className="size-6 text-muted-foreground" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold group-hover:underline">
              {course.title}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {`${String(course.completedLessons)} / ${String(course.totalLessons)} lessons`}
            </p>
            <Progress
              value={course.progressPercent}
              className="mt-2 h-1.5"
              aria-label={`${course.title}: ${String(course.progressPercent)}% complete`}
            />
          </div>

          <PlayCircle className="size-8 shrink-0 text-primary opacity-60 transition-opacity group-hover:opacity-100" />
        </div>
      </Card>
    </Link>
  );
}

// -- Certificate Card --------------------------------------------------------

function CertificateCard({ course }: { readonly course: EnrolledCourse }) {
  const trpc = useTRPC();
  const generateMutation = useMutation(
    trpc.certificates.generate.mutationOptions({
      onSuccess: (data) => {
        if (data?.url) {
          toast.success("Certificate generated!");
        }
      },
      onError: () => {
        toast.error("Failed to generate certificate");
      },
    }),
  );

  const hasCertificate = Boolean(course.certificatePdfUrl);
  const completedDate = course.completedAt ? new Date(course.completedAt) : null;

  const handleGenerateCertificate = useCallback(() => {
    generateMutation.mutate({ enrollmentId: course.id });
  }, [generateMutation, course.id]);

  const handleShareLinkedIn = useCallback(() => {
    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.set("name", course.title);
    if (completedDate) {
      linkedInUrl.searchParams.set("issueYear", String(completedDate.getFullYear()));
      linkedInUrl.searchParams.set("issueMonth", String(completedDate.getMonth() + 1));
    }
    if (course.certificateSerial) {
      linkedInUrl.searchParams.set("certId", course.certificateSerial);
    }
    window.open(linkedInUrl.toString(), "_blank", "noopener,noreferrer");
  }, [course.title, completedDate, course.certificateSerial]);

  const handleShareX = useCallback(() => {
    const text = `I just completed "${course.title}"! ${course.certificateSerial ? `Certificate: ${course.certificateSerial}` : ""}`;
    const twitterUrl = new URL("https://x.com/intent/tweet");
    twitterUrl.searchParams.set("text", text);
    window.open(twitterUrl.toString(), "_blank", "noopener,noreferrer");
  }, [course.title, course.certificateSerial]);

  return (
    <Card className="overflow-hidden border-amber-200 dark:border-amber-800">
      <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 pb-3 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-amber-600 dark:text-amber-400" />
          <CardTitle className="text-sm">{course.title}</CardTitle>
        </div>
        {completedDate && (
          <CardDescription className="text-xs">
            {`Completed ${formatDistanceToNow(completedDate, { addSuffix: true })}`}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="pt-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="size-3.5 text-amber-500" />
          <span>{`${String(course.totalLessons)} lessons completed`}</span>
        </div>
        {course.certificateSerial && (
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {course.certificateSerial}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex-wrap gap-2 pt-0">
        {hasCertificate ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="h-7 text-xs"
            >
              <a
                href={course.certificatePdfUrl ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Download certificate for ${course.title}`}
              >
                <Download className="size-3" />
                Download
              </a>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleShareLinkedIn}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleShareLinkedIn();
                }
              }}
              aria-label="Add to LinkedIn profile"
            >
              <ExternalLink className="size-3" />
              LinkedIn
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={handleShareX}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleShareX();
                }
              }}
              aria-label="Share on X"
            >
              <Share2 className="size-3" />
              Share
            </Button>
          </>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={handleGenerateCertificate}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleGenerateCertificate();
              }
            }}
            disabled={generateMutation.isPending}
            aria-label={`Generate certificate for ${course.title}`}
          >
            <Award className="size-3" />
            {generateMutation.isPending ? "Generating..." : "Get Certificate"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// -- Community Activity Section ----------------------------------------------

function CommunityActivitySection() {
  // We show a placeholder section that links to community.
  // The community posts router requires a channelId which we don't have
  // at the dashboard level, so we show a summary view.

  return (
    <section aria-label="Community activity">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Community Activity</h2>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <CommunityPlaceholderCard
          title="Join the Discussion"
          description="Connect with fellow students, ask questions, and share your progress."
          icon={<MessageSquare className="size-6 text-primary" />}
        />
        <CommunityPlaceholderCard
          title="Share Your Wins"
          description="Completed a milestone? Share your achievement and inspire others."
          icon={<Trophy className="size-6 text-amber-500" />}
        />
        <CommunityPlaceholderCard
          title="Get Help"
          description="Stuck on a lesson? Get help from instructors and peers in course communities."
          icon={<BookOpen className="size-6 text-blue-500" />}
        />
      </div>
    </section>
  );
}

function CommunityPlaceholderCard({
  title,
  description,
  icon,
}: {
  readonly title: string;
  readonly description: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <Card className="transition-colors hover:bg-muted/30">
      <CardContent className="flex items-start gap-3 pt-5">
        <div className="shrink-0 rounded-lg bg-muted p-2.5">{icon}</div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// -- CourseCard ---------------------------------------------------------------

function CourseCard({ course }: { readonly course: EnrolledCourse }) {
  const isComplete = course.progressPercent === 100;
  const lastAccessed = new Date(course.lastAccessedAt);

  return (
    <Link
      to="/learn/$courseId"
      params={{ courseId: course.courseId }}
      className="group block"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {/* Thumbnail */}
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="aspect-video w-full object-cover"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-muted">
            <BookOpen className="size-12 text-muted-foreground" />
          </div>
        )}

        <CardContent className="pt-4">
          {/* Title + Badge */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold leading-snug line-clamp-2 group-hover:underline">
              {course.title}
            </h3>
            {isComplete && (
              <Badge variant="secondary" className="shrink-0">
                <Trophy className="mr-1 size-3" />
                Done
              </Badge>
            )}
          </div>

          {/* Creator */}
          <div className="mt-3 flex items-center gap-2">
            <Avatar className="size-5">
              {course.creatorAvatarUrl ? (
                <AvatarImage
                  src={course.creatorAvatarUrl}
                  alt={`${course.creatorName} avatar`}
                />
              ) : null}
              <AvatarFallback className="text-[10px]">
                {initials(course.creatorName)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {course.creatorName}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {`${String(course.completedLessons)} / ${String(course.totalLessons)} lessons`}
              </span>
              <span>{`${String(course.progressPercent)}%`}</span>
            </div>
            <Progress
              value={course.progressPercent}
              className="mt-1 h-2"
              aria-label={`${course.title}: ${String(course.progressPercent)}% complete`}
            />
          </div>
        </CardContent>

        <CardFooter className="pt-0 text-xs text-muted-foreground">
          <Clock className="mr-1 size-3" />
          <time dateTime={lastAccessed.toISOString()}>
            {`Last accessed ${formatDistanceToNow(lastAccessed, { addSuffix: true })}`}
          </time>
        </CardFooter>
      </Card>
    </Link>
  );
}

// -- Empty States ------------------------------------------------------------

function EmptyState({
  variant,
}: {
  readonly variant: "no-enrollments" | "no-results";
}) {
  if (variant === "no-results") {
    return (
      <div className="mt-16 text-center">
        <Search className="mx-auto size-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Matching Courses</h2>
        <p className="mt-2 text-muted-foreground">
          Try adjusting your search or filter to find your courses.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 text-center">
      <GraduationCap className="mx-auto size-16 text-muted-foreground" />
      <h2 className="mt-4 text-xl font-semibold">No Courses Yet</h2>
      <p className="mt-2 text-muted-foreground">
        Enroll in a course to start learning.
      </p>
      <Button className="mt-6" type="button" asChild>
        <Link to="/">Browse Courses</Link>
      </Button>
    </div>
  );
}
