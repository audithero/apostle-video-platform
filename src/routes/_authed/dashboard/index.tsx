import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { formatDistanceToNow } from "date-fns";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BookPlus,
  Clock,
  DollarSign,
  Mail,
  Send,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authed/dashboard/")({
  component: CreatorDashboard,
});

// ── Helpers ─────────────────────────────────────────────────────────────

function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 120);
}

function usageColor(percent: number): string {
  if (percent > 100) return "bg-red-500";
  if (percent > 80) return "bg-orange-500";
  if (percent >= 60) return "bg-yellow-500";
  return "bg-green-500";
}

// ── Main component ──────────────────────────────────────────────────────

function CreatorDashboard() {
  const trpc = useTRPC();

  const { data: overview, isLoading: overviewLoading } = useQuery(
    trpc.analytics.overview.queryOptions(),
  );
  const { data: revenue, isLoading: revenueLoading } = useQuery(
    trpc.analytics.revenueOverview.queryOptions(),
  );
  const { data: activeStudentsData } = useQuery(
    trpc.analytics.activeStudents.queryOptions({ days: 30 }),
  );
  const { data: recentActivity, isLoading: activityLoading } = useQuery(
    trpc.analytics.recentActivity.queryOptions({ limit: 20 }),
  );
  const { data: revenueTrend } = useQuery(
    trpc.analytics.revenueTrend.queryOptions({ days: 7 }),
  );
  const { data: enrollmentTrend } = useQuery(
    trpc.analytics.enrollmentTrend.queryOptions({ days: 7 }),
  );
  const { data: usageData, isLoading: usageLoading } = useQuery(
    trpc.analytics.currentUsage.queryOptions(),
  );

  const isLoading = overviewLoading || revenueLoading;

  // Build sparkline data from trends
  const sparklineData = (revenueTrend ?? []).map((d) => ({ value: d.revenue }));
  const enrollmentSparkline = (enrollmentTrend ?? []).map((d) => ({ value: d.count }));

  // Revenue display
  const revenueAmountCents = revenue?.totalRevenueCents ?? 0;
  const revenueAmount = Math.round(revenueAmountCents / 100);
  const revenueTrendPct = revenue?.revenueChangePct ?? 0;
  const revenueTrendPositive = revenueTrendPct >= 0;

  // Usage data
  const videoUsed = usageData?.metrics.videoStorageHours ?? 0;
  const videoLimit = usageData?.limits.videoStorageHours ?? 20;
  const studentsUsed = usageData?.metrics.activeStudents ?? 0;
  const studentsLimit = usageData?.limits.students ?? 500;
  const emailsUsed = usageData?.metrics.emailsSent ?? 0;
  const emailsLimit = usageData?.limits.emails ?? 5_000;

  const showUpgrade =
    usagePercent(videoUsed, videoLimit) > 80 ||
    usagePercent(studentsUsed, studentsLimit) > 80 ||
    usagePercent(emailsUsed, emailsLimit) > 80;

  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">
        Welcome back. Here is an overview of your creator account.
      </p>

      {/* ── Metric Cards ───────────────────────────────────────────── */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="size-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            {/* Revenue */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-2xl font-bold">
                      {`$${revenueAmount.toLocaleString()}`}
                    </p>
                    {revenueTrendPct !== 0 && (
                      <p className={`mt-1 flex items-center gap-1 text-xs ${revenueTrendPositive ? "text-emerald-600" : "text-red-500"}`}>
                        {revenueTrendPositive
                          ? <TrendingUp className="size-3" />
                          : <TrendingDown className="size-3" />}
                        {`${revenueTrendPositive ? "+" : ""}${String(revenueTrendPct)}% from last period`}
                      </p>
                    )}
                  </div>
                  {sparklineData.length > 1 && (
                    <div className="ml-auto h-10 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                          <defs>
                            <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis domain={["dataMin - 200", "dataMax + 200"]} hide />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--color-primary)"
                            strokeWidth={1.5}
                            fill="url(#sparkFill)"
                            dot={false}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrollments */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
                <BookOpen className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-2xl font-bold">{overview?.totalEnrollments ?? 0}</p>
                    {(overview?.monthlyEnrollments ?? 0) > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-emerald-600">
                        <ArrowUpRight className="size-3" />
                        {`+${String(overview?.monthlyEnrollments ?? 0)} this month`}
                      </p>
                    )}
                  </div>
                  {enrollmentSparkline.length > 1 && (
                    <div className="ml-auto h-10 w-20">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={enrollmentSparkline}>
                          <defs>
                            <linearGradient id="enrollSparkFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <YAxis domain={["dataMin", "dataMax + 1"]} hide />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="var(--color-primary)"
                            strokeWidth={1.5}
                            fill="url(#enrollSparkFill)"
                            dot={false}
                            isAnimationActive={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Active Students */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                <Users className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activeStudentsData?.activeStudents ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Active within 30 days
                </p>
              </CardContent>
            </Card>

            {/* Courses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Courses</CardTitle>
                <BookPlus className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{overview?.totalCourses ?? 0}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Published
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Usage Meters & Quick Actions ─────────────────────────── */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Usage Meters */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Usage</CardTitle>
              {showUpgrade && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <Link to="/account" aria-label="Upgrade your plan">
                    Upgrade
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {usageLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : (
              <>
                <UsageMeter
                  label="Video Storage"
                  used={Math.round(videoUsed * 10) / 10}
                  limit={videoLimit}
                  unit="hrs"
                />
                <UsageMeter
                  label="Students"
                  used={studentsUsed}
                  limit={studentsLimit}
                  unit=""
                />
                <UsageMeter
                  label="Emails"
                  used={emailsUsed}
                  limit={emailsLimit}
                  unit=""
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/dashboard/courses/ai-wizard" aria-label="Create a new course">
                <BookPlus className="size-4" />
                Create Course
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/dashboard/emails" aria-label="Send an email to students">
                <Send className="size-4" />
                Send Email
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              asChild
            >
              <Link to="/dashboard/usage" aria-label="View usage details">
                <BarChart3 className="size-4" />
                View Usage
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ──────────────────────────────────────── */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent activity to show.
            </p>
          ) : (
            <ul className="space-y-0" aria-label="Recent activity feed">
              {recentActivity.map((item, idx) => (
                <li key={`${item.type}-${String(idx)}`}>
                  {idx > 0 && <Separator className="my-3" />}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <ActivityIcon kind={item.type} />
                      <div className="space-y-1">
                        <p className="text-sm leading-snug">{item.message}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Enrollment
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <time
                      dateTime={new Date(item.createdAt).toISOString()}
                      className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground"
                    >
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </time>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

interface UsageMeterProps {
  label: string;
  used: number;
  limit: number;
  unit: string;
}

function UsageMeter({ label, used, limit, unit }: UsageMeterProps) {
  const percent = usagePercent(used, limit);
  const clampedPercent = Math.min(percent, 100);
  const colorClass = usageColor(percent);

  const formattedUsed = used.toLocaleString();
  const formattedLimit = limit.toLocaleString();
  const suffix = unit ? ` ${unit}` : "";

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {`${formattedUsed}${suffix} / ${formattedLimit}${suffix}`}
        </span>
      </div>
      <div className="relative mt-2">
        <Progress
          value={clampedPercent}
          className="h-3"
          aria-label={`${label}: ${formattedUsed} of ${formattedLimit}${suffix} used`}
        />
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${colorClass} transition-all`}
          style={{ width: `${String(clampedPercent)}%` }}
        />
      </div>
      {percent > 80 && (
        <p className="mt-1 text-xs text-orange-600">
          {percent >= 100
            ? "Limit reached -- consider upgrading your plan"
            : "Approaching limit"}
        </p>
      )}
    </div>
  );
}

function ActivityIcon({ kind }: { kind: string }) {
  const baseClasses = "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full";

  switch (kind) {
    case "enrollment":
      return (
        <span className={`${baseClasses} bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400`}>
          <BookOpen className="size-4" />
        </span>
      );
    case "payment":
      return (
        <span className={`${baseClasses} bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400`}>
          <DollarSign className="size-4" />
        </span>
      );
    case "published":
      return (
        <span className={`${baseClasses} bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400`}>
          <BookPlus className="size-4" />
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400`}>
          <Mail className="size-4" />
        </span>
      );
  }
}
