import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Trading Mastery — Active trading/investing course template
 *
 * Design language: Data-rich dark terminal aesthetic. Inspired by TradingView,
 * tastytrade, Bloomberg Terminal education, TD Ameritrade thinkorswim.
 *
 * Typography: JetBrains Mono for data, Inter for instructional content.
 * Palette: Deep dark (#0D1117) with bullish green (#00C853),
 *          bearish red (#FF1744), accent blue (#2196F3).
 */
export const tradingMasteryTemplate: SDUIScreen = {
  id: "tpl-trading-mastery",
  name: "Trading Mastery",
  slug: "trading-mastery",
  description:
    "Data-driven trading course with strategy cards, risk/reward diagrams, paper trading concepts, and terminal-inspired design",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Hero — Dark terminal aesthetic                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "hero",
      type: "HeroSection",
      props: {
        title: "Master Options Trading",
        subtitle:
          "From covered calls to iron condors — learn systematic options strategies used by professional traders. Data-driven. Risk-managed. Consistently profitable.",
        backgroundImage: "",
        ctaText: "Start Trading Course",
        ctaAction: { type: "navigate", payload: { url: "/enroll" } },
        alignment: "left",
        overlayOpacity: 0.75,
      },
      style: {
        minHeight: "80vh",
        backgroundColor: "#0D1117",
        fontFamily: "Inter, system-ui, sans-serif",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Market Stats Bar                                                 */
    /* ---------------------------------------------------------------- */
    {
      id: "stats",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 2rem; padding: 1rem 0; font-family: JetBrains Mono, monospace; font-size: 0.8rem;"><div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #8B949E;">Strategies Covered</span><span style="color: #00C853; font-weight: 600;">15+</span></div><div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #8B949E;">Video Hours</span><span style="color: #2196F3; font-weight: 600;">18h</span></div><div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #8B949E;">Practice Trades</span><span style="color: #00C853; font-weight: 600;">50+</span></div><div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #8B949E;">Win Rate (Paper)</span><span style="color: #00C853; font-weight: 600;">72%</span></div><div style="display: flex; align-items: center; gap: 0.5rem;"><span style="color: #8B949E;">Student Rating</span><span style="color: #FFD600; font-weight: 600;">4.8</span></div></div>',
        alignment: "center",
        maxWidth: "960px",
      },
      style: {
        padding: "1.5rem",
        backgroundColor: "#161B22",
        borderTop: "1px solid #21262D",
        borderBottom: "1px solid #21262D",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Strategy Overview Cards                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "strategies",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-size: 1.5rem; font-weight: 600; color: #F0F6FC; margin-bottom: 2rem; text-align: center;">Strategies You\'ll Master</h2><div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; max-width: 960px; margin: 0 auto;"><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #00C853; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Bullish</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">Covered Calls</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Generate income from stocks you already own. Limited upside, consistent premium collection.</div></div><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #00C853; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Bullish</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">Cash-Secured Puts</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Get paid to buy stocks at your target price. The foundation of income investing.</div></div><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #2196F3; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Neutral</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">Iron Condors</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Profit from low-volatility environments. Defined risk, consistent probability.</div></div><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #FF1744; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Bearish</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">Put Spreads</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Defined-risk bearish bets. Cap your losses, profit from downside moves.</div></div><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #2196F3; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Volatility</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">Strangles</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Trade volatility itself, not direction. Profit from big moves either way.</div></div><div style="padding: 1.25rem; border: 1px solid #21262D; border-radius: 8px; background: #161B22;"><div style="color: #FFD600; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 0.5rem;">Advanced</div><div style="color: #F0F6FC; font-weight: 600; margin-bottom: 0.5rem;">The Wheel Strategy</div><div style="color: #8B949E; font-size: 0.8rem; line-height: 1.5;">Systematic income: sell puts, get assigned, sell calls. The complete income cycle.</div></div></div>',
        alignment: "center",
        maxWidth: "1000px",
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#0D1117",
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
            title: "Module 1: Options Foundations",
            lessons: [
              { title: "What Are Options? Calls & Puts Explained", duration: "15:00", type: "video" },
              { title: "The Greeks: Delta, Gamma, Theta, Vega", duration: "22:00", type: "video" },
              { title: "Reading an Options Chain", duration: "18:00", type: "video" },
              { title: "Intrinsic vs. Extrinsic Value", duration: "12:00", type: "video" },
              { title: "Platform Setup & Paper Trading Account", duration: "10 min read", type: "text" },
              { title: "Options Fundamentals Quiz", duration: "20 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 2: Income Strategies",
            lessons: [
              { title: "Covered Calls: The Basics", duration: "20:00", type: "video" },
              { title: "Selecting Optimal Strike Prices", duration: "18:00", type: "video" },
              { title: "Cash-Secured Puts for Income", duration: "20:00", type: "video" },
              { title: "The Wheel Strategy Deep Dive", duration: "25:00", type: "video" },
              { title: "Paper Trade: Run The Wheel for 4 Weeks", duration: "ongoing", type: "assignment" },
            ],
          },
          {
            title: "Module 3: Spread Strategies",
            lessons: [
              { title: "Vertical Spreads: Bull Call, Bear Put", duration: "22:00", type: "video" },
              { title: "Iron Condors & Iron Butterflies", duration: "25:00", type: "video" },
              { title: "Calendar & Diagonal Spreads", duration: "20:00", type: "video" },
              { title: "Position Sizing & Risk Management", duration: "18:00", type: "video" },
              { title: "Spread Strategy Assessment", duration: "15 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 4: Advanced & Volatility Trading",
            lessons: [
              { title: "Understanding Implied Volatility", duration: "20:00", type: "video" },
              { title: "Trading Earnings Announcements", duration: "22:00", type: "video" },
              { title: "Strangles & Straddles", duration: "18:00", type: "video" },
              { title: "Portfolio Management & Adjustment", duration: "25:00", type: "video" },
              { title: "Building Your Trading Plan", duration: "45 min", type: "assignment" },
              { title: "Final Comprehensive Exam", duration: "30 questions", type: "quiz" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: {
        maxWidth: "860px",
        margin: "0 auto",
        padding: "0 1.5rem 4rem",
        backgroundColor: "#0D1117",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Progress                                                         */
    /* ---------------------------------------------------------------- */
    {
      id: "progress",
      type: "ProgressBar",
      props: {
        label: "Course Progress",
        value: 0,
        showPercentage: true,
        color: "#00C853",
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1.5rem 3rem",
        backgroundColor: "#0D1117",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Instructor                                                       */
    /* ---------------------------------------------------------------- */
    {
      id: "instructor",
      type: "InstructorBio",
      props: {
        name: "Ryan Nakamura",
        avatar: "",
        bio: "Ryan has been an active options trader for 14 years, managing a personal portfolio that has consistently outperformed the market through systematic, probability-based strategies. Former derivatives analyst at a proprietary trading firm, he left the institutional world to teach what he knows. His approach is analytical, not emotional — every trade has a thesis, a risk plan, and a defined outcome.",
        credentials: [
          "14 Years Active Trading",
          "Series 7 & 63 Licensed",
          "Former Prop Firm Analyst",
          "$2M+ Personal Portfolio",
          "8,500+ Students Taught",
        ],
        socialLinks: [
          { platform: "twitter", url: "https://twitter.com" },
          { platform: "youtube", url: "https://youtube.com" },
        ],
      },
      style: {
        padding: "4rem 1.5rem",
        backgroundColor: "#161B22",
        borderTop: "1px solid #21262D",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Leaderboard                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "leaderboard",
      type: "LeaderboardWidget",
      props: {
        title: "Top Paper Traders This Month",
        timeframe: "monthly",
        entries: [
          { rank: 1, name: "TraderMike", avatar: "", points: 12450 },
          { rank: 2, name: "OptionsQueen", avatar: "", points: 11200 },
          { rank: 3, name: "ThetaGang", avatar: "", points: 10890 },
          { rank: 4, name: "IronCondorKing", avatar: "", points: 9750 },
          { rank: 5, name: "WheelRunner", avatar: "", points: 9200 },
        ],
      },
      style: {
        maxWidth: "600px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
        backgroundColor: "#0D1117",
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
              "Finally, a trading course that focuses on risk management first. Ryan's probability-based approach changed how I think about every trade.",
            name: "Derek Patel",
            role: "Part-time Trader, Software Engineer",
            avatar: "",
          },
          {
            quote:
              "I was losing money trading before this course. Now I have a system. The paper trading assignments forced me to be disciplined before risking real capital.",
            name: "Lisa Chang",
            role: "Full-time Trader, 2 Years",
            avatar: "",
          },
          {
            quote:
              "The Greeks module is the clearest explanation I've ever seen. I finally understand theta decay and how to make it work for me instead of against me.",
            name: "Robert Williams",
            role: "Retired, Managing Own Portfolio",
            avatar: "",
          },
        ],
      },
      style: { padding: "3rem 1.5rem", backgroundColor: "#0D1117" },
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
            name: "Self-Study",
            price: "$199",
            period: "one-time",
            features: [
              "All 4 modules (18+ hours)",
              "Paper trading assignments",
              "Strategy reference cards",
              "Options calculator tools",
              "Knowledge assessments",
            ],
            ctaText: "Start Learning",
            highlighted: false,
          },
          {
            name: "Trading Desk",
            price: "$399",
            period: "one-time",
            features: [
              "Everything in Self-Study",
              "Weekly live market analysis",
              "Real-time trade alerts (paper)",
              "Private trading community",
              "Monthly P&L review sessions",
              "Lifetime access",
            ],
            ctaText: "Join the Desk",
            highlighted: true,
          },
        ],
      },
      style: { padding: "4rem 1.5rem", backgroundColor: "#0D1117" },
    },

    /* ---------------------------------------------------------------- */
    /*  Risk Disclaimer + CTA                                            */
    /* ---------------------------------------------------------------- */
    {
      id: "disclaimer",
      type: "TextBlock",
      props: {
        content:
          '<div style="text-align: center; max-width: 600px; margin: 0 auto; font-size: 0.75rem; color: #484F58; line-height: 1.6; border: 1px solid #21262D; border-radius: 8px; padding: 1.5rem;"><strong style="color: #8B949E;">Risk Disclosure:</strong> Options trading involves substantial risk and is not suitable for all investors. This course is for educational purposes only. Past performance does not guarantee future results. Always paper trade before risking real capital.</div>',
        alignment: "center",
        maxWidth: "720px",
      },
      style: { padding: "3rem 1.5rem 1rem", backgroundColor: "#0D1117" },
    },
    {
      id: "cta-final",
      type: "CTAButton",
      props: {
        text: "Start Your Trading Education",
        action: { type: "navigate", payload: { url: "/enroll" } },
        variant: "primary",
        size: "lg",
        fullWidth: false,
      },
      style: {
        padding: "2rem 1.5rem 5rem",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#0D1117",
      },
    },
  ],
};
