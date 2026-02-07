import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/_authed/admin/videos/")({
  component: AdminVideosPage,
});

function AdminVideosPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: videos, isLoading } = useQuery(
    trpc.videos.list.queryOptions({})
  );

  const deleteVideo = useMutation(
    trpc.videos.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.videos.list.queryKey() });
        toast.success("Video deleted.");
      },
      onError: () => {
        toast.error("Failed to delete video.");
      },
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Videos</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your video library.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/videos/new">
            <Plus className="mr-2 size-4" />
            New Video
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : videos && videos.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell className="font-medium">{video.title}</TableCell>
                  <TableCell>
                    {video.status === "ready" ? (
                      <Badge>Ready</Badge>
                    ) : video.status === "processing" ? (
                      <Badge variant="secondary">Processing</Badge>
                    ) : (
                      <Badge variant="outline">
                        {video.status ?? "No video"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {video.published ? (
                      <Badge variant="default">Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {video.duration
                      ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, "0")}`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to="/admin/videos/$id/edit"
                          params={{ id: video.id }}
                        >
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Video</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{video.title}"?
                              This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() => deleteVideo.mutate({ id: video.id })}
                              disabled={deleteVideo.isPending}
                            >
                              {deleteVideo.isPending ? "Deleting..." : "Delete"}
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
            <p className="text-muted-foreground">No videos yet.</p>
            <Button className="mt-4" asChild>
              <Link to="/admin/videos/new">
                <Plus className="mr-2 size-4" />
                Create First Video
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
