import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Wealth Academy — Professional finance/wealth management course template
 *
 * Design language: Clean, trustworthy, authoritative. Inspired by Wealthfront,
 * Betterment, Investopedia Academy, Bloomberg Education.
 *
 * Typography: Merriweather serif for headings (authority), Inter for body (clarity).
 * Palette: Navy (#0A1628) with gold (#C4A35A) accents, growth green (#2E7D32),
 *          light surface (#F5F5F7) for content areas.
 */
export const wealthAcademyTemplate: SDUIScreen = {
  id: "tpl-wealth-academy",
  name: "Wealth Academy",
  slug: "wealth-academy",
  description:
    "Professional finance course with portfolio insights, knowledge assessments, certificates, and trust-building design",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Professional, trust-first                                 */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Build Generational Wealth With Confidence",
        subtitle:
          "A comprehensive, CFA-informed curriculum that takes you from financial fundamentals to advanced portfolio management. No jargon, no hype — just proven strategies.",
        backgroundImage: "",
        ctaText: "Start Learning",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "left",
        overlayOpacity: 0.7,
      },
      style: {
        minHeight: "75vh",
        fontFamily: "Merriweather, serif",
        backgroundColor: "#0A1628",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Trust Bar — Credentials & Media Logos                            */
    /* ---------------------------------------------------------------- */
    {
      id: "trust",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 3rem; align-items: center; opacity: 0.7;"><div style="text-align: center;"><div style="font-size: 1.5rem; font-weight: 700; color: #C4A35A;">12,000+</div><div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #64748B;">Students Enrolled</div></div><div style="text-align: center;"><div style="font-size: 1.5rem; font-weight: 700; color: #C4A35A;">4.9/5</div><div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #64748B;">Average Rating</div></div><div style="text-align: center;"><div style="font-size: 1.5rem; font-weight: 700; color: #C4A35A;">94%</div><div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #64748B;">Completion Rate</div></div><div style="text-align: center;"><div style="font-size: 1.5rem; font-weight: 700; color: #C4A35A;">CFA</div><div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; color: #64748B;">Informed Curriculum</div></div></div>',
        alignment: "center",
        maxWidth: "900px",
      },
      style: {
        padding: "3rem 1.5rem",
        backgroundColor: "#0D1B2A",
        borderBottom: "1px solid rgba(196, 163, 90, 0.15)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  What You'll Learn                                                */
    /* ---------------------------------------------------------------- */
    {
      id: "overview",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Merriweather, serif; font-size: 1.75rem; color: #F8FAFC; margin-bottom: 1.5rem;">A Complete Financial Education</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;"><div style="padding: 1.5rem; border: 1px solid rgba(196,163,90,0.15); border-radius: 8px;"><div style="font-weight: 600; color: #C4A35A; margin-bottom: 0.5rem;">Personal Finance Mastery</div><div style="color: #94A3B8; font-size: 0.9rem; line-height: 1.6;">Budgeting, emergency funds, debt management, and the psychology of spending.</div></div><div style="padding: 1.5rem; border: 1px solid rgba(196,163,90,0.15); border-radius: 8px;"><div style="font-weight: 600; color: #C4A35A; margin-bottom: 0.5rem;">Investment Fundamentals</div><div style="color: #94A3B8; font-size: 0.9rem; line-height: 1.6;">Asset classes, diversification, risk assessment, and building your first portfolio.</div></div><div style="padding: 1.5rem; border: 1px solid rgba(196,163,90,0.15); border-radius: 8px;"><div style="font-weight: 600; color: #C4A35A; margin-bottom: 0.5rem;">Tax Strategy & Optimization</div><div style="color: #94A3B8; font-size: 0.9rem; line-height: 1.6;">Tax-advantaged accounts, capital gains strategies, and legal tax minimization.</div></div><div style="padding: 1.5rem; border: 1px solid rgba(196,163,90,0.15); border-radius: 8px;"><div style="font-weight: 600; color: #C4A35A; margin-bottom: 0.5rem;">Retirement & Estate Planning</div><div style="color: #94A3B8; font-size: 0.9rem; line-height: 1.6;">401(k), IRA optimization, Social Security timing, and wealth transfer strategies.</div></div></div>',
        alignment: "left",
        maxWidth: "860px",
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0A1628",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Curriculum                                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1: Financial Foundations",
            lessons: [
              { title: "The Psychology of Money", duration: "12:00", type: "video" },
              { title: "Building Your Financial Dashboard", duration: "15:00", type: "video" },
              { title: "Budgeting That Actually Works", duration: "18:00", type: "video" },
              { title: "Emergency Fund Calculator", duration: "5 min read", type: "text" },
              { title: "Financial Health Assessment", duration: "15 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 2: Investing Essentials",
            lessons: [
              { title: "Asset Classes Explained", duration: "20:00", type: "video" },
              { title: "Risk vs. Return: Finding Your Profile", duration: "16:00", type: "video" },
              { title: "Index Funds & ETFs: The Core Portfolio", duration: "22:00", type: "video" },
              { title: "Dollar-Cost Averaging Strategy", duration: "12:00", type: "video" },
              { title: "Portfolio Construction Workshop", duration: "8 min read", type: "text" },
              { title: "Investment Knowledge Check", duration: "20 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 3: Advanced Strategies",
            lessons: [
              { title: "Tax-Loss Harvesting & Capital Gains", duration: "18:00", type: "video" },
              { title: "Real Estate as an Asset Class", duration: "20:00", type: "video" },
              { title: "Alternative Investments: Private Equity, Crypto, Commodities", duration: "25:00", type: "video" },
              { title: "Factor Investing & Smart Beta", duration: "16:00", type: "video" },
              { title: "Advanced Assessment", duration: "20 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 4: Retirement & Legacy",
            lessons: [
              { title: "Retirement Number Calculator", duration: "14:00", type: "video" },
              { title: "401(k) & IRA Optimization", duration: "20:00", type: "video" },
              { title: "Social Security Timing Strategy", duration: "12:00", type: "video" },
              { title: "Estate Planning Fundamentals", duration: "18:00", type: "video" },
              { title: "Build Your Financial Plan", duration: "45 min", type: "assignment" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#0A1628",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Progress                                                         */
    /* ---------------------------------------------------------------- */
    {
      id: "progress",
      type: "ProgressBar",
      props: {
        label: "Course Completion",
        value: 0,
        showPercentage: true,
        color: "#C4A35A",
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
        backgroundColor: "#0A1628",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Instructor                                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Victoria Chen, CFA, CFP",
        avatar: "",
        bio: "Victoria spent 15 years on Wall Street — first at Goldman Sachs, then as a portfolio manager at a $2B fund — before leaving to democratize financial education. Her mission: make the wealth-building strategies of the top 1% accessible to everyone. She holds both the CFA charter and CFP designation, and has been featured in the Wall Street Journal, Bloomberg, and Forbes.",
        credentials: [
          "CFA Charterholder",
          "Certified Financial Planner",
          "15 Years Wall Street Experience",
          "Former Goldman Sachs VP",
          "Forbes Finance Council Member",
        ],
        socialLinks: [
          { platform: "linkedin", url: "https://linkedin.com" },
          { platform: "twitter", url: "https://twitter.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0D1B2A",
        borderTop: "1px solid rgba(196, 163, 90, 0.15)",
        borderBottom: "1px solid rgba(196, 163, 90, 0.15)",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Certificate                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "certificate",
      type: "CertificateDisplay",
      props: {
        courseName: "Wealth Academy — Comprehensive Financial Education",
        studentName: "Your Name Here",
        date: "",
        serial: "",
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
        backgroundColor: "#0A1628",
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
              "I wish I had this course 10 years ago. Victoria explains complex financial concepts in a way that actually makes sense. My portfolio is up 34% since I implemented her strategies.",
            name: "Michael Torres",
            role: "Engineer, Age 38",
            avatar: "",
          },
          {
            quote:
              "The tax strategy module alone saved me $8,000 last year. This isn't generic advice — it's actionable, specific, and backed by real data.",
            name: "Priya Sharma",
            role: "Physician, Age 45",
            avatar: "",
          },
          {
            quote:
              "I came in knowing nothing about investing. I now manage my own portfolio with confidence. The knowledge assessments after each module really cement the learning.",
            name: "Jordan Mitchell",
            role: "Teacher, Age 29",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "#0A1628" },
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
            name: "Essential",
            price: "$149",
            period: "one-time",
            features: [
              "All 4 modules (20+ hours)",
              "Knowledge assessments",
              "Downloadable workbooks",
              "Portfolio templates",
              "Certificate of completion",
            ],
            ctaText: "Enroll Now",
            highlighted: false,
          },
          {
            name: "Professional",
            price: "$299",
            period: "one-time",
            features: [
              "Everything in Essential",
              "Monthly live Q&A with Victoria",
              "Private investor community",
              "Financial plan review",
              "Tax strategy consultation",
              "Lifetime access + updates",
            ],
            ctaText: "Go Professional",
            highlighted: true,
          },
          {
            name: "Advisory",
            price: "$799",
            period: "one-time",
            features: [
              "Everything in Professional",
              "3x one-on-one advisory sessions",
              "Custom portfolio review",
              "Personalized financial roadmap",
              "Priority email support for 1 year",
            ],
            ctaText: "Get Advisory",
            highlighted: false,
          },
        ],
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#0A1628" },
    },

    /* ---------------------------------------------------------------- */
    /*  Guarantee + CTA                                                  */
    /* ---------------------------------------------------------------- */
    {
      id: "guarantee",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 600px; margin: 0 auto; padding: 2rem; border: 1px solid rgba(196,163,90,0.2); border-radius: 12px;"><h3 style="font-family: Merriweather, serif; font-size: 1.25rem; color: #F8FAFC; margin-bottom: 0.75rem;">60-Day Money-Back Guarantee</h3><p style="color: #94A3B8; font-size: 0.9rem; line-height: 1.7;">Your financial education should pay for itself. If you don\'t feel more confident about your financial future within 60 days, we\'ll refund your investment in full.</p></div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: { padding: "3rem 1.5rem 1rem", backgroundColor: "#0A1628" },
    },
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Begin Building Your Wealth",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0A1628",
      },
    },
  ],
};
