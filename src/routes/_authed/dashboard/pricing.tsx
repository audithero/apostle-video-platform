import { createFileRoute } from "@tanstack/react-router";
import { Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/_authed/dashboard/pricing")({
  component: PricingPage,
});

// ── Tier Data ────────────────────────────────────────────────────────────

interface TierFeature {
  name: string;
  launch: string | boolean;
  grow: string | boolean;
  scale: string | boolean;
  pro: string | boolean;
}

const TIERS = [
  { id: "launch", name: "Launch", monthlyPrice: 29, annualPrice: 290, badge: null },
  { id: "grow", name: "Grow", monthlyPrice: 79, annualPrice: 790, badge: "Popular" },
  { id: "scale", name: "Scale", monthlyPrice: 149, annualPrice: 1490, badge: null },
  { id: "pro", name: "Pro", monthlyPrice: 199, annualPrice: 1990, badge: null },
] as const;

const FEATURES: ReadonlyArray<TierFeature> = [
  { name: "Courses", launch: "3", grow: "10", scale: "25", pro: "Unlimited" },
  { name: "Students", launch: "100", grow: "1,000", scale: "5,000", pro: "15,000" },
  { name: "Video Storage", launch: "5 hrs", grow: "25 hrs", scale: "100 hrs", pro: "250 hrs" },
  { name: "Emails/month", launch: "2,500", grow: "10,000", scale: "25,000", pro: "50,000" },
  { name: "AI Course Credits", launch: "3/mo", grow: "10/mo", scale: "30/mo", pro: "100/mo" },
  { name: "Avatar Video", launch: "Add-on", grow: "Add-on", scale: "Add-on", pro: "Add-on" },
  { name: "Community", launch: false, grow: true, scale: true, pro: true },
  { name: "Landing Pages", launch: "1", grow: "5", scale: "Unlimited", pro: "Unlimited" },
  { name: "Email Marketing", launch: "1 sequence", grow: "5 sequences", scale: "Unlimited", pro: "Unlimited" },
  { name: "Page Builder", launch: true, grow: true, scale: true, pro: true },
  { name: "Analytics", launch: "Basic", grow: "Standard", scale: "Advanced", pro: "Advanced" },
  { name: "Affiliate Program", launch: false, grow: false, scale: true, pro: true },
  { name: "Custom Domain", launch: false, grow: false, scale: true, pro: true },
  { name: "Remove Branding", launch: false, grow: false, scale: true, pro: true },
  { name: "API Access", launch: false, grow: false, scale: false, pro: true },
  { name: "Priority Support", launch: false, grow: false, scale: true, pro: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="mx-auto size-4 text-emerald-600" />;
  }
  if (value === false) {
    return <X className="mx-auto size-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm">{value}</span>;
}

// ── Component ────────────────────────────────────────────────────────────

function PricingPage() {
  // TODO: Replace with actual subscription status from tRPC
  const currentTier = "grow";

  return (
    <div>
      <h1 className="text-3xl font-bold">Plans & Pricing</h1>
      <p className="mt-2 text-muted-foreground">
        Choose the plan that fits your business. All plans include a 14-day free trial.
      </p>

      <Tabs defaultValue="monthly" className="mt-8">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="annual">
            Annual <Badge variant="secondary" className="ml-2">Save 17%</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monthly">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <PricingCard
                key={tier.id}
                name={tier.name}
                price={tier.monthlyPrice}
                period="month"
                badge={tier.badge}
                isCurrent={tier.id === currentTier}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="annual">
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((tier) => (
              <PricingCard
                key={tier.id}
                name={tier.name}
                price={tier.annualPrice}
                period="year"
                badge={tier.badge}
                isCurrent={tier.id === currentTier}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Feature Comparison Table */}
      <Card className="mt-12">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-medium">Feature</th>
                  {TIERS.map((tier) => (
                    <th key={tier.id} className="pb-3 text-sm font-medium">
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, idx) => (
                  <tr
                    key={feature.name}
                    className={idx < FEATURES.length - 1 ? "border-b" : ""}
                  >
                    <td className="py-3 text-left text-sm">{feature.name}</td>
                    <td className="py-3"><FeatureValue value={feature.launch} /></td>
                    <td className="py-3"><FeatureValue value={feature.grow} /></td>
                    <td className="py-3"><FeatureValue value={feature.scale} /></td>
                    <td className="py-3"><FeatureValue value={feature.pro} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────

interface PricingCardProps {
  name: string;
  price: number;
  period: "month" | "year";
  badge: string | null;
  isCurrent: boolean;
}

function PricingCard({ name, price, period, badge, isCurrent }: PricingCardProps) {
  return (
    <Card className={isCurrent ? "border-primary ring-2 ring-primary/20" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          {badge ? (
            <Badge>{badge}</Badge>
          ) : null}
        </div>
        <div className="mt-4">
          <span className="text-4xl font-bold">{`$${String(price)}`}</span>
          <span className="text-muted-foreground">{`/${period}`}</span>
        </div>
      </CardHeader>
      <CardContent>
        <Separator className="mb-4" />
        {isCurrent ? (
          <Button type="button" className="w-full" disabled>
            Current Plan
          </Button>
        ) : (
          <Button type="button" className="w-full" variant="outline">
            {price > 0 ? "Upgrade" : "Downgrade"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
