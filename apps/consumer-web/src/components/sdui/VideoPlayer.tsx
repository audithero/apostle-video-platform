import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface VideoPlayerProps {
  videoUrl: string;
  poster?: string;
  aspectRatio?: "16:9" | "4:3" | "1:1" | "9:16";
  controls?: boolean;
  autoplay?: boolean;
  sectionId?: string;
  children?: ReactNode;
}

const aspectClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
  "9:16": "aspect-[9/16]",
} as const;

function isYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

function getYouTubeEmbedUrl(url: string, autoplay: boolean): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
    /youtube\.com\/embed\/([\w-]+)/,
  ];

  let videoId = "";
  for (const pattern of patterns) {
    const match = pattern.exec(url);
    if (match?.[1]) {
      videoId = match[1];
      break;
    }
  }

  if (!videoId) return url;

  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  params.set("rel", "0");

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export default function VideoPlayer({
  videoUrl,
  poster,
  aspectRatio = "16:9",
  controls = true,
  autoplay = false,
  sectionId,
  children,
}: VideoPlayerProps) {
  const isYT = isYouTubeUrl(videoUrl);

  return (
    <section id={sectionId} className="w-full">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl bg-black",
          aspectClasses[aspectRatio],
        )}
      >
        {isYT ? (
          <iframe
            src={getYouTubeEmbedUrl(videoUrl, autoplay)}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Video player"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {poster ? (
              <img
                src={poster}
                alt="Video poster"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="relative z-10 flex flex-col items-center gap-3 text-white">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <title>Play</title>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-sm font-medium opacity-80">
                {controls ? "Video player" : "Mux playback"}
              </p>
            </div>
          </div>
        )}
      </div>
      {children}
    </section>
  );
}
