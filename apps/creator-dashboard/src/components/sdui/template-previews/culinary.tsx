import { type CSSProperties } from "react";

const c = {
  dark: "#1A1008",
  darkAlt: "#140D06",
  cardBg: "#251A10",
  terracotta: "#C44D2A",
  amber: "#D4923A",
  olive: "#6B7F3E",
  wine: "#722F37",
  cream: "#FAF8F5",
  footerBg: "#0D0804",
};

const font = {
  display: "'Playfair Display', 'Georgia', serif",
  body: "'DM Sans', 'Helvetica Neue', sans-serif",
};

const section: CSSProperties = { padding: "64px 24px" };
const maxW: CSSProperties = { maxWidth: 1120, margin: "0 auto" };
const label: CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.3em",
  color: c.amber,
};
const headingLg: CSSProperties = {
  fontFamily: font.display,
  fontSize: 36,
  fontWeight: 700,
  lineHeight: 1.15,
  color: c.cream,
  margin: "8px 0 0",
};
const bodyText: CSSProperties = {
  fontFamily: font.body,
  fontSize: 13,
  lineHeight: 1.7,
  color: "rgba(250,248,245,0.55)",
};
const checkMark: CSSProperties = { color: c.terracotta, marginRight: 8, fontSize: 14 };

export default function CulinaryPreview() {
  return (
    <div style={{ fontFamily: font.body, background: c.dark, color: c.cream, minHeight: "100vh", overflow: "hidden" }}>
      {/* Nav */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: c.terracotta, fontSize: 18 }}>&#10006;</span>
          <span style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Rossi Masterclass</span>
        </div>
        <nav style={{ display: "flex", gap: 20, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 500 }}>
          <span>The Curriculum</span>
          <span>The Chef</span>
          <span>Testimonials</span>
        </nav>
        <span style={{ background: c.terracotta, color: "#fff", padding: "8px 16px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Enroll Now</span>
      </header>

      {/* Hero */}
      <section style={{ ...section, paddingTop: 48, paddingBottom: 80 }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(196,77,42,0.1)", border: "1px solid rgba(196,77,42,0.3)", borderRadius: 999, marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.terracotta }} />
              <span style={{ color: c.terracotta, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Now Enrolling for Autumn 2024</span>
            </div>
            <h1 style={{ fontFamily: font.display, fontSize: 52, fontWeight: 700, lineHeight: 1.08, margin: "0 0 16px" }}>
              The Soul of <span style={{ fontStyle: "italic", color: c.amber }}>Tuscany</span> in Your Kitchen.
            </h1>
            <p style={{ ...bodyText, fontSize: 15, maxWidth: 420, marginBottom: 24 }}>
              Master the timeless secrets of Italian culinary heritage with Chef Marco Rossi. From the perfect pasta dough to the alchemy of slow-simmered sauces.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <span style={{ background: c.terracotta, color: "#fff", padding: "14px 28px", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>Start Your Journey</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex" }}>
                  {["https://randomuser.me/api/portraits/men/32.jpg", "https://randomuser.me/api/portraits/women/44.jpg", "https://randomuser.me/api/portraits/men/67.jpg"].map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: 28, height: 28, borderRadius: "50%", border: `2px solid ${c.dark}`, marginLeft: i > 0 ? -8 : 0, objectFit: "cover" }} />
                  ))}
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>
                  <div style={{ fontWeight: 700, color: "#fff" }}>Join 1,200+ students</div>
                  <div>Rating 4.9/5 stars</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -8, border: `1px solid rgba(212,146,58,0.2)`, transform: "rotate(-3deg)" }} />
            <div style={{ position: "absolute", inset: -8, border: `1px solid rgba(196,77,42,0.3)`, transform: "rotate(3deg)" }} />
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800" alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block", filter: "grayscale(20%)" }} />
            <div style={{ position: "absolute", bottom: 16, left: -16, background: c.dark, padding: 16, border: "1px solid rgba(255,255,255,0.08)", maxWidth: 220, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 14, lineHeight: 1.4 }}>"Cooking is not a recipe, it's a conversation with history."</p>
              <p style={{ marginTop: 8, color: c.terracotta, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>-- Marco Rossi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bio */}
      <section style={{ ...section, background: c.darkAlt, borderTop: "1px solid rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <img src="https://images.unsplash.com/photo-1577219491135-ce391730fbaf?auto=format&fit=crop&q=80&w=600" alt="" style={{ width: "100%", aspectRatio: "1", objectFit: "cover", border: `6px solid rgba(255,255,255,0.04)` }} />
            <div style={{ position: "absolute", top: -20, right: -20, background: c.wine, color: "#fff", width: 64, height: 64, borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(0,0,0,0.4)" }}>
              <span style={{ fontSize: 18, fontWeight: 700 }}>25+</span>
              <span style={{ fontSize: 6, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Years of Heritage</span>
            </div>
          </div>
          <div>
            <div style={label}>Meet the Maestro</div>
            <h3 style={{ ...headingLg, marginBottom: 16 }}>From the Hills of Tuscany to Your Kitchen.</h3>
            <p style={bodyText}>Marco Rossi didn't learn to cook in a culinary school; he learned in the kitchen of his Nonna, amidst the rolling hills of Chianti. After decades leading Michelin-starred kitchens in Florence and Milan, he's returning to his roots.</p>
            <p style={{ ...bodyText, marginTop: 10 }}>His philosophy is simple: high-quality seasonal ingredients, patience, and the courage to let the food speak for itself.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {[["Michelin Star 2018-2022", "\u2605"], ["Author of 'La Terra'", "\u{1F4D6}"], ["Florence, Italy", "\u{1F4CD}"], ["50k+ Global Students", "\u{1F465}"]].map(([text, icon]) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 500 }}>
                  <span style={{ color: c.terracotta }}>{icon}</span> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={section}>
        <div style={{ ...maxW, textAlign: "center", marginBottom: 40 }}>
          <div style={label}>The Curriculum</div>
          <h3 style={headingLg}>A Masterclass in 4 Chapters</h3>
        </div>
        <div style={{ ...maxW, display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { ch: "01", time: "90 Minutes", title: "The Foundation: Flour, Egg, Water", desc: "Learn the science of different flour types and master the rhythmic art of hand-kneading pasta dough from scratch.", img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400" },
            { ch: "02", time: "120 Minutes", title: "The Alchemist's Sauce", desc: "Beyond the tomato. We dive into 4 classic mother sauces: Carbonara, Slow-braised Ragu, Walnut Pesto, and Brown Butter Sage.", img: "https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&q=80&w=400" },
            { ch: "03", time: "110 Minutes", title: "Meat, Fire, & Balsamic", desc: "Mastering Bistecca alla Fiorentina, pan-searing techniques, and using balsamic glaze to transform simple vegetables.", img: "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&q=80&w=400" },
            { ch: "04", time: "75 Minutes", title: "The Sweet Conclusion", desc: "Perfecting the Tiramisu (with a secret family twist) and crafting a light-as-air Panna Cotta with seasonal fruit coulis.", img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80&w=400" },
          ].map((item) => (
            <div key={item.ch} style={{ background: c.cardBg, border: "1px solid rgba(255,255,255,0.04)", padding: 24, display: "flex", gap: 24, alignItems: "center" }}>
              <img src={item.img} alt="" style={{ width: 120, height: 90, objectFit: "cover", flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: c.amber, fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>Chapter {item.ch}</span>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{item.time}</span>
                </div>
                <h4 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700, margin: "4px 0 6px" }}>{item.title}</h4>
                <p style={{ ...bodyText, fontSize: 11 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ ...section, position: "relative", background: c.dark }}>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
          {[
            { name: "Sarah Jenkins", role: "Home Chef, UK", quote: "I've been cooking for 20 years, but Marco taught me techniques I never found in any book. The pasta texture is a game-changer." },
            { name: "David Chen", role: "Food Photographer, USA", quote: "The production value is stunning. It feels like having a world-class chef standing right next to you in your own kitchen.", highlight: true },
            { name: "Elena Ricci", role: "Restaurant Owner, Italy", quote: "Finally, a course that focuses on the 'why' and not just the 'what'. This is true culinary education for serious enthusiasts." },
          ].map((t) => (
            <div key={t.name} style={{ padding: 24, border: `1px solid ${t.highlight ? "rgba(196,77,42,0.3)" : "rgba(255,255,255,0.08)"}`, background: "rgba(26,16,8,0.5)", transform: t.highlight ? "translateY(-12px)" : undefined }}>
              <div style={{ color: c.amber, fontSize: 14, marginBottom: 12 }}>{"\u2605".repeat(5)}</div>
              <p style={{ fontFamily: font.display, fontStyle: "italic", fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>"{t.quote}"</p>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#3a3a3a" }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{t.name}</div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ ...section, background: c.darkAlt }}>
        <div style={{ textAlign: "center", marginBottom: 40, ...maxW }}>
          <div style={label}>Your Invitation</div>
          <h3 style={headingLg}>Choose Your Experience</h3>
          <p style={{ ...bodyText, marginTop: 8 }}>Join a community of food lovers dedicated to the craft of Italian cooking.</p>
        </div>
        <div style={{ ...maxW, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, alignItems: "stretch" }}>
          {[
            { name: "The Enthusiast", sub: "For the casual home cook", price: "$149", note: "One-time payment", features: ["All 4 core video chapters", "Digital recipe book (PDF)", "Essential kitchen tool list"], disabled: ["Private community access"], cta: "Select Plan", primary: false },
            { name: "The Maestro", sub: "For the serious practitioner", price: "$299", note: "One-time payment", badge: "Most Popular", features: ["All video chapters + UHD access", "Hardcover Recipe Book (Shipped)", "Private Discord Community", "Live Q&A Sessions (Monthly)", "Certificate of Completion"], disabled: [], cta: "Secure Your Spot", primary: true },
            { name: "The Private Reserve", sub: "For the ultimate mentor experience", price: "$999", note: "Limited to 10/mo", features: ["Everything in Maestro plan", "2x Private 1-on-1 Zoom Calls", "Personalized recipe critique", "Exclusive Tuscany Sourcing Guide"], disabled: [], cta: "Apply for Private", primary: false },
          ].map((p) => (
            <div key={p.name} style={{ background: c.dark, border: p.primary ? `2px solid ${c.terracotta}` : "1px solid rgba(255,255,255,0.08)", padding: 28, display: "flex", flexDirection: "column", position: "relative", transform: p.primary ? "scale(1.04)" : undefined, boxShadow: p.primary ? "0 8px 40px rgba(0,0,0,0.4)" : undefined }}>
              {p.badge && (
                <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", background: c.terracotta, color: "#fff", padding: "3px 10px", fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>{p.badge}</div>
              )}
              <h4 style={{ fontFamily: font.display, fontSize: 18, fontWeight: 700 }}>{p.name}</h4>
              <p style={{ fontStyle: "italic", color: "rgba(255,255,255,0.3)", fontSize: 11, marginBottom: 16 }}>{p.sub}</p>
              <div style={{ marginBottom: 16 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: c.amber }}>{p.price}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginLeft: 6 }}>{p.note}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, flex: 1, marginBottom: 20 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center" }}>
                    <span style={checkMark}>{"\u2713"}</span> {f}
                  </li>
                ))}
                {p.disabled.map((f) => (
                  <li key={f} style={{ fontSize: 11, marginBottom: 8, display: "flex", alignItems: "center", opacity: 0.3 }}>
                    <span style={{ ...checkMark, color: "rgba(255,255,255,0.3)" }}>{"\u2717"}</span> {f}
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: "center", padding: "10px 0", fontWeight: 700, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.15em", background: p.primary ? c.terracotta : "transparent", color: p.primary ? "#fff" : c.cream, border: p.primary ? "none" : "1px solid rgba(255,255,255,0.15)" }}>{p.cta}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ background: c.terracotta, padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>{"\u{1F374}"}</div>
        <h2 style={{ fontFamily: font.display, fontSize: 32, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>Ready to transform your kitchen?</h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto 20px" }}>Join Marco and hundreds of other students rediscovering the joy of artisanal Italian cooking. 30-day money-back guarantee.</p>
        <span style={{ display: "inline-block", background: c.dark, color: "#fff", padding: "14px 32px", fontWeight: 700, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>Start Now</span>
      </section>

      {/* Footer */}
      <footer style={{ background: c.footerBg, padding: "32px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ ...maxW, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              <span style={{ color: c.terracotta, fontSize: 14 }}>{"\u2726"}</span>
              <span style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>Rossi Masterclass</span>
            </div>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>&copy; 2024 Marco Rossi Culinary Arts. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)" }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
