import type { SDUIScreen } from "@platform/sdui-schema";

export const courseLandingTemplate: SDUIScreen = {
  id: "tpl-course-landing",
  name: "Course Landing Page",
  slug: "course-landing",
  description: "Hero, curriculum, instructor bio, pricing, testimonials, CTA",
  sections: [
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Your Course Title",
        subtitle:
          "A compelling subtitle that tells prospective students what they'll gain from this course.",
        backgroundImage: "",
        ctaText: "Enroll Now",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "center",
        overlayOpacity: 0.45,
      },
    },
    {
      id: "intro",
      type: "TextBlock",
      props: {
        content:
          "<h2>What You'll Learn</h2><p>Describe the key outcomes and skills students will gain. Use bullet points, bold text, or short paragraphs to make it scannable and compelling.</p>",
        alignment: "center",
        maxWidth: "720px",
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1: Getting Started",
            lessons: [
              { title: "Welcome & Course Overview", duration: "5:00", type: "video" },
              { title: "Setting Up Your Environment", duration: "10:00", type: "video" },
              { title: "Foundational Concepts", duration: "8 min read", type: "text" },
            ],
          },
          {
            title: "Module 2: Core Skills",
            lessons: [
              { title: "Skill Building Exercise", duration: "15:00", type: "video" },
              { title: "Hands-On Practice", duration: "20:00", type: "video" },
              { title: "Knowledge Check", duration: "10 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 3: Advanced Techniques",
            lessons: [
              { title: "Deep Dive Session", duration: "22:00", type: "video" },
              { title: "Real-World Application", duration: "18:00", type: "video" },
              { title: "Final Assignment", duration: "30 min", type: "assignment" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Your Name",
        avatar: "",
        bio: "Share your story, experience, and what makes you the right person to teach this subject. Highlight your credentials, years of experience, and any notable achievements.",
        credentials: ["Your Credential", "Years of Experience", "Students Taught"],
        socialLinks: [],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "var(--sdui-color-surface)" },
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
              "All video lessons",
              "Downloadable resources",
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
        ],
      },
      style: { padding: "3rem 1.5rem" },
    },
    {
      id: "testimonials",
      type: "TestimonialCarousel",
      props: {
        autoplay: true,
        interval: 5000,
        testimonials: [
          {
            quote: "This course was exactly what I needed. Clear, practical, and well-structured.",
            name: "Student Name",
            role: "Role / Title",
            avatar: "",
          },
          {
            quote: "I went from complete beginner to feeling confident in just a few weeks.",
            name: "Student Name",
            role: "Role / Title",
            avatar: "",
          },
          {
            quote: "The best investment I've made in my education. Highly recommended!",
            name: "Student Name",
            role: "Role / Title",
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
        text: "Start Learning Today",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: { padding: "2rem 1.5rem", display: "flex", justifyContent: "center" },
    },
  ],
};
