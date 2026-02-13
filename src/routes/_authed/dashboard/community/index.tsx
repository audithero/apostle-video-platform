import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Filter,
  Hash,
  MoreHorizontal,
  Pencil,
  Plus,
  ScrollText,
  Shield,
  Trash2,
  UserX,
  X,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/dashboard/community/")({
  component: CommunityManagement,
  errorComponent: RouteErrorBoundary,
});

function CommunityManagement() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<{
    id: string;
    name: string;
    description: string | null;
    channelType: "feed" | "chat";
    accessLevel: "public" | "members" | "specific_course";
    iconEmoji: string;
  } | null>(null);
  const [deleteChannelId, setDeleteChannelId] = useState<string | null>(null);

  // New channel form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<"feed" | "chat">("feed");
  const [newAccess, setNewAccess] = useState<"public" | "members" | "specific_course">("members");
  const [newEmoji, setNewEmoji] = useState("\u{1F4AC}");

  // Flagged posts
  const { data: flaggedPosts, isLoading: isLoadingFlagged } = useQuery(
    trpc.communityPosts.listFlagged.queryOptions(),
  );

  // Mutations
  const createMutation = useMutation(
    trpc.communityChannels.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityChannels.myChannels.queryKey() });
        resetCreateForm();
        setCreateDialogOpen(false);
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.communityChannels.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityChannels.myChannels.queryKey() });
        setEditingChannel(null);
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.communityChannels.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityChannels.myChannels.queryKey() });
        setDeleteChannelId(null);
      },
    }),
  );

  const resetCreateForm = useCallback(() => {
    setNewName("");
    setNewDescription("");
    setNewType("feed");
    setNewAccess("members");
    setNewEmoji("\u{1F4AC}");
  }, []);

  const handleCreate = useCallback(() => {
    if (newName.trim().length === 0) return;
    createMutation.mutate({
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      channelType: newType,
      accessLevel: newAccess,
      iconEmoji: newEmoji,
    });
  }, [newName, newDescription, newType, newAccess, newEmoji, createMutation]);

  const handleUpdate = useCallback(() => {
    if (!editingChannel) return;
    updateMutation.mutate({
      id: editingChannel.id,
      name: editingChannel.name,
      description: editingChannel.description ?? undefined,
      channelType: editingChannel.channelType,
      accessLevel: editingChannel.accessLevel,
      iconEmoji: editingChannel.iconEmoji,
    });
  }, [editingChannel, updateMutation]);

  const handleDelete = useCallback(() => {
    if (!deleteChannelId) return;
    deleteMutation.mutate({ id: deleteChannelId });
  }, [deleteChannelId, deleteMutation]);

  const flaggedCount = flaggedPosts?.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Community</h1>
          <p className="mt-1 text-muted-foreground">
            Manage channels, moderate content, and engage with members.
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="rounded-full">
              <Plus className="mr-2 size-4" />
              New Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="channel-name">Channel Name</Label>
                <Input
                  id="channel-name"
                  placeholder="e.g., General Discussion"
                  className="mt-1"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="channel-description">Description</Label>
                <Textarea
                  id="channel-description"
                  placeholder="What is this channel about?"
                  className="mt-1"
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel-type">Type</Label>
                  <Select value={newType} onValueChange={(v) => setNewType(v as "feed" | "chat")}>
                    <SelectTrigger className="mt-1" id="channel-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="channel-access">Access</Label>
                  <Select value={newAccess} onValueChange={(v) => setNewAccess(v as "public" | "members" | "specific_course")}>
                    <SelectTrigger className="mt-1" id="channel-access">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="specific_course">Specific Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="channel-emoji">Icon Emoji</Label>
                <Input
                  id="channel-emoji"
                  className="mt-1 w-20"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  maxLength={2}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                type="button"
                onClick={handleCreate}
                disabled={newName.trim().length === 0 || createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Channel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="channels">
        <TabsList>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="moderation">
            Moderation
            {flaggedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {String(flaggedCount)}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="filters">
            <Filter className="mr-1 size-3.5" />
            Keyword Filters
          </TabsTrigger>
          <TabsTrigger value="blocked">
            <Ban className="mr-1 size-3.5" />
            Blocked
          </TabsTrigger>
          <TabsTrigger value="log">
            <ScrollText className="mr-1 size-3.5" />
            Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="mt-4">
          <ChannelsList
            onEdit={(ch) => setEditingChannel({
              id: ch.id,
              name: ch.name,
              description: ch.description,
              channelType: ch.channelType,
              accessLevel: ch.accessLevel,
              iconEmoji: ch.iconEmoji ?? "\u{1F4AC}",
            })}
            onDelete={(id) => setDeleteChannelId(id)}
          />
        </TabsContent>

        <TabsContent value="moderation" className="mt-4">
          <ModerationQueue
            flaggedPosts={flaggedPosts ?? []}
            isLoading={isLoadingFlagged}
          />
        </TabsContent>

        <TabsContent value="filters" className="mt-4">
          <KeywordFiltersTab />
        </TabsContent>

        <TabsContent value="blocked" className="mt-4">
          <BlockedMembersTab />
        </TabsContent>

        <TabsContent value="log" className="mt-4">
          <ModerationLogTab />
        </TabsContent>
      </Tabs>

      {/* Edit Channel Dialog */}
      <Dialog open={editingChannel !== null} onOpenChange={(open) => { if (!open) setEditingChannel(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Channel</DialogTitle>
          </DialogHeader>
          {editingChannel && (
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="edit-channel-name">Channel Name</Label>
                <Input
                  id="edit-channel-name"
                  className="mt-1"
                  value={editingChannel.name}
                  onChange={(e) =>
                    setEditingChannel({ ...editingChannel, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-channel-description">Description</Label>
                <Textarea
                  id="edit-channel-description"
                  className="mt-1"
                  rows={2}
                  value={editingChannel.description ?? ""}
                  onChange={(e) =>
                    setEditingChannel({
                      ...editingChannel,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-channel-type">Type</Label>
                  <Select
                    value={editingChannel.channelType}
                    onValueChange={(v) =>
                      setEditingChannel({
                        ...editingChannel,
                        channelType: v as "feed" | "chat",
                      })
                    }
                  >
                    <SelectTrigger className="mt-1" id="edit-channel-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feed">Feed</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-channel-access">Access</Label>
                  <Select
                    value={editingChannel.accessLevel}
                    onValueChange={(v) =>
                      setEditingChannel({
                        ...editingChannel,
                        accessLevel: v as "public" | "members" | "specific_course",
                      })
                    }
                  >
                    <SelectTrigger className="mt-1" id="edit-channel-access">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                      <SelectItem value="specific_course">Specific Course</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEditingChannel(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteChannelId !== null} onOpenChange={(open) => { if (!open) setDeleteChannelId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Channel</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this channel and all its posts. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Channel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// -- Moderation Queue with Bulk Actions ----------------------------------------

interface FlaggedPost {
  readonly post: {
    readonly id: string;
    readonly title: string | null;
    readonly contentHtml: string | null;
    readonly status: string;
    readonly createdAt: Date;
  };
  readonly authorName: string | null;
  readonly authorEmail: string;
}

function ModerationQueue({
  flaggedPosts,
  isLoading,
}: {
  readonly flaggedPosts: ReadonlyArray<FlaggedPost>;
  readonly isLoading: boolean;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const moderateMutation = useMutation(
    trpc.communityPosts.moderate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityPosts.listFlagged.queryKey() });
      },
    }),
  );

  const bulkModerateMutation = useMutation(
    trpc.communityPosts.bulkModerate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityPosts.listFlagged.queryKey() });
        setSelectedIds(new Set());
      },
    }),
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.size === flaggedPosts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(flaggedPosts.map((p) => p.post.id)));
    }
  }, [selectedIds.size, flaggedPosts]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (flaggedPosts.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Shield className="size-14 text-muted-foreground/30" />
          <p className="mt-4 font-heading text-lg font-semibold">No flagged posts</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your community is in great shape!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all-flagged"
            checked={selectedIds.size === flaggedPosts.length && flaggedPosts.length > 0}
            onCheckedChange={toggleSelectAll}
            aria-label="Select all flagged posts"
          />
          <Label htmlFor="select-all-flagged" className="text-sm">
            {selectedIds.size > 0
              ? `${String(selectedIds.size)} selected`
              : "Select all"}
          </Label>
        </div>

        {selectedIds.size > 0 && (
          <>
            <Separator orientation="vertical" className="h-5" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={bulkModerateMutation.isPending}
              onClick={() =>
                bulkModerateMutation.mutate({
                  postIds: [...selectedIds],
                  status: "visible",
                })
              }
            >
              <CheckCircle2 className="mr-1 size-3.5" />
              Dismiss Selected
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={bulkModerateMutation.isPending}
              onClick={() =>
                bulkModerateMutation.mutate({
                  postIds: [...selectedIds],
                  status: "hidden",
                })
              }
            >
              <Trash2 className="mr-1 size-3.5" />
              Hide Selected
            </Button>
          </>
        )}
      </div>

      {/* Flagged posts list */}
      <div className="space-y-3">
        {flaggedPosts.map((item) => (
          <Card key={item.post.id} className="rounded-2xl border-red-200 dark:border-red-900">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={selectedIds.has(item.post.id)}
                  onCheckedChange={() => toggleSelect(item.post.id)}
                  aria-label={`Select post by ${item.authorName ?? "unknown"}`}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.authorEmail}
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="mr-1 size-3" />
                      Flagged
                    </Badge>
                  </div>
                  {item.post.title && (
                    <p className="mt-1 font-medium">{item.post.title}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-3">
                    {item.post.contentHtml
                      ? item.post.contentHtml.replace(/<[^>]*>/g, "")
                      : "No content"}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={moderateMutation.isPending}
                    onClick={() =>
                      moderateMutation.mutate({
                        id: item.post.id,
                        status: "visible",
                      })
                    }
                  >
                    Dismiss
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={moderateMutation.isPending}
                    onClick={() =>
                      moderateMutation.mutate({
                        id: item.post.id,
                        status: "hidden",
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -- Keyword Filters Tab -------------------------------------------------------

function KeywordFiltersTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [newKeyword, setNewKeyword] = useState("");
  const [newAction, setNewAction] = useState<"flag" | "hide" | "block">("flag");

  const { data: filters, isLoading } = useQuery(
    trpc.communityPosts.listKeywordFilters.queryOptions(),
  );

  const addMutation = useMutation(
    trpc.communityPosts.addKeywordFilter.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityPosts.listKeywordFilters.queryKey() });
        setNewKeyword("");
        setNewAction("flag");
      },
    }),
  );

  const removeMutation = useMutation(
    trpc.communityPosts.removeKeywordFilter.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityPosts.listKeywordFilters.queryKey() });
      },
    }),
  );

  const handleAdd = useCallback(() => {
    if (newKeyword.trim().length === 0) return;
    addMutation.mutate({ keyword: newKeyword.trim(), action: newAction });
  }, [newKeyword, newAction, addMutation]);

  const actionLabel = (action: string) => {
    switch (action) {
      case "flag": return "Flag";
      case "hide": return "Auto-hide";
      case "block": return "Block post";
      default: return action;
    }
  };

  const actionBadgeVariant = (action: string): "outline" | "secondary" | "destructive" => {
    switch (action) {
      case "hide": return "secondary";
      case "block": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <Card className="rounded-2xl border-border/50">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Add Keyword Filter</CardTitle>
          <CardDescription>
            Posts containing these keywords will be automatically moderated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Label htmlFor="keyword-input">Keyword or phrase</Label>
              <Input
                id="keyword-input"
                placeholder="e.g., spam, buy now, click here"
                className="mt-1"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd();
                }}
              />
            </div>
            <div className="w-36">
              <Label htmlFor="keyword-action">Action</Label>
              <Select value={newAction} onValueChange={(v) => setNewAction(v as "flag" | "hide" | "block")}>
                <SelectTrigger className="mt-1" id="keyword-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flag">Flag for review</SelectItem>
                  <SelectItem value="hide">Auto-hide</SelectItem>
                  <SelectItem value="block">Block post</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleAdd}
              disabled={newKeyword.trim().length === 0 || addMutation.isPending}
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : !filters || filters.length === 0 ? (
        <Card className="rounded-2xl border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Filter className="size-14 text-muted-foreground/30" />
            <p className="mt-4 font-heading text-lg font-semibold">No keyword filters</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add keywords above to auto-moderate community posts.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filters.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <code className="rounded bg-muted px-2 py-1 text-sm">
                  {f.keyword}
                </code>
                <Badge variant={actionBadgeVariant(f.action)}>
                  {actionLabel(f.action)}
                </Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={removeMutation.isPending}
                onClick={() => removeMutation.mutate({ id: f.id })}
                aria-label={`Remove keyword filter "${f.keyword}"`}
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// -- Blocked Members Tab -------------------------------------------------------

function BlockedMembersTab() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [unblockUserId, setUnblockUserId] = useState<string | null>(null);

  const { data: blockedMembers, isLoading } = useQuery(
    trpc.communityPosts.listBlockedMembers.queryOptions(),
  );

  const unblockMutation = useMutation(
    trpc.communityPosts.unblockMember.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.communityPosts.listBlockedMembers.queryKey() });
        setUnblockUserId(null);
      },
    }),
  );

  const handleUnblock = useCallback(() => {
    if (!unblockUserId) return;
    unblockMutation.mutate({ userId: unblockUserId });
  }, [unblockUserId, unblockMutation]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!blockedMembers || blockedMembers.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <UserX className="size-14 text-muted-foreground/30" />
          <p className="mt-4 font-heading text-lg font-semibold">No blocked members</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Members can be blocked from the moderation queue.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {blockedMembers.map((entry) => (
          <Card key={entry.blocked.id}>
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {entry.userName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium">{entry.userName ?? "Unknown"}</p>
                  <p className="text-sm text-muted-foreground">{entry.userEmail}</p>
                  {entry.blocked.reason && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Reason: {entry.blocked.reason}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  Blocked {new Date(entry.blocked.blockedAt).toLocaleDateString()}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUnblockUserId(entry.blocked.userId)}
                >
                  Unblock
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={unblockUserId !== null} onOpenChange={(open) => { if (!open) setUnblockUserId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unblock Member</AlertDialogTitle>
            <AlertDialogDescription>
              This member will be able to post in your community again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnblock}>
              {unblockMutation.isPending ? "Unblocking..." : "Unblock"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// -- Moderation Log Tab --------------------------------------------------------

function ModerationLogTab() {
  const trpc = useTRPC();

  const { data, isLoading } = useQuery(
    trpc.communityPosts.getModerationLog.queryOptions({ limit: 50 }),
  );

  const actionIcon = (action: string) => {
    switch (action) {
      case "hide_post": return <Trash2 className="size-4 text-red-500" />;
      case "dismiss_flag": return <CheckCircle2 className="size-4 text-green-500" />;
      case "flag_post": return <AlertTriangle className="size-4 text-amber-500" />;
      case "block_user": return <Ban className="size-4 text-red-500" />;
      case "unblock_user": return <UserX className="size-4 text-green-500" />;
      default: return <Shield className="size-4 text-muted-foreground" />;
    }
  };

  const actionLabel = (action: string) => {
    switch (action) {
      case "hide_post": return "Hid post";
      case "dismiss_flag": return "Dismissed flag";
      case "flag_post": return "Flagged post";
      case "block_user": return "Blocked user";
      case "unblock_user": return "Unblocked user";
      default: return action;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!data?.entries || data.entries.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ScrollText className="size-14 text-muted-foreground/30" />
          <p className="mt-4 font-heading text-lg font-semibold">No moderation activity</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Actions will be logged here as you moderate your community.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {data.entries.map((entry) => (
        <div
          key={entry.log.id}
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
        >
          {actionIcon(entry.log.action)}
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium">{entry.moderatorName}</span>
              {" "}
              {actionLabel(entry.log.action)}
            </p>
            {entry.log.details && (
              <p className="text-xs text-muted-foreground">{entry.log.details}</p>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="size-3" />
            {new Date(entry.log.createdAt).toLocaleString()}
          </div>
          <Badge variant="outline" className="text-xs">
            {entry.log.targetType}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// -- Channels List ------------------------------------------------------------

interface ChannelData {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly channelType: "feed" | "chat";
  readonly accessLevel: "public" | "members" | "specific_course";
  readonly iconEmoji: string | null;
  readonly sortOrder: number;
}

function ChannelsList({
  onEdit,
  onDelete,
}: {
  readonly onEdit: (channel: ChannelData) => void;
  readonly onDelete: (id: string) => void;
}) {
  const trpc = useTRPC();

  const { data: channels, isLoading } = useQuery(
    trpc.communityChannels.myChannels.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!channels || channels.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Hash className="size-14 text-muted-foreground/30" />
          <p className="mt-4 font-heading text-lg font-semibold">
            Create your first channel
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Click &quot;New Channel&quot; above to get started with your community.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {channels.map((channel) => (
        <Card key={channel.id} className="rounded-2xl border-border/50 transition-shadow hover:shadow-md">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gaspar-cream text-lg">
                {channel.iconEmoji ?? "\u{1F4AC}"}
              </div>
              <div>
                <p className="font-medium">{channel.name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {channel.description && (
                    <span className="max-w-48 truncate">{channel.description}</span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {channel.channelType}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {channel.accessLevel === "specific_course"
                      ? "Course"
                      : channel.accessLevel}
                  </Badge>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" aria-label="Channel actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(channel)}>
                  <Pencil className="mr-2 size-4" />
                  Edit Channel
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => onDelete(channel.id)}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete Channel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
