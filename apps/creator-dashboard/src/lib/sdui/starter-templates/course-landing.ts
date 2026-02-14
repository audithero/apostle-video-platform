import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Digital Photography Masterclass — Premium photography course template
 *
 * Design language: Elegant editorial with cinematic depth.
 * Inspired by National Geographic, Annie Leibovitz MasterClass, Phlearn.
 *
 * Typography: Serif display (Cormorant Garamond) + clean sans (Source Sans Pro)
 * Palette: Deep navy (#0D1B2A), gold accent (#D4A853), warm gray (#8B8589),
 *          cream (#FAF8F5), charcoal text (#2C2C2C).
 */
export const courseLandingTemplate: SDUIScreen = {
  id: "tpl-course-landing",
  name: "Course Landing Page",
  slug: "course-landing",
  description:
    "Hero, curriculum, instructor bio, pricing, testimonials, CTA — Digital Photography Masterclass with Elena Vasquez",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Cinematic Hero                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "See the World Through a New Lens",
        subtitle:
          "From aperture to artistry — master the craft of digital photography with award-winning photographer Elena Vasquez. 32 lessons. Lifetime access. One transformative journey.",
        backgroundImage: "",
        ctaText: "Start Your Journey",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "center",
        overlayOpacity: 0.55,
      },
      style: {
        minHeight: "85vh",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#0D1B2A",
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
          '<h2 style="font-family: Cormorant Garamond, serif; font-size: 2rem; margin-bottom: 1rem; color: #FAF8F5;">What You\'ll Master</h2><p style="font-size: 1.1rem; line-height: 1.8; color: #8B8589;">This isn\'t a collection of camera tips — it\'s a complete transformation in how you see and capture the world. From understanding your camera\'s sensor to composing gallery-worthy images, each lesson builds your eye and your confidence behind the lens.</p><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2.5rem;"><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Cormorant Garamond, serif; color: #D4A853;">32</div><div style="color: #8B8589; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Video Lessons</div></div><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Cormorant Garamond, serif; color: #D4A853;">8h</div><div style="color: #8B8589; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Total Content</div></div><div style="text-align: center;"><div style="font-size: 2.5rem; font-family: Cormorant Garamond, serif; color: #D4A853;">4</div><div style="color: #8B8589; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em;">Hands-On Projects</div></div></div>',
        alignment: "center",
        maxWidth: "840px",
      },
      style: {
        padding: "5rem 1.5rem",
        backgroundColor: "#0D1B2A",
        color: "#FAF8F5",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Curriculum — Module Breakdown                                    */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1 — Camera Fundamentals",
            lessons: [
              {
                title: "Welcome: The Photographer's Mindset",
                duration: "6:00",
                type: "video",
              },
              {
                title: "Understanding Your Sensor: Full Frame vs. Crop",
                duration: "14:00",
                type: "video",
              },
              {
                title: "The Exposure Triangle: Aperture, Shutter Speed & ISO",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Metering Modes & When to Use Manual",
                duration: "16:00",
                type: "video",
              },
              {
                title: "Lens Selection Guide: Primes, Zooms & Specialty Glass",
                duration: "8 min read",
                type: "text",
              },
              {
                title: "Camera Settings Assessment",
                duration: "10 questions",
                type: "quiz",
              },
            ],
          },
          {
            title: "Module 2 — Composition & Light",
            lessons: [
              {
                title: "The Rule of Thirds and When to Break It",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Leading Lines, Framing & Visual Weight",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Understanding Light & Shadow",
                duration: "24:00",
                type: "video",
              },
              {
                title: "Golden Hour, Blue Hour & Harsh Light Techniques",
                duration: "16:00",
                type: "video",
              },
              {
                title: "Color Theory for Photographers",
                duration: "12:00",
                type: "video",
              },
              {
                title: "Project: The Light Study — 10 Photos in One Location",
                duration: "45 min",
                type: "assignment",
              },
            ],
          },
          {
            title: "Module 3 — Portrait Photography",
            lessons: [
              {
                title: "Posing Fundamentals: Directing Non-Models",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Natural Light Portraits: Window, Shade & Reflectors",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Studio Lighting: One-Light to Three-Light Setups",
                duration: "26:00",
                type: "video",
              },
              {
                title: "Environmental Portraits: Telling Stories with Context",
                duration: "14:00",
                type: "video",
              },
              {
                title: "Gear Checklist: Portrait Photography Essentials",
                duration: "5 min read",
                type: "text",
              },
              {
                title: "Project: Portrait Series — 5 Portraits, 5 Stories",
                duration: "60 min",
                type: "assignment",
              },
            ],
          },
          {
            title: "Module 4 — Post-Processing & Portfolio",
            lessons: [
              {
                title: "Lightroom Workflow: From Import to Export",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Color Grading: Building Your Signature Look",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Photoshop Essentials: Retouching, Composites & Cleanup",
                duration: "24:00",
                type: "video",
              },
              {
                title: "Batch Processing & Preset Creation",
                duration: "12:00",
                type: "video",
              },
              {
                title: "Building a Portfolio That Gets You Hired",
                duration: "15:00",
                type: "video",
              },
              {
                title: "Final Project: Curate Your 12-Image Portfolio",
                duration: "90 min",
                type: "assignment",
              },
              {
                title: "Final Assessment",
                duration: "15 questions",
                type: "quiz",
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
        backgroundColor: "#0D1B2A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Instructor Bio                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Elena Vasquez",
        avatar: "",
        bio: "Elena Vasquez has spent 15 years behind the lens, capturing everything from war-torn landscapes to intimate wedding moments. Her work has been published in National Geographic, TIME, and Vogue. A recipient of the International Photography Award and a Sony World Photography Awards finalist, Elena now channels her field experience into teaching the next generation of visual storytellers. She believes every great photograph starts with learning to truly see.",
        credentials: [
          "International Photography Award Winner",
          "15 Years Professional Experience",
          "Published in National Geographic & TIME",
          "Sony World Photography Awards Finalist",
        ],
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0F2237",
        borderTop: "1px solid rgba(212, 168, 83, 0.2)",
        borderBottom: "1px solid rgba(212, 168, 83, 0.2)",
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
              "I bought my first DSLR two years ago and never got past auto mode. Elena's course gave me the confidence to shoot full manual, and my family portraits now look like they belong in a magazine. The exposure triangle module alone changed everything.",
            name: "David Moreno",
            role: "Hobbyist Photographer, Austin, TX",
            avatar: "",
          },
          {
            quote:
              "As a travel blogger, I needed to up my photo game fast. The composition and light modules are incredible — my Instagram engagement tripled within a month of applying Elena's techniques. Worth every penny.",
            name: "Priya Sharma",
            role: "Travel Blogger & Content Creator, Toronto",
            avatar: "",
          },
          {
            quote:
              "I've been shooting weddings for five years, but Elena's portrait module taught me posing and lighting techniques I never learned on my own. My booking rate went up 40% after I updated my portfolio with what I learned here.",
            name: "Marcus Johansson",
            role: "Wedding Photographer, Stockholm",
            avatar: "",
          },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0D1B2A",
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
            name: "Hobbyist",
            price: "$69",
            period: "one-time",
            features: [
              "All 32 video lessons",
              "Downloadable cheat sheets & presets",
              "Community forum access",
              "Mobile-friendly lessons",
              "Lifetime access",
            ],
            ctaText: "Start Learning",
            highlighted: false,
          },
          {
            name: "Professional",
            price: "$149",
            period: "one-time",
            features: [
              "Everything in Hobbyist",
              "Monthly live critique sessions with Elena",
              "RAW files from every lesson for practice",
              "Certificate of Completion",
              "20 Lightroom presets — Elena's Signature Collection",
              "Private photographer community",
            ],
            ctaText: "Go Professional",
            highlighted: true,
          },
          {
            name: "Studio",
            price: "$349",
            period: "one-time",
            features: [
              "Everything in Professional",
              "Two 1-on-1 portfolio review sessions with Elena",
              "Personalized shooting assignment with feedback",
              "Business guide: pricing, contracts & client management",
              "Featured in Elena's Student Showcase gallery",
            ],
            ctaText: "Book Your Studio Pass",
            highlighted: false,
          },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0D1B2A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Guarantee                                                        */
    /* ---------------------------------------------------------------- */
    {
      id: "guarantee",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 600px; margin: 0 auto;"><div style="font-size: 2.5rem; margin-bottom: 1rem;">📷</div><h3 style="font-family: Cormorant Garamond, serif; font-size: 1.5rem; color: #FAF8F5;">30-Day Money-Back Guarantee</h3><p style="color: #8B8589; line-height: 1.7; margin-top: 0.75rem;">If you don\'t see a visible improvement in your photography within 30 days, we\'ll refund every penny — no questions, no awkward emails. We stand behind this course because Elena\'s methods work.</p></div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: {
        padding: "3rem 1.5rem 1rem",
        backgroundColor: "#0D1B2A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Final CTA                                                        */
    /* ---------------------------------------------------------------- */
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Begin Your Photography Journey",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0D1B2A",
      },
    },
  ],
};
