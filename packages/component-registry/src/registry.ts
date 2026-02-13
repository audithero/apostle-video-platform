import type { SDUIComponentDef } from "@platform/sdui-schema";

const defs: SDUIComponentDef[] = [
  // ── Layout ──────────────────────────────────────────────
  {
    type: "HeroSection",
    displayName: "Hero Section",
    description: "Full-width hero banner with title, subtitle, and call-to-action",
    category: "layout",
    icon: "PanelTop",
    defaultProps: {
      title: "Welcome to the Course",
      subtitle: "Start your learning journey today",
      backgroundImage: "",
      ctaText: "Get Started",
      ctaAction: { type: "navigate", payload: { url: "#" } },
      alignment: "center",
      overlayOpacity: 0.4,
    },
    propSchema: {
      title: { type: "string", label: "Title", required: true },
      subtitle: { type: "string", label: "Subtitle" },
      backgroundImage: { type: "image", label: "Background Image" },
      ctaText: { type: "string", label: "CTA Text" },
      ctaAction: { type: "object", label: "CTA Action", description: "Action triggered on CTA click" },
      alignment: {
        type: "select",
        label: "Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      overlayOpacity: {
        type: "number",
        label: "Overlay Opacity",
        description: "Background overlay darkness (0-1)",
      },
    },
  },
  {
    type: "CTAButton",
    displayName: "CTA Button",
    description: "Call-to-action button with configurable style and action",
    category: "layout",
    icon: "MousePointerClick",
    defaultProps: {
      text: "Click Here",
      action: { type: "navigate", payload: { url: "#" } },
      variant: "primary",
      size: "md",
      fullWidth: false,
    },
    propSchema: {
      text: { type: "string", label: "Button Text", required: true },
      action: { type: "object", label: "Action", description: "Action triggered on click" },
      variant: {
        type: "select",
        label: "Variant",
        options: [
          { label: "Primary", value: "primary" },
          { label: "Secondary", value: "secondary" },
          { label: "Outline", value: "outline" },
        ],
      },
      size: {
        type: "select",
        label: "Size",
        options: [
          { label: "Small", value: "sm" },
          { label: "Medium", value: "md" },
          { label: "Large", value: "lg" },
        ],
      },
      fullWidth: { type: "boolean", label: "Full Width" },
    },
  },

  // ── Media ───────────────────────────────────────────────
  {
    type: "VideoPlayer",
    displayName: "Video Player",
    description: "Mux or YouTube video player with playback controls",
    category: "media",
    icon: "Play",
    defaultProps: {
      videoUrl: "",
      autoplay: false,
      controls: true,
      poster: "",
      aspectRatio: "16:9",
    },
    propSchema: {
      videoUrl: { type: "url", label: "Video URL", required: true },
      autoplay: { type: "boolean", label: "Autoplay" },
      controls: { type: "boolean", label: "Show Controls" },
      poster: { type: "image", label: "Poster Image" },
      aspectRatio: {
        type: "select",
        label: "Aspect Ratio",
        options: [
          { label: "16:9", value: "16:9" },
          { label: "4:3", value: "4:3" },
          { label: "1:1", value: "1:1" },
          { label: "9:16", value: "9:16" },
        ],
      },
    },
  },
  {
    type: "ImageBlock",
    displayName: "Image Block",
    description: "Image display with sizing and shape options",
    category: "media",
    icon: "Image",
    defaultProps: {
      src: "",
      alt: "",
      aspectRatio: "auto",
      objectFit: "cover",
      rounded: false,
    },
    propSchema: {
      src: { type: "image", label: "Image Source", required: true },
      alt: { type: "string", label: "Alt Text", required: true },
      aspectRatio: {
        type: "select",
        label: "Aspect Ratio",
        options: [
          { label: "Auto", value: "auto" },
          { label: "16:9", value: "16:9" },
          { label: "4:3", value: "4:3" },
          { label: "1:1", value: "1:1" },
        ],
      },
      objectFit: {
        type: "select",
        label: "Object Fit",
        options: [
          { label: "Cover", value: "cover" },
          { label: "Contain", value: "contain" },
        ],
      },
      rounded: { type: "boolean", label: "Rounded Corners" },
    },
  },

  // ── Content ─────────────────────────────────────────────
  {
    type: "LessonCard",
    displayName: "Lesson Card",
    description: "Card displaying a single lesson with metadata",
    category: "content",
    icon: "BookOpen",
    defaultProps: {
      title: "Lesson Title",
      description: "",
      thumbnailUrl: "",
      duration: "5 min",
      lessonType: "video",
      isFreePreview: false,
      isCompleted: false,
    },
    propSchema: {
      title: { type: "string", label: "Title", required: true },
      description: { type: "string", label: "Description" },
      thumbnailUrl: { type: "image", label: "Thumbnail" },
      duration: { type: "string", label: "Duration" },
      lessonType: {
        type: "select",
        label: "Lesson Type",
        options: [
          { label: "Video", value: "video" },
          { label: "Text", value: "text" },
          { label: "Quiz", value: "quiz" },
          { label: "Assignment", value: "assignment" },
          { label: "Live", value: "live" },
        ],
      },
      isFreePreview: { type: "boolean", label: "Free Preview" },
      isCompleted: { type: "boolean", label: "Completed" },
    },
  },
  {
    type: "CourseGrid",
    displayName: "Course Grid",
    description: "Responsive grid of course cards",
    category: "content",
    icon: "LayoutGrid",
    defaultProps: {
      columns: 3,
      gap: "1.5rem",
      showPrice: true,
      showEnrollCount: true,
    },
    propSchema: {
      columns: {
        type: "select",
        label: "Columns",
        options: [
          { label: "2 Columns", value: "2" },
          { label: "3 Columns", value: "3" },
          { label: "4 Columns", value: "4" },
        ],
      },
      gap: { type: "string", label: "Gap", description: "CSS gap between cards" },
      showPrice: { type: "boolean", label: "Show Price" },
      showEnrollCount: { type: "boolean", label: "Show Enrollment Count" },
    },
  },
  {
    type: "ContentRow",
    displayName: "Content Row",
    description: "Horizontal scrollable row of content items",
    category: "content",
    icon: "Rows3",
    defaultProps: {
      title: "Featured Content",
      subtitle: "",
      items: [],
    },
    propSchema: {
      title: { type: "string", label: "Title", required: true },
      subtitle: { type: "string", label: "Subtitle" },
      items: {
        type: "binding",
        label: "Items",
        description: "Bind to a collection of courses or lessons",
      },
    },
  },
  {
    type: "InstructorBio",
    displayName: "Instructor Bio",
    description: "Instructor profile card with credentials and social links",
    category: "content",
    icon: "UserCircle",
    defaultProps: {
      name: "Instructor Name",
      avatar: "",
      bio: "",
      credentials: "",
      socialLinks: [],
    },
    propSchema: {
      name: { type: "string", label: "Name", required: true },
      avatar: { type: "image", label: "Avatar" },
      bio: { type: "richtext", label: "Bio" },
      credentials: { type: "string", label: "Credentials", description: "Title or qualifications" },
      socialLinks: {
        type: "array",
        label: "Social Links",
        description: "Array of { platform, url } objects",
      },
    },
  },
  {
    type: "CurriculumAccordion",
    displayName: "Curriculum Accordion",
    description: "Expandable course outline organized by modules and lessons",
    category: "content",
    icon: "ListTree",
    defaultProps: {
      modules: [],
      expandFirst: true,
    },
    propSchema: {
      modules: {
        type: "binding",
        label: "Modules",
        description: "Bind to course modules with nested lessons",
      },
      expandFirst: { type: "boolean", label: "Expand First Module" },
    },
  },
  {
    type: "TestimonialCarousel",
    displayName: "Testimonial Carousel",
    description: "Sliding carousel of student testimonials",
    category: "content",
    icon: "Quote",
    defaultProps: {
      autoplay: true,
      interval: 5000,
      testimonials: [],
    },
    propSchema: {
      autoplay: { type: "boolean", label: "Autoplay" },
      interval: {
        type: "number",
        label: "Interval (ms)",
        description: "Time between slides in milliseconds",
      },
      testimonials: {
        type: "array",
        label: "Testimonials",
        description: "Array of { name, avatar, quote, role } objects",
      },
    },
  },
  {
    type: "TextBlock",
    displayName: "Text Block",
    description: "Rich text content block with formatting",
    category: "content",
    icon: "Type",
    defaultProps: {
      content: "",
      alignment: "left",
      maxWidth: "none",
    },
    propSchema: {
      content: { type: "richtext", label: "Content", required: true },
      alignment: {
        type: "select",
        label: "Alignment",
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      maxWidth: {
        type: "string",
        label: "Max Width",
        description: "CSS max-width value (e.g. 640px, none)",
      },
    },
  },

  // ── Commerce ────────────────────────────────────────────
  {
    type: "PricingTable",
    displayName: "Pricing Table",
    description: "Pricing plans display with feature comparison",
    category: "commerce",
    icon: "CreditCard",
    defaultProps: {
      plans: [
        {
          name: "Free",
          price: "$0",
          features: ["5 lessons", "Community access"],
          ctaText: "Start Free",
          highlighted: false,
        },
        {
          name: "Pro",
          price: "$49",
          features: ["All lessons", "Community access", "Certificate"],
          ctaText: "Get Pro",
          highlighted: true,
        },
      ],
    },
    propSchema: {
      plans: {
        type: "array",
        label: "Plans",
        description: "Array of { name, price, features, ctaText, highlighted } plan objects",
      },
    },
  },

  // ── Gamification ────────────────────────────────────────
  {
    type: "ProgressBar",
    displayName: "Progress Bar",
    description: "Visual progress indicator for course or lesson completion",
    category: "gamification",
    icon: "BarChart3",
    defaultProps: {
      value: 0,
      label: "Progress",
      showPercentage: true,
      color: "#6366f1",
    },
    propSchema: {
      value: {
        type: "number",
        label: "Value",
        description: "Progress value from 0 to 100",
        required: true,
      },
      label: { type: "string", label: "Label" },
      showPercentage: { type: "boolean", label: "Show Percentage" },
      color: { type: "color", label: "Bar Color" },
    },
  },
  {
    type: "StreakCounter",
    displayName: "Streak Counter",
    description: "Daily learning streak display with current and longest streak",
    category: "gamification",
    icon: "Flame",
    defaultProps: {
      currentStreak: 0,
      longestStreak: 0,
      icon: "Flame",
    },
    propSchema: {
      currentStreak: { type: "number", label: "Current Streak", required: true },
      longestStreak: { type: "number", label: "Longest Streak" },
      icon: { type: "string", label: "Icon", description: "Lucide icon name" },
    },
  },
  {
    type: "BadgeShowcase",
    displayName: "Badge Showcase",
    description: "Grid display of earned and available badges",
    category: "gamification",
    icon: "Award",
    defaultProps: {
      badges: [],
    },
    propSchema: {
      badges: {
        type: "array",
        label: "Badges",
        description: "Array of { name, icon, description, earned } badge objects",
      },
    },
  },
  {
    type: "LeaderboardWidget",
    displayName: "Leaderboard Widget",
    description: "Leaderboard table showing top students by points",
    category: "gamification",
    icon: "Trophy",
    defaultProps: {
      maxEntries: 10,
      timeframe: "weekly",
      showPoints: true,
    },
    propSchema: {
      maxEntries: { type: "number", label: "Max Entries", description: "Number of entries to display" },
      timeframe: {
        type: "select",
        label: "Timeframe",
        options: [
          { label: "Weekly", value: "weekly" },
          { label: "Monthly", value: "monthly" },
          { label: "All Time", value: "alltime" },
        ],
      },
      showPoints: { type: "boolean", label: "Show Points" },
    },
  },

  // ── Social ──────────────────────────────────────────────
  {
    type: "CommunityFeed",
    displayName: "Community Feed",
    description: "Social post feed with reactions and comments",
    category: "social",
    icon: "MessagesSquare",
    defaultProps: {
      maxPosts: 10,
      showReactions: true,
      showComments: true,
      channelId: "",
    },
    propSchema: {
      maxPosts: { type: "number", label: "Max Posts", description: "Maximum posts to display" },
      showReactions: { type: "boolean", label: "Show Reactions" },
      showComments: { type: "boolean", label: "Show Comments" },
      channelId: {
        type: "binding",
        label: "Channel",
        description: "Bind to a community channel ID",
      },
    },
  },
  {
    type: "LiveEventBanner",
    displayName: "Live Event Banner",
    description: "Banner announcing an upcoming or active live event",
    category: "social",
    icon: "Radio",
    defaultProps: {
      title: "Live Event",
      startTime: "",
      hostName: "",
      hostAvatar: "",
      joinUrl: "",
    },
    propSchema: {
      title: { type: "string", label: "Event Title", required: true },
      startTime: { type: "string", label: "Start Time", description: "ISO 8601 datetime string" },
      hostName: { type: "string", label: "Host Name" },
      hostAvatar: { type: "image", label: "Host Avatar" },
      joinUrl: { type: "url", label: "Join URL" },
    },
  },

  // ── Assessment ──────────────────────────────────────────
  {
    type: "QuizBlock",
    displayName: "Quiz Block",
    description: "Interactive quiz component bound to a course quiz",
    category: "assessment",
    icon: "ClipboardCheck",
    defaultProps: {
      quizId: "",
      showResults: true,
      allowRetry: true,
    },
    propSchema: {
      quizId: {
        type: "binding",
        label: "Quiz",
        description: "Bind to a quiz ID",
        required: true,
      },
      showResults: { type: "boolean", label: "Show Results" },
      allowRetry: { type: "boolean", label: "Allow Retry" },
    },
  },
  {
    type: "CertificateDisplay",
    displayName: "Certificate Display",
    description: "Certificate of completion card with download option",
    category: "assessment",
    icon: "GraduationCap",
    defaultProps: {
      courseName: "",
      studentName: "",
      completedDate: "",
      certificateUrl: "",
    },
    propSchema: {
      courseName: { type: "string", label: "Course Name", required: true },
      studentName: { type: "string", label: "Student Name", required: true },
      completedDate: { type: "string", label: "Completed Date", description: "ISO 8601 date" },
      certificateUrl: { type: "url", label: "Certificate URL", description: "Download link for the PDF" },
    },
  },
];

export const componentRegistry = new Map<string, SDUIComponentDef>(
  defs.map((def) => [def.type, def]),
);
