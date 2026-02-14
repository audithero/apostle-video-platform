import { type CSSProperties } from "react";
import DOMPurify from "dompurify";
import type { SDUIScreen, SDUISection } from "@platform/sdui-schema";

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function sectionStyle(section: SDUISection): CSSProperties {
  if (!section.style) return {};
  return section.style as unknown as CSSProperties;
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
}

/** Detect dark/light background for adaptive contrast */
function isDarkBg(bg?: string): boolean {
  if (!bg || bg.startsWith("linear") || bg.startsWith("radial")) return true;
  const hex = bg.replace("#", "");
  if (hex.length < 6) return true;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return true;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

/** Parse hex to RGB components */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return null;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

/** Create rgba from hex + alpha */
function rgba(hex: string, alpha: number): string {
  const c = hexToRgb(hex);
  if (!c) return `rgba(128,128,128,${alpha})`;
  return `rgba(${c.r},${c.g},${c.b},${alpha})`;
}

/** Adaptive color palette — uses template accent from style.color */
function pal(style: CSSProperties) {
  const dark = isDarkBg(style.backgroundColor as string);
  // Use the section's explicit color as accent; fall back to template-aware defaults
  const accent = (style.color as string) ?? (dark ? "#22D3EE" : "#0EA5E9");
  return {
    dark,
    accent,
    h: dark ? "#F1F5F9" : "#0F172A",
    t: dark ? "#CBD5E1" : "#475569",
    m: dark ? "#64748B" : "#94A3B8",
    f: dark ? "#475569" : "#CBD5E1",
    s: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    b: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    bs: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    av: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
  };
}

/* ================================================================== */
/*  TextBlock                                                          */
/* ================================================================== */

function TextBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const content = (props.content as string) ?? "";
  const alignment = (props.alignment as string) ?? "left";
  const maxWidth = (props.maxWidth as string) ?? "100%";
  const isHTML = /<[a-z][\s\S]*>/i.test(content);
  const c = pal(style);

  return (
    <div style={{ ...style, textAlign: alignment as CSSProperties["textAlign"] }}>
      <div style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined }}>
        {isHTML ? (
          <div dangerouslySetInnerHTML={{ __html: sanitize(content) }} />
        ) : (
          <p style={{ color: c.t, lineHeight: 1.75, fontSize: "1rem" }}>{content}</p>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  HeroSection — Cinematic, dramatic, template-aware                  */
/* ================================================================== */

function HeroSectionRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const subtitle = (props.subtitle as string) ?? "";
  const backgroundImage = props.backgroundImage as string | undefined;
  const ctaText = (props.ctaText as string) ?? "";
  const alignment = (props.alignment as string) ?? "center";
  const overlayOpacity = (props.overlayOpacity as number) ?? 0.4;
  const bg = (style.backgroundColor as string) ?? "#0F172A";
  const c = pal(style);

  // Template-aware mesh gradient
  const accentRgba = rgba(c.accent, 0.08);
  const meshGradient = backgroundImage
    ? undefined
    : `radial-gradient(ellipse 80% 50% at 50% 0%, ${accentRgba} 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, ${rgba(c.accent, 0.04)} 0%, transparent 60%)`;

  return (
    <div
      style={{
        ...style,
        position: "relative",
        padding: style.padding ?? "5rem 2.5rem 4.5rem",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : meshGradient,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: alignment as CSSProperties["textAlign"],
        overflow: "hidden",
      }}
    >
      {backgroundImage && (
        <div style={{ position: "absolute", inset: 0, backgroundColor: `rgba(0,0,0,${overlayOpacity})` }} />
      )}
      {/* Decorative top-left accent line */}
      {!backgroundImage && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "120px", height: "3px", background: `linear-gradient(90deg, ${c.accent}, transparent)`, opacity: 0.5 }} />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: alignment === "center" ? "760px" : "640px",
          margin: alignment === "center" ? "0 auto" : undefined,
        }}
      >
        {/* Enrollment badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            borderRadius: "99px",
            backgroundColor: rgba(c.accent, 0.1),
            border: `1px solid ${rgba(c.accent, 0.2)}`,
            marginBottom: "1.5rem",
            fontSize: "0.72rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: c.accent,
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: c.accent }} />
          Now Enrolling
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 4vw, 3.25rem)",
            fontWeight: 800,
            color: "#fff",
            marginBottom: "1.25rem",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textTransform: (style.textTransform as string) ?? "none",
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.75,
              maxWidth: "580px",
              margin: alignment === "center" ? "0 auto" : undefined,
            }}
          >
            {subtitle}
          </p>
        )}
        {ctaText && (
          <div style={{ marginTop: "2rem", display: "flex", alignItems: "center", gap: "1.5rem", justifyContent: alignment === "center" ? "center" : "flex-start", flexWrap: "wrap" }}>
            <button
              type="button"
              style={{
                padding: "0.85rem 2.25rem",
                borderRadius: "8px",
                background: c.accent,
                color: isDarkBg(c.accent) ? "#fff" : "#000",
                fontWeight: 700,
                border: "none",
                fontSize: "0.9rem",
                cursor: "default",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                boxShadow: `0 0 30px ${rgba(c.accent, 0.2)}, 0 2px 8px rgba(0,0,0,0.2)`,
              }}
            >
              {ctaText}
            </button>
            {/* Social proof */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex" }}>
                {["#6366F1", "#EC4899", "#10B981"].map((grad, i) => (
                  <div
                    key={`av-${i}`}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: grad,
                      border: `2px solid ${bg}`,
                      marginLeft: i > 0 ? "-8px" : "0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.6rem",
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {["E", "M", "S"][i]}
                  </div>
                ))}
              </div>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>1,200+ enrolled</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PricingTable — Template-aware accent, glass cards                   */
/* ================================================================== */

function PricingTableRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const plans = (props.plans as Array<{
    name: string;
    price: string;
    period?: string;
    features: string[];
    ctaText: string;
    highlighted?: boolean;
  }>) ?? [];

  return (
    <div style={{ ...style, display: "flex", justifyContent: "center" }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)`, gap: "1.25rem", maxWidth: "980px", width: "100%" }}>
        {plans.map((plan) => {
          const hi = plan.highlighted === true;
          return (
            <div
              key={plan.name}
              style={{
                borderRadius: "16px",
                padding: hi ? "2.25rem 2rem" : "2rem",
                position: "relative",
                border: hi ? `2px solid ${c.accent}` : `1px solid ${c.b}`,
                backgroundColor: hi ? rgba(c.accent, 0.04) : c.s,
                boxShadow: hi ? `0 0 40px ${rgba(c.accent, 0.08)}` : "none",
                transform: hi ? "scale(1.02)" : "none",
              }}
            >
              {hi && (
                <div
                  style={{
                    position: "absolute",
                    top: "-13px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: c.accent,
                    color: isDarkBg(c.accent) ? "#fff" : "#000",
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "4px 16px",
                    borderRadius: "99px",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}
              <h3 style={{ color: c.m, fontSize: "0.8rem", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: 800, color: hi ? c.accent : c.h, letterSpacing: "-0.03em", lineHeight: 1 }}>{plan.price}</span>
                {plan.period && <span style={{ color: c.m, fontSize: "0.8rem" }}>/{plan.period}</span>}
              </div>
              <div style={{ width: "100%", height: "1px", background: c.b, margin: "1rem 0" }} />
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.75rem" }}>
                {plan.features.map((f, fi) => (
                  <li key={`${plan.name}-f${fi}`} style={{ color: c.t, fontSize: "0.85rem", padding: "7px 0", display: "flex", gap: "10px", alignItems: "flex-start", lineHeight: 1.4 }}>
                    <span style={{ color: c.accent, flexShrink: 0, fontSize: "0.8rem", marginTop: "1px", fontWeight: 700 }}>&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  background: hi ? c.accent : "transparent",
                  color: hi ? (isDarkBg(c.accent) ? "#fff" : "#000") : c.accent,
                  border: hi ? "none" : `1px solid ${c.bs}`,
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "default",
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  boxShadow: hi ? `0 4px 20px ${rgba(c.accent, 0.2)}` : "none",
                }}
              >
                {plan.ctaText}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TestimonialCarousel — Star ratings, accent-aware styling           */
/* ================================================================== */

function TestimonialCarouselRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const testimonials = (props.testimonials as Array<{
    name: string;
    quote: string;
    role?: string;
    avatar?: string;
    rating?: number;
  }>) ?? [];

  if (testimonials.length === 0) return <div style={style} />;

  const count = Math.min(testimonials.length, 3);
  const isSingle = count === 1;

  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isSingle ? "1fr" : `repeat(${count}, 1fr)`,
          gap: "1.25rem",
          maxWidth: isSingle ? "640px" : "960px",
          margin: "0 auto",
        }}
      >
        {testimonials.slice(0, 3).map((t, idx) => {
          const initials = t.name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2);
          const rating = (t.rating as number) ?? 5;
          return (
            <div
              key={t.name}
              style={{
                padding: "1.75rem",
                borderRadius: "16px",
                backgroundColor: c.s,
                border: idx === 1 ? `1px solid ${rgba(c.accent, 0.2)}` : `1px solid ${c.b}`,
                display: "flex",
                flexDirection: "column",
                transform: idx === 1 && count === 3 ? "translateY(-4px)" : "none",
              }}
            >
              {/* Star rating */}
              <div style={{ display: "flex", gap: "2px", marginBottom: "0.75rem" }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={`star-${i}`} style={{ color: i < rating ? "#FBBF24" : c.b, fontSize: "0.85rem" }}>&#9733;</span>
                ))}
              </div>

              {/* Quote */}
              <p style={{ fontSize: "0.88rem", color: c.t, lineHeight: 1.75, flex: 1, fontStyle: "italic" }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${c.b}` }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${rgba(c.accent, 0.25)}, ${rgba(c.accent, 0.1)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.accent,
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ color: c.h, fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</div>
                  {t.role && <div style={{ color: c.m, fontSize: "0.72rem", marginTop: "1px" }}>{t.role}</div>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CTAButton — Template accent glow                                   */
/* ================================================================== */

function CTAButtonRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const text = (props.text as string) ?? "Click Here";
  const variant = (props.variant as string) ?? "primary";
  const size = (props.size as string) ?? "md";
  const fullWidth = (props.fullWidth as boolean) ?? false;
  const c = pal(style);

  const padding = size === "lg" ? "0.9rem 2.75rem" : size === "sm" ? "0.5rem 1.25rem" : "0.7rem 1.75rem";
  const fontSize = size === "lg" ? "1.05rem" : size === "sm" ? "0.8rem" : "0.9rem";

  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  const btnStyle: CSSProperties = {
    padding,
    fontSize,
    fontWeight: 700,
    borderRadius: "8px",
    cursor: "default",
    width: fullWidth ? "100%" : undefined,
    letterSpacing: "0.02em",
    textTransform: "uppercase",
    border: isOutline ? `1px solid ${c.bs}` : "none",
    background: isPrimary
      ? c.accent
      : variant === "secondary"
        ? rgba(c.accent, 0.1)
        : "transparent",
    color: isPrimary ? (isDarkBg(c.accent) ? "#fff" : "#000") : c.accent,
    boxShadow: isPrimary ? `0 4px 24px ${rgba(c.accent, 0.2)}` : "none",
  };

  return (
    <div style={style}>
      <button type="button" style={btnStyle}>{text}</button>
    </div>
  );
}

/* ================================================================== */
/*  ProgressBar — Template accent gradient fill                        */
/* ================================================================== */

function ProgressBarRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const value = Math.min(100, Math.max(0, (props.value as number) ?? 0));
  const label = (props.label as string) ?? "";
  const showPercentage = (props.showPercentage as boolean) ?? true;
  const color = (props.color as string) ?? undefined;
  const c = pal(style);
  const barColor = color ?? c.accent;

  return (
    <div style={{ ...style, padding: style.padding ?? "1rem 1.5rem" }}>
      {(label || showPercentage) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
          <span style={{ color: c.h, fontWeight: 500 }}>{label}</span>
          {showPercentage && <span style={{ color: barColor, fontWeight: 700 }}>{value}%</span>}
        </div>
      )}
      <div style={{ height: "8px", backgroundColor: c.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${barColor}, ${rgba(barColor, 0.7)})`,
            borderRadius: "99px",
            boxShadow: value > 0 ? `0 0 12px ${rgba(barColor, 0.3)}` : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CurriculumAccordion — Chapter cards with numbered badges           */
/* ================================================================== */

function CurriculumAccordionRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const modules = (props.modules as Array<{
    title: string;
    lessons: Array<{ title: string; duration?: string; type?: string }>;
  }>) ?? [];

  const typeColors: Record<string, string> = { video: "#3B82F6", text: "#A78BFA", quiz: "#F59E0B", assignment: "#10B981", live: "#EF4444" };
  const typeLabels: Record<string, string> = { video: "Video", text: "Read", quiz: "Quiz", assignment: "Project", live: "Live" };

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {modules.map((mod, i) => (
          <div
            key={mod.title}
            style={{
              marginBottom: "0.75rem",
              backgroundColor: c.s,
              border: `1px solid ${i === 0 ? rgba(c.accent, 0.15) : c.b}`,
              borderRadius: "12px",
              padding: "1.25rem",
            }}
          >
            {/* Module header */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: i === 0 ? rgba(c.accent, 0.15) : (c.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: i === 0 ? c.accent : c.m,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ color: c.h, fontWeight: 600, fontSize: "0.95rem" }}>{mod.title}</h4>
                <span style={{ color: c.m, fontSize: "0.72rem" }}>{mod.lessons.length} lessons</span>
              </div>
              {/* Chevron */}
              <div style={{ color: c.m, fontSize: "0.7rem", transform: i === 0 ? "rotate(90deg)" : "none" }}>&#9654;</div>
            </div>

            {/* Expand first module's lessons */}
            {i === 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
                {mod.lessons.slice(0, 5).map((lesson) => {
                  const tc = typeColors[lesson.type ?? "video"] ?? "#3B82F6";
                  const tl = typeLabels[lesson.type ?? "video"] ?? "Video";
                  return (
                    <li key={lesson.title} style={{ display: "flex", alignItems: "center", padding: "8px 0 8px 50px", gap: "10px" }}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: tc,
                          flexShrink: 0,
                          boxShadow: `0 0 6px ${tc}44`,
                        }}
                      />
                      <span style={{ color: c.t, fontSize: "0.85rem", flex: 1 }}>{lesson.title}</span>
                      <span
                        style={{
                          color: c.m,
                          fontSize: "0.7rem",
                          backgroundColor: c.dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {tl} {lesson.duration ? `\u00B7 ${lesson.duration}` : ""}
                      </span>
                    </li>
                  );
                })}
                {mod.lessons.length > 5 && (
                  <li style={{ padding: "6px 0 6px 50px", color: c.m, fontSize: "0.8rem" }}>
                    +{mod.lessons.length - 5} more
                  </li>
                )}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  InstructorBio — Rich card with stats + credentials                 */
/* ================================================================== */

function InstructorBioRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const name = (props.name as string) ?? "";
  const bio = (props.bio as string) ?? "";
  const avatar = props.avatar as string | undefined;
  const credentials = (props.credentials as string[]) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "760px", margin: "0 auto", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* Avatar with accent-colored ring */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${c.accent}, ${rgba(c.accent, 0.4)})`,
            padding: "3px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: (style.backgroundColor as string) ?? "#0F172A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {avatar ? (
              <img src={avatar} alt={`Instructor ${name}`} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ color: c.accent, fontWeight: 700, fontSize: "2.25rem", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                {name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: c.m, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600, marginBottom: "4px" }}>Your Instructor</div>
          <h3 style={{ color: c.h, fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{name}</h3>

          {credentials.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.6rem" }}>
              {credentials.map((cr) => (
                <span
                  key={cr}
                  style={{
                    background: rgba(c.accent, 0.08),
                    color: c.accent,
                    fontSize: "0.7rem",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    border: `1px solid ${rgba(c.accent, 0.12)}`,
                  }}
                >
                  {cr}
                </span>
              ))}
            </div>
          )}

          {bio && (
            <p style={{ color: c.t, fontSize: "0.9rem", lineHeight: 1.75, marginTop: "0.85rem" }}>{bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CourseGrid — Course cards with template accent                     */
/* ================================================================== */

function CourseGridRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const columns = (props.columns as number) ?? 3;

  const courses = [
    { gradient: `linear-gradient(135deg, ${c.accent}, ${rgba(c.accent, 0.6)})`, title: "Design Fundamentals", students: "2.4k", rating: "4.9" },
    { gradient: "linear-gradient(135deg, #EC4899, #F472B6)", title: "Web Development", students: "8.1k", rating: "4.8" },
    { gradient: "linear-gradient(135deg, #10B981, #34D399)", title: "Data Science", students: "3.7k", rating: "4.7" },
  ];

  return (
    <div style={{ ...style }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(columns, 4)}, 1fr)`, gap: "1.25rem" }}>
        {courses.map((course) => (
          <div
            key={course.title}
            style={{
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: c.s,
              border: `1px solid ${c.b}`,
            }}
          >
            <div style={{ height: "110px", background: course.gradient, position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  backdropFilter: "blur(4px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "10px solid rgba(255,255,255,0.9)", marginLeft: "2px" }} />
              </div>
            </div>
            <div style={{ padding: "1rem" }}>
              <div style={{ color: c.h, fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem" }}>{course.title}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: c.m, fontSize: "0.75rem" }}>{course.students} students</span>
                <span style={{ color: "#FBBF24", fontSize: "0.75rem" }}>&#9733; {course.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  VideoPlayer — Rich play button + progress bar                      */
/* ================================================================== */

function VideoPlayerRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const aspectRatio = (props.aspectRatio as string) ?? "16:9";
  const paddingBottom = aspectRatio === "4:3" ? "75%" : aspectRatio === "1:1" ? "100%" : "56.25%";
  const c = pal(style);

  return (
    <div style={{ ...style }}>
      <div style={{ position: "relative", paddingBottom, background: `linear-gradient(135deg, ${c.dark ? "#0F172A" : "#E2E8F0"}, ${c.dark ? "#1E293B" : "#F1F5F9"})`, borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: rgba(c.accent, 0.15),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${rgba(c.accent, 0.3)}`,
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "14px solid transparent",
                borderBottom: "14px solid transparent",
                borderLeft: `22px solid ${c.accent}`,
                marginLeft: "5px",
              }}
            />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: "35%", height: "100%", background: `linear-gradient(90deg, ${c.accent}, ${rgba(c.accent, 0.6)})`, borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  StreakCounter — Fire emoji with accent glow                        */
/* ================================================================== */

function StreakCounterRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const currentStreak = (props.currentStreak as number) ?? 0;
  const longestStreak = (props.longestStreak as number) ?? 0;

  return (
    <div style={{ ...style }}>
      <div
        style={{
          background: rgba(c.accent, 0.06),
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          border: `1px solid ${rgba(c.accent, 0.12)}`,
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem", lineHeight: 1 }}>&#128293;</div>
        <div style={{ fontSize: "3rem", fontWeight: 800, color: c.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{currentStreak}</div>
        <div style={{ color: c.m, fontSize: "0.85rem", marginTop: "0.35rem", fontWeight: 500 }}>Day Streak</div>
        {longestStreak > 0 && (
          <div style={{ color: c.f, fontSize: "0.75rem", marginTop: "0.5rem" }}>Best: {longestStreak} days</div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CommunityFeed — Richer post cards                                  */
/* ================================================================== */

function CommunityFeedRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const posts = (props.posts as Array<{
    authorName: string;
    content: string;
    timestamp?: string;
    reactions?: number;
    comments?: number;
  }>) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.authorName}
            style={{
              backgroundColor: c.s,
              border: `1px solid ${c.b}`,
              borderRadius: "14px",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${rgba(c.accent, 0.25)}, ${rgba(c.accent, 0.1)})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.accent,
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  flexShrink: 0,
                }}
              >
                {post.authorName.charAt(0)}
              </div>
              <div>
                <div style={{ color: c.h, fontWeight: 600, fontSize: "0.85rem" }}>{post.authorName}</div>
                {post.timestamp && <div style={{ color: c.f, fontSize: "0.7rem" }}>{post.timestamp}</div>}
              </div>
            </div>
            <p style={{ color: c.t, fontSize: "0.85rem", lineHeight: 1.65 }}>{post.content}</p>
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: `1px solid ${c.b}`, color: c.m, fontSize: "0.75rem" }}>
              {typeof post.reactions === "number" && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ color: c.accent }}>&#10084;</span> {post.reactions}
                </span>
              )}
              {typeof post.comments === "number" && (
                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  &#128172; {post.comments}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LiveEventBanner — Accent-aware with LIVE badge                     */
/* ================================================================== */

function LiveEventBannerRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const hostName = (props.hostName as string) ?? "";
  const startTime = (props.startTime as string) ?? "";
  const c = pal(style);

  return (
    <div style={{ ...style }}>
      <div
        style={{
          background: `linear-gradient(135deg, ${(style.backgroundColor as string) ?? "#1E1033"} 0%, ${rgba(c.accent, 0.2)} 100%)`,
          borderRadius: "16px",
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          boxShadow: `0 4px 30px ${rgba(c.accent, 0.12)}`,
          border: `1px solid ${rgba(c.accent, 0.15)}`,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#EF4444",
              color: "#fff",
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "99px",
              marginBottom: "0.85rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              boxShadow: "0 0 16px rgba(239,68,68,0.3)",
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff" }} /> LIVE
          </div>
          <h3 style={{ color: "#fff", fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.9rem", marginTop: "0.35rem" }}>
            {hostName}{startTime ? ` \u2022 ${startTime}` : ""}
          </p>
        </div>
        <button
          type="button"
          style={{
            background: c.accent,
            color: isDarkBg(c.accent) ? "#fff" : "#000",
            fontWeight: 700,
            padding: "0.7rem 1.75rem",
            borderRadius: "8px",
            border: "none",
            fontSize: "0.85rem",
            cursor: "default",
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            boxShadow: `0 2px 12px ${rgba(c.accent, 0.25)}`,
          }}
        >
          Join Now
        </button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CertificateDisplay — Ornate framed certificate                     */
/* ================================================================== */

function CertificateDisplayRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const courseName = (props.courseName as string) ?? "Course";
  const studentName = (props.studentName as string) ?? "Student";
  const completedDate = (props.completedDate as string) ?? "";

  // Use gold tones for certificates
  const goldAccent = c.accent.includes("C4A3") || c.accent.includes("D4A8") ? c.accent : "#C4A35A";

  return (
    <div style={{ ...style }}>
      <div
        style={{
          borderRadius: "16px",
          padding: "3px",
          background: `linear-gradient(135deg, ${goldAccent}, ${rgba(goldAccent, 0.4)}, ${goldAccent})`,
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            borderRadius: "13px",
            padding: "2.5rem 2rem",
            textAlign: "center",
            backgroundColor: c.dark ? "rgba(10,10,20,0.95)" : "#FFFEF8",
            position: "relative",
          }}
        >
          {/* Decorative corner elements */}
          <div style={{ position: "absolute", top: "12px", left: "12px", width: "24px", height: "24px", borderTop: `2px solid ${rgba(goldAccent, 0.35)}`, borderLeft: `2px solid ${rgba(goldAccent, 0.35)}`, borderRadius: "4px 0 0 0" }} />
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "24px", height: "24px", borderTop: `2px solid ${rgba(goldAccent, 0.35)}`, borderRight: `2px solid ${rgba(goldAccent, 0.35)}`, borderRadius: "0 4px 0 0" }} />
          <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "24px", height: "24px", borderBottom: `2px solid ${rgba(goldAccent, 0.35)}`, borderLeft: `2px solid ${rgba(goldAccent, 0.35)}`, borderRadius: "0 0 0 4px" }} />
          <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "24px", height: "24px", borderBottom: `2px solid ${rgba(goldAccent, 0.35)}`, borderRight: `2px solid ${rgba(goldAccent, 0.35)}`, borderRadius: "0 0 4px 0" }} />

          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>&#127942;</div>
          <div style={{ color: c.m, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>Certificate of Completion</div>
          <div style={{ width: "48px", height: "2px", background: `linear-gradient(90deg, transparent, ${goldAccent}, transparent)`, margin: "0.75rem auto" }} />
          <p style={{ color: goldAccent, fontSize: "1.2rem", fontWeight: 700, fontFamily: '"Cormorant Garamond", Georgia, serif', marginTop: "0.5rem" }}>{courseName}</p>
          <p style={{ color: c.t, fontSize: "0.9rem", marginTop: "0.75rem" }}>Awarded to <strong style={{ color: c.h }}>{studentName}</strong></p>
          {completedDate && <p style={{ color: c.m, fontSize: "0.75rem", marginTop: "0.35rem" }}>{completedDate}</p>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  BadgeShowcase — Accent-aware earned badges                         */
/* ================================================================== */

function BadgeShowcaseRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const badges = (props.badges as Array<{
    name: string;
    icon?: string;
    description?: string;
    earned?: boolean;
  }>) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", maxWidth: "520px", margin: "0 auto" }}>
        {badges.slice(0, 6).map((badge, i) => {
          const earned = badge.earned !== false;
          return (
            <div
              key={badge.name}
              style={{
                textAlign: "center",
                padding: "1.25rem 0.75rem",
                borderRadius: "14px",
                background: earned ? rgba(c.accent, 0.06 + (i % 3) * 0.02) : c.s,
                border: `1px solid ${earned ? rgba(c.accent, 0.15) : c.b}`,
                opacity: earned ? 1 : 0.35,
                position: "relative",
              }}
            >
              {earned && (
                <div style={{ position: "absolute", top: "8px", right: "8px", width: "8px", height: "8px", borderRadius: "50%", backgroundColor: c.accent, boxShadow: `0 0 8px ${rgba(c.accent, 0.4)}` }} />
              )}
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem", lineHeight: 1 }}>{badge.icon ?? "&#11088;"}</div>
              <div style={{ color: earned ? c.h : c.m, fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }}>{badge.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LeaderboardWidget — Table-style with accent ranks                  */
/* ================================================================== */

function LeaderboardWidgetRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const entries = (props.entries as Array<{ name: string; points: number }>) ?? [];
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px 8px", borderBottom: `1px solid ${c.b}`, marginBottom: "4px" }}>
          <span style={{ color: c.m, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Rank</span>
          <span style={{ color: c.m, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Points</span>
        </div>
        {entries.slice(0, 5).map((entry, i) => (
          <div
            key={entry.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              marginBottom: "2px",
              borderRadius: i < 3 ? "10px" : "0",
              backgroundColor: i === 0 ? rgba(c.accent, 0.08) : (i < 3 ? c.s : "transparent"),
              borderBottom: i >= 3 ? `1px solid ${c.b}` : "none",
              border: i === 0 ? `1px solid ${rgba(c.accent, 0.12)}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "28px", textAlign: "center", fontSize: i < 3 ? "1.2rem" : "0.85rem", color: c.m }}>
                {i < 3 ? medals[i] : i + 1}
              </span>
              <span style={{ color: i === 0 ? c.accent : c.h, fontSize: "0.85rem", fontWeight: i < 3 ? 600 : 400 }}>{entry.name}</span>
            </div>
            <span style={{ color: c.accent, fontWeight: 700, fontSize: "0.8rem", fontVariantNumeric: "tabular-nums" }}>{entry.points.toLocaleString()} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ContentRow                                                         */
/* ================================================================== */

function ContentRowRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const title = (props.title as string) ?? "";
  const subtitle = (props.subtitle as string) ?? "";

  return (
    <div style={{ ...style }}>
      <div style={{ marginBottom: "1rem" }}>
        {title && <h3 style={{ color: c.h, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>}
        {subtitle && <p style={{ color: c.m, fontSize: "0.85rem", marginTop: "0.35rem" }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
        {[c.accent, "#EC4899", "#10B981"].map((color, i) => (
          <div
            key={`row-${i}`}
            style={{
              minWidth: "200px",
              height: "110px",
              borderRadius: "14px",
              background: `linear-gradient(135deg, ${color}, ${rgba(color, 0.5)})`,
              flexShrink: 0,
              opacity: 0.7,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LessonCard                                                         */
/* ================================================================== */

function LessonCardRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const title = (props.title as string) ?? "Lesson";
  const duration = (props.duration as string) ?? "";
  const lessonType = (props.lessonType as string) ?? "video";
  const isCompleted = (props.isCompleted as boolean) ?? false;

  const typeColors: Record<string, string> = { video: "#3B82F6", text: "#A78BFA", quiz: "#F59E0B", assignment: "#10B981", live: "#EF4444" };
  const tc = typeColors[lessonType] ?? "#3B82F6";

  return (
    <div style={{ ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.85rem 1.25rem",
          backgroundColor: c.s,
          border: `1px solid ${c.b}`,
          borderRadius: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: tc, boxShadow: `0 0 6px ${tc}44` }} />
          <span style={{ color: c.h, fontSize: "0.85rem" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {duration && <span style={{ color: c.m, fontSize: "0.75rem" }}>{duration}</span>}
          {isCompleted && <span style={{ color: "#10B981", fontSize: "0.9rem" }}>&#10003;</span>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  ImageBlock                                                         */
/* ================================================================== */

function ImageBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const src = props.src as string | undefined;
  const alt = (props.alt as string) ?? "Template image";
  const aspectRatio = (props.aspectRatio as string) ?? "16:9";
  const paddingBottom = aspectRatio === "4:3" ? "75%" : aspectRatio === "1:1" ? "100%" : "56.25%";

  return (
    <div style={{ ...style }}>
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", borderRadius: "14px", objectFit: "cover" }} loading="lazy" />
      ) : (
        <div style={{ position: "relative", paddingBottom, background: c.dark ? "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))" : "linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.01))", borderRadius: "14px", border: `1px solid ${c.b}` }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: c.m, fontSize: "0.85rem" }}>
            &#128247;
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  QuizBlock                                                          */
/* ================================================================== */

function QuizBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const title = (props.title as string) ?? "Quiz";
  const questionCount = (props.questionCount as number) ?? 0;

  return (
    <div style={{ ...style }}>
      <div
        style={{
          border: `2px dashed ${c.bs}`,
          borderRadius: "14px",
          padding: "2rem",
          textAlign: "center",
          background: rgba(c.accent, 0.02),
        }}
      >
        <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>&#x1F4DD;</div>
        <h4 style={{ color: c.h, fontWeight: 600 }}>{title}</h4>
        {questionCount > 0 && <p style={{ color: c.m, fontSize: "0.8rem", marginTop: "0.35rem" }}>{questionCount} questions</p>}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Fallback                                                           */
/* ================================================================== */

function FallbackRenderer({ section }: { readonly section: SDUISection }) {
  return (
    <div style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
      <div
        style={{
          color: "#64748B",
          fontSize: "0.8rem",
          backgroundColor: "rgba(255,255,255,0.03)",
          padding: "1rem",
          borderRadius: "10px",
          border: "1px dashed rgba(255,255,255,0.1)",
        }}
      >
        {section.type} section
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Renderer map                                                       */
/* ================================================================== */

type RendererFn = (p: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) => JSX.Element;

const RENDERERS: Record<string, RendererFn> = {
  TextBlock: TextBlockRenderer,
  HeroSection: HeroSectionRenderer,
  PricingTable: PricingTableRenderer,
  TestimonialCarousel: TestimonialCarouselRenderer,
  CTAButton: CTAButtonRenderer,
  ProgressBar: ProgressBarRenderer,
  CurriculumAccordion: CurriculumAccordionRenderer,
  InstructorBio: InstructorBioRenderer,
  CourseGrid: CourseGridRenderer,
  VideoPlayer: VideoPlayerRenderer,
  StreakCounter: StreakCounterRenderer,
  CommunityFeed: CommunityFeedRenderer,
  LiveEventBanner: LiveEventBannerRenderer,
  CertificateDisplay: CertificateDisplayRenderer,
  BadgeShowcase: BadgeShowcaseRenderer,
  LeaderboardWidget: LeaderboardWidgetRenderer,
  ContentRow: ContentRowRenderer,
  LessonCard: LessonCardRenderer,
  ImageBlock: ImageBlockRenderer,
  QuizBlock: QuizBlockRenderer,
};

/* ================================================================== */
/*  Main component                                                     */
/* ================================================================== */

export function InlineSDUIPreview({ screen }: { readonly screen: SDUIScreen }) {
  // Detect primary font from template sections
  const primaryFont = screen.sections
    .map((s) => (s.style as Record<string, unknown> | undefined)?.fontFamily as string | undefined)
    .find((f) => f) ?? '"Plus Jakarta Sans", sans-serif';

  // Detect accent color from first section with explicit color
  const accentColor = screen.sections
    .map((s) => (s.style as Record<string, unknown> | undefined)?.color as string | undefined)
    .find((col) => col && col.startsWith("#"));

  return (
    <div style={{ fontFamily: primaryFont, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
      {screen.sections.map((section) => {
        const Renderer = RENDERERS[section.type];
        const style = sectionStyle(section);

        // Inject detected accent color if section doesn't have its own
        const enrichedStyle = accentColor && !style.color ? { ...style, color: accentColor } : style;

        if (!Renderer) {
          return <FallbackRenderer key={section.id} section={section} />;
        }

        return <Renderer key={section.id} props={section.props} style={enrichedStyle} />;
      })}
    </div>
  );
}
