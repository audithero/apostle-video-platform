import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
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
import { useSession } from "@/features/auth/auth-hooks";
import { authClient } from "@/lib/auth/auth-client";
import { toast } from "sonner";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_public/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      ...seo({
        title: "Pricing | Apostle",
        description:
          "Simple, transparent pricing for Apostle. Stream unlimited premium cooking shows starting at $9.99/month. Cancel anytime.",
      }),
    ],
  }),
});

const features = [
  "Unlimited access to all cooking shows",
  "New content added weekly",
  "Watch on any device",
  "Downloadable recipe PDFs",
  "Ad-free streaming",
  "Cancel anytime",
];

function PricingPage() {
  const { data: session } = useSession();

  const handleSubscribe = async (plan: string) => {
    if (!session?.user) {
      return;
    }
    try {
      await authClient.subscription.upgrade({
        plan,
        successUrl: "/account",
        cancelUrl: "/pricing",
      });
    } catch {
      toast.error("Failed to start subscription. Please try again.");
    }
  };

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Choose the plan that works best for you. Cancel anytime.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Monthly Plan */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Perfect for trying things out</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {session?.user ? (
              <Button className="w-full" onClick={() => handleSubscribe("monthly")}>
                Subscribe Monthly
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            )}
          </CardFooter>
        </Card>

        {/* Annual Plan */}
        <Card className="relative flex flex-col border-primary">
          <div className="absolute -top-3 right-4">
            <Badge>Best Value</Badge>
          </div>
          <CardHeader>
            <CardTitle>Annual</CardTitle>
            <CardDescription>Save 25% with annual billing</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$89.99</span>
              <span className="text-muted-foreground">/year</span>
            </div>
            <p className="text-sm text-muted-foreground">
              7-day free trial included
            </p>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="size-4 text-primary" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <Check className="size-4 text-primary" />
                <span className="text-sm font-medium">7-day free trial</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {session?.user ? (
              <Button className="w-full" onClick={() => handleSubscribe("annual")}>
                Start Free Trial
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
