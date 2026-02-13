/**
 * Builder Toolbar — top bar of the visual builder
 *
 * Contains: back navigation, undo/redo, breakpoint switcher,
 * save, preview, and publish actions.
 */
import { useEditor } from "@craftjs/core";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Monitor,
  Tablet,
  Smartphone,
  Save,
  Eye,
  Rocket,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type Breakpoint = "desktop" | "tablet" | "mobile";

interface BuilderToolbarProps {
  readonly templateName: string;
  readonly breakpoint: Breakpoint;
  readonly onBreakpointChange: (bp: Breakpoint) => void;
  readonly onSave: () => void;
  readonly onPreview: () => void;
  readonly onPublish: () => void;
  readonly onBack: () => void;
  readonly isSaving: boolean;
  readonly isDirty: boolean;
}

/* ------------------------------------------------------------------ */
/*  Breakpoint configs                                                 */
/* ------------------------------------------------------------------ */

const breakpoints: ReadonlyArray<{
  id: Breakpoint;
  icon: typeof Monitor;
  label: string;
  width: string;
}> = [
  { id: "desktop", icon: Monitor, label: "Desktop", width: "1280px" },
  { id: "tablet", icon: Tablet, label: "Tablet", width: "768px" },
  { id: "mobile", icon: Smartphone, label: "Mobile", width: "375px" },
];

/* ------------------------------------------------------------------ */
/*  Toolbar component                                                  */
/* ------------------------------------------------------------------ */

export function BuilderToolbar({
  templateName,
  breakpoint,
  onBreakpointChange,
  onSave,
  onPreview,
  onPublish,
  onBack,
  isSaving,
  isDirty,
}: BuilderToolbarProps) {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-12 items-center justify-between border-b border-neutral-200 bg-white px-3 dark:border-neutral-800 dark:bg-neutral-950">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Back to templates</TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {templateName}
            </span>
            {isDirty && (
              <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />
            )}
          </div>
        </div>

        {/* Center: Undo/Redo + Breakpoints */}
        <div className="flex items-center gap-1">
          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 border-r border-neutral-200 pr-2 dark:border-neutral-700">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!canUndo}
                  onClick={() => actions.history.undo()}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!canRedo}
                  onClick={() => actions.history.redo()}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo</TooltipContent>
            </Tooltip>
          </div>

          {/* Breakpoint switcher */}
          <div className="flex items-center gap-0.5 pl-1">
            {breakpoints.map((bp) => {
              const Icon = bp.icon;
              const isActive = breakpoint === bp.id;
              return (
                <Tooltip key={bp.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        isActive &&
                          "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100",
                      )}
                      onClick={() => onBreakpointChange(bp.id)}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {bp.label} ({bp.width})
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>

        {/* Right: Save + Preview + Publish */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onSave}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
            </TooltipTrigger>
            <TooltipContent>Save template version</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5"
                onClick={onPreview}
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open live preview</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={onPublish}
              >
                <Rocket className="h-3.5 w-3.5" />
                Publish
              </Button>
            </TooltipTrigger>
            <TooltipContent>Deploy to production</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
