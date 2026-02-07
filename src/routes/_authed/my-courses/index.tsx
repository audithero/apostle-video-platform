import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  AlertCircle,
  BookOpen,
  Clock,
  GraduationCap,
  Search,
  Trophy,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  return (
    <div className="container py-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground">
          Continue learning where you left off.
        </p>
      </div>

      {/* Search + Filter controls */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
