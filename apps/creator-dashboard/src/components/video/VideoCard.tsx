import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Play } from "lucide-react";

interface VideoCardProps {
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
  duration?: number | null;
  isFree: boolean;
  seriesTitle?: string | null;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoCard({
  title,
  slug,
  thumbnailUrl,
  duration,
  isFree,
  seriesTitle,
}: VideoCardProps) {
  return (
    <Link to="/watch/$slug" params={{ slug }}>
      <Card className="group overflow-hidden p-0 transition-shadow hover:shadow-md">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Play className="size-12 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <Play className="size-10 text-white opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            {duration != null && (
              <Badge variant="secondary" className="bg-black/70 text-white">
                <Clock className="size-3" />
                {formatDuration(duration)}
              </Badge>
            )}
            {isFree && <Badge variant="default">Free</Badge>}
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
            {title}
          </h3>
          {seriesTitle && (
            <p className="mt-1 text-xs text-muted-foreground">{seriesTitle}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
