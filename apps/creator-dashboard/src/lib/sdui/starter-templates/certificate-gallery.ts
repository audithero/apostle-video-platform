import type { SDUIScreen } from "@platform/sdui-schema";

export const certificateGalleryTemplate: SDUIScreen = {
  id: "tpl-certificate-gallery",
  name: "Certificate Gallery",
  slug: "certificate-gallery",
  description: "Certificate display, badge showcase",
  sections: [
    {
      id: "heading",
      type: "TextBlock",
      props: {
        content:
          "<h1>Your Achievements</h1><p>Certificates earned and badges collected throughout your learning journey.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "3rem 1.5rem 2rem" },
    },
    {
      id: "certificate-1",
      type: "CertificateDisplay",
      props: {
        courseName: "Course Name",
        studentName: "Student Name",
        completedDate: "",
        certificateUrl: "",
      },
      style: { maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem 1.5rem" },
    },
    {
      id: "certificate-2",
      type: "CertificateDisplay",
      props: {
        courseName: "Another Course",
        studentName: "Student Name",
        completedDate: "",
        certificateUrl: "",
      },
      style: { maxWidth: "600px", margin: "0 auto", padding: "0 1.5rem 2rem" },
    },
    {
      id: "badges-heading",
      type: "TextBlock",
      props: {
        content: "<h2>Badges Earned</h2><p>Keep learning to unlock more badges and show off your expertise.</p>",
        alignment: "center",
        maxWidth: "640px",
      },
      style: { padding: "2rem 1.5rem 1rem" },
    },
    {
      id: "badges",
      type: "BadgeShowcase",
      props: {
        badges: [
          { name: "Course Graduate", icon: "GraduationCap", description: "Completed a full course", earned: true },
          { name: "Quiz Master", icon: "CheckCircle", description: "Scored 100% on a quiz", earned: true },
          { name: "Fast Learner", icon: "Zap", description: "Completed a course in under a week", earned: false },
          { name: "Dedicated", icon: "Flame", description: "30-day learning streak", earned: false },
          { name: "Scholar", icon: "BookOpen", description: "Completed 5 courses", earned: false },
          { name: "All-Star", icon: "Star", description: "Earned all available badges", earned: false },
        ],
      },
      style: { maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
  ],
};
