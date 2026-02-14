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

/** Adaptive color palette derived from section background */
function pal(style: CSSProperties) {
  const dark = isDarkBg(style.backgroundColor as string);
  return {
    dark,
    h: dark ? "#F1F5F9" : "#0F172A",
    t: dark ? "#CBD5E1" : "#475569",
    m: dark ? "#64748B" : "#94A3B8",
    f: dark ? "#475569" : "#CBD5E1",
    s: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)",
    b: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    bs: dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
    av: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
    ck: dark ? "#22D3EE" : "#0EA5E9",
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

  // Derive a radial glow from the background color for visual depth
  const meshGradient = backgroundImage
    ? undefined
    : `radial-gradient(ellipse 80% 50% at 50% 0%, ${bg === "#0A0A0A" ? "rgba(0,255,135,0.06)" : "rgba(255,255,255,0.06)"} 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99,102,241,0.08) 0%, transparent 60%)`;

  return (
    <div
      style={{
        ...style,
        position: "relative",
        padding: style.padding ?? "6rem 2.5rem 5rem",
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
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: alignment === "center" ? "760px" : "640px",
          margin: alignment === "center" ? "0 auto" : undefined,
        }}
      >
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
              color: "rgba(255,255,255,0.72)",
              lineHeight: 1.75,
              maxWidth: "580px",
              margin: alignment === "center" ? "0 auto" : undefined,
            }}
          >
            {subtitle}
          </p>
        )}
        {ctaText && (
          <button
            type="button"
            style={{
              marginTop: "2rem",
              padding: "0.85rem 2.25rem",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)",
              color: bg,
              fontWeight: 700,
              border: "none",
              fontSize: "0.95rem",
              cursor: "default",
              letterSpacing: "-0.01em",
              boxShadow: "0 0 30px rgba(255,255,255,0.12), 0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PricingTable — Glass cards, gradient highlights                     */
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

  // Extract accent from highlighted plan's context or use default
  const accentColor = c.dark ? "#22D3EE" : "#0284C7";

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
                border: hi ? `2px solid ${accentColor}` : `1px solid ${c.b}`,
                backgroundColor: hi ? (c.dark ? "rgba(34,211,238,0.04)" : "rgba(2,132,199,0.03)") : c.s,
                boxShadow: hi ? `0 0 40px ${c.dark ? "rgba(34,211,238,0.08)" : "rgba(2,132,199,0.06)"}` : "none",
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
                    background: `linear-gradient(135deg, ${accentColor}, #818CF8)`,
                    color: "#fff",
                    fontSize: "0.68rem",
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
              <h3 style={{ color: c.m, fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "3px", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "2.75rem", fontWeight: 800, color: hi ? accentColor : c.h, letterSpacing: "-0.03em", lineHeight: 1 }}>{plan.price}</span>
                {plan.period && <span style={{ color: c.m, fontSize: "0.8rem" }}>/{plan.period}</span>}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0 1.75rem" }}>
                {plan.features.map((f, fi) => (
                  <li key={`${plan.name}-f${fi}`} style={{ color: c.t, fontSize: "0.85rem", padding: "7px 0", display: "flex", gap: "10px", alignItems: "flex-start", lineHeight: 1.4 }}>
                    <span style={{ color: accentColor, flexShrink: 0, fontSize: "0.75rem", marginTop: "2px" }}>&#10003;</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "10px",
                  background: hi ? `linear-gradient(135deg, ${accentColor}, #818CF8)` : "transparent",
                  color: hi ? "#fff" : accentColor,
                  border: hi ? "none" : `1px solid ${c.bs}`,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: "default",
                  letterSpacing: "-0.01em",
                  boxShadow: hi ? `0 4px 20px ${c.dark ? "rgba(34,211,238,0.15)" : "rgba(2,132,199,0.12)"}` : "none",
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
/*  TestimonialCarousel — Shows ALL testimonials in grid                */
/* ================================================================== */

function TestimonialCarouselRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const testimonials = (props.testimonials as Array<{
    name: string;
    quote: string;
    role?: string;
    avatar?: string;
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
        {testimonials.slice(0, 3).map((t) => {
          const initials = t.name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2);
          return (
            <div
              key={t.name}
              style={{
                padding: "1.75rem",
                borderRadius: "16px",
                backgroundColor: c.s,
                border: `1px solid ${c.b}`,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Quote mark */}
              <div style={{ fontSize: "2.5rem", lineHeight: 1, color: c.bs, fontFamily: '"Cormorant Garamond", Georgia, serif', marginBottom: "0.75rem", userSelect: "none" }}>&ldquo;</div>

              <p style={{ fontSize: "0.9rem", color: c.t, lineHeight: 1.75, flex: 1, fontStyle: "italic" }}>
                {t.quote}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${c.b}` }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background: c.dark
                      ? "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(34,211,238,0.2))"
                      : "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(14,165,233,0.1))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: c.dark ? "#A5B4FC" : "#6366F1",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </div>
                <div>
                  <div style={{ color: c.h, fontWeight: 600, fontSize: "0.85rem" }}>{t.name}</div>
                  {t.role && <div style={{ color: c.m, fontSize: "0.75rem", marginTop: "1px" }}>{t.role}</div>}
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
/*  CTAButton — Gradient with glow                                     */
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
    borderRadius: "10px",
    cursor: "default",
    width: fullWidth ? "100%" : undefined,
    letterSpacing: "-0.01em",
    border: isOutline ? `1px solid ${c.bs}` : "none",
    background: isPrimary
      ? "linear-gradient(135deg, #6366F1, #818CF8)"
      : variant === "secondary"
        ? (c.dark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)")
        : "transparent",
    color: isPrimary ? "#fff" : (c.dark ? "#A5B4FC" : "#6366F1"),
    boxShadow: isPrimary ? "0 4px 24px rgba(99,102,241,0.2)" : "none",
  };

  return (
    <div style={style}>
      <button type="button" style={btnStyle}>{text}</button>
    </div>
  );
}

/* ================================================================== */
/*  ProgressBar — Gradient fill                                        */
/* ================================================================== */

function ProgressBarRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const value = Math.min(100, Math.max(0, (props.value as number) ?? 0));
  const label = (props.label as string) ?? "";
  const showPercentage = (props.showPercentage as boolean) ?? true;
  const color = (props.color as string) ?? "#6366f1";
  const c = pal(style);

  return (
    <div style={{ ...style, padding: style.padding ?? "1rem 1.5rem" }}>
      {(label || showPercentage) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.85rem" }}>
          <span style={{ color: c.h, fontWeight: 500 }}>{label}</span>
          {showPercentage && <span style={{ color: c.m, fontWeight: 600 }}>{value}%</span>}
        </div>
      )}
      <div style={{ height: "8px", backgroundColor: c.dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: "99px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${value}%`,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            borderRadius: "99px",
            boxShadow: value > 0 ? `0 0 12px ${color}33` : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CurriculumAccordion — Better hierarchy + type indicators           */
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
          <div key={mod.title} style={{ marginBottom: "0.5rem" }}>
            {/* Module header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "1rem 0",
                borderBottom: `1px solid ${c.b}`,
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  backgroundColor: c.dark ? "rgba(99,102,241,0.12)" : "rgba(99,102,241,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.dark ? "#A5B4FC" : "#6366F1",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <h4 style={{ color: c.h, fontWeight: 600, fontSize: "0.95rem", flex: 1 }}>
                {mod.title}
              </h4>
              <span style={{ color: c.m, fontSize: "0.75rem", flexShrink: 0 }}>{mod.lessons.length} lessons</span>
            </div>

            {/* Expand first module's lessons */}
            {i === 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.5rem 0 0" }}>
                {mod.lessons.slice(0, 5).map((lesson) => {
                  const tc = typeColors[lesson.type ?? "video"] ?? "#3B82F6";
                  const tl = typeLabels[lesson.type ?? "video"] ?? "Video";
                  return (
                    <li key={lesson.title} style={{ display: "flex", alignItems: "center", padding: "8px 0 8px 40px", gap: "10px" }}>
                      {/* Type dot */}
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
                          backgroundColor: c.s,
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
                  <li style={{ padding: "6px 0 6px 40px", color: c.m, fontSize: "0.8rem" }}>
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
/*  InstructorBio — Gradient avatar ring + credential pills            */
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
        {/* Avatar with gradient ring */}
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366F1, #22D3EE)",
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
              <span style={{ color: "#818CF8", fontWeight: 700, fontSize: "2.25rem", fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
                {name.charAt(0)}
              </span>
            )}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ color: c.h, fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{name}</h3>

          {credentials.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.6rem" }}>
              {credentials.map((cr) => (
                <span
                  key={cr}
                  style={{
                    background: c.dark ? "rgba(99,102,241,0.1)" : "rgba(99,102,241,0.07)",
                    color: c.dark ? "#A5B4FC" : "#6366F1",
                    fontSize: "0.7rem",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: 500,
                    border: `1px solid ${c.dark ? "rgba(99,102,241,0.15)" : "rgba(99,102,241,0.1)"}`,
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
/*  CourseGrid — Actual course cards with gradients                     */
/* ================================================================== */

function CourseGridRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const columns = (props.columns as number) ?? 3;

  const courses = [
    { gradient: "linear-gradient(135deg, #6366F1, #818CF8)", title: "Design Fundamentals", students: "2.4k", rating: "4.9" },
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
              {/* Play icon */}
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

  return (
    <div style={{ ...style }}>
      <div style={{ position: "relative", paddingBottom, background: "linear-gradient(135deg, #0F172A, #1E293B)", borderRadius: "14px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Outer ring */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.15)",
            }}
          >
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "14px solid transparent",
                borderBottom: "14px solid transparent",
                borderLeft: "22px solid rgba(255,255,255,0.85)",
                marginLeft: "5px",
              }}
            />
          </div>
        </div>
        {/* Bottom progress bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "4px", backgroundColor: "rgba(255,255,255,0.08)" }}>
          <div style={{ width: "35%", height: "100%", background: "linear-gradient(90deg, #6366F1, #818CF8)", borderRadius: "0 2px 2px 0" }} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  StreakCounter                                                       */
/* ================================================================== */

function StreakCounterRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const currentStreak = (props.currentStreak as number) ?? 0;
  const longestStreak = (props.longestStreak as number) ?? 0;

  return (
    <div style={{ ...style }}>
      <div
        style={{
          background: c.dark
            ? "linear-gradient(135deg, rgba(251,146,60,0.1), rgba(249,115,22,0.04))"
            : "linear-gradient(135deg, rgba(251,146,60,0.08), rgba(249,115,22,0.03))",
          borderRadius: "16px",
          padding: "2rem",
          textAlign: "center",
          border: `1px solid ${c.dark ? "rgba(251,146,60,0.15)" : "rgba(251,146,60,0.12)"}`,
        }}
      >
        <div style={{ fontSize: "2.5rem", marginBottom: "0.25rem", lineHeight: 1 }}>&#128293;</div>
        <div style={{ fontSize: "3rem", fontWeight: 800, color: "#FB923C", letterSpacing: "-0.03em", lineHeight: 1 }}>{currentStreak}</div>
        <div style={{ color: c.m, fontSize: "0.85rem", marginTop: "0.35rem", fontWeight: 500 }}>Day Streak</div>
        {longestStreak > 0 && (
          <div style={{ color: c.f, fontSize: "0.75rem", marginTop: "0.5rem" }}>Best: {longestStreak} days</div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  CommunityFeed                                                      */
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
                  background: c.dark
                    ? "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(34,211,238,0.15))"
                    : "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(14,165,233,0.08))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: c.dark ? "#A5B4FC" : "#6366F1",
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
            <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.75rem", color: c.m, fontSize: "0.75rem" }}>
              {typeof post.reactions === "number" && <span>&#10084;&#65039; {post.reactions}</span>}
              {typeof post.comments === "number" && <span>&#128172; {post.comments}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LiveEventBanner                                                    */
/* ================================================================== */

function LiveEventBannerRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const hostName = (props.hostName as string) ?? "";
  const startTime = (props.startTime as string) ?? "";

  return (
    <div style={{ ...style }}>
      <div
        style={{
          background: "linear-gradient(135deg, #1E1033 0%, #5B21B6 50%, #7C3AED 100%)",
          borderRadius: "16px",
          padding: "2rem 2.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem",
          boxShadow: "0 4px 30px rgba(124,58,237,0.15)",
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
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
            color: "#1E1033",
            fontWeight: 700,
            padding: "0.7rem 1.75rem",
            borderRadius: "10px",
            border: "none",
            fontSize: "0.9rem",
            cursor: "default",
            whiteSpace: "nowrap",
            boxShadow: "0 2px 12px rgba(255,255,255,0.1)",
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

  return (
    <div style={{ ...style }}>
      <div
        style={{
          borderRadius: "16px",
          padding: "3px",
          background: "linear-gradient(135deg, #C4A35A, #8B6914, #C4A35A)",
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
          <div style={{ position: "absolute", top: "12px", left: "12px", width: "24px", height: "24px", borderTop: "2px solid rgba(196,163,90,0.35)", borderLeft: "2px solid rgba(196,163,90,0.35)", borderRadius: "4px 0 0 0" }} />
          <div style={{ position: "absolute", top: "12px", right: "12px", width: "24px", height: "24px", borderTop: "2px solid rgba(196,163,90,0.35)", borderRight: "2px solid rgba(196,163,90,0.35)", borderRadius: "0 4px 0 0" }} />
          <div style={{ position: "absolute", bottom: "12px", left: "12px", width: "24px", height: "24px", borderBottom: "2px solid rgba(196,163,90,0.35)", borderLeft: "2px solid rgba(196,163,90,0.35)", borderRadius: "0 0 0 4px" }} />
          <div style={{ position: "absolute", bottom: "12px", right: "12px", width: "24px", height: "24px", borderBottom: "2px solid rgba(196,163,90,0.35)", borderRight: "2px solid rgba(196,163,90,0.35)", borderRadius: "0 0 4px 0" }} />

          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>&#127942;</div>
          <div style={{ color: c.m, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: "0.5rem" }}>Certificate of Completion</div>
          <div style={{ width: "48px", height: "2px", background: "linear-gradient(90deg, transparent, #C4A35A, transparent)", margin: "0.75rem auto" }} />
          <p style={{ color: "#C4A35A", fontSize: "1.2rem", fontWeight: 700, fontFamily: '"Cormorant Garamond", Georgia, serif', marginTop: "0.5rem" }}>{courseName}</p>
          <p style={{ color: c.t, fontSize: "0.9rem", marginTop: "0.75rem" }}>Awarded to <strong style={{ color: c.h }}>{studentName}</strong></p>
          {completedDate && <p style={{ color: c.m, fontSize: "0.75rem", marginTop: "0.35rem" }}>{completedDate}</p>}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  BadgeShowcase — Gradient earned badges                             */
/* ================================================================== */

function BadgeShowcaseRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const badges = (props.badges as Array<{
    name: string;
    icon?: string;
    description?: string;
    earned?: boolean;
  }>) ?? [];

  const earnedGradients = [
    "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(34,211,238,0.08))",
    "linear-gradient(135deg, rgba(236,72,153,0.12), rgba(244,114,182,0.06))",
    "linear-gradient(135deg, rgba(16,185,129,0.12), rgba(52,211,153,0.06))",
    "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.06))",
    "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(167,139,250,0.06))",
    "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(96,165,250,0.06))",
  ];

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
                background: earned ? earnedGradients[i % earnedGradients.length] : c.s,
                border: `1px solid ${earned ? c.bs : c.b}`,
                opacity: earned ? 1 : 0.35,
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem", lineHeight: 1 }}>{badge.icon ?? "&#11088;"}</div>
              <div style={{ color: c.h, fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.3 }}>{badge.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LeaderboardWidget                                                  */
/* ================================================================== */

function LeaderboardWidgetRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const c = pal(style);
  const entries = (props.entries as Array<{ name: string; points: number }>) ?? [];
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {entries.slice(0, 5).map((entry, i) => (
          <div
            key={entry.name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 12px",
              marginBottom: "4px",
              borderRadius: i < 3 ? "10px" : "0",
              backgroundColor: i < 3 ? c.s : "transparent",
              borderBottom: i >= 3 ? `1px solid ${c.b}` : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "28px", textAlign: "center", fontSize: i < 3 ? "1.2rem" : "0.85rem", color: c.m }}>
                {i < 3 ? medals[i] : i + 1}
              </span>
              <span style={{ color: c.h, fontSize: "0.85rem", fontWeight: i < 3 ? 600 : 400 }}>{entry.name}</span>
            </div>
            <span style={{ color: c.dark ? "#A5B4FC" : "#6366F1", fontWeight: 600, fontSize: "0.8rem" }}>{entry.points.toLocaleString()} pts</span>
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

  const gradients = [
    "linear-gradient(135deg, #6366F1, #818CF8)",
    "linear-gradient(135deg, #EC4899, #F472B6)",
    "linear-gradient(135deg, #10B981, #34D399)",
  ];

  return (
    <div style={{ ...style }}>
      <div style={{ marginBottom: "1rem" }}>
        {title && <h3 style={{ color: c.h, fontSize: "1.15rem", fontWeight: 700, letterSpacing: "-0.01em" }}>{title}</h3>}
        {subtitle && <p style={{ color: c.m, fontSize: "0.85rem", marginTop: "0.35rem" }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto" }}>
        {gradients.map((g, i) => (
          <div
            key={`row-${i}`}
            style={{
              minWidth: "200px",
              height: "110px",
              borderRadius: "14px",
              background: g,
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
          background: c.dark ? "rgba(245,158,11,0.03)" : "rgba(245,158,11,0.02)",
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
  // Detect primary font from template sections — use first fontFamily found
  const primaryFont = screen.sections
    .map((s) => (s.style as Record<string, unknown> | undefined)?.fontFamily as string | undefined)
    .find((f) => f) ?? '"Plus Jakarta Sans", sans-serif';

  return (
    <div style={{ fontFamily: primaryFont, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale" }}>
      {screen.sections.map((section) => {
        const Renderer = RENDERERS[section.type];
        const style = sectionStyle(section);

        if (!Renderer) {
          return <FallbackRenderer key={section.id} section={section} />;
        }

        return <Renderer key={section.id} props={section.props} style={style} />;
      })}
    </div>
  );
}
