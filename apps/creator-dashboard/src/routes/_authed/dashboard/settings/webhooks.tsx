import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Globe,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  Webhook,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authed/dashboard/settings/webhooks")({
  component: WebhooksPage,
  errorComponent: RouteErrorBoundary,
});

// -- Event Types --------------------------------------------------------------

const WEBHOOK_EVENTS = [
  { value: "enrollment.created", label: "Enrollment Created", description: "When a student enrolls in a course" },
  { value: "enrollment.completed", label: "Enrollment Completed", description: "When a student completes a course" },
  { value: "payment.succeeded", label: "Payment Succeeded", description: "When a payment is successfully processed" },
  { value: "payment.failed", label: "Payment Failed", description: "When a payment attempt fails" },
  { value: "student.created", label: "Student Created", description: "When a new student signs up" },
  { value: "quiz.completed", label: "Quiz Completed", description: "When a student completes a quiz" },
  { value: "certificate.issued", label: "Certificate Issued", description: "When a certificate is generated" },
] as const;

// -- Page Component -----------------------------------------------------------

function WebhooksPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: configs, isLoading } = useQuery(
    trpc.webhooks.list.queryOptions(),
  );

  const { data: recentLogs, isLoading: isLoadingLogs } = useQuery(
    trpc.webhooks.getRecentLogs.queryOptions({ limit: 50 }),
  );

  const deleteMutation = useMutation(
    trpc.webhooks.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Webhook deleted");
        queryClient.invalidateQueries({ queryKey: trpc.webhooks.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to delete webhook");
      },
    }),
  );

  const toggleMutation = useMutation(
    trpc.webhooks.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.webhooks.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to update webhook");
      },
    }),
  );

  const regenerateSecretMutation = useMutation(
    trpc.webhooks.regenerateSecret.mutationOptions({
      onSuccess: () => {
        toast.success("Webhook secret regenerated");
        queryClient.invalidateQueries({ queryKey: trpc.webhooks.list.queryKey() });
      },
      onError: () => {
        toast.error("Failed to regenerate secret");
      },
    }),
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gaspar-lavender/20">
            <Webhook className="size-6 text-gaspar-purple" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Webhooks</h1>
            <p className="mt-1 text-muted-foreground">
              Configure outbound webhooks to integrate with Zapier, Make, or your own services.
            </p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="pill">
              <Plus className="size-4" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <CreateWebhookDialog
            onSuccess={() => {
              setIsCreateOpen(false);
              queryClient.invalidateQueries({ queryKey: trpc.webhooks.list.queryKey() });
            }}
          />
        </Dialog>
      </div>

      {/* Webhook Endpoints */}
      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold">Endpoints</h2>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="rounded-2xl">
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : configs && configs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {configs.map((config) => (
              <WebhookEndpointCard
                key={config.id}
                config={config}
                onToggle={(active) =>
                  toggleMutation.mutate({ id: config.id, active })
                }
                onDelete={() => deleteMutation.mutate({ id: config.id })}
                onRegenerateSecret={() =>
                  regenerateSecretMutation.mutate({ id: config.id })
                }
              />
            ))}
          </div>
        ) : (
          <Card className="mt-4 rounded-2xl border-border/50">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-gaspar-lavender/20">
                <Webhook className="size-8 text-gaspar-purple/60" />
              </div>
              <div>
                <p className="font-heading font-medium">No webhooks configured</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a webhook endpoint to receive real-time notifications when events occur.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(true)}
                className="rounded-full"
              >
                <Plus className="size-4" />
                Add Your First Webhook
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Recent Deliveries */}
      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold">Recent Deliveries</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 50 webhook delivery attempts across all endpoints.
        </p>

        {isLoadingLogs ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-2xl border border-border/50 p-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentLogs && recentLogs.length > 0 ? (
          <div className="mt-4 space-y-1.5">
            {recentLogs.map((entry) => (
              <DeliveryLogRow
                key={entry.log.id}
                log={entry.log}
                webhookUrl={entry.webhookUrl}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-4 rounded-2xl border-border/50">
            <CardContent className="py-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted/30">
                <Send className="size-7 text-muted-foreground/50" />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                No deliveries yet. Webhook events will appear here as they are sent.
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

// -- Webhook Endpoint Card ----------------------------------------------------

interface WebhookEndpointCardProps {
  readonly config: {
    readonly id: string;
    readonly url: string;
    readonly events: unknown;
    readonly active: boolean;
    readonly secret: string | null;
    readonly createdAt: Date;
  };
  readonly onToggle: (active: boolean) => void;
  readonly onDelete: () => void;
  readonly onRegenerateSecret: () => void;
}

function WebhookEndpointCard({
  config,
  onToggle,
  onDelete,
  onRegenerateSecret,
}: WebhookEndpointCardProps) {
  const [showSecret, setShowSecret] = useState(false);
  const events = (config.events ?? []) as string[];

  const handleCopySecret = useCallback(async () => {
    if (config.secret) {
      await navigator.clipboard.writeText(config.secret);
      toast.success("Secret copied to clipboard");
    }
  }, [config.secret]);

  const handleCopyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(config.url);
    toast.success("URL copied to clipboard");
  }, [config.url]);

  return (
    <Card className="rounded-2xl border-border/50 shadow-sm">
      <CardContent className="py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-10 items-center justify-center rounded-xl",
                config.active ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted/40",
              )}
            >
              <Globe
                className={cn(
                  "size-5",
                  config.active ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                )}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate font-mono text-sm font-medium">{config.url}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 shrink-0 rounded-full"
                  onClick={handleCopyUrl}
                  aria-label="Copy webhook URL"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {events.map((event) => (
                  <span key={event} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
                    {event}
                  </span>
                ))}
              </div>
              {config.secret && (
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Secret:</span>
                  <code className="font-mono text-xs text-muted-foreground">
                    {showSecret ? config.secret : "whsec_********************"}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-5 rounded-full"
                    onClick={() => setShowSecret((prev) => !prev)}
                    aria-label={showSecret ? "Hide secret" : "Show secret"}
                  >
                    {showSecret ? (
                      <EyeOff className="size-3" />
                    ) : (
                      <Eye className="size-3" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-5 rounded-full"
                    onClick={handleCopySecret}
                    aria-label="Copy secret"
                  >
                    <Copy className="size-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-medium",
              config.active
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-muted text-muted-foreground",
            )}>
              {config.active ? "Active" : "Inactive"}
            </span>
            <Switch
              checked={config.active}
              onCheckedChange={onToggle}
              aria-label="Toggle webhook active state"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="rounded-full"
                  aria-label="Webhook actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onSelect={onRegenerateSecret} className="rounded-lg">
                  <RefreshCw className="size-4" />
                  Regenerate Secret
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onDelete} className="rounded-lg">
                  <Trash2 className="size-4" />
                  Delete Webhook
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// -- Create Webhook Dialog ----------------------------------------------------

interface CreateWebhookDialogProps {
  readonly onSuccess: () => void;
}

function CreateWebhookDialog({ onSuccess }: CreateWebhookDialogProps) {
  const trpc = useTRPC();
  const [url, setUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());

  const createMutation = useMutation(
    trpc.webhooks.create.mutationOptions({
      onSuccess: () => {
        toast.success("Webhook created");
        onSuccess();
        setUrl("");
        setSelectedEvents(new Set());
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create webhook");
      },
    }),
  );

  const handleToggleEvent = useCallback((event: string) => {
    setSelectedEvents((prev) => {
      const next = new Set(prev);
      if (next.has(event)) {
        next.delete(event);
      } else {
        next.add(event);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedEvents(new Set(WEBHOOK_EVENTS.map((e) => e.value)));
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedEvents(new Set());
  }, []);

  const handleCreate = useCallback(() => {
    if (url.length === 0 || selectedEvents.size === 0) return;
    createMutation.mutate({
      url,
      events: [...selectedEvents],
    });
  }, [url, selectedEvents, createMutation]);

  return (
    <DialogContent className="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle className="font-heading">Add Webhook Endpoint</DialogTitle>
        <DialogDescription>
          We will send POST requests to this URL when selected events occur.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="webhook-url">Endpoint URL</Label>
          <Input
            id="webhook-url"
            type="url"
            placeholder="https://hooks.zapier.com/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="rounded-xl"
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label>Events to Listen For</Label>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleSelectAll}
              >
                Select all
              </Button>
              <span className="text-xs text-muted-foreground">/</span>
              <Button
                type="button"
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={handleDeselectAll}
              >
                None
              </Button>
            </div>
          </div>

          <ScrollArea className="h-56 rounded-xl border border-border/50">
            <div className="space-y-1 p-3">
              {WEBHOOK_EVENTS.map((event) => {
                const isSelected = selectedEvents.has(event.value);
                return (
                  <button
                    key={event.value}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50",
                    )}
                    onClick={() => handleToggleEvent(event.value)}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center rounded-md border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <Check className="size-3" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={handleCreate}
          disabled={
            url.length === 0 ||
            selectedEvents.size === 0 ||
            createMutation.isPending
          }
          className="pill"
        >
          {createMutation.isPending ? "Creating..." : "Create Webhook"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

// -- Delivery Log Row ---------------------------------------------------------

interface DeliveryLogRowProps {
  readonly log: {
    readonly id: string;
    readonly event: string;
    readonly statusCode: number | null;
    readonly responseBody: string | null;
    readonly attemptNumber: number;
    readonly deliveredAt: Date;
  };
  readonly webhookUrl: string;
}

function DeliveryLogRow({ log, webhookUrl }: DeliveryLogRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isSuccess = log.statusCode !== null && log.statusCode >= 200 && log.statusCode < 300;
  const isFailed = log.statusCode === null || log.statusCode === 0 || log.statusCode >= 400;

  return (
    <div className="rounded-2xl border border-border/50 transition-colors hover:border-border">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3.5 text-left transition-colors hover:bg-muted/20"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isSuccess ? (
          <div className="flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
            <CheckCircle2 className="size-3.5 text-emerald-600" />
          </div>
        ) : isFailed ? (
          <div className="flex size-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <XCircle className="size-3.5 text-destructive" />
          </div>
        ) : (
          <div className="flex size-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="size-3.5 text-amber-500" />
          </div>
        )}

        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium text-primary">
          {log.event}
        </span>

        <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
          {webhookUrl}
        </span>

        <span className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
          isSuccess
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
            : isFailed
              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
        )}>
          {log.statusCode !== null && log.statusCode > 0
            ? `${String(log.statusCode)}`
            : "Failed"}
        </span>

        {log.attemptNumber > 1 && (
          <span className="shrink-0 rounded-full border border-border/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {`Attempt ${String(log.attemptNumber)}`}
          </span>
        )}

        <time
          dateTime={new Date(log.deliveredAt).toISOString()}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatDistanceToNow(new Date(log.deliveredAt), { addSuffix: true })}
        </time>
      </button>

      {isExpanded && log.responseBody && (
        <div className="border-t border-border/50 bg-muted/10 p-4">
          <p className="text-xs font-medium text-muted-foreground">Response Body</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-muted/30 p-3 font-mono text-xs">
            {log.responseBody}
          </pre>
        </div>
      )}
    </div>
  );
}
