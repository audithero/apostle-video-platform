import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificatePreviewProps {
  readonly title: string;
  readonly subtitle: string;
  readonly logoUrl: string;
  readonly backgroundImageUrl: string;
  readonly includeDate: boolean;
  readonly includeSerial: boolean;
  readonly studentName?: string;
  readonly courseName?: string;
  readonly completionDate?: Date;
  readonly serial?: string;
  readonly className?: string;
}

const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);

/**
 * Visual certificate preview card used in the course builder's certificate settings.
 * Renders a styled certificate layout with configurable fields for live preview.
 */
export const CertificatePreview = ({
  title,
  subtitle,
  logoUrl,
  backgroundImageUrl,
  includeDate,
  includeSerial,
  studentName = "Jane Doe",
  courseName = "Course Title",
  completionDate,
  serial = "CERT-XXXXXX-XXXXX",
  className,
}: CertificatePreviewProps) => {
  const displayDate = completionDate ?? new Date();

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border-2 border-amber-200 dark:border-amber-800",
        className,
      )}
      aria-label="Certificate preview"
    >
      {/* Background layer */}
      {backgroundImageUrl.length > 0 ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30" />
      )}

      {/* Decorative border lines */}
      <div className="absolute inset-2 rounded-md border border-amber-300/50 dark:border-amber-700/50" />
      <div className="absolute inset-3 rounded border border-amber-200/30 dark:border-amber-800/30" />

      {/* Content */}
      <div className="relative flex flex-col items-center px-6 py-8 text-center">
        {/* Logo */}
        {logoUrl.length > 0 ? (
          <img
            src={logoUrl}
            alt={`${title} credential`}
            className="mb-3 h-12 w-auto object-contain"
          />
        ) : (
          <div className="mb-3 rounded-full bg-amber-100 p-2.5 dark:bg-amber-900/40">
            <Award className="size-7 text-amber-600 dark:text-amber-400" />
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold tracking-wide text-amber-900 dark:text-amber-100">
          {title || "Certificate of Completion"}
        </h3>

        {/* Subtitle */}
        {subtitle.length > 0 && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            {subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="my-4 h-px w-24 bg-amber-300 dark:bg-amber-700" />

        {/* Presented to */}
        <p className="text-[10px] uppercase tracking-widest text-amber-500 dark:text-amber-500">
          This certifies that
        </p>

        {/* Student Name */}
        <p className="mt-2 font-serif text-xl font-semibold text-amber-900 dark:text-amber-100">
          {studentName}
        </p>

        {/* Course completion text */}
        <p className="mt-2 max-w-[240px] text-xs text-amber-700 dark:text-amber-300">
          {`has successfully completed the course`}
        </p>

        {/* Course Name */}
        <p className="mt-1 text-sm font-semibold text-amber-800 dark:text-amber-200">
          {courseName}
        </p>

        {/* Date */}
        {includeDate && (
          <p className="mt-4 text-[10px] text-amber-500 dark:text-amber-500">
            {formatDate(displayDate)}
          </p>
        )}

        {/* Serial */}
        {includeSerial && (
          <p className="mt-1 font-mono text-[9px] tracking-wider text-amber-400 dark:text-amber-600">
            {serial}
          </p>
        )}
      </div>
    </div>
  );
};
