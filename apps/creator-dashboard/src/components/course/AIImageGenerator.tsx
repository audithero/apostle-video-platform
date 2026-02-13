import { useState, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc/react";
import {
  ImageIcon,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ---------- Types ----------

type AspectRatio = "16:9" | "4:3";

interface AIImageGeneratorProps {
  /** Pre-filled description (e.g. course title) */
  readonly defaultDescription?: string;
  /** Called when user accepts a generated image */
  readonly onAccept: (url: string) => void;
  /** Existing image URL to show as current */
  readonly currentImageUrl?: string | null;
  /** Purpose label shown in the UI */
  readonly label?: string;
}

// ---------- Component ----------

function AIImageGenerator({
  defaultDescription = "",
  onAccept,
  currentImageUrl,
  label = "Thumbnail",
}: AIImageGeneratorProps) {
  const trpc = useTRPC();

  const [description, setDescription] = useState(defaultDescription);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("16:9");
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);

  // Credit balance query
  const { data: credits } = useQuery(trpc.ai.getCredits.queryOptions());
  const imageCredits = credits?.ai_image ?? 0;

  const generateMutation = useMutation(
    trpc.ai.generateImage.mutationOptions({
      onSuccess: (data) => {
        setGeneratedUrl(data.url);
        toast.success("Image generated");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate image");
      },
    }),
  );

  const handleGenerate = useCallback(() => {
    if (description.trim().length < 3) {
      toast.error("Please enter a description of at least 3 characters");
      return;
    }
    generateMutation.mutate({
      description: description.trim(),
      aspectRatio,
    });
  }, [description, aspectRatio, generateMutation]);

  const handleAccept = useCallback(() => {
    if (generatedUrl) {
      onAccept(generatedUrl);
      toast.success(`${label} image applied`);
    }
  }, [generatedUrl, onAccept, label]);

  const isGenerating = generateMutation.isPending;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-500" />
          <h4 className="text-sm font-semibold">{`AI ${label} Generator`}</h4>
        </div>
        <Badge variant="outline" className="text-xs">
          {`${String(imageCredits)} image credits`}
        </Badge>
      </div>

      {/* Current image */}
      {currentImageUrl && !generatedUrl && (
        <div className="overflow-hidden rounded-lg border">
          <img
            src={currentImageUrl}
            alt={`Current ${label.toLowerCase()}`}
            className="aspect-video w-full object-cover"
          />
          <p className="px-3 py-1.5 text-xs text-muted-foreground">Current image</p>
        </div>
      )}

      {/* Generated preview */}
      {generatedUrl && (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border ring-2 ring-violet-500/30">
            <img
              src={generatedUrl}
              alt={`Generated ${label.toLowerCase()} preview`}
              className={aspectRatio === "16:9" ? "aspect-video w-full object-cover" : "aspect-[4/3] w-full object-cover"}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAccept}
              className="flex-1"
            >
              Use This Image
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              disabled={isGenerating || imageCredits < 1}
            >
              <RefreshCw className={isGenerating ? "size-4 animate-spin" : "size-4"} />
              Regenerate
            </Button>
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="space-y-2">
        <div>
          <Label htmlFor="ai-image-description">Description</Label>
          <Input
            id="ai-image-description"
            placeholder="Describe the image you want..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            maxLength={500}
          />
        </div>
        <div>
          <Label htmlFor="ai-image-aspect-ratio">Aspect Ratio</Label>
          <Select
            value={aspectRatio}
            onValueChange={(v) => setAspectRatio(v as AspectRatio)}
          >
            <SelectTrigger id="ai-image-aspect-ratio" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="16:9">16:9 (Thumbnail)</SelectItem>
              <SelectItem value="4:3">4:3 (Illustration)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!generatedUrl && (
        <Button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || description.trim().length < 3 || imageCredits < 1}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <ImageIcon className="size-4" />
              {`Generate ${label} Image (1 credit)`}
            </>
          )}
        </Button>
      )}

      {imageCredits < 1 && (
        <p className="text-xs text-destructive">
          No image credits remaining. Upgrade your plan or purchase an add-on.
        </p>
      )}
    </div>
  );
}

export { AIImageGenerator };
export type { AIImageGeneratorProps };
