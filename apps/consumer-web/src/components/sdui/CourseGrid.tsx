import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CourseGridProps {
  columns?: 2 | 3 | 4;
  gap?: string;
  showPrice?: boolean;
  showEnrollCount?: boolean;
  sectionId?: string;
  children?: ReactNode;
}

const columnClasses = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

function PlaceholderCard({
  showPrice,
  showEnrollCount,
}: {
  showPrice: boolean;
  showEnrollCount: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900">
      <div className="aspect-video w-full bg-neutral-200 dark:bg-neutral-800" />
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Course Title
        </h3>
        <p className="line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
          Course description goes here
        </p>
        <div className="mt-2 flex items-center justify-between">
          {showPrice ? (
            <span
              className="text-sm font-bold"
              style={{ color: "var(--sdui-color-primary, #6366f1)" }}
            >
              $49
            </span>
          ) : null}
          {showEnrollCount ? (
            <span className="text-xs text-neutral-400">0 enrolled</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function CourseGrid({
  columns = 3,
  gap = "1.5rem",
  showPrice = true,
  showEnrollCount = true,
  sectionId,
  children,
}: CourseGridProps) {
  const hasChildren = children !== undefined && children !== null;

  return (
    <section id={sectionId} className="w-full px-4 py-6">
      <div
        className={cn("grid", columnClasses[columns])}
        style={{ gap }}
      >
        {hasChildren
          ? children
          : Array.from({ length: columns }, (_, i) => (
              <PlaceholderCard
                key={`placeholder-${String(i)}`}
                showPrice={showPrice}
                showEnrollCount={showEnrollCount}
              />
            ))}
      </div>
    </section>
  );
}
