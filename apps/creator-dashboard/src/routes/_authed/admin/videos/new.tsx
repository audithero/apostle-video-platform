import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
import { useTRPC } from "@/lib/trpc/react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/admin/videos/new")({
  component: NewVideoPage,
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function NewVideoPage() {
  const navigate = useNavigate();
  const trpc = useTRPC();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const createVideo = useMutation(trpc.videos.create.mutationOptions());
  const createMuxUpload = useMutation(
    trpc.videos.createMuxUpload.mutationOptions()
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setSlug(slugify(value));
  };

  const handleSubmitAndUpload = async () => {
    if (!title.trim() || !slug.trim()) {
      toast.error("Please fill in title and slug first.");
      return;
    }
    try {
      const video = await createVideo.mutateAsync({
        title,
        slug,
        description: description || undefined,
        isFree,
      });
      const result = await createMuxUpload.mutateAsync({ videoId: video.id });
      setUploadUrl(result.uploadUrl);
      toast.success("Video created! You can now upload the video file.");
    } catch {
      toast.error("Failed to create video or generate upload URL.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadUrl) return;

    setIsUploading(true);
    try {
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });
      toast.success("Video uploaded! It will be processed shortly.");
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim()) {
      toast.error("Title and slug are required.");
      return;
    }

    try {
      const video = await createVideo.mutateAsync({
        title,
        slug,
        description: description || undefined,
        isFree,
      });
      toast.success("Video created successfully!");
      navigate({ to: "/admin/videos/$id/edit", params: { id: video.id } });
    } catch {
      toast.error("Failed to create video.");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">New Video</h1>
      <p className="mt-2 text-muted-foreground">
        Create a new video entry.
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
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Enter video title"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="video-slug"
                required
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly identifier. Auto-generated from title.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this video..."
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFree"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="rounded border-input"
              />
              <Label htmlFor="isFree">Free Video</Label>
              <p className="text-xs text-muted-foreground">
                Free videos are accessible without a subscription.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Video Upload</CardTitle>
            <CardDescription>
              Upload your video file via Mux.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!uploadUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleSubmitAndUpload}
                disabled={createMuxUpload.isPending || createVideo.isPending}
              >
                {createMuxUpload.isPending || createVideo.isPending
                  ? "Preparing..."
                  : "Create & Upload Video"}
              </Button>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="videoFile">Select Video File</Label>
                <Input
                  id="videoFile"
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: "/admin/videos" })}
          >
            Back to Videos
          </Button>
        </div>
      </form>
    </div>
  );
}
