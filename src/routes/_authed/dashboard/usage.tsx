import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  HardDrive,
  Mail,
  Users,
  Video,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_authed/dashboard/usage")({
  component: UsageDashboard,
});

// -- Helpers --

function usagePercent(used: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min(Math.round((used / limit) * 100), 120);
}

function statusColor(percent: number): string {
  if (percent > 100) return "text-red-600";
  if (percent > 80) return "text-orange-500";
  return "text-emerald-600";
}

function progressColor(percent: number): string {
  if (percent > 100) return "bg-red-500";
  if (percent > 80) return "bg-orange-500";
  return "bg-emerald-500";
}

function tierLabel(tier: string): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}

// -- Component --

function UsageDashboard() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: usageData, isLoading } = useQuery(
    trpc.analytics.currentUsage.queryOptions(),
  );
  const { data: overageData } = useQuery(
    trpc.analytics.overageSummary.queryOptions(),
  );
  const { data: emailTrend } = useQuery(
    trpc.analytics.usageEventTrend.queryOptions({ eventType: "email_sent", days: 30 }),
  );
  const { data: studentGrowth } = useQuery(
    trpc.analytics.studentGrowth.queryOptions({ weeks: 4 }),
  );

  const toggleOverageMutation = useMutation(
    trpc.creatorSettings.toggleOverage.mutationOptions({
      onSuccess() {
        void queryClient.invalidateQueries({ queryKey: trpc.analytics.currentUsage.queryKey() });
        void queryClient.invalidateQueries({ queryKey: trpc.analytics.overageSummary.queryKey() });
      },
    }),
  );

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const tier = usageData?.tier ?? "launch";
  const overageEnabled = usageData?.overageEnabled ?? false;
  const limits = usageData?.limits;
  const metrics = usageData?.metrics;
  const aiCredits = usageData?.aiCredits;
  const avatarMinutes = usageData?.avatarMinutes;

  const billingStart = usageData?.billingPeriod.start
    ? format(new Date(usageData.billingPeriod.start), "MMM d, yyyy")
    : "";
  const billingEnd = usageData?.billingPeriod.end
    ? format(new Date(usageData.billingPeriod.end), "MMM d, yyyy")
    : "";

  // Build metric cards
  const metricCards = [
    {
      name: "Video Storage",
      icon: HardDrive,
      used: Math.round((metrics?.videoStorageHours ?? 0) * 10) / 10,
      limit: limits?.videoStorageHours ?? 5,
      unit: "hrs",
    },
    {
      name: "Students",
      icon: Users,
      used: metrics?.activeStudents ?? 0,
      limit: limits?.students ?? 100,
      unit: "",
    },
    {
      name: "Emails Sent",
      icon: Mail,
      used: metrics?.emailsSent ?? 0,
      limit: limits?.emails ?? 1_000,
      unit: "",
    },
  ];

  // AI credit items for display
  const aiCreditItems = [
    { key: "course", label: "Course Outlines", used: aiCredits?.course.used ?? 0, total: aiCredits?.course.total ?? 0 },
    { key: "rewrite", label: "Lesson Rewrites", used: aiCredits?.rewrite.used ?? 0, total: aiCredits?.rewrite.total ?? 0 },
    { key: "image", label: "Image Generation", used: aiCredits?.image.used ?? 0, total: aiCredits?.image.total ?? 0 },
    { key: "quiz", label: "Quiz Generation", used: aiCredits?.quiz.used ?? 0, total: aiCredits?.quiz.total ?? 0 },
  ];

  // Check if any metric is over 80%
  const needsUpgrade = metricCards.some((m) => usagePercent(m.used, m.limit) > 80);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Usage</h1>
          {billingStart && billingEnd && (
            <p className="mt-1 text-muted-foreground">
              {`${billingStart} - ${billingEnd}`}
            </p>
          )}
        </div>
        <Badge variant="outline" className="text-sm">
          {`${tierLabel(tier)} Plan`}
        </Badge>
      </div>

      {/* Metric Cards */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {metricCards.map((metric) => {
          const percent = usagePercent(metric.used, metric.limit);
          const Icon = metric.icon;
          const suffix = metric.unit ? ` ${metric.unit}` : "";
          const clampedPercent = Math.min(percent, 100);

          return (
            <Card key={metric.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${statusColor(percent)}`}>
                  {`${metric.used.toLocaleString()}${suffix}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {`of ${metric.limit.toLocaleString()}${suffix} (${String(percent)}%)`}
                </p>

                <div className="relative mt-3">
                  <Progress value={clampedPercent} className="h-2" />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${progressColor(percent)} transition-all`}
                    style={{ width: `${String(clampedPercent)}%` }}
                  />
                </div>

                {percent > 80 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
                    <AlertTriangle className="size-3" />
                    {percent >= 100 ? "Limit reached" : "Approaching limit"}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overage Billing Toggle + Charges */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overage Billing</CardTitle>
              <CardDescription>
                {overageEnabled
                  ? "Usage beyond your plan limits will be billed at overage rates."
                  : "Enable to continue using services when you hit your plan limits."}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="overage-toggle" className="text-sm text-muted-foreground">
                {overageEnabled ? "Enabled" : "Disabled"}
              </Label>
              <Switch
                id="overage-toggle"
                checked={overageEnabled}
                disabled={toggleOverageMutation.isPending}
                onCheckedChange={(checked) => {
                  toggleOverageMutation.mutate({ enabled: checked });
                }}
              />
            </div>
          </div>
        </CardHeader>
        {overageEnabled && overageData && overageData.charges.length > 0 && (
          <CardContent>
            <div className="rounded-lg border">
              <div className="border-b bg-muted/50 px-4 py-2">
                <p className="text-sm font-medium">Current Period Overage Charges</p>
              </div>
              <div className="divide-y">
                {overageData.charges.map((charge) => (
                  <div key={charge.metric} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">{charge.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {`${String(charge.overage)} ${charge.unit} over limit`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {`$${(charge.totalCents / 100).toFixed(2)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {`$${(charge.rateCents / 100).toFixed(2)}/${charge.unit === "emails" ? "1K" : charge.unit.replace(/s$/, "")}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t bg-muted/50 px-4 py-2">
                <p className="text-sm font-semibold">Estimated Total</p>
                <p className="text-sm font-semibold">
                  {`$${(overageData.totalCents / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Auto-Upgrade Recommendation */}
      {overageData?.upgradeRecommendation.shouldRecommend && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-start gap-3">
              <ArrowUpRight className="mt-0.5 size-5 text-primary" />
              <div>
                <p className="font-medium">Upgrade Recommended</p>
                <p className="text-sm text-muted-foreground">
                  {overageData.upgradeRecommendation.reason}
                </p>
              </div>
            </div>
            <Button type="button" size="sm" asChild>
              <Link to="/dashboard/pricing">
                {`Upgrade to ${tierLabel(overageData.upgradeRecommendation.recommendedTier ?? "")}`}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upgrade CTA at 80%+ (only if no overage recommendation already shown) */}
      {needsUpgrade && !overageData?.upgradeRecommendation.shouldRecommend && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="font-medium">You are approaching your plan limits</p>
              <p className="text-sm text-muted-foreground">
                Upgrade to get more storage, students, and credits.
              </p>
            </div>
            <Button type="button" size="sm" asChild>
              <Link to="/dashboard/pricing">Upgrade Plan</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Email Volume Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Email Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {emailTrend && emailTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emailTrend.map((d) => ({ day: d.date.slice(-2), emails: d.total }))}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" tick={{ fontSize: 10 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="emails" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No email data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Student Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Student Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {studentGrowth && studentGrowth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={studentGrowth}>
                    <defs>
                      <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="var(--color-primary)"
                      fill="url(#studentGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  No student data for this period
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Credits */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>AI Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {aiCreditItems.map((credit) => {
              const percent = usagePercent(credit.used, credit.total);
              const remaining = Math.max(credit.total - credit.used, 0);
              return (
                <div key={credit.key} className="flex flex-col items-center gap-3">
                  <CircularProgress percent={Math.min(percent, 100)} size={80} strokeWidth={6}>
                    <span className="text-lg font-bold">{remaining}</span>
                    <span className="text-[10px] text-muted-foreground">left</span>
                  </CircularProgress>
                  <div className="text-center">
                    <p className="text-sm font-medium">{credit.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {`${String(credit.used)} of ${String(credit.total)} used`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <Separator className="my-4" />
          <p className="text-sm text-muted-foreground">
            Credits refresh at the start of each billing period. Need more? Upgrade your plan for higher limits.
          </p>
        </CardContent>
      </Card>

      {/* Avatar Pack Balance */}
      {(avatarMinutes?.total ?? 0) > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Video className="size-5 text-muted-foreground" />
              <CardTitle>Avatar Video Minutes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <div>
                <p className={`text-3xl font-bold ${statusColor(usagePercent(avatarMinutes?.used ?? 0, avatarMinutes?.total ?? 1))}`}>
                  {`${String(Math.round((avatarMinutes?.total ?? 0) - (avatarMinutes?.used ?? 0)))} min`}
                </p>
                <p className="text-sm text-muted-foreground">remaining</p>
              </div>
              <div className="flex-1">
                <div className="relative">
                  <Progress
                    value={Math.min(usagePercent(avatarMinutes?.used ?? 0, avatarMinutes?.total ?? 1), 100)}
                    className="h-3"
                    aria-label={`Avatar minutes: ${String(avatarMinutes?.used ?? 0)} of ${String(avatarMinutes?.total ?? 0)} used`}
                  />
                  <div
                    className={`absolute inset-y-0 left-0 rounded-full ${progressColor(usagePercent(avatarMinutes?.used ?? 0, avatarMinutes?.total ?? 1))} transition-all`}
                    style={{ width: `${String(Math.min(usagePercent(avatarMinutes?.used ?? 0, avatarMinutes?.total ?? 1), 100))}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {`${String(Math.round(avatarMinutes?.used ?? 0))} of ${String(Math.round(avatarMinutes?.total ?? 0))} minutes used`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overage Rate Reference */}
      <Card className="mt-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="size-5 text-muted-foreground" />
            <CardTitle>Overage Rates</CardTitle>
          </div>
          <CardDescription>
            Rates applied when usage exceeds your plan limits (if overage billing is enabled).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Video Storage</p>
              <p className="mt-1 text-2xl font-bold">$2.00</p>
              <p className="text-xs text-muted-foreground">per hour over limit</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Additional Students</p>
              <p className="mt-1 text-2xl font-bold">$0.10</p>
              <p className="text-xs text-muted-foreground">per student over limit</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm font-medium">Email Sends</p>
              <p className="mt-1 text-2xl font-bold">$1.50</p>
              <p className="text-xs text-muted-foreground">per 1,000 emails over limit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -- Circular Progress Ring --

interface CircularProgressProps {
  percent: number;
  size: number;
  strokeWidth: number;
  children: ReactNode;
}

function ringStrokeColor(percent: number): string {
  if (percent >= 100) return "stroke-red-500";
  if (percent >= 80) return "stroke-orange-500";
  if (percent >= 60) return "stroke-yellow-500";
  return "stroke-emerald-500";
}

function CircularProgress({ percent, size, strokeWidth, children }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${String(size)} ${String(size)}`}>
        <title>{`${String(Math.round(percent))}% used`}</title>
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          className={ringStrokeColor(percent)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${String(center)} ${String(center)})`}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
