import type { ReactNode } from "react";
import type { SDUIAction } from "@platform/sdui-schema";
import { useAction } from "@/renderer/ActionHandler";
import { cn } from "@/lib/cn";

interface Plan {
  name: string;
  price: string;
  features: string[];
  ctaText: string;
  ctaAction?: SDUIAction;
  highlighted?: boolean;
}

interface PricingTableProps {
  plans?: Plan[];
  sectionId?: string;
  children?: ReactNode;
}

function PlanCard({ plan }: { plan: Plan }) {
  const { handleAction } = useAction();

  return (
    <article
      className={cn(
        "flex flex-col rounded-2xl border p-6 transition-shadow",
        plan.highlighted
          ? "ring-2 shadow-lg"
          : "border-neutral-200 shadow-sm dark:border-neutral-700",
      )}
      style={
        plan.highlighted
          ? {
              borderColor: "var(--sdui-color-primary, #6366f1)",
              ringColor: "var(--sdui-color-primary, #6366f1)",
            }
          : undefined
      }
    >
      {plan.highlighted ? (
        <span
          className="mb-4 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold text-white"
          style={{ backgroundColor: "var(--sdui-color-primary, #6366f1)" }}
        >
          Most Popular
        </span>
      ) : null}

      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {plan.name}
      </h3>

      <p className="mt-2 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
        {plan.price}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mt-0.5 h-4 w-4 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
              style={{ color: "var(--sdui-color-primary, #6366f1)" }}
            >
              <title>Included</title>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={cn(
          "mt-8 w-full rounded-lg py-3 text-center text-sm font-semibold transition-colors",
          plan.highlighted
            ? "text-white hover:opacity-90"
            : "border border-neutral-300 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800",
        )}
        style={
          plan.highlighted
            ? { backgroundColor: "var(--sdui-color-primary, #6366f1)" }
            : undefined
        }
        onClick={() => {
          if (plan.ctaAction) {
            handleAction(plan.ctaAction);
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && plan.ctaAction) {
            handleAction(plan.ctaAction);
          }
        }}
      >
        {plan.ctaText}
      </button>
    </article>
  );
}

export default function PricingTable({
  plans = [],
  sectionId,
  children,
}: PricingTableProps) {
  if (plans.length === 0) {
    return (
      <section id={sectionId} className="w-full px-4 py-6">
        <p className="text-center text-sm text-neutral-400">No pricing plans available</p>
        {children}
      </section>
    );
  }

  return (
    <section id={sectionId} className="w-full px-4 py-12">
      <div
        className={cn(
          "mx-auto grid max-w-5xl gap-6",
          plans.length === 1 && "max-w-sm grid-cols-1",
          plans.length === 2 && "max-w-2xl grid-cols-1 sm:grid-cols-2",
          plans.length >= 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {plans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
      {children}
    </section>
  );
}
