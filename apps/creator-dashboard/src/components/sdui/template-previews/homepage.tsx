import { type CSSProperties } from "react";

const darkBg = "#1a1a2e";
const accentBlue = "#0066FF";
const lightSection = "#f0f0f5";
const displayFont = "'Space Grotesk', sans-serif";
const bodyFont = "'Inter', sans-serif";

const nav: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  width: "100%",
  backgroundColor: darkBg,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  padding: "16px 48px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  boxSizing: "border-box",
  fontFamily: bodyFont,
};

const section: (bg: string) => CSSProperties = (bg) => ({
  backgroundColor: bg,
  padding: "80px 48px",
  boxSizing: "border-box",
  fontFamily: bodyFont,
});

export default function HomepagePreview() {
  const starChar = "\u2605";
  const halfStar = "\u2606";
  const checkMark = "\u2713";

  const categories = [
    { icon: "\uD83C\uDFA8", name: "Design" },
    { icon: "\uD83D\uDCBB", name: "Development" },
    { icon: "\uD83D\uDCBC", name: "Business" },
    { icon: "\uD83D\uDCC8", name: "Marketing" },
    { icon: "\uD83C\uDFB5", name: "Music" },
    { icon: "\uD83D\uDCF7", name: "Photography" },
  ];

  const courses = [
    {
      img: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&q=80&w=800",
      badge: "Best Seller",
      badgeBg: "rgba(255,255,255,0.9)",
      badgeColor: darkBg,
      cat: "Product Design",
      title: "Advanced UI/UX Systems with Figma",
      stars: 5,
      reviews: "2.1k",
      price: "$89.99",
      original: "$129.99",
    },
    {
      img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800",
      badge: "New",
      badgeBg: "#4f46e5",
      badgeColor: "#fff",
      cat: "Web Dev",
      title: "Mastering React 18 & Advanced Patterns",
      stars: 5,
      reviews: "1.5k",
      price: "$129.99",
      original: "$159.99",
    },
    {
      img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
      badge: null,
      badgeBg: "",
      badgeColor: "",
      cat: "Marketing",
      title: "Digital Marketing ROI & Growth Hacking",
      stars: 4.5,
      reviews: "980",
      price: "$74.99",
      original: "$99.00",
    },
    {
      img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
      badge: "Best Seller",
      badgeBg: "rgba(255,255,255,0.9)",
      badgeColor: darkBg,
      cat: "Business",
      title: "Executive Leadership & Management",
      stars: 5,
      reviews: "3.2k",
      price: "$94.99",
      original: "$149.99",
    },
  ];

  const communityPosts = [
    {
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      name: "Sarah Jenkins",
      time: "2 mins ago",
      text: "Just completed Advanced UI/UX Systems module 4! The section on design tokens was eye-opening.",
      likes: 24,
      comments: 3,
    },
    {
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e",
      name: "David Chen",
      time: "15 mins ago",
      text: "Earned the Master Coder badge for completing 3 months of daily learning streaks!",
      likes: 56,
      comments: 12,
    },
    {
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f",
      name: "Maria Garcia",
      time: "1 hour ago",
      text: "Is anyone taking the Business Strategy workshop this Saturday? Would love to form a study group!",
      likes: 8,
      comments: 15,
    },
  ];

  const leaderboard = [
    { rank: "01", name: "Alex Rivera", pts: "2,450", avatar: "https://i.pravatar.cc/150?u=1", trend: "+12", color: "#10b981" },
    { rank: "02", name: "Jordan Smith", pts: "2,120", avatar: "https://i.pravatar.cc/150?u=2", trend: "+5", color: "#10b981" },
    { rank: "03", name: "Sarah Kim", pts: "1,980", avatar: "https://i.pravatar.cc/150?u=3", trend: "--", color: "#6b7280" },
    { rank: "04", name: "Liam Wilson", pts: "1,840", avatar: "https://i.pravatar.cc/150?u=4", trend: "-2", color: "#f43f5e" },
    { rank: "05", name: "Emma Vance", pts: "1,760", avatar: "https://i.pravatar.cc/150?u=5", trend: "+8", color: "#10b981" },
  ];

  const renderStars = (count: number) => {
    const full = Math.floor(count);
    const hasHalf = count % 1 !== 0;
    return (
      <span style={{ color: "#f59e0b", fontSize: 14, letterSpacing: 1 }}>
        {starChar.repeat(full)}
        {hasHalf ? halfStar : ""}
      </span>
    );
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: bodyFont, backgroundColor: darkBg, color: lightSection, overflowX: "hidden" }}>
      {/* Nav */}
      <nav style={nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 40, height: 40, backgroundColor: accentBlue, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 18 }}>H</div>
          <span style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>HORIZON</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 32, fontSize: 13, fontWeight: 500, color: "#9ca3af" }}>
          <span>Courses</span>
          <span>Mentors</span>
          <span>Community</span>
          <span>Enterprise</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#d1d5db", padding: "8px 16px" }}>Log In</span>
          <span style={{ backgroundColor: accentBlue, color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 24px", borderRadius: 999 }}>Join for Free</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ ...section(darkBg), padding: "80px 48px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "20%", width: 400, height: 400, backgroundColor: accentBlue, borderRadius: "50%", filter: "blur(120px)", opacity: 0.1 }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "20%", width: 300, height: 300, backgroundColor: "#6366F1", borderRadius: "50%", filter: "blur(100px)", opacity: 0.1 }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 10 }}>
          <span style={{ display: "inline-block", padding: "4px 16px", borderRadius: 999, border: "1px solid rgba(59,130,246,0.3)", backgroundColor: "rgba(59,130,246,0.1)", color: "#60a5fa", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 24 }}>New Winter Cohorts Open</span>
          <h1 style={{ fontFamily: displayFont, fontSize: 56, fontWeight: 700, color: "#fff", marginBottom: 32, lineHeight: 1.1 }}>
            Unlock Your Potential with <span style={{ color: accentBlue }}>Industry Experts</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 18, maxWidth: 640, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Access over 1,500 premium courses in design, development, and business. Start your journey with the world's most innovative learning community.
          </p>
          <div style={{ position: "relative", maxWidth: 640, margin: "0 auto", width: "100%" }}>
            <div style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "18px 160px 18px 48px", color: "#6b7280", fontSize: 15, boxSizing: "border-box" }}>
              What do you want to learn today?
            </div>
            <div style={{ position: "absolute", right: 8, top: 8, bottom: 8, backgroundColor: accentBlue, color: "#fff", padding: "0 32px", borderRadius: 12, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center" }}>Find Courses</div>
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 32, color: "#6b7280", fontSize: 13 }}>
            {["Lifetime Access", "24/7 Expert Support", "Verified Certificates"].map((t) => (
              <div key={t} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: accentBlue, fontWeight: 700 }}>{checkMark}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={section(lightSection)}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 40 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 700, color: darkBg }}>Explore Categories</h2>
            <span style={{ color: accentBlue, fontWeight: 600, fontSize: 14 }}>View All &rarr;</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }}>
            {categories.map((c) => (
              <div key={c.name} style={{ backgroundColor: "#fff", padding: 24, borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, border: "1px solid #e5e7eb", textAlign: "center" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", backgroundColor: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>{c.icon}</div>
                <span style={{ fontWeight: 700, color: darkBg, fontSize: 13 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={section("#ffffff")}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 32, fontWeight: 700, color: darkBg, marginBottom: 16 }}>Featured Learning Paths</h2>
            <p style={{ color: "#6b7280" }}>The most popular courses chosen by our community of 50,000+ students</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32 }}>
            {courses.map((c) => (
              <div key={c.title} style={{ cursor: "pointer" }}>
                <div style={{ position: "relative", marginBottom: 16, overflow: "hidden", borderRadius: 16, height: 180 }}>
                  <img src={c.img} alt={c.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {c.badge ? (
                    <div style={{ position: "absolute", top: 12, left: 12, backgroundColor: c.badgeBg, padding: "4px 8px", borderRadius: 8, fontSize: 11, fontWeight: 700, color: c.badgeColor, textTransform: "uppercase" }}>{c.badge}</div>
                  ) : null}
                </div>
                <div style={{ fontSize: 11, fontWeight: 600, color: accentBlue, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{c.cat}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: darkBg, marginBottom: 8, lineHeight: 1.3 }}>{c.title}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  {renderStars(c.stars)}
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>({c.reviews} reviews)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: darkBg }}>{c.price}</span>
                  <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>{c.original}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community */}
      <section style={section(lightSection)}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr", gap: 48 }}>
          {/* Feed */}
          <div>
            <h2 style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 700, color: darkBg, marginBottom: 32, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ color: accentBlue }}>&#9679;</span> Community Activity
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {communityPosts.map((p) => (
                <div key={p.name} style={{ backgroundColor: "#fff", padding: 20, borderRadius: 16, border: "1px solid #e5e7eb", display: "flex", gap: 16 }}>
                  <img src={p.avatar} alt={p.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <h4 style={{ fontWeight: 700, color: darkBg, fontSize: 14 }}>{p.name}</h4>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{p.time}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.5 }}>{p.text}</p>
                    <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{"\uD83D\uDC4D"} {p.likes} Likes</span>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{"\uD83D\uDCAC"} {p.comments} Comments</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Leaderboard */}
          <div>
            <div style={{ backgroundColor: darkBg, borderRadius: 24, padding: 32, color: "#fff" }}>
              <h3 style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                Leaderboard <span style={{ color: "#f59e0b" }}>{"\uD83C\uDFC6"}</span>
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {leaderboard.map((l) => (
                  <div key={l.rank} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <span style={{ width: 24, fontSize: 13, fontWeight: 700, color: "#6b7280" }}>{l.rank}</span>
                    <img src={l.avatar} alt={l.name} style={{ width: 40, height: 40, borderRadius: "50%", border: l.rank === "01" ? "2px solid #f59e0b" : "1px solid rgba(255,255,255,0.1)" }} />
                    <div style={{ flex: 1 }}>
                      <h5 style={{ fontSize: 13, fontWeight: 700 }}>{l.name}</h5>
                      <p style={{ fontSize: 10, color: "#6b7280" }}>{l.pts} points</p>
                    </div>
                    <span style={{ fontSize: 10, color: l.color, fontWeight: 600 }}>{l.trend}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 40, padding: "12px 0", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", textAlign: "center", fontSize: 13, fontWeight: 600 }}>View Full Ranking</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={section("#ffffff")}>
        <div style={{ maxWidth: 900, margin: "0 auto", borderRadius: 48, backgroundColor: accentBlue, padding: "80px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 256, height: 256, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "50%", transform: "translate(50%, -50%)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: 128, height: 128, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "50%", transform: "translate(-50%, 50%)" }} />
          <div style={{ position: "relative", zIndex: 10 }}>
            <h2 style={{ fontFamily: displayFont, fontSize: 40, fontWeight: 700, color: "#fff", marginBottom: 24 }}>Ready to join the academy?</h2>
            <p style={{ color: "#bfdbfe", fontSize: 17, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
              Join 50,000+ students from 120 countries and start building your dream career today with Horizon Academy.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
              <span style={{ backgroundColor: "#fff", color: accentBlue, fontWeight: 700, padding: "16px 40px", borderRadius: 999, fontSize: 16 }}>Start Learning Now</span>
              <span style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", fontWeight: 700, padding: "16px 40px", borderRadius: 999, fontSize: 16 }}>Become a Mentor</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: darkBg, padding: "80px 48px 40px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr", gap: 48, marginBottom: 64 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 32, height: 32, backgroundColor: accentBlue, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>H</div>
              <span style={{ fontFamily: displayFont, fontSize: 18, fontWeight: 700, color: "#fff" }}>HORIZON</span>
            </div>
            <p style={{ color: "#6b7280", fontSize: 13, lineHeight: 1.7, marginBottom: 24 }}>The premier platform for creators, builders, and visionaries to master new skills and build a future they love.</p>
            <div style={{ display: "flex", gap: 12 }}>
              {["\uD835\uDD4F", "in", "\uD83D\uDCF8"].map((icon, i) => (
                <div key={i} style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: 14 }}>{icon}</div>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Quick Links</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, color: "#6b7280" }}>
              <span>Our Courses</span>
              <span>Community Hub</span>
              <span>Student Success</span>
              <span>Become a Mentor</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Resources</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 13, color: "#6b7280" }}>
              <span>Documentation</span>
              <span>API Reference</span>
              <span>Career Services</span>
              <span>Help Center</span>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, marginBottom: 24, fontSize: 14 }}>Stay Updated</h4>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>Get the latest course news and community updates.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "8px 16px", fontSize: 13, color: "#6b7280" }}>Your email</div>
              <div style={{ backgroundColor: accentBlue, color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>Join</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1200, margin: "0 auto", paddingTop: 40, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, color: "#4b5563" }}>
          <p>&copy; 2024 Horizon Academy. All rights reserved.</p>
          <div style={{ display: "flex", gap: 32 }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Cookie Settings</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
