import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Creative Studio — Project-based creative/design course template
 *
 * Design language: Bold, expressive, colorful. Inspired by Domestika,
 * Skillshare creative, Dribbble Learning. The template itself is a
 * design piece.
 *
 * Typography: Space Grotesk for display (modern, geometric),
 *             Plus Jakarta Sans for body (contemporary, clean).
 * Palette: Neutral base (#FAFAFA light / #1A1A1A dark) with vibrant
 *          gradient accents: purple (#7B61FF) to blue (#00B4D8),
 *          coral (#FF6B6B) to amber (#FFB347).
 */
export const creativeStudioTemplate: SDUIScreen = {
  id: "tpl-creative-studio",
  name: "Creative Studio",
  slug: "creative-studio",
  description:
    "Project-based creative course with student gallery, skill progression, resource downloads, and expressive design",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Bold, colorful, the hero IS the design                    */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Design With Purpose",
        subtitle:
          "A project-based course that takes you from blank canvas to portfolio-ready work. Learn brand identity, layout systems, and visual storytelling through hands-on creative projects.",
        backgroundImage:
          "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1920&q=80&auto=format&fit=crop",
        ctaText: "Create Something Amazing",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "center",
        overlayOpacity: 0.5,
      },
      style: {
        minHeight: "85vh",
        fontFamily: "Space Grotesk, sans-serif",
        background: "linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Project Outcome Preview                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "outcomes",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Space Grotesk, sans-serif; font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 0.5rem;">What You\'ll Create</h2><p style="text-align: center; color: #9CA3AF; margin-bottom: 2.5rem; font-size: 1rem;">By the end of this course, you\'ll have 4 portfolio-ready projects</p><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 960px; margin: 0 auto;"><div style="aspect-ratio: 1; border-radius: 16px; background: linear-gradient(135deg, #7B61FF, #00B4D8); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">01</div><div style="font-size: 0.85rem; font-weight: 600;">Brand Identity System</div></div><div style="aspect-ratio: 1; border-radius: 16px; background: linear-gradient(135deg, #FF6B6B, #FFB347); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">02</div><div style="font-size: 0.85rem; font-weight: 600;">Editorial Layout</div></div><div style="aspect-ratio: 1; border-radius: 16px; background: linear-gradient(135deg, #00C9A7, #845EC2); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">03</div><div style="font-size: 0.85rem; font-weight: 600;">Web Design Concept</div></div><div style="aspect-ratio: 1; border-radius: 16px; background: linear-gradient(135deg, #F9F871, #FF6F91); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem; text-align: center; color: #1A1A1A;"><div style="font-size: 2rem; margin-bottom: 0.5rem;">04</div><div style="font-size: 0.85rem; font-weight: 600;">Social Media Campaign</div></div></div>',
        alignment: "center",
        maxWidth: "1000px",
      },
      style: {
        padding: "5rem 1.5rem",
        backgroundColor: "#1A1A1A",
        color: "#F5F5F5",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Course Stats                                                     */
    /* ---------------------------------------------------------------- */
    {
      id: "stats",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem; max-width: 800px; margin: 0 auto;"><div style="text-align: center;"><div style="font-size: 2rem; font-weight: 800; font-family: Space Grotesk, sans-serif; background: linear-gradient(90deg, #7B61FF, #00B4D8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">28</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #6B7280;">Lessons</div></div><div style="text-align: center;"><div style="font-size: 2rem; font-weight: 800; font-family: Space Grotesk, sans-serif; background: linear-gradient(90deg, #FF6B6B, #FFB347); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">4</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #6B7280;">Projects</div></div><div style="text-align: center;"><div style="font-size: 2rem; font-weight: 800; font-family: Space Grotesk, sans-serif; background: linear-gradient(90deg, #00C9A7, #845EC2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">12h</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #6B7280;">Content</div></div><div style="text-align: center;"><div style="font-size: 2rem; font-weight: 800; font-family: Space Grotesk, sans-serif; background: linear-gradient(90deg, #F9F871, #FF6F91); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">15+</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #6B7280;">Resources</div></div></div>',
        alignment: "center",
        maxWidth: "860px",
      },
      style: {
        padding: "3rem 1.5rem",
        backgroundColor: "#111111",
        borderTop: "1px solid #2A2A2A",
        borderBottom: "1px solid #2A2A2A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Curriculum — Project-based modules                               */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Unit 1 — Foundations of Visual Design",
            lessons: [
              { title: "Welcome: Your Creative Journey", duration: "5:00", type: "video" },
              { title: "Design Principles: Hierarchy, Balance, Contrast", duration: "18:00", type: "video" },
              { title: "Color Theory for Real Projects", duration: "22:00", type: "video" },
              { title: "Typography as a Design Tool", duration: "20:00", type: "video" },
              { title: "Composition & Grid Systems", duration: "16:00", type: "video" },
              { title: "Resource Pack: Grid Templates & Color Tools", duration: "download", type: "text" },
              { title: "Design Principles Quiz", duration: "10 questions", type: "quiz" },
            ],
          },
          {
            title: "Unit 2 — Project: Brand Identity System",
            lessons: [
              { title: "Client Brief & Mood Board Creation", duration: "15:00", type: "video" },
              { title: "Logo Design: From Sketch to Vector", duration: "30:00", type: "video" },
              { title: "Brand Color Palette & Typography Selection", duration: "20:00", type: "video" },
              { title: "Brand Guidelines Document", duration: "25:00", type: "video" },
              { title: "Mockup Presentation", duration: "18:00", type: "video" },
              { title: "Submit: Your Brand Identity System", duration: "portfolio piece", type: "assignment" },
            ],
          },
          {
            title: "Unit 3 — Project: Editorial & Layout Design",
            lessons: [
              { title: "Editorial Design Principles", duration: "15:00", type: "video" },
              { title: "Master Pages & Grid Setup", duration: "20:00", type: "video" },
              { title: "Working with Photography & Illustration", duration: "18:00", type: "video" },
              { title: "Typographic Hierarchy in Layouts", duration: "16:00", type: "video" },
              { title: "Print-Ready File Preparation", duration: "12:00", type: "video" },
              { title: "Submit: Your Editorial Spread", duration: "portfolio piece", type: "assignment" },
            ],
          },
          {
            title: "Unit 4 — Project: Web & Digital Design",
            lessons: [
              { title: "Responsive Design Thinking", duration: "18:00", type: "video" },
              { title: "Wireframing & User Flow", duration: "22:00", type: "video" },
              { title: "High-Fidelity Design in Figma", duration: "30:00", type: "video" },
              { title: "Interaction & Motion Design", duration: "20:00", type: "video" },
              { title: "Design System Components", duration: "25:00", type: "video" },
              { title: "Submit: Your Web Design Concept + Social Campaign", duration: "portfolio piece", type: "assignment" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#1A1A1A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Instructor / Creative Director                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Ava Lindström",
        avatar: "",
        bio: "Ava is an award-winning creative director with 12 years of experience working with brands like Nike, Airbnb, and Spotify. Her work has been featured in Communication Arts, Print Magazine, and AIGA 365. She believes design is not about decoration — it's about communication. Every pixel should have a purpose, every layout should tell a story.",
        credentials: [
          "ADC Young Guns Winner",
          "12 Years Creative Direction",
          "Worked with Nike, Airbnb, Spotify",
          "AIGA 365 Featured",
          "3,200+ Students Worldwide",
        ],
        socialLinks: [
          { platform: "dribbble", url: "https://dribbble.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "twitter", url: "https://twitter.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#111111",
        borderTop: "1px solid #2A2A2A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Badge Showcase — Skill Progression                               */
    /* ---------------------------------------------------------------- */
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          { name: "First Lesson", icon: "✏️", description: "Completed your first lesson", earned: false },
          { name: "Color Master", icon: "🎨", description: "Aced the color theory quiz", earned: false },
          { name: "Type Nerd", icon: "🔤", description: "Typography module complete", earned: false },
          { name: "Brand Builder", icon: "⚡", description: "Submitted brand identity project", earned: false },
          { name: "Layout Pro", icon: "📐", description: "Completed editorial design project", earned: false },
          { name: "Creative Graduate", icon: "🎓", description: "Finished all 4 projects", earned: false },
        ],
        columns: 3,
      },
      style: {
        maxWidth: "700px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
        backgroundColor: "#1A1A1A",
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
              "This course didn't just teach me tools — it taught me how to think like a designer. The project-based approach means I now have 4 portfolio pieces I'm genuinely proud of.",
            name: "Kai Nakamura",
            role: "Junior Designer, Tokyo",
            avatar: "",
          },
          {
            quote:
              "Ava's feedback on my brand identity project was worth the price of the course alone. She sees things I never would have noticed. My work improved dramatically.",
            name: "Sofia Ramirez",
            role: "Freelance Designer, Buenos Aires",
            avatar: "",
          },
          {
            quote:
              "I switched careers from accounting to design after this course. The structured projects gave me the confidence and portfolio I needed to land my first design role.",
            name: "Tom Bradford",
            role: "Career Changer, Now UX Designer",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "#1A1A1A" },
    },

    /* ---------------------------------------------------------------- */
    /*  Pricing                                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "pricing",
      type: "PricingTable",
      props: {
        plans: [
          {
            name: "Explorer",
            price: "$89",
            period: "one-time",
            features: [
              "All 28 video lessons",
              "4 project briefs with guides",
              "Downloadable resource packs",
              "Certificate of completion",
              "Community gallery access",
            ],
            ctaText: "Start Creating",
            highlighted: false,
          },
          {
            name: "Creator",
            price: "$179",
            period: "one-time",
            features: [
              "Everything in Explorer",
              "Personal project feedback from Ava",
              "Premium template library",
              "Monthly creative challenges",
              "Private Slack community",
              "Portfolio review session",
              "Lifetime updates",
            ],
            ctaText: "Become a Creator",
            highlighted: true,
          },
        ],
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#1A1A1A" },
    },

    /* ---------------------------------------------------------------- */
    /*  Final CTA                                                        */
    /* ---------------------------------------------------------------- */
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Start Your Creative Journey",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#1A1A1A",
      },
    },
  ],
};
