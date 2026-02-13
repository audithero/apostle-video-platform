export const SDUI_COMPONENT_CATEGORIES = [
  "layout",
  "content",
  "media",
  "commerce",
  "gamification",
  "social",
  "assessment",
] as const;

export type SDUIComponentCategory =
  (typeof SDUI_COMPONENT_CATEGORIES)[number];

export const SDUI_VISIBILITY_CONDITIONS = [
  "authenticated",
  "unauthenticated",
  "enrolled",
  "not_enrolled",
  "role",
  "custom",
] as const;

export type SDUIVisibilityCondition =
  (typeof SDUI_VISIBILITY_CONDITIONS)[number];

export const SDUI_PROP_TYPES = [
  "string",
  "number",
  "boolean",
  "color",
  "image",
  "url",
  "richtext",
  "select",
  "array",
  "object",
  "binding",
] as const;

export type SDUIPropType = (typeof SDUI_PROP_TYPES)[number];

export const SDUI_BINDING_TYPES = [
  "course",
  "courses",
  "lesson",
  "enrollment",
  "user",
  "creator",
  "custom",
] as const;

export type SDUIBindingType = (typeof SDUI_BINDING_TYPES)[number];

export interface SDUIStyleOverrides {
  padding?: string;
  margin?: string;
  backgroundColor?: string;
  borderRadius?: string;
  shadow?: string;
  display?: string;
  flexDirection?: string;
  alignItems?: string;
  justifyContent?: string;
  gap?: string;
  width?: string;
  height?: string;
  maxWidth?: string;
}

export interface SDUIVisibilityRule {
  condition: SDUIVisibilityCondition;
  value?: string;
}

export interface SDUIBlock {
  id: string;
  type: string;
  props: Record<string, unknown>;
  children?: SDUIBlock[];
  style?: SDUIStyleOverrides;
  visibility?: SDUIVisibilityRule;
}

export interface SDUISection {
  id: string;
  type: string;
  props: Record<string, unknown>;
  blocks?: SDUIBlock[];
  style?: SDUIStyleOverrides;
  visibility?: SDUIVisibilityRule;
}

export interface SDUIScreen {
  id: string;
  name: string;
  slug: string;
  description: string;
  sections: SDUISection[];
  metadata?: Record<string, unknown>;
}

export interface SDUIPropDef {
  type: SDUIPropType;
  label: string;
  description?: string;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
}

export interface SDUIComponentDef {
  type: string;
  displayName: string;
  description: string;
  category: SDUIComponentCategory;
  icon: string;
  defaultProps: Record<string, unknown>;
  propSchema: Record<string, SDUIPropDef>;
  allowedChildren?: string[];
  maxInstances?: number;
}

export interface SDUIContentBinding {
  sectionId: string;
  bindingType: SDUIBindingType;
  resourceId?: string;
  query?: Record<string, unknown>;
}
