import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Complete Web Dev Bootcamp — Checkout / Pricing page
 *
 * Design language: Developer-focused dark mode with high-contrast accents.
 * Inspired by Vercel, Linear, and modern SaaS pricing pages.
 *
 * Typography: "Sora" for modern, trustworthy technical readability
 * Palette: Dark slate (#0F172A) base, electric cyan (#06B6D4),
 *          lime (#84CC16), muted steel (#94A3B8) secondary text.
 */
export const checkoutTemplate: SDUIScreen = {
  id: "tpl-checkout",
  name: "Checkout Page",
  slug: "checkout",
  description:
    "Developer bootcamp checkout with tiered pricing, social proof from 8,500+ graduates, and 60-day code guarantee",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Page Heading                                                     */
    /* ---------------------------------------------------------------- */
    {
      id: "heading",
      type: "TextBlock",
      props: {
        content:
          '<h1 style="font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 2.75rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 1rem; background: linear-gradient(135deg, #F8FAFC 0%, #06B6D4 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Invest in Your Developer Career</h1><p style="font-size: 1.15rem; color: #94A3B8; line-height: 1.7; max-width: 560px; margin: 0 auto;">Join <strong style="color: #06B6D4;">8,500+ graduates</strong> who transformed their careers with David Chen\'s Complete Web Dev Bootcamp. From first line of code to production deployment.</p>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: {
        padding: "5rem 1.5rem 2rem",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Pricing Table — 3 Tiers                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "pricing",
      type: "PricingTable",
      props: {
        plans: [
          {
            name: "Explorer",
            price: "$0",
            period: "forever",
            features: [
              "5 preview lessons (HTML, CSS, JS basics)",
              "Community forum access",
              "Weekly coding challenges",
              "Course roadmap & syllabus PDF",
              "Email newsletter with dev tips",
            ],
            ctaText: "Start Free",
            highlighted: false,
          },
          {
            name: "Developer",
            price: "$129",
            period: "one-time",
            features: [
              "All 180 video lessons",
              "12 real-world portfolio projects",
              "Certificate of Completion",
              "Downloadable source code & assets",
              "Community forum + study groups",
              "Lifetime access + future updates",
            ],
            ctaText: "Start Building",
            highlighted: true,
          },
          {
            name: "Pro",
            price: "$299",
            period: "one-time",
            features: [
              "Everything in Developer",
              "4 one-on-one mentoring sessions",
              "Resume & portfolio review",
              "Job interview prep workshop",
              "Private Slack with David & TAs",
              "Priority code reviews on projects",
            ],
            ctaText: "Go Pro",
            highlighted: false,
          },
        ],
      },
      style: {
        padding: "0 1.5rem 4rem",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  60-Day Code Guarantee                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "guarantee",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 600px; margin: 0 auto; border: 1px solid rgba(6, 182, 212, 0.2); border-radius: 16px; padding: 2.5rem 2rem; background: rgba(6, 182, 212, 0.04);"><div style="font-size: 2.5rem; margin-bottom: 0.75rem;">&#128274;</div><h3 style="font-family: Inter, system-ui, sans-serif; font-size: 1.4rem; color: #F1F5F9; font-weight: 700; margin-bottom: 0.75rem;">60-Day Money-Back Code Guarantee</h3><p style="color: #94A3B8; line-height: 1.7; font-size: 1rem;">Complete the first 30 lessons. If you can\'t build a working web app by then, we\'ll refund every penny. No hoops, no questions — just email us your progress and we\'ll process the refund within 48 hours.</p></div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: {
        padding: "0 1.5rem 4rem",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Testimonials                                                     */
    /* ---------------------------------------------------------------- */
    {
      id: "testimonials",
      type: "TestimonialCarousel",
      props: {
        autoplay: true,
        interval: 6000,
        testimonials: [
          {
            quote:
              "I went from zero coding knowledge to landing a junior developer role in 5 months. David's project-based approach meant I had a portfolio ready before I even started applying. The bootcamp paid for itself 100 times over.",
            name: "Priya Sharma",
            role: "Junior Developer, Toronto",
            avatar: "",
          },
          {
            quote:
              "After 8 years in retail management, I was terrified to switch careers. David breaks everything down so clearly that imposter syndrome never stood a chance. I'm now building React apps at a startup and loving every day.",
            name: "Marcus Johnson",
            role: "Career Changer, Austin",
            avatar: "",
          },
          {
            quote:
              "The Pro tier mentoring sessions were a game-changer. David reviewed my freelance portfolio and helped me reposition myself. My rates doubled within two months of finishing the course.",
            name: "Lisa Zhang",
            role: "Freelance Developer, Singapore",
            avatar: "",
          },
        ],
      },
      style: {
        padding: "0 1.5rem 4rem",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
        borderTop: "1px solid rgba(6, 182, 212, 0.1)",
        borderBottom: "1px solid rgba(6, 182, 212, 0.1)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Social Proof Stats                                               */
    /* ---------------------------------------------------------------- */
    {
      id: "social-proof",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; max-width: 680px; margin: 0 auto; text-align: center;"><div><div style="font-size: 2.5rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #06B6D4; letter-spacing: -0.02em;">8,500+</div><div style="color: #64748B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.25rem;">Graduates</div></div><div><div style="font-size: 2.5rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #84CC16; letter-spacing: -0.02em;">4.9/5</div><div style="color: #64748B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.25rem;">Average Rating</div></div><div><div style="font-size: 2.5rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #06B6D4; letter-spacing: -0.02em;">94%</div><div style="color: #64748B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 0.25rem;">Job Placement</div></div></div>',
        alignment: "center",
        maxWidth: "780px",
      },
      style: {
        padding: "4rem 1.5rem",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Final CTA                                                        */
    /* ---------------------------------------------------------------- */
    {
      id: "cta-bottom",
      type: "CTAButton",
      props: {
        text: "Start Your Developer Journey",
        action: { type: "navigate", payload: { url: "/checkout" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "1rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        fontFamily: '"Sora", sans-serif',
        backgroundColor: "#0F172A",
      },
    },
  ],
};
