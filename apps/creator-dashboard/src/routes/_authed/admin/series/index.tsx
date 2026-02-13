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

export const Route = createFileRoute("/_authed/admin/series/")({
  component: AdminSeriesPage,
});

function AdminSeriesPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: seriesList, isLoading } = useQuery(
    trpc.series.list.queryOptions()
  );

  const deleteSeries = useMutation(
    trpc.series.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.series.list.queryKey(),
        });
        toast.success("Series deleted.");
      },
      onError: () => {
        toast.error("Failed to delete series.");
      },
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Series</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your video series.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/series/new">
            <Plus className="mr-2 size-4" />
            New Series
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
        ) : seriesList && seriesList.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Videos</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {seriesList.map((series) => (
                <TableRow key={series.id}>
                  <TableCell className="font-medium">{series.title}</TableCell>
                  <TableCell>{series.videoCount ?? 0}</TableCell>
                  <TableCell>
                    {series.published ? (
                      <Badge>Yes</Badge>
                    ) : (
                      <Badge variant="secondary">No</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link
                          to="/admin/series/$id/edit"
                          params={{ id: series.id }}
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
                            <DialogTitle>Delete Series</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{series.title}"?
                              This will not delete the videos in this series.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                deleteSeries.mutate({ id: series.id })
                              }
                              disabled={deleteSeries.isPending}
                            >
                              {deleteSeries.isPending
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
            <p className="text-muted-foreground">No series yet.</p>
            <Button className="mt-4" asChild>
              <Link to="/admin/series/new">
                <Plus className="mr-2 size-4" />
                Create First Series
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
