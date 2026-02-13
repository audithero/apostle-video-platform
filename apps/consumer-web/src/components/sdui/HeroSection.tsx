import type { ReactNode } from "react";
import type { SDUIAction } from "@platform/sdui-schema";
import { useAction } from "@/renderer/ActionHandler";
import { cn } from "@/lib/cn";

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaAction?: SDUIAction;
  alignment?: "left" | "center" | "right";
  overlayOpacity?: number;
  sectionId?: string;
  children?: ReactNode;
}

const alignmentClasses = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
} as const;

export default function HeroSection({
  title,
  subtitle,
  backgroundImage,
  ctaText,
  ctaAction,
  alignment = "center",
  overlayOpacity = 0.4,
  sectionId,
  children,
}: HeroSectionProps) {
  const { handleAction } = useAction();

  return (
    <section
      id={sectionId}
      className="relative flex min-h-[400px] w-full items-center justify-center overflow-hidden"
    >
      {backgroundImage ? (
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
        aria-hidden="true"
      />

      <div
        className={cn(
          "relative z-10 flex max-w-3xl flex-col gap-4 px-6 py-16",
          alignmentClasses[alignment],
        )}
      >
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="max-w-xl text-lg text-white/80">{subtitle}</p>
        ) : null}

        {ctaText && ctaAction ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center rounded-lg px-6 py-3 text-base font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--sdui-color-primary, #6366f1)" }}
            onClick={() => handleAction(ctaAction)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleAction(ctaAction);
              }
            }}
          >
            {ctaText}
          </button>
        ) : null}

        {children}
      </div>
    </section>
  );
}
