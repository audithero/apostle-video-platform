import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CertificateDisplayProps {
  courseName?: string;
  studentName?: string;
  completedDate?: string;
  certificateUrl?: string;
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function CertificateDisplay({
  courseName = "Course Name",
  studentName = "Student Name",
  completedDate = "",
  certificateUrl = "",
  sectionId,
  blockId,
  children,
}: CertificateDisplayProps) {
  return (
    <article
      id={sectionId ?? blockId}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-md",
        "dark:bg-gray-900",
      )}
    >
      {/* Decorative border */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl",
          "border-4 border-double border-[var(--sdui-color-primary,#6366f1)]/30",
        )}
      />
      {/* Corner accents */}
      <div className="pointer-events-none absolute left-3 top-3 h-6 w-6 border-l-2 border-t-2 border-[var(--sdui-color-primary,#6366f1)]/40" />
      <div className="pointer-events-none absolute right-3 top-3 h-6 w-6 border-r-2 border-t-2 border-[var(--sdui-color-primary,#6366f1)]/40" />
      <div className="pointer-events-none absolute bottom-3 left-3 h-6 w-6 border-b-2 border-l-2 border-[var(--sdui-color-primary,#6366f1)]/40" />
      <div className="pointer-events-none absolute bottom-3 right-3 h-6 w-6 border-b-2 border-r-2 border-[var(--sdui-color-primary,#6366f1)]/40" />

      {/* Award icon */}
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sdui-color-primary,#6366f1)]/10">
        <svg
          className="h-7 w-7 text-[var(--sdui-color-primary,#6366f1)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <title>Certificate award</title>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
        </svg>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        Certificate of Completion
      </p>

      <h3 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
        {courseName}
      </h3>

      <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
        Awarded to
      </p>
      <p className="text-xl font-semibold text-[var(--sdui-color-primary,#6366f1)]">
        {studentName}
      </p>

      {completedDate && (
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          Completed on {formatDate(completedDate)}
        </p>
      )}

      {certificateUrl && (
        <a
          href={certificateUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
            "bg-[var(--sdui-color-primary,#6366f1)] font-semibold text-white",
            "transition-transform hover:scale-105 active:scale-95",
          )}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <title>Download</title>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          View Certificate
        </a>
      )}

      {children}
    </article>
  );
}
