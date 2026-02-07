import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreHorizontal, Copy, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { toast } from "sonner";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/dashboard/courses/")({
  component: CoursesListPage,
  errorComponent: RouteErrorBoundary,
});

type CourseStatus = "draft" | "published" | "archived";

const statusConfig: Record<
  CourseStatus,
  { readonly label: string; readonly variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "Draft", variant: "secondary" },
  published: { label: "Published", variant: "default" },
  archived: { label: "Archived", variant: "outline" },
};

function CourseCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

interface CourseCardProps {
  readonly course: {
    readonly id: string;
    readonly title: string;
    readonly description: string | null;
    readonly status: CourseStatus;
    readonly priceType: string;
    readonly priceCents: number | null;
    readonly enrollmentCount: number;
    readonly createdAt: Date;
  };
  readonly onDuplicate: (id: string) => void;
  readonly onDelete: (id: string) => void;
  readonly isDuplicating: boolean;
  readonly isDeleting: boolean;
}

function CourseCard({
  course,
  onDuplicate,
  onDelete,
  isDuplicating,
  isDeleting,
}: CourseCardProps) {
  const config = statusConfig[course.status];
  const priceLabel =
    course.priceType === "free"
      ? "Free"
      : course.priceType === "subscription_only"
        ? "Subscription"
        : `$${((course.priceCents ?? 0) / 100).toFixed(2)}`;

  const handleDuplicate = useCallback(() => {
    onDuplicate(course.id);
  }, [onDuplicate, course.id]);

  const handleDelete = useCallback(() => {
    onDelete(course.id);
  }, [onDelete, course.id]);

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              <Link
                to="/dashboard/courses/$id/edit"
                params={{ id: course.id }}
                className="hover:underline focus:underline focus:outline-none"
              >
                {course.title}
              </Link>
            </CardTitle>
            <CardDescription className="mt-1 text-xs">
              {course.enrollmentCount} enrolled
            </CardDescription>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={config.variant}>{config.label}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Actions for ${course.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={handleDuplicate}
                  disabled={isDuplicating}
                >
                  <Copy className="size-4" />
                  {isDuplicating ? "Duplicating..." : "Duplicate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                  {isDeleting ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {course.description ?? "No description yet"}
        </p>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span>{priceLabel}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={new Date(course.createdAt).toISOString()}>
            {new Date(course.createdAt).toLocaleDateString()}
          </time>
        </div>
      </CardContent>
    </Card>
  );
}

function CreateCourseDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [courseType, setCourseType] = useState("self_paced");
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const createMutation = useMutation(
    trpc.courses.create.mutationOptions({
      onSuccess: () => {
        toast.success("Course created successfully");
        setTitle("");
        setCourseType("self_paced");
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: trpc.courses.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to create course");
      },
    }),
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim().length === 0) return;
      createMutation.mutate({
        title: title.trim(),
        courseType: courseType as "self_paced" | "drip" | "cohort",
      });
    },
    [title, courseType, createMutation],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <Plus className="size-4" />
          New Course
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Start building a new course. You can configure all the details later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="course-title">Course Title</Label>
            <Input
              id="course-title"
              placeholder="e.g., Introduction to Web Development"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={1}
              maxLength={200}
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="course-type">Course Type</Label>
            <Select value={courseType} onValueChange={setCourseType}>
              <SelectTrigger id="course-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="self_paced">Self-Paced</SelectItem>
                <SelectItem value="drip">Drip Schedule</SelectItem>
                <SelectItem value="cohort">Cohort-Based</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createMutation.isPending || title.trim().length === 0}
            >
              {createMutation.isPending ? "Creating..." : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CoursesListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  const coursesQuery = useQuery(
    trpc.courses.list.queryOptions({
      status:
        statusFilter === "all"
          ? undefined
          : (statusFilter as "draft" | "published" | "archived"),
      search: search.length > 0 ? search : undefined,
    }),
  );

  const duplicateMutation = useMutation(
    trpc.courses.duplicate.mutationOptions({
      onSuccess: () => {
        toast.success("Course duplicated");
        queryClient.invalidateQueries({ queryKey: trpc.courses.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to duplicate course");
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.courses.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Course deleted");
        queryClient.invalidateQueries({ queryKey: trpc.courses.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to delete course");
      },
    }),
  );

  const handleDuplicate = useCallback(
    (id: string) => {
      duplicateMutation.mutate({ id });
    },
    [duplicateMutation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteMutation.mutate({ id });
    },
    [deleteMutation],
  );

  const courses = coursesQuery.data?.courses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your online courses
          </p>
        </div>
        <CreateCourseDialog />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search courses"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]" aria-label="Filter by status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {coursesQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <CourseCard
              key={c.id}
              course={c}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              isDuplicating={
                duplicateMutation.isPending &&
                duplicateMutation.variables?.id === c.id
              }
              isDeleting={
                deleteMutation.isPending &&
                deleteMutation.variables?.id === c.id
              }
            />
          ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-16">
          <BookOpen className="size-12 text-muted-foreground/50" />
          <CardHeader className="text-center">
            <CardTitle>No courses yet</CardTitle>
            <CardDescription>
              Create your first course and start sharing your knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCourseDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
