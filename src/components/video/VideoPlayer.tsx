"use client";
import MuxPlayer from "@mux/mux-player-react";
import { useCallback, useRef } from "react";

interface VideoPlayerProps {
  playbackId: string;
  token?: string;
  thumbnailToken?: string;
  title: string;
  startTime?: number;
  onProgress?: (currentTime: number) => void;
}

export function VideoPlayer({
  playbackId,
  token,
  thumbnailToken,
  title,
  startTime,
  onProgress,
}: VideoPlayerProps) {
  const lastSaved = useRef(0);

  const handleTimeUpdate = useCallback(
    (event: Event) => {
      const player = event.target as HTMLMediaElement;
      const currentTime = Math.floor(player.currentTime);
      // Save every 10 seconds
      if (currentTime - lastSaved.current >= 10) {
        lastSaved.current = currentTime;
        onProgress?.(currentTime);
      }
    },
    [onProgress],
  );

  return (
    <MuxPlayer
      playbackId={playbackId}
      tokens={
        token ? { playback: token, thumbnail: thumbnailToken } : undefined
      }
      metadata={{ video_title: title }}
      startTime={startTime}
      onTimeUpdate={handleTimeUpdate}
      streamType="on-demand"
      accentColor="#e11d48"
      style={{ width: "100%", aspectRatio: "16/9" }}
    />
  );
}
