import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value?: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

export default function ProgressBar({
  value = 0,
  label = "Progress",
  showPercentage = true,
  color,
  sectionId,
  blockId,
  children,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div id={sectionId ?? blockId} className="w-full space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        )}
        {showPercentage && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {Math.round(clamped)}%
          </span>
        )}
      </div>

      <div
        className={cn(
          "h-3 w-full overflow-hidden rounded-full",
          "bg-gray-200 dark:bg-white/10",
        )}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${String(clamped)}%`,
            backgroundColor: color ?? "var(--sdui-color-primary, #6366f1)",
          }}
        />
      </div>

      {children}
    </div>
  );
}
