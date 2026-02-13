import { useState, useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Save,
  Shield,
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
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";

export const Route = createFileRoute("/_authed/dashboard/settings/domain")({
  component: DomainSettingsPage,
  errorComponent: RouteErrorBoundary,
});

// -- Page Component -----------------------------------------------------------

function DomainSettingsPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery(
    trpc.creatorSettings.getProfile.queryOptions(),
  );
  const { data: domainStatus, isLoading: domainLoading, refetch: refetchDomain } = useQuery(
    trpc.creatorSettings.getDomainStatus.queryOptions(),
  );

  const isLoading = profileLoading || domainLoading;

  // Form state
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const [domainError, setDomainError] = useState("");

  // Derive current domain value: local edit takes precedence over server data
  const currentDomain = customDomain ?? profile?.customDomain ?? "";

  // Save domain mutation
  const updateProfile = useMutation(
    trpc.creatorSettings.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getProfile.queryKey() });
        queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getDomainStatus.queryKey() });
        toast.success("Domain settings saved");
        setCustomDomain(null);
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  // Verify domain mutation
  const verifyDomain = useMutation(
    trpc.creatorSettings.verifyDomain.mutationOptions({
      onSuccess: (result) => {
        if (result.verified) {
          toast.success("Domain verified successfully");
          setDomainError("");
          refetchDomain();
          queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getProfile.queryKey() });
        } else {
          setDomainError(result.error ?? "Verification failed");
          toast.error("Domain verification failed");
        }
      },
      onError: (err) => {
        setDomainError(err.message);
        toast.error(err.message);
      },
    }),
  );

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }, []);

  const handleSaveDomain = useCallback(() => {
    updateProfile.mutate({
      customDomain: currentDomain || null,
    });
  }, [currentDomain, updateProfile]);

  const handleVerify = useCallback(() => {
    setDomainError("");
    verifyDomain.mutate();
  }, [verifyDomain]);

  const isSaving = updateProfile.isPending;
  const hasUnsavedChanges = customDomain !== null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80" />
        <Skeleton className="mt-4 h-48 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gaspar-blue/20">
            <Globe className="size-6 text-gaspar-purple" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold tracking-tight">Custom Domain</h1>
            <p className="mt-1 text-muted-foreground">
              Connect your own domain for a professional branded experience.
            </p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <Button
            type="button"
            onClick={handleSaveDomain}
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
        )}
      </div>

      <div className="mt-8 space-y-6">
        {/* Free Subdomain */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-lavender/20">
                <Globe className="size-4 text-gaspar-purple" />
              </div>
              Your Free Subdomain
            </CardTitle>
            <CardDescription>
              This subdomain is always available on all plans. Share it with your students.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/20 px-4 py-3">
              <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
              <code className="flex-1 text-sm font-medium">
                {domainStatus?.subdomain ?? `${profile?.slug ?? ""}.apostle.tv`}
              </code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 gap-1 rounded-full px-3"
                onClick={() => handleCopy(domainStatus?.subdomain ?? `${profile?.slug ?? ""}.apostle.tv`)}
              >
                <Copy className="size-3" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain Configuration */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-base">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-cream/60">
                <Shield className="size-4 text-gaspar-purple" />
              </div>
              Custom Domain
            </CardTitle>
            <CardDescription>
              Use your own domain name (e.g. courses.yourdomain.com) to brand your course platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Domain Input */}
            <div>
              <Label htmlFor="custom-domain">Domain Name</Label>
              <Input
                id="custom-domain"
                value={currentDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="courses.yourdomain.com"
                className="mt-1.5 max-w-md rounded-xl"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Enter your custom domain or subdomain. Do not include https:// or trailing slashes.
              </p>
            </div>

            {/* DNS Instructions */}
            {currentDomain && (
              <>
                <Separator className="bg-border/50" />
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-sm font-semibold">DNS Configuration</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Add the following CNAME record in your DNS provider's settings:
                    </p>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-border/50 bg-background">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">Type</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">Name / Host</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">Value / Points To</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground" scope="col">TTL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="px-4 py-3 font-mono text-xs font-medium">CNAME</td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {currentDomain.startsWith("www.")
                              ? "www"
                              : currentDomain.split(".").at(0) ?? currentDomain}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <code className="rounded-lg bg-muted/40 px-2 py-1 font-mono text-xs">cname.apostle.tv</code>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 gap-1 rounded-full px-2"
                                onClick={() => handleCopy("cname.apostle.tv")}
                              >
                                <Copy className="size-3" />
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">Auto / 3600</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
                    <h4 className="font-heading text-xs font-semibold text-amber-800 dark:text-amber-200">Troubleshooting Tips</h4>
                    <ul className="mt-2 space-y-1.5 text-xs text-amber-700 dark:text-amber-300">
                      <li>DNS changes can take up to 48 hours to propagate globally.</li>
                      <li>Make sure you added a CNAME record, not an A record.</li>
                      <li>If using Cloudflare, set the proxy status to "DNS only" (grey cloud) initially.</li>
                      <li>Remove any existing A or AAAA records for the same hostname.</li>
                    </ul>
                  </div>
                </div>
              </>
            )}

            <Separator className="bg-border/50" />

            {/* Verification Status */}
            <div className="space-y-4">
              <h3 className="font-heading text-sm font-semibold">Verification Status</h3>

              {domainStatus?.customDomain ? (
                <div className="flex flex-wrap items-center gap-3">
                  {domainStatus.domainVerified ? (
                    <div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 dark:border-green-900 dark:bg-green-950">
                      <Check className="size-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Domain Verified
                        </p>
                        {domainStatus.domainVerifiedAt && (
                          <p className="text-xs text-green-600 dark:text-green-400">
                            {`Last verified: ${new Date(domainStatus.domainVerifiedAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <AlertCircle className="mr-1 inline size-3" />
                      Not Verified
                    </span>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleVerify}
                    disabled={verifyDomain.isPending}
                    className="rounded-full"
                  >
                    {verifyDomain.isPending ? (
                      <>
                        <Loader2 className="mr-1 size-3 animate-spin" />
                        Checking DNS...
                      </>
                    ) : (
                      "Verify DNS"
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Enter a custom domain above and save to begin verification.
                </p>
              )}

              {/* Verification Error */}
              {domainError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Verification Failed
                      </p>
                      <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">
                        {domainError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
