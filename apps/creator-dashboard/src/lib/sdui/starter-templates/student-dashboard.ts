import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Student Dashboard — Active learner's personal hub
 *
 * Design language: Clean, motivational interface with progress-centric layout.
 * Inspired by Duolingo, Notion, and Linear dashboards.
 *
 * Typography: "Inter" system font stack for UI clarity
 * Palette: Clean white (#FAFBFC) base, purple (#7C3AED) primary,
 *          green (#10B981) success/progress, slate (#64748B) muted text.
 */
export const studentDashboardTemplate: SDUIScreen = {
  id: "tpl-student-dashboard",
  name: "Student Dashboard",
  slug: "student-dashboard",
  description:
    "Active student dashboard with streak tracking, course progress, and enrolled courses for a personalized learning hub",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Welcome Banner                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "welcome",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;"><div><h1 style="font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 2rem; font-weight: 800; color: #1E293B; margin: 0; letter-spacing: -0.02em;">Welcome back, Alex!</h1><p style="font-size: 1.05rem; color: #64748B; margin-top: 0.5rem; line-height: 1.6;">You\'re on a <strong style="color: #7C3AED;">7-day streak</strong> — keep the momentum going. Every lesson gets you closer to your goals.</p></div></div>',
        alignment: "left",
        maxWidth: "none",
      },
      style: {
        padding: "2.5rem 2rem 1.5rem",
        backgroundColor: "#FAFBFC",
        borderBottom: "1px solid #E2E8F0",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Streak Counter                                                   */
    /* ---------------------------------------------------------------- */
    {
      id: "streak",
      type: "StreakCounter",
      props: {
        currentStreak: 7,
        longestStreak: 14,
        icon: "Flame",
      },
      style: {
        padding: "1.5rem 2rem 1.5rem",
        maxWidth: "420px",
        backgroundColor: "#FAFBFC",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Overall Progress                                                 */
    /* ---------------------------------------------------------------- */
    {
      id: "overall-progress",
      type: "ProgressBar",
      props: {
        value: 65,
        label: "Overall Progress",
        showPercentage: true,
        color: "#7C3AED",
      },
      style: {
        padding: "0.5rem 2rem 1rem",
        maxWidth: "640px",
        backgroundColor: "#FAFBFC",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Current Course Progress                                          */
    /* ---------------------------------------------------------------- */
    {
      id: "current-course-progress",
      type: "ProgressBar",
      props: {
        value: 42,
        label: "Web Dev Bootcamp",
        showPercentage: true,
        color: "#10B981",
      },
      style: {
        padding: "0 2rem 2.5rem",
        maxWidth: "640px",
        backgroundColor: "#FAFBFC",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Stats Summary                                                    */
    /* ---------------------------------------------------------------- */
    {
      id: "stats",
      type: "TextBlock",
      props: {
        content:
          '<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 720px;"><div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;"><div style="font-size: 1.75rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #7C3AED;">76</div><div style="color: #64748B; font-size: 0.8rem; margin-top: 0.25rem;">Lessons Done</div></div><div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;"><div style="font-size: 1.75rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #10B981;">42h</div><div style="color: #64748B; font-size: 0.8rem; margin-top: 0.25rem;">Time Spent</div></div><div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;"><div style="font-size: 1.75rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #7C3AED;">5</div><div style="color: #64748B; font-size: 0.8rem; margin-top: 0.25rem;">Quizzes Aced</div></div><div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 1.25rem; text-align: center;"><div style="font-size: 1.75rem; font-weight: 800; font-family: Inter, system-ui, sans-serif; color: #10B981;">3</div><div style="color: #64748B; font-size: 0.8rem; margin-top: 0.25rem;">Certificates</div></div></div>',
        alignment: "left",
        maxWidth: "none",
      },
      style: {
        padding: "0 2rem 2.5rem",
        backgroundColor: "#FAFBFC",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Enrolled Courses Heading                                         */
    /* ---------------------------------------------------------------- */
    {
      id: "enrolled-heading",
      type: "TextBlock",
      props: {
        content:
          '<h2 style="font-family: Inter, system-ui, -apple-system, sans-serif; font-size: 1.5rem; font-weight: 700; color: #1E293B; margin: 0; letter-spacing: -0.01em;">Your Courses</h2><p style="color: #64748B; font-size: 0.95rem; margin-top: 0.35rem;">3 courses in progress</p>',
        alignment: "left",
        maxWidth: "none",
      },
      style: {
        padding: "1rem 2rem 0.75rem",
        backgroundColor: "#FAFBFC",
        borderTop: "1px solid #E2E8F0",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Course Grid                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "course-grid",
      type: "CourseGrid",
      props: {
        columns: 3,
        gap: "1.25rem",
        showPrice: false,
        showEnrollCount: false,
      },
      style: {
        padding: "0.5rem 2rem 4rem",
        backgroundColor: "#FAFBFC",
      },
    },
  ],
};
