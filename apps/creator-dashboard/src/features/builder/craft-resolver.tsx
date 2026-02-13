/**
 * Craft.js component resolver
 *
 * Wraps each SDUI component type with Craft.js metadata (.craft)
 * so the builder knows how to handle drag-drop, selection, and property editing.
 *
 * These are lightweight "editor-mode" components that render preview versions
 * with selection borders and hover states, not the full consumer-web components.
 */
import { useNode, type UserComponent } from "@craftjs/core";
import DOMPurify from "dompurify";
import { componentRegistry } from "@platform/component-registry";
import type { SDUIComponentDef } from "@platform/sdui-schema";

/* ------------------------------------------------------------------ */
/*  Generic editor wrapper                                             */
/* ------------------------------------------------------------------ */

interface EditorBlockProps {
  [key: string]: unknown;
  children?: React.ReactNode;
}

function createEditorComponent(def: SDUIComponentDef): UserComponent<EditorBlockProps> {
  const EditorBlock: UserComponent<EditorBlockProps> = (props) => {
    const {
      connectors: { connect, drag },
      selected,
      hovered,
    } = useNode((state) => ({
      selected: state.events.selected,
      hovered: state.events.hovered,
    }));

    return (
      <div
        ref={(ref) => {
          if (ref) connect(drag(ref));
        }}
        className={`relative transition-all ${
          selected
            ? "ring-2 ring-[var(--color-primary,#6366f1)] ring-offset-2"
            : hovered
              ? "ring-1 ring-[var(--color-primary,#6366f1)]/50 ring-offset-1"
              : ""
        }`}
        style={{ minHeight: "40px" }}
      >
        {/* Component type badge */}
        {(selected || hovered) && (
          <div className="absolute -top-6 left-0 z-10 rounded-t-md bg-[var(--color-primary,#6366f1)] px-2 py-0.5 text-[10px] font-medium text-white">
            {def.displayName}
          </div>
        )}

        {/* Preview content */}
        <EditorBlockPreview type={def.type} props={props} />

        {props.children}
      </div>
    );
  };

  EditorBlock.displayName = `CraftEditor_${def.type}`;

  // Craft.js metadata
  EditorBlock.craft = {
    displayName: def.displayName,
    props: { ...def.defaultProps },
    related: {},
    rules: {
      canDrag: () => true,
      canDrop: () => true,
      canMoveIn: () => Boolean(def.allowedChildren),
      canMoveOut: () => true,
    },
  };

  return EditorBlock;
}

/* ------------------------------------------------------------------ */
/*  Block preview renderer                                             */
/* ------------------------------------------------------------------ */

function EditorBlockPreview({
  type,
  props,
}: {
  type: string;
  props: Record<string, unknown>;
}) {
  switch (type) {
    case "HeroSection":
      return (
        <div
          className="relative flex min-h-[200px] flex-col items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-neutral-800 to-neutral-900 px-6 py-12 text-center text-white"
          style={
            (props.backgroundImage as string)
              ? {
                  backgroundImage: `url(${props.backgroundImage as string})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          {(props.backgroundImage as string) && (
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: (props.overlayOpacity as number) ?? 0.4 }}
            />
          )}
          <div className="relative z-10">
            <h2 className="text-2xl font-bold">{(props.title as string) || "Hero Title"}</h2>
            <p className="mt-2 text-sm opacity-80">
              {(props.subtitle as string) || "Hero subtitle text"}
            </p>
            {(props.ctaText as string) && (
              <span className="mt-4 inline-block rounded-lg bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm">
                {props.ctaText as string}
              </span>
            )}
          </div>
        </div>
      );

    case "TextBlock":
      return (
        <div className="px-4 py-6">
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize((props.content as string) || "<p>Text content...</p>"),
            }}
          />
        </div>
      );

    case "ImageBlock":
      return (
        <div className="px-4 py-4">
          {(props.src as string) ? (
            <img
              src={props.src as string}
              alt={(props.alt as string) || ""}
              className="max-h-[300px] w-full rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-[200px] items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-400 dark:bg-neutral-800">
              No image selected
            </div>
          )}
        </div>
      );

    case "CTAButton":
      return (
        <div className="flex justify-center px-4 py-4">
          <span className="inline-block rounded-lg bg-[var(--color-primary,#6366f1)] px-6 py-3 text-sm font-medium text-white">
            {(props.text as string) || "Button"}
          </span>
        </div>
      );

    case "VideoPlayer":
      return (
        <div className="px-4 py-4">
          <div className="flex aspect-video items-center justify-center rounded-lg bg-neutral-900 text-white">
            <div className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <title>Play</title>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <p className="text-xs opacity-60">
                {(props.videoUrl as string) ? "Video Player" : "No video URL"}
              </p>
            </div>
          </div>
        </div>
      );

    case "CurriculumAccordion":
      return (
        <div className="px-4 py-4">
          <div className="space-y-1 rounded-lg border border-neutral-200 dark:border-neutral-700">
            {((props.modules as Array<{ title: string }>) ?? []).slice(0, 3).map((mod, i) => (
              <div
                key={mod.title || `mod-${String(i)}`}
                className="flex items-center justify-between border-b border-neutral-100 px-4 py-3 text-sm last:border-0 dark:border-neutral-800"
              >
                <span className="font-medium">{mod.title || `Module ${String(i + 1)}`}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <title>Expand</title>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ))}
            {((props.modules as Array<unknown>) ?? []).length === 0 && (
              <div className="px-4 py-3 text-sm text-neutral-400">No modules defined</div>
            )}
          </div>
        </div>
      );

    case "PricingTable":
      return (
        <div className="flex gap-3 px-4 py-4">
          {((props.plans as Array<{ name: string; price: string; highlighted?: boolean }>) ?? [])
            .slice(0, 3)
            .map((plan, i) => (
              <div
                key={plan.name || `plan-${String(i)}`}
                className={`flex-1 rounded-lg border p-4 text-center text-sm ${
                  plan.highlighted
                    ? "border-[var(--color-primary,#6366f1)] bg-[var(--color-primary,#6366f1)]/5"
                    : "border-neutral-200 dark:border-neutral-700"
                }`}
              >
                <div className="font-semibold">{plan.name}</div>
                <div className="mt-1 text-lg font-bold">{plan.price}</div>
              </div>
            ))}
          {((props.plans as Array<unknown>) ?? []).length === 0 && (
            <div className="flex-1 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
              No plans configured
            </div>
          )}
        </div>
      );

    case "InstructorBio":
      return (
        <div className="flex items-center gap-4 px-4 py-6">
          <div className="h-16 w-16 flex-shrink-0 rounded-full bg-neutral-200 dark:bg-neutral-700" />
          <div>
            <div className="font-semibold">
              {(props.name as string) || "Instructor Name"}
            </div>
            <div className="mt-1 text-xs text-neutral-500">
              {(props.bio as string)?.slice(0, 80) || "Instructor bio..."}
              {((props.bio as string)?.length ?? 0) > 80 ? "..." : ""}
            </div>
          </div>
        </div>
      );

    case "TestimonialCarousel":
      return (
        <div className="px-4 py-6 text-center">
          <div className="mx-auto max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-2 h-6 w-6 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
              <title>Quote</title>
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
            </svg>
            <p className="text-sm italic text-neutral-600 dark:text-neutral-300">
              {((props.testimonials as Array<{ quote: string }>)?.[0]?.quote) || "\"Testimonial quote...\""}
            </p>
          </div>
        </div>
      );

    case "ProgressBar":
      return (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>{(props.label as string) || "Progress"}</span>
            <span>{(props.value as number) ?? 0}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
            <div
              className="h-full rounded-full bg-[var(--color-primary,#6366f1)]"
              style={{ width: `${(props.value as number) ?? 0}%` }}
            />
          </div>
        </div>
      );

    case "StreakCounter":
      return (
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl dark:bg-amber-900/30">
            🔥
          </div>
          <div>
            <div className="text-2xl font-bold">{(props.currentStreak as number) ?? 0}</div>
            <div className="text-xs text-neutral-500">Day Streak</div>
          </div>
        </div>
      );

    case "CourseGrid":
      return (
        <div className="grid grid-cols-3 gap-3 px-4 py-4">
          {[1, 2, 3].map((n) => (
            <div
              key={`course-${String(n)}`}
              className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
            >
              <div className="mb-2 h-20 rounded bg-neutral-100 dark:bg-neutral-800" />
              <div className="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
              <div className="mt-1 h-2 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
            </div>
          ))}
        </div>
      );

    case "LessonCard":
      return (
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800">
              📚
            </div>
            <div>
              <div className="text-sm font-medium">
                {(props.title as string) || "Lesson Title"}
              </div>
              <div className="text-xs text-neutral-500">
                {(props.duration as string) || "10:00"}
              </div>
            </div>
          </div>
        </div>
      );

    case "ContentRow":
      return (
        <div className="px-4 py-4">
          <div className="mb-2 text-sm font-semibold">
            {(props.title as string) || "Content Row"}
          </div>
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={`item-${String(n)}`}
                className="h-24 w-32 flex-shrink-0 rounded bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>
      );

    case "CommunityFeed":
      return (
        <div className="px-4 py-4">
          <div className="space-y-2">
            {[1, 2].map((n) => (
              <div
                key={`post-${String(n)}`}
                className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
              >
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="mt-2 h-3 w-full rounded bg-neutral-100 dark:bg-neutral-800" />
                <div className="mt-1 h-3 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
              </div>
            ))}
          </div>
        </div>
      );

    case "LiveEventBanner":
      return (
        <div className="mx-4 my-4 rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">
              {(props.title as string) || "Live Event"}
            </span>
          </div>
          <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">
            {(props.description as string) || "Join the live session"}
          </p>
        </div>
      );

    case "QuizBlock":
      return (
        <div className="px-4 py-4">
          <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
            <div className="mb-3 text-sm font-semibold">
              {(props.title as string) || "Quiz"}
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={`opt-${String(n)}`}
                  className="rounded border border-neutral-200 px-3 py-2 text-xs dark:border-neutral-700"
                >
                  Option {String(n)}
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case "CertificateDisplay":
      return (
        <div className="px-4 py-4">
          <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 p-6 text-center dark:border-amber-700 dark:bg-amber-900/10">
            <div className="text-2xl">🏆</div>
            <div className="mt-2 text-sm font-semibold">Certificate of Completion</div>
            <div className="mt-1 text-xs text-neutral-500">Awarded upon finishing the course</div>
          </div>
        </div>
      );

    case "BadgeShowcase":
      return (
        <div className="flex justify-center gap-3 px-4 py-4">
          {["🎯", "⭐", "🏅"].map((badge) => (
            <div
              key={badge}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-xl dark:bg-neutral-800"
            >
              {badge}
            </div>
          ))}
        </div>
      );

    case "LeaderboardWidget":
      return (
        <div className="px-4 py-4">
          <div className="text-sm font-semibold">Leaderboard</div>
          <div className="mt-2 space-y-1">
            {[
              { rank: 1, name: "Student A", pts: "1,200" },
              { rank: 2, name: "Student B", pts: "980" },
              { rank: 3, name: "Student C", pts: "875" },
            ].map((entry) => (
              <div
                key={entry.name}
                className="flex items-center gap-2 rounded px-2 py-1 text-xs"
              >
                <span className="w-5 font-bold text-neutral-400">#{String(entry.rank)}</span>
                <span className="flex-1">{entry.name}</span>
                <span className="text-neutral-500">{entry.pts} pts</span>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="px-4 py-6 text-center text-sm text-neutral-400">
          {type} component
        </div>
      );
  }
}

/* ------------------------------------------------------------------ */
/*  Build resolver map                                                 */
/* ------------------------------------------------------------------ */

const resolverCache = new Map<string, UserComponent<EditorBlockProps>>();

/**
 * Build the Craft.js resolver object that maps component type names
 * to their editor-mode wrappers.
 */
export function buildCraftResolver(): Record<string, UserComponent<EditorBlockProps>> {
  const resolver: Record<string, UserComponent<EditorBlockProps>> = {};

  for (const def of componentRegistry.values()) {
    if (!resolverCache.has(def.type)) {
      resolverCache.set(def.type, createEditorComponent(def));
    }
    resolver[def.type] = resolverCache.get(def.type)!;
  }

  return resolver;
}
