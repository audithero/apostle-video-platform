import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface Badge {
  name: string;
  icon?: string;
  description?: string;
  earned?: boolean;
}

interface BadgeShowcaseProps {
  badges?: Badge[];
  sectionId?: string;
  blockId?: string;
  children?: ReactNode;
}

const placeholderBadges: Badge[] = [
  { name: "First Lesson", icon: "🎯", description: "Complete your first lesson", earned: true },
  { name: "Week Streak", icon: "🔥", description: "7 day learning streak", earned: true },
  { name: "Quiz Master", icon: "🧠", description: "Score 100% on any quiz", earned: false },
  { name: "Community Star", icon: "⭐", description: "Get 10 reactions on a post", earned: false },
  { name: "Fast Learner", icon: "⚡", description: "Complete a course in under a week", earned: false },
  { name: "Graduate", icon: "🎓", description: "Complete all courses", earned: false },
];

export default function BadgeShowcase({
  badges,
  sectionId,
  blockId,
  children,
}: BadgeShowcaseProps) {
  const items = badges && badges.length > 0 ? badges : placeholderBadges;

  return (
    <section id={sectionId ?? blockId} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Badges</h3>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((badge) => (
          <div
            key={badge.name}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-4 text-center transition-all",
              "bg-white/80 shadow-sm backdrop-blur-sm dark:bg-white/5",
              !badge.earned && "opacity-50 grayscale",
            )}
          >
            <span className="text-3xl" role="img" aria-label={badge.name}>
              {badge.icon ?? "🏅"}
            </span>
            <span className="text-xs font-semibold text-gray-900 dark:text-white">
              {badge.name}
            </span>
            {badge.description && (
              <span className="text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                {badge.description}
              </span>
            )}
            {badge.earned ? (
              <span className="mt-auto rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                Earned
              </span>
            ) : (
              <span className="mt-auto rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-500">
                Locked
              </span>
            )}
          </div>
        ))}
      </div>

      {children}
    </section>
  );
}
