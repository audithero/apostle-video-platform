import type { ReactNode } from "react";
import type { SDUIAction } from "@platform/sdui-schema";
import { useAction } from "@/renderer/ActionHandler";
import { cn } from "@/lib/cn";

interface CTAButtonProps {
  text: string;
  action?: SDUIAction;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  blockId?: string;
  children?: ReactNode;
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
} as const;

export default function CTAButton({
  text,
  action,
  variant = "primary",
  size = "md",
  fullWidth = false,
  blockId,
  children,
}: CTAButtonProps) {
  const { handleAction } = useAction();

  const handleClick = () => {
    if (action) {
      handleAction(action);
    }
  };

  return (
    <button
      id={blockId}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        sizeClasses[size],
        fullWidth && "w-full",
        variant === "primary" &&
          "text-white shadow-sm hover:opacity-90",
        variant === "secondary" &&
          "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
        variant === "outline" &&
          "border-2 bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900",
      )}
      style={
        variant === "primary"
          ? { backgroundColor: "var(--sdui-color-primary, #6366f1)" }
          : variant === "outline"
            ? { borderColor: "var(--sdui-color-primary, #6366f1)", color: "var(--sdui-color-primary, #6366f1)" }
            : undefined
      }
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {text}
      {children}
    </button>
  );
}
