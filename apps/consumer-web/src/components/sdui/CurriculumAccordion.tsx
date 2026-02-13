import { useState, useCallback, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Lesson {
  id?: string;
  title: string;
  duration?: string;
  type?: string;
}

interface Module {
  id?: string;
  title: string;
  lessons: Lesson[];
  duration?: string;
}

interface CurriculumAccordionProps {
  modules?: Module[];
  expandFirst?: boolean;
  sectionId?: string;
  children?: ReactNode;
}

export default function CurriculumAccordion({
  modules = [],
  expandFirst = true,
  sectionId,
  children,
}: CurriculumAccordionProps) {
  const getModuleKey = useCallback(
    (mod: Module, index: number) => mod.id ?? `module-${String(index)}`,
    [],
  );

  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (expandFirst && modules.length > 0 && modules[0]) {
      initial.add(getModuleKey(modules[0], 0));
    }
    return initial;
  });

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }, []);

  if (modules.length === 0) {
    return (
      <section id={sectionId} className="w-full px-4 py-6">
        <p className="text-sm text-neutral-400">No curriculum available</p>
        {children}
      </section>
    );
  }

  return (
    <section id={sectionId} className="w-full px-4 py-6">
      <div className="divide-y divide-neutral-200 overflow-hidden rounded-xl border border-neutral-200 dark:divide-neutral-700 dark:border-neutral-700">
        {modules.map((mod, modIndex) => {
          const modKey = getModuleKey(mod, modIndex);
          const isExpanded = expandedModules.has(modKey);
          const lessonCount = mod.lessons.length;

          return (
            <div key={modKey}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 bg-neutral-50 px-5 py-4 text-left transition-colors hover:bg-neutral-100 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                onClick={() => toggleModule(modKey)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleModule(modKey);
                  }
                }}
                aria-expanded={isExpanded}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h3 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}
                    {mod.duration ? ` \u00B7 ${mod.duration}` : ""}
                  </p>
                </div>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={cn(
                    "h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform",
                    isExpanded && "rotate-180",
                  )}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <title>Toggle</title>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded ? (
                <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {mod.lessons.map((lesson, lessonIndex) => (
                    <li
                      key={lesson.id ?? `${modKey}-lesson-${String(lessonIndex)}`}
                      className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/30"
                    >
                      <span className="flex-shrink-0 text-neutral-400">
                        {lesson.type === "video" ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <title>Video lesson</title>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <title>Lesson</title>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 truncate text-neutral-700 dark:text-neutral-300">
                        {lesson.title}
                      </span>
                      {lesson.duration ? (
                        <span className="flex-shrink-0 text-xs text-neutral-400">
                          {lesson.duration}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
      {children}
    </section>
  );
}
