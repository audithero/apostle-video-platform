import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  BookOpen,
  Check,
  Eraser,
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

// ---------- Diff display helper ----------

function ContentPreview({
  original,
  rewritten,
}: {
  readonly original: string;
  readonly rewritten: string;
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  // Strip HTML for plain text comparison display
  const stripHtml = (html: string): string =>
    html.replace(/<[^>]*>/g, "").trim();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Button
          type="button"
          variant={showOriginal ? "outline" : "default"}
          size="sm"
          onClick={() => setShowOriginal(false)}
          className="text-xs"
        >
          <Sparkles className="size-3" />
          AI Result
        </Button>
        <Button
          type="button"
          variant={showOriginal ? "default" : "outline"}
          size="sm"
          onClick={() => setShowOriginal(true)}
          className="text-xs"
        >
          <BookOpen className="size-3" />
          Original
        </Button>
      </div>
      <ScrollArea className="max-h-64 rounded-md border bg-muted/30 p-3">
        {showOriginal ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            {stripHtml(original).length > 0 ? (
              <p className="whitespace-pre-wrap">{stripHtml(original)}</p>
            ) : (
              <p className="italic">No original content</p>
            )}
          </div>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: rewritten }}
          />
        )}
      </ScrollArea>
    </div>
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

  // Credit balance query
  const { data: credits } = useQuery(trpc.ai.getCredits.queryOptions());
  const rewriteCredits = credits?.ai_rewrite ?? 0;

  const rewriteMutation = useMutation(
    trpc.ai.rewriteLesson.mutationOptions({
      onSuccess: (data) => {
        setRewrittenHtml(data.contentHtml);
        toast.success("AI rewrite complete. Review the result below.");
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
      rewriteMutation.mutate({
        content: currentContent,
        instruction: action.instruction,
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
      toast.success("Content updated with AI rewrite");
    }
  }, [rewrittenHtml, onAcceptRewrite]);

  const handleDismiss = useCallback(() => {
    setRewrittenHtml(null);
    setActiveAction(null);
  }, []);

  const isProcessing = rewriteMutation.isPending;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Action buttons row */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-md border bg-muted/30 px-2 py-1.5">
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="size-3.5 text-violet-500" />
          AI
        </div>
        <div className="mx-1 h-4 w-px bg-border" role="separator" />
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
        <div className="ml-auto">
          <Badge variant="outline" className="text-[10px]">
            {`${String(rewriteCredits)} credits`}
          </Badge>
        </div>
      </div>

      {/* Preview panel */}
      {(rewrittenHtml || isProcessing) && (
        <div className="rounded-md border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
          {isProcessing ? (
            <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-violet-500" />
              <span>
                {`AI is ${REWRITE_ACTIONS.find((a) => a.id === activeAction)?.label.toLowerCase() ?? "processing"}ing your content...`}
              </span>
            </div>
          ) : rewrittenHtml ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-violet-700 dark:text-violet-300">
                  {`${REWRITE_ACTIONS.find((a) => a.id === activeAction)?.label ?? "AI"} Result`}
                </p>
                <span className="text-[10px] text-muted-foreground">
                  Review before applying
                </span>
              </div>

              <ContentPreview
                original={currentContent}
                rewritten={rewrittenHtml}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDismiss}
                >
                  <X className="size-3.5" />
                  Discard
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAccept}
                >
                  <Check className="size-3.5" />
                  Apply Changes
                </Button>
              </div>
            </div>
          ) : null}
        </div>
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
