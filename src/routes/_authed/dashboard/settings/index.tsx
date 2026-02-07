import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Globe, Code, Image, Check, Loader2, AlertCircle, Copy, ExternalLink, Shield } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useTRPC } from "@/lib/trpc/react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/dashboard/settings/")({
  component: CreatorSettings,
});

function CreatorSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery(
    trpc.creatorSettings.getProfile.queryOptions(),
  );
  const { data: settings, isLoading: settingsLoading } = useQuery(
    trpc.creatorSettings.getSettings.queryOptions(),
  );
  const { data: domainStatus, refetch: refetchDomain } = useQuery(
    trpc.creatorSettings.getDomainStatus.queryOptions(),
  );

  const isLoading = profileLoading || settingsLoading;

  // Profile form state
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [emailFromName, setEmailFromName] = useState("");
  const [emailReplyTo, setEmailReplyTo] = useState("");
  const [timezone, setTimezone] = useState("UTC");

  // Branding form state
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#7c3aed");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");

  // Domain & SEO form state
  const [customDomain, setCustomDomain] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [ogImageUrl, setOgImageUrl] = useState("");

  // Integrations form state
  const [metaPixelId, setMetaPixelId] = useState("");
  const [ga4Id, setGa4Id] = useState("");
  const [gtmId, setGtmId] = useState("");
  const [tiktokPixelId, setTiktokPixelId] = useState("");

  // Advanced form state
  const [customHeadCode, setCustomHeadCode] = useState("");
  const [customCss, setCustomCss] = useState("");

  // Seed form state from loaded data
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName ?? "");
      setSlug(profile.slug ?? "");
      setBrandColor(profile.brandColor ?? "#2563eb");
      setTimezone(profile.timezone ?? "UTC");
      setCustomDomain(profile.customDomain ?? "");
      setLogoUrl(profile.logoUrl ?? "");
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setEmailFromName(settings.emailFromName ?? "");
      setEmailReplyTo(settings.emailReplyTo ?? "");
      setBrandSecondaryColor(settings.brandSecondaryColor ?? "#7c3aed");
      setFontFamily(settings.fontFamily ?? "Inter");
      setFaviconUrl(settings.faviconUrl ?? "");
      setMetaPixelId(settings.metaPixelId ?? "");
      setGa4Id(settings.ga4Id ?? "");
      setGtmId(settings.gtmId ?? "");
      setTiktokPixelId(settings.tiktokPixelId ?? "");
      setCustomHeadCode(settings.customHeadCode ?? "");
      setCustomCss(settings.customCss ?? "");
      const seo = settings.seoDefaults as { metaTitle?: string; metaDescription?: string; ogImageUrl?: string } | null;
      setSeoTitle(seo?.metaTitle ?? "");
      setSeoDescription(seo?.metaDescription ?? "");
      setOgImageUrl(seo?.ogImageUrl ?? "");
    }
  }, [settings]);

  // Domain verification state
  const [domainError, setDomainError] = useState("");

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

  const handleCopyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Copied to clipboard");
    });
  }, []);

  // Mutations
  const updateProfile = useMutation(
    trpc.creatorSettings.updateProfile.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getProfile.queryKey() });
        toast.success("Profile updated");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const updateSettings = useMutation(
    trpc.creatorSettings.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.creatorSettings.getSettings.queryKey() });
        toast.success("Settings updated");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSaveProfile = useCallback(() => {
    updateProfile.mutate({
      businessName,
      logoUrl: logoUrl || undefined,
      brandColor,
      timezone,
      customDomain: customDomain || null,
    });
    updateSettings.mutate({
      emailFromName: emailFromName || undefined,
      emailReplyTo: emailReplyTo || undefined,
    });
  }, [businessName, logoUrl, brandColor, timezone, customDomain, emailFromName, emailReplyTo, updateProfile, updateSettings]);

  const handleSaveBranding = useCallback(() => {
    updateProfile.mutate({ brandColor, logoUrl: logoUrl || undefined });
    updateSettings.mutate({
      brandSecondaryColor,
      fontFamily,
      faviconUrl: faviconUrl || undefined,
    });
  }, [brandColor, logoUrl, brandSecondaryColor, fontFamily, faviconUrl, updateProfile, updateSettings]);

  const handleSaveSeo = useCallback(() => {
    updateProfile.mutate({ customDomain: customDomain || null });
    updateSettings.mutate({
      seoDefaults: {
        metaTitle: seoTitle || undefined,
        metaDescription: seoDescription || undefined,
        ogImageUrl: ogImageUrl || undefined,
      },
    });
  }, [customDomain, seoTitle, seoDescription, ogImageUrl, updateProfile, updateSettings]);

  const handleSaveIntegrations = useCallback(() => {
    updateSettings.mutate({
      metaPixelId: metaPixelId || null,
      ga4Id: ga4Id || null,
      gtmId: gtmId || null,
      tiktokPixelId: tiktokPixelId || null,
    });
  }, [metaPixelId, ga4Id, gtmId, tiktokPixelId, updateSettings]);

  const handleSaveAdvanced = useCallback(() => {
    updateSettings.mutate({
      customHeadCode: customHeadCode || undefined,
      customCss: customCss || undefined,
    });
  }, [customHeadCode, customCss, updateSettings]);

  const isSaving = updateProfile.isPending || updateSettings.isPending;

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-80" />
        <Skeleton className="mt-8 h-10 w-96" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-muted-foreground">Configure your creator profile, branding, and integrations.</p>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Domain & SEO</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Creator Profile</CardTitle>
              <CardDescription>Your public-facing business information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="mt-1"
                    disabled
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {`yoursite.com/${slug}`}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email-from">Email From Name</Label>
                  <Input
                    id="email-from"
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email-reply">Reply-To Email</Label>
                  <Input
                    id="email-reply"
                    type="email"
                    value={emailReplyTo}
                    onChange={(e) => setEmailReplyTo(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Berlin">Berlin</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <SaveButton onClick={handleSaveProfile} isPending={isSaving} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding Tab */}
        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="size-5" />
                Brand Identity
              </CardTitle>
              <CardDescription>Customize colors, fonts, and visual identity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="brand-color">Primary Color</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      id="brand-color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="size-10 cursor-pointer rounded border"
                    />
                    <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-32" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      id="secondary-color"
                      value={brandSecondaryColor}
                      onChange={(e) => setBrandSecondaryColor(e.target.value)}
                      className="size-10 cursor-pointer rounded border"
                    />
                    <Input value={brandSecondaryColor} onChange={(e) => setBrandSecondaryColor(e.target.value)} className="w-32" />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="font-family">Font Family</Label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                </select>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="logo-url" className="flex items-center gap-2">
                    <Image className="size-4" />
                    Logo URL
                  </Label>
                  <Input id="logo-url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="favicon-url">Favicon URL</Label>
                  <Input id="favicon-url" value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
              </div>

              <SaveButton onClick={handleSaveBranding} isPending={isSaving} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Domain & SEO Tab */}
        <TabsContent value="domain" className="mt-6">
          <div className="space-y-6">
            {/* Free Subdomain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="size-5" />
                  Your Subdomain
                </CardTitle>
                <CardDescription>Your free subdomain is always available.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
                  <ExternalLink className="size-4 text-muted-foreground" />
                  <code className="flex-1 text-sm font-medium">
                    {domainStatus?.subdomain ?? `${slug}.apostle.tv`}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 px-2"
                    onClick={() => handleCopyToClipboard(domainStatus?.subdomain ?? `${slug}.apostle.tv`)}
                  >
                    <Copy className="size-3" />
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This is included free on all plans. Share this link with your students.
                </p>
              </CardContent>
            </Card>

            {/* Custom Domain */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="size-5" />
                  Custom Domain
                </CardTitle>
                <CardDescription>Connect your own domain for a professional branded experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-domain">Domain</Label>
                  <Input
                    id="custom-domain"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="courses.yourdomain.com"
                    className="mt-1"
                  />
                </div>

                {/* DNS Setup Instructions */}
                {customDomain && (
                  <div className="rounded-md border bg-muted/30 p-4 space-y-3">
                    <h4 className="text-sm font-semibold">DNS Configuration</h4>
                    <p className="text-xs text-muted-foreground">
                      Add the following CNAME record in your DNS provider:
                    </p>
                    <div className="overflow-x-auto rounded border bg-background">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" scope="col">Type</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" scope="col">Name/Host</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" scope="col">Value/Target</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground" scope="col">TTL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-3 py-2 font-mono text-xs">CNAME</td>
                            <td className="px-3 py-2 font-mono text-xs">
                              {customDomain.startsWith("www.")
                                ? "www"
                                : customDomain.split(".").at(0) ?? customDomain}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <code className="font-mono text-xs">cname.apostle.tv</code>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 gap-1 px-1.5"
                                  onClick={() => handleCopyToClipboard("cname.apostle.tv")}
                                >
                                  <Copy className="size-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">Auto/3600</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      DNS changes can take up to 48 hours to propagate. Click verify once you have added the record.
                    </p>
                  </div>
                )}

                {/* Verification Status */}
                {domainStatus?.customDomain && (
                  <div className="flex items-center gap-3">
                    {domainStatus.domainVerified ? (
                      <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 dark:border-green-900 dark:bg-green-950">
                        <Check className="size-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800 dark:text-green-200">Domain Verified</p>
                          {domainStatus.domainVerifiedAt && (
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {`Verified on ${new Date(domainStatus.domainVerifiedAt).toLocaleDateString()}`}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <AlertCircle className="size-3" />
                        Not verified
                      </Badge>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDomainError("");
                        verifyDomain.mutate();
                      }}
                      disabled={verifyDomain.isPending}
                    >
                      {verifyDomain.isPending ? (
                        <>
                          <Loader2 className="mr-1 size-3 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        "Verify DNS"
                      )}
                    </Button>
                  </div>
                )}

                {/* Verification Error */}
                {domainError && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4 text-red-500" />
                      <p className="text-sm text-red-700 dark:text-red-300">{domainError}</p>
                    </div>
                  </div>
                )}

                <SaveButton onClick={handleSaveSeo} isPending={isSaving} />
              </CardContent>
            </Card>

            {/* SEO Defaults */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Defaults</CardTitle>
                <CardDescription>Default meta tags for your pages.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="seo-title">Default Meta Title</Label>
                  <Input id="seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="seo-desc">Default Meta Description</Label>
                  <Textarea id="seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="mt-1" rows={3} />
                </div>
                <div>
                  <Label htmlFor="og-image">Default OG Image URL</Label>
                  <Input id="og-image" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://..." className="mt-1" />
                </div>
                <SaveButton onClick={handleSaveSeo} isPending={isSaving} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Tracking Pixels</CardTitle>
              <CardDescription>
                Connect your analytics and advertising pixels. These scripts will be automatically
                injected into your student-facing pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="meta-pixel">Meta (Facebook) Pixel ID</Label>
                  <Input
                    id="meta-pixel"
                    value={metaPixelId}
                    onChange={(e) => setMetaPixelId(e.target.value)}
                    placeholder="123456789012345"
                    className="mt-1"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tracks PageView, Purchase, and Lead events. Server-side CAPI enabled for purchases.
                  </p>
                </div>
                <div>
                  <Label htmlFor="ga4">Google Analytics 4 Measurement ID</Label>
                  <Input
                    id="ga4"
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gtm">Google Tag Manager Container ID</Label>
                  <Input
                    id="gtm"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok-pixel">TikTok Pixel ID</Label>
                  <Input
                    id="tiktok-pixel"
                    value={tiktokPixelId}
                    onChange={(e) => setTiktokPixelId(e.target.value)}
                    placeholder="XXXXXXXXXXXXXXXXX"
                    className="mt-1"
                  />
                </div>
              </div>

              {(metaPixelId || ga4Id || gtmId || tiktokPixelId) ? (
                <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
                  <div className="flex items-center gap-2 text-sm font-medium text-green-800 dark:text-green-200">
                    <Check className="size-4" />
                    Pixels configured
                  </div>
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    {[
                      metaPixelId ? "Meta Pixel" : "",
                      ga4Id ? "GA4" : "",
                      gtmId ? "GTM" : "",
                      tiktokPixelId ? "TikTok" : "",
                    ].filter(Boolean).join(", ")}{" "}
                    will be injected into student-facing pages.
                  </p>
                </div>
              ) : null}

              <SaveButton onClick={handleSaveIntegrations} isPending={isSaving} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="size-5" />
                Custom Code
              </CardTitle>
              <CardDescription>Add custom HTML/JS to the head and custom CSS to all pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="custom-head">Custom Head Code</Label>
                <Textarea
                  id="custom-head"
                  value={customHeadCode}
                  onChange={(e) => setCustomHeadCode(e.target.value)}
                  placeholder="<!-- Custom scripts, meta tags, etc. -->"
                  className="mt-1 font-mono text-sm"
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="custom-css">Custom CSS</Label>
                <Textarea
                  id="custom-css"
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  placeholder="/* Custom styles */"
                  className="mt-1 font-mono text-sm"
                  rows={6}
                />
              </div>
              <SaveButton onClick={handleSaveAdvanced} isPending={isSaving} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SaveButton({ onClick, isPending }: { readonly onClick: () => void; readonly isPending: boolean }) {
  return (
    <Button type="button" onClick={onClick} disabled={isPending}>
      {isPending ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}
