import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface LeaderboardEntry {
  name: string;
  avatar?: string;
  points: number;
}

interface LeaderboardWidgetProps {
  maxEntries?: number;
  timeframe?: "weekly" | "monthly" | "alltime";
  showPoints?: boolean;
  entries?: LeaderboardEntry[];
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

const placeholderEntries: LeaderboardEntry[] = [
  { name: "Alex R.", points: 2_450 },
  { name: "Sarah K.", points: 2_120 },
  { name: "James T.", points: 1_890 },
  { name: "Maria S.", points: 1_640 },
  { name: "Priya R.", points: 1_350 },
  { name: "David C.", points: 1_100 },
  { name: "Emma L.", points: 980 },
  { name: "Carlos M.", points: 870 },
  { name: "Yuki N.", points: 720 },
  { name: "Fatima A.", points: 650 },
];

const timeframeLabels: Record<string, string> = {
  weekly: "This Week",
  monthly: "This Month",
  alltime: "All Time",
};

const rankBadge = (rank: number): string | null => {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return null;
};

export default function LeaderboardWidget({
  maxEntries = 10,
  timeframe: defaultTimeframe = "weekly",
  showPoints = true,
  entries,
  sectionId,
  blockId,
  children,
}: LeaderboardWidgetProps) {
  const [timeframe, setTimeframe] = useState(defaultTimeframe);
  const items = (entries && entries.length > 0 ? entries : placeholderEntries).slice(0, maxEntries);
  const timeframeOptions = ["weekly", "monthly", "alltime"] as const;

  return (
    <section id={sectionId ?? blockId} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Leaderboard</h3>

        <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-white/10">
          {timeframeOptions.map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => setTimeframe(tf)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setTimeframe(tf); }}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                timeframe === tf
                  ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
              )}
            >
              {timeframeLabels[tf]}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl bg-white/80 shadow-sm backdrop-blur-sm dark:bg-white/5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-500 dark:border-white/10 dark:text-gray-400">
              <th scope="col" className="px-4 py-3 text-left font-medium">Rank</th>
              <th scope="col" className="px-4 py-3 text-left font-medium">Student</th>
              {showPoints && <th scope="col" className="px-4 py-3 text-right font-medium">Points</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((entry, i) => {
              const rank = i + 1;
              const badge = rankBadge(rank);
              return (
                <tr
                  key={`${entry.name}-${String(rank)}`}
                  className={cn(
                    "border-b border-gray-50 last:border-0 dark:border-white/5",
                    rank <= 3 && "bg-[var(--sdui-color-primary,#6366f1)]/[0.03]",
                  )}
                >
                  <td className="px-4 py-3 text-sm">
                    {badge ? (
                      <span className="text-lg" role="img" aria-label={`Rank ${String(rank)}`}>{badge}</span>
                    ) : (
                      <span className="text-gray-400">{rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {entry.avatar ? (
                        <img
                          src={entry.avatar}
                          alt={`${entry.name} avatar`}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--sdui-color-primary,#6366f1)]/10 text-[10px] font-bold text-[var(--sdui-color-primary,#6366f1)]">
                          {entry.name.charAt(0)}
                        </div>
                      )}
                      <span className={cn(
                        "text-sm",
                        rank <= 3 ? "font-semibold text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300",
                      )}>
                        {entry.name}
                      </span>
                    </div>
                  </td>
                  {showPoints && (
                    <td className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gray-900 dark:text-white">
                      {entry.points.toLocaleString()}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {children}
    </section>
  );
}
