import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useTRPC } from "@/lib/trpc/react";
import {
  Clock,
  Loader2,
  Mail,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  Send,
  Trash2,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authed/dashboard/emails/")({
  component: EmailManagement,
});

function EmailManagement() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);
  const [showNewSequence, setShowNewSequence] = useState(false);
  const [newBroadcastSubject, setNewBroadcastSubject] = useState("");
  const [newSequenceName, setNewSequenceName] = useState("");
  const [newSequenceTrigger, setNewSequenceTrigger] = useState<"enrollment" | "purchase" | "tag_added" | "manual">("enrollment");

  const { data: broadcasts, isLoading: loadingBroadcasts } = useQuery(
    trpc.emailMarketing.listBroadcasts.queryOptions(),
  );

  const { data: sequences, isLoading: loadingSequences } = useQuery(
    trpc.emailMarketing.listSequences.queryOptions(),
  );

  const createBroadcast = useMutation(
    trpc.emailMarketing.createBroadcast.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.emailMarketing.listBroadcasts.queryKey() });
        setShowNewBroadcast(false);
        setNewBroadcastSubject("");
      },
    }),
  );

  const deleteBroadcast = useMutation(
    trpc.emailMarketing.deleteBroadcast.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.emailMarketing.listBroadcasts.queryKey() });
      },
    }),
  );

  const createSequence = useMutation(
    trpc.emailMarketing.createSequence.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.emailMarketing.listSequences.queryKey() });
        setShowNewSequence(false);
        setNewSequenceName("");
        setNewSequenceTrigger("enrollment");
      },
    }),
  );

  const updateSequence = useMutation(
    trpc.emailMarketing.updateSequence.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.emailMarketing.listSequences.queryKey() });
      },
    }),
  );

  const deleteSequence = useMutation(
    trpc.emailMarketing.deleteSequence.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.emailMarketing.listSequences.queryKey() });
      },
    }),
  );

  const totalSent = broadcasts?.reduce((sum, b) => sum + (b.recipientCount ?? 0), 0) ?? 0;
  const sentBroadcasts = broadcasts?.filter((b) => b.status === "sent") ?? [];
  const totalOpened = sentBroadcasts.reduce((sum, b) => sum + (b.openCount ?? 0), 0);
  const totalClicked = sentBroadcasts.reduce((sum, b) => sum + (b.clickCount ?? 0), 0);
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const activeSequences = sequences?.filter((s) => s.status === "active").length ?? 0;

  const isLoading = loadingBroadcasts || loadingSequences;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Email Marketing</h1>
          <p className="mt-1 text-muted-foreground">
            Manage broadcasts and automated email sequences.
          </p>
        </div>
        <Button type="button" className="rounded-full" onClick={() => setShowNewBroadcast(true)}>
          <Plus className="mr-2 size-4" />
          New Broadcast
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-4">
        <div className="gaspar-card-cream rounded-2xl p-6">
          <p className="text-3xl font-bold tracking-tight">
            {isLoading ? "-" : totalSent.toLocaleString()}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">
            Emails Sent
          </p>
        </div>
        <div className="gaspar-card-blue rounded-2xl p-6">
          <p className="text-3xl font-bold tracking-tight">
            {isLoading ? "-" : `${String(openRate)}%`}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Open Rate</p>
        </div>
        <div className="gaspar-card-pink rounded-2xl p-6">
          <p className="text-3xl font-bold tracking-tight">
            {isLoading ? "-" : `${String(clickRate)}%`}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Click Rate</p>
        </div>
        <div className="gaspar-card-navy rounded-2xl p-6">
          <p className="text-3xl font-bold tracking-tight">
            {isLoading ? "-" : String(activeSequences)}
          </p>
          <p className="mt-1 text-xs font-semibold uppercase tracking-wider opacity-60">Active Sequences</p>
        </div>
      </div>

      <Tabs defaultValue="broadcasts">
        <TabsList>
          <TabsTrigger value="broadcasts">
            <Send className="mr-2 size-4" />
            Broadcasts
          </TabsTrigger>
          <TabsTrigger value="sequences">
            <Zap className="mr-2 size-4" />
            Sequences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="broadcasts" className="mt-4 space-y-3">
          {loadingBroadcasts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !broadcasts || broadcasts.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mail className="mb-3 size-10 text-muted-foreground/40" />
                <p className="font-semibold">No broadcasts yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first broadcast to reach your students.
                </p>
                <Button
                  type="button"
                  className="mt-4 rounded-full"
                  onClick={() => setShowNewBroadcast(true)}
                >
                  <Plus className="mr-2 size-4" />
                  New Broadcast
                </Button>
              </CardContent>
            </Card>
          ) : (
            broadcasts.map((broadcast) => (
              <Card key={broadcast.id} className="rounded-2xl border-border/50 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gaspar-blue/60">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">{broadcast.subject}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge
                          className="rounded-full px-3"
                          variant={broadcast.status === "sent" ? "default" : broadcast.status === "scheduled" ? "outline" : "secondary"}
                        >
                          {broadcast.status}
                        </Badge>
                        {broadcast.sentAt ? (
                          <span>{`Sent ${formatDistanceToNow(new Date(broadcast.sentAt), { addSuffix: true })}`}</span>
                        ) : broadcast.scheduledAt ? (
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {`Scheduled ${formatDistanceToNow(new Date(broadcast.scheduledAt), { addSuffix: true })}`}
                          </span>
                        ) : null}
                        {broadcast.status === "sent" && broadcast.recipientCount ? (
                          <span>{`${String(broadcast.recipientCount)} recipients`}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="sm">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Pencil className="mr-2 size-4" />
                        Edit
                      </DropdownMenuItem>
                      {broadcast.status === "draft" && (
                        <DropdownMenuItem>
                          <Send className="mr-2 size-4" />
                          Send Now
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteBroadcast.mutate({ id: broadcast.id })}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sequences" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setShowNewSequence(true)}
            >
              <Plus className="mr-2 size-3" />
              New Sequence
            </Button>
          </div>

          {loadingSequences ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !sequences || sequences.length === 0 ? (
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Zap className="mb-3 size-10 text-muted-foreground/40" />
                <p className="font-semibold">No sequences yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create automated email sequences triggered by student actions.
                </p>
                <Button
                  type="button"
                  className="mt-4 rounded-full"
                  onClick={() => setShowNewSequence(true)}
                >
                  <Plus className="mr-2 size-4" />
                  New Sequence
                </Button>
              </CardContent>
            </Card>
          ) : (
            sequences.map((sequence) => (
              <Card key={sequence.id} className="rounded-2xl border-border/50 transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-gaspar-pink/60">
                      <Zap className="size-5" />
                    </div>
                    <div>
                      <p className="font-medium">{sequence.name}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <Badge
                          className="rounded-full px-3"
                          variant={sequence.status === "active" ? "default" : sequence.status === "paused" ? "secondary" : "outline"}
                        >
                          {sequence.status}
                        </Badge>
                        <span>{`Trigger: ${sequence.triggerType}`}</span>
                        {sequence.createdAt && (
                          <span>{`Created ${formatDistanceToNow(new Date(sequence.createdAt), { addSuffix: true })}`}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sequence.status === "paused" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateSequence.mutate({ id: sequence.id, status: "active" })}
                      >
                        <Play className="mr-1 size-3" />
                        Resume
                      </Button>
                    )}
                    {sequence.status === "active" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateSequence.mutate({ id: sequence.id, status: "paused" })}
                      >
                        <Pause className="mr-1 size-3" />
                        Pause
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 size-4" />
                          Edit Steps
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => deleteSequence.mutate({ id: sequence.id })}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* New Broadcast Dialog */}
      <Dialog open={showNewBroadcast} onOpenChange={setShowNewBroadcast}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Broadcast</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="broadcast-subject">Subject Line</Label>
              <Input
                id="broadcast-subject"
                value={newBroadcastSubject}
                onChange={(e) => setNewBroadcastSubject(e.target.value)}
                placeholder="e.g. New Course Available!"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewBroadcast(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!newBroadcastSubject.trim() || createBroadcast.isPending}
                onClick={() => createBroadcast.mutate({ subject: newBroadcastSubject })}
              >
                {createBroadcast.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                Create Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Sequence Dialog */}
      <Dialog open={showNewSequence} onOpenChange={setShowNewSequence}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Email Sequence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="sequence-name">Sequence Name</Label>
              <Input
                id="sequence-name"
                value={newSequenceName}
                onChange={(e) => setNewSequenceName(e.target.value)}
                placeholder="e.g. Welcome Series"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sequence-trigger">Trigger</Label>
              <Select value={newSequenceTrigger} onValueChange={(v) => setNewSequenceTrigger(v as typeof newSequenceTrigger)}>
                <SelectTrigger id="sequence-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrollment">Student Enrollment</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="tag_added">Tag Added</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowNewSequence(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!newSequenceName.trim() || createSequence.isPending}
                onClick={() => createSequence.mutate({ name: newSequenceName, triggerType: newSequenceTrigger })}
              >
                {createSequence.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 size-4" />
                )}
                Create Sequence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
