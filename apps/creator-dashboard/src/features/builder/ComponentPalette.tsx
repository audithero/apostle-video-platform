/**
 * Component Palette — left panel of the builder
 *
 * Shows all 20 SDUI components grouped by category.
 * Each component is draggable into the canvas via Craft.js's useEditor.
 */
import { useEditor, Element } from "@craftjs/core";
import { componentRegistry, categories } from "@platform/component-registry";
import type { SDUIComponentDef } from "@platform/sdui-schema";
import { useState } from "react";
import {
  PanelTop,
  Type,
  Image,
  MousePointerClick,
  Play,
  BookOpen,
  LayoutGrid,
  ArrowRight,
  DollarSign,
  User,
  MessageCircle,
  TrendingUp,
  Trophy,
  Award,
  Users,
  Radio,
  HelpCircle,
  Medal,
  Crown,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { generateNodeId } from "./serialization";

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, typeof PanelTop> = {
  PanelTop,
  Type,
  Image,
  MousePointerClick,
  Play,
  BookOpen,
  LayoutGrid,
  ArrowRight,
  DollarSign,
  User,
  MessageCircle,
  TrendingUp,
  Trophy,
  Award,
  Users,
  Radio,
  HelpCircle,
  Medal,
  Crown,
};

function getIcon(iconName: string) {
  return iconMap[iconName] ?? HelpCircle;
}

/* ------------------------------------------------------------------ */
/*  Category labels                                                    */
/* ------------------------------------------------------------------ */

const categoryLabels: Record<string, string> = {
  layout: "Layout",
  content: "Content",
  media: "Media",
  commerce: "Commerce",
  gamification: "Gamification",
  social: "Social",
  assessment: "Assessment",
};

/* ------------------------------------------------------------------ */
/*  Draggable component item                                           */
/* ------------------------------------------------------------------ */

function PaletteItem({ def }: { readonly def: SDUIComponentDef }) {
  const { connectors } = useEditor();
  const Icon = getIcon(def.icon);

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connectors.create(
            ref,
            <Element
              is={def.type as never}
              canvas={Boolean(def.allowedChildren)}
              custom={{ sduiSectionId: generateNodeId(), sduiType: def.type }}
              {...def.defaultProps}
            />,
          );
        }
      }}
      className={cn(
        "flex cursor-grab items-center gap-3 rounded-lg border border-transparent px-3 py-2.5",
        "transition-colors hover:border-neutral-200 hover:bg-neutral-50",
        "active:cursor-grabbing active:bg-neutral-100",
        "dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800",
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {def.displayName}
        </div>
        <div className="truncate text-[11px] text-neutral-500">
          {def.description}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Palette component                                                  */
/* ------------------------------------------------------------------ */

export function ComponentPalette() {
  const [search, setSearch] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => new Set(categories.map((c) => c.id)),
  );

  const toggleCategory = (catId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  // Group components by category
  const grouped = new Map<string, SDUIComponentDef[]>();
  for (const def of componentRegistry.values()) {
    const searchLower = search.toLowerCase();
    if (
      search &&
      !def.displayName.toLowerCase().includes(searchLower) &&
      !def.type.toLowerCase().includes(searchLower) &&
      !def.description.toLowerCase().includes(searchLower)
    ) {
      continue;
    }
    const list = grouped.get(def.category) ?? [];
    list.push(def);
    grouped.set(def.category, list);
  }

  return (
    <div className="flex h-full flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Components
        </h3>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search components..."
            className="h-8 pl-8 text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {categories.map((cat) => {
            const items = grouped.get(cat.id);
            if (!items || items.length === 0) return null;
            const isExpanded = expandedCategories.has(cat.id);

            return (
              <div key={cat.id} className="mb-1">
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleCategory(cat.id);
                    }
                  }}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  <span>{categoryLabels[cat.id] ?? cat.id}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={cn(
                      "h-3 w-3 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <title>Toggle category</title>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="mt-0.5 space-y-0.5">
                    {items.map((def) => (
                      <PaletteItem key={def.type} def={def} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {grouped.size === 0 && (
            <div className="px-4 py-8 text-center text-sm text-neutral-400">
              No components match your search
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
