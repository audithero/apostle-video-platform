import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  Loader2,
  Plus,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  GripVertical,
  Eye,
  MessageSquareQuote,
  FormInput,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/dashboard/settings/checkout")({
  component: CheckoutSettings,
  errorComponent: RouteErrorBoundary,
});

// -- Types --------------------------------------------------------------------

interface Testimonial {
  name: string;
  text: string;
  imageUrl?: string;
  role?: string;
}

interface GuaranteeBadge {
  enabled: boolean;
  text: string;
  days: number;
}

interface OrderBump {
  enabled: boolean;
  title: string;
  description: string;
  priceId: string;
  priceCents: number;
}

interface CustomField {
  id: string;
  label: string;
  type: "text" | "select";
  required: boolean;
  options?: string[];
}

// -- Page Component -----------------------------------------------------------

function CheckoutSettings() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery(
    trpc.creatorSettings.getProfile.queryOptions(),
  );

  const { data: settings, isLoading: settingsLoading } = useQuery(
    trpc.creatorSettings.getSettings.queryOptions(),
  );

  const isLoading = profileLoading || settingsLoading;

  // Branding
  const [checkoutLogo, setCheckoutLogo] = useState("");
  const [checkoutAccentColor, setCheckoutAccentColor] = useState("#6366f1");

  // Testimonials
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Guarantee
  const [guarantee, setGuarantee] = useState<GuaranteeBadge>({
    enabled: false,
    text: "30-Day Money Back Guarantee",
    days: 30,
  });

  // Order Bump
  const [orderBump, setOrderBump] = useState<OrderBump>({
    enabled: false,
    title: "",
    description: "",
    priceId: "",
    priceCents: 0,
  });

  // Custom Fields
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  // Preview
  const [showPreview, setShowPreview] = useState(false);

  // Seed from loaded data
  useEffect(() => {
    if (settings) {
      setCheckoutLogo(settings.checkoutLogo ?? "");
      setCheckoutAccentColor(settings.checkoutAccentColor ?? "#6366f1");

      const savedTestimonials = settings.checkoutTestimonials as
        | Testimonial[]
        | null;
      if (savedTestimonials) setTestimonials(savedTestimonials);

      const savedGuarantee = settings.checkoutGuaranteeBadge as
        | GuaranteeBadge
        | null;
      if (savedGuarantee) setGuarantee(savedGuarantee);

      const savedBump = settings.checkoutOrderBump as OrderBump | null;
      if (savedBump) setOrderBump(savedBump);

      const savedFields = settings.checkoutCustomFields as
        | CustomField[]
        | null;
      if (savedFields) setCustomFields(savedFields);
    }
  }, [settings]);

  // Mutations
  const updateSettings = useMutation(
    trpc.creatorSettings.updateSettings.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.creatorSettings.getSettings.queryKey(),
        });
        toast.success("Checkout settings saved");
      },
      onError: (err) => toast.error(err.message),
    }),
  );

  const handleSave = useCallback(() => {
    updateSettings.mutate({
      checkoutLogo: checkoutLogo || undefined,
      checkoutAccentColor: checkoutAccentColor || undefined,
      checkoutTestimonials:
        testimonials.length > 0 ? testimonials : undefined,
      checkoutGuaranteeBadge: guarantee,
      checkoutOrderBump: orderBump,
      checkoutCustomFields:
        customFields.length > 0 ? customFields : undefined,
    });
  }, [
    checkoutLogo,
    checkoutAccentColor,
    testimonials,
    guarantee,
    orderBump,
    customFields,
    updateSettings,
  ]);

  // -- Testimonial helpers --
  const addTestimonial = useCallback(() => {
    setTestimonials((prev) => [...prev, { name: "", text: "" }]);
  }, []);

  const removeTestimonial = useCallback((idx: number) => {
    setTestimonials((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateTestimonial = useCallback(
    (idx: number, field: keyof Testimonial, value: string) => {
      setTestimonials((prev) =>
        prev.map((t, i) => (i === idx ? { ...t, [field]: value } : t)),
      );
    },
    [],
  );

  // -- Custom field helpers --
  const addCustomField = useCallback(() => {
    setCustomFields((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        label: "",
        type: "text" as const,
        required: false,
      },
    ]);
  }, []);

  const removeCustomField = useCallback((idx: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateCustomField = useCallback(
    (idx: number, updates: Partial<CustomField>) => {
      setCustomFields((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, ...updates } : f)),
      );
    },
    [],
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-2 h-4 w-96" />
        <Skeleton className="mt-8 h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Settings Column */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-gaspar-lavender/20">
              <CreditCard className="size-6 text-gaspar-purple" />
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold tracking-tight">Checkout</h1>
              <p className="text-muted-foreground">
                Customize your checkout experience to increase conversions.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-full"
          >
            <Eye className="mr-2 size-4" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>

        {/* Branding */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading">
              <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-blue/20">
                <CreditCard className="size-4 text-gaspar-purple" />
              </div>
              Checkout Branding
            </CardTitle>
            <CardDescription>
              Customize the look of your Stripe Checkout page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="checkout-logo">Checkout Logo URL</Label>
              <Input
                id="checkout-logo"
                value={checkoutLogo}
                onChange={(e) => setCheckoutLogo(e.target.value)}
                placeholder="https://..."
                className="mt-1.5 rounded-xl"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Recommended: 512x128px PNG with transparency
              </p>
            </div>
            <div>
              <Label htmlFor="accent-color">Accent Color</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <label
                  htmlFor="accent-color"
                  className="flex size-10 cursor-pointer items-center justify-center rounded-xl border border-border/50 shadow-sm"
                  style={{ backgroundColor: checkoutAccentColor }}
                >
                  <input
                    type="color"
                    id="accent-color"
                    value={checkoutAccentColor}
                    onChange={(e) => setCheckoutAccentColor(e.target.value)}
                    className="sr-only"
                    aria-label="Pick accent color"
                  />
                </label>
                <Input
                  value={checkoutAccentColor}
                  onChange={(e) => setCheckoutAccentColor(e.target.value)}
                  className="w-32 rounded-xl font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Testimonials */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-cream/60">
                    <MessageSquareQuote className="size-4 text-gaspar-purple" />
                  </div>
                  Social Proof
                </CardTitle>
                <CardDescription>
                  Add testimonials to display alongside your checkout.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTestimonial}
                className="rounded-full"
              >
                <Plus className="mr-1 size-4" />
                Add
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/50 py-10 text-center">
                <MessageSquareQuote className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No testimonials yet. Add one to boost conversions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="space-y-3 rounded-2xl border border-border/50 bg-muted/10 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="size-4 text-muted-foreground/50" />
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                          {`#${String(idx + 1)}`}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTestimonial(idx)}
                        className="rounded-full"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={t.name}
                          onChange={(e) =>
                            updateTestimonial(idx, "name", e.target.value)
                          }
                          placeholder="John Doe"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>Role (optional)</Label>
                        <Input
                          value={t.role ?? ""}
                          onChange={(e) =>
                            updateTestimonial(idx, "role", e.target.value)
                          }
                          placeholder="Marketing Director"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Testimonial</Label>
                      <Textarea
                        value={t.text}
                        onChange={(e) =>
                          updateTestimonial(idx, "text", e.target.value)
                        }
                        placeholder="This course changed my life..."
                        className="mt-1.5 rounded-xl"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label>Avatar URL (optional)</Label>
                      <Input
                        value={t.imageUrl ?? ""}
                        onChange={(e) =>
                          updateTestimonial(idx, "imageUrl", e.target.value)
                        }
                        placeholder="https://..."
                        className="mt-1.5 rounded-xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guarantee Badge */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                    <ShieldCheck className="size-4 text-emerald-600" />
                  </div>
                  Money-Back Guarantee
                </CardTitle>
                <CardDescription>
                  Display a guarantee badge to reduce purchase anxiety.
                </CardDescription>
              </div>
              <Switch
                checked={guarantee.enabled}
                onCheckedChange={(checked) =>
                  setGuarantee((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </CardHeader>
          {guarantee.enabled ? (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="guarantee-text">Badge Text</Label>
                <Input
                  id="guarantee-text"
                  value={guarantee.text}
                  onChange={(e) =>
                    setGuarantee((prev) => ({ ...prev, text: e.target.value }))
                  }
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="guarantee-days">Guarantee Period (days)</Label>
                <Input
                  id="guarantee-days"
                  type="number"
                  min={1}
                  max={365}
                  value={String(guarantee.days)}
                  onChange={(e) => {
                    const days = Number.parseInt(e.target.value, 10);
                    if (!Number.isNaN(days)) {
                      setGuarantee((prev) => ({ ...prev, days }));
                    }
                  }}
                  className="mt-1.5 w-32 rounded-xl"
                />
              </div>
            </CardContent>
          ) : null}
        </Card>

        {/* Order Bump */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-pink/20">
                    <Tag className="size-4 text-gaspar-purple" />
                  </div>
                  Order Bump
                </CardTitle>
                <CardDescription>
                  Offer an additional product or upgrade at checkout.
                </CardDescription>
              </div>
              <Switch
                checked={orderBump.enabled}
                onCheckedChange={(checked) =>
                  setOrderBump((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
          </CardHeader>
          {orderBump.enabled ? (
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bump-title">Offer Title</Label>
                <Input
                  id="bump-title"
                  value={orderBump.title}
                  onChange={(e) =>
                    setOrderBump((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Add the VIP Community Access"
                  className="mt-1.5 rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="bump-desc">Description</Label>
                <Textarea
                  id="bump-desc"
                  value={orderBump.description}
                  onChange={(e) =>
                    setOrderBump((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Get lifetime access to our exclusive community..."
                  className="mt-1.5 rounded-xl"
                  rows={2}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="bump-price-id">Stripe Price ID</Label>
                  <Input
                    id="bump-price-id"
                    value={orderBump.priceId}
                    onChange={(e) =>
                      setOrderBump((prev) => ({
                        ...prev,
                        priceId: e.target.value,
                      }))
                    }
                    placeholder="price_..."
                    className="mt-1.5 rounded-xl font-mono text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="bump-price">Display Price (cents)</Label>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Input
                      id="bump-price"
                      type="number"
                      min={0}
                      value={String(orderBump.priceCents)}
                      onChange={(e) => {
                        const cents = Number.parseInt(e.target.value, 10);
                        if (!Number.isNaN(cents)) {
                          setOrderBump((prev) => ({
                            ...prev,
                            priceCents: cents,
                          }));
                        }
                      }}
                      className="w-32 rounded-xl"
                    />
                    <span className="text-sm text-muted-foreground">
                      {`= $${(orderBump.priceCents / 100).toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          ) : null}
        </Card>

        {/* Custom Fields */}
        <Card className="rounded-2xl border-border/50 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-gaspar-blue/20">
                    <FormInput className="size-4 text-gaspar-purple" />
                  </div>
                  Custom Checkout Fields
                </CardTitle>
                <CardDescription>
                  Collect additional info from buyers. Data is stored in Stripe
                  Checkout metadata.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomField}
                className="rounded-full"
              >
                <Plus className="mr-1 size-4" />
                Add Field
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customFields.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-border/50 py-10 text-center">
                <FormInput className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No custom fields. Standard Stripe fields (name, email, card)
                  are always included.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {customFields.map((field, idx) => (
                  <div
                    key={field.id}
                    className="space-y-3 rounded-2xl border border-border/50 bg-muted/10 p-5"
                  >
                    <div className="flex items-start justify-between">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {`Field #${String(idx + 1)}`}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomField(idx)}
                        className="rounded-full"
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateCustomField(idx, {
                              label: e.target.value,
                            })
                          }
                          placeholder="Company Name"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                      <div>
                        <Label>Type</Label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateCustomField(idx, {
                              type: e.target.value as "text" | "select",
                            })
                          }
                          className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="text">Text Input</option>
                          <option value="select">Dropdown</option>
                        </select>
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) =>
                              updateCustomField(idx, { required: checked })
                            }
                          />
                          <Label className="text-sm">Required</Label>
                        </div>
                      </div>
                    </div>
                    {field.type === "select" ? (
                      <div>
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={(field.options ?? []).join(", ")}
                          onChange={(e) =>
                            updateCustomField(idx, {
                              options: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Option 1, Option 2, Option 3"
                          className="mt-1.5 rounded-xl"
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={updateSettings.isPending}
            className="pill"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      {/* Preview Column */}
      {showPreview ? (
        <div className="hidden w-80 shrink-0 lg:block">
          <div className="sticky top-24 space-y-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Checkout Preview
            </h3>
            <CheckoutPreview
              logo={checkoutLogo || profile?.logoUrl || ""}
              accentColor={checkoutAccentColor}
              businessName={profile?.businessName ?? "Your Business"}
              testimonials={testimonials}
              guarantee={guarantee}
              orderBump={orderBump}
              customFields={customFields}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

// -- Checkout Preview ---------------------------------------------------------

function CheckoutPreview({
  logo,
  accentColor,
  businessName,
  testimonials,
  guarantee,
  orderBump,
  customFields,
}: {
  readonly logo: string;
  readonly accentColor: string;
  readonly businessName: string;
  readonly testimonials: Testimonial[];
  readonly guarantee: GuaranteeBadge;
  readonly orderBump: OrderBump;
  readonly customFields: CustomField[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-lg dark:bg-zinc-950">
      {/* Header */}
      <div
        className="px-4 py-3 text-center text-white"
        style={{ backgroundColor: accentColor }}
      >
        {logo ? (
          <img
            src={logo}
            alt=""
            className="mx-auto h-6 object-contain"
          />
        ) : (
          <p className="text-sm font-semibold">{businessName}</p>
        )}
      </div>

      <div className="space-y-4 p-4">
        {/* Product */}
        <div className="rounded-xl bg-muted/30 p-3">
          <p className="text-sm font-medium">Course Name</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            One-time payment
          </p>
          <p className="mt-1 font-heading text-lg font-bold">$97.00</p>
        </div>

        {/* Order Bump Preview */}
        {orderBump.enabled && orderBump.title ? (
          <div
            className="rounded-xl border-2 border-dashed p-3"
            style={{ borderColor: accentColor }}
          >
            <div className="flex items-start gap-2">
              <input type="checkbox" className="mt-0.5" defaultChecked />
              <div>
                <p className="text-xs font-semibold">{orderBump.title}</p>
                {orderBump.description ? (
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
                    {orderBump.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs font-bold" style={{ color: accentColor }}>
                  {`+$${(orderBump.priceCents / 100).toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Custom Fields Preview */}
        {customFields.length > 0 ? (
          <div className="space-y-2">
            {customFields.map((field) => (
              <div key={field.id}>
                <p className="text-[10px] font-medium text-muted-foreground">
                  {field.label || "Untitled"}
                  {field.required ? (
                    <span className="text-destructive"> *</span>
                  ) : null}
                </p>
                <div className="mt-0.5 h-7 rounded-lg border border-border/50 bg-muted/20" />
              </div>
            ))}
          </div>
        ) : null}

        {/* Pay Button */}
        <button
          type="button"
          className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: accentColor }}
        >
          Pay Now
        </button>

        {/* Guarantee Badge Preview */}
        {guarantee.enabled ? (
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950">
            <ShieldCheck className="size-4 text-emerald-600" />
            <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
              {guarantee.text}
            </span>
          </div>
        ) : null}

        {/* Testimonials Preview */}
        {testimonials.length > 0 ? (
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              What others say
            </p>
            {testimonials.slice(0, 2).map((t, idx) => (
              <div key={idx} className="rounded-xl bg-muted/20 p-2.5">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-2.5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground">
                  {t.text || "Testimonial text..."}
                </p>
                <p className="mt-1 text-[10px] font-medium">
                  {t.name || "Customer"}
                  {t.role ? (
                    <span className="text-muted-foreground">
                      {` - ${t.role}`}
                    </span>
                  ) : null}
                </p>
              </div>
            ))}
            {testimonials.length > 2 ? (
              <p className="text-center text-[10px] text-muted-foreground">
                {`+${String(testimonials.length - 2)} more`}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
