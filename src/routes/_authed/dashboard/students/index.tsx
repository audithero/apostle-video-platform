import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Download,
  Mail,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";

export const Route = createFileRoute("/_authed/dashboard/students/")({
  component: StudentManagement,
});

const PAGE_SIZE = 25;

function StudentManagement() {
  const trpc = useTRPC();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "completed" | "inactive">("all");
  const [page, setPage] = useState(0);

  // Debounce search input
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 300);
    setSearchTimeout(timeout);
  };

  // Fetch students
  const { data: studentsData, isLoading: studentsLoading } = useQuery(
    trpc.enrollments.listAllStudents.queryOptions({
      search: debouncedSearch || undefined,
      courseId: courseFilter !== "all" ? courseFilter : undefined,
      status: statusFilter,
      limit: PAGE_SIZE,
      offset: page * PAGE_SIZE,
    }),
  );

  // Fetch creator's courses for filter dropdown
  const { data: courses } = useQuery(
    trpc.enrollments.creatorCourses.queryOptions(),
  );

  const students = studentsData?.students ?? [];
  const totalStudents = studentsData?.total ?? 0;
  const totalPages = Math.ceil(totalStudents / PAGE_SIZE);

  // Stats
  const activeCount = students.filter((s) => s.status === "active").length;
  const completedCount = students.filter((s) => s.status === "completed").length;

  // CSV export
  const handleExportCsv = () => {
    if (students.length === 0) return;

    const headers = ["Name", "Email", "Enrolled Courses", "Completed Courses", "Status", "First Enrolled"];
    const rows = students.map((s) => [
      s.name,
      s.email,
      String(s.enrolledCourses),
      String(s.completedCourses),
      s.status,
      s.firstEnrolledAt ? new Date(s.firstEnrolledAt).toISOString().split("T").at(0) : "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Students</h1>
          <p className="mt-1 text-muted-foreground">
            {studentsLoading
              ? "Loading..."
              : `${String(totalStudents)} total students across all courses`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-lg" onClick={handleExportCsv} disabled={students.length === 0}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="gaspar-card-cream rounded-2xl p-6">
          {studentsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{totalStudents}</p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Total Students</p>
        </div>
        <div className="gaspar-card-blue rounded-2xl p-6">
          {studentsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{activeCount}</p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Active (30d)</p>
        </div>
        <div className="gaspar-card-pink rounded-2xl p-6">
          {studentsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">{completedCount}</p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Completed a Course</p>
        </div>
        <div className="rounded-2xl border border-border/50 bg-base-100 p-6">
          {studentsLoading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-3xl font-bold tracking-tight">
              {students.length > 0
                ? `${String(Math.round(students.reduce((sum, s) => sum + (s.totalLessons > 0 ? (s.completedLessons / s.totalLessons) * 100 : 0), 0) / students.length))}%`
                : "0%"}
            </p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Avg Progress</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="rounded-lg pl-10"
          />
        </div>
        <Select
          value={courseFilter}
          onValueChange={(v) => {
            setCourseFilter(v);
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Courses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as "all" | "active" | "completed" | "inactive");
            setPage(0);
          }}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="rounded-2xl border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Courses</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${String(i)}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-8 rounded-full" />
                        <div>
                          <Skeleton className="mb-1 h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-14" /></TableCell>
                    <TableCell><Skeleton className="size-8" /></TableCell>
                  </TableRow>
                ))
              ) : students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <Users className="mx-auto mb-4 size-12 text-muted-foreground/40" />
                    <p className="text-lg font-medium">No students found</p>
                    <p className="mt-1 text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const progressPercent =
                    student.totalLessons > 0
                      ? Math.round((student.completedLessons / student.totalLessons) * 100)
                      : 0;

                  return (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <Link
                          to="/dashboard/students/$studentId"
                          params={{ studentId: student.studentId }}
                          className="flex items-center gap-3 hover:opacity-80"
                        >
                          <Avatar className="size-8">
                            {student.image ? (
                              <AvatarImage src={student.image} />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {student.name
                                .split(" ")
                                .map((n) => n.at(0))
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.email}
                            </p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="size-3 text-muted-foreground" />
                          <span>
                            {`${String(student.completedCourses)}/${String(student.enrolledCourses)}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${String(progressPercent)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {progressPercent}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {student.lastAccessedAt
                          ? formatDistanceToNow(new Date(student.lastAccessedAt), {
                              addSuffix: true,
                            })
                          : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="rounded-full px-3"
                          variant={
                            student.status === "active"
                              ? "default"
                              : student.status === "completed"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" variant="ghost" size="sm">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                to="/dashboard/students/$studentId"
                                params={{ studentId: student.studentId }}
                              >
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 size-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {String(page * PAGE_SIZE + 1)}-
            {String(Math.min((page + 1) * PAGE_SIZE, totalStudents))} of{" "}
            {String(totalStudents)}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
