import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface StreakCounterProps {
  currentStreak?: number;
  longestStreak?: number;
  icon?: string;
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

export default function StreakCounter({
  currentStreak = 0,
  longestStreak = 0,
  sectionId,
  blockId,
  children,
}: StreakCounterProps) {
  return (
    <div
      id={sectionId ?? blockId}
      className={cn(
        "inline-flex flex-col items-center gap-3 rounded-2xl p-6",
        "bg-gradient-to-br from-orange-50 to-amber-50",
        "shadow-sm dark:from-orange-950/30 dark:to-amber-950/30",
      )}
    >
      <div className="flex items-center gap-2">
        <svg
          className="h-8 w-8 text-orange-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <title>Streak fire</title>
          <path d="M12 23c-4.97 0-9-3.582-9-8 0-2.586 1.37-5.211 3.438-7.602a.75.75 0 011.21.17c.588 1.12 1.39 2.063 2.352 2.73C10.56 7.078 11.25 3.5 14.5 1a.75.75 0 011.188.61C15.79 5.024 17 6.5 18.25 8c1.354 1.625 2.75 3.304 2.75 7 0 4.418-4.03 8-9 8zm0-2c3.86 0 7-2.691 7-6 0-3.037-1.104-4.387-2.375-5.912C15.556 7.807 14.635 6.358 14.09 4.2c-1.89 2.06-2.59 4.328-3.84 5.3-1.278.994-2.618.958-3.718.458C5.578 11.534 5 13.2 5 15c0 3.309 3.14 6 7 6z" />
        </svg>
        <span className="text-5xl font-extrabold tabular-nums text-orange-600 dark:text-orange-400">
          {currentStreak}
        </span>
      </div>

      <p className="text-sm font-semibold uppercase tracking-wider text-orange-700/70 dark:text-orange-300/70">
        day streak
      </p>

      {longestStreak > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Longest: <span className="font-semibold">{longestStreak} days</span>
        </p>
      )}

      {children}
    </div>
  );
}
