import type { ReactNode } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/cn";

interface TextBlockProps {
  content: string;
  alignment?: "left" | "center" | "right";
  maxWidth?: string;
  sectionId?: string;
  children?: ReactNode;
}

const alignmentClasses = {
  left: "text-left",
  center: "text-center mx-auto",
  right: "text-right ml-auto",
} as const;

export default function TextBlock({
  content,
  alignment = "left",
  maxWidth = "none",
  sectionId,
  children,
}: TextBlockProps) {
  const isHtml = /<[a-z][\s\S]*>/i.test(content);

  return (
    <div
      id={sectionId}
      className={cn("w-full px-4 py-6", alignmentClasses[alignment])}
      style={{ maxWidth: maxWidth === "none" ? undefined : maxWidth }}
    >
      {isHtml ? (
        <div
          className="sdui-richtext prose prose-neutral max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      ) : (
        <p className="text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
          {content}
        </p>
      )}
      {children}
    </div>
  );
}
