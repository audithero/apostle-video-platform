import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface LessonCardProps {
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  lessonType?: "video" | "text" | "quiz" | "assignment" | "live";
  isFreePreview?: boolean;
  isCompleted?: boolean;
  blockId?: string;
  children?: ReactNode;
}

const lessonTypeIcons: Record<string, string> = {
  video: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z",
  text: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  quiz: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
  assignment: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  live: "M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z",
};

export default function LessonCard({
  title,
  description,
  thumbnailUrl,
  duration = "5 min",
  lessonType = "video",
  isFreePreview = false,
  isCompleted = false,
  blockId,
  children,
}: LessonCardProps) {
  const iconPath = lessonTypeIcons[lessonType] ?? lessonTypeIcons.video;

  return (
    <article
      id={blockId}
      className={cn(
        "group flex gap-4 rounded-lg border p-3 transition-colors",
        isCompleted
          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
          : "border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600",
      )}
    >
      {thumbnailUrl ? (
        <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-md">
          <img
            src={thumbnailUrl}
            alt={`Thumbnail for ${title}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          {duration ? (
            <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
              {duration}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 flex-shrink-0 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <title>{`${lessonType} lesson`}</title>
            <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
          </svg>

          <h3 className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>

          {isFreePreview ? (
            <span
              className="flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: "var(--sdui-color-primary, #6366f1)" }}
            >
              Free
            </span>
          ) : null}
        </div>

        {description ? (
          <p className="line-clamp-1 text-xs text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}

        {!thumbnailUrl && duration ? (
          <span className="text-xs text-neutral-400">{duration}</span>
        ) : null}
      </div>

      {isCompleted ? (
        <div className="flex flex-shrink-0 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <title>Completed</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ) : null}

      {children}
    </article>
  );
}
