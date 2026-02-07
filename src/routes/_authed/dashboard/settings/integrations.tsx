import { useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  BarChart3,
  Check,
  ExternalLink,
  Loader2,
  Save,
  Webhook,
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute(
  "/_authed/dashboard/settings/integrations",
)({
  component: IntegrationSettingsPage,
  errorComponent: RouteErrorBoundary,
});

// -- Pixel Definitions --------------------------------------------------------

interface PixelConfig {
  readonly key: "metaPixelId" | "ga4Id" | "gtmId" | "tiktokPixelId";
  readonly label: string;
  readonly placeholder: string;
  readonly pattern: RegExp;
  readonly helpText: string;
  readonly formatHint: string;
}

const PIXEL_CONFIGS: readonly PixelConfig[] = [
  {
    key: "metaPixelId",
    label: "Meta (Facebook) Pixel ID",
    placeholder: "123456789012345",
    pattern: /^\d{12,16}$/,
    helpText: "Find this in Meta Events Manager under Data Sources > Your Pixel > Settings.",
    formatHint: "A 12-16 digit number",
  },
  {
    key: "ga4Id",
    label: "Google Analytics 4 Measurement ID",
    placeholder: "G-XXXXXXXXXX",
    pattern: /^G-[A-Z0-9]{6,12}$/,
    helpText: "Find this in GA4 Admin > Data Streams > Your Stream > Measurement ID.",
    formatHint: "Starts with G- followed by alphanumeric characters",
  },
  {
    key: "gtmId",
    label: "Google Tag Manager Container ID",
    placeholder: "GTM-XXXXXXX",
    pattern: /^GTM-[A-Z0-9]{5,8}$/,
    helpText: "Find this in GTM Dashboard > Admin > Container Settings > Container ID.",
    formatHint: "Starts with GTM- followed by alphanumeric characters",
  },
  {
    key: "tiktokPixelId",
    label: "TikTok Pixel ID",
    placeholder: "CXXXXXXXXXXXXXXXXX",
    pattern: /^[A-Z0-9]{10,25}$/,
    helpText: "Find this in TikTok Ads Manager > Assets > Events > Web Events > Manage.",
    formatHint: "An alphanumeric string (10-25 characters)",
  },
] as const;

// -- Form State ---------------------------------------------------------------

type PixelFormState = Record<string, string>;
type PixelValidation = Record<string, "valid" | "invalid" | "empty">;

// -- Page Component -----------------------------------------------------------

function IntegrationSettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery(
    trpc.creatorSettings.getSettings.queryOptions(),
  );

  // Form state - null means no edits yet (use server data)
  const [form, setForm] = useState<PixelFormState | null>(null);
  const [validation, setValidation] = useState<PixelValidation>({});

  // Current values: local edits take precedence over server data
  const getValue = (key: PixelConfig["key"]): string => {
    if (form !== null && key in form) {
      return form[key] ?? "";
    }
    if (settings) {
      return settings[key] ?? "";
    }
    return "";
  };

  const updateField = useCallback((key: PixelConfig["key"], value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear validation state on edit
    setValidation((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  // Validate a single pixel field
  const validatePixel = useCallback((config: PixelConfig, value: string): "valid" | "invalid" | "empty" => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "empty";
    return config.pattern.test(trimmed) ? "valid" : "invalid";
  }, []);

  // Validate all pixels
  const handleValidateAll = useCallback(() => {
    const results: PixelValidation = {};
    let hasErrors = false;

    for (const config of PIXEL_CONFIGS) {
      const value = getValue(config.key);
      const result = validatePixel(config, value);
      results[config.key] = result;
      if (result === "invalid") hasErrors = true;
    }

    setValidation(results);

    if (hasErrors) {
      toast.error("Some pixel IDs have invalid formats. Please check the highlighted fields.");
    } else {
      toast.success("All pixel formats are valid");
    }
  }, [validatePixel, getValue]);

  // Save mutation
  const updateSettings = useMutation(
    trpc.creatorSettings.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getSettings.queryKey() });
        toast.success("Integration settings saved");
        setForm(null);
        setValidation({});
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSave = useCallback(() => {
    // Run validation before saving
    const results: PixelValidation = {};
    let hasErrors = false;

    for (const config of PIXEL_CONFIGS) {
      const value = getValue(config.key);
      const result = validatePixel(config, value);
      results[config.key] = result;
      if (result === "invalid") hasErrors = true;
    }

    setValidation(results);

    if (hasErrors) {
      toast.error("Please fix format errors before saving");
      return;
    }

    updateSettings.mutate({
      metaPixelId: getValue("metaPixelId").trim() || null,
      ga4Id: getValue("ga4Id").trim() || null,
      gtmId: getValue("gtmId").trim() || null,
      tiktokPixelId: getValue("tiktokPixelId").trim() || null,
    });
  }, [updateSettings, validatePixel, getValue]);

  const isSaving = updateSettings.isPending;
  const hasUnsavedChanges = form !== null;
  const activePixelCount = PIXEL_CONFIGS.filter((c) => getValue(c.key).trim().length > 0).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="mt-4 h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-7 text-indigo-500" />
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="mt-1 text-muted-foreground">
              Connect analytics pixels and tracking services to your student-facing pages.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleValidateAll}
            disabled={isSaving}
          >
            <Check className="size-4" />
            Validate All
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
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

      <div className="mt-8 space-y-6">
        {/* Active Pixels Summary */}
        {activePixelCount > 0 && (
          <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
            <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">
              <Check className="size-4" />
              {`${String(activePixelCount)} pixel${activePixelCount === 1 ? "" : "s"} configured`}
            </div>
            <p className="mt-1 text-xs text-green-600 dark:text-green-400">
              {PIXEL_CONFIGS
                .filter((c) => getValue(c.key).trim().length > 0)
                .map((c) => c.label.split(" ").at(0))
                .join(", ")}{" "}
              will be injected into your student-facing pages.
            </p>
          </div>
        )}

        {/* Analytics Pixels */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Analytics & Tracking Pixels</CardTitle>
            <CardDescription>
              Enter your pixel and tracking IDs below. These scripts are automatically injected
              into all student-facing pages for conversion tracking and analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {PIXEL_CONFIGS.map((config) => {
              const value = getValue(config.key);
              const status = validation[config.key];

              return (
                <div key={config.key} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={config.key}>{config.label}</Label>
                    {status === "valid" && (
                      <Badge variant="secondary" className="gap-1 text-green-700 dark:text-green-400">
                        <Check className="size-3" />
                        Valid
                      </Badge>
                    )}
                    {status === "invalid" && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="size-3" />
                        Invalid format
                      </Badge>
                    )}
                  </div>
                  <Input
                    id={config.key}
                    value={value}
                    onChange={(e) => updateField(config.key, e.target.value)}
                    placeholder={config.placeholder}
                    className={
                      status === "invalid"
                        ? "border-red-300 focus-visible:ring-red-500 dark:border-red-700"
                        : ""
                    }
                  />
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs text-muted-foreground">{config.helpText}</p>
                    {status === "invalid" && (
                      <p className="shrink-0 text-xs text-red-600 dark:text-red-400">
                        {`Expected: ${config.formatHint}`}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Webhooks Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Webhook className="size-4" />
              Webhooks
            </CardTitle>
            <CardDescription>
              Send real-time event notifications to external services when students enroll,
              complete lessons, or make purchases.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/settings/webhooks">
              <Button type="button" variant="outline" className="gap-2">
                <ExternalLink className="size-4" />
                Manage Webhooks
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Separator />

        {/* Save button at bottom for mobile */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          {hasUnsavedChanges && (
            <p className="text-xs text-muted-foreground">You have unsaved changes</p>
          )}
        </div>
      </div>
    </div>
  );
}
