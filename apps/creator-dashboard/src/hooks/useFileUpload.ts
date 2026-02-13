import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation } from "@tanstack/react-query";

export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const trpc = useTRPC();

  const getPresignedUrl = useMutation(
    trpc.uploads.getPresignedUrl.mutationOptions(),
  );

  const upload = async (file: File, folder: string = "uploads") => {
    setUploading(true);
    setProgress(0);

    try {
      const { presignedUrl, publicUrl } = await getPresignedUrl.mutateAsync({
        fileName: file.name,
        contentType: file.type,
        folder,
      });

      await fetch(presignedUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setProgress(100);
      return publicUrl;
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress };
}
