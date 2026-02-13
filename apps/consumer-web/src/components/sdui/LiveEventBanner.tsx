import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface LiveEventBannerProps {
  title?: string;
  startTime?: string;
  hostName?: string;
  hostAvatar?: string;
  joinUrl?: string;
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

function formatTime(iso: string): string {
  try {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso;
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function LiveEventBanner({
  title = "Live Event",
  startTime = "",
  hostName = "",
  hostAvatar = "",
  joinUrl = "",
  sectionId,
  blockId,
  children,
}: LiveEventBannerProps) {
  return (
    <section
      id={sectionId ?? blockId}
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-2xl p-5",
        "bg-gradient-to-r from-[var(--sdui-color-primary,#6366f1)] to-[var(--sdui-color-primary,#6366f1)]/80",
        "text-white shadow-lg",
      )}
    >
      {/* LIVE badge */}
      <span className="flex items-center gap-1.5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold uppercase tracking-wide">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Live
      </span>

      {/* Event info */}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-lg font-bold">{title}</h3>
        {startTime && (
          <p className="text-sm text-white/80">{formatTime(startTime)}</p>
        )}
      </div>

      {/* Host */}
      {hostName && (
        <div className="flex items-center gap-2">
          {hostAvatar ? (
            <img
              src={hostAvatar}
              alt={`${hostName} avatar`}
              className="h-8 w-8 rounded-full object-cover ring-2 ring-white/30"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {hostName.charAt(0)}
            </div>
          )}
          <span className="text-sm font-medium text-white/90">{hostName}</span>
        </div>
      )}

      {/* Join button */}
      {joinUrl && (
        <a
          href={joinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-5 py-2.5",
            "bg-white font-semibold text-[var(--sdui-color-primary,#6366f1)]",
            "transition-transform hover:scale-105 active:scale-95",
          )}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--sdui-color-primary,#6366f1)] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--sdui-color-primary,#6366f1)]" />
          </span>
          Join Now
        </a>
      )}

      {children}
    </section>
  );
}
