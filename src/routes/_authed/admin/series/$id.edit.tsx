import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { GripVertical, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/series/$id/edit")({
  component: EditSeriesPage,
});

function EditSeriesPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: seriesData, isLoading } = useQuery(
    trpc.series.getById.queryOptions({ id })
  );

  const { data: allVideos } = useQuery(trpc.videos.list.queryOptions({}));

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [published, setPublished] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);

  useEffect(() => {
    if (seriesData) {
      setTitle(seriesData.title);
      setSlug(seriesData.slug);
      setDescription(seriesData.description ?? "");
      setThumbnailUrl(seriesData.thumbnailUrl ?? "");
      setPublished(seriesData.published);
      if (seriesData.videos) {
        setSelectedVideoIds(seriesData.videos.map((v) => v.id));
      }
    }
  }, [seriesData]);

  const updateSeries = useMutation(
    trpc.series.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.series.getById.queryKey({ id }),
        });
        toast.success("Series updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update series.");
      },
    })
  );

  const addVideoToSeries = useMutation(
    trpc.series.addVideo.mutationOptions()
  );
  const removeVideoFromSeries = useMutation(
    trpc.series.removeVideo.mutationOptions()
  );
  const reorderVideos = useMutation(
    trpc.series.reorderVideos.mutationOptions()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateSeries.mutate({
      id,
      title,
      slug,
      description: description || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      published,
    });
  };

  const addVideo = async (videoId: string) => {
    if (!selectedVideoIds.includes(videoId)) {
      const newIds = [...selectedVideoIds, videoId];
      setSelectedVideoIds(newIds);
      await addVideoToSeries.mutateAsync({
        seriesId: id,
        videoId,
        sortOrder: newIds.length - 1,
      });
    }
  };

  const removeVideo = async (videoId: string) => {
    setSelectedVideoIds(selectedVideoIds.filter((vid) => vid !== videoId));
    await removeVideoFromSeries.mutateAsync({
      seriesId: id,
      videoId,
    });
  };

  const moveVideo = async (index: number, direction: "up" | "down") => {
    const newIds = [...selectedVideoIds];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= newIds.length) return;
    [newIds[index], newIds[swapIndex]] = [newIds[swapIndex], newIds[index]];
    setSelectedVideoIds(newIds);
    await reorderVideos.mutateAsync({
      seriesId: id,
      videoIds: newIds,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!seriesData) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Series Not Found</h2>
        <Button
          type="button"
          className="mt-4"
          onClick={() => navigate({ to: "/admin/series" })}
        >
          Back to Series
        </Button>
      </div>
    );
  }

  const availableVideos = allVideos?.filter(
    (v) => !selectedVideoIds.includes(v.id)
  );

  return (
    <div>
      <h1 className="text-3xl font-bold">Edit Series</h1>
      <p className="mt-2 text-muted-foreground">
        Update series details and manage videos.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Series Details</CardTitle>
            <CardDescription>
              Basic information about the series.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="published">Published</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Videos</CardTitle>
            <CardDescription>
              Manage and reorder videos in this series.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedVideoIds.length > 0 && (
              <div className="space-y-2">
                <Label>Series Videos</Label>
                {selectedVideoIds.map((videoId, index) => {
                  const vid = allVideos?.find((v) => v.id === videoId);
                  return (
                    <div
                      key={videoId}
                      className="flex items-center gap-2 rounded-md border p-2"
                    >
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveVideo(index, "up")}
                          disabled={index === 0}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical className="size-4 rotate-180" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveVideo(index, "down")}
                          disabled={index === selectedVideoIds.length - 1}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical className="size-4" />
                        </button>
                      </div>
                      <span className="flex-1 text-sm font-medium">
                        {index + 1}. {vid?.title ?? "Unknown"}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVideo(videoId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {availableVideos && availableVideos.length > 0 && (
              <div className="grid gap-2">
                <Label>Add Video</Label>
                <select
                  className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      addVideo(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a video to add...
                  </option>
                  {availableVideos.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.title}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateSeries.isPending}>
            {updateSeries.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/series" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
