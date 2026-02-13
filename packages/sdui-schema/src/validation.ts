import { z } from "zod";
import type { SDUIAction } from "./actions.js";
import type { SDUIBlock } from "./types.js";
import {
  SDUI_COMPONENT_CATEGORIES,
  SDUI_VISIBILITY_CONDITIONS,
  SDUI_PROP_TYPES,
  SDUI_BINDING_TYPES,
} from "./types.js";
import { SDUI_API_METHODS } from "./actions.js";

export const sduiStyleOverridesSchema = z.object({
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  shadow: z.string().optional(),
  display: z.string().optional(),
  flexDirection: z.string().optional(),
  alignItems: z.string().optional(),
  justifyContent: z.string().optional(),
  gap: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  maxWidth: z.string().optional(),
});

export const sduiVisibilityRuleSchema = z.object({
  condition: z.enum(SDUI_VISIBILITY_CONDITIONS),
  value: z.string().optional(),
});

const lazyBlock: z.ZodType<SDUIBlock> = z.lazy(() => sduiBlockSchema);

export const sduiBlockSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  children: z.array(lazyBlock).optional(),
  style: sduiStyleOverridesSchema.optional(),
  visibility: sduiVisibilityRuleSchema.optional(),
});

export const sduiSectionSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.string(), z.unknown()),
  blocks: z.array(sduiBlockSchema).optional(),
  style: sduiStyleOverridesSchema.optional(),
  visibility: sduiVisibilityRuleSchema.optional(),
});

export const sduiScreenSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  sections: z.array(sduiSectionSchema),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const sduiNavigateActionSchema = z.object({
  type: z.literal("navigate"),
  to: z.string(),
  params: z.record(z.string(), z.string()).optional(),
});

const sduiDeepLinkActionSchema = z.object({
  type: z.literal("deepLink"),
  url: z.string(),
  fallback: z.string().optional(),
});

const lazyAction: z.ZodType<SDUIAction> = z.lazy(() => sduiActionSchema);

const sduiApiCallActionSchema = z.object({
  type: z.literal("apiCall"),
  endpoint: z.string(),
  method: z.enum(SDUI_API_METHODS),
  body: z.record(z.string(), z.unknown()).optional(),
  onSuccess: lazyAction.optional(),
  onError: lazyAction.optional(),
});

const sduiOpenUrlActionSchema = z.object({
  type: z.literal("openUrl"),
  url: z.string(),
  external: z.boolean().optional(),
});

const sduiShowModalActionSchema = z.object({
  type: z.literal("showModal"),
  screen: sduiScreenSchema,
});

const sduiDismissModalActionSchema = z.object({
  type: z.literal("dismissModal"),
});

const sduiSubmitFormActionSchema = z.object({
  type: z.literal("submitForm"),
  formId: z.string(),
  endpoint: z.string(),
});

const sduiTrackEventActionSchema = z.object({
  type: z.literal("trackEvent"),
  name: z.string(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

const sduiPlayVideoActionSchema = z.object({
  type: z.literal("playVideo"),
  videoUrl: z.string(),
  autoplay: z.boolean().optional(),
});

const sduiToggleStateActionSchema = z.object({
  type: z.literal("toggleState"),
  key: z.string(),
  value: z.unknown().optional(),
});

export const sduiActionSchema = z.discriminatedUnion("type", [
  sduiNavigateActionSchema,
  sduiDeepLinkActionSchema,
  sduiApiCallActionSchema,
  sduiOpenUrlActionSchema,
  sduiShowModalActionSchema,
  sduiDismissModalActionSchema,
  sduiSubmitFormActionSchema,
  sduiTrackEventActionSchema,
  sduiPlayVideoActionSchema,
  sduiToggleStateActionSchema,
]);

const sduiColorTokensSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  accent: z.string(),
  background: z.string(),
  surface: z.string(),
  text: z.string(),
  textSecondary: z.string(),
  error: z.string(),
  success: z.string(),
  warning: z.string(),
  info: z.string(),
  border: z.string(),
});

const sduiFontFamilySchema = z.object({
  heading: z.string(),
  body: z.string(),
  mono: z.string(),
});

const sduiFontSizeSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  base: z.string(),
  lg: z.string(),
  xl: z.string(),
  "2xl": z.string(),
  "3xl": z.string(),
  "4xl": z.string(),
});

const sduiFontWeightSchema = z.object({
  normal: z.string(),
  medium: z.string(),
  semibold: z.string(),
  bold: z.string(),
});

const sduiLineHeightSchema = z.object({
  tight: z.string(),
  normal: z.string(),
  relaxed: z.string(),
});

const sduiTypographySchema = z.object({
  fontFamily: sduiFontFamilySchema,
  fontSize: sduiFontSizeSchema,
  fontWeight: sduiFontWeightSchema,
  lineHeight: sduiLineHeightSchema,
});

const sduiSpacingSchema = z.object({
  xs: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  "2xl": z.string(),
  "3xl": z.string(),
});

const sduiBorderRadiusSchema = z.object({
  none: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
  full: z.string(),
});

const sduiShadowsSchema = z.object({
  none: z.string(),
  sm: z.string(),
  md: z.string(),
  lg: z.string(),
  xl: z.string(),
});

export const sduiThemeSchema = z.object({
  colors: sduiColorTokensSchema,
  typography: sduiTypographySchema,
  spacing: sduiSpacingSchema,
  borderRadius: sduiBorderRadiusSchema,
  shadows: sduiShadowsSchema,
});

export const sduiThemeOverridesSchema = z.object({
  colors: sduiColorTokensSchema.partial().optional(),
  typography: z
    .object({
      fontFamily: sduiFontFamilySchema.partial().optional(),
      fontSize: sduiFontSizeSchema.partial().optional(),
      fontWeight: sduiFontWeightSchema.partial().optional(),
      lineHeight: sduiLineHeightSchema.partial().optional(),
    })
    .partial()
    .optional(),
  spacing: sduiSpacingSchema.partial().optional(),
  borderRadius: sduiBorderRadiusSchema.partial().optional(),
  shadows: sduiShadowsSchema.partial().optional(),
}).partial();

export const sduiPropDefSchema = z.object({
  type: z.enum(SDUI_PROP_TYPES),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  defaultValue: z.unknown().optional(),
  options: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .optional(),
});

export const sduiComponentDefSchema = z.object({
  type: z.string(),
  displayName: z.string(),
  description: z.string(),
  category: z.enum(SDUI_COMPONENT_CATEGORIES),
  icon: z.string(),
  defaultProps: z.record(z.string(), z.unknown()),
  propSchema: z.record(z.string(), sduiPropDefSchema),
  allowedChildren: z.array(z.string()).optional(),
  maxInstances: z.number().optional(),
});

export const sduiContentBindingSchema = z.object({
  sectionId: z.string(),
  bindingType: z.enum(SDUI_BINDING_TYPES),
  resourceId: z.string().optional(),
  query: z.record(z.string(), z.unknown()).optional(),
});
