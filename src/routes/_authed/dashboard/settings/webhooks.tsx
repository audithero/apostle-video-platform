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
import { Badge } from "@/components/ui/badge";
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="mt-1 text-muted-foreground">
            Configure outbound webhooks to integrate with Zapier, Make, or your own services.
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button">
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
        <h2 className="text-lg font-semibold">Endpoints</h2>

        {isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-center gap-4 py-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-20" />
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
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                <Webhook className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No webhooks configured</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a webhook endpoint to receive real-time notifications when events occur.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(true)}
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
        <h2 className="text-lg font-semibold">Recent Deliveries</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Last 50 webhook delivery attempts across all endpoints.
        </p>

        {isLoadingLogs ? (
          <div className="mt-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border p-3">
                <Skeleton className="size-6 rounded-full" />
                <Skeleton className="h-4 w-40 flex-1" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : recentLogs && recentLogs.length > 0 ? (
          <div className="mt-4 space-y-1">
            {recentLogs.map((entry) => (
              <DeliveryLogRow
                key={entry.log.id}
                log={entry.log}
                webhookUrl={entry.webhookUrl}
              />
            ))}
          </div>
        ) : (
          <Card className="mt-4">
            <CardContent className="py-8 text-center">
              <Send className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
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
    <Card>
      <CardContent className="py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 flex size-10 items-center justify-center rounded-full",
                config.active ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted",
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
                <p className="truncate text-sm font-medium">{config.url}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="size-6 shrink-0"
                  onClick={handleCopyUrl}
                  aria-label="Copy webhook URL"
                >
                  <Copy className="size-3" />
                </Button>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {events.map((event) => (
                  <Badge key={event} variant="secondary" className="text-[10px]">
                    {event}
                  </Badge>
                ))}
              </div>
              {config.secret && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Secret:</span>
                  <code className="text-xs font-mono text-muted-foreground">
                    {showSecret ? config.secret : "whsec_********************"}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="size-5"
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
                    className="size-5"
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
                  aria-label="Webhook actions"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onSelect={onRegenerateSecret}>
                  <RefreshCw className="size-4" />
                  Regenerate Secret
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={onDelete}>
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
        <DialogTitle>Add Webhook Endpoint</DialogTitle>
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

          <ScrollArea className="h-56 rounded-md border">
            <div className="space-y-1 p-3">
              {WEBHOOK_EVENTS.map((event) => {
                const isSelected = selectedEvents.has(event.value);
                return (
                  <button
                    key={event.value}
                    type="button"
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md p-2 text-left transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent/50",
                    )}
                    onClick={() => handleToggleEvent(event.value)}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex size-5 items-center justify-center rounded border",
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
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-accent/50"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {isSuccess ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
        ) : isFailed ? (
          <XCircle className="size-4 shrink-0 text-destructive" />
        ) : (
          <AlertCircle className="size-4 shrink-0 text-amber-500" />
        )}

        <Badge variant="secondary" className="shrink-0 text-[10px]">
          {log.event}
        </Badge>

        <span className="flex-1 truncate text-xs text-muted-foreground">
          {webhookUrl}
        </span>

        <span className="shrink-0 text-xs text-muted-foreground">
          {log.statusCode !== null && log.statusCode > 0
            ? `${String(log.statusCode)}`
            : "Failed"}
        </span>

        {log.attemptNumber > 1 && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            {`Attempt ${String(log.attemptNumber)}`}
          </Badge>
        )}

        <time
          dateTime={new Date(log.deliveredAt).toISOString()}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatDistanceToNow(new Date(log.deliveredAt), { addSuffix: true })}
        </time>
      </button>

      {isExpanded && log.responseBody && (
        <div className="border-t bg-muted/30 p-3">
          <p className="text-xs font-medium text-muted-foreground">Response Body</p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted p-2 font-mono text-xs">
            {log.responseBody}
          </pre>
        </div>
      )}
    </div>
  );
}
