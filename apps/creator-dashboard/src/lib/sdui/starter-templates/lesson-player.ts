import type { SDUIScreen } from "@platform/sdui-schema";

/**
 * Lesson Player — Mid-lesson view for "Understanding Light & Shadow"
 *
 * Design language: Distraction-free, reading-optimized. Content-first layout
 * with subtle structural cues. Inspired by Udemy player, Skillshare, Egghead.
 *
 * Typography: DM Sans for clean reading with monospace accents for durations
 * Palette: Clean white (#FAFAFA), navy accents (#1E293B), soft border (#E2E8F0),
 *          progress blue (#3B82F6), muted text (#64748B), surface (#F8FAFC).
 */
export const lessonPlayerTemplate: SDUIScreen = {
  id: "tpl-lesson-player",
  name: "Lesson Player",
  slug: "lesson-player",
  description:
    "Video player, curriculum accordion, progress bar — mid-lesson view showing Understanding Light & Shadow at 42% progress",
  sections: [
    /* ---------------------------------------------------------------- */
    /*  Course Progress                                                  */
    /* ---------------------------------------------------------------- */
    {
      id: "progress",
      type: "ProgressBar",
      props: {
        value: 42,
        label: "Course Progress",
        showPercentage: true,
        color: "#3B82F6",
      },
      style: {
        padding: "1rem 1.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: '"DM Sans", sans-serif',
        backgroundColor: "#FAFAFA",
        borderBottom: "1px solid #E2E8F0",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Video Player                                                     */
    /* ---------------------------------------------------------------- */
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
      style: {
        maxWidth: "960px",
        margin: "0 auto",
        padding: "1.5rem 1.5rem 0",
        fontFamily: '"DM Sans", sans-serif',
        backgroundColor: "#FAFAFA",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Lesson Info                                                      */
    /* ---------------------------------------------------------------- */
    {
      id: "lesson-info",
      type: "TextBlock",
      props: {
        content:
          '<div style="font-family: Inter, sans-serif;"><div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;"><span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #3B82F6; font-weight: 600;">Module 2 of 4</span><span style="color: #E2E8F0;">|</span><span style="font-size: 0.75rem; color: #64748B;">24:00</span></div><h2 style="font-size: 1.5rem; color: #1E293B; margin-bottom: 0.75rem; font-weight: 600;">Understanding Light & Shadow</h2><p style="font-size: 1rem; line-height: 1.75; color: #64748B;">In this lesson, Elena breaks down the fundamental differences between natural and artificial light — and why understanding both will transform your photography. You\'ll learn to read the quality, direction, and color temperature of any light source, and practice techniques for shaping shadow to add depth, mood, and dimension to your images. By the end, you\'ll see light the way professional photographers do: as the single most powerful element in your toolkit.</p></div>',
        alignment: "left",
        maxWidth: "960px",
      },
      style: {
        padding: "1.5rem",
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: '"DM Sans", sans-serif',
        backgroundColor: "#FAFAFA",
        borderBottom: "1px solid #E2E8F0",
      },
    },

    /* ---------------------------------------------------------------- */
    /*  Curriculum Sidebar                                               */
    /* ---------------------------------------------------------------- */
    {
      id: "curriculum",
      type: "CurriculumAccordion",
      props: {
        modules: [
          {
            title: "Module 1 — Camera Essentials",
            lessons: [
              {
                title: "Welcome: The Photographer's Mindset",
                duration: "6:00",
                type: "video",
              },
              {
                title: "Understanding Your Sensor: Full Frame vs. Crop",
                duration: "14:00",
                type: "video",
              },
              {
                title: "The Exposure Triangle: Aperture, Shutter Speed & ISO",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Metering Modes & When to Use Manual",
                duration: "16:00",
                type: "video",
              },
              {
                title: "Lens Selection Guide",
                duration: "8 min read",
                type: "text",
              },
              {
                title: "Camera Settings Assessment",
                duration: "10 questions",
                type: "quiz",
              },
            ],
          },
          {
            title: "Module 2 — Light & Composition",
            lessons: [
              {
                title: "The Rule of Thirds and When to Break It",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Leading Lines, Framing & Visual Weight",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Understanding Light & Shadow",
                duration: "24:00",
                type: "video",
              },
              {
                title: "Golden Hour, Blue Hour & Harsh Light",
                duration: "16:00",
                type: "video",
              },
              {
                title: "Color Theory for Photographers",
                duration: "12:00",
                type: "video",
              },
              {
                title: "Project: The Light Study",
                duration: "45 min",
                type: "assignment",
              },
            ],
          },
          {
            title: "Module 3 — Advanced Techniques",
            lessons: [
              {
                title: "Posing Fundamentals: Directing Non-Models",
                duration: "20:00",
                type: "video",
              },
              {
                title: "Natural Light Portraits",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Studio Lighting: One-Light to Three-Light Setups",
                duration: "26:00",
                type: "video",
              },
              {
                title: "Environmental Portraits: Telling Stories with Context",
                duration: "14:00",
                type: "video",
              },
              {
                title: "Project: Portrait Series",
                duration: "60 min",
                type: "assignment",
              },
            ],
          },
          {
            title: "Module 4 — Post-Processing & Portfolio",
            lessons: [
              {
                title: "Lightroom Workflow: From Import to Export",
                duration: "22:00",
                type: "video",
              },
              {
                title: "Color Grading: Building Your Signature Look",
                duration: "18:00",
                type: "video",
              },
              {
                title: "Photoshop Essentials: Retouching & Composites",
                duration: "24:00",
                type: "video",
              },
              {
                title: "Building a Portfolio That Gets You Hired",
                duration: "15:00",
                type: "video",
              },
              {
                title: "Final Project: Curate Your 12-Image Portfolio",
                duration: "90 min",
                type: "assignment",
              },
              {
                title: "Final Assessment",
                duration: "15 questions",
                type: "quiz",
              },
            ],
          },
        ],
        expandFirst: false,
      },
      style: {
        maxWidth: "960px",
        margin: "0 auto",
        fontFamily: '"DM Sans", sans-serif',
        padding: "1.5rem 1.5rem 3rem",
        backgroundColor: "#F8FAFC",
        borderTop: "1px solid #E2E8F0",
      },
    },
  ],
};
