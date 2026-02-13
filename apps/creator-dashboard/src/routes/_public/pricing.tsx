import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession } from "@/features/auth/auth-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_public/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      ...seo({
        title: "Pricing | Apostle",
        description:
          "Creator platform pricing. Launch, grow, and scale your online course business with Apostle. Start your 14-day free trial today.",
      }),
    ],
  }),
});

// -- Tier Data ----------------------------------------------------------------

interface Tier {
  readonly id: "launch" | "grow" | "scale" | "pro";
  readonly name: string;
  readonly monthlyPrice: number;
  readonly annualPrice: number;
  readonly badge: string | null;
  readonly description: string;
  readonly highlights: ReadonlyArray<string>;
  readonly cta: string;
  readonly gasparBg: string;
}

const TIERS: ReadonlyArray<Tier> = [
  {
    id: "launch",
    name: "Launch",
    monthlyPrice: 29,
    annualPrice: 290,
    badge: null,
    description: "Everything you need to create and sell your first course.",
    highlights: [
      "3 courses",
      "100 students",
      "5 hrs video storage",
      "2,500 emails/mo",
      "3 AI credits/mo",
      "1 landing page",
      "Basic analytics",
    ],
    cta: "Start Free Trial",
    gasparBg: "bg-gaspar-cream",
  },
  {
    id: "grow",
    name: "Grow",
    monthlyPrice: 79,
    annualPrice: 790,
    badge: "Most Popular",
    description: "For creators ready to scale their audience and revenue.",
    highlights: [
      "10 courses",
      "1,000 students",
      "25 hrs video storage",
      "10,000 emails/mo",
      "10 AI credits/mo",
      "5 landing pages",
      "Community access",
      "Priority rendering",
    ],
    cta: "Start Free Trial",
    gasparBg: "bg-gaspar-blue",
  },
  {
    id: "scale",
    name: "Scale",
    monthlyPrice: 149,
    annualPrice: 1490,
    badge: null,
    description: "Advanced tools for established course businesses.",
    highlights: [
      "25 courses",
      "5,000 students",
      "100 hrs video storage",
      "25,000 emails/mo",
      "30 AI credits/mo",
      "Unlimited landing pages",
      "Custom domain",
      "Remove branding",
      "Affiliate program",
      "Advanced analytics",
    ],
    cta: "Start Free Trial",
    gasparBg: "bg-gaspar-pink",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 199,
    annualPrice: 1990,
    badge: null,
    description: "Maximum power for high-volume course creators.",
    highlights: [
      "Unlimited courses",
      "15,000 students",
      "250 hrs video storage",
      "50,000 emails/mo",
      "100 AI credits/mo",
      "Everything in Scale",
      "API access",
      "Priority support",
    ],
    cta: "Start Free Trial",
    gasparBg: "bg-gaspar-navy",
  },
];

// -- Feature Comparison -------------------------------------------------------

interface ComparisonFeature {
  readonly name: string;
  readonly launch: string | boolean;
  readonly grow: string | boolean;
  readonly scale: string | boolean;
  readonly pro: string | boolean;
}

const COMPARISON_FEATURES: ReadonlyArray<ComparisonFeature> = [
  { name: "Courses", launch: "3", grow: "10", scale: "25", pro: "Unlimited" },
  { name: "Students", launch: "100", grow: "1,000", scale: "5,000", pro: "15,000" },
  { name: "Video Storage", launch: "5 hrs", grow: "25 hrs", scale: "100 hrs", pro: "250 hrs" },
  { name: "Emails/month", launch: "2,500", grow: "10,000", scale: "25,000", pro: "50,000" },
  { name: "AI Course Credits", launch: "3/mo", grow: "10/mo", scale: "30/mo", pro: "100/mo" },
  { name: "Avatar Video", launch: "Add-on", grow: "Add-on", scale: "Add-on", pro: "Add-on" },
  { name: "Landing Pages", launch: "1", grow: "5", scale: "Unlimited", pro: "Unlimited" },
  { name: "Email Marketing", launch: "1 sequence", grow: "5 sequences", scale: "Unlimited", pro: "Unlimited" },
  { name: "Page Builder", launch: true, grow: true, scale: true, pro: true },
  { name: "Community", launch: false, grow: true, scale: true, pro: true },
  { name: "Analytics", launch: "Basic", grow: "Standard", scale: "Advanced", pro: "Advanced" },
  { name: "Affiliate Program", launch: false, grow: false, scale: true, pro: true },
  { name: "Custom Domain", launch: false, grow: false, scale: true, pro: true },
  { name: "Remove Branding", launch: false, grow: false, scale: true, pro: true },
  { name: "API Access", launch: false, grow: false, scale: false, pro: true },
  { name: "Priority Support", launch: false, grow: false, scale: true, pro: true },
];

// -- Page Component -----------------------------------------------------------

function PricingPage() {
  const { data: session } = useSession();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSubscribe = async (plan: string) => {
    if (!session?.user) {
      return;
    }
    try {
      const billingPlan = isAnnual ? `${plan}_annual` : plan;
      await authClient.subscription.upgrade({
        plan: billingPlan,
        successUrl: "/dashboard",
        cancelUrl: "/pricing",
      });
    } catch {
      toast.error("Failed to start checkout. Please try again.");
    }
  };

  return (
    <div className="container py-16 md:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <Badge variant="outline" className="rounded-full border-primary/30 px-4 py-1 text-xs font-medium uppercase tracking-widest text-primary">
          Pricing
        </Badge>
        <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Everything you need to create, sell, and scale your online courses.
          Start with a 14-day free trial on any plan.
        </p>

        {/* Billing Toggle */}
        <div className="mt-10 flex items-center justify-center gap-3">
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm font-medium transition-colors",
              !isAnnual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
            aria-label="Toggle annual billing"
          />
          <Label
            htmlFor="billing-toggle"
            className={cn(
              "text-sm font-medium transition-colors",
              isAnnual ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Annual
          </Label>
          {isAnnual && (
            <Badge variant="secondary" className="ml-1 rounded-full bg-emerald-100 text-emerald-700">
              Save ~17%
            </Badge>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
        {TIERS.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.08, duration: 0.5 }}
          >
            <TierCard
              tier={tier}
              isAnnual={isAnnual}
              isLoggedIn={!!session?.user}
              onSubscribe={() => handleSubscribe(tier.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mx-auto mt-20 max-w-6xl"
      >
        <h2 className="text-center text-2xl font-bold">Compare All Features</h2>
        <p className="mt-2 text-center text-muted-foreground">
          A detailed breakdown of what each plan includes.
        </p>

        <Card className="mt-8 overflow-hidden rounded-2xl border-border/40">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-6 py-4 text-left text-sm font-medium">
                      Feature
                    </th>
                    {TIERS.map((tier) => (
                      <th
                        key={tier.id}
                        className={cn(
                          "px-4 py-4 text-center text-sm font-medium",
                          tier.id === "grow" && "bg-primary/5",
                        )}
                      >
                        {tier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((feature, idx) => (
                    <tr
                      key={feature.name}
                      className={
                        idx < COMPARISON_FEATURES.length - 1 ? "border-b" : ""
                      }
                    >
                      <td className="px-6 py-3.5 text-left text-sm">
                        {feature.name}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <FeatureValue value={feature.launch} />
                      </td>
                      <td className={cn("px-4 py-3.5 text-center", "bg-primary/5")}>
                        <FeatureValue value={feature.grow} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <FeatureValue value={feature.scale} />
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <FeatureValue value={feature.pro} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ / CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mx-auto mt-20 max-w-2xl text-center"
      >
        <h2 className="text-2xl font-bold">Ready to Get Started?</h2>
        <p className="mt-3 text-muted-foreground">
          Start your 14-day free trial today. No credit card required.
          Cancel anytime.
        </p>
        <div className="mt-6">
          {session?.user ? (
            <Button
              type="button"
              size="lg"
              className="rounded-full px-8 uppercase tracking-wider"
              onClick={() => handleSubscribe("grow")}
            >
              Start Free Trial
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="rounded-full px-8 uppercase tracking-wider"
              asChild
            >
              <Link to="/register">Create Your Account</Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// -- Tier Card ----------------------------------------------------------------

interface TierCardProps {
  readonly tier: Tier;
  readonly isAnnual: boolean;
  readonly isLoggedIn: boolean;
  readonly onSubscribe: () => void;
}

function TierCard({ tier, isAnnual, isLoggedIn, onSubscribe }: TierCardProps) {
  const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
  const period = isAnnual ? "year" : "month";
  const isPopular = tier.badge !== null;
  const isNavy = tier.id === "pro";

  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-2xl border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl",
        tier.gasparBg,
        isPopular && "ring-2 ring-primary shadow-xl shadow-primary/10",
        isNavy && "text-white",
      )}
    >
      {isPopular && (
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2">
          <Badge className="rounded-b-xl rounded-t-none bg-primary px-5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
            {tier.badge}
          </Badge>
        </div>
      )}

      <CardHeader className={cn(isPopular && "pt-10")}>
        <CardTitle className={cn("text-lg", isNavy && "text-white")}>{tier.name}</CardTitle>
        <CardDescription className={cn("min-h-[40px]", isNavy && "text-white/70")}>
          {tier.description}
        </CardDescription>
        <div className="mt-4">
          <span className={cn("text-4xl font-bold", isNavy && "text-white")}>{`$${String(price)}`}</span>
          <span className={cn("text-muted-foreground", isNavy && "text-white/60")}>{`/${period}`}</span>
        </div>
        {isAnnual && (
          <p className={cn("text-sm", isNavy ? "text-emerald-300" : "text-emerald-600")}>
            {`Save $${String(tier.monthlyPrice * 12 - tier.annualPrice)}/year`}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1">
        <Separator className={cn("mb-4", isNavy && "bg-white/20")} />
        <ul className="space-y-3">
          {tier.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-2.5 text-sm">
              <div className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                isNavy ? "bg-white/20" : "bg-primary/10",
              )}>
                <Check className={cn("size-3", isNavy ? "text-white" : "text-primary")} />
              </div>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        {isLoggedIn ? (
          <Button
            type="button"
            className={cn(
              "w-full rounded-full px-8 uppercase tracking-wider",
              isNavy && "bg-white text-gaspar-navy hover:bg-white/90",
            )}
            variant={isPopular ? "default" : isNavy ? "default" : "outline"}
            onClick={onSubscribe}
          >
            {tier.cta}
          </Button>
        ) : (
          <Button
            type="button"
            className={cn(
              "w-full rounded-full px-8 uppercase tracking-wider",
              isNavy && "bg-white text-gaspar-navy hover:bg-white/90",
            )}
            variant={isPopular ? "default" : isNavy ? "default" : "outline"}
            asChild
          >
            <Link to="/register">{tier.cta}</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// -- Feature Value Cell -------------------------------------------------------

function FeatureValue({ value }: { readonly value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-emerald-600" />;
  }
  if (value === false) {
    return <X className="mx-auto size-4 text-muted-foreground/30" />;
  }
  return <span className="text-sm">{value}</span>;
}
