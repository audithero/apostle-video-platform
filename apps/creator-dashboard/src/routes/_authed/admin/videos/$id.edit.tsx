import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/videos/$id/edit")({
  component: EditVideoPage,
});

function EditVideoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: video, isLoading } = useQuery(
    trpc.videos.getById.queryOptions({ id })
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [published, setPublished] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");

  useEffect(() => {
    if (video) {
      setTitle(video.title);
      setSlug(video.slug);
      setDescription(video.description ?? "");
      setIsFree(video.isFree ?? false);
      setPublished(video.published ?? false);
      setThumbnailUrl(video.thumbnailUrl ?? "");
      setPdfUrl(video.pdfUrl ?? "");
    }
  }, [video]);

  const updateVideo = useMutation(
    trpc.videos.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.videos.getById.queryKey({ id }),
        });
        toast.success("Video updated successfully!");
      },
      onError: () => {
        toast.error("Failed to update video.");
      },
    })
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    updateVideo.mutate({
      id,
      title,
      slug,
      description: description || undefined,
      isFree,
      published,
      thumbnailUrl: thumbnailUrl || undefined,
      pdfUrl: pdfUrl || undefined,
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

  if (!video) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-semibold">Video Not Found</h2>
        <Button className="mt-4" onClick={() => navigate({ to: "/admin/videos" })}>
          Back to Videos
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Edit Video</h1>
      <p className="mt-2 text-muted-foreground">
        Update video details and settings.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
            <CardDescription>Basic information about the video.</CardDescription>
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

            <div className="grid gap-2">
              <Label htmlFor="pdfUrl">Recipe PDF URL</Label>
              <Input
                id="pdfUrl"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded border-input"
                />
                <Label htmlFor="isFree">Free Video</Label>
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
            </div>
          </CardContent>
        </Card>

        {/* Mux Status */}
        <Card>
          <CardHeader>
            <CardTitle>Video Processing</CardTitle>
            <CardDescription>Current Mux processing status.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Status:</span>
              {video.status === "ready" ? (
                <Badge>Ready</Badge>
              ) : video.status === "processing" ? (
                <Badge variant="secondary">Processing</Badge>
              ) : video.status === "errored" ? (
                <Badge variant="destructive">Error</Badge>
              ) : (
                <Badge variant="outline">{video.status ?? "No video uploaded"}</Badge>
              )}
            </div>
            {video.muxPlaybackId && (
              <p className="mt-2 text-sm text-muted-foreground">
                Playback ID: {video.muxPlaybackId}
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateVideo.isPending}>
            {updateVideo.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/videos" })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
