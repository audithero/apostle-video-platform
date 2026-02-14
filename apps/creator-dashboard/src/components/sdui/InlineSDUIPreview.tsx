import { type CSSProperties } from "react";
import DOMPurify from "dompurify";
import type { SDUIScreen, SDUISection } from "@platform/sdui-schema";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function sectionStyle(section: SDUISection): CSSProperties {
  if (!section.style) return {};
  // Cast to CSSProperties — templates use standard CSS property names
  return section.style as unknown as CSSProperties;
}

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ["style", "target"] });
}

/* ------------------------------------------------------------------ */
/*  Section renderers                                                  */
/* ------------------------------------------------------------------ */

function TextBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const content = (props.content as string) ?? "";
  const alignment = (props.alignment as string) ?? "left";
  const maxWidth = (props.maxWidth as string) ?? "100%";
  const isHTML = /<[a-z][\s\S]*>/i.test(content);

  return (
    <div style={{ ...style, textAlign: alignment as CSSProperties["textAlign"] }}>
      <div style={{ maxWidth, margin: alignment === "center" ? "0 auto" : undefined }}>
        {isHTML ? (
          <div dangerouslySetInnerHTML={{ __html: sanitize(content) }} />
        ) : (
          <p style={{ color: "#94A3B8", lineHeight: 1.7 }}>{content}</p>
        )}
      </div>
    </div>
  );
}

function HeroSectionRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const subtitle = (props.subtitle as string) ?? "";
  const backgroundImage = props.backgroundImage as string | undefined;
  const ctaText = (props.ctaText as string) ?? "";
  const alignment = (props.alignment as string) ?? "center";
  const overlayOpacity = (props.overlayOpacity as number) ?? 0.4;

  return (
    <div
      style={{
        ...style,
        position: "relative",
        padding: style.padding ?? "5rem 2rem",
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        textAlign: alignment as CSSProperties["textAlign"],
      }}
    >
      {backgroundImage && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: `rgba(0,0,0,${String(overlayOpacity)})`,
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, maxWidth: "720px", margin: alignment === "center" ? "0 auto" : undefined }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: "1.15rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.7 }}>{subtitle}</p>
        )}
        {ctaText && (
          <button
            type="button"
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              backgroundColor: "#6366f1",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              fontSize: "1rem",
              cursor: "default",
            }}
          >
            {ctaText}
          </button>
        )}
      </div>
    </div>
  );
}

function PricingTableRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${String(Math.min(plans.length, 3))}, 1fr)`, gap: "1.5rem", maxWidth: "960px", width: "100%" }}>
        {plans.map((plan) => (
          <div
            key={plan.name}
            style={{
              border: plan.highlighted ? "2px solid #06B6D4" : "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "2rem",
              backgroundColor: plan.highlighted ? "rgba(6,182,212,0.05)" : "rgba(255,255,255,0.03)",
              position: "relative",
            }}
          >
            {plan.highlighted && (
              <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", backgroundColor: "#06B6D4", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "3px 12px", borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Most Popular
              </div>
            )}
            <h3 style={{ color: "#F1F5F9", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>{plan.name}</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "2.5rem", fontWeight: 800, color: plan.highlighted ? "#06B6D4" : "#F1F5F9" }}>{plan.price}</span>
              {plan.period && <span style={{ color: "#64748B", fontSize: "0.85rem" }}>/{plan.period}</span>}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "1.5rem 0" }}>
              {plan.features.map((f) => (
                <li key={f} style={{ color: "#94A3B8", fontSize: "0.85rem", padding: "6px 0", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "#06B6D4", flexShrink: 0 }}>&#10003;</span> {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              style={{
                width: "100%",
                padding: "0.7rem",
                borderRadius: "8px",
                backgroundColor: plan.highlighted ? "#06B6D4" : "transparent",
                color: plan.highlighted ? "#fff" : "#06B6D4",
                border: plan.highlighted ? "none" : "1px solid #06B6D4",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "default",
              }}
            >
              {plan.ctaText}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialCarouselRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const testimonials = (props.testimonials as Array<{
    name: string;
    quote: string;
    role?: string;
    avatar?: string;
  }>) ?? [];

  if (testimonials.length === 0) return <div style={style} />;
  // Show first testimonial for preview
  const t = testimonials[0];

  return (
    <div style={{ ...style, textAlign: "center" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", padding: "2rem 0" }}>
        <p style={{ fontSize: "1.1rem", color: "#CBD5E1", lineHeight: 1.8, fontStyle: "italic" }}>
          &ldquo;{t.quote}&rdquo;
        </p>
        <div style={{ marginTop: "1.5rem" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "rgba(99,102,241,0.2)", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#818CF8", fontWeight: 700, fontSize: "1.1rem" }}>
            {t.name.charAt(0)}
          </div>
          <p style={{ color: "#F1F5F9", fontWeight: 600, marginTop: "0.75rem" }}>{t.name}</p>
          {t.role && <p style={{ color: "#64748B", fontSize: "0.85rem" }}>{t.role}</p>}
        </div>
        {testimonials.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "1.5rem" }}>
            {testimonials.map((_, i) => (
              <div
                key={`dot-${String(i)}`}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: i === 0 ? "#6366f1" : "rgba(255,255,255,0.2)",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CTAButtonRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const text = (props.text as string) ?? "Click Here";
  const variant = (props.variant as string) ?? "primary";
  const size = (props.size as string) ?? "md";
  const fullWidth = (props.fullWidth as boolean) ?? false;

  const padding = size === "lg" ? "0.85rem 2.5rem" : size === "sm" ? "0.5rem 1rem" : "0.65rem 1.5rem";
  const fontSize = size === "lg" ? "1.1rem" : size === "sm" ? "0.8rem" : "0.9rem";

  const btnStyle: CSSProperties = {
    padding,
    fontSize,
    fontWeight: 600,
    borderRadius: "8px",
    cursor: "default",
    width: fullWidth ? "100%" : undefined,
    border: variant === "outline" ? "1px solid #6366f1" : "none",
    backgroundColor: variant === "primary" ? "#6366f1" : variant === "secondary" ? "rgba(99,102,241,0.15)" : "transparent",
    color: variant === "primary" ? "#fff" : "#6366f1",
  };

  return (
    <div style={style}>
      <button type="button" style={btnStyle}>{text}</button>
    </div>
  );
}

function ProgressBarRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const value = Math.min(100, Math.max(0, (props.value as number) ?? 0));
  const label = (props.label as string) ?? "";
  const showPercentage = (props.showPercentage as boolean) ?? true;
  const color = (props.color as string) ?? "#6366f1";

  return (
    <div style={{ ...style, padding: style.padding ?? "1rem 1.5rem" }}>
      {(label || showPercentage) && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "0.85rem", color: "#94A3B8" }}>
          <span>{label}</span>
          {showPercentage && <span>{String(value)}%</span>}
        </div>
      )}
      <div style={{ height: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${String(value)}%`, backgroundColor: color, borderRadius: "4px", transition: "width 0.5s" }} />
      </div>
    </div>
  );
}

function CurriculumAccordionRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const modules = (props.modules as Array<{
    title: string;
    lessons: Array<{ title: string; duration?: string; type?: string }>;
  }>) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {modules.map((mod, i) => (
          <div key={mod.title} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "1rem 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ color: "#F1F5F9", fontWeight: 600, fontSize: "0.95rem" }}>
                Module {String(i + 1)}: {mod.title}
              </h4>
              <span style={{ color: "#64748B", fontSize: "0.8rem" }}>{String(mod.lessons.length)} lessons</span>
            </div>
            {i === 0 && (
              <ul style={{ listStyle: "none", padding: 0, margin: "0.75rem 0 0" }}>
                {mod.lessons.slice(0, 4).map((lesson) => (
                  <li key={lesson.title} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0 6px 1rem", color: "#94A3B8", fontSize: "0.85rem" }}>
                    <span>{lesson.title}</span>
                    {lesson.duration && <span style={{ color: "#64748B", fontSize: "0.75rem" }}>{lesson.duration}</span>}
                  </li>
                ))}
                {mod.lessons.length > 4 && (
                  <li style={{ padding: "6px 0 6px 1rem", color: "#64748B", fontSize: "0.8rem", fontStyle: "italic" }}>
                    +{String(mod.lessons.length - 4)} more lessons
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

function InstructorBioRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const name = (props.name as string) ?? "";
  const bio = (props.bio as string) ?? "";
  const avatar = props.avatar as string | undefined;
  const credentials = (props.credentials as string[]) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "720px", margin: "0 auto", display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        <div style={{ width: "96px", height: "96px", borderRadius: "50%", backgroundColor: "rgba(99,102,241,0.2)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {avatar ? (
            <img src={avatar} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ color: "#818CF8", fontWeight: 700, fontSize: "2rem" }}>{name.charAt(0)}</span>
          )}
        </div>
        <div>
          <h3 style={{ color: "#F1F5F9", fontSize: "1.25rem", fontWeight: 700 }}>{name}</h3>
          {credentials.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "0.5rem" }}>
              {credentials.map((c) => (
                <span key={c} style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "#818CF8", fontSize: "0.7rem", padding: "3px 8px", borderRadius: "4px", fontWeight: 500 }}>{c}</span>
              ))}
            </div>
          )}
          {bio && <p style={{ color: "#94A3B8", fontSize: "0.9rem", lineHeight: 1.7, marginTop: "0.75rem" }}>{bio}</p>}
        </div>
      </div>
    </div>
  );
}

function CourseGridRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const columns = (props.columns as number) ?? 3;
  // CourseGrid usually gets children, but in SDUI templates it uses placeholder data
  return (
    <div style={{ ...style }}>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${String(Math.min(columns, 4))}, 1fr)`, gap: "1.5rem" }}>
        {[1, 2, 3].map((n) => (
          <div key={`course-${String(n)}`} style={{ borderRadius: "12px", overflow: "hidden", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ height: "120px", backgroundColor: "rgba(99,102,241,0.1)" }} />
            <div style={{ padding: "1rem" }}>
              <div style={{ height: "12px", width: "75%", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px" }} />
              <div style={{ height: "10px", width: "50%", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "4px", marginTop: "8px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPlayerRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const aspectRatio = (props.aspectRatio as string) ?? "16:9";
  const paddingBottom = aspectRatio === "4:3" ? "75%" : aspectRatio === "1:1" ? "100%" : "56.25%";

  return (
    <div style={{ ...style }}>
      <div style={{ position: "relative", paddingBottom, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "12px solid transparent", borderBottom: "12px solid transparent", borderLeft: "20px solid rgba(255,255,255,0.8)", marginLeft: "4px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StreakCounterRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const currentStreak = (props.currentStreak as number) ?? 0;
  const longestStreak = (props.longestStreak as number) ?? 0;

  return (
    <div style={{ ...style }}>
      <div style={{ background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(249,115,22,0.08))", borderRadius: "16px", padding: "2rem", textAlign: "center", border: "1px solid rgba(251,146,60,0.2)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>&#128293;</div>
        <div style={{ fontSize: "3rem", fontWeight: 800, color: "#FB923C" }}>{String(currentStreak)}</div>
        <div style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "0.25rem" }}>Day Streak</div>
        {longestStreak > 0 && (
          <div style={{ color: "#64748B", fontSize: "0.75rem", marginTop: "0.5rem" }}>Best: {String(longestStreak)} days</div>
        )}
      </div>
    </div>
  );
}

function CommunityFeedRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const posts = (props.posts as Array<{
    authorName: string;
    content: string;
    timestamp?: string;
    reactions?: number;
    comments?: number;
  }>) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {posts.slice(0, 3).map((post) => (
          <div key={post.authorName} style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "rgba(99,102,241,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#818CF8", fontWeight: 700, fontSize: "0.85rem" }}>
                {post.authorName.charAt(0)}
              </div>
              <div>
                <div style={{ color: "#F1F5F9", fontWeight: 600, fontSize: "0.85rem" }}>{post.authorName}</div>
                {post.timestamp && <div style={{ color: "#64748B", fontSize: "0.7rem" }}>{post.timestamp}</div>}
              </div>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: 1.6 }}>{post.content}</p>
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", color: "#64748B", fontSize: "0.75rem" }}>
              {typeof post.reactions === "number" && <span>&#10084;&#65039; {String(post.reactions)}</span>}
              {typeof post.comments === "number" && <span>&#128172; {String(post.comments)}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveEventBannerRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const hostName = (props.hostName as string) ?? "";
  const startTime = (props.startTime as string) ?? "";

  return (
    <div style={{ ...style }}>
      <div style={{ background: "linear-gradient(135deg, #1E1033, #8B5CF6)", borderRadius: "16px", padding: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#EF4444", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "3px 10px", borderRadius: "99px", marginBottom: "0.75rem", textTransform: "uppercase" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff" }} /> LIVE
          </div>
          <h3 style={{ color: "#fff", fontSize: "1.3rem", fontWeight: 700 }}>{title}</h3>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            {hostName}{startTime ? ` \u2022 ${startTime}` : ""}
          </p>
        </div>
        <button type="button" style={{ backgroundColor: "#fff", color: "#1E1033", fontWeight: 600, padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none", fontSize: "0.9rem", cursor: "default" }}>
          Join Now
        </button>
      </div>
    </div>
  );
}

function CertificateDisplayRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const courseName = (props.courseName as string) ?? "Course";
  const studentName = (props.studentName as string) ?? "Student";
  const completedDate = (props.completedDate as string) ?? "";

  return (
    <div style={{ ...style }}>
      <div style={{ border: "2px solid rgba(196,163,90,0.3)", borderRadius: "16px", padding: "2.5rem", textAlign: "center", backgroundColor: "rgba(196,163,90,0.04)", maxWidth: "480px", margin: "0 auto" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>&#127942;</div>
        <h3 style={{ color: "#F1F5F9", fontSize: "1.1rem", fontWeight: 700 }}>Certificate of Completion</h3>
        <p style={{ color: "#C4A35A", fontSize: "1.25rem", fontWeight: 700, marginTop: "0.5rem" }}>{courseName}</p>
        <p style={{ color: "#94A3B8", fontSize: "0.85rem", marginTop: "0.5rem" }}>Awarded to {studentName}</p>
        {completedDate && <p style={{ color: "#64748B", fontSize: "0.75rem", marginTop: "0.25rem" }}>{completedDate}</p>}
      </div>
    </div>
  );
}

function BadgeShowcaseRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const badges = (props.badges as Array<{
    name: string;
    icon?: string;
    description?: string;
    earned?: boolean;
  }>) ?? [];

  return (
    <div style={{ ...style }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", maxWidth: "480px", margin: "0 auto" }}>
        {badges.slice(0, 6).map((badge) => (
          <div
            key={badge.name}
            style={{
              textAlign: "center",
              padding: "1rem",
              borderRadius: "12px",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              opacity: badge.earned === false ? 0.4 : 1,
            }}
          >
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{badge.icon ?? "&#11088;"}</div>
            <div style={{ color: "#F1F5F9", fontSize: "0.75rem", fontWeight: 600 }}>{badge.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeaderboardWidgetRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const entries = (props.entries as Array<{ name: string; points: number }>) ?? [];
  const medals = ["\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"];

  return (
    <div style={{ ...style }}>
      <div style={{ maxWidth: "480px", margin: "0 auto" }}>
        {entries.slice(0, 5).map((entry, i) => (
          <div key={entry.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "28px", textAlign: "center", fontSize: i < 3 ? "1.1rem" : "0.85rem", color: "#64748B" }}>
                {i < 3 ? medals[i] : String(i + 1)}
              </span>
              <span style={{ color: "#F1F5F9", fontSize: "0.85rem", fontWeight: 500 }}>{entry.name}</span>
            </div>
            <span style={{ color: "#6366f1", fontWeight: 600, fontSize: "0.85rem" }}>{String(entry.points.toLocaleString())} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContentRowRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "";
  const subtitle = (props.subtitle as string) ?? "";

  return (
    <div style={{ ...style }}>
      <div style={{ marginBottom: "1rem" }}>
        {title && <h3 style={{ color: "#F1F5F9", fontSize: "1.15rem", fontWeight: 700 }}>{title}</h3>}
        {subtitle && <p style={{ color: "#64748B", fontSize: "0.85rem", marginTop: "0.25rem" }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {[1, 2, 3].map((n) => (
          <div key={`row-${String(n)}`} style={{ minWidth: "200px", height: "120px", borderRadius: "12px", backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }} />
        ))}
      </div>
    </div>
  );
}

function LessonCardRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "Lesson";
  const duration = (props.duration as string) ?? "";
  const lessonType = (props.lessonType as string) ?? "video";
  const isCompleted = (props.isCompleted as boolean) ?? false;

  const typeIcons: Record<string, string> = { video: "\u25B6", text: "\uD83D\uDCC4", quiz: "\u2753", assignment: "\uD83D\uDCDD", live: "\uD83D\uDD34" };

  return (
    <div style={{ ...style }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span>{typeIcons[lessonType] ?? "\u25B6"}</span>
          <span style={{ color: "#F1F5F9", fontSize: "0.85rem" }}>{title}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {duration && <span style={{ color: "#64748B", fontSize: "0.75rem" }}>{duration}</span>}
          {isCompleted && <span style={{ color: "#10B981" }}>&#10003;</span>}
        </div>
      </div>
    </div>
  );
}

function ImageBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const src = props.src as string | undefined;
  const alt = (props.alt as string) ?? "";
  const aspectRatio = (props.aspectRatio as string) ?? "16:9";
  const paddingBottom = aspectRatio === "4:3" ? "75%" : aspectRatio === "1:1" ? "100%" : "56.25%";

  return (
    <div style={{ ...style }}>
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }} loading="lazy" />
      ) : (
        <div style={{ position: "relative", paddingBottom, backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748B", fontSize: "0.85rem" }}>
            Image
          </div>
        </div>
      )}
    </div>
  );
}

function QuizBlockRenderer({ props, style }: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) {
  const title = (props.title as string) ?? "Quiz";
  const questionCount = (props.questionCount as number) ?? 0;

  return (
    <div style={{ ...style }}>
      <div style={{ border: "2px dashed rgba(255,255,255,0.15)", borderRadius: "12px", padding: "2rem", textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>&#x1F4DD;</div>
        <h4 style={{ color: "#F1F5F9", fontWeight: 600 }}>{title}</h4>
        {questionCount > 0 && <p style={{ color: "#64748B", fontSize: "0.8rem", marginTop: "0.25rem" }}>{String(questionCount)} questions</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Fallback renderer                                                  */
/* ------------------------------------------------------------------ */

function FallbackRenderer({ section }: { readonly section: SDUISection }) {
  return (
    <div style={{ padding: "1rem 1.5rem", textAlign: "center" }}>
      <div style={{ color: "#64748B", fontSize: "0.8rem", backgroundColor: "rgba(255,255,255,0.03)", padding: "1rem", borderRadius: "8px", border: "1px dashed rgba(255,255,255,0.1)" }}>
        {section.type} section
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Renderer map                                                       */
/* ------------------------------------------------------------------ */

type RendererFn = (p: { readonly props: Record<string, unknown>; readonly style: CSSProperties }) => React.JSX.Element;

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

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function InlineSDUIPreview({ screen }: { readonly screen: SDUIScreen }) {
  return (
    <div style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>
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
