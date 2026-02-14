import { useState, useCallback, useMemo } from "react";
import DOMPurify from "dompurify";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  Check,
  ChevronDown,
  Eraser,
  Globe,
  Lightbulb,
  Loader2,
  Maximize2,
  Minimize2,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ---------- Types ----------

interface RewriteAction {
  readonly id: string;
  readonly label: string;
  readonly instruction: string;
  readonly icon: typeof PenLine;
  readonly description: string;
}

const REWRITE_ACTIONS: ReadonlyArray<RewriteAction> = [
  {
    id: "rewrite",
    label: "Rewrite",
    instruction: "Rewrite the following lesson content while maintaining the same information and educational value. Improve clarity, flow, and engagement.",
    icon: PenLine,
    description: "Rewrite for clarity and engagement",
  },
  {
    id: "simplify",
    label: "Simplify",
    instruction: "Simplify the following lesson content to make it accessible to beginners. Use shorter sentences, simpler vocabulary, and more concrete examples. Remove jargon or explain it clearly.",
    icon: Minimize2,
    description: "Simplify language for beginners",
  },
  {
    id: "expand",
    label: "Expand",
    instruction: "Expand the following lesson content with additional depth, examples, and explanations. Add more detail to complex concepts and include practical applications.",
    icon: Maximize2,
    description: "Add more detail and depth",
  },
  {
    id: "examples",
    label: "Add Examples",
    instruction: "Enhance the following lesson content by adding practical, real-world examples and code samples where appropriate. Keep the existing content but weave in concrete illustrations of each concept.",
    icon: Lightbulb,
    description: "Add practical examples and illustrations",
  },
  {
    id: "grammar",
    label: "Fix Grammar",
    instruction: "Fix any grammar, spelling, punctuation, and style issues in the following lesson content. Do not change the meaning or structure, only correct errors and improve readability.",
    icon: Eraser,
    description: "Fix grammar and spelling errors",
  },
];

const TRANSLATION_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "pt", label: "Portuguese" },
  { code: "ja", label: "Japanese" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ko", label: "Korean" },
  { code: "ar", label: "Arabic" },
  { code: "hi", label: "Hindi" },
  { code: "ru", label: "Russian" },
] as const;

interface CourseContext {
  readonly title: string;
  readonly description: string;
  readonly level: string;
}

interface AIRewriteToolbarProps {
  /** Current HTML content from the TipTap editor */
  readonly currentContent: string;
  /** Course context for the AI to understand scope */
  readonly courseContext: CourseContext;
  /** Called when user accepts the rewritten content */
  readonly onAcceptRewrite: (html: string) => void;
  /** Optional class name */
  readonly className?: string;
}

// ---------- Diff helpers ----------

interface DiffLine {
  readonly type: "added" | "removed" | "unchanged";
  readonly text: string;
}

const stripHtml = (html: string): string =>
  html.replace(/<[^>]*>/g, "").trim();

/**
 * Produces a simple line-level diff between two plain text strings.
 * Unchanged lines are kept as-is; removed lines come from `a` only,
 * added lines come from `b` only.
 */
const computeLineDiff = (a: string, b: string): ReadonlyArray<DiffLine> => {
  const linesA = a.split("\n");
  const linesB = b.split("\n");
  const result: DiffLine[] = [];

  // Simple LCS-based diff using a map for matching lines
  const bLineIndices = new Map<string, number[]>();
  for (const [idx, line] of linesB.entries()) {
    const existing = bLineIndices.get(line);
    if (existing) {
      existing.push(idx);
    } else {
      bLineIndices.set(line, [idx]);
    }
  }

  let bIdx = 0;

  for (const lineA of linesA) {
    const matches = bLineIndices.get(lineA);
    const nextMatch = matches?.find((i) => i >= bIdx);

    if (nextMatch !== undefined) {
      // Emit any added lines from B that come before this match
      while (bIdx < nextMatch) {
        result.push({ type: "added", text: linesB[bIdx] });
        bIdx += 1;
      }
      result.push({ type: "unchanged", text: lineA });
      bIdx = nextMatch + 1;
    } else {
      result.push({ type: "removed", text: lineA });
    }
  }

  // Remaining lines in B are additions
  while (bIdx < linesB.length) {
    result.push({ type: "added", text: linesB[bIdx] });
    bIdx += 1;
  }

  return result;
};

// ---------- Diff View Dialog ----------

function DiffViewDialog({
  open,
  onOpenChange,
  original,
  rewritten,
  actionLabel,
  onAccept,
  onReject,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly original: string;
  readonly rewritten: string;
  readonly actionLabel: string;
  readonly onAccept: () => void;
  readonly onReject: () => void;
}) {
  const [viewMode, setViewMode] = useState<"diff" | "preview">("diff");

  const diffLines = useMemo(
    () => computeLineDiff(stripHtml(original), stripHtml(rewritten)),
    [original, rewritten],
  );

  const hasChanges = diffLines.some((l) => l.type !== "unchanged");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{`${actionLabel} - Review Changes`}</DialogTitle>
          <DialogDescription>
            Review the AI-generated changes before applying them to your lesson.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={viewMode === "diff" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("diff")}
              className="text-xs"
            >
              Diff View
            </Button>
            <Button
              type="button"
              variant={viewMode === "preview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("preview")}
              className="text-xs"
            >
              <Sparkles className="size-3" />
              Preview Result
            </Button>
            {!hasChanges && (
              <span className="ml-auto self-center text-xs text-muted-foreground">
                No text-level differences detected
              </span>
            )}
          </div>

          <ScrollArea className="max-h-96 rounded-md border bg-muted/20 p-0">
            {viewMode === "diff" ? (
              <div className="font-mono text-xs leading-relaxed">
                {diffLines.map((line, idx) => {
                  const key = `${line.type}-${String(idx)}`;
                  if (line.type === "removed") {
                    return (
                      <div
                        key={key}
                        className="bg-red-50 px-3 py-0.5 text-red-800 line-through dark:bg-red-950/30 dark:text-red-300"
                      >
                        <span className="mr-2 select-none text-red-400">-</span>
                        {line.text || "\u00A0"}
                      </div>
                    );
                  }
                  if (line.type === "added") {
                    return (
                      <div
                        key={key}
                        className="bg-green-50 px-3 py-0.5 text-green-800 dark:bg-green-950/30 dark:text-green-300"
                      >
                        <span className="mr-2 select-none text-green-400">+</span>
                        {line.text || "\u00A0"}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="px-3 py-0.5 text-muted-foreground">
                      <span className="mr-2 select-none opacity-30">&nbsp;</span>
                      {line.text || "\u00A0"}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className="prose prose-sm dark:prose-invert max-w-none p-4"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rewritten) }}
              />
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onReject}
          >
            <X className="size-3.5" />
            Discard
          </Button>
          <Button type="button" onClick={onAccept}>
            <Check className="size-3.5" />
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Main Component ----------

function AIRewriteToolbar({
  currentContent,
  courseContext,
  onAcceptRewrite,
  className,
}: AIRewriteToolbarProps) {
  const trpc = useTRPC();

  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [rewrittenHtml, setRewrittenHtml] = useState<string | null>(null);
  const [showDiffDialog, setShowDiffDialog] = useState(false);

  // Credit balance query
  const { data: credits } = useQuery(trpc.ai.getCredits.queryOptions());
  const rewriteCredits = credits?.ai_rewrite ?? 0;

  const rewriteMutation = useMutation(
    trpc.ai.rewriteLesson.mutationOptions({
      onSuccess: (data) => {
        setRewrittenHtml(data.contentHtml);
        setShowDiffDialog(true);
        toast.success("AI rewrite complete. Review the changes.");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to rewrite content");
        setActiveAction(null);
      },
    }),
  );

  const handleRewrite = useCallback(
    (action: RewriteAction) => {
      if (currentContent.trim().length < 10) {
        toast.error("Write some content first before using AI rewrite");
        return;
      }
      setActiveAction(action.id);
      setRewrittenHtml(null);
      setShowDiffDialog(false);
      rewriteMutation.mutate({
        content: currentContent,
        instruction: action.instruction,
        outlineContext: courseContext,
      });
    },
    [currentContent, courseContext, rewriteMutation],
  );

  const handleTranslate = useCallback(
    (languageLabel: string) => {
      if (currentContent.trim().length < 10) {
        toast.error("Write some content first before using AI rewrite");
        return;
      }
      setActiveAction("translate");
      setRewrittenHtml(null);
      setShowDiffDialog(false);
      rewriteMutation.mutate({
        content: currentContent,
        instruction: `Translate the following lesson content into ${languageLabel}. Preserve all formatting, code blocks, headings, and structure. Translate only the natural language text, not code or technical identifiers. Maintain the educational tone and accuracy.`,
        outlineContext: courseContext,
      });
    },
    [currentContent, courseContext, rewriteMutation],
  );

  const handleAccept = useCallback(() => {
    if (rewrittenHtml) {
      onAcceptRewrite(rewrittenHtml);
      setRewrittenHtml(null);
      setActiveAction(null);
      setShowDiffDialog(false);
      toast.success("Content updated with AI rewrite");
    }
  }, [rewrittenHtml, onAcceptRewrite]);

  const handleDismiss = useCallback(() => {
    setRewrittenHtml(null);
    setActiveAction(null);
    setShowDiffDialog(false);
  }, []);

  const isProcessing = rewriteMutation.isPending;

  const activeLabel = useMemo(() => {
    if (activeAction === "translate") return "Translate";
    return REWRITE_ACTIONS.find((a) => a.id === activeAction)?.label ?? "AI";
  }, [activeAction]);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1.5">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-violet-500" />
          AI
        </div>
        <div className="mx-1 h-4 w-px bg-border" />
        {REWRITE_ACTIONS.map((action) => {
          const Icon = action.icon;
          const isActive = activeAction === action.id;
          return (
            <Button
              key={action.id}
              type="button"
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={isProcessing || rewriteCredits < 1}
              onClick={() => handleRewrite(action)}
              aria-label={action.description}
            >
              {isActive && isProcessing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Icon className="size-3" />
              )}
              {action.label}
            </Button>
          );
        })}

        {/* Translate dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant={activeAction === "translate" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              disabled={isProcessing || rewriteCredits < 1}
              aria-label="Translate lesson content"
            >
              {activeAction === "translate" && isProcessing ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Globe className="size-3" />
              )}
              Translate
              <ChevronDown className="size-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>Select language</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {TRANSLATION_LANGUAGES.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => handleTranslate(lang.label)}
              >
                {lang.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="ml-auto">
          <Badge variant="outline" className="text-[10px]">
            {`${String(rewriteCredits)} credits`}
          </Badge>
        </div>
      </div>

      {/* Inline processing indicator */}
      {isProcessing && (
        <div className="rounded-md border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
          <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin text-violet-500" />
            <span>
              {`AI is ${activeLabel.toLowerCase()}ing your content...`}
            </span>
          </div>
        </div>
      )}

      {/* Diff dialog for reviewing changes */}
      {rewrittenHtml && (
        <DiffViewDialog
          open={showDiffDialog}
          onOpenChange={(open) => {
            if (!open) {
              handleDismiss();
            }
          }}
          original={currentContent}
          rewritten={rewrittenHtml}
          actionLabel={activeLabel}
          onAccept={handleAccept}
          onReject={handleDismiss}
        />
      )}

      {rewriteCredits < 1 && (
        <p className="text-xs text-destructive">
          No rewrite credits remaining. Upgrade your plan or purchase an add-on.
        </p>
      )}
    </div>
  );
}

export { AIRewriteToolbar };
export type { AIRewriteToolbarProps, CourseContext };
