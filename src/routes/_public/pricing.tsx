import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
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
    <div className="container py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl text-center"
      >
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Plans</p>
        <h1 className="mt-2 text-3xl font-bold uppercase tracking-tight md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          Choose the plan that works best for you. Cancel anytime.
        </p>
      </motion.div>

      <div className="mx-auto mt-16 grid max-w-4xl gap-8 md:grid-cols-2">
        {/* Monthly Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card className="flex h-full flex-col rounded-2xl border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Monthly</CardTitle>
              <CardDescription>Perfect for trying things out</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-bold">$9.99</span>
                <span className="ml-1 text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              {session?.user ? (
                <Button
                  className="w-full rounded-full uppercase tracking-wider text-sm"
                  onClick={() => handleSubscribe("monthly")}
                >
                  Subscribe Monthly
                </Button>
              ) : (
                <Button className="w-full rounded-full uppercase tracking-wider text-sm" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>

        {/* Annual Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="relative flex h-full flex-col rounded-2xl border-primary/30 bg-card shadow-xl shadow-primary/5">
            <div className="absolute -top-3 right-6">
              <Badge className="rounded-full px-4 py-1 text-xs uppercase tracking-wider">Best Value</Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Annual</CardTitle>
              <CardDescription>Save 25% with annual billing</CardDescription>
              <div className="mt-6">
                <span className="text-5xl font-bold">$89.99</span>
                <span className="ml-1 text-muted-foreground">/year</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                7-day free trial included
              </p>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-4">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                <li className="flex items-center gap-3">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </div>
                  <span className="text-sm font-medium">7-day free trial</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="pt-4">
              {session?.user ? (
                <Button
                  className="w-full rounded-full uppercase tracking-wider text-sm"
                  onClick={() => handleSubscribe("annual")}
                >
                  Start Free Trial
                </Button>
              ) : (
                <Button className="w-full rounded-full uppercase tracking-wider text-sm" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
