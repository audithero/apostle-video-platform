"use client";
import MuxUploader from "@mux/mux-uploader-react";

interface VideoUploaderProps {
  uploadUrl: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function VideoUploader({
  uploadUrl,
  onSuccess,
  onError,
}: VideoUploaderProps) {
  return (
    <div className="border-2 border-dashed rounded-lg p-8">
      <MuxUploader
        endpoint={uploadUrl}
        onSuccess={onSuccess}
        onError={(e: any) =>
          onError?.(new Error(e.detail?.message || "Upload failed"))
        }
      />
    </div>
  );
}
