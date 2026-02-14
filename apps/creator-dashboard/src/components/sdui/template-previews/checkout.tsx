import { type CSSProperties } from "react";

const c = {
  slateDeep: "#0F172A",
  slate900: "#1e293b",
  slate800: "#334155",
  slate700: "#475569",
  slate600: "#64748b",
  steel: "#94A3B8",
  cyan: "#06B6D4",
  lime: "#84CC16",
};

const font = { main: "'Sora', 'Inter', sans-serif" };

const section: CSSProperties = { padding: "48px 24px" };
const maxW: CSSProperties = { maxWidth: 1120, margin: "0 auto" };
const checkStyle: CSSProperties = { color: c.lime, fontSize: 14, marginRight: 8 };
const xStyle: CSSProperties = { color: c.slate600, fontSize: 14, marginRight: 8 };

export default function CheckoutPreview() {
  return (
    <div style={{ fontFamily: font.main, background: c.slateDeep, color: "#fff", minHeight: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,23,42,0.8)", backdropFilter: "blur(16px)", borderBottom: `1px solid ${c.slate800}`, padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: c.cyan, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 16, color: c.slateDeep }}>{"\u{1F4BB}"}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.02em" }}>APOSTLE<span style={{ color: c.cyan, textDecoration: "underline", textUnderlineOffset: 3 }}>OS</span></span>
        </div>
        <nav style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {["Features", "Docs", "Enterprise", "Changelog"].map((item) => (
            <span key={item} style={{ fontSize: 11, fontWeight: 500, color: c.steel }}>{item}</span>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: c.steel }}>Sign in</span>
          <span style={{ background: "#fff", color: c.slateDeep, padding: "6px 14px", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>Start Free</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: 48, paddingBottom: 32, textAlign: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: `rgba(6,182,212,0.1)`, filter: "blur(120px)", borderRadius: "50%", zIndex: 0 }} />
        <div style={{ ...maxW, position: "relative", zIndex: 1 }}>
          <span style={{ display: "inline-block", padding: "4px 12px", borderRadius: 999, border: `1px solid rgba(6,182,212,0.3)`, background: "rgba(6,182,212,0.1)", color: c.cyan, fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Production Ready Infrastructure</span>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
            Ship code, not<br /><span style={{ color: c.cyan }}>servers.</span>
          </h1>
          <p style={{ color: c.steel, fontSize: 13, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>
            The all-in-one developer platform for scaling high-performance APIs without the cloud overhead. Pay for what you use, scale when you need.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section style={{ ...section, paddingBottom: 64 }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "flex-end" }}>
          {/* Explorer */}
          <div style={{ background: "rgba(30,41,59,0.5)", border: `1px solid ${c.slate800}`, padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Explorer</h3>
            <p style={{ color: c.steel, fontSize: 10, marginBottom: 16 }}>Perfect for side projects & hobbyists.</p>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>$0</span>
              <span style={{ color: c.steel, fontSize: 11 }}> / mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
              {["5,000 requests / mo", "3 public projects", "Community support"].map((f) => (
                <li key={f} style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center" }}>
                  <span style={checkStyle}>{"\u2713"}</span> {f}
                </li>
              ))}
              <li style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center", color: c.slate600 }}>
                <span style={xStyle}>{"\u2717"}</span> Custom domains
              </li>
            </ul>
            <div style={{ textAlign: "center", padding: "10px 0", borderRadius: 10, border: `1px solid ${c.slate700}`, fontWeight: 700, fontSize: 11 }}>Get Started</div>
          </div>

          {/* Developer (highlighted) */}
          <div style={{ position: "relative", background: c.slate900, border: `2px solid ${c.lime}`, padding: 24, borderRadius: 20, transform: "scale(1.04)", zIndex: 2, boxShadow: `0 0 25px rgba(132,204,22,0.15)` }}>
            <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: c.lime, color: c.slateDeep, fontSize: 8, fontWeight: 700, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Most Popular</div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Developer</h3>
            <p style={{ color: c.steel, fontSize: 10, marginBottom: 16 }}>Scale your startup with confidence.</p>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 32, fontWeight: 800, color: c.lime }}>$129</span>
              <span style={{ color: c.steel, fontSize: 11 }}> / mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
              {[
                { text: "Unlimited requests", bold: true },
                { text: "50 private projects", bold: false },
                { text: "Edge functions (Global)", bold: false },
                { text: "24/7 Email support", bold: false },
                { text: "Custom domains + SSL", bold: false },
              ].map((f) => (
                <li key={f.text} style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center", fontWeight: f.bold ? 600 : 400 }}>
                  <span style={checkStyle}>{"\u2713"}</span> {f.text}
                </li>
              ))}
            </ul>
            <div style={{ textAlign: "center", padding: "10px 0", borderRadius: 10, background: c.lime, color: c.slateDeep, fontWeight: 700, fontSize: 11 }}>Upgrade to Pro</div>
          </div>

          {/* Pro */}
          <div style={{ background: "rgba(30,41,59,0.5)", border: `1px solid ${c.slate800}`, padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Pro</h3>
            <p style={{ color: c.steel, fontSize: 10, marginBottom: 16 }}>Advanced security for enterprises.</p>
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 800 }}>$299</span>
              <span style={{ color: c.steel, fontSize: 11 }}> / mo</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
              {["Everything in Dev", "HIPAA compliance", "Role-based access (RBAC)", "Dedicated success manager"].map((f) => (
                <li key={f} style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center" }}>
                  <span style={checkStyle}>{"\u2713"}</span> {f}
                </li>
              ))}
            </ul>
            <div style={{ textAlign: "center", padding: "10px 0", borderRadius: 10, border: `1px solid rgba(6,182,212,0.5)`, color: c.cyan, fontWeight: 700, fontSize: 11 }}>Contact Sales</div>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section style={{ ...section, background: "rgba(30,41,59,0.4)", borderTop: `1px solid ${c.slate800}`, borderBottom: `1px solid ${c.slate800}` }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Compare features</h2>
          <p style={{ color: c.steel, fontSize: 12 }}>Detailed breakdown of our core platform capabilities.</p>
        </div>
        <div style={{ maxWidth: 720, margin: "0 auto", border: `1px solid ${c.slate800}`, borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(51,65,85,0.5)" }}>
                {["Feature", "Explorer", "Developer", "Pro"].map((h, i) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: i === 2 ? c.lime : c.steel, textAlign: i === 0 ? "left" : "center", borderBottom: `1px solid ${c.slate800}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Deployment Regions", vals: ["US-East", "Global (24)", "Global (68)"] },
                { feature: "Auto-scaling", vals: ["\u2717", "\u2713", "\u2713"] },
                { feature: "Analytics Retention", vals: ["24 Hours", "30 Days", "Unlimited"] },
                { feature: "SOC2 Type II", vals: ["\u2717", "\u2713", "\u2713"] },
              ].map((row) => (
                <tr key={row.feature} style={{ borderBottom: `1px solid ${c.slate800}` }}>
                  <td style={{ padding: "12px 16px", fontSize: 11, fontWeight: 500 }}>{row.feature}</td>
                  {row.vals.map((v, i) => (
                    <td key={i} style={{ padding: "12px 16px", textAlign: "center", fontSize: 11, color: v === "\u2713" ? c.lime : v === "\u2717" ? c.slate600 : c.steel }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ ...section, paddingTop: 56, paddingBottom: 56 }}>
        <div style={{ ...maxW, textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Loved by 50,000+ developers</h2>
          <p style={{ color: c.steel, fontSize: 12 }}>Don't take our word for it. See why teams ship with Apostle.</p>
        </div>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { name: "Sarah Chen", role: "CTO @ VeloStack", gradient: `linear-gradient(135deg, #22d3ee, #3b82f6)`, quote: "We migrated our entire API infrastructure to Apostle in a weekend. The latency reduction on edge functions was immediate. Best DX I've experienced." },
            { name: "Markus Weber", role: "Lead Dev @ FinStream", gradient: `linear-gradient(135deg, #a3e635, #10b981)`, quote: "The auto-scaling on the Developer plan is magic. We had a Product Hunt launch that spiked traffic 100x and Apostle didn't drop a single request." },
            { name: "Javier Ortiz", role: "Senior Engineer @ CloudBase", gradient: `linear-gradient(135deg, #c084fc, #ec4899)`, quote: "Finally, a platform that understands local-first development. The CLI is incredibly fast and the documentation is actually readable." },
          ].map((t) => (
            <div key={t.name} style={{ padding: 20, background: c.slate900, border: `1px solid ${c.slate800}`, borderRadius: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.gradient }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{t.name}</div>
                  <div style={{ fontSize: 9, color: c.steel, textTransform: "uppercase", letterSpacing: "0.08em" }}>{t.role}</div>
                </div>
              </div>
              <p style={{ fontSize: 11, fontStyle: "italic", color: c.steel, lineHeight: 1.7 }}>"{t.quote}"</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / Guarantee Section */}
      <section style={section}>
        <div style={{ maxWidth: 720, margin: "0 auto", background: `linear-gradient(135deg, ${c.slate800}, ${c.slate900})`, borderRadius: 28, padding: 40, textAlign: "center", position: "relative", overflow: "hidden", border: `1px solid ${c.slate700}` }}>
          <div style={{ position: "absolute", right: -40, bottom: -40, width: 200, height: 200, background: "rgba(6,182,212,0.15)", filter: "blur(80px)", borderRadius: "50%" }} />
          <div style={{ fontSize: 36, color: c.cyan, marginBottom: 16 }}>{"\uD83D\uDEE1\uFE0F"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Zero Risk. Total Security.</h2>
          <p style={{ color: c.steel, fontSize: 12, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 24px" }}>Not sure? Try any paid plan for 60 days. If you're not shipping 2x faster, we'll refund every cent. No questions asked.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, marginBottom: 24, flexWrap: "wrap" }}>
            {[
              ["\uD83D\uDD12", "SSL SECURE PAYMENTS"],
              ["\uD83D\uDD04", "60-DAY MONEY BACK"],
              ["\uD83D\uDDC4\uFE0F", "SOC2 TYPE II CERTIFIED"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 600 }}>
                <span style={{ color: c.cyan, fontSize: 14 }}>{icon}</span> {text}
              </div>
            ))}
          </div>
          <span style={{ display: "inline-block", padding: "12px 32px", background: "#fff", color: c.slateDeep, borderRadius: 999, fontSize: 13, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>Start Your Trial Today</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "24px 24px", borderTop: `1px solid ${c.slate800}` }}>
        <div style={{ ...maxW, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, opacity: 0.5 }}>
            <div style={{ width: 16, height: 16, background: "#fff", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: c.slateDeep }}>{"\u{1F4BB}"}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700 }}>APOSTLE</span>
          </div>
          <div style={{ display: "flex", gap: 20, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: c.steel }}>
            <span>Status: <span style={{ color: c.lime }}>Operational</span></span>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
          <p style={{ fontSize: 9, color: c.slate600 }}>&copy; 2024 Apostle Infrastructure Inc.</p>
        </div>
      </footer>
    </div>
  );
}
