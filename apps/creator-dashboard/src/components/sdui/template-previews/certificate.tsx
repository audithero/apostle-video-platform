import { type CSSProperties } from "react";

const c = {
  parchment: "#F5F0E8",
  deepGreen: "#1B4332",
  bronze: "#CD7F32",
  espresso: "#3E2723",
  espressoLight: "rgba(62,39,35,0.5)",
  white: "#FFFFFF",
  cream: "rgba(255,255,255,0.4)",
};

const fontSerif = "'Cormorant Garamond', serif";
const fontBody = "'Plus Jakarta Sans', sans-serif";

export default function CertificatePreview() {
  const page: CSSProperties = {
    minHeight: "100vh",
    background: c.parchment,
    fontFamily: fontBody,
    color: c.espresso,
  };

  const header: CSSProperties = {
    width: "100%",
    padding: "20px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid rgba(62,39,35,0.1)`,
  };

  const headerLogo: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const logoCircle: CSSProperties = {
    width: 32,
    height: 32,
    background: c.deepGreen,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: c.parchment,
    fontSize: 14,
  };

  const logoName: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    color: c.deepGreen,
  };

  const navLinks: CSSProperties = {
    display: "flex",
    gap: 28,
    fontFamily: fontSerif,
    fontSize: 15,
  };

  const navLink: (active?: boolean) => CSSProperties = (active) => ({
    color: active ? c.bronze : c.espresso,
    textDecoration: "none",
    ...(active ? { borderBottom: `1px solid ${c.bronze}` } : {}),
  });

  const headerRight: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const rankLabel: CSSProperties = {
    textAlign: "right" as const,
  };

  const rankTitle: CSSProperties = {
    fontSize: 8,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: "rgba(27,67,50,0.6)",
  };

  const rankValue: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 14,
    fontWeight: 700,
  };

  const avatarCircle: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `2px solid ${c.deepGreen}`,
    padding: 1,
    overflow: "hidden",
  };

  const mainContent: CSSProperties = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 20px",
  };

  const heroSection: CSSProperties = {
    textAlign: "center" as const,
    marginBottom: 48,
  };

  const heroTitle: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 44,
    fontWeight: 300,
    color: c.deepGreen,
    marginBottom: 10,
    lineHeight: 1.1,
  };

  const heroQuote: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 16,
    fontStyle: "italic",
    color: "rgba(62,39,35,0.7)",
    maxWidth: 500,
    margin: "0 auto 28px",
    lineHeight: 1.5,
  };

  const statsGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
    maxWidth: 700,
    margin: "0 auto",
  };

  const statCard: CSSProperties = {
    background: c.cream,
    padding: "20px 12px",
    border: `1px solid rgba(27,67,50,0.1)`,
    textAlign: "center" as const,
  };

  const statNumber: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 30,
    fontWeight: 700,
    color: c.bronze,
  };

  const statLabel: CSSProperties = {
    fontSize: 8,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    fontWeight: 600,
    color: "rgba(27,67,50,0.6)",
    marginTop: 2,
  };

  const sectionHeader: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: `1px solid rgba(27,67,50,0.2)`,
    paddingBottom: 10,
    marginBottom: 24,
    marginTop: 48,
  };

  const sectionTitle: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 28,
    color: c.deepGreen,
  };

  const sectionLink: CSSProperties = {
    fontSize: 10,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    fontWeight: 700,
    color: c.bronze,
  };

  const certsGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
  };

  const certCard: CSSProperties = {
    border: `16px solid ${c.deepGreen}`,
    background: c.white,
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
    position: "relative" as const,
  };

  const certInnerBorder: CSSProperties = {
    position: "absolute" as const,
    top: 3,
    left: 3,
    right: 3,
    bottom: 3,
    border: `1px solid ${c.bronze}`,
    pointerEvents: "none" as const,
  };

  const corner: (pos: "tl" | "tr" | "bl" | "br") => CSSProperties = (pos) => {
    const base: CSSProperties = {
      position: "absolute" as const,
      width: 28,
      height: 28,
      border: `2px solid ${c.bronze}`,
    };
    switch (pos) {
      case "tl":
        return { ...base, top: 8, left: 8, borderRight: "none", borderBottom: "none" };
      case "tr":
        return { ...base, top: 8, right: 8, borderLeft: "none", borderBottom: "none" };
      case "bl":
        return { ...base, bottom: 8, left: 8, borderRight: "none", borderTop: "none" };
      case "br":
        return { ...base, bottom: 8, right: 8, borderLeft: "none", borderTop: "none" };
    }
  };

  const certContent: CSSProperties = {
    padding: "24px 20px",
    textAlign: "center" as const,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 320,
  };

  const awardIcon: CSSProperties = {
    fontSize: 28,
    color: c.bronze,
    marginBottom: 12,
  };

  const certLabel: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 8,
    textTransform: "uppercase" as const,
    letterSpacing: "0.2em",
    fontWeight: 700,
    color: "rgba(27,67,50,0.6)",
    marginBottom: 4,
  };

  const certSubLabel: CSSProperties = {
    fontSize: 7,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 14,
  };

  const certName: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 20,
    fontStyle: "italic",
    color: c.deepGreen,
    marginBottom: 14,
    borderBottom: `1px solid rgba(27,67,50,0.1)`,
    paddingBottom: 4,
    width: "100%",
  };

  const certMastered: CSSProperties = {
    fontSize: 7,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 4,
  };

  const certCourse: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 16,
    fontWeight: 700,
    color: c.espresso,
    lineHeight: 1.3,
    marginBottom: 16,
  };

  const certFooter: CSSProperties = {
    marginTop: "auto",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
    borderTop: `1px solid rgba(27,67,50,0.1)`,
    paddingTop: 12,
  };

  const certFooterLeft: CSSProperties = {
    textAlign: "left" as const,
  };

  const certFooterRight: CSSProperties = {
    textAlign: "right" as const,
  };

  const certInstructor: CSSProperties = {
    fontFamily: fontSerif,
    fontStyle: "italic",
    fontSize: 13,
    color: c.deepGreen,
  };

  const certRole: CSSProperties = {
    fontSize: 6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
  };

  const certDate: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 10,
    fontWeight: 700,
  };

  const badgesGrid: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: 16,
  };

  const badgeItem: (locked?: boolean) => CSSProperties = (locked) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    opacity: locked ? 0.35 : 1,
    filter: locked ? "grayscale(1)" : "none",
  });

  const badgeCircle: (locked?: boolean) => CSSProperties = (locked) => ({
    width: 64,
    height: 64,
    borderRadius: "50%",
    background: locked ? "transparent" : c.white,
    border: locked ? `2px dashed rgba(62,39,35,0.4)` : `2px solid ${c.bronze}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    marginBottom: 8,
    ...(locked
      ? {}
      : { filter: `drop-shadow(0 0 8px rgba(205,127,50,0.4))` }),
  });

  const badgeName: CSSProperties = {
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
  };

  const badgeDate: CSSProperties = {
    fontSize: 7,
    color: c.espressoLight,
  };

  const quoteSection: CSSProperties = {
    background: c.deepGreen,
    padding: 40,
    position: "relative" as const,
    overflow: "hidden",
    marginTop: 48,
  };

  const quoteIcon: CSSProperties = {
    position: "absolute" as const,
    top: 16,
    right: 24,
    fontSize: 64,
    color: "rgba(255,255,255,0.08)",
  };

  const quoteText: CSSProperties = {
    fontFamily: fontSerif,
    fontSize: 22,
    fontStyle: "italic",
    color: c.parchment,
    lineHeight: 1.5,
    textAlign: "center" as const,
    maxWidth: 600,
    margin: "0 auto 16px",
    position: "relative" as const,
    zIndex: 1,
  };

  const quoteDivider: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  };

  const quoteLine: CSSProperties = {
    width: 36,
    height: 1,
    background: "rgba(205,127,50,0.5)",
  };

  const quoteAttribution: CSSProperties = {
    fontSize: 8,
    textTransform: "uppercase" as const,
    letterSpacing: "0.25em",
    fontWeight: 700,
    color: c.bronze,
  };

  const footer: CSSProperties = {
    padding: "28px 32px",
    borderTop: `1px solid rgba(62,39,35,0.1)`,
    marginTop: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap" as const,
    gap: 12,
  };

  const footerLogo: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    opacity: 0.6,
    filter: "grayscale(1)",
  };

  const footerLinks: CSSProperties = {
    display: "flex",
    gap: 20,
    fontSize: 8,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: c.espressoLight,
  };

  const footerCopy: CSSProperties = {
    fontSize: 8,
    color: "rgba(62,39,35,0.4)",
  };

  const certificates = [
    { course: "Mastery of Italian Culinary Arts", instructor: "Marco Rossi", role: "Executive Chef", date: "Oct 24, 2023" },
    { course: "Advanced Global Wealth Strategy", instructor: "Victoria Chen, CFA", role: "Lead Economist", date: "Jan 12, 2024" },
    { course: "Architectural Narrative Photography", instructor: "Elena Vasquez", role: "Senior Photographer", date: "Mar 05, 2024" },
  ];

  const badges = [
    { icon: "\uD83D\uDD25", name: "7-Day Streak", date: "Earned Oct 12", locked: false },
    { icon: "\uD83D\uDCD6", name: "Scholar", date: "Earned Nov 02", locked: false },
    { icon: "\uD83C\uDF99", name: "Speaker", date: "Earned Dec 15", locked: false },
    { icon: "\u26A1", name: "Vanguard", date: "Earned Jan 22", locked: false },
    { icon: "\uD83D\uDD12", name: "Mentorship", date: "Locked", locked: true },
    { icon: "\uD83D\uDD12", name: "Conqueror", date: "Locked", locked: true },
  ];

  return (
    <div style={page}>
      {/* Header */}
      <header style={header}>
        <div style={headerLogo}>
          <div style={logoCircle}>{"\uD83C\uDF93"}</div>
          <span style={logoName}>APOSTLE ACADEMY</span>
        </div>
        <nav style={navLinks}>
          <span style={navLink()}>Dashboard</span>
          <span style={navLink()}>My Courses</span>
          <span style={navLink(true)}>Certificates</span>
          <span style={navLink()}>Profile</span>
        </nav>
        <div style={headerRight}>
          <div style={rankLabel}>
            <div style={rankTitle}>Scholar Rank</div>
            <div style={rankValue}>Summa Cum Laude</div>
          </div>
          <div style={avatarCircle}>
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User avatar" style={{ width: "100%", height: "100%", borderRadius: "50%" }} />
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={mainContent}>
        {/* Hero */}
        <section style={heroSection}>
          <h1 style={heroTitle}>Your Legacy of Learning</h1>
          <p style={heroQuote}>
            &ldquo;Education is the passport to the future, for tomorrow belongs to those who prepare for it today.&rdquo;
          </p>
          <div style={statsGrid}>
            {[
              { num: "09", label: "Total Achievements" },
              { num: "03", label: "Certificates Earned" },
              { num: "06", label: "Mastery Badges" },
              { num: "184", label: "Learning Hours" },
            ].map((s) => (
              <div key={s.label} style={statCard}>
                <div style={statNumber}>{s.num}</div>
                <div style={statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Certificates */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Distinguished Certificates</h2>
          <span style={sectionLink}>Download All (PDF)</span>
        </div>
        <div style={certsGrid}>
          {certificates.map((cert) => (
            <div key={cert.course} style={certCard}>
              <div style={certInnerBorder} />
              <div style={corner("tl")} />
              <div style={corner("tr")} />
              <div style={corner("bl")} />
              <div style={corner("br")} />
              <div style={certContent}>
                <div style={awardIcon}>{"\uD83C\uDFC5"}</div>
                <div style={certLabel}>Certificate of Completion</div>
                <div style={certSubLabel}>This document certifies that</div>
                <div style={certName}>Julian Alexander Thorne</div>
                <div style={certMastered}>Has successfully mastered</div>
                <div style={certCourse}>{cert.course}</div>
                <div style={certFooter}>
                  <div style={certFooterLeft}>
                    <div style={certInstructor}>{cert.instructor}</div>
                    <div style={certRole}>{cert.role}</div>
                  </div>
                  <div style={certFooterRight}>
                    <div style={certDate}>{cert.date}</div>
                    <div style={certRole}>Date Issued</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={sectionHeader}>
          <h2 style={sectionTitle}>Mastery Badges</h2>
          <span style={{ fontSize: 11, fontStyle: "italic", color: c.espressoLight }}>4 of 6 earned</span>
        </div>
        <div style={badgesGrid}>
          {badges.map((b) => (
            <div key={b.name} style={badgeItem(b.locked)}>
              <div style={badgeCircle(b.locked)}>{b.icon}</div>
              <div style={badgeName}>{b.name}</div>
              <div style={badgeDate}>{b.date}</div>
            </div>
          ))}
        </div>

        {/* Quote */}
        <section style={quoteSection}>
          <div style={quoteIcon}>{"\u201C"}</div>
          <p style={quoteText}>
            &ldquo;Knowledge is a treasure that will follow its owner everywhere. Your achievements here are but the first steps in a lifetime of wisdom and mastery.&rdquo;
          </p>
          <div style={quoteDivider}>
            <div style={quoteLine} />
            <span style={quoteAttribution}>Words of the Founders</span>
            <div style={quoteLine} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={footer}>
        <div style={footerLogo}>
          <div style={{ ...logoCircle, width: 24, height: 24, fontSize: 11 }}>{"\uD83C\uDF93"}</div>
          <span style={{ fontFamily: fontSerif, fontSize: 15, fontWeight: 700, color: c.deepGreen }}>APOSTLE</span>
        </div>
        <div style={footerLinks}>
          <span>Privacy Policy</span>
          <span>Terms of Honor</span>
          <span>Verify Credentials</span>
        </div>
        <div style={footerCopy}>&copy; 2024 Apostle Academy. All academic rights reserved.</div>
      </footer>
    </div>
  );
}
