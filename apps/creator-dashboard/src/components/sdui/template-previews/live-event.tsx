import { type CSSProperties } from "react";

const c = {
  deepPurple: "#1E1033",
  electricViolet: "#8B5CF6",
  lavender: "#A78BFA",
  darkPanel: "#150D26",
  text: "#F8F7FF",
  muted: "#9CA3AF",
  dimmed: "#6B7280",
  red: "#EF4444",
  green: "#22C55E",
  border: "rgba(139,92,246,0.2)",
};

const fontDisplay = "'Outfit', sans-serif";
const fontMono = "'JetBrains Mono', monospace";

export default function LiveEventPreview() {
  const page: CSSProperties = {
    minHeight: "100vh",
    background: c.deepPurple,
    fontFamily: fontDisplay,
    color: c.text,
    display: "flex",
    flexDirection: "column",
  };

  const nav: CSSProperties = {
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${c.border}`,
    background: "rgba(30,16,51,0.6)",
    backdropFilter: "blur(12px)",
    flexShrink: 0,
  };

  const navLogo: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const navLogoIcon: CSSProperties = {
    width: 28,
    height: 28,
    background: c.electricViolet,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    transform: "rotate(3deg)",
  };

  const navBrand: CSSProperties = {
    fontSize: 16,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    textTransform: "uppercase" as const,
    fontStyle: "italic",
  };

  const navLinks: CSSProperties = {
    display: "flex",
    gap: 18,
    fontSize: 12,
    fontWeight: 500,
    color: "#9CA3AF",
  };

  const liveBadge: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 10px",
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.2)",
    borderRadius: 99,
    color: c.red,
    fontSize: 9,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
  };

  const liveDot: CSSProperties = {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: c.red,
  };

  const navAvatar: CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: "50%",
    border: `2px solid ${c.electricViolet}`,
    padding: 1,
    overflow: "hidden",
  };

  const mainLayout: CSSProperties = {
    flex: 1,
    display: "flex",
    overflow: "hidden",
  };

  const playerSection: CSSProperties = {
    flex: 1,
    overflowY: "auto" as const,
  };

  const videoArea: CSSProperties = {
    aspectRatio: "16/9",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  };

  const videoGradient: CSSProperties = {
    position: "absolute" as const,
    inset: 0,
    background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
    pointerEvents: "none" as const,
  };

  const playIcon: CSSProperties = {
    width: 64,
    height: 64,
    borderRadius: "50%",
    border: `3px solid ${c.electricViolet}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    color: c.electricViolet,
    opacity: 0.85,
  };

  const videoOverlayBottom: CSSProperties = {
    position: "absolute" as const,
    bottom: 16,
    left: 16,
    right: 16,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const overlayChip: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(0,0,0,0.6)",
    padding: "5px 10px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: 10,
    fontWeight: 500,
  };

  const contentArea: CSSProperties = {
    maxWidth: 800,
    margin: "0 auto",
    padding: "28px 24px",
  };

  const titleRow: CSSProperties = {
    display: "flex",
    gap: 24,
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottom: `1px solid ${c.border}`,
    paddingBottom: 28,
    marginBottom: 28,
    flexWrap: "wrap" as const,
  };

  const seriesLabel: CSSProperties = {
    fontFamily: fontMono,
    fontSize: 10,
    color: c.electricViolet,
    fontWeight: 500,
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
  };

  const mainTitle: CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    marginTop: 6,
    lineHeight: 1.2,
  };

  const subtitle: CSSProperties = {
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 1.6,
    marginTop: 8,
    maxWidth: 500,
  };

  const countdownPanel: CSSProperties = {
    background: "rgba(30,16,51,0.6)",
    border: `1px solid ${c.border}`,
    backdropFilter: "blur(12px)",
    borderRadius: 16,
    padding: 18,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    minWidth: 220,
  };

  const countdownLabel: CSSProperties = {
    fontSize: 9,
    fontWeight: 500,
    color: "#6B7280",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
  };

  const countdownRow: CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
  };

  const countdownDigit: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  const digitValue: CSSProperties = {
    fontSize: 20,
    fontWeight: 700,
    fontFamily: fontMono,
  };

  const digitLabel: CSSProperties = {
    fontSize: 8,
    color: "#9CA3AF",
    textTransform: "uppercase" as const,
  };

  const digitSep: CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: c.electricViolet,
  };

  const reserveBtn: CSSProperties = {
    width: "100%",
    background: c.electricViolet,
    color: "#fff",
    fontWeight: 700,
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    fontSize: 12,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
  };

  const reserveSub: CSSProperties = {
    fontSize: 8,
    color: "#6B7280",
    textAlign: "center" as const,
  };

  const twoColGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: 28,
  };

  const agendaTitle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 20,
  };

  const timelineContainer: CSSProperties = {
    position: "relative" as const,
    paddingLeft: 28,
  };

  const timelineLine: CSSProperties = {
    position: "absolute" as const,
    left: 7,
    top: 6,
    bottom: 6,
    width: 1,
    background: c.border,
  };

  const timelineItem: (status: "done" | "active" | "upcoming") => CSSProperties = (status) => ({
    position: "relative" as const,
    paddingBottom: 20,
  });

  const timelineDot: (status: "done" | "active" | "upcoming") => CSSProperties = (status) => ({
    position: "absolute" as const,
    left: -22,
    top: 4,
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: status === "done" ? c.green : status === "active" ? c.electricViolet : "#4B5563",
    border: `3px solid ${c.deepPurple}`,
  });

  const agendaLabel: (status: "done" | "active" | "upcoming") => CSSProperties = (status) => ({
    fontSize: 9,
    fontFamily: fontMono,
    fontWeight: 500,
    padding: "1px 6px",
    borderRadius: 4,
    display: "inline-block",
    marginLeft: 8,
    ...(status === "done"
      ? { background: "rgba(34,197,94,0.1)", color: c.green }
      : status === "active"
        ? { background: "rgba(139,92,246,0.2)", color: c.electricViolet }
        : {}),
  });

  const instructorPanel: CSSProperties = {
    background: "rgba(30,16,51,0.6)",
    border: `1px solid ${c.border}`,
    backdropFilter: "blur(12px)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  };

  const resourcesPanel: CSSProperties = {
    background: "rgba(139,92,246,0.05)",
    border: `1px solid ${c.border}`,
    borderRadius: 16,
    padding: 18,
  };

  const resourceItem: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 12,
    padding: "6px 0",
    color: c.muted,
  };

  const chatSidebar: CSSProperties = {
    width: 300,
    borderLeft: `1px solid ${c.border}`,
    display: "flex",
    flexDirection: "column",
    background: "rgba(30,16,51,0.6)",
    backdropFilter: "blur(12px)",
    flexShrink: 0,
  };

  const chatHeader: CSSProperties = {
    padding: "12px 14px",
    borderBottom: `1px solid ${c.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const chatTitle: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const chatOnline: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 8,
    color: "#6B7280",
  };

  const chatMessages: CSSProperties = {
    flex: 1,
    overflowY: "auto" as const,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 14,
  };

  const chatMsg: (highlight?: boolean) => CSSProperties = (highlight) => ({
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    ...(highlight
      ? {
          background: "rgba(139,92,246,0.1)",
          margin: "0 -6px",
          padding: 6,
          borderRadius: 8,
          borderLeft: `2px solid ${c.electricViolet}`,
        }
      : {}),
  });

  const chatAvatar: CSSProperties = {
    width: 24,
    height: 24,
    borderRadius: 6,
    overflow: "hidden",
    flexShrink: 0,
  };

  const chatName: (color: string) => CSSProperties = (color) => ({
    fontSize: 10,
    fontWeight: 700,
    color,
  });

  const chatTime: CSSProperties = { fontSize: 8, color: "#4B5563", marginLeft: 6 };
  const chatText: CSSProperties = { fontSize: 11, color: "#D1D5DB", lineHeight: 1.4 };

  const chatInput: CSSProperties = {
    padding: "12px 14px",
    borderTop: `1px solid ${c.border}`,
    background: "rgba(0,0,0,0.4)",
  };

  const inputBox: CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: `1px solid ${c.border}`,
    borderRadius: 10,
    padding: "10px 40px 10px 12px",
    fontSize: 11,
    color: c.text,
    outline: "none",
  };

  const sendBtn: CSSProperties = {
    position: "absolute" as const,
    right: 4,
    top: 4,
    width: 26,
    height: 26,
    background: c.electricViolet,
    borderRadius: 6,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 11,
    cursor: "pointer",
  };

  const chatIcons: CSSProperties = {
    display: "flex",
    gap: 10,
    marginTop: 6,
    paddingLeft: 2,
    fontSize: 12,
    color: "#6B7280",
  };

  const agenda = [
    { title: "01. Environment Setup & Core Concepts", desc: "Setting up the dev environment with TypeScript, ESLint, and Prettier.", status: "done" as const },
    { title: "02. Designing Your API Schema", desc: "Modeling data using Prisma and architecting RESTful resources.", status: "active" as const },
    { title: "03. Handling Requests & Middleware", desc: "Implementing Express routes, controllers, and error handling middleware.", status: "upcoming" as const },
    { title: "04. JWT Authentication & Security", desc: "Securing endpoints with JSON Web Tokens and best security practices.", status: "upcoming" as const },
    { title: "05. Deployment with Vercel & Railway", desc: "CI/CD pipelines and production-ready monitoring strategies.", status: "upcoming" as const },
  ];

  const chats = [
    { name: "alex_codes", color: c.lavender, seed: "Alex", time: "12:44 PM", text: "The Prisma setup is so much cleaner than I expected!" },
    { name: "sarah_js", color: "#F472B6", seed: "Sarah", time: "12:45 PM", text: "Will the recording be available later? I missed the first 10 minutes." },
    { name: "MODERATOR", color: c.electricViolet, seed: "Mod", time: "12:45 PM", text: "@sarah_js Yes! All registered students get lifetime access to the replay.", highlight: true },
    { name: "dev_chris", color: c.green, seed: "Chris", time: "12:46 PM", text: "How do we handle rate limiting in Express?" },
    { name: "elena_v", color: c.lavender, seed: "Elena", time: "12:47 PM", text: "Loving the workshop so far! High quality stuff." },
  ];

  return (
    <div style={page}>
      {/* Nav */}
      <nav style={nav}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={navLogo}>
            <div style={navLogoIcon}>{"\u276F_"}</div>
            <span style={navBrand}>
              Apostle<span style={{ color: c.electricViolet }}>Live</span>
            </span>
          </div>
          <div style={navLinks}>
            <span>Schedule</span>
            <span>Resources</span>
            <span>Community</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={liveBadge}>
            <div style={liveDot} />
            LIVE
          </div>
          <div style={navAvatar}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=user-dev" alt="User avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          </div>
        </div>
      </nav>

      {/* Main */}
      <main style={mainLayout}>
        {/* Player + Content */}
        <section style={playerSection}>
          {/* Video */}
          <div style={videoArea}>
            <div style={videoGradient} />
            <div style={playIcon}>{"\u25B6"}</div>
            <div style={videoOverlayBottom}>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={overlayChip}>
                  <span style={{ color: c.lavender }}>{"\uD83D\uDC65"}</span> 1,248 Viewers
                </div>
                <div style={overlayChip}>
                  <span style={{ color: c.lavender }}>{"\u23F1"}</span> 01:24:55
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, fontSize: 16 }}>
                <span>{"\uD83D\uDD0A"}</span>
                <span>{"\u2699"}</span>
                <span>{"\u26F6"}</span>
              </div>
            </div>
          </div>

          {/* Content below video */}
          <div style={contentArea}>
            <div style={titleRow}>
              <div style={{ maxWidth: 480 }}>
                <div style={seriesLabel}>Masterclass Series 01</div>
                <h1 style={mainTitle}>Building Your First Production API</h1>
                <p style={subtitle}>
                  Learn how to architect, develop, and deploy a scalable REST API using Node.js and
                  TypeScript. We&apos;ll cover everything from routing to authentication.
                </p>
              </div>
              <div style={countdownPanel}>
                <div style={countdownLabel}>Registration Closes In</div>
                <div style={countdownRow}>
                  <div style={countdownDigit}>
                    <span style={digitValue}>02</span>
                    <span style={digitLabel}>Hrs</span>
                  </div>
                  <span style={digitSep}>:</span>
                  <div style={countdownDigit}>
                    <span style={digitValue}>14</span>
                    <span style={digitLabel}>Min</span>
                  </div>
                  <span style={digitSep}>:</span>
                  <div style={countdownDigit}>
                    <span style={digitValue}>56</span>
                    <span style={digitLabel}>Sec</span>
                  </div>
                </div>
                <button type="button" style={reserveBtn}>
                  {"\uD83C\uDFAB"} Reserve Your Seat
                </button>
                <div style={reserveSub}>Joined by 842 other developers</div>
              </div>
            </div>

            {/* Agenda + Sidebar */}
            <div style={twoColGrid}>
              {/* Agenda */}
              <div>
                <div style={agendaTitle}>
                  <span style={{ color: c.electricViolet, fontSize: 22 }}>{"\u2611"}</span>
                  Workshop Agenda
                </div>
                <div style={timelineContainer}>
                  <div style={timelineLine} />
                  {agenda.map((item) => (
                    <div key={item.title} style={timelineItem(item.status)}>
                      <div style={timelineDot(item.status)} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <h3 style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: item.status === "done" ? c.green : item.status === "active" ? c.text : "#9CA3AF",
                          margin: 0,
                        }}>
                          {item.title}
                        </h3>
                        {item.status !== "upcoming" && (
                          <span style={agendaLabel(item.status)}>
                            {item.status === "done" ? "COMPLETED" : "IN PROGRESS"}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: item.status === "upcoming" ? "#6B7280" : "#9CA3AF", marginTop: 3, margin: "3px 0 0" }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructor + Resources */}
              <div>
                <div style={instructorPanel}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, border: `2px solid ${c.electricViolet}`, overflow: "hidden" }}>
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan" alt="Ryan Park avatar" style={{ width: "100%", height: "100%" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Ryan Park</div>
                      <div style={{ fontSize: 11, color: c.lavender }}>Senior Platform Engineer</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.6, margin: 0 }}>
                    Ex-Stripe, creator of the &lsquo;Modern Backend&rsquo; series. Ryan has helped over 10k developers
                    master production-grade systems architecture.
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    {["\uD83D\uDCBB", "\uD83D\uDC26", "\uD83C\uDF10"].map((icon, i) => (
                      <div key={i} style={{ width: 30, height: 30, borderRadius: 6, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                        {icon}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={resourcesPanel}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: c.lavender, marginBottom: 10 }}>
                    Workshop Resources
                  </div>
                  <div style={resourceItem}>
                    <span style={{ color: c.electricViolet }}>{"\uD83D\uDCC4"}</span> Source Code Repo
                  </div>
                  <div style={resourceItem}>
                    <span style={{ color: c.electricViolet }}>{"\uD83D\uDCD6"}</span> PDF Workbook
                  </div>
                  <div style={resourceItem}>
                    <span style={{ color: c.electricViolet }}>{"\uD83D\uDDC3"}</span> Postman Collection
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Sidebar */}
        <aside style={chatSidebar}>
          <div style={chatHeader}>
            <div style={chatTitle}>
              <span style={{ color: c.electricViolet }}>{"\uD83D\uDCAC"}</span> Live Chat
            </div>
            <div style={chatOnline}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: c.green, display: "inline-block" }} />
              842 Online
            </div>
          </div>

          <div style={chatMessages}>
            {chats.map((msg) => (
              <div key={`${msg.name}-${msg.time}`} style={chatMsg(msg.highlight)}>
                <div style={chatAvatar}>
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.seed}`} alt={`${msg.name} avatar`} style={{ width: "100%", height: "100%" }} />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <span style={chatName(msg.color)}>
                      {msg.highlight && <span style={{ fontSize: 8, marginRight: 2 }}>{"\uD83D\uDEE1"}</span>}
                      {msg.name}
                    </span>
                    <span style={chatTime}>{msg.time}</span>
                  </div>
                  <p style={chatText}>{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={chatInput}>
            <div style={{ position: "relative" as const }}>
              <input
                type="text"
                placeholder="Send a message..."
                style={inputBox}
                readOnly
              />
              <button type="button" style={sendBtn}>{"\u27A4"}</button>
            </div>
            <div style={chatIcons}>
              <span>{"\u263A"}</span>
              <span>{"\uD83D\uDCCE"}</span>
              <span>@</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 8, fontFamily: fontMono, color: "#4B5563" }}>Press Enter to send</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
