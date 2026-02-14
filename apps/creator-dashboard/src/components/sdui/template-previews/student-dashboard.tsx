import { type CSSProperties } from "react";

const c = {
  bg: "#FAFBFC",
  purple: "#7C3AED",
  purpleLight: "#7C3AED1A",
  text: "#111827",
  muted: "#64748B",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  emerald: "#10B981",
  blue: "#3B82F6",
  amber: "#F59E0B",
  rose: "#F43F5E",
};

const font = "'Plus Jakarta Sans', sans-serif";

export default function StudentDashboardPreview() {
  const page: CSSProperties = {
    minHeight: "100vh",
    background: c.bg,
    fontFamily: font,
    color: c.muted,
    display: "flex",
  };

  const sidebar: CSSProperties = {
    width: 220,
    borderRight: `1px solid ${c.border}`,
    background: c.cardBg,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  };

  const logo: CSSProperties = {
    padding: "24px 22px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const logoIcon: CSSProperties = {
    width: 34,
    height: 34,
    background: c.purple,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
  };

  const logoText: CSSProperties = {
    fontSize: 17,
    fontWeight: 800,
    color: c.text,
    letterSpacing: "-0.02em",
  };

  const navItem: (active?: boolean) => CSSProperties = (active) => ({
    padding: "10px 14px",
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    color: active ? c.purple : c.muted,
    background: active ? c.purpleLight : "transparent",
    cursor: "pointer",
    marginBottom: 4,
  });

  const navIcon: CSSProperties = {
    width: 18,
    height: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
  };

  const proCard: CSSProperties = {
    margin: "auto 16px 20px",
    background: "rgba(124,58,237,0.05)",
    borderRadius: 16,
    padding: 14,
  };

  const proBtn: CSSProperties = {
    width: "100%",
    padding: "8px 0",
    background: c.purple,
    color: "#fff",
    borderRadius: 8,
    border: "none",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  };

  const mainContent: CSSProperties = {
    flex: 1,
    padding: "24px 28px",
    overflowY: "auto" as const,
  };

  const headerRow: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    flexWrap: "wrap" as const,
    gap: 12,
  };

  const greeting: CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: c.text,
    margin: 0,
  };

  const greetingSub: CSSProperties = {
    fontSize: 13,
    marginTop: 2,
  };

  const headerRight: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: c.cardBg,
    border: `1px solid ${c.border}`,
    borderRadius: 16,
    padding: "8px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const streakIcon: CSSProperties = { fontSize: 18, color: "#F97316" };

  const statGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14,
    marginBottom: 28,
  };

  const statCard: (accentBg: string, accentFg: string) => CSSProperties = (accentBg, accentFg) => ({
    background: c.cardBg,
    padding: 16,
    borderRadius: 20,
    border: `1px solid ${c.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  });

  const statIcon: (bg: string, fg: string) => CSSProperties = (bg, fg) => ({
    width: 36,
    height: 36,
    borderRadius: 12,
    background: bg,
    color: fg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    marginBottom: 10,
  });

  const statLabel: CSSProperties = { fontSize: 11, fontWeight: 500, marginBottom: 2 };
  const statValue: CSSProperties = { fontSize: 20, fontWeight: 700, color: c.text };

  const twoCol: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 20,
    marginBottom: 28,
  };

  const sectionTitle: CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: c.text,
    marginBottom: 14,
  };

  const courseCard: CSSProperties = {
    background: c.cardBg,
    padding: 14,
    borderRadius: 20,
    border: `1px solid ${c.border}`,
    display: "flex",
    gap: 14,
    alignItems: "center",
    marginBottom: 10,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const courseIcon: (bg: string, fg: string) => CSSProperties = (bg, fg) => ({
    width: 56,
    height: 56,
    borderRadius: 14,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: fg,
    fontSize: 22,
    flexShrink: 0,
  });

  const progressBarOuter: CSSProperties = {
    width: "100%",
    height: 6,
    background: "#F1F5F9",
    borderRadius: 99,
    marginTop: 8,
    overflow: "hidden",
  };

  const progressBarInner: (pct: string, color: string) => CSSProperties = (pct, color) => ({
    width: pct,
    height: "100%",
    background: color,
    borderRadius: 99,
  });

  const tag: (bg: string, fg: string) => CSSProperties = (bg, fg) => ({
    padding: "2px 8px",
    borderRadius: 99,
    fontSize: 9,
    fontWeight: 700,
    background: bg,
    color: fg,
  });

  const chartContainer: CSSProperties = {
    background: c.cardBg,
    padding: 16,
    borderRadius: 20,
    border: `1px solid ${c.border}`,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    marginBottom: 14,
  };

  const barRow: CSSProperties = {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 120,
    gap: 6,
    marginBottom: 10,
  };

  const bar: (h: number) => CSSProperties = (h) => ({
    flex: 1,
    background: c.purple,
    height: h,
    borderRadius: "6px 6px 0 0",
    minWidth: 0,
  });

  const barLabel: CSSProperties = {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    textAlign: "center" as const,
    marginTop: 4,
  };

  const badgesRow: CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 6,
  };

  const badge: (bg: string, borderC: string, fg: string, locked?: boolean) => CSSProperties = (bg, borderC, fg, locked) => ({
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: bg,
    border: `1px solid ${borderC}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    color: fg,
    opacity: locked ? 0.35 : 1,
    filter: locked ? "grayscale(1)" : "none",
    boxShadow: locked ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
  });

  const tableSection: CSSProperties = {
    marginBottom: 28,
  };

  const table: CSSProperties = {
    width: "100%",
    background: c.cardBg,
    borderRadius: 20,
    border: `1px solid ${c.border}`,
    overflow: "hidden",
    borderCollapse: "collapse" as const,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const th: CSSProperties = {
    padding: "10px 16px",
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    background: "#F8FAFC",
    borderBottom: `1px solid ${c.border}`,
    textAlign: "left" as const,
    color: c.muted,
  };

  const td: CSSProperties = {
    padding: "10px 16px",
    fontSize: 12,
    borderBottom: `1px solid #F1F5F9`,
  };

  const mentorCard: CSSProperties = {
    background: c.purple,
    padding: 18,
    borderRadius: 20,
    color: "#fff",
    position: "relative" as const,
    overflow: "hidden",
  };

  const mentorGlow: CSSProperties = {
    position: "absolute" as const,
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    background: "rgba(255,255,255,0.1)",
    borderRadius: "50%",
    filter: "blur(30px)",
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heights = [75, 90, 45, 95, 80, 35, 22];

  return (
    <div style={page}>
      {/* Sidebar */}
      <aside style={sidebar}>
        <div style={logo}>
          <div style={logoIcon}>{"\uD83C\uDF93"}</div>
          <span style={logoText}>Apostle</span>
        </div>

        <nav style={{ padding: "0 12px", flex: 1 }}>
          <div style={navItem(true)}>
            <span style={navIcon}>{"\u25A6"}</span> Dashboard
          </div>
          <div style={navItem()}>
            <span style={navIcon}>{"\uD83D\uDCD6"}</span> My Courses
          </div>
          <div style={navItem()}>
            <span style={navIcon}>{"\uD83D\uDCC5"}</span> Schedule
          </div>
          <div style={navItem()}>
            <span style={navIcon}>{"\uD83D\uDC65"}</span> Community
          </div>
          <div style={navItem()}>
            <span style={navIcon}>{"\uD83C\uDFC6"}</span> Achievements
          </div>
        </nav>

        <div style={proCard}>
          <div style={{ fontSize: 9, fontWeight: 700, color: c.purple, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>Pro Plan</div>
          <div style={{ fontSize: 12, color: c.text, fontWeight: 500, lineHeight: 1.4, marginTop: 4 }}>Unlock all 50+ premium masterclasses</div>
          <button type="button" style={proBtn}>Upgrade Now</button>
        </div>
      </aside>

      {/* Main */}
      <main style={mainContent}>
        {/* Header */}
        <div style={headerRow}>
          <div>
            <h1 style={greeting}>Welcome back, Sarah!</h1>
            <p style={greetingSub}>
              You&apos;ve completed <span style={{ fontWeight: 700, color: c.purple }}>85%</span> of your weekly goal. Keep it up!
            </p>
          </div>
          <div style={headerRight}>
            <span style={streakIcon}>{"\uD83D\uDD25"}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>7-day streak</span>
            <div style={{ width: 1, height: 24, background: c.border, margin: "0 4px" }} />
            <span style={{ position: "relative" as const }}>
              <span style={{ fontSize: 18, color: "#94A3B8" }}>{"\uD83D\uDD14"}</span>
              <span style={{ position: "absolute" as const, top: 0, right: 0, width: 6, height: 6, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </span>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#E2E8F0", overflow: "hidden", marginLeft: 4 }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="User avatar" style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={statGrid}>
          <div style={statCard("#EFF6FF", c.blue)}>
            <div style={statIcon("#DBEAFE", "#2563EB")}>{"\uD83D\uDCDA"}</div>
            <div style={statLabel}>Courses Enrolled</div>
            <div style={statValue}>12</div>
          </div>
          <div style={statCard("#FFFBEB", c.amber)}>
            <div style={statIcon("#FEF3C7", "#D97706")}>{"\u23F1"}</div>
            <div style={statLabel}>Learning Hours</div>
            <div style={statValue}>48.5h</div>
          </div>
          <div style={statCard("#FFF1F2", c.rose)}>
            <div style={statIcon("#FFE4E6", "#E11D48")}>{"\u26A1"}</div>
            <div style={statLabel}>Current Streak</div>
            <div style={statValue}>7 Days</div>
          </div>
          <div style={statCard("#ECFDF5", c.emerald)}>
            <div style={statIcon("#D1FAE5", "#059669")}>{"\uD83C\uDFC5"}</div>
            <div style={statLabel}>Leaderboard Rank</div>
            <div style={statValue}>#14</div>
          </div>
        </div>

        {/* Progress + Activity */}
        <div style={twoCol}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={sectionTitle}>Current Progress</h2>
              <span style={{ fontSize: 11, fontWeight: 600, color: c.purple }}>View All Courses</span>
            </div>
            {/* Course 1 */}
            <div style={courseCard}>
              <div style={courseIcon("#EEF2FF", "#818CF8")}>{"\uD83D\uDCF7"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Advanced Digital Marketing</div>
                    <div style={{ fontSize: 11 }}>Instructor: Elena Vasquez</div>
                  </div>
                  <span style={tag("#ECFDF5", c.emerald)}>Active</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginTop: 8 }}>
                  <span>65% Complete</span>
                  <span>18/24 Lessons</span>
                </div>
                <div style={progressBarOuter}>
                  <div style={progressBarInner("65%", c.emerald)} />
                </div>
              </div>
            </div>
            {/* Course 2 */}
            <div style={courseCard}>
              <div style={courseIcon("#FAF5FF", "#A855F7")}>{"\uD83C\uDFA8"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Visual Storytelling</div>
                    <div style={{ fontSize: 11 }}>Instructor: Marco Rossi</div>
                  </div>
                  <span style={tag("#ECFDF5", c.emerald)}>Active</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginTop: 8 }}>
                  <span>42% Complete</span>
                  <span>8/19 Lessons</span>
                </div>
                <div style={progressBarOuter}>
                  <div style={progressBarInner("42%", c.purple)} />
                </div>
              </div>
            </div>
            {/* Course 3 */}
            <div style={{ ...courseCard, opacity: 0.8 }}>
              <div style={courseIcon("#FFFBEB", "#FBBF24")}>{"\uD83D\uDCBB"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Python for Data Science</div>
                    <div style={{ fontSize: 11 }}>Instructor: Ryan Park</div>
                  </div>
                  <span style={tag("#F1F5F9", "#64748B")}>Paused</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, fontWeight: 700, marginTop: 8 }}>
                  <span>28% Complete</span>
                  <span>5/18 Lessons</span>
                </div>
                <div style={progressBarOuter}>
                  <div style={progressBarInner("28%", "#CBD5E1")} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div>
            <h2 style={sectionTitle}>Weekly Activity</h2>
            <div style={chartContainer}>
              <div style={barRow}>
                {days.map((day, i) => (
                  <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={bar(heights[i])} />
                    <span style={barLabel}>{day}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: `1px solid #F1F5F9`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: c.purple }} />
                  <span style={{ fontSize: 10, fontWeight: 500 }}>Study Time</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: c.text }}>+12% vs last week</span>
              </div>
            </div>

            {/* Badges */}
            <div style={chartContainer}>
              <div style={{ fontSize: 13, fontWeight: 700, color: c.text, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: c.amber }}>{"\uD83C\uDFC6"}</span> Recent Badges
              </div>
              <div style={badgesRow}>
                <div style={{ textAlign: "center" as const }}>
                  <div style={badge("#EFF6FF", "#BFDBFE", c.blue)}>{"\u23F0"}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, marginTop: 4 }}>Early Bird</div>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={badge("#FFF7ED", "#FDBA74", "#F97316")}>{"\uD83D\uDD25"}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, marginTop: 4 }}>7-Day</div>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={badge("#ECFDF5", "#A7F3D0", c.emerald)}>{"\u2714"}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, marginTop: 4 }}>100%er</div>
                </div>
                <div style={{ textAlign: "center" as const }}>
                  <div style={badge("#F8FAFC", "#E2E8F0", "#94A3B8", true)}>{"\u2605"}</div>
                  <div style={{ fontSize: 8, fontWeight: 700, marginTop: 4, opacity: 0.4 }}>Elite</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={twoCol}>
          <div style={tableSection}>
            <h2 style={sectionTitle}>Upcoming Lessons</h2>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th} scope="col">Lesson Name</th>
                  <th style={th} scope="col">Date & Time</th>
                  <th style={th} scope="col">Type</th>
                  <th style={th} scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#4F46E5" }}>{"\uD83C\uDFA5"}</div>
                      <span style={{ fontWeight: 600, color: c.text }}>SEO Strategy & Planning</span>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 11 }}>Oct 14, 2023</div>
                    <div style={{ fontSize: 10 }}>10:00 AM - 11:30 AM</div>
                  </td>
                  <td style={td}><span style={{ ...tag("#F1F5F9", "#64748B"), fontSize: 9 }}>Live Stream</span></td>
                  <td style={td}><span style={{ color: c.purple, fontWeight: 700, fontSize: 11 }}>Join Now</span></td>
                </tr>
                <tr>
                  <td style={td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "#FAF5FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#7C3AED" }}>{"\uD83D\uDCD6"}</div>
                      <span style={{ fontWeight: 600, color: c.text }}>Character Depth Exercises</span>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 700, color: c.text, fontSize: 11 }}>Oct 15, 2023</div>
                    <div style={{ fontSize: 10 }}>Anytime</div>
                  </td>
                  <td style={td}><span style={{ ...tag("#EFF6FF", "#3B82F6"), fontSize: 9 }}>Assignment</span></td>
                  <td style={td}><span style={{ color: "#94A3B8", fontWeight: 700, fontSize: 11 }}>Locked</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mentor */}
          <div>
            <h2 style={sectionTitle}>Course Mentor</h2>
            <div style={mentorCard}>
              <div style={mentorGlow} />
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, position: "relative" as const, zIndex: 1 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, border: "2px solid rgba(255,255,255,0.2)", overflow: "hidden" }}>
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Elena" alt="Mentor avatar" style={{ width: "100%", height: "100%", background: "#fff" }} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Elena Vasquez</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>Digital Strategist</div>
                </div>
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.6, opacity: 0.9, marginBottom: 14, position: "relative" as const, zIndex: 1 }}>
                &ldquo;Don&apos;t focus on having all the answers. Focus on asking the right questions. You&apos;re doing great!&rdquo;
              </p>
              <button type="button" style={{ width: "100%", padding: "10px 0", background: "#fff", color: c.purple, borderRadius: 10, border: "none", fontSize: 12, fontWeight: 800, cursor: "pointer", position: "relative" as const, zIndex: 1 }}>
                Ask a Question
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
