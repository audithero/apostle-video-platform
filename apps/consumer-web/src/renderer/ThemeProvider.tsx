import { createContext, useContext, useEffect, useMemo } from "react";
import type { SDUITheme } from "@platform/sdui-schema";

const defaultTheme: SDUITheme = {
  colors: {
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#f59e0b",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#0f172a",
    textSecondary: "#64748b",
    error: "#ef4444",
    success: "#22c55e",
    warning: "#f59e0b",
    info: "#3b82f6",
    border: "#e2e8f0",
  },
  typography: {
    fontFamily: {
      heading: '"Inter", system-ui, sans-serif',
      body: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", monospace',
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  borderRadius: {
    none: "0",
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    full: "9999px",
  },
  shadows: {
    none: "none",
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  },
};

interface ThemeContextValue {
  theme: SDUITheme;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: defaultTheme });

export function useTheme(): SDUITheme {
  return useContext(ThemeContext).theme;
}

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  overrides: Partial<T> | undefined,
): T {
  if (!overrides) return base;
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
      result[key] = deepMerge(
        result[key] as Record<string, unknown>,
        val as Record<string, unknown>,
      ) as T[keyof T];
    } else if (val !== undefined) {
      result[key] = val as T[keyof T];
    }
  }
  return result;
}

function applyThemeToCSSVars(theme: SDUITheme) {
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--sdui-color-${key}`, value);
  }
  root.style.setProperty(
    "--sdui-font-heading",
    theme.typography.fontFamily.heading,
  );
  root.style.setProperty("--sdui-font-body", theme.typography.fontFamily.body);
  root.style.setProperty("--sdui-font-mono", theme.typography.fontFamily.mono);
  for (const [key, value] of Object.entries(theme.borderRadius)) {
    root.style.setProperty(`--sdui-radius-${key}`, value);
  }
}

interface ThemeProviderProps {
  templateTheme?: Partial<SDUITheme>;
  creatorOverrides?: Partial<SDUITheme>;
  children: React.ReactNode;
}

export function ThemeProvider({
  templateTheme,
  creatorOverrides,
  children,
}: ThemeProviderProps) {
  const mergedTheme = useMemo(() => {
    let theme = defaultTheme;
    theme = deepMerge(theme, templateTheme);
    theme = deepMerge(theme, creatorOverrides);
    return theme;
  }, [templateTheme, creatorOverrides]);

  useEffect(() => {
    applyThemeToCSSVars(mergedTheme);
  }, [mergedTheme]);

  const value = useMemo(() => ({ theme: mergedTheme }), [mergedTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
