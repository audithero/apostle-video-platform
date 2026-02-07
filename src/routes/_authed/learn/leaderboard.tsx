import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Star,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { Leaderboard } from "@/components/community/Leaderboard";
import { LevelBadge, LEVEL_COLORS } from "@/components/community/LevelBadge";
import { cn } from "@/lib/utils";
import { z } from "zod";

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1_200, 1_800, 2_500, 3_500] as const;

const searchSchema = z.object({
  creatorId: z.string(),
});

export const Route = createFileRoute("/_authed/learn/leaderboard")({
  component: LeaderboardPage,
  errorComponent: RouteErrorBoundary,
  validateSearch: searchSchema,
});

function getNextLevelThreshold(level: number): number {
  return level < 10 ? LEVEL_THRESHOLDS[level] : LEVEL_THRESHOLDS[9];
}

function getCurrentLevelThreshold(level: number): number {
  return LEVEL_THRESHOLDS[Math.max(0, level - 1)];
}

function LeaderboardPage() {
  const trpc = useTRPC();
  const { creatorId } = Route.useSearch();

  const { data: myStats, isLoading: isLoadingStats } = useQuery(
    trpc.gamification.getMyStats.queryOptions({ creatorId }),
  );

  const currentLevel = myStats?.level ?? 1;
  const currentPoints = myStats?.totalPoints ?? 0;
  const nextThreshold = getNextLevelThreshold(currentLevel);
  const currentThreshold = getCurrentLevelThreshold(currentLevel);
  const progressInLevel =
    nextThreshold > currentThreshold
      ? Math.round(
          ((currentPoints - currentThreshold) /
            (nextThreshold - currentThreshold)) *
            100,
        )
      : 100;

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-3">
        <Trophy className="size-7 text-amber-500" />
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">
            Earn points by participating and completing courses.
          </p>
        </div>
      </div>

      {/* My Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Your Points</CardDescription>
            <Zap className="size-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold">
                {String(currentPoints)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Level</CardDescription>
            <Star className={cn("size-5", LEVEL_COLORS[currentLevel - 1])} />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div>
                <p className="text-3xl font-bold">
                  {String(currentLevel)}
                </p>
                <LevelBadge level={currentLevel} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Next Level</CardDescription>
            <TrendingUp className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-9 w-20" />
            ) : currentLevel >= 10 ? (
              <p className="text-sm font-medium text-emerald-600">
                Max level reached
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {`${String(nextThreshold - currentPoints)} pts to go`}
                </p>
                <Progress
                  value={progressInLevel}
                  className="h-2"
                  aria-label="Progress to next level"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* How Points Work */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <PointBadge label="Create Post" points={5} />
            <PointBadge label="Comment" points={3} />
            <PointBadge label="Receive Reaction" points={1} />
            <PointBadge label="Complete Lesson" points={10} />
            <PointBadge label="Complete Course" points={100} />
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Rankings */}
      <section className="mt-8">
        <Leaderboard creatorId={creatorId} limit={20} />
      </section>
    </div>
  );
}

// -- Point Badge --------------------------------------------------------------

function PointBadge({
  label,
  points,
}: {
  readonly label: string;
  readonly points: number;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-muted/30 px-3 py-1.5">
      <Zap className="size-3 text-amber-500" />
      <span className="text-xs">{label}</span>
      <Badge variant="secondary" className="ml-1 text-[10px]">
        {`+${String(points)}`}
      </Badge>
    </div>
  );
}
