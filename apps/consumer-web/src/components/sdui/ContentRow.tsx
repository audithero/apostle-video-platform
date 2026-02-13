import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ContentRowProps {
  title: string;
  subtitle?: string;
  sectionId?: string;
  children?: ReactNode;
}

export default function ContentRow({
  title,
  subtitle,
  sectionId,
  children,
}: ContentRowProps) {
  return (
    <section id={sectionId} className="w-full py-6">
      <header className="mb-4 px-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </p>
        ) : null}
      </header>

      <div
        className={cn(
          "flex gap-4 overflow-x-auto px-4 pb-4",
          "scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600",
          "[&>*]:flex-shrink-0",
        )}
      >
        {children ?? (
          <p className="text-sm text-neutral-400">No content available</p>
        )}
      </div>
    </section>
  );
}
