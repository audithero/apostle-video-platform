import { type CSSProperties } from "react";

const display = "'Space Grotesk', sans-serif";
const bodyFont = "'Plus Jakarta Sans', sans-serif";
const bg = "#1A1A1A";
const purple = "#7B61FF";
const cyan = "#00B4D8";
const coral = "#FF6B6B";
const amber = "#FFB347";
const glassBg = "rgba(255,255,255,0.03)";
const glassBorder = "rgba(255,255,255,0.05)";
const textSub = "rgba(255,255,255,0.5)";
const textBody = "rgba(255,255,255,0.6)";

const page: CSSProperties = { minHeight: "100vh", background: bg, color: "#FAFAFA", fontFamily: bodyFont, position: "relative", overflow: "hidden" };
const glass: CSSProperties = { background: glassBg, border: `1px solid ${glassBorder}` };
const sectionWrap: CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: "0 24px", marginBottom: 128 };
const h2Style: CSSProperties = { fontFamily: display, fontSize: 36, fontWeight: 700, marginBottom: 16 };
const gradientPrimary = `linear-gradient(135deg, ${purple} 0%, ${cyan} 100%)`;
const gradientSecondary = `linear-gradient(135deg, ${coral} 0%, ${amber} 100%)`;

const skills = [
  { label: "Advanced Figma", icon: "\u25CB", color: purple },
  { label: "Brand Strategy", icon: "\u25C6", color: coral },
  { label: "Interface Design", icon: "\u25A1", color: cyan },
  { label: "Rapid Prototyping", icon: "\u26A1", color: amber },
  { label: "Webflow Build", icon: "\u25A0", color: purple },
  { label: "Motion Systems", icon: "\u25B3", color: cyan },
];

const outcomes = [
  { stat: "300%", title: "Conversion Lift", desc: "Learn to design interfaces that don't just look pretty, but drive measurable business results through UX psychology.", color: purple, borderColor: purple },
  { stat: "$120K+", title: "Average Salary", desc: "Our graduates consistently secure high-paying roles at top-tier design studios and tech giants like Airbnb and Stripe.", color: coral, borderColor: coral },
  { stat: "Portfolio", title: "World-Class Deck", desc: "Leave with a high-fidelity portfolio consisting of 4 market-ready projects that stand out to the top 1% of recruiters.", color: cyan, borderColor: cyan },
  { stat: "0-1", title: "Brand Logic", desc: "Master the art of taking a brand from a simple concept to a fully-fleshed identity system with scalability in mind.", color: amber, borderColor: amber },
];

const curriculum = [
  { num: "01", title: "The Visual Core: Mastery of Form & Space", color: purple },
  { num: "02", title: "UX Architecture & Interaction Logic", color: cyan },
  { num: "03", title: "Design Systems: Scalable Component Thinking", color: coral },
  { num: "04", title: "The Pitch: Portfolio Storytelling & Branding", color: amber },
];

const testimonials = [
  { text: "Ava's approach to design systems completely changed how I think about modularity. I landed my dream role at a fintech startup mid-way through the course.", name: "Sarah Jenkins", role: "Senior Designer at Revolut", avatar: "https://i.pravatar.cc/100?u=1", quoteColor: purple },
  { text: "The most intensive but rewarding 3 months of my career. The portfolio review alone is worth the price of admission. It's brutal, but necessary.", name: "Marcus Thorne", role: "Product Design Lead", avatar: "https://i.pravatar.cc/100?u=2", quoteColor: cyan },
  { text: "Finally a course that doesn't just teach the tools, but teaches the 'why' behind great design. Ava is a master of her craft and an incredible mentor.", name: "Lila Rossi", role: "Freelance Brand Designer", avatar: "https://i.pravatar.cc/100?u=3", quoteColor: coral },
];

const pricingFeatures1 = ["48+ HD Video Lessons", "Figma Workspace Kit", "Project Brief Templates", "Lifetime Updates"];
const pricingFeatures2 = ["Everything in Essential", "Weekly Live Reviews with Ava", "1-on-1 Portfolio Audit", "Job Placement Support", "Exclusive Talent Pool Access"];

export default function CreativePreview() {
  return (
    <div style={page}>
      {/* Mesh background blurs */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: gradientPrimary, filter: "blur(120px)", opacity: 0.15, top: -200, left: -200, zIndex: 0 }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: gradientSecondary, filter: "blur(120px)", opacity: 0.15, bottom: -200, right: -200, zIndex: 0 }} />

      {/* Header */}
      <header style={{ position: "fixed", top: 0, width: "100%", zIndex: 50, ...glass, borderBottom: `1px solid rgba(255,255,255,0.05)`, backdropFilter: "blur(10px)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 40, background: gradientPrimary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>A</div>
            <span style={{ fontFamily: display, fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>AVA LINDSTROM</span>
          </div>
          <nav style={{ display: "flex", gap: 32 }}>
            {["Work", "Curriculum", "About", "Enroll"].map((l) => (
              <span key={l} style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{l}</span>
            ))}
          </nav>
          <span style={{ padding: "10px 24px", borderRadius: 999, background: gradientPrimary, fontSize: 14, fontWeight: 700 }}>Get Started</span>
        </div>
      </header>

      {/* Hero */}
      <main style={{ paddingTop: 128, paddingBottom: 80, position: "relative", zIndex: 1 }}>
        <section style={{ ...sectionWrap, marginBottom: 128 }}>
          <div style={{ maxWidth: 800 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 999, ...glass, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em", marginBottom: 24 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: cyan, display: "inline-block" }} />
              Master Class Now Open
            </div>
            <h1 style={{ fontFamily: display, fontSize: 80, fontWeight: 700, lineHeight: 1.05, marginBottom: 32 }}>
              Transform your{" "}
              <span style={{ background: gradientPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontStyle: "italic" }}>creative vision</span>
              {" "}into professional reality.
            </h1>
            <p style={{ fontSize: 20, color: textBody, maxWidth: 640, lineHeight: 1.6, marginBottom: 40 }}>A intensive 12-week design program for visionaries who want to bridge the gap between technical skill and high-end conceptual execution.</p>
            <div style={{ display: "flex", gap: 16 }}>
              <span style={{ padding: "16px 32px", borderRadius: 12, background: gradientPrimary, color: "#fff", fontWeight: 700, fontSize: 18 }}>Secure Your Spot \u2192</span>
              <span style={{ padding: "16px 32px", borderRadius: 12, ...glass, border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 18 }}>View Syllabus</span>
            </div>
          </div>
          {/* Skill chips */}
          <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {skills.map((s) => (
              <div key={s.label} style={{ ...glass, padding: 16, borderRadius: 16, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20, color: s.color }}>{s.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Program Outcomes */}
        <section style={sectionWrap}>
          <h2 style={h2Style}>Program Outcomes</h2>
          <p style={{ color: textSub, marginBottom: 48 }}>Expect more than just a certificate. Expect a complete career pivot.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {outcomes.map((o) => (
              <div key={o.title} style={{ ...glass, padding: 32, borderRadius: 24, borderLeft: `4px solid ${o.borderColor}` }}>
                <div style={{ fontFamily: display, fontSize: 48, fontWeight: 700, color: o.color, marginBottom: 16 }}>{o.stat}</div>
                <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{o.title}</h3>
                <p style={{ color: textBody, lineHeight: 1.6 }}>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Instructor */}
        <section style={sectionWrap}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -16, background: gradientPrimary, opacity: 0.2, filter: "blur(30px)", borderRadius: 24 }} />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80"
                alt="Ava Lindstrom, design instructor"
                style={{ position: "relative", width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 24, filter: "grayscale(100%)" }}
              />
            </div>
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, background: gradientPrimary, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", textTransform: "uppercase" as const, letterSpacing: "0.2em", marginBottom: 16 }}>The Instructor</h2>
              <h3 style={{ fontFamily: display, fontSize: 44, fontWeight: 700, marginBottom: 24 }}>Meet Ava Lindstrom</h3>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 16 }}>With over 12 years of experience leading design at major tech hubs in Stockholm and New York, Ava brings a unique blend of Nordic minimalism and high-impact American marketing logic.</p>
              <p style={{ fontSize: 17, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 32 }}>She has worked with clients ranging from early-stage YC startups to Fortune 500 companies, winning 3 Awwwards and a Red Dot along the way.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <div style={{ ...glass, padding: 24, borderRadius: 16 }}>
                  <div style={{ fontFamily: display, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>12+</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Years Experience</div>
                </div>
                <div style={{ ...glass, padding: 24, borderRadius: 16 }}>
                  <div style={{ fontFamily: display, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>400+</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Designers Mentored</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", marginBottom: 128 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={h2Style}>The 12-Week Curriculum</h2>
            <p style={{ color: textSub }}>A rigorous journey through the modern design stack.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {curriculum.map((c) => (
              <div key={c.num} style={{ ...glass, padding: 24, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                  <span style={{ fontFamily: display, fontSize: 36, fontWeight: 700, color: "rgba(255,255,255,0.1)" }}>{c.num}</span>
                  <h4 style={{ fontSize: 18, fontWeight: 700 }}>{c.title}</h4>
                </div>
                <span style={{ fontSize: 20, color: "rgba(255,255,255,0.3)" }}>\u25BC</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section style={sectionWrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ ...glass, padding: 32, borderRadius: 24, position: "relative" }}>
                <div style={{ color: t.quoteColor, fontSize: 48, marginBottom: 24, lineHeight: 1 }}>\u201C</div>
                <p style={{ fontSize: 17, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", marginBottom: 32, fontStyle: "italic" }}>{t.text}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <img src={t.avatar} alt={`${t.name}, course graduate`} style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section style={{ maxWidth: 960, margin: "0 auto", padding: "0 24px", marginBottom: 128 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: display, fontSize: 48, fontWeight: 700, marginBottom: 16 }}>Choose Your Journey</h2>
            <p style={{ color: textSub }}>Both tiers include lifetime community access and asset packs.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
            {/* Essential */}
            <div style={{ ...glass, padding: 40, borderRadius: 24, border: "1px solid rgba(255,255,255,0.1)" }}>
              <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>The Essential</h3>
              <p style={{ color: textSub, marginBottom: 32 }}>Self-paced learning for independent spirits.</p>
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontFamily: display, fontSize: 48, fontWeight: 700 }}>$499</span>
                <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>USD</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px" }}>
                {pricingFeatures1.map((f) => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ color: cyan }}>\u2713</span><span>{f}</span>
                  </li>
                ))}
              </ul>
              <div style={{ width: "100%", padding: "16px 0", textAlign: "center", borderRadius: 12, ...glass, border: "1px solid rgba(255,255,255,0.1)", fontWeight: 700 }}>Enroll Now</div>
            </div>

            {/* Masterclass */}
            <div style={{ padding: 4, borderRadius: 24, background: gradientPrimary, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
              <div style={{ background: bg, height: "100%", width: "100%", padding: 40, borderRadius: 22, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 700 }}>The Masterclass</h3>
                  <span style={{ padding: "4px 12px", borderRadius: 999, background: gradientSecondary, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>Most Popular</span>
                </div>
                <p style={{ color: textSub, marginBottom: 32 }}>High-touch mentorship for rapid growth.</p>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontFamily: display, fontSize: 48, fontWeight: 700 }}>$999</span>
                  <span style={{ color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>USD</span>
                </div>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 40px", flex: 1 }}>
                  {pricingFeatures2.map((f) => (
                    <li key={f} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                      <span style={{ color: purple }}>\u2713</span><span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ width: "100%", padding: "16px 0", textAlign: "center", borderRadius: 12, background: gradientPrimary, fontWeight: 700 }}>Enroll Now</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "48px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 32, height: 32, background: gradientPrimary, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>A</div>
            <span style={{ fontFamily: display, fontSize: 17, fontWeight: 700 }}>AVA LINDSTROM</span>
          </div>
          <div style={{ display: "flex", gap: 32, color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            {["Twitter", "Dribbble", "LinkedIn", "Instagram"].map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>&copy; 2024 Design Masterclass. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
