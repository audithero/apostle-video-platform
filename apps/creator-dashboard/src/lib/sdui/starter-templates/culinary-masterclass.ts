import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Culinary Masterclass — Premium cooking/culinary course template
 *
 * Design language: Cinematic dark mode with warm food photography aesthetic.
 * Inspired by Masterclass, NYT Cooking, Domestika food courses.
 *
 * Typography: Serif display (Playfair Display) + clean sans (DM Sans)
 * Palette: Dark base (#1A1008) with terracotta (#C44D2A), amber (#D4923A),
 *          olive (#6B7F3E), wine (#722F37) accents.
 */
export const culinaryMasterclassTemplate: SDUIScreen = {
  id: "tpl-culinary-masterclass",
  name: "Culinary Masterclass",
  slug: "culinary-masterclass",
  description:
    "Cinematic cooking course with recipe cards, ingredient lists, chef profile, and step-by-step culinary instruction",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Cinematic Hero                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Master the Art of Italian Cooking",
        subtitle:
          "From handmade pasta to authentic regional sauces — learn the techniques behind Italy's most beloved dishes from a 3-star Michelin chef.",
        backgroundImage: "",
        ctaText: "Start Cooking",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "center",
        overlayOpacity: 0.55,
      },
      style: {
        minHeight: "85vh",
        fontFamily: '"Playfair Display", serif',
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Course Overview — What You'll Learn                              */
    /* ---------------------------------------------------------------- */
    {
      id: "overview",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Playfair Display, serif; font-size: 2rem; margin-bottom: 1rem;">What You\'ll Master</h2><p style="font-size: 1.1rem; line-height: 1.8; color: #B8A898;">This is not a recipe collection — it\'s a transformation. You\'ll learn the foundational techniques that separate home cooks from professionals. From knife skills to flavor building, from pasta doughs to reduction sauces, each lesson builds on the last to give you complete culinary confidence.</p><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2.5rem;"><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Playfair Display, serif; color: #D4923A;">24</div><div style="color: #8A7B6B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Video Lessons</div></div><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Playfair Display, serif; color: #D4923A;">12</div><div style="color: #8A7B6B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Original Recipes</div></div><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Playfair Display, serif; color: #D4923A;">6h</div><div style="color: #8A7B6B; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Total Content</div></div></div>',
        alignment: "center",
        maxWidth: "840px",
      },
      style: {
        padding: "5rem 1.5rem",
        backgroundColor: "#1A1008",
        color: "#F5E6D3",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Curriculum — Recipe-Lesson Modules                               */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Chapter 1 — The Foundation",
            lessons: [
              {
                title: "Welcome to My Kitchen",
                duration: "4:30",
                type: "video",
              },
              {
                title: "Essential Knife Skills: Brunoise to Chiffonade",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Building Flavor: The Holy Trinity of Italian Cooking",
                duration: "14:00",
                type: "video",
              },
              {
                title: "Kitchen Setup & Equipment Guide",
                duration: "6 min read",
                type: "text",
              },
              {
                title: "Knife Skills Assessment",
                duration: "8 questions",
                type: "quiz",
              },
            ],
          },
          {
            title: "Chapter 2 — Fresh Pasta Mastery",
            lessons: [
              {
                title: "The Perfect Egg Pasta Dough",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Rolling & Shaping: Tagliatelle, Pappardelle, Fettuccine",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Filled Pasta: Ravioli & Tortellini",
                duration: "28:00",
                type: "video",
              },
              {
                title: "Recipe: Cacio e Pepe",
                duration: "15:00",
                type: "video",
              },
              {
                title: "Ingredient Guide: Flour Types & Egg Selection",
                duration: "5 min read",
                type: "text",
              },
            ],
          },
          {
            title: "Chapter 3 — The Five Mother Sauces",
            lessons: [
              {
                title: "Tomato Sauce: From San Marzano to Sugo",
                duration: "16:00",
                type: "video",
              },
              {
                title: "Béchamel & Its Variations",
                duration: "12:00",
                type: "video",
              },
              {
                title: "Pesto: Beyond Basil",
                duration: "10:00",
                type: "video",
              },
              {
                title: "Reduction Sauces & Pan Sauces",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Sauce Pairing Assessment",
                duration: "12 questions",
                type: "quiz",
              },
            ],
          },
          {
            title: "Chapter 4 — Proteins & Mains",
            lessons: [
              {
                title: "Braising: Osso Buco & Ragù Bolognese",
                duration: "25:00",
                type: "video",
              },
              {
                title: "Seafood: Branzino, Calamari & Frutti di Mare",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Risotto: Technique, Not Just a Recipe",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Final Project: Create Your Own Italian Menu",
                duration: "45 min",
                type: "assignment",
              },
            ],
          },
        ],
        expandFirst: true,
      },
      style: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#1A1008",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Chef / Instructor Bio                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "chef",
      type: "InstructorBio",
      props: {
        name: "Chef Marco Rossi",
        avatar: "",
        bio: "Born in Bologna, trained in Modena, and refined in kitchens across Europe — Chef Marco brings 20 years of professional experience to every lesson. His philosophy is simple: great cooking starts with understanding ingredients, not memorizing recipes. He has cooked for heads of state, earned three Michelin stars, and now dedicates his time to passing his craft to the next generation.",
        credentials: [
          "3 Michelin Stars",
          "20 Years Professional Experience",
          "Former Head Chef, Osteria Francescana",
          "Author of 'The Italian Kitchen'",
        ],
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#221A0F",
        borderTop: "1px solid rgba(212, 146, 58, 0.2)",
        borderBottom: "1px solid rgba(212, 146, 58, 0.2)",
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
              "I've taken cooking classes before, but this is different. Chef Marco doesn't just show you what to do — he teaches you why. My pasta has never been better.",
            name: "Sarah Chen",
            role: "Home Cook, San Francisco",
            avatar: "",
          },
          {
            quote:
              "The knife skills module alone was worth the price. I cook faster, safer, and with so much more confidence now.",
            name: "James Okafor",
            role: "Food Blogger, London",
            avatar: "",
          },
          {
            quote:
              "My Italian grandmother would be proud. These are the real techniques, the real flavors. Nothing like generic cooking tutorials online.",
            name: "Maria Gonzalez",
            role: "Restaurant Owner, Madrid",
            avatar: "",
          },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#1A1008",
      },
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
            name: "Apprentice",
            price: "$79",
            period: "one-time",
            features: [
              "All 24 video lessons",
              "12 original recipe cards (PDF)",
              "Ingredient shopping lists",
              "Community forum access",
              "Mobile-friendly lessons",
            ],
            ctaText: "Start Learning",
            highlighted: false,
          },
          {
            name: "Chef's Table",
            price: "$149",
            period: "one-time",
            features: [
              "Everything in Apprentice",
              "Monthly live cooking Q&A with Chef Marco",
              "Printable technique reference cards",
              "Certificate of Completion",
              "Lifetime access + future updates",
              "Private Discord community",
            ],
            ctaText: "Join the Chef's Table",
            highlighted: true,
          },
          {
            name: "Private Kitchen",
            price: "$399",
            period: "one-time",
            features: [
              "Everything in Chef's Table",
              "Two 1-on-1 video sessions with Chef Marco",
              "Personalized menu consultation",
              "Custom recipe development",
              "VIP dinner event invitation",
            ],
            ctaText: "Book Your Spot",
            highlighted: false,
          },
        ],
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#1A1008" },
    },

    /* ---------------------------------------------------------------- */
    /*  Guarantee + Final CTA                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "guarantee",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 600px; margin: 0 auto;"><div style="font-size: 2.5rem; margin-bottom: 1rem;">🍳</div><h3 style="font-family: Playfair Display, serif; font-size: 1.5rem; color: #F5E6D3;">30-Day Money-Back Guarantee</h3><p style="color: #8A7B6B; line-height: 1.7; margin-top: 0.75rem;">If you don\'t feel more confident in the kitchen after 30 days, we\'ll refund every penny. No questions asked. We believe in this course that much.</p></div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: {
        padding: "3rem 1.5rem 1rem",
        backgroundColor: "#1A1008",
      },
    },
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Begin Your Culinary Journey",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#1A1008",
      },
    },
  ],
};
