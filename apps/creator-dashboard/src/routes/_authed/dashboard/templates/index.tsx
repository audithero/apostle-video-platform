import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useRef, useCallback } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { STARTER_TEMPLATES } from "@/lib/sdui/starter-templates";
import type { StarterTemplate } from "@/lib/sdui/starter-templates";
import { InlineSDUIPreview } from "@/components/sdui/InlineSDUIPreview";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
  Rocket,
  LayoutTemplate,
  Search,
  GraduationCap,
  Home,
  Play,
  Users,
  DollarSign,
  BarChart3,
  Trophy,
  Radio,
  HelpCircle,
  ArrowRight,
  ChefHat,
  Dumbbell,
  Landmark,
  TrendingUp,
  Palette,
  Eye,
  Monitor,
  Tablet,
  Smartphone,
  Tv2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard/templates/")({
  component: TemplatesPage,
});

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "landing", label: "Landing Pages" },
  { id: "learning", label: "Learning" },
  { id: "community", label: "Community" },
  { id: "commerce", label: "Commerce" },
  { id: "dashboard", label: "Dashboard" },
  { id: "general", label: "General" },
] as const;

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const iconMap: Record<string, typeof LayoutTemplate> = {
  GraduationCap,
  Home,
  Play,
  Users,
  DollarSign,
  BarChart3,
  Trophy,
  Radio,
  ChefHat,
  Dumbbell,
  Landmark,
  TrendingUp,
  Palette,
};

function getIcon(iconName: string) {
  return iconMap[iconName] ?? HelpCircle;
}

/* ------------------------------------------------------------------ */
/*  Breakpoint config                                                  */
/* ------------------------------------------------------------------ */

type Breakpoint = "tv" | "desktop" | "tablet" | "mobile";

const BREAKPOINTS: ReadonlyArray<{
  id: Breakpoint;
  icon: typeof Monitor;
  label: string;
  subtitle: string;
  width: number;
  height: number;
}> = [
  { id: "tv", icon: Tv2, label: "TV", subtitle: "tvOS / Android TV", width: 1920, height: 1080 },
  { id: "desktop", icon: Monitor, label: "Desktop", subtitle: "Web Browser", width: 1280, height: 800 },
  { id: "tablet", icon: Tablet, label: "Tablet", subtitle: "iPad / Android", width: 768, height: 1024 },
  { id: "mobile", icon: Smartphone, label: "Phone", subtitle: "iPhone / Android", width: 375, height: 812 },
];

/* ------------------------------------------------------------------ */
/*  Template Preview Modal                                             */
/* ------------------------------------------------------------------ */

/* Device frame styles */
const DEVICE_FRAMES: Record<Breakpoint, {
  bezel: string;
  borderRadius: string;
  padding: string;
  showNotch: boolean;
  showStand: boolean;
}> = {
  tv: {
    bezel: "border-[8px] border-neutral-800 dark:border-neutral-600",
    borderRadius: "rounded-xl",
    padding: "",
    showNotch: false,
    showStand: true,
  },
  desktop: {
    bezel: "border-[6px] border-neutral-700 dark:border-neutral-500",
    borderRadius: "rounded-t-xl",
    padding: "",
    showNotch: false,
    showStand: true,
  },
  tablet: {
    bezel: "border-[6px] border-neutral-800 dark:border-neutral-600",
    borderRadius: "rounded-[20px]",
    padding: "",
    showNotch: false,
    showStand: false,
  },
  mobile: {
    bezel: "border-[4px] border-neutral-900 dark:border-neutral-500",
    borderRadius: "rounded-[28px]",
    padding: "pt-6",
    showNotch: true,
    showStand: false,
  },
};

function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
}: {
  readonly template: StarterTemplate | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const navigate = useNavigate();
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [containerWidth, setContainerWidth] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);

  // Callback ref: fires when the DOM element mounts (works with Radix Dialog portals)
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) {
      setContainerWidth(0);
      return;
    }
    setContainerWidth(node.clientWidth);
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    observerRef.current = observer;
  }, []);

  const activeBreakpoint = BREAKPOINTS.find((bp) => bp.id === breakpoint);
  const previewWidth = activeBreakpoint?.width ?? 1280;
  const previewHeight = activeBreakpoint?.height ?? 800;
  const frame = DEVICE_FRAMES[breakpoint];

  // Dynamically scale preview to fit available container width
  // Account for padding (32px = 16px each side) and device bezel (~16px)
  const availableWidth = containerWidth - 48;
  const scaleFactor = availableWidth > 0 && previewWidth > availableWidth
    ? availableWidth / previewWidth
    : 1;
  // When significantly scaled, show full template page instead of clipping to device height
  const isMinified = scaleFactor < 0.5;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw]"
      >
        {/* Header — stacks on mobile */}
        <div className="flex flex-col gap-2 border-b px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
          {/* Top row: title + close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-sm font-semibold sm:text-base">
                {template?.name ?? "Preview"}
              </DialogTitle>
              {template && (
                <Badge variant="secondary" className="hidden text-[10px] sm:inline-flex">
                  {template.category}
                </Badge>
              )}
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100 sm:hidden"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          {/* Bottom row: breakpoint switcher + actions */}
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            {/* Breakpoint switcher */}
            <div className="flex items-center gap-0.5 rounded-lg bg-neutral-100 p-0.5 dark:bg-neutral-800">
              {BREAKPOINTS.map((bp) => {
                const Icon = bp.icon;
                const isActive = breakpoint === bp.id;
                return (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() => setBreakpoint(bp.id)}
                    className={cn(
                      "flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                        : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                    )}
                    title={`${bp.subtitle} (${String(bp.width)}x${String(bp.height)})`}
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{bp.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-7 gap-1 text-xs sm:h-8 sm:gap-1.5 sm:text-sm"
                onClick={() => {
                  onOpenChange(false);
                  navigate({ to: "/dashboard/templates/new" });
                }}
              >
                <span className="hidden sm:inline">Use This Template</span>
                <span className="sm:hidden">Use Template</span>
              </Button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="hidden rounded-sm opacity-70 transition-opacity hover:opacity-100 sm:block"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
        </div>

        {/* Preview with device frame */}
        <div ref={containerRef} className="relative flex flex-1 flex-col items-center justify-start overflow-auto bg-neutral-100 p-4 dark:bg-neutral-900">
          {/* Device info label */}
          <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium">{activeBreakpoint?.subtitle}</span>
            <span className="select-none">-</span>
            <span>{String(previewWidth)} x {String(previewHeight)}</span>
            {scaleFactor < 1 && (
              <span className="text-neutral-500">({String(Math.round(scaleFactor * 100))}%)</span>
            )}
          </div>

          {template && (
            <div
              className="flex flex-col items-center"
              style={scaleFactor < 1 ? {
                zoom: scaleFactor,
              } : undefined}
            >
              {/* Device frame */}
              <div className={cn(
                "relative overflow-hidden bg-white dark:bg-neutral-950",
                frame.bezel,
                isMinified ? "rounded-lg" : frame.borderRadius,
              )}>
                {/* Phone notch (hide when minified for cleaner look) */}
                {frame.showNotch && !isMinified && (
                  <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-900 dark:bg-neutral-500" />
                )}
                {/* Content */}
                <div
                  className={cn("overflow-hidden", !isMinified && frame.padding)}
                  style={{
                    width: `${String(previewWidth)}px`,
                    maxHeight: isMinified ? undefined : `${String(previewHeight)}px`,
                  }}
                >
                  <InlineSDUIPreview screen={template.screen} />
                </div>
              </div>

              {/* Monitor/TV stand (hide when minified) */}
              {frame.showStand && !isMinified && (
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "bg-neutral-700 dark:bg-neutral-500",
                      breakpoint === "tv"
                        ? "h-3 w-40 rounded-b-sm"
                        : "h-12 w-3 rounded-b-sm",
                    )}
                  />
                  <div
                    className={cn(
                      "rounded-sm bg-neutral-600 dark:bg-neutral-400",
                      breakpoint === "tv"
                        ? "h-2 w-64"
                        : "h-2 w-24",
                    )}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function TemplatesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<StarterTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { data: templates, isLoading } = useQuery(
    trpc.sdui.templates.list.queryOptions({}),
  );

  const deleteMutation = useMutation(
    trpc.sdui.templates.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.sdui.templates.list.queryKey({}) });
      },
    }),
  );

  // Filter starter templates by category and search
  const filteredStarters = useMemo(() => {
    const searchLower = search.toLowerCase();
    return STARTER_TEMPLATES.filter((t) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (
        search &&
        !t.name.toLowerCase().includes(searchLower) &&
        !t.description.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
      return true;
    });
  }, [search, activeCategory]);

  // Filter saved templates by search
  const filteredTemplates = useMemo(() => {
    if (!templates) return [];
    const searchLower = search.toLowerCase();
    return templates.filter((t) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (
        search &&
        !t.name.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
      return true;
    });
  }, [templates, search, activeCategory]);

  const handlePreviewTemplate = (starter: StarterTemplate) => {
    setPreviewTemplate(starter);
    setPreviewOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Choose a starter or build from scratch
          </p>
        </div>
        <Button asChild>
          <Link to="/dashboard/templates/new">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </Button>
      </div>

      {/* Search & Category Filters */}
      <div className="space-y-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Starter Templates Section */}
      {filteredStarters.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Starter Templates</h2>
            <span className="text-xs text-neutral-400">
              {filteredStarters.length} template{filteredStarters.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStarters.map((starter) => {
              const Icon = getIcon(starter.icon);
              return (
                <Card
                  key={starter.id}
                  className="group cursor-pointer overflow-hidden transition-shadow hover:shadow-md"
                  onClick={() => handlePreviewTemplate(starter)}
                >
                  <CardContent className="p-0">
                    {/* Visual preview area */}
                    <div
                      className="relative flex h-36 flex-col justify-end overflow-hidden p-3"
                      style={{ background: starter.preview.gradient }}
                    >
                      {/* Faint icon watermark */}
                      <Icon className="absolute right-3 top-3 h-6 w-6 text-white/20" />
                      {/* Mini hero text */}
                      <div className="relative z-10">
                        <p className="truncate text-xs font-bold text-white/90 drop-shadow-sm">
                          {starter.preview.heroTitle}
                        </p>
                        <p className="mt-0.5 truncate text-[10px] text-white/60">
                          {starter.preview.heroSubtitle}
                        </p>
                      </div>
                      {/* Section wireframe pills */}
                      <div className="mt-2 flex flex-wrap gap-1">
                        {starter.preview.sectionPreview.slice(0, 4).map((section) => (
                          <span
                            key={section}
                            className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-sm"
                          >
                            {section}
                          </span>
                        ))}
                        {starter.preview.sectionPreview.length > 4 && (
                          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-medium text-white/70 backdrop-blur-sm">
                            +{String(starter.preview.sectionPreview.length - 4)}
                          </span>
                        )}
                      </div>
                      {/* Starter badge */}
                      <div className="absolute right-2 top-2">
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-[10px] text-white backdrop-blur-sm"
                        >
                          starter
                        </Badge>
                      </div>
                      {/* Preview hover overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                        <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-800 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </div>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-semibold">
                            {starter.name}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                            {starter.description}
                          </p>
                        </div>
                        <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-neutral-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Saved Templates Section */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your Templates</h2>
          {!isLoading && filteredTemplates.length > 0 && (
            <span className="text-xs text-neutral-400">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <Card key={`skeleton-${String(n)}`} className="animate-pulse">
                <CardContent className="p-0">
                  <div className="h-32 rounded-t-lg bg-neutral-100 dark:bg-neutral-800" />
                  <div className="space-y-2 p-4">
                    <div className="h-4 w-2/3 rounded bg-neutral-100 dark:bg-neutral-800" />
                    <div className="h-3 w-1/2 rounded bg-neutral-100 dark:bg-neutral-800" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LayoutTemplate className="mb-3 h-10 w-10 text-neutral-300" />
              <h3 className="text-sm font-semibold">
                {templates && templates.length > 0
                  ? "No templates match your filters"
                  : "No saved templates yet"}
              </h3>
              <p className="mt-1 text-xs text-neutral-500">
                {templates && templates.length > 0
                  ? "Try a different search or category"
                  : "Create one from a starter template above"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group overflow-hidden">
                <CardContent className="p-0">
                  <Link
                    to="/dashboard/templates/$id/edit"
                    params={{ id: template.id }}
                    className="block"
                  >
                    <div className="relative flex h-32 items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-50 transition-colors group-hover:from-neutral-200 group-hover:to-neutral-100 dark:from-neutral-800 dark:to-neutral-900 dark:group-hover:from-neutral-700 dark:group-hover:to-neutral-800">
                      <LayoutTemplate className="h-8 w-8 text-neutral-300 dark:text-neutral-600" />
                      <div className="absolute right-2 top-2">
                        <Badge
                          variant={
                            template.status === "published" ? "default" : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {template.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        to="/dashboard/templates/$id/edit"
                        params={{ id: template.id }}
                        className="block truncate text-sm font-semibold hover:underline"
                      >
                        {template.name}
                      </Link>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {template.category} template
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            to="/dashboard/templates/$id/edit"
                            params={{ id: template.id }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Rocket className="mr-2 h-4 w-4" />
                          Deploy
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteMutation.mutate({ id: template.id })}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
