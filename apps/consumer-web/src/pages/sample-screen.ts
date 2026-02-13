import type { SDUIScreen } from "@platform/sdui-schema";

export const sampleScreen: SDUIScreen = {
  id: "sample-landing",
  name: "Sample Course Landing Page",
  slug: "sample-landing",
  sections: [
    {
      id: "hero-1",
      type: "HeroSection",
      props: {
        title: "Master Japanese Cooking",
        subtitle:
          "Learn authentic techniques from a Tokyo-trained chef in this comprehensive 12-module course.",
        backgroundImage:
          "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1600&h=900&fit=crop",
        ctaText: "Enroll Now",
        ctaAction: { type: "navigate", to: "/enroll" },
        alignment: "center",
        overlayOpacity: 0.5,
      },
    },
    {
      id: "intro-text",
      type: "TextBlock",
      props: {
        content:
          "<h2>What You'll Learn</h2><p>From knife skills to plating techniques, this course covers everything you need to create stunning Japanese dishes at home. Each lesson includes step-by-step video instruction, downloadable recipe cards, and practice assignments.</p>",
        alignment: "center",
        maxWidth: "720px",
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "video-preview",
      type: "VideoPlayer",
      props: {
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        poster: "",
        aspectRatio: "16/9",
        controls: true,
        autoplay: false,
      },
      style: { maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
    {
      id: "curriculum-section",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1: Foundations",
            lessons: [
              { title: "Japanese Knife Skills", duration: "12:30", type: "video" },
              { title: "Understanding Umami", duration: "8:15", type: "video" },
              { title: "Essential Ingredients Guide", duration: "5 min read", type: "text" },
            ],
          },
          {
            title: "Module 2: Sushi & Sashimi",
            lessons: [
              { title: "Perfect Sushi Rice", duration: "15:00", type: "video" },
              { title: "Nigiri Technique", duration: "18:45", type: "video" },
              { title: "Sashimi Cutting Methods", duration: "20:00", type: "video" },
              { title: "Module Quiz", duration: "10 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 3: Ramen Mastery",
            lessons: [
              { title: "Tonkotsu Broth (12-hour)", duration: "22:00", type: "video" },
              { title: "Handmade Noodles", duration: "16:30", type: "video" },
              { title: "Toppings & Assembly", duration: "14:00", type: "video" },
            ],
          },
        ],
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Chef Yuki Tanaka",
        avatar: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=200&h=200&fit=crop&crop=face",
        bio: "Chef Yuki trained for 10 years in Tokyo's finest restaurants before bringing authentic Japanese cuisine techniques to students worldwide. With over 50,000 students and a 4.9 star rating, her teaching style makes complex techniques accessible to home cooks.",
        credentials: [
          "Tokyo Culinary Academy Graduate",
          "10 Years Professional Experience",
          "50,000+ Students Taught",
        ],
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com" },
          { platform: "instagram", url: "https://instagram.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "var(--sdui-color-surface)" },
    },
    {
      id: "testimonials",
      type: "TestimonialCarousel",
      props: {
        autoplay: true,
        interval: 5000,
        testimonials: [
          {
            quote: "This course completely changed how I cook. The ramen module alone was worth the price!",
            name: "Sarah M.",
            role: "Home Cook",
            avatar: "",
          },
          {
            quote: "Chef Yuki explains everything so clearly. I went from takeout to making my own sushi in two weeks.",
            name: "James K.",
            role: "Food Enthusiast",
            avatar: "",
          },
          {
            quote: "The best online cooking course I've ever taken. Production quality is incredible.",
            name: "Maria L.",
            role: "Aspiring Chef",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "pricing",
      type: "PricingTable",
      props: {
        plans: [
          {
            name: "Basic",
            price: "$49",
            period: "one-time",
            features: [
              "12 video modules",
              "Recipe cards",
              "Community access",
            ],
            ctaText: "Get Basic",
            highlighted: false,
          },
          {
            name: "Premium",
            price: "$99",
            period: "one-time",
            features: [
              "Everything in Basic",
              "Live Q&A sessions",
              "Certificate of completion",
              "Lifetime updates",
            ],
            ctaText: "Get Premium",
            highlighted: true,
          },
          {
            name: "VIP",
            price: "$199",
            period: "one-time",
            features: [
              "Everything in Premium",
              "1-on-1 coaching call",
              "Private Discord channel",
              "Knife set included",
            ],
            ctaText: "Get VIP",
            highlighted: false,
          },
        ],
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "progress-demo",
      type: "ProgressBar",
      props: {
        value: 65,
        label: "Course Progress",
        showPercentage: true,
        color: "var(--sdui-color-primary)",
      },
      style: { maxWidth: "600px", margin: "0 auto", padding: "2rem 1.5rem" },
    },
    {
      id: "cta-bottom",
      type: "CTAButton",
      props: {
        text: "Start Learning Today",
        action: { type: "navigate", to: "/enroll" },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: { padding: "2rem 1.5rem", display: "flex", justifyContent: "center" },
    },
  ],
};
