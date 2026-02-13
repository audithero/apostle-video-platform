import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ImageBlockProps {
  src: string;
  alt: string;
  aspectRatio?: "auto" | "16:9" | "4:3" | "1:1";
  objectFit?: "cover" | "contain";
  rounded?: boolean;
  sectionId?: string;
  children?: ReactNode;
}

const aspectRatioClasses = {
  auto: "",
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
} as const;

export default function ImageBlock({
  src,
  alt,
  aspectRatio = "auto",
  objectFit = "cover",
  rounded = false,
  sectionId,
  children,
}: ImageBlockProps) {
  return (
    <figure id={sectionId} className="w-full">
      <div
        className={cn(
          "relative w-full overflow-hidden",
          aspectRatioClasses[aspectRatio],
          rounded && "rounded-xl",
        )}
      >
        <img
          src={src}
          alt={alt}
          className={cn(
            "h-full w-full",
            objectFit === "cover" ? "object-cover" : "object-contain",
          )}
          loading="lazy"
        />
      </div>
      {children}
    </figure>
  );
}
