import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Testimonial {
  name: string;
  avatar?: string;
  quote: string;
  role?: string;
}

interface TestimonialCarouselProps {
  autoplay?: boolean;
  interval?: number;
  testimonials?: Testimonial[];
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

const placeholder: Testimonial[] = [
  { name: "Alex R.", quote: "This course completely changed my career path!", role: "Student" },
  { name: "Maria S.", quote: "Best online learning experience I have ever had.", role: "Graduate" },
  { name: "James T.", quote: "The instructor truly cares about every student.", role: "Professional" },
];

export default function TestimonialCarousel({
  autoplay = true,
  interval = 5000,
  testimonials,
  sectionId,
  blockId,
  children,
}: TestimonialCarouselProps) {
  const items = testimonials && testimonials.length > 0 ? testimonials : placeholder;
  const [active, setActive] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prev = useCallback(() => {
    setActive((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    timerRef.current = setInterval(next, interval);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay, interval, next, items.length]);

  const pauseAutoplay = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const resumeAutoplay = () => {
    if (!autoplay || items.length <= 1) return;
    timerRef.current = setInterval(next, interval);
  };

  const current = items[active];
  if (!current) return null;

  return (
    <section
      id={sectionId ?? blockId}
      className="relative overflow-hidden rounded-2xl bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:bg-white/5"
      onMouseEnter={pauseAutoplay}
      onMouseLeave={resumeAutoplay}
      onFocus={pauseAutoplay}
      onBlur={resumeAutoplay}
    >
      <div className="mx-auto max-w-2xl text-center">
        <svg
          className="mx-auto mb-4 h-8 w-8 text-[var(--sdui-color-primary,#6366f1)]/40"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <title>Quote mark</title>
          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
        </svg>

        <blockquote className="text-lg font-medium leading-relaxed text-gray-700 dark:text-gray-200">
          &ldquo;{current.quote}&rdquo;
        </blockquote>

        <div className="mt-6 flex items-center justify-center gap-3">
          {current.avatar ? (
            <img
              src={current.avatar}
              alt={`${current.name} avatar`}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--sdui-color-primary,#6366f1)]/10 text-sm font-bold text-[var(--sdui-color-primary,#6366f1)]">
              {current.name.charAt(0)}
            </div>
          )}
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{current.name}</p>
            {current.role && (
              <p className="text-xs text-gray-500 dark:text-gray-400">{current.role}</p>
            )}
          </div>
        </div>
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") prev(); }}
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2",
              "bg-white/80 text-gray-600 shadow transition-colors",
              "hover:bg-[var(--sdui-color-primary,#6366f1)] hover:text-white",
              "dark:bg-white/10 dark:text-gray-300",
            )}
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <title>Previous</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={next}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") next(); }}
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2",
              "bg-white/80 text-gray-600 shadow transition-colors",
              "hover:bg-[var(--sdui-color-primary,#6366f1)] hover:text-white",
              "dark:bg-white/10 dark:text-gray-300",
            )}
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <title>Next</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Testimonial slides">
            {items.map((_, i) => (
              <button
                type="button"
                key={`dot-${items[i]?.name ?? i}`}
                role="tab"
                aria-selected={i === active}
                aria-label={`Go to testimonial ${String(i + 1)}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActive(i); }}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  i === active
                    ? "w-6 bg-[var(--sdui-color-primary,#6366f1)]"
                    : "bg-gray-300 dark:bg-gray-600",
                )}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </section>
  );
}
