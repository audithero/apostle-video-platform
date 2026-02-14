import { type CSSProperties } from "react";

const c = {
  bg: "#0A0A0A",
  neonGreen: "#00FF87",
  electricCoral: "#FF6B6B",
  zinc900: "#18181b",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray800: "#27272a",
};

const font = {
  display: "'Montserrat', 'Impact', sans-serif",
  body: "'Inter', 'Helvetica Neue', sans-serif",
};

const section: CSSProperties = { padding: "48px 24px" };
const maxW: CSSProperties = { maxWidth: 1120, margin: "0 auto" };
const neonGlow: CSSProperties = { boxShadow: `0 0 15px rgba(0, 255, 135, 0.3)` };
const diagonalStripe: CSSProperties = {
  backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,255,135,0.05) 10px, rgba(0,255,135,0.05) 20px)`,
};

export default function FitnessPreview() {
  return (
    <div style={{ fontFamily: font.body, background: c.bg, color: "#fff", minHeight: "100vh", overflow: "hidden" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,10,10,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: c.neonGreen, display: "flex", alignItems: "center", justifyContent: "center", transform: "skewX(-12deg)" }}>
            <span style={{ transform: "skewX(12deg)", fontSize: 16, color: "#000" }}>{"\u26A1"}</span>
          </div>
          <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 16, letterSpacing: "-0.04em" }}>ALEX RIVERA</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>
          <span>Curriculum</span>
          <span>Achievements</span>
          <span>Enroll</span>
          <span style={{ padding: "6px 14px", border: `2px solid ${c.neonGreen}`, color: c.neonGreen }}>Client Portal</span>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ ...section, paddingTop: 48, paddingBottom: 40, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "100%", background: `linear-gradient(to left, rgba(0,255,135,0.08), transparent)`, filter: "blur(60px)" }} />
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "center" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-block", padding: "4px 10px", background: c.electricCoral, color: "#000", fontWeight: 900, fontSize: 9, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Elite Performance Protocol</div>
            <h1 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 56, lineHeight: 0.9, letterSpacing: "-0.04em", textTransform: "uppercase", fontStyle: "italic", marginBottom: 16 }}>
              Transform <br /><span style={{ color: c.neonGreen }}>Your Limits</span>
            </h1>
            <p style={{ fontSize: 13, color: c.gray400, maxWidth: 380, lineHeight: 1.7, marginBottom: 24 }}>
              Stop training for aesthetics. Start training for dominance. A 30-day rigorous protocol designed to rebuild your metabolic engine and physical resilience.
            </p>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "14px 28px", background: c.neonGreen, color: "#000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontSize: 13 }}>
              Start Your Protocol {"\u2192"}
            </span>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ aspectRatio: "4/5", background: c.gray800, overflow: "hidden", borderRight: `6px solid ${c.neonGreen}`, borderBottom: `6px solid ${c.neonGreen}`, position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800" alt="High-intensity gym training session" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1) contrast(1.25)", mixBlendMode: "overlay" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
              <div style={{ position: "absolute", bottom: 16, left: 16 }}>
                <div style={{ padding: 12, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", borderLeft: `3px solid ${c.electricCoral}` }}>
                  <span style={{ display: "block", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", color: c.gray400 }}>Success Rate</span>
                  <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 22 }}>98.4%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section style={{ padding: "20px 24px", background: c.zinc900, borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 20, alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: c.gray400 }}>Live Protocol Progress</span>
              <span style={{ color: c.neonGreen, fontFamily: font.display, fontWeight: 700, fontSize: 12 }}>65%</span>
            </div>
            <div style={{ width: "100%", height: 10, background: "#000", borderRadius: 999, overflow: "hidden", padding: 2, border: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ width: "65%", height: "100%", background: c.neonGreen, borderRadius: 999, ...neonGlow }} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 22, color: c.electricCoral }}>{"\uD83D\uDD25"}</span>
            <div>
              <span style={{ display: "block", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", color: c.gray400 }}>Current Streak</span>
              <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 14 }}>14 DAYS</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 16, borderLeft: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: 22, color: c.neonGreen }}>{"\uD83D\uDC65"}</span>
            <div>
              <span style={{ display: "block", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.15em", color: c.gray400 }}>Active Recruits</span>
              <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 14 }}>12.4K</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Week Curriculum */}
      <section style={{ ...section, position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, ...diagonalStripe, opacity: 0.5 }} />
        <div style={{ ...maxW, position: "relative" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 36, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.04em" }}>
              The <span style={{ color: c.electricCoral }}>Curriculum</span>
            </h2>
            <p style={{ color: c.gray400, fontSize: 12, marginTop: 8 }}>Four phases of calculated destruction and rebuilding. No shortcuts.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { n: "01", title: "The Awakening", desc: "Base building, mechanical correction, and nervous system activation.", items: ["Mobilization Flow", "Kinetic Chain Sync"] },
              { n: "02", title: "Hyper-Load", desc: "Intensity ramp. Focused hypertrophy and structural loading to trigger adaptation.", items: ["Volume Thresholds", "Eccentric Mastery"] },
              { n: "03", title: "Metabolic Fire", desc: "High-velocity circuits and anaerobic threshold expansion. Pushing the VO2 Max.", items: ["EPOC Induction", "Density Sets"] },
              { n: "04", title: "Apex Protocol", desc: "Peak output realization. Testing new maximums and cementing the transformation.", items: ["1RM Calibration", "Final Graduation"] },
            ].map((w) => (
              <div key={w.n} style={{ background: c.zinc900, border: "1px solid rgba(255,255,255,0.08)", padding: 20 }}>
                <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 36, color: "rgba(255,255,255,0.04)", marginBottom: 8 }}>{w.n}</div>
                <h3 style={{ fontFamily: font.display, fontWeight: 900, textTransform: "uppercase", fontSize: 13, marginBottom: 8 }}>{w.title}</h3>
                <p style={{ fontSize: 10, color: c.gray500, lineHeight: 1.6, marginBottom: 12 }}>{w.desc}</p>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {w.items.map((item) => (
                    <li key={item} style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: c.gray400, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: c.neonGreen }}>{"\u2713"}</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievement Badges */}
      <section style={{ ...section, background: "#000" }}>
        <div style={maxW}>
          <div style={{ marginBottom: 32 }}>
            <span style={{ color: c.neonGreen, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>Earn Your Status</span>
            <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 36, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.04em", marginTop: 8 }}>Achievement Badges</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {[
              { icon: "\uD83D\uDEE1\uFE0F", name: "First Blood", active: false },
              { icon: "\u26F0\uFE0F", name: "Peak State", active: false },
              { icon: "\uD83D\uDD25", name: "14 Day Streak", active: true },
              { icon: "\u23F1\uFE0F", name: "Time Lord", active: false },
              { icon: "\uD83C\uDFC6", name: "Elite 1%", active: false },
              { icon: "\uD83D\uDC80", name: "Unstoppable", active: false },
            ].map((b) => (
              <div key={b.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: c.zinc900, border: `2px solid ${b.active ? c.neonGreen : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 10 }}>
                  {b.icon}
                </div>
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", color: b.active ? c.neonGreen : "#fff" }}>{b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Bio */}
      <section style={{ ...section, background: c.zinc900, overflow: "hidden" }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "5fr 7fr", gap: 32, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ aspectRatio: "1", background: c.gray800, border: `3px solid ${c.electricCoral}`, transform: "skewX(-3deg)", overflow: "hidden", position: "relative" }}>
              <img src="https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=600" alt="Alex Rivera, fitness instructor" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(1)" }} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(255,107,107,0.1)", mixBlendMode: "multiply" }} />
            </div>
            <div style={{ position: "absolute", bottom: -12, right: -12, width: 48, height: 48, border: `6px solid rgba(0,255,135,0.15)` }} />
          </div>
          <div>
            <span style={{ color: c.electricCoral, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 10 }}>The Architect</span>
            <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 36, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.04em", margin: "8px 0 16px" }}>Alex Rivera</h2>
            <p style={{ fontSize: 12, color: c.gray400, lineHeight: 1.7, marginBottom: 10 }}>With 15 years in elite athlete preparation and tactical conditioning, Rivera has spent a decade refining the "Limitless Protocol".</p>
            <p style={{ fontSize: 12, color: c.gray400, lineHeight: 1.7, marginBottom: 16 }}>Former specialized unit training coordinator, Rivera doesn't believe in "fitness apps." He believes in biological warfare -- against your own weaknesses.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[["15+", "Years Experience"], ["50K+", "Lives Rebuilt"]].map(([val, lab]) => (
                <div key={lab}>
                  <span style={{ display: "block", color: c.neonGreen, fontFamily: font.display, fontWeight: 900, fontSize: 24 }}>{val}</span>
                  <span style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>{lab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={section}>
        <div style={{ ...maxW, textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 32, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.04em" }}>
            The <span style={{ color: c.neonGreen }}>Aftermath</span>
          </h2>
        </div>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { name: "Marcus Thorne", role: "Ultra-Runner", quote: "I thought I was in shape. This protocol broke me in 3 days and rebuilt me by day 30 into something I didn't recognize. My squat increased by 45lbs in a month." },
            { name: "Elena Vance", role: "Triathlete", quote: "The scientific approach to the anaerobic thresholds is what sets Alex apart. This isn't just sweating; it's engineering human performance." },
            { name: "Jordan S.", role: "D1 Swimmer", quote: "Rivera is relentless. The accountability tracking and the badge system kept me pushing when I wanted to quit. Highly recommended for elite level goals." },
          ].map((t) => (
            <div key={t.name} style={{ padding: 20, border: "1px solid rgba(255,255,255,0.08)", background: "#000" }}>
              <div style={{ color: c.neonGreen, fontSize: 12, marginBottom: 12 }}>{"\u2605".repeat(5)}</div>
              <p style={{ fontSize: 11, fontStyle: "italic", color: c.gray400, lineHeight: 1.7, marginBottom: 16 }}>"{t.quote}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.gray800 }} />
                <div>
                  <div style={{ fontFamily: font.display, fontWeight: 900, fontSize: 10, textTransform: "uppercase" }}>{t.name}</div>
                  <div style={{ fontSize: 8, textTransform: "uppercase", fontWeight: 700, color: c.gray500 }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ ...section, background: c.zinc900 }}>
        <div style={{ ...maxW, textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 36, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.04em" }}>
            Pick Your <span style={{ color: c.electricCoral }}>Weapon</span>
          </h2>
        </div>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 720 }}>
          {/* Recruit */}
          <div style={{ border: "2px solid rgba(255,255,255,0.08)", background: "#000", padding: 28, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 20, textTransform: "uppercase", marginBottom: 4 }}>THE RECRUIT</h3>
            <p style={{ color: c.gray500, fontSize: 11, marginBottom: 16 }}>Entry level into the Rivera mindset.</p>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 38 }}>$149</span>
              <span style={{ color: c.gray500, fontWeight: 700, textTransform: "uppercase", fontSize: 10, marginLeft: 6 }}>/ Protocol</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, marginBottom: 20 }}>
              {["30 Day Video Curriculum", "Performance Dashboard"].map((f) => (
                <li key={f} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: c.neonGreen }}>{"\u2713"}</span> {f}
                </li>
              ))}
              <li style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, opacity: 0.3 }}>
                <span style={{ color: "#ef4444" }}>{"\u2717"}</span> 1-on-1 Coaching
              </li>
            </ul>
            <div style={{ textAlign: "center", padding: "10px 0", border: "2px solid #fff", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 10 }}>Choose Recruit</div>
          </div>
          {/* Elite */}
          <div style={{ border: `3px solid ${c.neonGreen}`, background: "#000", padding: 28, display: "flex", flexDirection: "column", position: "relative", transform: "scale(1.04)", ...neonGlow }}>
            <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: c.neonGreen, color: "#000", padding: "3px 10px", fontWeight: 900, fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em" }}>Most Intense</div>
            <h3 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 20, textTransform: "uppercase", color: c.neonGreen, marginBottom: 4 }}>THE ELITE</h3>
            <p style={{ color: c.gray500, fontSize: 11, marginBottom: 16 }}>Total immersion and individual oversight.</p>
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: font.display, fontWeight: 900, fontSize: 38, color: c.neonGreen }}>$499</span>
              <span style={{ color: c.gray500, fontWeight: 700, textTransform: "uppercase", fontSize: 10, marginLeft: 6 }}>/ Protocol</span>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, marginBottom: 20 }}>
              {[
                { text: "Everything in Recruit", highlight: false },
                { text: "4 Weekly 1:1 Syncs", highlight: true },
                { text: "Personalized Macro Plan", highlight: false },
                { text: "Lifetime Alumni Discord", highlight: false },
              ].map((f) => (
                <li key={f.text} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, display: "flex", alignItems: "center", gap: 8, color: f.highlight ? c.neonGreen : "#fff" }}>
                  <span style={{ color: c.neonGreen }}>{"\u2713"}</span> {f.text}
                </li>
              ))}
            </ul>
            <div style={{ textAlign: "center", padding: "10px 0", background: c.neonGreen, color: "#000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.12em", fontSize: 10 }}>Choose Elite</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "48px 24px", background: "#000", borderTop: "1px solid rgba(255,255,255,0.04)", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 1, background: `linear-gradient(to right, transparent, ${c.neonGreen}, transparent)`, opacity: 0.3 }} />
        <h2 style={{ fontFamily: font.display, fontWeight: 900, fontSize: 72, textTransform: "uppercase", fontStyle: "italic", letterSpacing: "-0.06em", opacity: 0.04, userSelect: "none", marginBottom: -24 }}>LIMITLESS</h2>
        <p style={{ color: c.gray500, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em", fontSize: 9, marginBottom: 24, position: "relative" }}>Your evolution begins at the edge of your comfort zone.</p>
        <div style={{ ...maxW, display: "flex", justifyContent: "center", alignItems: "center", gap: 32, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
          <div style={{ textAlign: "left" }}>
            <span style={{ display: "block", fontFamily: font.display, fontWeight: 900, fontSize: 14, textTransform: "uppercase", fontStyle: "italic" }}>Alex Rivera</span>
            <span style={{ fontSize: 8, color: c.gray500, textTransform: "uppercase", letterSpacing: "0.12em" }}>Performance Systems</span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: c.gray500 }}>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </div>
        <p style={{ marginTop: 20, color: "#27272a", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.12em" }}>&copy; 2024 RIVERA PERFORMANCE LAB. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
