import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Copy,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/lib/trpc/react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/dashboard/pages/")({
  component: LandingPagesManager,
});

// ── Component ────────────────────────────────────────────────────────────

function LandingPagesManager() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");

  // ── Queries ──────────────────────────────────────────────────────────
  const { data: pages, isLoading } = useQuery(
    trpc.landingPages.list.queryOptions()
  );

  // ── Mutations ────────────────────────────────────────────────────────
  const createPage = useMutation(
    trpc.landingPages.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.landingPages.list.queryKey() });
        setShowCreateDialog(false);
        setNewPageTitle("");
        toast.success("Page created");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create page");
      },
    })
  );

  const deletePage = useMutation(
    trpc.landingPages.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.landingPages.list.queryKey() });
        toast.success("Page deleted");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to delete page");
      },
    })
  );

  const updatePage = useMutation(
    trpc.landingPages.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.landingPages.list.queryKey() });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to update page");
      },
    })
  );

  const duplicatePage = useMutation(
    trpc.landingPages.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.landingPages.list.queryKey() });
        toast.success("Page duplicated");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to duplicate page");
      },
    })
  );

  // ── Derived stats ────────────────────────────────────────────────────
  const totalPages = pages?.length ?? 0;
  const publishedPages = pages?.filter((p) => p.status === "published").length ?? 0;
  const draftPages = totalPages - publishedPages;

  // ── Handlers ─────────────────────────────────────────────────────────
  function handleCreatePage() {
    if (!newPageTitle.trim()) return;
    createPage.mutate({ title: newPageTitle.trim() });
  }

  function handleDeletePage(id: string) {
    deletePage.mutate({ id });
  }

  function handleToggleStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    updatePage.mutate({ id, status: newStatus as "draft" | "published" });
    toast.success(newStatus === "published" ? "Page published" : "Page unpublished");
  }

  function handleDuplicatePage(page: { title: string; pageJson?: unknown }) {
    duplicatePage.mutate({
      title: `${page.title} (Copy)`,
      templateJson: page.pageJson as Record<string, unknown>[] | undefined,
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Landing Pages</h1>
          <p className="mt-1 text-base text-muted-foreground">
            Create and manage landing pages for your courses.
          </p>
        </div>
        <Button
          type="button"
          className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="mr-2 size-4" />
          Create Page
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight">{totalPages}</p>
            )}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight">{publishedPages}</p>
            )}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/60 shadow-sm">
          <CardContent className="pt-6">
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <p className="font-heading text-2xl font-bold tracking-tight">{draftPages}</p>
            )}
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Drafts</p>
          </CardContent>
        </Card>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Pages List */}
      {!isLoading && pages && pages.length > 0 && (
        <div className="space-y-3">
          {pages.map((page) => (
            <Card key={page.id} className="rounded-2xl border-border/60 shadow-sm transition-all hover:border-border hover:shadow-md">
              <CardContent className="flex items-center justify-between py-5 px-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <p className="truncate font-semibold">{page.title}</p>
                    <span
                      className={
                        page.status === "published"
                          ? "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium border-border bg-muted text-muted-foreground"
                      }
                    >
                      {page.status}
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="font-mono">{`/${page.slug}`}</span>
                    <span className="inline-block size-1 rounded-full bg-muted-foreground/40" />
                    <span>{`Updated ${formatDistanceToNow(new Date(page.updatedAt), { addSuffix: true })}`}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {page.status === "published" && (
                    <Button type="button" variant="outline" size="sm" className="rounded-full" asChild>
                      <a href={`/p/${page.slug}`} target="_blank" rel="noopener">
                        <ExternalLink className="mr-1 size-3" />
                        Preview
                      </a>
                    </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="sm" className="rounded-full">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl">
                      <DropdownMenuItem
                        onClick={() => handleToggleStatus(page.id, page.status)}
                      >
                        <Globe className="mr-2 size-4" />
                        {page.status === "published" ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDuplicatePage(page)}
                      >
                        <Copy className="mr-2 size-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeletePage(page.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
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

      {/* Empty state */}
      {!isLoading && pages && pages.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border/60 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <FileText className="size-6 text-primary" />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold">No pages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Create your first landing page to start converting visitors.</p>
          </div>
          <Button
            type="button"
            className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="mr-2 size-4" />
            Create Page
          </Button>
        </div>
      )}

      {/* Create Page Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Landing Page</DialogTitle>
            <DialogDescription>
              Give your new page a title. You can customize the content after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                placeholder="e.g. Photography Masterclass"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreatePage();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreatePage}
              disabled={!newPageTitle.trim() || createPage.isPending}
              className="rounded-full bg-primary px-6 font-medium text-primary-foreground hover:bg-primary/90"
            >
              {createPage.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
