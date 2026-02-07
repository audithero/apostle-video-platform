import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

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
  "text-slate-500",
  "text-emerald-500",
  "text-blue-500",
  "text-violet-500",
  "text-amber-500",
  "text-orange-500",
  "text-rose-500",
  "text-pink-500",
  "text-indigo-500",
  "text-yellow-500",
] as const;

interface LevelBadgeProps {
  readonly level: number;
  /** Show level name alongside the number */
  readonly showName?: boolean;
  /** Additional class names */
  readonly className?: string;
}

export function LevelBadge({
  level,
  showName = true,
  className,
}: LevelBadgeProps) {
  const clampedLevel = Math.max(1, Math.min(level, 10));
  const color = LEVEL_COLORS[clampedLevel - 1];
  const name = LEVEL_NAMES[clampedLevel - 1];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-medium",
        color,
        className,
      )}
    >
      <Star className="size-2.5" />
      {showName
        ? `Lv.${String(clampedLevel)} ${name}`
        : `Lv.${String(clampedLevel)}`}
    </span>
  );
}

export { LEVEL_NAMES, LEVEL_COLORS };
