import { type CSSProperties } from "react";

const c = {
  bg: "#111111",
  indigo: "#6366F1",
  emerald: "#10B981",
  darkPanel: "#1A1A1A",
  border: "#2A2A2A",
  sidebar: "#161616",
  white: "#FFFFFF",
  text: "#CBD5E1",
  muted: "#64748B",
  dim: "#475569",
};

const font = "'DM Sans', sans-serif";

export default function LessonPlayerPreview() {
  const page: CSSProperties = {
    minHeight: "100vh",
    background: c.bg,
    fontFamily: font,
    color: c.text,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const header: CSSProperties = {
    height: 56,
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid rgba(255,255,255,0.05)`,
    background: c.bg,
    flexShrink: 0,
  };

  const exitLink: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: 500,
    textDecoration: "none",
  };

  const divider: CSSProperties = {
    width: 1,
    height: 20,
    background: "rgba(255,255,255,0.1)",
    margin: "0 12px",
  };

  const courseTitle: CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: c.white,
    letterSpacing: "-0.01em",
  };

  const courseSubtitle: CSSProperties = {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
    fontWeight: 700,
  };

  const progressBar: CSSProperties = {
    width: 100,
    height: 5,
    background: "rgba(255,255,255,0.1)",
    borderRadius: 99,
    overflow: "hidden",
  };

  const progressFill: CSSProperties = {
    width: "42%",
    height: "100%",
    background: c.emerald,
    borderRadius: 99,
  };

  const progressText: CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    color: c.emerald,
    marginLeft: 8,
  };

  const avatar: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.1)",
    overflow: "hidden",
  };

  const mainLayout: CSSProperties = {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  };

  const contentArea: CSSProperties = {
    flex: 1,
    overflowY: "auto" as const,
    padding: "16px 24px",
  };

  const videoContainer: CSSProperties = {
    position: "relative" as const,
    aspectRatio: "16/9",
    background: "#000",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
  };

  const videoImage: CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    opacity: 0.6,
  };

  const playButton: CSSProperties = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 64,
    height: 64,
    background: c.indigo,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(99,102,241,0.3)",
    border: "none",
  };

  const playTriangle: CSSProperties = {
    width: 0,
    height: 0,
    borderLeft: "22px solid white",
    borderTop: "14px solid transparent",
    borderBottom: "14px solid transparent",
    marginLeft: 4,
  };

  const lessonInfo: CSSProperties = {
    marginTop: 24,
    paddingBottom: 20,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    flexWrap: "wrap" as const,
  };

  const lessonTitle: CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: c.white,
    margin: 0,
  };

  const lessonSeries: CSSProperties = {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  };

  const navButtons: CSSProperties = {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  };

  const btnPrev: CSSProperties = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: c.text,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const btnNext: CSSProperties = {
    padding: "8px 14px",
    borderRadius: 10,
    border: "none",
    background: c.indigo,
    color: c.white,
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const tabs: CSSProperties = {
    marginTop: 24,
    display: "flex",
    gap: 24,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    marginBottom: 20,
  };

  const tabActive: CSSProperties = {
    paddingBottom: 12,
    borderBottom: `2px solid ${c.indigo}`,
    color: c.white,
    fontWeight: 500,
    fontSize: 12,
    background: "none",
    border: "none",
    borderBottomWidth: 2,
    borderBottomStyle: "solid" as const,
    borderBottomColor: c.indigo,
    cursor: "pointer",
  };

  const tabInactive: CSSProperties = {
    paddingBottom: 12,
    color: "#64748B",
    fontWeight: 500,
    fontSize: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
  };

  const notesTitle: CSSProperties = {
    fontSize: 16,
    fontWeight: 700,
    color: c.white,
    marginBottom: 10,
  };

  const notesText: CSSProperties = {
    fontSize: 12,
    color: "#94A3B8",
    lineHeight: 1.7,
  };

  const noteItem: CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    marginTop: 12,
  };

  const noteCheck: CSSProperties = {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "rgba(16,185,129,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: c.emerald,
    fontSize: 10,
    fontWeight: 700,
    marginTop: 2,
  };

  const sidebar: CSSProperties = {
    width: 320,
    borderLeft: "1px solid rgba(255,255,255,0.05)",
    background: c.sidebar,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  };

  const sidebarHeader: CSSProperties = {
    padding: "16px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  const sidebarTitle: CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: c.white,
  };

  const sidebarStats: CSSProperties = {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    fontSize: 10,
  };

  const sidebarProgressBar: CSSProperties = {
    marginTop: 6,
    height: 3,
    background: "rgba(255,255,255,0.05)",
    borderRadius: 99,
    overflow: "hidden",
  };

  const moduleBtn: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "none",
    border: "none",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    cursor: "pointer",
  };

  const moduleIcon: (bg: string, fg: string) => CSSProperties = (bg, fg) => ({
    width: 28,
    height: 28,
    borderRadius: 8,
    background: bg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: fg,
    fontSize: 12,
    fontWeight: 700,
  });

  const lessonRow: (active?: boolean) => CSSProperties = (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 18px",
    textDecoration: "none",
    ...(active
      ? {
          background: "linear-gradient(90deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0) 100%)",
          borderLeft: `2px solid ${c.indigo}`,
        }
      : {}),
  });

  const lessonDot: CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: "50%",
    border: `2px solid ${c.indigo}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const pulsingDot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: c.indigo,
  };

  const sidebarFooter: CSSProperties = {
    padding: "14px 18px",
    background: c.darkPanel,
    borderTop: "1px solid rgba(255,255,255,0.05)",
    fontSize: 12,
    color: "#94A3B8",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div style={page}>
      {/* Header */}
      <header style={header}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={exitLink}>
            <span style={{ fontSize: 14 }}>{"\u2039"}</span>
            <span>Exit Course</span>
          </span>
          <div style={divider} />
          <div>
            <div style={courseTitle}>The Art of Cinematic Portraiture</div>
            <div style={courseSubtitle}>Module 02 - Master of Light</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={progressBar}>
            <div style={progressFill} />
          </div>
          <span style={progressText}>42% Complete</span>
          <div style={avatar}>
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="User avatar"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main style={mainLayout}>
        {/* Content */}
        <div style={contentArea}>
          {/* Video Player */}
          <div style={videoContainer}>
            <img
              src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1440&auto=format&fit=crop"
              alt="Lesson video thumbnail"
              style={videoImage}
            />
            <div style={playButton}>
              <div style={playTriangle} />
            </div>
          </div>

          {/* Lesson Info + Navigation */}
          <div style={lessonInfo}>
            <div>
              <h2 style={lessonTitle}>Understanding Light and Shadow</h2>
              <p style={lessonSeries}>
                Part of: <span style={{ color: "#818CF8" }}>Lighting Masterclass Series</span>
              </p>
            </div>
            <div style={navButtons}>
              <button type="button" style={btnPrev}>
                {"\u2039"} Previous
              </button>
              <button type="button" style={btnNext}>
                Complete & Next {"\u203A"}
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div style={tabs}>
            <button type="button" style={tabActive}>Lesson Notes</button>
            <button type="button" style={tabInactive}>Resources (3)</button>
            <button type="button" style={tabInactive}>Community Discussion</button>
          </div>

          {/* Notes Content */}
          <div>
            <h3 style={notesTitle}>Core Concepts</h3>
            <p style={notesText}>
              In this lesson, we break down the physics of light and how it interacts with the human
              face. We explore the five areas of light: High Light, Mid-tone, Core Shadow, Reflected
              Light, and Cast Shadow.
            </p>
            <div style={noteItem}>
              <div style={noteCheck}>{"\u2713"}</div>
              <p style={{ ...notesText, margin: 0 }}>
                <strong style={{ color: c.white }}>The Inverse Square Law:</strong> Understanding
                how light intensity drops off as distance doubles.
              </p>
            </div>
            <div style={noteItem}>
              <div style={noteCheck}>{"\u2713"}</div>
              <p style={{ ...notesText, margin: 0 }}>
                <strong style={{ color: c.white }}>Quality of Light:</strong> Differentiating
                between hard light (defined shadows) and soft light (gradual transitions).
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside style={sidebar}>
          <div style={sidebarHeader}>
            <div style={sidebarTitle}>Course Content</div>
            <div style={sidebarStats}>
              <span style={{ color: "#64748B" }}>7 / 12 Lessons watched</span>
              <span style={{ color: c.emerald, fontWeight: 700 }}>42% Complete</span>
            </div>
            <div style={sidebarProgressBar}>
              <div style={{ ...progressFill, height: "100%" }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" as const }}>
            {/* Module 1 - Completed */}
            <div style={moduleBtn}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={moduleIcon("rgba(16,185,129,0.1)", c.emerald)}>{"\u2713"}</div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.02em" }}>Module 01</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.white }}>The Foundations</div>
                </div>
              </div>
              <span style={{ color: "#64748B", fontSize: 12 }}>{"\u2304"}</span>
            </div>

            {/* Module 2 - Active */}
            <div style={{ background: "rgba(255,255,255,0.05)" }}>
              <div style={{ ...moduleBtn, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={moduleIcon("rgba(99,102,241,0.2)", "#818CF8")}>{"\u25B6"}</div>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#818CF8", textTransform: "uppercase" as const, letterSpacing: "0.02em" }}>Module 02</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.white }}>Master of Light</div>
                  </div>
                </div>
                <span style={{ color: "#818CF8", fontSize: 12 }}>{"\u2303"}</span>
              </div>

              {/* Lessons */}
              <div style={{ padding: "2px 0" }}>
                {/* Lesson - Completed */}
                <div style={{ ...lessonRow(), opacity: 0.6 }}>
                  <span style={{ color: c.emerald, fontSize: 14, flexShrink: 0 }}>{"\u2714"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>Introduction to Studio Lighting</div>
                    <div style={{ fontSize: 8, color: "#64748B" }}>14:20</div>
                  </div>
                </div>

                {/* Lesson - Active (current) */}
                <div style={lessonRow(true)}>
                  <div style={lessonDot}>
                    <div style={pulsingDot} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: c.white }}>Understanding Light and Shadow</div>
                    <div style={{ fontSize: 8, color: "#818CF8" }}>Current Lesson</div>
                  </div>
                  <span style={{ color: "#818CF8", fontSize: 11 }}>{"\u266B"}</span>
                </div>

                {/* Lesson - Locked */}
                <div style={lessonRow()}>
                  <span style={{ color: "#475569", fontSize: 13, flexShrink: 0 }}>{"\uD83D\uDD12"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>The Rembrandt Lighting Secret</div>
                    <div style={{ fontSize: 8, color: "#475569" }}>18:45</div>
                  </div>
                </div>

                {/* Lesson - Locked */}
                <div style={lessonRow()}>
                  <span style={{ color: "#475569", fontSize: 13, flexShrink: 0 }}>{"\uD83D\uDD12"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>Using Reflectors & Fill Light</div>
                    <div style={{ fontSize: 8, color: "#475569" }}>22:10</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3 - Locked */}
            <div style={{ ...moduleBtn, opacity: 0.5 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={moduleIcon("rgba(255,255,255,0.1)", "#94A3B8")}>{"\uD83D\uDD12"}</div>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.02em" }}>Module 03</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.white }}>Advanced Techniques</div>
                </div>
              </div>
              <span style={{ color: "#64748B", fontSize: 12 }}>{"\u2304"}</span>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div style={sidebarFooter}>
            <span style={{ fontSize: 14 }}>{"\u2753"}</span>
            Need help with this lesson?
          </div>
        </aside>
      </main>
    </div>
  );
}
