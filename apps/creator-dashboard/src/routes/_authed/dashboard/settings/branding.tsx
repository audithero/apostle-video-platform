import { useState, useCallback, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ImageIcon,
  Loader2,
  Palette,
  Redo2,
  Save,
  Type,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authed/dashboard/settings/branding")({
  component: BrandingSettingsPage,
  errorComponent: RouteErrorBoundary,
});

// -- Font Families ------------------------------------------------------------

const GOOGLE_FONTS = [
  { value: "Inter", label: "Inter", weights: "400;500;600;700" },
  { value: "Roboto", label: "Roboto", weights: "400;500;700" },
  { value: "Open Sans", label: "Open Sans", weights: "400;600;700" },
  { value: "Lato", label: "Lato", weights: "400;700" },
  { value: "Poppins", label: "Poppins", weights: "400;500;600;700" },
  { value: "Montserrat", label: "Montserrat", weights: "400;500;600;700" },
  { value: "Nunito", label: "Nunito", weights: "400;600;700" },
  { value: "Raleway", label: "Raleway", weights: "400;500;600;700" },
  { value: "DM Sans", label: "DM Sans", weights: "400;500;600;700" },
  { value: "Space Grotesk", label: "Space Grotesk", weights: "400;500;600;700" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans", weights: "400;500;600;700" },
  { value: "Sora", label: "Sora", weights: "400;500;600;700" },
] as const;

// -- Preset Color Palettes ----------------------------------------------------

const COLOR_PRESETS = [
  { primary: "#6366f1", secondary: "#8b5cf6", label: "Indigo" },
  { primary: "#2563eb", secondary: "#7c3aed", label: "Blue" },
  { primary: "#059669", secondary: "#0891b2", label: "Emerald" },
  { primary: "#dc2626", secondary: "#f97316", label: "Red" },
  { primary: "#0f172a", secondary: "#475569", label: "Slate" },
  { primary: "#7c3aed", secondary: "#ec4899", label: "Purple" },
] as const;

// -- Form State ---------------------------------------------------------------

interface BrandingForm {
  brandColor: string;
  brandSecondaryColor: string;
  fontFamily: string;
  logoUrl: string;
  faviconUrl: string;
  customCss: string;
}

const DEFAULT_FORM: BrandingForm = {
  brandColor: "#6366f1",
  brandSecondaryColor: "#8b5cf6",
  fontFamily: "Inter",
  logoUrl: "",
  faviconUrl: "",
  customCss: "",
};

// -- Page Component -----------------------------------------------------------

function BrandingSettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: creatorProfile, isLoading: isLoadingProfile } = useQuery(
    trpc.creatorSettings.getProfile.queryOptions(),
  );

  const { data: settings, isLoading: isLoadingSettings } = useQuery(
    trpc.creatorSettings.getSettings.queryOptions(),
  );

  const isLoading = isLoadingProfile || isLoadingSettings;

  const [form, setForm] = useState<BrandingForm | null>(null);

  // Initialize form when data loads
  const currentForm: BrandingForm = form ?? {
    brandColor: creatorProfile?.brandColor ?? DEFAULT_FORM.brandColor,
    brandSecondaryColor: settings?.brandSecondaryColor ?? DEFAULT_FORM.brandSecondaryColor,
    fontFamily: settings?.fontFamily ?? DEFAULT_FORM.fontFamily,
    logoUrl: creatorProfile?.logoUrl ?? DEFAULT_FORM.logoUrl,
    faviconUrl: settings?.faviconUrl ?? DEFAULT_FORM.faviconUrl,
    customCss: settings?.customCss ?? DEFAULT_FORM.customCss,
  };

  const updateField = useCallback(<K extends keyof BrandingForm>(
    key: K,
    value: BrandingForm[K],
  ) => {
    setForm((prev) => ({
      ...(prev ?? currentForm),
      [key]: value,
    }));
  }, [currentForm]);

  // Save mutations
  const updateProfileMutation = useMutation(
    trpc.creatorSettings.updateProfile.mutationOptions({
      onError: (err) => {
        toast.error(err.message || "Failed to save profile settings");
      },
    }),
  );

  const updateSettingsMutation = useMutation(
    trpc.creatorSettings.updateSettings.mutationOptions({
      onError: (err) => {
        toast.error(err.message || "Failed to save branding settings");
      },
    }),
  );

  const isSaving = updateProfileMutation.isPending || updateSettingsMutation.isPending;

  const handleSave = useCallback(async () => {
    const data = form ?? currentForm;

    await Promise.all([
      updateProfileMutation.mutateAsync({
        logoUrl: data.logoUrl,
        brandColor: data.brandColor,
      }),
      updateSettingsMutation.mutateAsync({
        brandSecondaryColor: data.brandSecondaryColor,
        fontFamily: data.fontFamily,
        faviconUrl: data.faviconUrl,
        customCss: data.customCss,
      }),
    ]);

    toast.success("Branding settings saved");
    queryClient.invalidateQueries({
      queryKey: trpc.creatorSettings.getProfile.queryKey(),
    });
    queryClient.invalidateQueries({
      queryKey: trpc.creatorSettings.getSettings.queryKey(),
    });
  }, [form, currentForm, updateProfileMutation, updateSettingsMutation, queryClient, trpc]);

  const handleReset = useCallback(() => {
    setForm(null);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[500px] rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Branding</h1>
          <p className="mt-2 text-muted-foreground">
            Customize your brand identity across all student-facing pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={form === null || isSaving}
            className="rounded-full"
          >
            <Redo2 className="size-4" />
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="pill"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* Settings Panel (3/5) */}
        <div className="space-y-6 lg:col-span-3">
          {/* Colors */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-lavender/20">
                  <Palette className="size-4 text-gaspar-purple" />
                </div>
                Colors
              </CardTitle>
              <CardDescription>
                Choose your brand colors. These apply to buttons, links, and accents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div>
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick Presets</Label>
                <div className="mt-3 flex flex-wrap gap-2">
                  {COLOR_PRESETS.map((preset) => {
                    const isActive =
                      currentForm.brandColor === preset.primary &&
                      currentForm.brandSecondaryColor === preset.secondary;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        className={cn(
                          "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-all",
                          isActive
                            ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                            : "border-border/50 hover:border-primary/40 hover:bg-primary/5",
                        )}
                        onClick={() => {
                          updateField("brandColor", preset.primary);
                          updateField("brandSecondaryColor", preset.secondary);
                        }}
                        aria-label={`${preset.label} color preset`}
                      >
                        <span
                          className="size-4 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span
                          className="size-4 rounded-full ring-1 ring-black/10"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        {preset.label}
                        {isActive && <Check className="ml-0.5 size-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Primary Color */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="brand-color">Primary Color</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <label
                      htmlFor="brand-color-picker"
                      className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/50 shadow-sm transition-shadow hover:shadow-md"
                      style={{ backgroundColor: currentForm.brandColor }}
                    >
                      <input
                        type="color"
                        id="brand-color-picker"
                        value={currentForm.brandColor}
                        onChange={(e) => updateField("brandColor", e.target.value)}
                        className="sr-only"
                        aria-label="Pick primary color"
                      />
                    </label>
                    <Input
                      id="brand-color"
                      value={currentForm.brandColor}
                      onChange={(e) => updateField("brandColor", e.target.value)}
                      className="w-32 rounded-xl font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <label
                      htmlFor="secondary-color-picker"
                      className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/50 shadow-sm transition-shadow hover:shadow-md"
                      style={{ backgroundColor: currentForm.brandSecondaryColor }}
                    >
                      <input
                        type="color"
                        id="secondary-color-picker"
                        value={currentForm.brandSecondaryColor}
                        onChange={(e) => updateField("brandSecondaryColor", e.target.value)}
                        className="sr-only"
                        aria-label="Pick secondary color"
                      />
                    </label>
                    <Input
                      id="secondary-color"
                      value={currentForm.brandSecondaryColor}
                      onChange={(e) => updateField("brandSecondaryColor", e.target.value)}
                      className="w-32 rounded-xl font-mono text-sm"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-blue/20">
                  <Type className="size-4 text-gaspar-purple" />
                </div>
                Typography
              </CardTitle>
              <CardDescription>
                Select a Google Font for your student-facing pages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <Select
                  value={currentForm.fontFamily}
                  onValueChange={(value) => updateField("fontFamily", value)}
                >
                  <SelectTrigger id="font-family" className="mt-1.5 w-full max-w-xs rounded-xl">
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {GOOGLE_FONTS.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="rounded-lg">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Favicon */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-base">
                <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-pink/20">
                  <ImageIcon className="size-4 text-gaspar-purple" />
                </div>
                Logo & Favicon
              </CardTitle>
              <CardDescription>
                Upload your brand logo and favicon for student-facing pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <ImageUploadField
                  label="Logo"
                  purpose="logo"
                  currentUrl={currentForm.logoUrl}
                  onUrlChange={(url) => updateField("logoUrl", url)}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  hint="Recommended: 400x80px, PNG or SVG"
                />
                <ImageUploadField
                  label="Favicon"
                  purpose="favicon"
                  currentUrl={currentForm.faviconUrl}
                  onUrlChange={(url) => updateField("faviconUrl", url)}
                  accept="image/png,image/x-icon,image/svg+xml"
                  hint="Recommended: 32x32px, PNG or ICO"
                />
              </div>
            </CardContent>
          </Card>

          {/* Custom CSS */}
          <Card className="rounded-2xl border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading text-base">Custom CSS</CardTitle>
              <CardDescription>
                Add custom CSS to override styles on your student-facing pages.
                Changes apply globally.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={currentForm.customCss}
                onChange={(e) => updateField("customCss", e.target.value)}
                placeholder={`/* Custom styles */\n.my-class {\n  color: red;\n}`}
                className="min-h-[160px] rounded-xl font-mono text-sm"
                rows={8}
              />
            </CardContent>
          </Card>
        </div>

        {/* Preview Panel (2/5) */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <Card className="rounded-2xl border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle className="font-heading text-base">Live Preview</CardTitle>
                <CardDescription>
                  See how your branding looks on student-facing pages.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BrandPreview form={currentForm} businessName={creatorProfile?.businessName ?? "Your Academy"} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// -- Image Upload Field -------------------------------------------------------

interface ImageUploadFieldProps {
  readonly label: string;
  readonly purpose: string;
  readonly currentUrl: string;
  readonly onUrlChange: (url: string) => void;
  readonly accept: string;
  readonly hint: string;
}

function ImageUploadField({
  label,
  purpose,
  currentUrl,
  onUrlChange,
  accept,
  hint,
}: ImageUploadFieldProps) {
  const trpc = useTRPC();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const getUploadUrlMutation = useMutation(
    trpc.videoUploads.getImageUploadUrl.mutationOptions({}),
  );

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.item(0);
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await getUploadUrlMutation.mutateAsync({
        purpose: purpose as "logo" | "thumbnail" | "course-cover" | "certificate-bg" | "favicon",
        filename: file.name,
        contentType: file.type,
      });

      // Upload to R2 via presigned URL
      await fetch(result.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      onUrlChange(result.publicUrl);
      toast.success(`${label} uploaded`);
    } catch {
      toast.error(`Failed to upload ${label.toLowerCase()}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [purpose, label, getUploadUrlMutation, onUrlChange]);

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">
        {currentUrl ? (
          <div className="group relative">
            <div className="flex h-24 items-center justify-center rounded-2xl border border-border/50 bg-muted/20 p-2">
              <img
                src={currentUrl}
                alt={`${label} preview`}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="rounded-full"
              >
                {isUploading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Upload className="size-3" />
                )}
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onUrlChange("")}
                className="rounded-full"
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 transition-all hover:border-primary/40 hover:bg-primary/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-primary/60" />
            ) : (
              <Upload className="size-5 text-primary/60" />
            )}
            <span className="text-xs font-medium text-primary/70">
              {isUploading ? "Uploading..." : "Click to upload"}
            </span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={`Upload ${label.toLowerCase()}`}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

// -- Brand Preview Panel ------------------------------------------------------

interface BrandPreviewProps {
  readonly form: BrandingForm;
  readonly businessName: string;
}

function BrandPreview({ form, businessName }: BrandPreviewProps) {
  const fontUrl = GOOGLE_FONTS.find((f) => f.value === form.fontFamily);
  const fontImportUrl = fontUrl
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(form.fontFamily)}:wght@${fontUrl.weights}&display=swap`
    : null;

  return (
    <div className="space-y-4">
      {/* Load font */}
      {fontImportUrl && (
        <link rel="stylesheet" href={fontImportUrl} />
      )}

      {/* Preview Container */}
      <div
        className="overflow-hidden rounded-2xl border border-border/50 shadow-sm"
        style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}
      >
        {/* Simulated Navigation */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ backgroundColor: form.brandColor }}
        >
          <div className="flex items-center gap-2">
            {form.logoUrl ? (
              <img
                src={form.logoUrl}
                alt="Logo preview"
                className="h-6 max-w-[120px] object-contain brightness-0 invert"
              />
            ) : (
              <span className="text-sm font-semibold text-white">
                {businessName}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <span className="text-xs text-white/70">Courses</span>
            <span className="text-xs text-white/70">Community</span>
            <span className="text-xs text-white/70">Account</span>
          </div>
        </div>

        {/* Simulated Hero Section */}
        <div className="bg-background p-6">
          <h3 className="font-heading text-lg font-bold">Welcome Back</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Continue where you left off in your courses.
          </p>

          {/* Simulated CTA Button */}
          <button
            type="button"
            className="mt-4 rounded-full px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: form.brandColor }}
          >
            Continue Learning
          </button>

          {/* Simulated Course Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/50 p-3">
              <div
                className="h-16 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${form.brandColor}, ${form.brandSecondaryColor})`,
                }}
              />
              <p className="mt-2 text-xs font-medium">Introduction to Design</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full w-3/5 rounded-full"
                  style={{ backgroundColor: form.brandColor }}
                />
              </div>
            </div>
            <div className="rounded-2xl border border-border/50 p-3">
              <div className="flex h-16 items-center justify-center rounded-xl bg-muted/50">
                <span className="text-[10px] text-muted-foreground">Thumbnail</span>
              </div>
              <p className="mt-2 text-xs font-medium">Advanced Techniques</p>
              <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full w-1/4 rounded-full"
                  style={{ backgroundColor: form.brandSecondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Simulated Link */}
          <p className="mt-4 text-xs">
            Need help?{" "}
            <span
              className="cursor-pointer underline"
              style={{ color: form.brandColor }}
            >
              Contact support
            </span>
          </p>
        </div>

        {/* Simulated Footer */}
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">
              {`Powered by ${businessName}`}
            </span>
            {form.faviconUrl && (
              <img
                src={form.faviconUrl}
                alt="Favicon preview"
                className="size-4"
              />
            )}
          </div>
        </div>
      </div>

      {/* Font Preview */}
      <div className="rounded-2xl border border-border/50 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Font Preview</p>
        <p
          className="mt-2 text-sm font-medium"
          style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}
        >
          {form.fontFamily}
        </p>
        <p
          className="mt-1 text-xs text-muted-foreground"
          style={{ fontFamily: `'${form.fontFamily}', sans-serif` }}
        >
          The quick brown fox jumps over the lazy dog. 0123456789
        </p>
      </div>

      {/* Custom CSS Indicator */}
      {form.customCss.trim().length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950">
          <Check className="size-3.5 text-amber-600" />
          <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Custom CSS active ({form.customCss.trim().split("\n").length} lines)
          </span>
        </div>
      )}
    </div>
  );
}
