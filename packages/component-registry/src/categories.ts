import type { SDUIComponentCategory } from "@platform/sdui-schema";

export interface CategoryDef {
  id: SDUIComponentCategory;
  label: string;
  description: string;
  icon: string;
}

export const categories: readonly CategoryDef[] = [
  {
    id: "layout",
    label: "Layout",
    description: "Structure and layout components",
    icon: "LayoutGrid",
  },
  {
    id: "content",
    label: "Content",
    description: "Text and content blocks",
    icon: "Type",
  },
  {
    id: "media",
    label: "Media",
    description: "Video, image, and media components",
    icon: "Play",
  },
  {
    id: "commerce",
    label: "Commerce",
    description: "Pricing and purchase components",
    icon: "CreditCard",
  },
  {
    id: "gamification",
    label: "Gamification",
    description: "Progress and engagement components",
    icon: "Trophy",
  },
  {
    id: "social",
    label: "Social",
    description: "Community and social components",
    icon: "Users",
  },
  {
    id: "assessment",
    label: "Assessment",
    description: "Quiz and certification components",
    icon: "ClipboardCheck",
  },
] as const;
