import { type CSSProperties } from "react";

const navy = "#0A1628";
const gold = "#C4A35A";
const green = "#2E7D32";
const lightBg = "#F5F5F7";
const serifFont = "'Merriweather', serif";
const bodyFont = "'Inter', sans-serif";

const sectionPad: (bg: string) => CSSProperties = (bg) => ({
  backgroundColor: bg,
  padding: "96px 24px",
  boxSizing: "border-box",
  fontFamily: bodyFont,
});

export default function WealthPreview() {
  const checkMark = "\u2713";
  const quoteChar = "\u201C";

  const modules = [
    { num: "01", title: "Market Macro-Dynamics", desc: "Mastering the interaction between interest rates, inflation, and global liquidity cycles.", topics: ["Fiscal Policy Analysis", "Global Capital Flows", "Yield Curve Strategies"] },
    { num: "02", title: "Advanced Valuation", desc: "Beyond basics: Deep-dive DCF modeling, relative valuation, and scenario analysis for public equities.", topics: ["Intrinsic Value Frameworks", "Risk-Adjusted Modeling", "Sector Specific Metrics"] },
    { num: "03", title: "Portfolio Construction", desc: "Efficient frontier optimization, asset allocation across regimes, and factor investing.", topics: ["Modern Portfolio Theory", "Correlation Management", "Tactical Allocation"] },
    { num: "04", title: "Risk & Alternatives", desc: "Tail-risk hedging, private equity, and structured credit in a volatile landscape.", topics: ["Options Strategies", "Private Market Access", "Wealth Preservation"] },
  ];

  const testimonials = [
    { quote: "Victoria's module on tactical asset allocation changed how I manage our firm's mid-cap fund. The insights are truly institutional grade.", name: "David Sterling", role: "Portfolio Manager, Sterling & Co." },
    { quote: "Most courses touch the surface. Wealth Academy dives into the plumbing of the financial system. Essential for anyone serious about capital.", name: "Sarah Jenkins", role: "Investment Banker, Private Equity" },
    { quote: "I've taken many finance courses, but none provide the practical Wall Street rigor that Victoria delivers. Worth every penny of the tuition.", name: "Marcus Aurelius V.", role: "Family Office Director" },
  ];

  const tiers = [
    { name: "Foundation", subtitle: "Individual Investor", price: "$499", per: "/ course", features: ["Lifetime access to all lectures", "Curriculum PDFs & templates", "Community Slack access"], bg: "#fff", color: navy, highlighted: false },
    { name: "Professional", subtitle: "Career Accelerator", price: "$1,299", per: "/ series", features: ["All Foundation features", "Wall Street Modeling Workbooks", "Bi-weekly Live Q&A Sessions", "Accredited Certification Exam"], bg: navy, color: "#fff", highlighted: true },
    { name: "Elite", subtitle: "Private Coaching", price: "$4,999", per: "/ executive", features: ["All Professional features", "1-on-1 Portfolio Review (3 sessions)", "Direct WhatsApp Line to Victoria", "Annual Alumni Retreat Access"], bg: "#fff", color: navy, highlighted: false },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: bodyFont, backgroundColor: lightBg, color: navy, overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, width: "100%", backgroundColor: navy, zIndex: 50, borderBottom: `1px solid rgba(196,163,90,0.2)`, boxSizing: "border-box" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 80, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 40, height: 40, backgroundColor: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: navy, fontWeight: 900 }}>{"\uD83C\uDFDB"}</div>
            <span style={{ color: "#fff", fontWeight: 700, letterSpacing: "0.15em", fontSize: 18, textTransform: "uppercase", fontFamily: serifFont }}>Wealth Academy</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            {["Curriculum", "Instructor", "Enrollment"].map((link) => (
              <span key={link} style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>{link}</span>
            ))}
            <span style={{ color: "#fff", border: `1px solid ${gold}`, padding: "8px 24px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Portal Access</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ paddingTop: 128, paddingBottom: 80, backgroundColor: navy, color: "#fff", overflow: "hidden", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 800, height: 800, backgroundColor: gold, borderRadius: "50%", filter: "blur(120px)", opacity: 0.1, marginRight: -384, marginTop: -384 }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ zIndex: 10 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "rgba(46,125,50,0.1)", border: "1px solid rgba(46,125,50,0.3)", padding: "4px 12px", marginBottom: 32 }}>
              <span style={{ color: green, fontSize: 14 }}>{"\u2191"}</span>
              <span style={{ color: green, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Financial Mastery Series 2024</span>
            </div>
            <h1 style={{ fontFamily: serifFont, fontSize: 56, fontWeight: 900, marginBottom: 32, lineHeight: 1.15 }}>
              Master the Science of <span style={{ color: gold }}>Wealth Preservation.</span>
            </h1>
            <p style={{ fontSize: 18, color: "rgba(255,255,255,0.7)", marginBottom: 40, lineHeight: 1.7, fontWeight: 300, maxWidth: 540 }}>
              An institutional-grade education in asset management, macroeconomic analysis, and portfolio construction led by Victoria Chen, CFA.
            </p>
            <div style={{ display: "flex", gap: 24 }}>
              <span style={{ backgroundColor: gold, color: navy, padding: "20px 40px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 13 }}>Secure Admission</span>
              <span style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "20px 40px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 13 }}>View Syllabus</span>
            </div>

            {/* Trust Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, marginTop: 64, paddingTop: 48, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              {[
                { val: "$500M+", label: "Assets Guided" },
                { val: "15,000+", label: "Global Alumni" },
                { val: "15 Yrs", label: "Wall St Experience" },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ fontSize: 26, fontFamily: serifFont, fontWeight: 700, color: gold }}>{s.val}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 4, fontWeight: 700 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ aspectRatio: "4/5", overflow: "hidden", borderLeft: `4px solid ${gold}`, borderBottom: `4px solid ${gold}`, position: "relative", zIndex: 20 }}>
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800&h=1000" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)" }} />
            </div>
            <div style={{ position: "absolute", bottom: -40, right: -40, width: "100%", height: "100%", border: `1px solid rgba(196,163,90,0.3)`, zIndex: -1 }} />
          </div>
        </div>
      </section>

      {/* Instructor Bio */}
      <section style={sectionPad("#ffffff")}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: serifFont, fontSize: 34, fontWeight: 700, marginBottom: 16 }}>The Instructor Credentials</h2>
            <div style={{ width: 96, height: 4, backgroundColor: gold, margin: "0 auto" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 22, fontFamily: serifFont, marginBottom: 16 }}>Victoria Chen, CFA</p>
              <p style={{ color: "rgba(10,22,40,0.8)", lineHeight: 1.8, fontSize: 16, marginBottom: 24 }}>
                With over 15 years of experience in senior portfolio management at elite Wall Street firms, Victoria brings a unique perspective on institutional wealth management.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {["Chartered Financial Analyst (CFA) Holder", "Former Lead Analyst at Goldman Sachs", "M.S. in Finance, Princeton University", "Keynote Speaker at World Economic Forum"].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: green, fontWeight: 700, fontSize: 14 }}>{checkMark}</span>
                    <span style={{ fontSize: 14, color: "rgba(10,22,40,0.7)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: navy, padding: 48, textAlign: "center", borderTop: `4px solid ${gold}` }}>
              <span style={{ color: gold, fontSize: 48, opacity: 0.3, display: "block", marginBottom: 24 }}>{quoteChar}</span>
              <p style={{ color: "#fff", fontStyle: "italic", fontSize: 18, fontFamily: serifFont, lineHeight: 1.8 }}>
                Wealth is not just about the numbers in your account; it's about the resilience of your strategy and the clarity of your long-term vision.
              </p>
              <div style={{ marginTop: 32, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.3em", fontSize: 10, fontWeight: 700 }}>Chief Investment Officer</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={sectionPad(navy)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", color: "#fff" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 64 }}>
            <div style={{ maxWidth: 600 }}>
              <h2 style={{ fontFamily: serifFont, fontSize: 34, fontWeight: 700, marginBottom: 16 }}>Core Curriculum Structure</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, fontWeight: 300 }}>A comprehensive four-pillar framework designed to transform your understanding of global financial markets.</p>
            </div>
            <span style={{ color: gold, fontWeight: 700, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>4 Modules &bull; 48 Hours &bull; Professional Certification</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {modules.map((m) => (
              <div key={m.num} style={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: 32 }}>
                <div style={{ color: gold, fontSize: 36, fontFamily: serifFont, marginBottom: 24, opacity: 0.5 }}>{m.num}</div>
                <h3 style={{ fontFamily: serifFont, fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{m.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>{m.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {m.topics.map((t) => (
                    <span key={t} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>&bull; {t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certification */}
      <section style={sectionPad(lightBg)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div style={{ backgroundColor: "#fff", padding: 48, boxShadow: "0 25px 50px rgba(0,0,0,0.1)", borderTop: `12px solid ${navy}`, position: "relative" }}>
            <div style={{ position: "absolute", top: 24, right: 24, fontSize: 56, color: gold, opacity: 0.2 }}>{"\uD83C\uDFC5"}</div>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <p style={{ fontFamily: serifFont, color: navy, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.4em", marginBottom: 16 }}>Certificate of Completion</p>
              <div style={{ width: 48, height: 1, backgroundColor: gold, margin: "0 auto 32px" }} />
              <h3 style={{ fontSize: 26, fontFamily: serifFont, fontStyle: "italic", color: "#475569", marginBottom: 24 }}>Wealth Academy Graduate</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", maxWidth: 360, margin: "0 auto", lineHeight: 1.7 }}>
                Awarded to individuals who have successfully completed the core curriculum in Advanced Asset Management and Institutional Portfolio Theory.
              </p>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: "1px solid #f1f5f9", paddingTop: 32 }}>
              <div>
                <p style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em" }}>Director of Academy</p>
                <p style={{ fontFamily: serifFont, fontSize: 16, color: navy }}>Victoria Chen</p>
              </div>
              <div style={{ width: 72, height: 72, border: `4px solid ${gold}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.3, transform: "rotate(12deg)" }}>
                <p style={{ fontSize: 8, fontWeight: 700, textAlign: "center", lineHeight: 1.2, color: gold }}>OFFICIAL<br />ACCREDITED</p>
              </div>
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: serifFont, fontSize: 34, fontWeight: 700, marginBottom: 24 }}>Industry Recognized Accreditation</h2>
            <p style={{ fontSize: 16, color: "#475569", lineHeight: 1.7, marginBottom: 32 }}>
              Upon successful completion of all four modules and the final investment thesis, graduates receive the Wealth Academy Professional Certification -- a mark of distinction recognized by top-tier financial advisory firms.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 22, color: "#94a3b8" }}>in</span>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Add to your professional credentials</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 22, color: "#94a3b8" }}>{"\u2197"}</span>
                <span style={{ color: "#64748b", fontWeight: 500 }}>Verifiable digital credentials included</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionPad("#ffffff")}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: serifFont, fontSize: 34, fontWeight: 700, marginBottom: 16 }}>Course Enrollment</h2>
            <p style={{ color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 12, fontWeight: 700 }}>Select your professional path</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {tiers.map((t) => (
              <div key={t.name} style={{
                border: t.highlighted ? `4px solid ${gold}` : "1px solid #e2e8f0",
                padding: 40,
                display: "flex",
                flexDirection: "column",
                backgroundColor: t.bg,
                color: t.color,
                position: "relative",
                transform: t.highlighted ? "scale(1.05)" : "none",
                zIndex: t.highlighted ? 10 : 1,
                boxShadow: t.highlighted ? "0 25px 50px rgba(0,0,0,0.15)" : "none",
              }}>
                {t.highlighted ? (
                  <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", backgroundColor: gold, color: navy, padding: "4px 16px", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em" }}>Most Popular</div>
                ) : null}
                <h3 style={{ fontFamily: serifFont, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{t.name}</h3>
                <p style={{ color: t.highlighted ? gold : "#94a3b8", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 24 }}>{t.subtitle}</p>
                <div style={{ marginBottom: 32 }}>
                  <span style={{ fontSize: 44, fontFamily: serifFont, fontWeight: 900 }}>{t.price}</span>
                  <span style={{ color: t.highlighted ? "rgba(255,255,255,0.4)" : "#94a3b8" }}> {t.per}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: 1, marginBottom: 40 }}>
                  {t.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 14 }}>
                      <span style={{ color: gold, fontWeight: 700, marginTop: 2 }}>{checkMark}</span>
                      <span style={{ color: t.highlighted ? "rgba(255,255,255,0.7)" : "#475569" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  width: "100%",
                  padding: "16px 0",
                  textAlign: "center",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  fontSize: 12,
                  backgroundColor: t.highlighted ? gold : "transparent",
                  color: t.highlighted ? navy : navy,
                  border: t.highlighted ? "none" : `1px solid ${navy}`,
                  boxSizing: "border-box",
                }}>
                  {t.highlighted ? "Get Started" : t.name === "Elite" ? "Inquire Now" : "Enroll Now"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={sectionPad(navy)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 64 }}>
            <h2 style={{ fontFamily: serifFont, fontSize: 28, fontWeight: 700 }}>From the Professionals</h2>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ width: 48, height: 4, backgroundColor: gold }} />
              <div style={{ width: 16, height: 4, backgroundColor: "rgba(255,255,255,0.2)" }} />
              <div style={{ width: 16, height: 4, backgroundColor: "rgba(255,255,255,0.2)" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40 }}>
            {testimonials.map((t) => (
              <div key={t.name} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: 32, borderLeft: `1px solid ${gold}` }}>
                <span style={{ color: gold, fontSize: 28, opacity: 0.5, display: "block", marginBottom: 16 }}>{quoteChar}</span>
                <p style={{ color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontStyle: "italic", marginBottom: 32 }}>{t.quote}</p>
                <div>
                  <p style={{ fontWeight: 700 }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: gold, textTransform: "uppercase", letterSpacing: "0.15em" }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: navy, padding: "80px 24px", borderTop: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                <div style={{ width: 32, height: 32, backgroundColor: gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: navy, fontWeight: 900 }}>{"\uD83C\uDFDB"}</div>
                <span style={{ fontFamily: serifFont, fontWeight: 700, letterSpacing: "0.15em", fontSize: 16, textTransform: "uppercase" }}>Wealth Academy</span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", maxWidth: 360, marginBottom: 32, lineHeight: 1.7, fontSize: 14 }}>
                The premier destination for institutional-grade financial education. Empowering a new generation of sophisticated investors.
              </p>
              <div style={{ display: "flex", gap: 16 }}>
                {["in", "\uD835\uDD4F", "\u25B6"].map((icon, i) => (
                  <div key={i} style={{ width: 40, height: 40, border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "rgba(255,255,255,0.5)" }}>{icon}</div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 11, marginBottom: 24 }}>Academy</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                <span>Full Syllabus</span>
                <span>Corporate Training</span>
                <span>Scholarship Fund</span>
                <span>Alumni Network</span>
              </div>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 11, marginBottom: 24 }}>Compliance</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 16, color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
                <span>Privacy Policy</span>
                <span>Terms of Service</span>
                <span>Investment Disclaimer</span>
                <span>Admissions Contact</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 80, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(255,255,255,0.3)", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em" }}>
            <p>&copy; 2024 Victoria Chen Wealth Academy. All Rights Reserved.</p>
            <p>Risk Disclosure: Past performance is not indicative of future results.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
