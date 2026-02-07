import { useEffect } from "react";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  CheckCircle,
  CreditCard,
  ExternalLink,
  Package,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc/react";
import { RouteErrorBoundary } from "@/components/error-boundary";
import { formatDistanceToNow } from "date-fns";
import { z } from "zod";

const searchSchema = z.object({
  success: z.string().optional(),
  cancelled: z.string().optional(),
  pack: z.string().optional(),
});

export const Route = createFileRoute("/_authed/dashboard/avatar-packs")({
  component: AvatarPacksPage,
  errorComponent: RouteErrorBoundary,
  validateSearch: searchSchema,
});

// -- Pack Tiers ---------------------------------------------------------------

interface PackTier {
  readonly id: "starter" | "creator" | "pro" | "studio";
  readonly name: string;
  readonly minutes: number;
  readonly priceCents: number;
  readonly pricePerMinute: string;
  readonly icon: typeof Zap;
  readonly popular: boolean;
  readonly features: ReadonlyArray<string>;
}

const PACK_TIERS: ReadonlyArray<PackTier> = [
  {
    id: "starter",
    name: "Starter",
    minutes: 10,
    priceCents: 25_00,
    pricePerMinute: "$2.50",
    icon: Zap,
    popular: false,
    features: [
      "10 avatar minutes",
      "Standard avatars",
      "1080p output",
      "Never expires",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    minutes: 30,
    priceCents: 60_00,
    pricePerMinute: "$2.00",
    icon: Sparkles,
    popular: true,
    features: [
      "30 avatar minutes",
      "Standard + premium avatars",
      "1080p output",
      "Priority rendering",
      "Never expires",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    minutes: 60,
    priceCents: 99_00,
    pricePerMinute: "$1.65",
    icon: TrendingUp,
    popular: false,
    features: [
      "60 avatar minutes",
      "All avatar styles",
      "4K output",
      "Priority rendering",
      "Custom backgrounds",
      "Never expires",
    ],
  },
  {
    id: "studio",
    name: "Studio",
    minutes: 120,
    priceCents: 179_00,
    pricePerMinute: "$1.49",
    icon: Package,
    popular: false,
    features: [
      "120 avatar minutes",
      "All avatar styles",
      "4K output",
      "Priority rendering",
      "Custom backgrounds",
      "Batch generation",
      "Never expires",
    ],
  },
];

// -- Page Component -----------------------------------------------------------

function AvatarPacksPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/_authed/dashboard/avatar-packs" });

  const { data: packs, isLoading: isLoadingPacks } = useQuery(
    trpc.avatarVideos.getPacks.queryOptions(),
  );

  const { data: balanceData, isLoading: isLoadingBalance } = useQuery(
    trpc.avatarVideos.getBalance.queryOptions(),
  );

  // Stripe Checkout mutation
  const checkoutMutation = useMutation(
    trpc.avatarVideos.createCheckout.mutationOptions({
      onSuccess: (data) => {
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to create checkout session");
      },
    }),
  );

  // Fulfill pack after successful payment return
  const fulfillMutation = useMutation(
    trpc.avatarVideos.fulfillPack.mutationOptions({
      onSuccess: () => {
        toast.success("Avatar pack activated successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.avatarVideos.getPacks.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.avatarVideos.getBalance.queryKey(),
        });
      },
    }),
  );

  // Handle Stripe redirect success
  useEffect(() => {
    if (search.success === "true" && search.pack) {
      const packType = search.pack as "starter" | "creator" | "pro" | "studio";
      if (["starter", "creator", "pro", "studio"].includes(packType)) {
        fulfillMutation.mutate({ packType });
        // Clear query params
        window.history.replaceState({}, "", "/dashboard/avatar-packs");
      }
    }
    if (search.cancelled === "true") {
      toast.error("Purchase cancelled");
      window.history.replaceState({}, "", "/dashboard/avatar-packs");
    }
  }, [search.success, search.cancelled, search.pack]); // eslint-disable-line react-hooks/exhaustive-deps

  const avatarBalance = balanceData?.balance ?? 0;

  const totalMinutesPurchased = (packs ?? []).reduce(
    (sum, p) => sum + (p.minutesTotal ?? 0),
    0,
  );
  const totalMinutesUsed = (packs ?? []).reduce(
    (sum, p) => sum + (p.minutesUsed ?? 0),
    0,
  );
  const usagePercent =
    totalMinutesPurchased > 0
      ? Math.round((totalMinutesUsed / totalMinutesPurchased) * 100)
      : 0;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Avatar Packs</h1>
        <p className="text-muted-foreground">
          Purchase HeyGen AI avatar minutes to create video lessons with
          realistic AI presenters.
        </p>
      </div>

      {/* Success Banner */}
      {fulfillMutation.isSuccess && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950">
          <CheckCircle className="size-5 text-emerald-600" />
          <div>
            <p className="font-medium text-emerald-900 dark:text-emerald-100">
              Payment successful!
            </p>
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              Your avatar minutes have been added to your account.
            </p>
          </div>
        </div>
      )}

      {/* Balance Overview */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Available Minutes</CardDescription>
            <Zap className="size-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            {isLoadingBalance ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold">{String(avatarBalance)}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total Purchased</CardDescription>
            <Package className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPacks ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <p className="text-3xl font-bold">
                {`${String(Math.round(totalMinutesPurchased))} min`}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Usage</CardDescription>
            <TrendingUp className="size-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingPacks ? (
              <Skeleton className="h-9 w-20" />
            ) : (
              <div className="space-y-2">
                <p className="text-3xl font-bold">
                  {`${String(Math.round(totalMinutesUsed))} min`}
                </p>
                <Progress value={usagePercent} className="h-2" aria-label="Avatar minutes usage" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pack Tiers */}
      <section className="mt-10">
        <h2 className="text-xl font-semibold">Purchase Minutes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time purchases via Stripe. Minutes never expire and can be used
          across all your courses.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PACK_TIERS.map((tier) => (
            <PackCard
              key={tier.id}
              tier={tier}
              onPurchase={() =>
                checkoutMutation.mutate({ packType: tier.id })
              }
              isPurchasing={checkoutMutation.isPending}
            />
          ))}
        </div>
      </section>

      {/* Purchase History */}
      {!isLoadingPacks && packs && packs.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Purchase History</h2>
          <div className="mt-4 space-y-2">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <CreditCard className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {`${pack.packType.charAt(0).toUpperCase()}${pack.packType.slice(1)} Pack`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {`${String(Math.round(pack.minutesTotal))} minutes purchased`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {`${String(Math.round(pack.minutesTotal - pack.minutesUsed))} min remaining`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pack.purchasedAt
                      ? formatDistanceToNow(new Date(pack.purchasedAt), {
                          addSuffix: true,
                        })
                      : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// -- Pack Card ----------------------------------------------------------------

interface PackCardProps {
  readonly tier: PackTier;
  readonly onPurchase: () => void;
  readonly isPurchasing: boolean;
}

function PackCard({ tier, onPurchase, isPurchasing }: PackCardProps) {
  const Icon = tier.icon;
  const price = (tier.priceCents / 100).toFixed(0);

  return (
    <Card
      className={
        tier.popular ? "border-primary ring-2 ring-primary/20" : ""
      }
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4" />
            </div>
            <CardTitle className="text-lg">{tier.name}</CardTitle>
          </div>
          {tier.popular && <Badge>Best Value</Badge>}
        </div>
        <div className="mt-3">
          <span className="text-3xl font-bold">{`$${price}`}</span>
          <span className="text-sm text-muted-foreground">
            {` / ${String(tier.minutes)} min`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {`${tier.pricePerMinute} per minute`}
        </p>
      </CardHeader>

      <CardContent>
        <Separator className="mb-4" />
        <ul className="space-y-2">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          type="button"
          className="w-full"
          variant={tier.popular ? "default" : "outline"}
          onClick={onPurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <>Processing...</>
          ) : (
            <>
              <ExternalLink className="size-4" />
              Buy with Stripe
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
