/**
 * Theme Resolver — converts creator branding settings into SDUI theme overrides
 *
 * Three-layer cascade:
 * 1. Platform defaults (in ThemeProvider defaultTheme)
 * 2. Creator theme (from creator + creatorSettings tables)
 * 3. Instance overrides (from sduiTemplateInstance.themeOverrides)
 */
import type { SDUIThemeOverrides } from "@platform/sdui-schema";

interface CreatorBranding {
  brandColor?: string | null;
  brandSecondaryColor?: string | null;
  fontFamily?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  customCss?: string | null;
}

/**
 * Convert a creator's branding settings into SDUI theme overrides.
 * Only includes non-null values so they layer cleanly on top of defaults.
 */
export function creatorBrandingToTheme(
  branding: CreatorBranding,
): SDUIThemeOverrides {
  const overrides: SDUIThemeOverrides = {};

  if (branding.brandColor) {
    overrides.colors = {
      ...overrides.colors,
      primary: branding.brandColor,
    };
  }

  if (branding.brandSecondaryColor) {
    overrides.colors = {
      ...overrides.colors,
      secondary: branding.brandSecondaryColor,
    };
  }

  if (branding.fontFamily) {
    const fontValue = `"${branding.fontFamily}", system-ui, sans-serif`;
    overrides.typography = {
      fontFamily: {
        heading: fontValue,
        body: fontValue,
      },
    };
  }

  return overrides;
}

/**
 * Merge multiple theme override layers in order.
 * Later layers override earlier ones (deep merge).
 */
export function mergeThemeOverrides(
  ...layers: Array<SDUIThemeOverrides | null | undefined>
): SDUIThemeOverrides {
  let result: SDUIThemeOverrides = {};
  for (const layer of layers) {
    if (layer) {
      result = deepMergePartial(result, layer);
    }
  }
  return result;
}

function deepMergePartial<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T>,
): T {
  const result = { ...base };
  for (const key of Object.keys(overrides) as Array<keyof T>) {
    const val = overrides[key];
    if (
      val !== null &&
      val !== undefined &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      typeof result[key] === "object" &&
      result[key] !== null
    ) {
      result[key] = deepMergePartial(
        result[key] as Record<string, unknown>,
        val as Record<string, unknown>,
      ) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}
