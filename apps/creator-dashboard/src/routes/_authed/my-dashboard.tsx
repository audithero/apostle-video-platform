import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Clock,
  Download,
  GraduationCap,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/my-dashboard")({
  component: StudentDashboardPage,
  errorComponent: RouteErrorBoundary,
});

function StudentDashboardPage() {
  const trpc = useTRPC();

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery(
    trpc.enrollments.myEnrollments.queryOptions(),
  );

  const { data: recentlyAccessed, isLoading: isLoadingRecent } = useQuery(
    trpc.enrollments.recentlyAccessed.queryOptions(),
  );

  const inProgressCourses = useMemo(
    () =>
      (enrollments ?? []).filter(
        (e) => e.progressPercent > 0 && e.progressPercent < 100,
      ),
    [enrollments],
  );

  const completedCourses = useMemo(
    () => (enrollments ?? []).filter((e) => e.progressPercent === 100),
    [enrollments],
  );

  const coursesWithCertificates = useMemo(
    () =>
      (enrollments ?? []).filter(
        (e) => e.completedAt !== null && e.completedAt !== undefined,
      ),
    [enrollments],
  );

  if (isLoadingEnrollments) {
    return <DashboardSkeleton />;
  }

  if (!enrollments || enrollments.length === 0) {
    return <EmptyDashboard />;
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-muted-foreground">
          Track your learning progress across all courses.
        </p>
      </div>

      {/* Stats overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatsCard
          label="Enrolled Courses"
          value={enrollments.length}
          icon={BookOpen}
        />
        <StatsCard
          label="In Progress"
          value={inProgressCourses.length}
          icon={Clock}
        />
        <StatsCard
          label="Completed"
          value={completedCourses.length}
          icon={Trophy}
        />
      </div>

      {/* My Courses - in progress first */}
      {inProgressCourses.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Continue Learning</h2>
            <Button type="button" variant="ghost" size="sm" asChild>
              <Link to="/my-courses">View all</Link>
            </Button>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {inProgressCourses.slice(0, 6).map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* Recently Accessed Lessons */}
      {!isLoadingRecent && recentlyAccessed && recentlyAccessed.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Recently Accessed</h2>
          <div className="mt-4 space-y-2">
            {recentlyAccessed.map((item, idx) => (
              <Link
                key={`${item.courseId}-${item.lessonId}-${String(idx)}`}
                to="/learn/$courseId"
                params={{ courseId: item.courseId }}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.courseTitle}</p>
                  </div>
                </div>
                {item.lastAccessedAt && (
                  <time
                    dateTime={new Date(item.lastAccessedAt).toISOString()}
                    className="text-xs text-muted-foreground"
                  >
                    {formatDistanceToNow(new Date(item.lastAccessedAt), {
                      addSuffix: true,
                    })}
                  </time>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Completed Courses & Certificates */}
      {completedCourses.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Completed Courses</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {completedCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                {course.thumbnailUrl ? (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full items-center justify-center bg-muted">
                    <Trophy className="size-12 text-amber-500" />
                  </div>
                )}
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold leading-snug line-clamp-2">
                      {course.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className="shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200"
                    >
                      <Trophy className="mr-1 size-3" />
                      Done
                    </Badge>
                  </div>
                  {course.creatorName && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {course.creatorName}
                    </p>
                  )}
                </CardContent>
                {coursesWithCertificates.some((c) => c.id === course.id) && (
                  <CardFooter className="pt-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Download className="mr-1.5 size-4" />
                      Download Certificate
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -- Stats Card ---------------------------------------------------------------

function StatsCard({
  label,
  value,
  icon: Icon,
}: {
  readonly label: string;
  readonly value: number;
  readonly icon: typeof BookOpen;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{String(value)}</p>
      </CardContent>
    </Card>
  );
}

// -- Course Progress Card -----------------------------------------------------

interface CourseEnrollment {
  readonly id: string;
  readonly courseId: string;
  readonly title: string;
  readonly slug: string;
  readonly thumbnailUrl: string | null;
  readonly creatorName: string | null;
  readonly progressPercent: number;
  readonly totalLessons: number;
  readonly completedLessons: number;
  readonly lastAccessedAt: Date;
  readonly enrolledAt: Date;
}

function CourseProgressCard({ course }: { readonly course: CourseEnrollment }) {
  return (
    <Link
      to="/learn/$courseId"
      params={{ courseId: course.courseId }}
      className="group block"
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
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
          <h3 className="font-semibold leading-snug line-clamp-2 group-hover:underline">
            {course.title}
          </h3>
          {course.creatorName && (
            <p className="mt-1 text-sm text-muted-foreground">
              {course.creatorName}
            </p>
          )}
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
        <CardFooter className="pt-0">
          <Button type="button" size="sm" className="w-full">
            Continue Learning
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

// -- Skeleton -----------------------------------------------------------------

function DashboardSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="mt-2 h-5 w-72" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-9 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="my-8" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
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
    </div>
  );
}

// -- Empty State --------------------------------------------------------------

function EmptyDashboard() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">My Dashboard</h1>

      <div className="mt-16 text-center">
        <GraduationCap className="mx-auto size-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">No Courses Yet</h2>
        <p className="mt-2 text-muted-foreground">
          Enroll in a course to start your learning journey.
        </p>
        <Button className="mt-6" type="button" asChild>
          <Link to="/">Browse Courses</Link>
        </Button>
      </div>
    </div>
  );
}
