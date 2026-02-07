import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  MessageSquare,
  Pencil,
  Star,
  ThumbsUp,
  Trophy,
  Zap,
  BookCheck,
  GraduationCap,
  Users,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/_authed/dashboard/settings/gamification",
)({
  component: GamificationSettings,
  errorComponent: RouteErrorBoundary,
});

// -- Level Config (mirrors leaderboard page) ----------------------------------

const LEVEL_THRESHOLDS = [
  0, 50, 150, 300, 500, 800, 1_200, 1_800, 2_500, 3_500,
] as const;

const LEVEL_NAMES = [
  "Newcomer",
  "Explorer",
  "Learner",
  "Achiever",
  "Scholar",
  "Expert",
  "Master",
  "Sage",
  "Legend",
  "Champion",
] as const;

const LEVEL_COLORS = [
  "bg-slate-500",
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-orange-500",
  "bg-rose-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-yellow-500",
] as const;

const DEFAULT_POINT_VALUES = {
  post: 5,
  comment: 3,
  reaction_received: 1,
  lesson_completed: 10,
  course_completed: 100,
} as const;

interface PointConfig {
  post: number;
  comment: number;
  reaction_received: number;
  lesson_completed: number;
  course_completed: number;
}

// -- Page Component -----------------------------------------------------------

function GamificationSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery(
    trpc.creatorSettings.getSettings.queryOptions(),
  );

  const { data: overview, isLoading: overviewLoading } = useQuery(
    trpc.gamification.getOverview.queryOptions(),
  );

  const [enabled, setEnabled] = useState(true);
  const [pointValues, setPointValues] = useState<PointConfig>({
    ...DEFAULT_POINT_VALUES,
  });

  useEffect(() => {
    if (settings) {
      setEnabled(settings.gamificationEnabled ?? true);
      const saved = settings.gamificationPointValues as PointConfig | null;
      if (saved) {
        setPointValues(saved);
      }
    }
  }, [settings]);

  const updateSettings = useMutation(
    trpc.creatorSettings.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.creatorSettings.getSettings.queryKey(),
        });
        toast.success("Gamification settings saved");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSave = useCallback(() => {
    updateSettings.mutate({
      gamificationEnabled: enabled,
      gamificationPointValues: pointValues,
    });
  }, [enabled, pointValues, updateSettings]);

  const handleResetDefaults = useCallback(() => {
    setPointValues({ ...DEFAULT_POINT_VALUES });
  }, []);

  const updatePointValue = useCallback(
    (key: keyof PointConfig, value: string) => {
      const parsed = Number.parseInt(value, 10);
      if (!Number.isNaN(parsed) && parsed >= 0) {
        setPointValues((prev) => ({ ...prev, [key]: parsed }));
      }
    },
    [],
  );

  if (settingsLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="size-7 text-amber-500" />
          <div>
            <h1 className="text-3xl font-bold">Gamification</h1>
            <p className="text-muted-foreground">
              Reward your students with points, levels, and leaderboards.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="gamification-toggle" className="text-sm">
            {enabled ? "Enabled" : "Disabled"}
          </Label>
          <Switch
            id="gamification-toggle"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </div>

      {/* Overview Stats */}
      {!overviewLoading && overview ? (
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard
            label="Total Members"
            value={String(overview.totalMembers)}
            icon={<Users className="size-5 text-blue-500" />}
          />
          <StatCard
            label="Total Points Awarded"
            value={overview.totalPointsAwarded.toLocaleString()}
            icon={<Zap className="size-5 text-amber-500" />}
          />
          <StatCard
            label="Avg Points / Member"
            value={String(overview.avgPoints)}
            icon={<BarChart3 className="size-5 text-emerald-500" />}
          />
          <StatCard
            label="Active Levels"
            value={String(
              overview.levelDistribution.filter((l) => l.count > 0).length,
            )}
            icon={<Star className="size-5 text-violet-500" />}
          />
        </div>
      ) : overviewLoading ? (
        <div className="grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : null}

      {/* Point Values */}
      <Card className={cn(!enabled && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Point Values</CardTitle>
              <CardDescription>
                Configure how many points each action awards.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
            >
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PointValueField
              label="Create Post"
              icon={<Pencil className="size-4 text-blue-500" />}
              value={pointValues.post}
              onChange={(v) => updatePointValue("post", v)}
              defaultValue={DEFAULT_POINT_VALUES.post}
            />
            <PointValueField
              label="Comment"
              icon={<MessageSquare className="size-4 text-emerald-500" />}
              value={pointValues.comment}
              onChange={(v) => updatePointValue("comment", v)}
              defaultValue={DEFAULT_POINT_VALUES.comment}
            />
            <PointValueField
              label="Receive Reaction"
              icon={<ThumbsUp className="size-4 text-pink-500" />}
              value={pointValues.reaction_received}
              onChange={(v) => updatePointValue("reaction_received", v)}
              defaultValue={DEFAULT_POINT_VALUES.reaction_received}
            />
            <PointValueField
              label="Complete Lesson"
              icon={<BookCheck className="size-4 text-amber-500" />}
              value={pointValues.lesson_completed}
              onChange={(v) => updatePointValue("lesson_completed", v)}
              defaultValue={DEFAULT_POINT_VALUES.lesson_completed}
            />
            <PointValueField
              label="Complete Course"
              icon={<GraduationCap className="size-4 text-violet-500" />}
              value={pointValues.course_completed}
              onChange={(v) => updatePointValue("course_completed", v)}
              defaultValue={DEFAULT_POINT_VALUES.course_completed}
            />
          </div>
        </CardContent>
      </Card>

      {/* Level Thresholds (read-only) */}
      <Card className={cn(!enabled && "opacity-50 pointer-events-none")}>
        <CardHeader>
          <CardTitle>Level Progression</CardTitle>
          <CardDescription>
            Students advance through 10 levels as they earn points. Thresholds
            are preset for balanced progression.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LEVEL_NAMES.map((name, idx) => {
              const threshold = LEVEL_THRESHOLDS[idx];
              const nextThreshold =
                idx < 9 ? LEVEL_THRESHOLDS[idx + 1] : LEVEL_THRESHOLDS[9];
              const memberCount =
                overview?.levelDistribution[idx]?.count ?? 0;

              return (
                <div
                  key={name}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-full text-xs font-bold text-white",
                      LEVEL_COLORS[idx],
                    )}
                  >
                    {String(idx + 1)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{name}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {`${String(threshold)} pts`}
                      </Badge>
                    </div>
                    <Progress
                      value={
                        idx < 9
                          ? (threshold / nextThreshold) * 100
                          : 100
                      }
                      className="mt-1 h-1.5"
                      aria-label={`Level ${String(idx + 1)} threshold`}
                    />
                  </div>
                  <div className="text-right">
                    {memberCount > 0 ? (
                      <Badge variant="secondary" className="text-xs">
                        {`${String(memberCount)} ${memberCount === 1 ? "member" : "members"}`}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        No members
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={handleSave}
          disabled={updateSettings.isPending}
        >
          {updateSettings.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}

// -- Stat Card ----------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
}: {
  readonly label: string;
  readonly value: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        {icon}
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// -- Point Value Field --------------------------------------------------------

function PointValueField({
  label,
  icon,
  value,
  onChange,
  defaultValue,
}: {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly value: number;
  readonly onChange: (value: string) => void;
  readonly defaultValue: number;
}) {
  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          min={0}
          max={1000}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          className="w-24"
        />
        <span className="text-xs text-muted-foreground">pts</span>
        {value !== defaultValue ? (
          <Badge variant="outline" className="text-[10px] text-amber-600">
            Custom
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
