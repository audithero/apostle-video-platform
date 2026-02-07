import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Trash2,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTRPC } from "@/lib/trpc/react";

export const Route = createFileRoute("/_authed/dashboard/students/$studentId")({
  component: StudentDetail,
});

function StudentDetail() {
  const { studentId } = Route.useParams();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    trpc.enrollments.getStudentDetail.queryOptions({ studentId }),
  );

  const revokeEnrollment = useMutation(
    trpc.enrollments.revokeEnrollment.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.enrollments.getStudentDetail.queryKey({ studentId }) });
      },
    }),
  );

  if (isLoading) {
    return <StudentDetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg text-muted-foreground">Student not found</p>
        <Button type="button" variant="outline" className="mt-4" asChild>
          <Link to="/dashboard/students">Back to Students</Link>
        </Button>
      </div>
    );
  }

  const { student, enrollments } = data;
  const totalCourses = enrollments.length;
  const completedCourses = enrollments.filter((e) => e.completedAt).length;
  const totalLessonsCompleted = enrollments.reduce((sum, e) => sum + e.completedLessons, 0);
  const totalQuizAttempts = enrollments.reduce((sum, e) => sum + e.quizAttempts.length, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link to="/dashboard/students">
            <ArrowLeft className="mr-1 size-4" />
            Back
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <Avatar className="size-16">
          {student.image ? <AvatarImage src={student.image} /> : null}
          <AvatarFallback className="text-lg">
            {student.name
              .split(" ")
              .map((n) => n.at(0))
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{student.name}</h1>
          <p className="text-muted-foreground">{student.email}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Member since {format(new Date(student.createdAt), "MMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalCourses}</p>
            </div>
            <p className="text-sm text-muted-foreground">Enrolled Courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500" />
              <p className="text-2xl font-bold">{completedCourses}</p>
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{totalLessonsCompleted}</p>
            <p className="text-sm text-muted-foreground">Lessons Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{totalQuizAttempts}</p>
            <p className="text-sm text-muted-foreground">Quiz Attempts</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment details */}
      <h2 className="mt-8 text-xl font-semibold">Course Enrollments</h2>

      <div className="mt-4 space-y-4">
        {enrollments.map((enroll) => (
          <Card key={enroll.enrollmentId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{enroll.courseTitle}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enrolled {format(new Date(enroll.enrolledAt), "MMM d, yyyy")}
                    {enroll.source !== "direct" ? ` via ${enroll.source}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {enroll.completedAt ? (
                    <Badge variant="secondary">
                      <CheckCircle2 className="mr-1 size-3" />
                      Completed
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Clock className="mr-1 size-3" />
                      In Progress
                    </Badge>
                  )}

                  {enroll.certificateSerial ? (
                    <Badge variant="secondary">
                      <Award className="mr-1 size-3" />
                      Certified
                    </Badge>
                  ) : null}

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Enrollment</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove the student&apos;s access to{" "}
                          <strong>{enroll.courseTitle}</strong> and delete all their
                          progress data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => revokeEnrollment.mutate({ enrollmentId: enroll.enrollmentId })}
                        >
                          Revoke Access
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {String(enroll.completedLessons)} / {String(enroll.totalLessonsInCourse)} lessons
                  </span>
                  <span className="font-medium">{enroll.progressPercent}%</span>
                </div>
                <Progress value={enroll.progressPercent} className="h-2" />
              </div>

              {/* Quiz attempts */}
              {enroll.quizAttempts.length > 0 ? (
                <>
                  <Separator className="my-3" />
                  <p className="mb-2 text-sm font-medium">Quiz Results</p>
                  <div className="space-y-2">
                    {enroll.quizAttempts.map((attempt) => (
                      <div
                        key={`${attempt.quizId}-${attempt.completedAt ? new Date(attempt.completedAt).getTime() : "pending"}`}
                        className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2 text-sm"
                      >
                        <span>{attempt.quizTitle}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {attempt.scorePercent !== null ? `${String(Math.round(attempt.scorePercent))}%` : "N/A"}
                          </span>
                          {attempt.passed ? (
                            <CheckCircle2 className="size-4 text-green-500" />
                          ) : (
                            <XCircle className="size-4 text-red-500" />
                          )}
                          {attempt.completedAt ? (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(attempt.completedAt), { addSuffix: true })}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </CardContent>
          </Card>
        ))}

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No enrollments found</p>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function StudentDetailSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-24" />
      <div className="mt-4 flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-36" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`stat-${String(i)}`}>
            <CardContent className="pt-6">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="mt-8 h-6 w-40" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={`enroll-${String(i)}`}>
            <CardContent className="pt-6">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-72" />
              <Skeleton className="mt-4 h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
