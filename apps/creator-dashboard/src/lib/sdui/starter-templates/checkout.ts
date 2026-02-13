import type { SDUIScreen } from "@platform/sdui-schema";

export const checkoutTemplate: SDUIScreen = {
  id: "tpl-checkout",
  name: "Checkout Page",
  slug: "checkout",
  description: "Pricing table, testimonials, guarantee badge, CTA",
  sections: [
    {
      id: "heading",
      type: "TextBlock",
      props: {
        content:
          "<h1>Choose Your Plan</h1><p>Get instant access to the full course. Pick the plan that works best for you.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "3rem 1.5rem 1.5rem" },
    },
    {
      id: "pricing",
      type: "PricingTable",
      props: {
        plans: [
          {
            name: "Starter",
            price: "$0",
            period: "forever",
            features: [
              "5 free preview lessons",
              "Community access",
              "Email newsletter",
            ],
            ctaText: "Start Free",
            highlighted: false,
          },
          {
            name: "Complete",
            price: "$79",
            period: "one-time",
            features: [
              "All video lessons",
              "Downloadable resources",
              "Community access",
              "Certificate of completion",
              "Lifetime updates",
            ],
            ctaText: "Get Full Access",
            highlighted: true,
          },
          {
            name: "VIP",
            price: "$199",
            period: "one-time",
            features: [
              "Everything in Complete",
              "1-on-1 coaching session",
              "Priority support",
              "Private group access",
              "Bonus materials",
            ],
            ctaText: "Go VIP",
            highlighted: false,
          },
        ],
      },
      style: { padding: "0 1.5rem 3rem" },
    },
    {
      id: "guarantee",
      type: "TextBlock",
      props: {
        content:
          "<div style=\"text-align:center\"><h3>30-Day Money-Back Guarantee</h3><p>Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love the course.</p></div>",
        alignment: "center",
        maxWidth: "600px",
      },
      style: {
        padding: "2rem 1.5rem",
        backgroundColor: "var(--sdui-color-surface)",
        borderRadius: "12px",
        maxWidth: "640px",
        margin: "0 auto",
      },
    },
    {
      id: "testimonials",
      type: "TestimonialCarousel",
      props: {
        autoplay: true,
        interval: 6000,
        testimonials: [
          {
            quote: "Worth every penny. The quality of instruction is outstanding.",
            name: "Happy Student",
            role: "Enrolled Student",
            avatar: "",
          },
          {
            quote: "I upgraded to VIP and the coaching call alone was worth the price difference.",
            name: "VIP Member",
            role: "VIP Student",
            avatar: "",
          },
          {
            quote: "Best online learning experience I've had. The community is incredibly supportive.",
            name: "Active Learner",
            role: "Community Member",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "cta-bottom",
      type: "CTAButton",
      props: {
        text: "Get Instant Access",
        action: { type: "navigate", payload: { url: "/checkout" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: { padding: "2rem 1.5rem 4rem", display: "flex", justifyContent: "center" },
    },
  ],
};
