import { type CSSProperties } from "react";

const mono = "'JetBrains Mono', monospace";
const body = "'Inter', sans-serif";
const bg = "#0D1117";
const headerBg = "#161B22";
const accent = "#2196F3";
const bullish = "#00C853";
const bearish = "#FF1744";
const border = "#30363D";
const textPrimary = "#E6EDF3";
const textMuted = "#8B949E";
const textDim = "#484F58";

const page: CSSProperties = { minHeight: "100vh", background: bg, color: textPrimary, fontFamily: body };
const headerBar: CSSProperties = { position: "sticky", top: 0, zIndex: 50, background: headerBg, borderBottom: `1px solid ${border}`, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" };
const dot = (c: string): CSSProperties => ({ width: 12, height: 12, borderRadius: "50%", background: c, display: "inline-block" });
const navLink: CSSProperties = { fontFamily: mono, fontSize: 10, letterSpacing: "0.1em", color: textMuted, textDecoration: "none", textTransform: "uppercase" as const };
const termBorder: CSSProperties = { border: `1px solid ${border}` };
const sectionWrap: CSSProperties = { padding: "80px 24px", maxWidth: 1200, margin: "0 auto" };
const monoLabel: CSSProperties = { fontFamily: mono, fontSize: 11, color: accent, textTransform: "uppercase" as const, letterSpacing: "0.15em" };
const h2Style: CSSProperties = { fontFamily: mono, fontSize: 28, fontWeight: 700, color: "#fff", marginTop: 8 };
const card: CSSProperties = { ...termBorder, background: headerBg, padding: 24 };

const strategies = [
  { name: "DELTA_DIVERGENCE", desc: "Identify the hidden footprint of institutional accumulation before the price breakout occurs.", icon: "\u2593", color: accent, num: "01" },
  { name: "IMPULSE_REVERSAL", desc: "Exploiting failed breakouts and liquidity sweeps for high-probability counter-trend entries.", icon: "\u26A1", color: bullish, num: "02" },
  { name: "LIQUIDITY_MAPPING", desc: "Visualize where the majority of stop-losses sit to predict the next magnetic move.", icon: "\u25A6", color: bearish, num: "03" },
  { name: "SCALPING_ALPHA", desc: "Precision execution on the 1-minute time frame using low-latency volume profile analysis.", icon: "\u223F", color: accent, num: "04" },
  { name: "QUANT_SYNTHESIS", desc: "Combining macro-economic indicators with technical structures for long-term swing plays.", icon: "\u2318", color: textMuted, num: "05" },
  { name: "RISK_PROTOCOL_v4", desc: "The definitive guide to position sizing and bankroll management to ensure longevity.", icon: "\u2714", color: bullish, num: "06" },
];

const leaderboard = [
  { rank: "01", name: "Alpha_Wolf_99", trades: "242", wr: "74%", pnl: "+$84,203.45", color: bullish },
  { rank: "02", name: "QuantNinja_FX", trades: "1,104", wr: "62%", pnl: "+$62,110.12", color: bullish },
  { rank: "03", name: "PivotPoint_42", trades: "85", wr: "81%", pnl: "+$41,009.00", color: bullish },
  { rank: "04", name: "Liquid_Assets", trades: "312", wr: "55%", pnl: "+$19,450.88", color: bullish },
  { rank: "05", name: "MarginCall_RIP", trades: "58", wr: "38%", pnl: "-$4,210.00", color: bearish },
];

const modules = [
  { num: "01", type: "FOUNDATIONAL", title: "Infrastructure & Tooling" },
  { num: "02", type: "ANALYTICAL", title: "Order Flow Dynamics" },
  { num: "03", type: "STRATEGIC", title: "The Liquidity Algorithm" },
  { num: "04", type: "PSYCHOLOGICAL", title: "Quantitative Execution" },
];

const testimonials = [
  { text: "Ryan's approach to delta divergence changed how I view the 1m chart. I no longer guess where price is going; I follow the volume footprints.", user: "Marcus_V", borderColor: accent },
  { text: "The risk management protocol saved my account during the last black swan event. The math is undeniable. Best investment I've made in years.", user: "Sarah_Quant", borderColor: bullish },
  { text: "Technical analysis is useless without understanding liquidity sweep mechanics. Ryan breaks it down like a true developer. 10/10.", user: "DevTrader_88", borderColor: accent },
];

const barHeights = [50, 75, 33, 50, 66, 100, 80, 50, 66, 83, 100, 66, 25];
const barColors = [bullish, bullish, bearish, bearish, bullish, bullish, bullish, bearish, bullish, bullish, bullish, bearish, bearish];

export default function TradingPreview() {
  return (
    <div style={page}>
      {/* Header */}
      <header style={headerBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={dot("#FF5F56")} />
            <span style={dot("#FFBD2E")} />
            <span style={dot("#27C93F")} />
          </div>
          <div style={{ width: 1, height: 16, background: "#30363D", margin: "0 8px" }} />
          <span style={{ fontFamily: mono, fontSize: 13, color: accent, letterSpacing: "-0.02em" }}>RYAN_NAKAMURA_TRADING_OS v4.0.1</span>
        </div>
        <nav style={{ display: "flex", gap: 32 }}>
          {["/strategies", "/leaderboard", "/curriculum", "/access_key"].map((l) => (
            <span key={l} style={navLink}>{l}</span>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: mono, fontSize: 10, color: bullish, textTransform: "uppercase" as const }}>● system_online</span>
          <span style={{ background: accent, color: "#fff", fontFamily: mono, fontSize: 12, padding: "8px 16px", borderRadius: 4 }}>INITIALIZE_ACCESS</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ position: "relative", padding: "80px 24px 80px", borderBottom: "1px solid #21262D", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: `radial-gradient(${accent} 0.5px, transparent 0.5px)`, backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-block", border: `1px solid ${bullish}`, padding: "4px 12px", background: "rgba(0,200,83,0.1)", color: bullish, fontFamily: mono, fontSize: 11, marginBottom: 16 }}>KERNEL_VERSION: STABLE_RELEASE</div>
            <h1 style={{ fontFamily: mono, fontSize: 64, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: "#fff", margin: "0 0 24px" }}>
              MASTER THE<br /><span style={{ color: accent }}>ORDER FLOW</span>
            </h1>
            <p style={{ fontSize: 17, color: textMuted, maxWidth: 520, lineHeight: 1.6, marginBottom: 24 }}>Institutional-grade quantitative strategies for the modern retail trader. Eliminate emotional noise. Execute with mathematical precision.</p>
            <div style={{ display: "flex", gap: 16, fontFamily: mono, fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: headerBg, border: `1px solid #30363D`, padding: "12px 16px" }}>
                <span style={{ color: accent }}>$</span><span>WIN_RATE: 68.4%</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: headerBg, border: `1px solid #30363D`, padding: "12px 16px" }}>
                <span style={{ color: bullish }}>+</span><span>P&L_YTD: 142.2%</span>
              </div>
            </div>
          </div>

          {/* Terminal Window */}
          <div style={{ ...termBorder, borderRadius: 8, background: bg, overflow: "hidden", boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}>
            <div style={{ background: headerBg, borderBottom: `1px solid ${border}`, padding: "8px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: textDim }}>PRO_CHART_VIEW.EXE</span>
              <span style={{ fontSize: 10, color: textDim }}>\u2B1C</span>
            </div>
            <div style={{ padding: 24, fontFamily: mono, fontSize: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid #21262D`, paddingBottom: 8, marginBottom: 16, color: textDim }}>
                <span>PAIR: BTC/USDT</span><span>VOL: 24.5M</span><span>TF: 15M</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, opacity: 0.85 }}>
                <span style={{ color: bullish }}>[10:14:02] BUY ORDER EXECUTED @ 64,231.50</span>
                <span style={{ color: textDim }}>[10:14:15] LIQUIDITY GRAB DETECTED IN SELL-SIDE</span>
                <span style={{ color: bearish }}>[10:15:30] STOP LOSS ADJUSTED TO BREAK-EVEN</span>
                <span style={{ color: accent }}>[10:18:00] TRAILING TP_01 TRIGGERED (+4.2%)</span>
                <span style={{ color: "#fff" }}>[SYSTEM] RE-CALCULATING DELTA DIVERGENCE...</span>
              </div>
              <div style={{ marginTop: 32, display: "flex", alignItems: "flex-end", gap: 2, height: 120 }}>
                {barHeights.map((h, i) => (
                  <div key={i} style={{ width: 16, height: `${h}%`, background: barColors[i], opacity: 0.3 + (h / 100) * 0.7 }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategy Protocols */}
      <section style={sectionWrap}>
        <div style={{ marginBottom: 48 }}>
          <span style={monoLabel}>// STRATEGY_MATRICES</span>
          <h2 style={h2Style}>OPERATIONAL_PROTOCOLS</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {strategies.map((s) => (
            <div key={s.name} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <span style={{ fontSize: 28, color: s.color }}>{s.icon}</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: textDim }}>{s.num} / 06</span>
              </div>
              <h3 style={{ fontFamily: mono, fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{s.name}</h3>
              <p style={{ fontSize: 13, color: textMuted, lineHeight: 1.5 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section style={{ padding: "80px 24px", background: "rgba(22,27,34,0.5)", borderTop: `1px solid #21262D`, borderBottom: `1px solid #21262D` }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
            <div>
              <span style={{ fontFamily: mono, fontSize: 11, color: bullish, textTransform: "uppercase" as const, letterSpacing: "0.15em" }}>// NETWORK_PERFORMANCE</span>
              <h2 style={h2Style}>STUDENT_LEADERBOARD</h2>
            </div>
            <div style={{ display: "flex", gap: 16, fontFamily: mono, fontSize: 10 }}>
              <span style={{ border: `1px solid #30363D`, padding: "4px 12px", textTransform: "uppercase" as const }}>Total_Volume: $14.2M</span>
              <span style={{ border: `1px solid #30363D`, padding: "4px 12px", textTransform: "uppercase" as const }}>Avg_Return: +32.4%</span>
            </div>
          </div>
          <div style={{ ...termBorder, borderRadius: 8, overflow: "hidden", background: bg }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 13, textAlign: "left" }}>
              <thead>
                <tr style={{ background: headerBg, color: textDim, fontSize: 11 }}>
                  {["# RANK", "IDENTIFIER", "TOTAL_TRADES", "WIN_RATE", "P&L_TOTAL"].map((h, i) => (
                    <th key={h} style={{ padding: "16px 24px", fontWeight: 500, textAlign: i === 4 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((r) => (
                  <tr key={r.rank} style={{ borderTop: `1px solid #21262D` }}>
                    <td style={{ padding: "16px 24px" }}>{r.rank}</td>
                    <td style={{ padding: "16px 24px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, display: "inline-block" }} />
                      {r.name}
                    </td>
                    <td style={{ padding: "16px 24px" }}>{r.trades}</td>
                    <td style={{ padding: "16px 24px" }}>{r.wr}</td>
                    <td style={{ padding: "16px 24px", textAlign: "right", color: r.color }}>{r.pnl}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={monoLabel}>// TRAINING_TRACK</span>
          <h2 style={{ ...h2Style, fontSize: 36, marginTop: 16 }}>KNOWLEDGE_CORE_MODULES</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: mono }}>
          {modules.map((m) => (
            <div key={m.num} style={{ ...termBorder, background: headerBg, padding: 20, display: "flex", alignItems: "center", gap: 24 }}>
              <span style={{ color: accent, fontWeight: 700, fontSize: 20 }}>{m.num}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: textDim, marginBottom: 4 }}>MODULE_TYPE: {m.type}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, textTransform: "uppercase" as const }}>{m.title}</h3>
              </div>
              <span style={{ color: textDim, fontSize: 18 }}>\u25BC</span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "80px 24px", borderTop: `1px solid #21262D`, borderBottom: `1px solid #21262D`, background: bg }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32 }}>
          {testimonials.map((t) => (
            <div key={t.user} style={{ padding: 24, borderLeft: `2px solid ${t.borderColor}`, background: headerBg }}>
              <span style={{ color: t.borderColor, fontSize: 24, display: "block", marginBottom: 16 }}>\u201C</span>
              <p style={{ fontSize: 13, fontStyle: "italic", color: "#D1D5DB", marginBottom: 24, lineHeight: 1.6 }}>{t.text}</p>
              <div style={{ fontFamily: mono, fontSize: 10 }}>
                <div style={{ color: "#fff" }}>USER: {t.user}</div>
                <div style={{ color: textDim }}>STATUS: VERIFIED_GRADUATE</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "96px 24px", maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "stretch" }}>
          {/* Foundation */}
          <div style={{ ...termBorder, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: textDim, display: "block", marginBottom: 16 }}>TIER_01: EXPLORER</span>
              <h3 style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>FOUNDATION ACCESS</h3>
              <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>$497.00 <span style={{ fontSize: 13, color: textDim }}>USD</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: mono, fontSize: 12, color: textMuted }}>
                {["Core 4-Module Curriculum", "Proprietary Indicator Pack (v1)", "Lifetime Terminal Updates"].map((i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ color: accent }}>\u2713</span> {i}
                  </li>
                ))}
                <li style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.3 }}>
                  <span style={{ color: textDim }}>\u2717</span> Private Discord Algorithm
                </li>
              </ul>
            </div>
            <div style={{ width: "100%", padding: "16px 0", border: `1px solid #30363D`, textAlign: "center", fontFamily: mono, fontSize: 13, color: textPrimary }}>INITIALIZE_LICENSE_v1</div>
          </div>

          {/* Quant Elite */}
          <div style={{ ...termBorder, borderColor: accent, padding: 40, display: "flex", flexDirection: "column", justifyContent: "space-between", background: "rgba(33,150,243,0.05)", position: "relative", boxShadow: `0 0 0 1px ${accent}` }}>
            <div style={{ position: "absolute", top: -12, right: 32, background: accent, color: "#000", fontFamily: mono, fontSize: 10, fontWeight: 700, padding: "4px 12px", textTransform: "uppercase" as const }}>Recommended</div>
            <div style={{ marginBottom: 32 }}>
              <span style={{ fontFamily: mono, fontSize: 10, color: accent, display: "block", marginBottom: 16 }}>TIER_02: QUANT_ELITE</span>
              <h3 style={{ fontFamily: mono, fontSize: 22, fontWeight: 700, marginBottom: 16 }}>FULL SYSTEM OVERRIDE</h3>
              <div style={{ fontFamily: mono, fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 24 }}>$1,299.00 <span style={{ fontSize: 13, color: textDim }}>USD</span></div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, fontFamily: mono, fontSize: 12, color: "#E5E7EB" }}>
                {["Everything in Foundation", "Weekly Alpha Live Calls", "The Liquidity Dashboard App", "Private Inner Circle Discord"].map((i) => (
                  <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <span style={{ color: bullish }}>\u2713</span> {i}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ width: "100%", padding: "16px 0", background: accent, textAlign: "center", fontFamily: mono, fontSize: 13, color: "#fff" }}>ESTABLISH_CONNECTION_NOW</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: headerBg, borderTop: `1px solid ${border}`, padding: 40, textAlign: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: bullish, display: "inline-block" }} />
            <span style={{ fontFamily: mono, fontSize: 11, color: textDim, letterSpacing: "-0.02em" }}>SYSTEMS_OPERATIONAL_24/7_GMT</span>
          </div>
          <div style={{ display: "flex", gap: 32, fontFamily: mono, fontSize: 10, color: textDim }}>
            <span>TERMS_OF_SERVICE</span>
            <span>PRIVACY_POLICY</span>
            <span>RISK_DISCLAIMER</span>
          </div>
          <p style={{ fontSize: 10, color: "#30363D", fontFamily: mono, maxWidth: 600 }}>
            TRADING CONTAINS SUBSTANTIAL RISK AND IS NOT FOR EVERY INVESTOR. AN INVESTOR COULD POTENTIALLY LOSE ALL OR MORE THAN THE INITIAL INVESTMENT. RISK CAPITAL IS MONEY THAT CAN BE LOST WITHOUT JEOPARDIZING ONES' FINANCIAL SECURITY OR LIFE STYLE.
          </p>
          <p style={{ fontFamily: mono, fontSize: 10, color: textDim }}>&copy; 2024 NAKAMURA_LABS. ALL_RIGHTS_RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
