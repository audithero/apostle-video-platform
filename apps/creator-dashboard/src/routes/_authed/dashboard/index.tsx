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
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

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
  if (percent >= 60) return "bg-amber-400";
  return "bg-gaspar-purple";
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

  const sparklineData = (revenueTrend ?? []).map((d) => ({ value: d.revenue }));
  const enrollmentSparkline = (enrollmentTrend ?? []).map((d) => ({ value: d.count }));

  const revenueAmountCents = revenue?.totalRevenueCents ?? 0;
  const revenueAmount = Math.round(revenueAmountCents / 100);
  const revenueTrendPct = revenue?.revenueChangePct ?? 0;
  const revenueTrendPositive = revenueTrendPct >= 0;

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
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back. Here is an overview of your creator account.
        </p>
      </div>

      {/* ── Metric Cards ───────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-muted p-6">
              <Skeleton className="mb-4 h-4 w-24" />
              <Skeleton className="h-9 w-20" />
            </div>
          ))
        ) : (
          <>
            {/* Revenue - Cream */}
            <div className="gaspar-card-cream rounded-2xl p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Revenue</span>
                <DollarSign className="size-5 opacity-40" />
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div>
                  <p className="text-3xl font-bold tracking-tight">
                    {`$${revenueAmount.toLocaleString()}`}
                  </p>
                  {revenueTrendPct !== 0 && (
                    <p className={cn(
                      "mt-1.5 flex items-center gap-1 text-xs font-medium",
                      revenueTrendPositive ? "text-emerald-700" : "text-red-700",
                    )}>
                      {revenueTrendPositive
                        ? <TrendingUp className="size-3" />
                        : <TrendingDown className="size-3" />}
                      {`${revenueTrendPositive ? "+" : ""}${String(revenueTrendPct)}%`}
                    </p>
                  )}
                </div>
                {sparklineData.length > 1 && (
                  <div className="ml-auto h-10 w-20">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="oklch(0.35 0.03 75)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="oklch(0.35 0.03 75)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={["dataMin - 200", "dataMax + 200"]} hide />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="oklch(0.35 0.03 75)"
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
            </div>

            {/* Enrollments - Blue */}
            <div className="gaspar-card-blue rounded-2xl p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Enrollments</span>
                <BookOpen className="size-5 opacity-40" />
              </div>
              <div className="mt-4 flex items-end gap-3">
                <div>
                  <p className="text-3xl font-bold tracking-tight">{overview?.totalEnrollments ?? 0}</p>
                  {(overview?.monthlyEnrollments ?? 0) > 0 && (
                    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-700">
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
                            <stop offset="0%" stopColor="oklch(0.25 0.04 260)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="oklch(0.25 0.04 260)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <YAxis domain={["dataMin", "dataMax + 1"]} hide />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="oklch(0.25 0.04 260)"
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
            </div>

            {/* Active Students - Pink */}
            <div className="gaspar-card-pink rounded-2xl p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Active Students</span>
                <Users className="size-5 opacity-40" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight">{activeStudentsData?.activeStudents ?? 0}</p>
                <p className="mt-1.5 text-xs font-medium opacity-50">
                  Active within 30 days
                </p>
              </div>
            </div>

            {/* Courses - Navy */}
            <div className="gaspar-card-navy rounded-2xl p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-50">Courses</span>
                <BookPlus className="size-5 opacity-40" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold tracking-tight">{overview?.totalCourses ?? 0}</p>
                <p className="mt-1.5 text-xs font-medium opacity-50">
                  Published
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Usage Meters & Quick Actions ─────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Usage Meters */}
        <Card className="rounded-2xl border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Usage</CardTitle>
              {showUpgrade && (
                <Button
                  size="sm"
                  className="rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                  asChild
                >
                  <Link to="/account" aria-label="Upgrade your plan">
                    Upgrade Plan
                  </Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
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
        <Card className="rounded-2xl border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 pt-2">
            <Link
              to="/dashboard/courses/ai-wizard"
              aria-label="Create a new course"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gaspar-cream">
                <BookPlus className="size-4 text-foreground/70" />
              </span>
              <span className="flex-1">Create Course</span>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              to="/dashboard/emails"
              aria-label="Send an email to students"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gaspar-blue">
                <Send className="size-4 text-foreground/70" />
              </span>
              <span className="flex-1">Send Email</span>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
            <Link
              to="/dashboard/usage"
              aria-label="View usage details"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gaspar-pink">
                <BarChart3 className="size-4 text-foreground/70" />
              </span>
              <span className="flex-1">View Usage</span>
              <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Activity ──────────────────────────────────────── */}
      <Card className="rounded-2xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          {activityLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recent activity to show.
            </p>
          ) : (
            <ul className="space-y-0" aria-label="Recent activity feed">
              {recentActivity.map((item, idx) => (
                <li key={`${item.type}-${String(idx)}`}>
                  {idx > 0 && <div className="ml-[18px] h-3 w-px bg-border/60" />}
                  <div className="flex items-start gap-3 py-1">
                    <ActivityIcon kind={item.type} />
                    <div className="flex-1 space-y-0.5">
                      <p className="text-sm leading-snug">{item.message}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="rounded-full px-2 py-0 text-[10px] font-medium">
                          {item.type}
                        </Badge>
                        <time
                          dateTime={new Date(item.createdAt).toISOString()}
                          className="flex items-center gap-1 text-[11px] text-muted-foreground"
                        >
                          <Clock className="size-2.5" />
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </time>
                      </div>
                    </div>
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
        <span className="text-xs text-muted-foreground">
          {`${formattedUsed}${suffix} / ${formattedLimit}${suffix}`}
        </span>
      </div>
      <div
        className="relative mt-2 h-2 overflow-hidden rounded-full bg-muted"
        aria-label={`${label}: ${formattedUsed} of ${formattedLimit}${suffix} used`}
      >
        <div
          className={cn("h-full rounded-full transition-all duration-500", colorClass)}
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
  const baseClasses = "flex size-9 shrink-0 items-center justify-center rounded-full";

  switch (kind) {
    case "enrollment":
      return (
        <span className={`${baseClasses} bg-gaspar-blue`}>
          <BookOpen className="size-4 opacity-70" />
        </span>
      );
    case "payment":
      return (
        <span className={`${baseClasses} bg-gaspar-cream`}>
          <DollarSign className="size-4 opacity-70" />
        </span>
      );
    case "published":
      return (
        <span className={`${baseClasses} bg-gaspar-lavender text-white`}>
          <BookPlus className="size-4 opacity-80" />
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gaspar-pink`}>
          <Mail className="size-4 opacity-70" />
        </span>
      );
  }
}
