import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, Crown, Medal, Trophy } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTRPC } from "@/lib/trpc/react";
import { LevelBadge } from "./LevelBadge";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  readonly creatorId: string;
  /** Max entries to display */
  readonly limit?: number;
}

interface LeaderboardEntry {
  readonly rank: number;
  readonly userId: string;
  readonly name: string;
  readonly image: string | null;
  readonly totalPoints: number;
  readonly level: number;
}

export function Leaderboard({ creatorId, limit = 20 }: LeaderboardProps) {
  const trpc = useTRPC();
  const [timeframe, setTimeframe] = useState<"7d" | "30d" | "all">("all");

  const { data: leaderboard, isLoading } = useQuery(
    trpc.gamification.getLeaderboard.queryOptions({
      creatorId,
      timeframe,
      limit,
    }),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Rankings</h2>
        <Tabs
          value={timeframe}
          onValueChange={(v) => setTimeframe(v as "7d" | "30d" | "all")}
        >
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-4 w-40 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : leaderboard && leaderboard.length > 0 ? (
        <div className="mt-4 space-y-1">
          {leaderboard.map((entry) => (
            <LeaderboardRow key={entry.userId} entry={entry} />
          ))}
        </div>
      ) : (
        <Card className="mt-4">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Trophy className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No activity yet. Start participating to appear on the
              leaderboard.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// -- Leaderboard Row ----------------------------------------------------------

function LeaderboardRow({ entry }: { readonly entry: LeaderboardEntry }) {
  const RankIcon =
    entry.rank === 1
      ? Crown
      : entry.rank === 2
        ? Medal
        : entry.rank === 3
          ? Award
          : null;

  const rankColor =
    entry.rank === 1
      ? "text-amber-500"
      : entry.rank === 2
        ? "text-slate-400"
        : entry.rank === 3
          ? "text-amber-700"
          : "text-muted-foreground";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors",
        entry.rank <= 3 && "bg-muted/30",
      )}
    >
      {/* Rank */}
      <div className="flex w-8 items-center justify-center">
        {RankIcon ? (
          <RankIcon className={cn("size-5", rankColor)} />
        ) : (
          <span className={cn("text-sm font-medium", rankColor)}>
            {String(entry.rank)}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
        {entry.image ? (
          <img
            src={entry.image}
            alt=""
            className="size-full rounded-full object-cover"
          />
        ) : (
          entry.name.charAt(0).toUpperCase()
        )}
      </div>

      {/* Name + Level */}
      <div className="flex-1">
        <p className="text-sm font-medium">{entry.name}</p>
        <LevelBadge level={entry.level} />
      </div>

      {/* Points */}
      <div className="text-right">
        <p className="text-sm font-bold">
          {`${String(entry.totalPoints)} pts`}
        </p>
      </div>
    </div>
  );
}
