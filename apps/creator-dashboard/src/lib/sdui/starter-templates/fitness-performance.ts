import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Fitness Performance — High-energy fitness/wellness course template
 *
 * Design language: Dark, neon-accented, high-energy. Inspired by Peloton,
 * Nike Training Club, Apple Fitness+. Motivational, movement-focused.
 *
 * Typography: Bold condensed sans-serif (Montserrat) for headlines,
 *             clean sans (Inter) for body.
 * Palette: Deep black (#0A0A0A) with neon green (#00FF87),
 *          electric coral (#FF6B6B), vivid purple (#7B61FF).
 */
export const fitnessPerformanceTemplate: SDUIScreen = {
  id: "tpl-fitness-performance",
  name: "Fitness Performance",
  slug: "fitness-performance",
  description:
    "High-energy fitness program with workout cards, streak tracking, progress rings, and motivational design",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Full-bleed action shot                                    */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "TRANSFORM YOUR BODY IN 8 WEEKS",
        subtitle:
          "A progressive training program designed by elite coaches. No gym required. Every level welcome.",
        backgroundImage:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80&auto=format&fit=crop",
        ctaText: "Start Training",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "center",
        overlayOpacity: 0.6,
      },
      style: {
        minHeight: "90vh",
        fontFamily: "Montserrat, sans-serif",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Program Stats                                                    */
    /* ---------------------------------------------------------------- */
    {
      id: "stats",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; max-width: 900px; margin: 0 auto;"><div style="text-align: center; padding: 2rem; border: 1px solid rgba(0,255,135,0.2); border-radius: 12px; background: rgba(0,255,135,0.05);"><div style="font-size: 2.5rem; font-weight: 800; color: #00FF87; font-family: Montserrat, sans-serif;">40</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-top: 0.25rem;">Workouts</div></div><div style="text-align: center; padding: 2rem; border: 1px solid rgba(255,107,107,0.2); border-radius: 12px; background: rgba(255,107,107,0.05);"><div style="font-size: 2.5rem; font-weight: 800; color: #FF6B6B; font-family: Montserrat, sans-serif;">8</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-top: 0.25rem;">Weeks</div></div><div style="text-align: center; padding: 2rem; border: 1px solid rgba(123,97,255,0.2); border-radius: 12px; background: rgba(123,97,255,0.05);"><div style="font-size: 2.5rem; font-weight: 800; color: #7B61FF; font-family: Montserrat, sans-serif;">5</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-top: 0.25rem;">Days / Week</div></div><div style="text-align: center; padding: 2rem; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: rgba(255,255,255,0.03);"><div style="font-size: 2.5rem; font-weight: 800; color: #FFF; font-family: Montserrat, sans-serif;">All</div><div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #888; margin-top: 0.25rem;">Levels</div></div></div>',
        alignment: "center",
        maxWidth: "960px",
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#0A0A0A" },
    },

    /* ---------------------------------------------------------------- */
    /*  Streak Counter                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "streak",
      type: "StreakCounter",
      props: {
        currentStreak: 0,
        longestStreak: 0,
      },
      style: {
        maxWidth: "400px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
        backgroundColor: "#0A0A0A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Progress Overview                                                */
    /* ---------------------------------------------------------------- */
    {
      id: "progress",
      type: "ProgressBar",
      props: {
        label: "Program Progress",
        value: 0,
        showPercentage: true,
        color: "#00FF87",
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#0A0A0A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Program Curriculum                                               */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Week 1-2 — Foundation Phase",
            lessons: [
              { title: "Day 1: Full Body Activation", duration: "25:00", type: "video" },
              { title: "Day 2: Upper Body Strength", duration: "30:00", type: "video" },
              { title: "Day 3: Active Recovery & Mobility", duration: "20:00", type: "video" },
              { title: "Day 4: Lower Body Power", duration: "30:00", type: "video" },
              { title: "Day 5: HIIT Cardio Burn", duration: "22:00", type: "video" },
              { title: "Nutrition Fundamentals", duration: "8 min read", type: "text" },
              { title: "Week 1 Check-In", duration: "5 questions", type: "quiz" },
            ],
          },
          {
            title: "Week 3-4 — Build Phase",
            lessons: [
              { title: "Day 1: Push Day — Chest & Shoulders", duration: "35:00", type: "video" },
              { title: "Day 2: Pull Day — Back & Biceps", duration: "35:00", type: "video" },
              { title: "Day 3: Yoga Flow & Recovery", duration: "25:00", type: "video" },
              { title: "Day 4: Legs & Core Blast", duration: "35:00", type: "video" },
              { title: "Day 5: Metabolic Conditioning", duration: "28:00", type: "video" },
              { title: "Meal Prep Guide", duration: "10 min read", type: "text" },
            ],
          },
          {
            title: "Week 5-6 — Intensity Phase",
            lessons: [
              { title: "Day 1: Supersets — Upper Body", duration: "40:00", type: "video" },
              { title: "Day 2: Supersets — Lower Body", duration: "40:00", type: "video" },
              { title: "Day 3: Recovery & Stretching", duration: "20:00", type: "video" },
              { title: "Day 4: Full Body Complex", duration: "38:00", type: "video" },
              { title: "Day 5: Tabata Finisher", duration: "25:00", type: "video" },
              { title: "Progress Assessment", duration: "10 questions", type: "quiz" },
            ],
          },
          {
            title: "Week 7-8 — Peak Performance",
            lessons: [
              { title: "Day 1: Max Effort Upper", duration: "45:00", type: "video" },
              { title: "Day 2: Max Effort Lower", duration: "45:00", type: "video" },
              { title: "Day 3: Active Recovery", duration: "20:00", type: "video" },
              { title: "Day 4: Total Body Challenge", duration: "42:00", type: "video" },
              { title: "Day 5: Final Fitness Test", duration: "30:00", type: "video" },
              { title: "Your Ongoing Training Plan", duration: "7 min read", type: "text" },
              { title: "Final Assessment: Submit Your Transformation", duration: "30 min", type: "assignment" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#0A0A0A",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Coach / Instructor                                               */
    /* ---------------------------------------------------------------- */
    {
      id: "coach",
      type: "InstructorBio",
      props: {
        name: "Coach Alex Rivera",
        avatar: "",
        bio: "Former collegiate athlete turned elite performance coach. Alex has trained Olympic hopefuls, NFL combine prep athletes, and everyday people looking to transform their fitness. His approach combines science-backed training with no-nonsense motivation — every rep has a purpose, every workout is a step forward.",
        credentials: [
          "CSCS Certified",
          "12 Years Coaching Experience",
          "10,000+ Students Trained",
          "Former D1 Athlete",
        ],
        socialLinks: [
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#111111",
        borderTop: "1px solid rgba(0,255,135,0.15)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Badges / Achievements                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          { name: "First Workout", icon: "💪", description: "Completed your first session", earned: false },
          { name: "7-Day Streak", icon: "🔥", description: "Trained 7 days in a row", earned: false },
          { name: "Phase 1 Complete", icon: "⭐", description: "Finished Foundation Phase", earned: false },
          { name: "Early Bird", icon: "🌅", description: "Worked out before 7am", earned: false },
          { name: "Iron Will", icon: "🏋️", description: "Never missed a scheduled workout", earned: false },
          { name: "Transformed", icon: "🏆", description: "Completed the full 8-week program", earned: false },
        ],
        columns: 3,
      },
      style: {
        maxWidth: "700px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
        backgroundColor: "#0A0A0A",
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
        interval: 5000,
        testimonials: [
          {
            quote:
              "I've tried dozens of online programs. This is the first one I actually finished. Coach Alex doesn't let you quit on yourself.",
            name: "David Kim",
            role: "Lost 22 lbs in 8 weeks",
            avatar: "",
          },
          {
            quote:
              "The progressive structure is genius. I never felt overwhelmed, but I was always challenged. Best shape of my life at 42.",
            name: "Rachel Torres",
            role: "Mother of 3, Accountant",
            avatar: "",
          },
          {
            quote:
              "No equipment needed, no excuses. I did every workout in my living room. The results speak for themselves.",
            name: "Marcus Johnson",
            role: "Gained 8 lbs lean muscle",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "#0A0A0A" },
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
            name: "Program Only",
            price: "$59",
            period: "one-time",
            features: [
              "40 HD workout videos",
              "8-week progressive program",
              "Nutrition fundamentals guide",
              "Mobile-optimized player",
              "Progress tracking",
            ],
            ctaText: "Start Training",
            highlighted: false,
          },
          {
            name: "All-Access",
            price: "$119",
            period: "one-time",
            features: [
              "Everything in Program Only",
              "Weekly live workout sessions",
              "Meal prep & nutrition plans",
              "Private community access",
              "Coach Q&A sessions",
              "Printable workout cards",
              "Lifetime updates",
            ],
            ctaText: "Get All-Access",
            highlighted: true,
          },
        ],
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#0A0A0A" },
    },

    /* ---------------------------------------------------------------- */
    /*  Final CTA                                                        */
    /* ---------------------------------------------------------------- */
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Start Your Transformation",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0A0A0A",
      },
    },
  ],
};
