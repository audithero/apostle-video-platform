import { type CSSProperties } from "react";

const bodyFont = "'Nunito', sans-serif";
const accentFont = "'Barlow Condensed', sans-serif";
const darkBg = "#2D2D2D";
const mainBg = "#262626";
const cardBg = "#FEF9EF";
const amberDark = "#F59E0B";
const yellow = "#FBBF24";
const cardText = "#2D2D2D";
const textMuted = "#9CA3AF";

const page: CSSProperties = { minHeight: "100vh", display: "flex", fontFamily: bodyFont, color: "#fff", background: darkBg };
const sidebar: CSSProperties = { width: 288, background: darkBg, borderRight: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", padding: 24, flexShrink: 0 };
const mainArea: CSSProperties = { flex: 1, background: mainBg, overflowY: "auto" as const, position: "relative" };
const accentLabel: CSSProperties = { fontFamily: accentFont, textTransform: "uppercase" as const, letterSpacing: "0.15em" };
const postCard: CSSProperties = { background: cardBg, borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" };

const navItems = [
  { label: "Home Hub", icon: "\u2302", active: true },
  { label: "Photo Critique", icon: "\u2709", active: false },
  { label: "Daily Showcase", icon: "\u25A3", active: false },
  { label: "Gear Talk", icon: "\u2699", active: false },
];

const leaderboardData = [
  { rank: 1, name: "Marcus Thorne", xp: "2,450 XP", seed: "Marcus", highlight: true },
  { rank: 2, name: "Elena Vasquez", xp: "2,120 XP", seed: "Elena", highlight: false },
  { rank: 3, name: "Jin Nakamura", xp: "1,980 XP", seed: "Jin", highlight: false },
  { rank: 4, name: "Sarah Chen", xp: "1,740 XP", seed: "Sarah", highlight: false },
  { rank: 5, name: "Leo G.", xp: "1,620 XP", seed: "Leo", highlight: false },
];

const earnedBadges = [
  { label: "Golden Hour", icon: "\u2600" },
  { label: "Quick Draw", icon: "\u26A1" },
  { label: "Mentor", icon: "\u2687" },
  { label: "Stealth", icon: "\u2298" },
];

const lockedBadges = [
  { label: "Global", icon: "\u2609" },
  { label: "Master", icon: "\u2605" },
];

export default function CommunityPreview() {
  return (
    <div style={page}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, background: amberDark, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 15px rgba(245,158,11,0.3)" }}>
            <span style={{ fontSize: 20, color: darkBg }}>\u25CE</span>
          </div>
          <h1 style={{ fontFamily: accentFont, fontSize: 24, fontWeight: 800, letterSpacing: "-0.01em", textTransform: "uppercase" as const, fontStyle: "italic" }}>Aperture</h1>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 12,
                fontWeight: 700,
                background: item.active ? amberDark : "transparent",
                color: item.active ? darkBg : "#9CA3AF",
              }}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ marginTop: "auto" }}>
          <div style={{ padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.1)" }}>
            <h4 style={{ ...accentLabel, fontSize: 11, color: textMuted, marginBottom: 12 }}>Community Pulse</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#9CA3AF" }}>Members</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: yellow }}>12.4k</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 14, color: "#9CA3AF" }}>Online</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#4ADE80", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                  842
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={mainArea}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 32 }}>
          {/* Hero Header */}
          <header style={{ marginBottom: 40 }}>
            <div style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 24,
              background: "linear-gradient(135deg, #3D3D3D, #2D2D2D)",
              border: "1px solid rgba(255,255,255,0.05)",
              padding: "48px 48px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
            }}>
              <span style={{ padding: "4px 12px", background: "rgba(245,158,11,0.2)", color: amberDark, borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: accentFont, textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>Welcome Back, Elena</span>
              <h2 style={{ fontSize: 52, fontWeight: 900, marginTop: 16, marginBottom: 24, lineHeight: 1.1 }}>
                Capture the <span style={{ color: amberDark }}>World</span>,<br />Share your <span style={{ color: yellow }}>Soul</span>.
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ padding: "12px 24px", background: amberDark, color: darkBg, borderRadius: 999, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  \u2191 Upload Masterpiece
                </span>
                <div style={{ display: "flex" }}>
                  {["Felix", "Aria", "Caleb"].map((seed, i) => (
                    <img
                      key={seed}
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                      alt={`Community member ${seed}`}
                      style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${darkBg}`, marginLeft: i > 0 ? -12 : 0 }}
                    />
                  ))}
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3D3D3D", border: `2px solid ${darkBg}`, marginLeft: -12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#D1D5DB" }}>+12</div>
                </div>
                <span style={{ fontSize: 13, color: "#9CA3AF" }}>Others are uploading right now</span>
              </div>
            </div>
          </header>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
            {/* Feed Column */}
            <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ ...accentLabel, fontSize: 18, fontWeight: 800, color: textMuted }}>Community Feed</h3>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", background: "rgba(255,255,255,0.05)", color: amberDark, borderRadius: 8 }}>Trending</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", color: "#6B7280", borderRadius: 8 }}>Newest</span>
                </div>
              </div>

              {/* Post 1: Photo */}
              <article style={postCard}>
                <div style={{ padding: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Julian" alt="Julian Rivers avatar" style={{ width: 44, height: 44, borderRadius: "50%", border: `2px solid ${yellow}` }} />
                    <div>
                      <h4 style={{ color: cardText, fontWeight: 800 }}>Julian Rivers</h4>
                      <p style={{ color: "rgba(45,45,45,0.6)", fontSize: 12 }}>Golden Hour Enthusiast \u2022 2h ago</p>
                    </div>
                    <span style={{ marginLeft: "auto", color: "rgba(45,45,45,0.4)", fontSize: 18 }}>\u2026</span>
                  </div>
                  <h5 style={{ color: cardText, fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Morning mist in the Black Forest.</h5>
                  <div style={{ position: "relative", marginBottom: 16 }}>
                    <img
                      src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200"
                      alt="Misty forest landscape at sunrise"
                      style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 16 }}
                    />
                    <div style={{ position: "absolute", bottom: 12, right: 12, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)", color: "#fff", padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>
                      ISO 100 \u2022 f/4.5 \u2022 1/200
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 24, color: cardText }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>\u2661</span><span style={{ fontSize: 13, fontWeight: 700 }}>1.2k</span></span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>\u2709</span><span style={{ fontSize: 13, fontWeight: 700 }}>84</span></span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 18 }}>\u21AA</span><span style={{ fontSize: 13, fontWeight: 700 }}>12</span></span>
                    <span style={{ marginLeft: "auto", fontSize: 18 }}>\u2691</span>
                  </div>
                </div>
              </article>

              {/* Post 2: Question */}
              <article style={{ ...postCard, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah Chen avatar" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                  <div>
                    <h4 style={{ color: cardText, fontWeight: 800 }}>Sarah Chen</h4>
                    <p style={{ color: "rgba(45,45,45,0.6)", fontSize: 12 }}>Gear Specialist \u2022 5h ago</p>
                  </div>
                </div>
                <h5 style={{ color: cardText, fontSize: 17, fontWeight: 800, marginBottom: 8 }}>What's your go-to lens for street photography in Tokyo?</h5>
                <p style={{ color: "rgba(45,45,45,0.8)", lineHeight: 1.6, marginBottom: 24 }}>
                  Planning a trip next month! I'm torn between a fixed 35mm f/1.8 or a wider 24mm. Anyone have experience with the crowds there? I want that cinematic compression but space might be tight.
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 24, borderTop: "1px solid rgba(45,45,45,0.1)", paddingTop: 16 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: cardText, fontWeight: 700 }}>
                    <span style={{ fontSize: 20, color: amberDark }}>\u25B2</span> 422
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8, color: cardText, fontWeight: 700 }}>
                    <span style={{ fontSize: 16 }}>\u2709</span> 156 comments
                  </span>
                </div>
              </article>

              {/* Post 3: Celebration */}
              <article style={{ ...postCard, padding: 24, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -48, right: -48, width: 96, height: 96, background: yellow, opacity: 0.1, transform: "rotate(45deg)" }} />
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" alt="Marcus Thorne avatar" style={{ width: 44, height: 44, borderRadius: "50%" }} />
                  <div>
                    <h4 style={{ color: cardText, fontWeight: 800 }}>Marcus Thorne</h4>
                    <p style={{ color: "rgba(45,45,45,0.6)", fontSize: 12 }}>Community Moderator \u2022 8h ago</p>
                  </div>
                </div>
                <div style={{ padding: 16, background: "rgba(251,191,36,0.1)", borderRadius: 16, border: "1px solid rgba(251,191,36,0.2)", marginBottom: 16 }}>
                  <h5 style={{ color: cardText, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: amberDark }}>\u2655</span> New Achievement Unlocked!
                  </h5>
                  <p style={{ color: "rgba(45,45,45,0.7)", fontSize: 13, fontStyle: "italic" }}>"Aperture Legend" - 100 consecutive days of participation</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ display: "flex", gap: 4, fontSize: 20 }}>
                    <span>\uD83D\uDD25</span>
                    <span>\uD83D\uDC4F</span>
                    <span>\uD83C\uDF89</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cardText }}>Liked by 24 moderators</span>
                </div>
              </article>
            </section>

            {/* Right Sidebar */}
            <aside style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {/* Leaderboard */}
              <div style={{ background: darkBg, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 24, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <h3 style={{ ...accentLabel, color: yellow, fontWeight: 900, fontSize: 14 }}>Top Photographers</h3>
                  <span style={{ color: yellow, fontSize: 18 }}>\u2655</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {leaderboardData.map((u) => (
                    <div key={u.name} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 12,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 16,
                      border: u.highlight ? `1px solid rgba(251,191,36,0.3)` : "1px solid rgba(255,255,255,0.05)",
                      ...(u.highlight ? { boxShadow: "0 0 0 1px rgba(251,191,36,0.3)" } : {}),
                    }}>
                      <span style={{ fontFamily: accentFont, fontSize: 20, fontWeight: 900, color: u.highlight ? yellow : "#6B7280", width: 24 }}>{u.rank}</span>
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.seed}`} alt={`${u.name} avatar`} style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</p>
                        <p style={{ fontSize: 12, color: "#6B7280" }}>{u.xp}</p>
                      </div>
                      {u.highlight && <span style={{ color: "#4ADE80", fontSize: 14 }}>\u2197</span>}
                    </div>
                  ))}
                </div>
                <div style={{ width: "100%", marginTop: 24, padding: "12px 0", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#9CA3AF" }}>
                  View Full Rankings
                </div>
              </div>

              {/* Badges */}
              <div style={{ background: darkBg, border: "1px solid rgba(255,255,255,0.05)", borderRadius: 24, padding: 24, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
                <h3 style={{ ...accentLabel, color: yellow, fontWeight: 900, fontSize: 14, marginBottom: 24 }}>Your Badges</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                  {earnedBadges.map((b) => (
                    <div key={b.label} style={{
                      aspectRatio: "1",
                      background: "rgba(251,191,36,0.1)",
                      borderRadius: 16,
                      border: "1px solid rgba(251,191,36,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}>
                      <span style={{ fontSize: 22, color: yellow }}>{b.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: accentFont, color: yellow, textTransform: "uppercase" as const, textAlign: "center" }}>{b.label}</span>
                    </div>
                  ))}
                  {lockedBadges.map((b) => (
                    <div key={b.label} style={{
                      aspectRatio: "1",
                      background: "rgba(0,0,0,0.2)",
                      borderRadius: 16,
                      border: "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: 0.5,
                      filter: "grayscale(100%)",
                    }}>
                      <span style={{ fontSize: 22, color: "#9CA3AF" }}>{b.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, fontFamily: accentFont, color: "#6B7280", textTransform: "uppercase" as const, textAlign: "center" }}>{b.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
