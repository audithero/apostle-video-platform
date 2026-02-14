import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Certificate Gallery — Student achievement showcase
 *
 * Design language: Elegant, academic aesthetic with warm parchment tones.
 * Inspired by traditional diploma design, Credly, and Accredible.
 *
 * Typography: "Cormorant Garamond" serif for elegant, academic feel
 * Palette: Warm gold (#F5F0E8) base, deep green (#1B4332) primary,
 *          bronze (#CD7F32) accents, espresso (#3E2723) text.
 */
export const certificateGalleryTemplate: SDUIScreen = {
  id: "tpl-certificate-gallery",
  name: "Certificate Gallery",
  slug: "certificate-gallery",
  description:
    "Student achievement showcase with earned certificates, badge milestones, and academic-inspired design for Jordan Mitchell",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Gallery Heading                                                  */
    /* ---------------------------------------------------------------- */
    {
      id: "heading",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center;"><h1 style="font-family: Crimson Text, Georgia, serif; font-size: 2.75rem; font-weight: 700; color: #1B4332; margin-bottom: 0.75rem; letter-spacing: -0.01em;">Your Achievements</h1><p style="font-family: Nunito Sans, system-ui, sans-serif; font-size: 1.1rem; color: #5D4E37; line-height: 1.7;"><strong style="color: #CD7F32;">3 certificates</strong> earned, <strong style="color: #CD7F32;">4 badges</strong> unlocked</p><div style="width: 80px; height: 3px; background: linear-gradient(90deg, #CD7F32, #1B4332); margin: 1.5rem auto 0; border-radius: 2px;"></div></div>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "4rem 1.5rem 3rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Certificate 1 — Digital Photography Masterclass                  */
    /* ---------------------------------------------------------------- */
    {
      id: "certificate-1",
      type: "CertificateDisplay",
      props: {
        courseName: "Digital Photography Masterclass",
        studentName: "Jordan Mitchell",
        completedDate: "2025-01-15",
        certificateUrl: "",
      },
      style: {
        maxWidth: "640px",
        margin: "0 auto",
        padding: "0 1.5rem 2rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Certificate 2 — Complete Web Dev Bootcamp                        */
    /* ---------------------------------------------------------------- */
    {
      id: "certificate-2",
      type: "CertificateDisplay",
      props: {
        courseName: "Complete Web Dev Bootcamp",
        studentName: "Jordan Mitchell",
        completedDate: "2025-03-22",
        certificateUrl: "",
      },
      style: {
        maxWidth: "640px",
        margin: "0 auto",
        padding: "0 1.5rem 2rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Certificate 3 — UX Design Foundations                            */
    /* ---------------------------------------------------------------- */
    {
      id: "certificate-3",
      type: "CertificateDisplay",
      props: {
        courseName: "UX Design Foundations",
        studentName: "Jordan Mitchell",
        completedDate: "2024-11-08",
        certificateUrl: "",
      },
      style: {
        maxWidth: "640px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
        borderBottom: "1px solid rgba(205, 127, 50, 0.2)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Badges Heading                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "badges-heading",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center;"><h2 style="font-family: Crimson Text, Georgia, serif; font-size: 2rem; font-weight: 700; color: #1B4332; margin-bottom: 0.5rem;">Badges & Milestones</h2><p style="font-family: Nunito Sans, system-ui, sans-serif; color: #5D4E37; line-height: 1.6;">You\'re making incredible progress, Jordan. Two more badges to go — keep pushing!</p></div>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "3rem 1.5rem 1.5rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Badge Showcase                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          {
            name: "Course Graduate",
            icon: "GraduationCap",
            description: "Completed a full course",
            earned: true,
          },
          {
            name: "Quiz Master",
            icon: "CheckCircle",
            description: "Scored 100% on 3 quizzes",
            earned: true,
          },
          {
            name: "Fast Learner",
            icon: "Zap",
            description: "Completed a course in under a week",
            earned: true,
          },
          {
            name: "Dedicated",
            icon: "Flame",
            description: "Maintained a 30-day learning streak",
            earned: true,
          },
          {
            name: "7-Day Streak",
            icon: "Calendar",
            description: "Study every day for 7 consecutive days",
            earned: false,
          },
          {
            name: "All-Star",
            icon: "Star",
            description: "Earn every available badge",
            earned: false,
          },
        ],
      },
      style: {
        maxWidth: "820px",
        margin: "0 auto",
        padding: "0 1.5rem 2rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Motivational CTA                                                 */
    /* ---------------------------------------------------------------- */
    {
      id: "continue-learning",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 500px; margin: 0 auto; padding: 2rem; border: 1px solid rgba(27, 67, 50, 0.15); border-radius: 12px; background: rgba(27, 67, 50, 0.04);"><p style="font-family: Crimson Text, Georgia, serif; font-size: 1.25rem; color: #1B4332; font-style: italic; margin-bottom: 0.5rem;">"The expert in anything was once a beginner."</p><p style="font-family: Nunito Sans, system-ui, sans-serif; color: #8B7355; font-size: 0.9rem;">Keep learning to unlock the remaining badges and add more certificates to your collection.</p></div>',
        alignment: "center",
        maxWidth: "640px",
      },
      style: {
        padding: "1rem 1.5rem 4rem",
        fontFamily: '"Cormorant Garamond", serif',
        backgroundColor: "#F5F0E8",
      },
    },
  ],
};
