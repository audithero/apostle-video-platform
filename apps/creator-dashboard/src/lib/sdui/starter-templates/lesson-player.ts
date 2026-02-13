import type { SDUIScreen } from "@platform/sdui-schema";

export const lessonPlayerTemplate: SDUIScreen = {
  id: "tpl-lesson-player",
  name: "Lesson Player",
  slug: "lesson-player",
  description: "Video player, curriculum accordion, progress bar",
  sections: [
    {
      id: "progress",
      type: "ProgressBar",
      props: {
        value: 0,
        label: "Course Progress",
        showPercentage: true,
        color: "var(--sdui-color-primary)",
      },
      style: { padding: "1rem 1.5rem", maxWidth: "960px", margin: "0 auto" },
    },
    {
      id: "video",
      type: "VideoPlayer",
      props: {
        videoUrl: "",
        autoplay: false,
        controls: true,
        poster: "",
        aspectRatio: "16:9",
      },
      style: { maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 1.5rem" },
    },
    {
      id: "lesson-info",
      type: "TextBlock",
      props: {
        content:
          "<h2>Lesson Title</h2><p>Lesson description and any additional notes will appear here. This area is great for supplementary reading material, key takeaways, or links to downloadable resources.</p>",
        alignment: "left",
        maxWidth: "960px",
      },
      style: { padding: "1.5rem", maxWidth: "960px", margin: "0 auto" },
    },
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1: Introduction",
            lessons: [
              { title: "Welcome", duration: "3:00", type: "video" },
              { title: "Course Overview", duration: "5:00", type: "video" },
              { title: "Getting Started Guide", duration: "4 min read", type: "text" },
            ],
          },
          {
            title: "Module 2: Core Content",
            lessons: [
              { title: "Lesson 1", duration: "12:00", type: "video" },
              { title: "Lesson 2", duration: "15:00", type: "video" },
              { title: "Practice Exercise", duration: "20 min", type: "assignment" },
              { title: "Module Quiz", duration: "8 questions", type: "quiz" },
            ],
          },
          {
            title: "Module 3: Wrap-Up",
            lessons: [
              { title: "Summary & Next Steps", duration: "8:00", type: "video" },
              { title: "Final Assessment", duration: "15 questions", type: "quiz" },
            ],
          },
        ],
        expandFirst: true,
      },
      style: { maxWidth: "960px", margin: "0 auto", padding: "0 1.5rem 3rem" },
    },
  ],
};
