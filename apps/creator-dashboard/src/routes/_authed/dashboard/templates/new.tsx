import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { STARTER_TEMPLATES } from "@/lib/sdui/starter-templates";
import type { StarterTemplate } from "@/lib/sdui/starter-templates";
import { InlineSDUIPreview } from "@/components/sdui/InlineSDUIPreview";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutTemplate,
  ArrowLeft,
  ArrowRight,
  Loader2,
  GraduationCap,
  Home,
  Play,
  Users,
  DollarSign,
  BarChart3,
  Trophy,
  Radio,
  HelpCircle,
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard/templates/new")({
  component: NewTemplatePage,
});

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

/* ------------------------------------------------------------------ */
/*  Preview Modal                                                      */
/* ------------------------------------------------------------------ */

function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
}: {
  readonly template: StarterTemplate | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  const activeBreakpoint = BREAKPOINTS.find((bp) => bp.id === breakpoint);
  const previewWidth = activeBreakpoint?.width ?? 1280;
  const previewHeight = activeBreakpoint?.height ?? 800;
  const frame = DEVICE_FRAMES[breakpoint];

  const needsScale = breakpoint === "tv";
  const scaleFactor = needsScale ? 0.55 : 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex h-[90vh] max-w-[95vw] flex-col gap-0 p-0 sm:max-w-[95vw]"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-base font-semibold">
              {template?.name ?? "Preview"}
            </DialogTitle>
            {template && (
              <Badge variant="secondary" className="text-[10px]">
                {template.category}
              </Badge>
            )}
          </div>

          {/* Breakpoint switcher with labels */}
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
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-700 dark:text-neutral-100"
                      : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200",
                  )}
                  title={`${bp.subtitle} (${String(bp.width)}x${String(bp.height)})`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{bp.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[10px] text-neutral-400 md:inline">
              {String(previewWidth)}x{String(previewHeight)}
            </span>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-sm opacity-70 transition-opacity hover:opacity-100"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {/* Preview with device frame */}
        <div className="relative flex flex-1 flex-col items-center justify-start overflow-auto bg-neutral-100 p-4 dark:bg-neutral-900">
          {/* Device info label */}
          <div className="mb-3 flex items-center gap-2 text-xs text-neutral-400">
            <span className="font-medium">{activeBreakpoint?.subtitle}</span>
            <span>-</span>
            <span>{String(previewWidth)} x {String(previewHeight)}</span>
          </div>

          {template && (
            <div
              className="flex flex-col items-center"
              style={{
                transform: needsScale ? `scale(${String(scaleFactor)})` : undefined,
                transformOrigin: "top center",
              }}
            >
              {/* Device frame */}
              <div className={cn("relative overflow-hidden bg-white dark:bg-neutral-950", frame.bezel, frame.borderRadius)}>
                {/* Phone notch */}
                {frame.showNotch && (
                  <div className="absolute left-1/2 top-0 z-10 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-neutral-900 dark:bg-neutral-500" />
                )}
                {/* Content */}
                <div
                  className={cn("overflow-auto", frame.padding)}
                  style={{
                    width: `${String(previewWidth)}px`,
                    maxHeight: `${String(previewHeight)}px`,
                  }}
                >
                  <InlineSDUIPreview screen={template.screen} />
                </div>
              </div>

              {/* Monitor/TV stand */}
              {frame.showStand && (
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
/*  New Template Page                                                  */
/* ------------------------------------------------------------------ */

function NewTemplatePage() {
  const navigate = useNavigate();
  const trpc = useTRPC();

  const [step, setStep] = useState<"choose" | "details">("choose");
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("landing");
  const [previewTemplate, setPreviewTemplate] = useState<StarterTemplate | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const createMutation = useMutation(
    trpc.sdui.templates.create.mutationOptions({
      onSuccess: (result) => {
        navigate({
          to: "/dashboard/templates/$id/edit",
          params: { id: result.id },
        });
      },
    }),
  );

  const handleCreate = () => {
    const starter = STARTER_TEMPLATES.find((s) => s.id === selectedStarter);

    // Use full SDUI screen from starter template, or create a blank one
    const templateJson = starter
      ? {
          ...starter.screen,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
        }
      : {
          id: `template-${String(Date.now())}`,
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          description,
          sections: [],
        };

    createMutation.mutate({
      name,
      description,
      category: category as "landing" | "learning" | "community" | "commerce" | "dashboard" | "general",
      templateJson,
    });
  };

  const handlePreview = (e: React.MouseEvent, starter: StarterTemplate) => {
    e.stopPropagation();
    setPreviewTemplate(starter);
    setPreviewOpen(true);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            if (step === "details") {
              setStep("choose");
            } else {
              navigate({ to: "/dashboard/templates" });
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Template</h1>
          <p className="text-sm text-neutral-500">
            {step === "choose"
              ? "Choose a starter template or start from scratch"
              : "Name your template and set its category"}
          </p>
        </div>
      </div>

      {step === "choose" ? (
        <>
          {/* Blank template option */}
          <Card
            className={`cursor-pointer border-2 transition-colors ${
              selectedStarter === "blank"
                ? "border-[var(--color-primary,#6366f1)]"
                : "border-transparent hover:border-neutral-200"
            }`}
            onClick={() => setSelectedStarter("blank")}
          >
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <LayoutTemplate className="h-6 w-6 text-neutral-500" />
              </div>
              <div>
                <div className="font-semibold">Blank Template</div>
                <p className="text-sm text-neutral-500">
                  Start with an empty canvas and build from scratch
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Starter templates */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {STARTER_TEMPLATES.map((starter) => {
              const Icon = getIcon(starter.icon);
              return (
                <Card
                  key={starter.id}
                  className={`cursor-pointer border-2 overflow-hidden transition-colors ${
                    selectedStarter === starter.id
                      ? "border-[var(--color-primary,#6366f1)]"
                      : "border-transparent hover:border-neutral-200"
                  }`}
                  onClick={() => setSelectedStarter(starter.id)}
                >
                  <CardContent className="p-0">
                    {/* Visual preview area */}
                    <div
                      className="relative flex h-24 flex-col justify-end overflow-hidden p-2.5"
                      style={{ background: starter.preview.gradient }}
                    >
                      <Icon className="absolute right-2.5 top-2.5 h-5 w-5 text-white/20" />
                      <p className="truncate text-[11px] font-bold text-white/90 drop-shadow-sm">
                        {starter.preview.heroTitle}
                      </p>
                      <p className="mt-0.5 truncate text-[9px] text-white/60">
                        {starter.preview.heroSubtitle}
                      </p>
                      <div className="mt-1.5 flex flex-wrap gap-0.5">
                        {starter.preview.sectionPreview.slice(0, 3).map((section) => (
                          <span
                            key={section}
                            className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] font-medium text-white/70 backdrop-blur-sm"
                          >
                            {section}
                          </span>
                        ))}
                        {starter.preview.sectionPreview.length > 3 && (
                          <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[8px] font-medium text-white/70 backdrop-blur-sm">
                            +{String(starter.preview.sectionPreview.length - 3)}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Info + Preview button */}
                    <div className="flex items-start gap-3 p-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold">{starter.name}</div>
                        <p className="mt-0.5 text-xs text-neutral-500">
                          {starter.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0"
                        onClick={(e) => handlePreview(e, starter)}
                        title="Preview template"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Next button */}
          <div className="flex justify-end">
            <Button
              disabled={!selectedStarter}
              onClick={() => {
                const starter = STARTER_TEMPLATES.find(
                  (s) => s.id === selectedStarter,
                );
                if (starter) {
                  setName(starter.name);
                  setDescription(starter.description);
                  setCategory(starter.category);
                }
                setStep("details");
              }}
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-1.5">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Course Landing Page"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this template is for..."
                rows={3}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="template-category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="learning">Learning</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="commerce">Commerce</SelectItem>
                  <SelectItem value="dashboard">Dashboard</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("choose")}>
                Back
              </Button>
              <Button
                disabled={!name.trim() || createMutation.isPending}
                onClick={handleCreate}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <TemplatePreviewModal
        template={previewTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
