import { type CSSProperties } from "react";

const navy = "#0D1B2A";
const gold = "#D4A853";
const warmGray = "#8B8589";
const cream = "#FAF8F5";
const serifFont = "'Cormorant Garamond', serif";
const bodyFont = "'Source Sans Pro', sans-serif";

const sectionPad: (bg: string) => CSSProperties = (bg) => ({
  backgroundColor: bg,
  padding: "96px 48px",
  boxSizing: "border-box",
  fontFamily: bodyFont,
});

export default function CourseLandingPreview() {
  const checkMark = "\u2713";
  const dash = "\u2014";
  const quoteOpen = "\u201C";
  const quoteClose = "\u201D";

  const modules = [
    { num: "01", hours: "2.5 Hours", title: "The Foundational Eye", desc: "Mastering lens selection for portraiture, understanding the geometry of the frame, and the psychology of the subject-photographer relationship." },
    { num: "02", hours: "3.5 Hours", title: "The Editorial Narrative", desc: "Moving beyond single frames to build cohesive visual stories that command attention in print and digital media." },
    { num: "03", hours: "4 Hours", title: "Advanced Lighting & Studio", desc: "The mastery of shadow. Working with Rembrandt lighting, high-key editorial setups, and mixing natural ambient light with studio flash." },
    { num: "04", hours: "3 Hours", title: "Post-Production & Signature", desc: "Developing your unique color grade and retouching philosophy without losing the natural texture of the image." },
  ];

  const testimonials = [
    { quote: "Elena doesn't just teach you how to take photos; she teaches you how to see the unseen. My work transformed in weeks.", name: "Marcus Thorne", role: "Senior Art Director" },
    { quote: "The lighting module alone is worth the entire price. It's the first time studio flash actually made sense to me.", name: "Sophie Chen", role: "Freelance Fashion Photographer" },
    { quote: "A rare look into the mind of a master. The storytelling framework changed how I approach my commercial commissions.", name: "Julian Reyes", role: "Visual Creative" },
  ];

  const tiers = [
    {
      name: "Foundation",
      price: "$499",
      recommended: false,
      features: ["All 4 Core Modules", "Lighting Cheat Sheets", "Private Discord Access"],
      excluded: ["Portfolio Review"],
      cta: "Enroll Now",
      bg: "#fff",
      color: navy,
      borderColor: "rgba(13,27,42,0.05)",
    },
    {
      name: "The Complete Experience",
      price: "$899",
      recommended: true,
      features: ["All 4 Core Modules", "2 Bonus Masterclasses", "Group Q&A Sessions", "Lightroom Preset Pack"],
      excluded: [],
      cta: "Enroll Now",
      bg: navy,
      color: "#fff",
      borderColor: gold,
    },
    {
      name: "Masterclass Elite",
      price: "$1499",
      recommended: false,
      features: ["Everything in Complete", "1-on-1 Portfolio Critique", "Professional Agency Referral", "Lifetime Content Updates"],
      excluded: [],
      cta: "Join Waitlist",
      bg: "#fff",
      color: navy,
      borderColor: "rgba(13,27,42,0.05)",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", fontFamily: bodyFont, backgroundColor: cream, color: navy, overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: navy, color: "#fff", padding: "24px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", boxSizing: "border-box" }}>
        <span style={{ fontFamily: serifFont, fontSize: 22, letterSpacing: "0.15em", textTransform: "uppercase" }}>Vasquez</span>
        <div style={{ display: "flex", gap: 48, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
          <span>Philosophy</span>
          <span>Curriculum</span>
          <span>Investment</span>
        </div>
        <span style={{ backgroundColor: gold, color: navy, padding: "12px 32px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Enroll Now</span>
      </nav>

      {/* Hero */}
      <section style={{
        position: "relative",
        height: "85vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 24px",
        backgroundImage: "linear-gradient(rgba(13,27,42,0.4), rgba(13,27,42,0.9)), url('https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=2000')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        boxSizing: "border-box",
      }}>
        <div style={{ maxWidth: 800 }}>
          <span style={{ color: gold, textTransform: "uppercase", letterSpacing: "0.4em", fontSize: 13, marginBottom: 24, display: "block", fontWeight: 700 }}>The Masterclass Series</span>
          <h1 style={{ fontFamily: serifFont, color: "#fff", fontSize: 72, marginBottom: 32, fontStyle: "italic", lineHeight: 1.05, fontWeight: 400 }}>The Art of the Editorial Narrative</h1>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 18, maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7, fontWeight: 300 }}>
            Join world-renowned photographer Elena Vasquez for an immersive journey into the technical precision and poetic soul of high-fashion editorial photography.
          </p>
          <div style={{ display: "flex", gap: 24, justifyContent: "center" }}>
            <span style={{ backgroundColor: gold, color: navy, padding: "20px 40px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 13 }}>Start Learning Today</span>
            <span style={{ border: "1px solid rgba(255,255,255,0.3)", color: "#fff", padding: "20px 40px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", fontSize: 13 }}>View Syllabus</span>
          </div>
        </div>
      </section>

      {/* Instructor Bio */}
      <section style={sectionPad(navy)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", top: -24, left: -24, width: "100%", height: "100%", border: `1px solid ${gold}`, zIndex: 0 }} />
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=1000" alt="" style={{ position: "relative", zIndex: 10, width: "100%", height: 560, objectFit: "cover", display: "block" }} />
          </div>
          <div style={{ color: "#fff" }}>
            <h2 style={{ fontFamily: serifFont, fontSize: 44, marginBottom: 32, lineHeight: 1.15 }}>
              Elena Vasquez<br />
              <span style={{ color: gold, fontStyle: "italic" }}>Visual Poetics & Strategy</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, color: "rgba(255,255,255,0.7)", fontSize: 17, lineHeight: 1.7 }}>
              <p>With over fifteen years capturing the covers of Vogue, Harper's Bazaar, and W Magazine, Elena Vasquez has defined the aesthetic of a generation.</p>
              <p>A recipient of the Leica Excellence Award, Elena has spent the last five years mentoring emerging talent. This course is the culmination of her life's work.</p>
            </div>
            <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
              <div style={{ borderLeft: `1px solid ${gold}`, paddingLeft: 24 }}>
                <span style={{ display: "block", fontSize: 28, fontFamily: serifFont, color: gold }}>15+</span>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>Years in Industry</span>
              </div>
              <div style={{ borderLeft: `1px solid ${gold}`, paddingLeft: 24 }}>
                <span style={{ display: "block", fontSize: 28, fontFamily: serifFont, color: gold }}>120+</span>
                <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>Global Covers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={sectionPad(cream)}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <span style={{ color: warmGray, textTransform: "uppercase", letterSpacing: "0.3em", fontSize: 11, fontWeight: 700 }}>Course Blueprint</span>
            <h2 style={{ fontFamily: serifFont, color: navy, fontSize: 44, marginTop: 16 }}>The Curriculum</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {modules.map((m) => (
              <div key={m.num} style={{ backgroundColor: "#fff", padding: 32, border: "1px solid rgba(13,27,42,0.05)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: gold, fontFamily: serifFont, fontSize: 22 }}>{m.num}</span>
                  <span style={{ color: warmGray, fontSize: 11, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.15em" }}>{m.hours}</span>
                </div>
                <h3 style={{ fontFamily: serifFont, fontSize: 26, color: navy, marginBottom: 16 }}>{m.title}</h3>
                <p style={{ color: "rgba(13,27,42,0.6)", lineHeight: 1.7 }}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={sectionPad(navy)}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 64 }}>
            <h2 style={{ fontFamily: serifFont, color: "#fff", fontSize: 44, lineHeight: 1.15 }}>
              Conversations with<br /><span style={{ fontStyle: "italic", color: gold }}>The Contemporary</span>
            </h2>
            <div style={{ display: "flex", gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>&larr;</div>
              <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18 }}>&rarr;</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
            {testimonials.map((t, i) => (
              <div key={t.name} style={{
                padding: 40,
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 380,
                backgroundColor: i === 1 ? "rgba(255,255,255,0.05)" : "transparent",
              }}>
                <div>
                  <span style={{ fontSize: 36, color: gold, display: "block", marginBottom: 24, fontFamily: serifFont }}>{quoteOpen}{quoteClose}</span>
                  <p style={{ fontFamily: serifFont, fontSize: 21, color: "rgba(255,255,255,0.9)", fontStyle: "italic", lineHeight: 1.5 }}>
                    {quoteOpen}{t.quote}{quoteClose}
                  </p>
                </div>
                <div>
                  <span style={{ display: "block", color: "#fff", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", fontSize: 11, marginBottom: 4 }}>{t.name}</span>
                  <span style={{ color: gold, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em" }}>{t.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={sectionPad(cream)}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 80 }}>
            <span style={{ color: warmGray, textTransform: "uppercase", letterSpacing: "0.3em", fontSize: 11, fontWeight: 700 }}>Investment</span>
            <h2 style={{ fontFamily: serifFont, fontSize: 44, marginTop: 16, color: navy }}>Choose Your Path</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, alignItems: "stretch" }}>
            {tiers.map((t) => (
              <div key={t.name} style={{
                backgroundColor: t.bg,
                padding: 48,
                display: "flex",
                flexDirection: "column",
                border: t.recommended ? "none" : `1px solid ${t.borderColor}`,
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                color: t.color,
                position: "relative",
                transform: t.recommended ? "scale(1.05)" : "none",
                zIndex: t.recommended ? 10 : 1,
              }}>
                {t.recommended ? (
                  <>
                    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, backgroundColor: gold }} />
                    <span style={{ fontSize: 10, backgroundColor: gold, color: navy, fontWeight: 700, padding: "4px 12px", alignSelf: "flex-start", marginBottom: 24, textTransform: "uppercase", letterSpacing: "0.15em" }}>Recommended</span>
                  </>
                ) : null}
                <span style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 8 }}>{t.name}</span>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 32 }}>
                  <span style={{ fontSize: 44, fontFamily: serifFont }}>{t.price}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48, flex: 1 }}>
                  {t.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14 }}>
                      <span style={{ color: gold, fontWeight: 700 }}>{checkMark}</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {t.excluded.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, opacity: 0.4 }}>
                      <span>{dash}</span>
                      <span>{f}</span>
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
                  backgroundColor: t.recommended ? gold : "transparent",
                  color: t.recommended ? navy : t.color,
                  border: t.recommended ? "none" : `1px solid ${navy}`,
                  boxSizing: "border-box",
                }}>
                  {t.cta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: navy, padding: "80px 32px", color: "#fff", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ textAlign: "left" }}>
            <span style={{ fontFamily: serifFont, fontSize: 36, fontStyle: "italic", color: gold, display: "block", marginBottom: 8 }}>Elena Vasquez</span>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" }}>Visual Narratives & Contemporary Art</p>
          </div>
          <div style={{ display: "flex", gap: 32 }}>
            {["\uD83D\uDCF8", "\uD835\uDD4F", "\uD83C\uDFA5"].map((icon, i) => (
              <span key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: 22 }}>{icon}</span>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase" }}>&copy; 2024 Vasquez Studio. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
}
