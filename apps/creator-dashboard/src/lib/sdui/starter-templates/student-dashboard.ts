import type { SDUIScreen } from "@platform/sdui-schema";

export const studentDashboardTemplate: SDUIScreen = {
  id: "tpl-student-dashboard",
  name: "Student Dashboard",
  slug: "student-dashboard",
  description: "Progress bars, streak counter, course grid",
  sections: [
    {
      id: "welcome",
      type: "TextBlock",
      props: {
        content: "<h1>Welcome back!</h1><p>Pick up where you left off and keep the momentum going.</p>",
        alignment: "left",
        maxWidth: "none",
      },
      style: { padding: "2rem 1.5rem 1rem" },
    },
    {
      id: "streak",
      type: "StreakCounter",
      props: {
        currentStreak: 0,
        longestStreak: 0,
        icon: "Flame",
      },
      style: { padding: "0 1.5rem 1.5rem", maxWidth: "400px" },
    },
    {
      id: "overall-progress",
      type: "ProgressBar",
      props: {
        value: 0,
        label: "Overall Progress",
        showPercentage: true,
        color: "var(--sdui-color-primary)",
      },
      style: { padding: "0 1.5rem 1rem", maxWidth: "600px" },
    },
    {
      id: "current-course-progress",
      type: "ProgressBar",
      props: {
        value: 0,
        label: "Current Course",
        showPercentage: true,
        color: "#10b981",
      },
      style: { padding: "0 1.5rem 2rem", maxWidth: "600px" },
    },
    {
      id: "enrolled-heading",
      type: "TextBlock",
      props: {
        content: "<h2>Your Courses</h2>",
        alignment: "left",
        maxWidth: "none",
      },
      style: { padding: "1rem 1.5rem 0.5rem" },
    },
    {
      id: "course-grid",
      type: "CourseGrid",
      props: {
        columns: 3,
        gap: "1.5rem",
        showPrice: false,
        showEnrollCount: false,
      },
      style: { padding: "0 1.5rem 3rem" },
    },
  ],
};
