import { createFileRoute } from "@tanstack/react-router";
import { Check, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/comments")({
  component: AdminCommentsPage,
});

function AdminCommentsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery(
    trpc.comments.listFlagged.queryOptions()
  );

  const moderateComment = useMutation(
    trpc.comments.moderate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.listFlagged.queryKey(),
        });
        toast.success("Comment moderated.");
      },
      onError: () => {
        toast.error("Failed to moderate comment.");
      },
    })
  );

  const deleteComment = useMutation(
    trpc.comments.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.comments.listFlagged.queryKey(),
        });
        toast.success("Comment deleted.");
      },
      onError: () => {
        toast.error("Failed to delete comment.");
      },
    })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">Comment Moderation</h1>
      <p className="mt-2 text-muted-foreground">
        Review and moderate flagged comments.
      </p>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : comments && comments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.map((comment) => (
                <TableRow key={comment.id}>
                  <TableCell className="font-medium">
                    {comment.user?.name ?? "Anonymous"}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {comment.body}
                  </TableCell>
                  <TableCell>
                    <Badge variant={comment.status === "flagged" ? "destructive" : "secondary"}>
                      {comment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Approve (make visible)"
                        onClick={() =>
                          moderateComment.mutate({
                            id: comment.id,
                            status: "visible",
                          })
                        }
                      >
                        <Eye className="mr-1 size-4" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Hide"
                        onClick={() =>
                          moderateComment.mutate({
                            id: comment.id,
                            status: "hidden",
                          })
                        }
                      >
                        <EyeOff className="mr-1 size-4" />
                        Hide
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Comment</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this comment? This
                              action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                deleteComment.mutate({ id: comment.id })
                              }
                              disabled={deleteComment.isPending}
                            >
                              {deleteComment.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="py-12 text-center">
            <Check className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              No flagged comments to review.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
