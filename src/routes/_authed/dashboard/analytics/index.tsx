import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, subDays, startOfYear } from "date-fns";
import {
  CalendarIcon,
  DollarSign,
  Download,
  TrendingUp,
  Users,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Brain,
  Clock,
  Target,
  Flame,
  Video,
  AlertTriangle,
  Eye,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authed/dashboard/analytics/")({
  component: AnalyticsDashboard,
});

// -- Types ------------------------------------------------------------------

type DateRangePreset = "7d" | "30d" | "90d" | "year" | "custom";

type DateRange = {
  readonly from: Date;
  readonly to: Date;
};

const BAR_CORNER_RADIUS = 6;
const BAR_MAX_SIZE = 40;
const PIE_COLORS = ["oklch(0.55 0.15 290)", "oklch(0.75 0.08 260)", "oklch(0.88 0.045 340)", "oklch(0.92 0.035 75)"];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HEATMAP_HOURS = Array.from({ length: 24 }, (_, i) => i);

// -- Gaspar KPI card backgrounds (rotate through) --------------------------

const GASPAR_KPI_STYLES = [
  "gaspar-card-cream",
  "gaspar-card-blue",
  "gaspar-card-pink",
  "gaspar-card-navy",
] as const;

// -- Date range helpers -----------------------------------------------------

const getDateRange = (preset: DateRangePreset, customRange?: DateRange): DateRange => {
  const now = new Date();
  switch (preset) {
    case "7d": return { from: subDays(now, 7), to: now };
    case "30d": return { from: subDays(now, 30), to: now };
    case "90d": return { from: subDays(now, 90), to: now };
    case "year": return { from: startOfYear(now), to: now };
    case "custom": return customRange ?? { from: subDays(now, 30), to: now };
    default: return { from: subDays(now, 30), to: now };
  }
};

const getDaysForPreset = (preset: DateRangePreset): number => {
  switch (preset) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "year": return 365;
    case "custom": return 30;
    default: return 30;
  }
};

// -- CSV export helper ------------------------------------------------------

const exportToCsv = (headers: readonly string[], rows: readonly (readonly string[])[], filename: string) => {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

// -- Custom tooltip ---------------------------------------------------------

type CustomTooltipProps = {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<{
    readonly value: number;
    readonly dataKey: string;
    readonly name?: string;
  }>;
  readonly label?: string;
  readonly prefix?: string;
  readonly suffix?: string;
};

function CustomTooltip({ active, payload, label, prefix = "", suffix = "" }: CustomTooltipProps) {
  if (!(active && payload) || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card px-4 py-2.5 shadow-xl">
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="font-heading font-semibold text-sm">
        {`${prefix}${payload.at(0)?.value.toLocaleString()}${suffix}`}
      </p>
    </div>
  );
}

// -- KPI Card ---------------------------------------------------------------

type KpiCardProps = {
  readonly title: string;
  readonly value: string;
  readonly trend?: number;
  readonly icon: typeof DollarSign;
  readonly trendLabel?: string;
  readonly isLoading?: boolean;
  readonly gasparStyle?: string;
};

function KpiCard({ title, value, trend, icon: Icon, trendLabel, isLoading, gasparStyle }: KpiCardProps) {
  const isPositive = (trend ?? 0) >= 0;
  const isNavy = gasparStyle === "gaspar-card-navy";

  return (
    <Card className={`rounded-2xl border-0 shadow-md transition-transform hover:-translate-y-0.5 hover:shadow-lg ${gasparStyle ?? ""}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={`text-xs font-semibold uppercase tracking-wider ${isNavy ? "opacity-70" : "opacity-60"}`}>{title}</CardTitle>
        <div className={`flex size-8 items-center justify-center rounded-full ${isNavy ? "bg-white/10" : "bg-black/5"}`}>
          <Icon className={`size-4 ${isNavy ? "text-white/70" : "text-black/40"}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className={`h-8 w-24 animate-pulse rounded-xl ${isNavy ? "bg-white/10" : "bg-black/5"}`} />
        ) : (
          <>
            <p className="font-heading font-bold text-2xl tracking-tight">{value}</p>
            {trend !== undefined && trendLabel && (
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                isNavy
                  ? isPositive ? "text-emerald-300" : "text-red-300"
                  : isPositive ? "text-emerald-700" : "text-red-600"
              }`}>
                {isPositive ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {`${isPositive ? "+" : ""}${trend}% ${trendLabel}`}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// -- Date Range Picker Component --------------------------------------------

type DateRangePickerProps = {
  readonly preset: DateRangePreset;
  readonly customRange: DateRange | undefined;
  readonly onPresetChange: (preset: DateRangePreset) => void;
  readonly onCustomRangeChange: (range: DateRange) => void;
};

function DateRangePicker({ preset, customRange, onPresetChange, onCustomRangeChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFrom, setTempFrom] = useState<Date | undefined>(customRange?.from);
  const [tempTo, setTempTo] = useState<Date | undefined>(customRange?.to);

  const displayRange = getDateRange(preset, customRange);

  const handleApplyCustom = useCallback(() => {
    if (tempFrom && tempTo) {
      onCustomRangeChange({ from: tempFrom, to: tempTo });
      onPresetChange("custom");
      setIsOpen(false);
    }
  }, [tempFrom, tempTo, onCustomRangeChange, onPresetChange]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-border/50 bg-card p-1 shadow-sm">
        {(["7d", "30d", "90d", "year"] as const).map((p) => (
          <Button
            key={p}
            type="button"
            variant={preset === p ? "default" : "ghost"}
            size="sm"
            className={`h-7 rounded-full px-3 text-xs font-medium ${preset === p ? "shadow-md" : ""}`}
            onClick={() => onPresetChange(p)}
          >
            {p === "7d" ? "7 days" : p === "30d" ? "30 days" : p === "90d" ? "90 days" : "This year"}
          </Button>
        ))}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={preset === "custom" ? "default" : "outline"}
            size="sm"
            className="gap-1.5 rounded-full"
          >
            <CalendarIcon className="size-3.5" />
            {preset === "custom" && customRange
              ? `${format(customRange.from, "MMM d")} - ${format(customRange.to, "MMM d")}`
              : "Custom"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto rounded-2xl p-4" align="end">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="date-from">From</Label>
                <Calendar
                  mode="single"
                  selected={tempFrom}
                  onSelect={(d) => { if (d) { setTempFrom(d); } }}
                  disabled={(d) => d > new Date()}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="date-to">To</Label>
                <Calendar
                  mode="single"
                  selected={tempTo}
                  onSelect={(d) => { if (d) { setTempTo(d); } }}
                  disabled={(d) => d > new Date() || (tempFrom ? d < tempFrom : false)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" size="sm" className="rounded-full" onClick={handleApplyCustom} disabled={!tempFrom || !tempTo}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <p className="text-muted-foreground text-xs">
        {`${format(displayRange.from, "MMM d, yyyy")} - ${format(displayRange.to, "MMM d, yyyy")}`}
      </p>
    </div>
  );
}

// -- Heatmap cell -----------------------------------------------------------

function HeatmapCell({ value, max }: { readonly value: number; readonly max: number }) {
  const intensity = max > 0 ? value / max : 0;
  const bg = intensity === 0
    ? "bg-muted"
    : intensity < 0.25
      ? "bg-gaspar-lavender/20"
      : intensity < 0.5
        ? "bg-gaspar-lavender/40"
        : intensity < 0.75
          ? "bg-gaspar-purple/50"
          : "bg-gaspar-purple/80";

  return (
    <div
      className={`size-6 rounded-md ${bg}`}
      title={`${value} activities`}
      role="presentation"
    />
  );
}

// -- Main component ---------------------------------------------------------

function AnalyticsDashboard() {
  const trpc = useTRPC();
  const [datePreset, setDatePreset] = useState<DateRangePreset>("30d");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState<"overview" | "revenue" | "engagement" | "content">("overview");
  const [selectedDropoffCourse, setSelectedDropoffCourse] = useState<string>("");

  const dateRange = getDateRange(datePreset, customRange);
  const dateInput = {
    startDate: dateRange.from.toISOString(),
    endDate: dateRange.to.toISOString(),
  };
  const days = getDaysForPreset(datePreset);

  // ---- Overview queries ----
  const { data: overview, isLoading: overviewLoading } = useQuery(
    trpc.analytics.overview.queryOptions(dateInput),
  );
  const { data: revenueTrend } = useQuery(
    trpc.analytics.revenueTrend.queryOptions({ ...dateInput, days }),
  );
  const { data: enrollmentTrend } = useQuery(
    trpc.analytics.enrollmentTrend.queryOptions({ days, ...dateInput }),
  );
  const { data: activeStudentsData } = useQuery(
    trpc.analytics.activeStudents.queryOptions({ days }),
  );
  const { data: completionRates } = useQuery(
    trpc.analytics.courseCompletionRates.queryOptions(),
  );

  // ---- Revenue queries ----
  const { data: revenueOverview, isLoading: revenueLoading } = useQuery(
    trpc.analytics.revenueOverview.queryOptions(dateInput),
  );
  const { data: revenueByCourse } = useQuery(
    trpc.analytics.revenueByCourse.queryOptions(dateInput),
  );
  const { data: revenueByType } = useQuery(
    trpc.analytics.revenueByType.queryOptions(dateInput),
  );

  // ---- Content performance queries ----
  const [contentCourseFilter, setContentCourseFilter] = useState<string>("");
  const [contentSortBy, setContentSortBy] = useState<"engagement" | "views" | "completion" | "watchTime">("engagement");

  const { data: contentRanking } = useQuery(
    trpc.analytics.contentRanking.queryOptions({
      courseId: contentCourseFilter || undefined,
      sortBy: contentSortBy,
      limit: 50,
    }),
  );
  const { data: problemContent } = useQuery(
    trpc.analytics.problemContent.queryOptions(),
  );

  // ---- Engagement queries ----
  const { data: engagementSummary, isLoading: engagementLoading } = useQuery(
    trpc.analytics.engagementSummary.queryOptions(),
  );
  const { data: quizScores } = useQuery(
    trpc.analytics.averageQuizScores.queryOptions(),
  );
  const { data: timeToComplete } = useQuery(
    trpc.analytics.timeToComplete.queryOptions(),
  );
  const { data: heatmapData } = useQuery(
    trpc.analytics.studentActivityHeatmap.queryOptions({ days }),
  );
  const { data: lessonDropoff } = useQuery({
    ...trpc.analytics.lessonDropoff.queryOptions({ courseId: selectedDropoffCourse }),
    enabled: selectedDropoffCourse.length > 0,
  });

  // Set default dropoff course when completionRates loads
  useMemo(() => {
    if (completionRates && completionRates.length > 0 && selectedDropoffCourse === "") {
      setSelectedDropoffCourse(completionRates.at(0)?.courseId ?? "");
    }
  }, [completionRates, selectedDropoffCourse]);

  // Derived data
  const revenueChartData = useMemo(() =>
    (revenueTrend ?? []).map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      revenue: d.revenue / 100,
    })),
    [revenueTrend],
  );

  const enrollmentChartData = useMemo(() =>
    (enrollmentTrend ?? []).map((d) => ({
      date: format(new Date(d.date), "MMM d"),
      enrollments: d.count,
    })),
    [enrollmentTrend],
  );

  const revenueByCourseChart = useMemo(() =>
    (revenueByCourse ?? []).slice(0, 5).map((r) => ({
      name: r.courseTitle.length > 20 ? `${r.courseTitle.slice(0, 20)}...` : r.courseTitle,
      revenue: r.revenueCents / 100,
    })),
    [revenueByCourse],
  );

  const revenueByTypeChart = useMemo(() =>
    (revenueByType ?? []).map((r) => ({
      name: r.type === "paid" ? "One-time Purchase" : r.type === "subscription_only" ? "Subscription" : r.type,
      value: r.revenueCents / 100,
    })),
    [revenueByType],
  );

  // Build heatmap grid
  const heatmapGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    let maxVal = 0;
    for (const d of heatmapData ?? []) {
      grid[d.dayOfWeek][d.hourOfDay] = d.count;
      if (d.count > maxVal) { maxVal = d.count; }
    }
    return { grid, max: maxVal };
  }, [heatmapData]);

  const handleExportCsv = useCallback(() => {
    if (activeTab === "revenue" && revenueByCourse) {
      const headers = ["Course", "Revenue ($)", "Enrollments", "Type"];
      const rows = revenueByCourse.map((c) => [
        c.courseTitle,
        String(c.revenueCents / 100),
        String(c.enrollments),
        c.priceType ?? "paid",
      ]);
      exportToCsv(headers, rows, `revenue-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } else if (activeTab === "engagement" && quizScores) {
      const headers = ["Course", "Avg Score", "Pass Rate %", "Attempts"];
      const rows = quizScores.map((c) => [
        c.courseTitle,
        String(c.avgScore),
        String(c.passRate),
        String(c.totalAttempts),
      ]);
      exportToCsv(headers, rows, `engagement-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } else if (activeTab === "content" && contentRanking) {
      const headers = ["Lesson", "Course", "Type", "Views", "Completion %", "Engagement %", "Avg Watch (s)", "Score"];
      const rows = contentRanking.map((c) => [
        c.lessonTitle,
        c.courseTitle,
        c.lessonType,
        String(c.totalViews),
        String(c.completionRate),
        String(c.engagementRatio ?? "N/A"),
        String(c.avgWatchTimeSeconds),
        String(c.compositeScore),
      ]);
      exportToCsv(headers, rows, `content-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
    } else if (completionRates) {
      const headers = ["Course", "Enrollments", "Completions", "Completion %"];
      const rows = completionRates.map((c) => [
        c.courseTitle,
        String(c.totalEnrollments),
        String(c.completedEnrollments),
        String(c.completionRate),
      ]);
      exportToCsv(headers, rows, `analytics-overview-${format(new Date(), "yyyy-MM-dd")}.csv`);
    }
  }, [activeTab, revenueByCourse, quizScores, completionRates, contentRanking]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="mt-1 text-muted-foreground">
            Track your revenue, enrollments, and student engagement.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 self-start rounded-full"
          onClick={handleExportCsv}
        >
          <Download className="size-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Date range picker */}
      <DateRangePicker
        preset={datePreset}
        customRange={customRange}
        onPresetChange={setDatePreset}
        onCustomRangeChange={setCustomRange}
      />

      {/* Tab navigation */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as "overview" | "revenue" | "engagement" | "content")}
      >
        <TabsList className="rounded-full bg-muted/60 p-1">
          <TabsTrigger value="overview" className="gap-1.5 rounded-full">
            <Activity className="size-3.5" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="revenue" className="gap-1.5 rounded-full">
            <DollarSign className="size-3.5" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="engagement" className="gap-1.5 rounded-full">
            <Brain className="size-3.5" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-1.5 rounded-full">
            <Video className="size-3.5" />
            Content
          </TabsTrigger>
        </TabsList>

        {/* ===== Overview Tab ===== */}
        <TabsContent value="overview">
          <div className="mt-6 space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Courses"
                value={String(overview?.totalCourses ?? 0)}
                icon={GraduationCap}
                isLoading={overviewLoading}
                gasparStyle={GASPAR_KPI_STYLES[0]}
              />
              <KpiCard
                title="Total Enrollments"
                value={(overview?.totalEnrollments ?? 0).toLocaleString()}
                icon={Users}
                isLoading={overviewLoading}
                gasparStyle={GASPAR_KPI_STYLES[1]}
              />
              <KpiCard
                title="Monthly Enrollments"
                value={(overview?.monthlyEnrollments ?? 0).toLocaleString()}
                icon={TrendingUp}
                isLoading={overviewLoading}
                gasparStyle={GASPAR_KPI_STYLES[2]}
              />
              <KpiCard
                title="Active Students"
                value={(activeStudentsData?.activeStudents ?? 0).toLocaleString()}
                icon={Activity}
                isLoading={overviewLoading}
                gasparStyle={GASPAR_KPI_STYLES[3]}
              />
            </div>

            {/* Revenue chart */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading">Revenue</CardTitle>
                <CardDescription>
                  Daily revenue over the selected period
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val: number) => `$${val}`} />
                        <Tooltip content={<CustomTooltip prefix="$" />} />
                        <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No revenue data for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enrollment trend & Active students row */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading">Enrollment Trend</CardTitle>
                  <CardDescription>Daily new enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    {enrollmentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentChartData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                          <Tooltip content={<CustomTooltip suffix=" students" />} />
                          <Bar dataKey="enrollments" fill="var(--color-primary)" radius={[BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0, 0]} maxBarSize={BAR_MAX_SIZE} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No enrollment data for this period
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading">Course Completion Rates</CardTitle>
                  <CardDescription>Completion percentage by course</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[260px]">
                    {completionRates && completionRates.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={completionRates.slice(0, 6).map((c) => ({
                            name: c.courseTitle.length > 15 ? `${c.courseTitle.slice(0, 15)}...` : c.courseTitle,
                            rate: c.completionRate,
                          }))}
                          layout="vertical"
                        >
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val: number) => `${val}%`} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={110} />
                          <Tooltip content={<CustomTooltip suffix="%" />} />
                          <Bar dataKey="rate" fill="var(--color-gaspar-lavender)" radius={[0, BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0]} maxBarSize={28} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No completion data yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Course performance table */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading">Course Performance</CardTitle>
                <CardDescription>Breakdown of metrics by individual course</CardDescription>
              </CardHeader>
              <CardContent>
                {completionRates && completionRates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead scope="col">Course</TableHead>
                        <TableHead scope="col" className="text-right">Enrollments</TableHead>
                        <TableHead scope="col" className="text-right">Completions</TableHead>
                        <TableHead scope="col" className="text-right">Completion Rate</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {completionRates.map((c) => (
                        <TableRow key={c.courseId} className="border-border/20">
                          <TableCell className="font-medium">{c.courseTitle}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.totalEnrollments}</TableCell>
                          <TableCell className="text-right tabular-nums">{c.completedEnrollments}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress
                                value={c.completionRate}
                                className="h-2 w-16"
                                aria-label={`${c.completionRate}% completion rate`}
                              />
                              <span className="w-9 text-right tabular-nums">{`${c.completionRate}%`}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No course data to display</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Revenue Tab ===== */}
        <TabsContent value="revenue">
          <div className="mt-6 space-y-6">
            {/* Revenue KPI row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Revenue"
                value={`$${((revenueOverview?.totalRevenueCents ?? 0) / 100).toLocaleString()}`}
                trend={revenueOverview?.revenueChangePct}
                icon={DollarSign}
                trendLabel="vs last period"
                isLoading={revenueLoading}
                gasparStyle={GASPAR_KPI_STYLES[0]}
              />
              <KpiCard
                title="Transactions"
                value={(revenueOverview?.totalTransactions ?? 0).toLocaleString()}
                icon={GraduationCap}
                isLoading={revenueLoading}
                gasparStyle={GASPAR_KPI_STYLES[1]}
              />
              <KpiCard
                title="ARPU"
                value={`$${((revenueOverview?.arpu ?? 0) / 100).toFixed(2)}`}
                icon={Users}
                isLoading={revenueLoading}
                gasparStyle={GASPAR_KPI_STYLES[2]}
              />
              <KpiCard
                title="Active Students"
                value={(revenueOverview?.activeStudents ?? 0).toLocaleString()}
                icon={Activity}
                isLoading={revenueLoading}
                gasparStyle={GASPAR_KPI_STYLES[3]}
              />
            </div>

            {/* Period comparison callout */}
            {revenueOverview && (
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardContent className="py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">This period</p>
                      <p className="font-heading font-bold text-2xl tabular-nums">
                        {`$${(revenueOverview.totalRevenueCents / 100).toLocaleString()}`}
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <p className="text-muted-foreground text-sm">Last period</p>
                      <p className="font-heading font-bold text-2xl tabular-nums">
                        {`$${(revenueOverview.previousRevenueCents / 100).toLocaleString()}`}
                      </p>
                    </div>
                    <Separator orientation="vertical" className="h-12" />
                    <div>
                      <p className="text-muted-foreground text-sm">Change</p>
                      <p className={`flex items-center gap-1 font-heading font-bold text-2xl ${revenueOverview.revenueChangePct >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                        {revenueOverview.revenueChangePct >= 0 ? (
                          <ArrowUpRight className="size-5" />
                        ) : (
                          <ArrowDownRight className="size-5" />
                        )}
                        {`${revenueOverview.revenueChangePct >= 0 ? "+" : ""}${revenueOverview.revenueChangePct}%`}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue trend chart */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <TrendingUp className="size-5 text-primary" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {revenueChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueChartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val: number) => `$${val.toLocaleString()}`} />
                        <Tooltip content={<CustomTooltip prefix="$" />} />
                        <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No revenue data for this period
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Course (bar chart) + Revenue by Type (pie chart) */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <BarChart3 className="size-5 text-primary" />
                    Revenue by Course
                  </CardTitle>
                  <CardDescription>Top courses by total revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {revenueByCourseChart.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueByCourseChart} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                          <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(val: number) => `$${val.toLocaleString()}`} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={120} />
                          <Tooltip content={<CustomTooltip prefix="$" />} />
                          <Bar dataKey="revenue" fill="var(--color-primary)" radius={[0, BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0]} maxBarSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No revenue data by course
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <PieChartIcon className="size-5 text-primary" />
                    Revenue by Type
                  </CardTitle>
                  <CardDescription>One-time purchases vs subscriptions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {revenueByTypeChart.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={revenueByTypeChart}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: Record<string, unknown>) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                          >
                            {revenueByTypeChart.map((_entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS.at(index % PIE_COLORS.length)} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        No revenue type data
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue per course table */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading">Revenue Breakdown by Course</CardTitle>
                <CardDescription>Detailed revenue metrics per course</CardDescription>
              </CardHeader>
              <CardContent>
                {revenueByCourse && revenueByCourse.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead scope="col">Course</TableHead>
                        <TableHead scope="col" className="text-right">Enrollments</TableHead>
                        <TableHead scope="col" className="text-right">Revenue</TableHead>
                        <TableHead scope="col" className="text-right">Avg/Student</TableHead>
                        <TableHead scope="col" className="text-right">Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenueByCourse.map((c) => {
                        const totalRev = revenueByCourse.reduce((acc, x) => acc + x.revenueCents, 0);
                        const share = totalRev > 0 ? Math.round((c.revenueCents / totalRev) * 100) : 0;
                        const avgPerStudent = c.enrollments > 0 ? Math.round(c.revenueCents / c.enrollments / 100) : 0;
                        return (
                          <TableRow key={c.courseId} className="border-border/20">
                            <TableCell className="font-medium">{c.courseTitle}</TableCell>
                            <TableCell className="text-right tabular-nums">{c.enrollments}</TableCell>
                            <TableCell className="text-right tabular-nums">{`$${(c.revenueCents / 100).toLocaleString()}`}</TableCell>
                            <TableCell className="text-right tabular-nums">{`$${avgPerStudent}`}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Progress value={share} className="h-2 w-12" aria-label={`${share}% of total revenue`} />
                                <span className="w-9 text-right tabular-nums text-xs">{`${share}%`}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No revenue data to display</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Engagement Tab ===== */}
        <TabsContent value="engagement">
          <div className="mt-6 space-y-6">
            {/* Engagement KPI Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Completion Rate"
                value={`${engagementSummary?.overallCompletionRate ?? 0}%`}
                icon={Target}
                isLoading={engagementLoading}
                gasparStyle={GASPAR_KPI_STYLES[0]}
              />
              <KpiCard
                title="Avg Quiz Score"
                value={`${engagementSummary?.avgQuizScore ?? 0}%`}
                icon={Brain}
                isLoading={engagementLoading}
                gasparStyle={GASPAR_KPI_STYLES[1]}
              />
              <KpiCard
                title="Avg Time to Complete"
                value={`${engagementSummary?.avgTimeToCompleteDays ?? 0}d`}
                icon={Clock}
                isLoading={engagementLoading}
                gasparStyle={GASPAR_KPI_STYLES[2]}
              />
              <KpiCard
                title="Lessons (30d)"
                value={(engagementSummary?.lessonsCompletedLast30Days ?? 0).toLocaleString()}
                icon={Flame}
                isLoading={engagementLoading}
                gasparStyle={GASPAR_KPI_STYLES[3]}
              />
            </div>

            {/* Completion rates bar chart */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Target className="size-5 text-primary" />
                  Completion Rates by Course
                </CardTitle>
                <CardDescription>
                  Percentage of enrolled students who completed each course
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {completionRates && completionRates.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionRates.map((c) => ({
                        name: c.courseTitle.length > 18 ? `${c.courseTitle.slice(0, 18)}...` : c.courseTitle,
                        rate: c.completionRate,
                        enrolled: c.totalEnrollments,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} angle={-20} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val: number) => `${val}%`} />
                        <Tooltip content={<CustomTooltip suffix="%" />} />
                        <Bar dataKey="rate" fill="var(--color-gaspar-lavender)" radius={[BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0, 0]} maxBarSize={BAR_MAX_SIZE} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No completion data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quiz scores + Time to complete row */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Average Quiz Scores */}
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <Brain className="size-5 text-primary" />
                    Average Quiz Scores
                  </CardTitle>
                  <CardDescription>Score and pass rate per course</CardDescription>
                </CardHeader>
                <CardContent>
                  {quizScores && quizScores.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/30">
                          <TableHead scope="col">Course</TableHead>
                          <TableHead scope="col" className="text-right">Avg Score</TableHead>
                          <TableHead scope="col" className="text-right">Pass Rate</TableHead>
                          <TableHead scope="col" className="text-right">Attempts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {quizScores.map((q) => (
                          <TableRow key={q.courseId} className="border-border/20">
                            <TableCell className="max-w-[160px] truncate font-medium">{q.courseTitle}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant={q.avgScore >= 70 ? "default" : "secondary"} className="rounded-full">
                                {`${q.avgScore}%`}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">{`${q.passRate}%`}</TableCell>
                            <TableCell className="text-right tabular-nums">{q.totalAttempts}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">No quiz data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Time to Complete */}
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <Clock className="size-5 text-primary" />
                    Time to Complete
                  </CardTitle>
                  <CardDescription>Days from enrollment to completion</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeToComplete && timeToComplete.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border/30">
                          <TableHead scope="col">Course</TableHead>
                          <TableHead scope="col" className="text-right">Avg (days)</TableHead>
                          <TableHead scope="col" className="text-right">Min</TableHead>
                          <TableHead scope="col" className="text-right">Max</TableHead>
                          <TableHead scope="col" className="text-right">Students</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {timeToComplete.map((t) => (
                          <TableRow key={t.courseId} className="border-border/20">
                            <TableCell className="max-w-[140px] truncate font-medium">{t.courseTitle}</TableCell>
                            <TableCell className="text-right tabular-nums font-semibold">{t.avgDays}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{t.minDays}</TableCell>
                            <TableCell className="text-right tabular-nums text-muted-foreground">{t.maxDays}</TableCell>
                            <TableCell className="text-right tabular-nums">{t.completedStudents}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="py-8 text-center text-muted-foreground">No completion data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lesson Drop-off Analysis */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-heading">
                      <TrendingUp className="size-5 text-primary" />
                      Lesson Drop-off Analysis
                    </CardTitle>
                    <CardDescription>
                      Shows where students stop progressing in a course
                    </CardDescription>
                  </div>
                  {completionRates && completionRates.length > 0 && (
                    <Select
                      value={selectedDropoffCourse}
                      onValueChange={setSelectedDropoffCourse}
                    >
                      <SelectTrigger className="w-[240px] rounded-xl">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {completionRates.map((c) => (
                          <SelectItem key={c.courseId} value={c.courseId}>
                            {c.courseTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[320px]">
                  {lessonDropoff && lessonDropoff.lessons.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lessonDropoff.lessons.map((l, i) => ({
                        name: `L${i + 1}`,
                        fullName: l.lessonTitle,
                        completion: l.completionRate,
                        started: l.startRate,
                      }))}>
                        <defs>
                          <linearGradient id="dropoffGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-gaspar-pink)" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="var(--color-gaspar-pink)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="startedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-gaspar-blue)" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="var(--color-gaspar-blue)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val: number) => `${val}%`} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!(active && payload) || payload.length === 0) { return null; }
                            const item = lessonDropoff.lessons.at(Number(String(label ?? "").replace("L", "") || 1) - 1);
                            return (
                              <div className="rounded-2xl border border-border/50 bg-card px-4 py-2.5 shadow-xl">
                                <p className="font-heading font-medium text-xs">{item?.lessonTitle ?? label}</p>
                                <p className="text-muted-foreground text-xs">{item?.moduleTitle}</p>
                                <p className="mt-1 text-sm">{`Started: ${payload.at(1)?.value}%`}</p>
                                <p className="font-semibold text-sm">{`Completed: ${payload.at(0)?.value}%`}</p>
                              </div>
                            );
                          }}
                        />
                        <Area type="monotone" dataKey="started" stroke="var(--color-gaspar-blue)" strokeWidth={1.5} fill="url(#startedGradient)" dot={false} name="Started" />
                        <Area type="monotone" dataKey="completion" stroke="var(--color-gaspar-purple)" strokeWidth={2} fill="url(#dropoffGradient)" dot={false} name="Completed" />
                        <Legend />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      {selectedDropoffCourse ? "No lesson progress data for this course" : "Select a course to view drop-off analysis"}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Student Activity Heatmap */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Flame className="size-5 text-primary" />
                  Student Activity Heatmap
                </CardTitle>
                <CardDescription>
                  When your students are most active (day of week vs hour of day)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {heatmapGrid.max > 0 ? (
                  <div className="overflow-x-auto">
                    <div className="min-w-[640px]">
                      {/* Hour labels */}
                      <div className="mb-1 flex gap-1 pl-10">
                        {HEATMAP_HOURS.map((h) => (
                          <div key={h} className="flex size-6 items-center justify-center text-muted-foreground text-xs">
                            {h % 3 === 0 ? `${h}` : ""}
                          </div>
                        ))}
                      </div>
                      {/* Grid rows */}
                      {DAY_LABELS.map((day, dayIdx) => (
                        <div key={day} className="flex items-center gap-1">
                          <span className="w-9 text-right text-muted-foreground text-xs">{day}</span>
                          {HEATMAP_HOURS.map((hour) => (
                            <HeatmapCell
                              key={`${dayIdx}-${hour}`}
                              value={heatmapGrid.grid[dayIdx][hour]}
                              max={heatmapGrid.max}
                            />
                          ))}
                        </div>
                      ))}
                      {/* Legend */}
                      <div className="mt-3 flex items-center justify-end gap-2">
                        <span className="text-muted-foreground text-xs">Less</span>
                        <div className="flex gap-0.5">
                          <div className="size-4 rounded-md bg-muted" />
                          <div className="size-4 rounded-md bg-gaspar-lavender/20" />
                          <div className="size-4 rounded-md bg-gaspar-lavender/40" />
                          <div className="size-4 rounded-md bg-gaspar-purple/50" />
                          <div className="size-4 rounded-md bg-gaspar-purple/80" />
                        </div>
                        <span className="text-muted-foreground text-xs">More</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No activity data for this period</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== Content Performance Tab ===== */}
        <TabsContent value="content">
          <div className="mt-6 space-y-6">
            {/* Content KPI summary */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total Lessons"
                value={String(contentRanking?.length ?? 0)}
                icon={BookOpen}
                gasparStyle={GASPAR_KPI_STYLES[0]}
              />
              <KpiCard
                title="Total Views"
                value={(contentRanking?.reduce((a, l) => a + l.totalViews, 0) ?? 0).toLocaleString()}
                icon={Eye}
                gasparStyle={GASPAR_KPI_STYLES[1]}
              />
              <KpiCard
                title="Avg Engagement"
                value={(() => {
                  const withRatio = (contentRanking ?? []).filter((l) => l.engagementRatio !== null);
                  if (withRatio.length === 0) return "N/A";
                  const avg = Math.round(withRatio.reduce((a, l) => a + (l.engagementRatio ?? 0), 0) / withRatio.length);
                  return `${avg}%`;
                })()}
                icon={Target}
                gasparStyle={GASPAR_KPI_STYLES[2]}
              />
              <KpiCard
                title="Problem Lessons"
                value={String(problemContent?.length ?? 0)}
                icon={AlertTriangle}
                gasparStyle={GASPAR_KPI_STYLES[3]}
              />
            </div>

            {/* Problem content alerts */}
            {problemContent && problemContent.length > 0 && (
              <Card className="rounded-2xl border-border/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-heading">
                    <AlertTriangle className="size-5 text-amber-500" />
                    Problem Content
                  </CardTitle>
                  <CardDescription>
                    Lessons flagged for low engagement or high drop-off. Consider revising these.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {problemContent.slice(0, 10).map((p) => (
                      <div
                        key={p.lessonId}
                        className={`flex items-start justify-between rounded-2xl border p-4 ${
                          p.severity === "critical"
                            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950"
                            : "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={p.severity === "critical" ? "destructive" : "secondary"} className="rounded-full">
                              {p.severity}
                            </Badge>
                            <span className="truncate font-medium text-sm">{p.lessonTitle}</span>
                          </div>
                          <p className="mt-1 text-muted-foreground text-xs">
                            {`${p.courseTitle} > ${p.moduleTitle}`}
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {p.issues.map((issue) => (
                              <span
                                key={issue}
                                className="rounded-full bg-background px-2 py-0.5 text-xs"
                              >
                                {issue}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4 flex shrink-0 items-center gap-4 text-right">
                          <div>
                            <p className="text-muted-foreground text-xs">Views</p>
                            <p className="tabular-nums text-sm font-medium">{p.totalViews}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Completion</p>
                            <p className="tabular-nums text-sm font-medium">{`${p.completionRate}%`}</p>
                          </div>
                          {p.engagementRatio !== null && (
                            <div>
                              <p className="text-muted-foreground text-xs">Engagement</p>
                              <p className="tabular-nums text-sm font-medium">{`${p.engagementRatio}%`}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Content ranking table with filters */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 font-heading">
                      <BarChart3 className="size-5 text-primary" />
                      Lesson Performance Ranking
                    </CardTitle>
                    <CardDescription>
                      All lessons ranked by engagement metrics
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={contentCourseFilter} onValueChange={setContentCourseFilter}>
                      <SelectTrigger className="w-[180px] rounded-xl">
                        <SelectValue placeholder="All courses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All courses</SelectItem>
                        {completionRates?.map((c) => (
                          <SelectItem key={c.courseId} value={c.courseId}>
                            {c.courseTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={contentSortBy} onValueChange={(v) => setContentSortBy(v as typeof contentSortBy)}>
                      <SelectTrigger className="w-[150px] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="engagement">Engagement Score</SelectItem>
                        <SelectItem value="views">Most Views</SelectItem>
                        <SelectItem value="completion">Completion Rate</SelectItem>
                        <SelectItem value="watchTime">Watch Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {contentRanking && contentRanking.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30">
                        <TableHead scope="col" className="w-8">#</TableHead>
                        <TableHead scope="col">Lesson</TableHead>
                        <TableHead scope="col">Course</TableHead>
                        <TableHead scope="col">Type</TableHead>
                        <TableHead scope="col" className="text-right">Views</TableHead>
                        <TableHead scope="col" className="text-right">Completion</TableHead>
                        <TableHead scope="col" className="text-right">Engagement</TableHead>
                        <TableHead scope="col" className="text-right">Avg Watch</TableHead>
                        <TableHead scope="col" className="text-right">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contentRanking.map((l, idx) => (
                        <TableRow key={l.lessonId} className="border-border/20">
                          <TableCell className="text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                          <TableCell className="max-w-[200px] truncate font-medium">{l.lessonTitle}</TableCell>
                          <TableCell className="max-w-[140px] truncate text-muted-foreground text-sm">
                            {l.courseTitle}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="rounded-full text-xs">
                              {l.lessonType}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{l.totalViews}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Progress
                                value={l.completionRate}
                                className="h-2 w-12"
                                aria-label={`${l.completionRate}% completion`}
                              />
                              <span className="w-9 text-right tabular-nums text-xs">{`${l.completionRate}%`}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {l.engagementRatio !== null ? (
                              <span className={`tabular-nums ${l.engagementRatio < 40 ? "text-red-500" : l.engagementRatio < 70 ? "text-amber-500" : "text-emerald-600"}`}>
                                {`${l.engagementRatio}%`}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-sm">
                            {l.avgWatchTimeSeconds > 0
                              ? l.avgWatchTimeSeconds >= 60
                                ? `${Math.floor(l.avgWatchTimeSeconds / 60)}m ${l.avgWatchTimeSeconds % 60}s`
                                : `${l.avgWatchTimeSeconds}s`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={l.compositeScore >= 60 ? "default" : l.compositeScore >= 30 ? "secondary" : "destructive"}
                              className="rounded-full"
                            >
                              {l.compositeScore}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="py-8 text-center text-muted-foreground">No content data to display</p>
                )}
              </CardContent>
            </Card>

            {/* Engagement ratio distribution chart */}
            <Card className="rounded-2xl border-border/30 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <Video className="size-5 text-primary" />
                  Video Engagement Distribution
                </CardTitle>
                <CardDescription>
                  How much of each video students watch on average (watch time vs duration)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {contentRanking && contentRanking.filter((l) => l.engagementRatio !== null).length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={contentRanking
                          .filter((l) => l.engagementRatio !== null)
                          .slice(0, 15)
                          .map((l) => ({
                            name: l.lessonTitle.length > 15 ? `${l.lessonTitle.slice(0, 15)}...` : l.lessonTitle,
                            engagement: l.engagementRatio,
                            completion: l.completionRate,
                          }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={80} />
                        <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val: number) => `${val}%`} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!(active && payload) || payload.length === 0) return null;
                            return (
                              <div className="rounded-2xl border border-border/50 bg-card px-4 py-2.5 shadow-xl">
                                <p className="font-heading font-medium text-xs">{label}</p>
                                <p className="text-sm">{`Engagement: ${payload.at(0)?.value}%`}</p>
                                <p className="text-sm">{`Completion: ${payload.at(1)?.value}%`}</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="engagement" fill="var(--color-primary)" radius={[BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0, 0]} maxBarSize={28} name="Engagement" />
                        <Bar dataKey="completion" fill="var(--color-gaspar-lavender)" radius={[BAR_CORNER_RADIUS, BAR_CORNER_RADIUS, 0, 0]} maxBarSize={28} name="Completion" />
                        <Legend />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No video engagement data yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
