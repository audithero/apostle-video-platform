import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useTRPC } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Rocket,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  Eye,
  History,
  Zap,
  Globe,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authed/dashboard/deployments/",
)({
  component: DeploymentsPage,
});

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { readonly status: string }) {
  const config: Record<string, { icon: typeof CheckCircle2; className: string; label: string }> = {
    pending: {
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      label: "Pending",
    },
    building: {
      icon: Loader2,
      className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      label: "Building",
    },
    live: {
      icon: CheckCircle2,
      className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      label: "Live",
    },
    failed: {
      icon: XCircle,
      className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      label: "Failed",
    },
    rolled_back: {
      icon: RotateCcw,
      className: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
      label: "Rolled Back",
    },
  };

  const { icon: Icon, className, label } = config[status] ?? config.pending;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      <Icon className={`h-3 w-3 ${status === "building" ? "animate-spin" : ""}`} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Platform badge                                                     */
/* ------------------------------------------------------------------ */

function PlatformBadge({ platform }: { readonly platform: string }) {
  const labels: Record<string, string> = {
    web: "Web",
    mobile_ios: "iOS",
    mobile_android: "Android",
    tvos: "tvOS",
  };

  return (
    <span className="inline-flex items-center gap-1 rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
      <Globe className="h-2.5 w-2.5" />
      {labels[platform] ?? platform}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Time formatter                                                     */
/* ------------------------------------------------------------------ */

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "Never";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${String(diffMin)}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${String(diffHr)}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${String(diffDays)}d ago`;
  return d.toLocaleDateString();
}

/* ------------------------------------------------------------------ */
/*  Deployments Page                                                   */
/* ------------------------------------------------------------------ */

function DeploymentsPage() {
  const trpc = useTRPC();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const deploymentsQuery = useQuery(
    trpc.sdui.deployments.list.queryOptions(),
  );

  const instancesQuery = useQuery(
    trpc.sdui.instances.list.queryOptions(),
  );

  const rollbackMutation = useMutation(
    trpc.sdui.deployments.rollback.mutationOptions({
      onSuccess: () => {
        deploymentsQuery.refetch();
      },
    }),
  );

  const deployments = deploymentsQuery.data ?? [];
  const instances = instancesQuery.data ?? [];

  const instanceMap = new Map(instances.map((i) => [i.id, i]));

  const filteredDeployments = statusFilter === "all"
    ? deployments
    : deployments.filter((d) => d.status === statusFilter);

  const liveCount = deployments.filter((d) => d.status === "live").length;
  const totalCount = deployments.length;
  const failedCount = deployments.filter((d) => d.status === "failed").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/templates">
            <Button variant="ghost" size="icon" className="h-8 w-8" type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
            <p className="text-sm text-neutral-500">
              Manage your deployed templates and view build history
            </p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{String(liveCount)}</p>
              <p className="text-xs text-neutral-500">Live Deployments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{String(totalCount)}</p>
              <p className="text-xs text-neutral-500">Total Builds</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{String(failedCount)}</p>
              <p className="text-xs text-neutral-500">Failed Builds</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="live">Live</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="building">Building</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="rolled_back">Rolled Back</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Deployment list */}
      {deploymentsQuery.isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        </div>
      ) : filteredDeployments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Rocket className="h-12 w-12 text-neutral-300" />
            <h3 className="mt-4 text-lg font-semibold">No deployments yet</h3>
            <p className="mt-1 text-sm text-neutral-500">
              Deploy a template instance to see it here
            </p>
            <Link to="/dashboard/templates">
              <Button className="mt-4" type="button">
                <Rocket className="mr-2 h-4 w-4" />
                Go to Templates
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredDeployments.map((deployment) => {
            const instance = instanceMap.get(deployment.instanceId);
            return (
              <Card key={deployment.id} className="transition-colors hover:border-neutral-300 dark:hover:border-neutral-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: deployment info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">
                          v{String(deployment.version)}
                        </span>
                        <StatusBadge status={deployment.status} />
                        <PlatformBadge platform={deployment.platform} />
                      </div>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        {instance?.name ?? "Unknown instance"}
                        {deployment.buildDurationMs
                          ? ` — Built in ${String(deployment.buildDurationMs)}ms`
                          : ""}
                      </p>
                      {deployment.errorMessage && (
                        <p className="mt-1 text-xs text-red-500">
                          {deployment.errorMessage}
                        </p>
                      )}
                      <p className="mt-1 text-[10px] text-neutral-400">
                        {deployment.deployedAt
                          ? `Deployed ${formatTimeAgo(deployment.deployedAt)}`
                          : `Created ${formatTimeAgo(deployment.createdAt)}`}
                      </p>
                    </div>

                    {/* Right: actions */}
                    <div className="flex items-center gap-2">
                      {deployment.previewUrl && (
                        <a
                          href={deployment.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" type="button">
                            <Eye className="mr-1 h-3 w-3" />
                            Preview
                          </Button>
                        </a>
                      )}
                      {deployment.liveUrl && deployment.status === "live" && (
                        <a
                          href={deployment.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm" type="button">
                            <ExternalLink className="mr-1 h-3 w-3" />
                            View Live
                          </Button>
                        </a>
                      )}
                      {deployment.status === "rolled_back" &&
                        deployment.artifactUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            disabled={rollbackMutation.isPending}
                            onClick={() =>
                              rollbackMutation.mutate({
                                deploymentId: deployment.id,
                              })
                            }
                          >
                            {rollbackMutation.isPending ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : (
                              <RotateCcw className="mr-1 h-3 w-3" />
                            )}
                            Restore
                          </Button>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
