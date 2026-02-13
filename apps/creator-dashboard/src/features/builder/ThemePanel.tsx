/**
 * Theme Panel — theme customization panel for the SDUI builder
 *
 * Allows creators to override theme colors, fonts, and spacing
 * for a specific template instance.
 */
import { useState } from "react";
import type { SDUIThemeOverrides } from "@platform/sdui-schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Font options                                                       */
/* ------------------------------------------------------------------ */

const FONT_OPTIONS = [
  { label: "Inter", value: "Inter" },
  { label: "Poppins", value: "Poppins" },
  { label: "Roboto", value: "Roboto" },
  { label: "Open Sans", value: "Open Sans" },
  { label: "Lato", value: "Lato" },
  { label: "Montserrat", value: "Montserrat" },
  { label: "Playfair Display", value: "Playfair Display" },
  { label: "Merriweather", value: "Merriweather" },
  { label: "DM Sans", value: "DM Sans" },
  { label: "Space Grotesk", value: "Space Grotesk" },
  { label: "Outfit", value: "Outfit" },
  { label: "Plus Jakarta Sans", value: "Plus Jakarta Sans" },
] as const;

/* ------------------------------------------------------------------ */
/*  Color presets                                                      */
/* ------------------------------------------------------------------ */

const COLOR_PRESETS = [
  { name: "Indigo", primary: "#6366f1", secondary: "#8b5cf6" },
  { name: "Blue", primary: "#3b82f6", secondary: "#6366f1" },
  { name: "Green", primary: "#10b981", secondary: "#059669" },
  { name: "Rose", primary: "#f43f5e", secondary: "#e11d48" },
  { name: "Orange", primary: "#f97316", secondary: "#ea580c" },
  { name: "Violet", primary: "#8b5cf6", secondary: "#7c3aed" },
] as const;

/* ------------------------------------------------------------------ */
/*  Color input field                                                  */
/* ------------------------------------------------------------------ */

function ColorField({
  label,
  value,
  onChange,
}: {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border border-neutral-200 dark:border-neutral-700"
      />
      <div className="flex-1">
        <Label className="text-[11px] text-neutral-500">{label}</Label>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="mt-0.5 h-7 text-xs"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Theme Panel                                                        */
/* ------------------------------------------------------------------ */

interface ThemePanelProps {
  readonly overrides: SDUIThemeOverrides;
  readonly creatorBranding?: {
    brandColor?: string | null;
    brandSecondaryColor?: string | null;
    fontFamily?: string | null;
  };
  readonly onChange: (overrides: SDUIThemeOverrides) => void;
}

export function ThemePanel({ overrides, creatorBranding, onChange }: ThemePanelProps) {
  const [activeSection, setActiveSection] = useState<"colors" | "fonts" | "spacing">("colors");

  const colors = overrides.colors ?? {};
  const typography = overrides.typography ?? {};

  const updateColor = (key: string, value: string) => {
    onChange({
      ...overrides,
      colors: { ...colors, [key]: value },
    });
  };

  const updateFont = (key: "heading" | "body", value: string) => {
    const fontValue = `"${value}", system-ui, sans-serif`;
    onChange({
      ...overrides,
      typography: {
        ...typography,
        fontFamily: {
          ...typography.fontFamily,
          [key]: fontValue,
        },
      },
    });
  };

  const updateBorderRadius = (key: string, value: string) => {
    onChange({
      ...overrides,
      borderRadius: {
        ...overrides.borderRadius,
        [key]: value,
      },
    });
  };

  // Extract font name from CSS value
  const getFontName = (cssValue?: string) => {
    if (!cssValue) return "";
    const match = cssValue.match(/"([^"]+)"/);
    return match ? match.at(1) ?? "" : "";
  };

  return (
    <div className="flex h-full flex-col">
      {/* Section tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800">
        {(["colors", "fonts", "spacing"] as const).map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={cn(
              "flex-1 px-3 py-2 text-xs font-medium capitalize transition-colors",
              activeSection === section
                ? "border-b-2 border-primary text-primary"
                : "text-neutral-500 hover:text-neutral-700",
            )}
          >
            {section}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-4 p-4">
          {activeSection === "colors" && (
            <>
              {/* Creator branding hint */}
              {creatorBranding?.brandColor && (
                <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/30">
                  <p className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">
                    Your brand colors are applied automatically
                  </p>
                  <p className="mt-0.5 text-[10px] text-indigo-500/80">
                    Override below to customize for this template
                  </p>
                </div>
              )}

              {/* Color presets */}
              <div>
                <Label className="text-xs font-medium">Quick Presets</Label>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        onChange({
                          ...overrides,
                          colors: {
                            ...colors,
                            primary: preset.primary,
                            secondary: preset.secondary,
                          },
                        });
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-2 py-1 text-[10px] font-medium transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                      title={preset.name}
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: preset.primary }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Individual color fields */}
              <div className="space-y-3">
                <ColorField
                  label="Primary"
                  value={(colors.primary as string) ?? "#6366f1"}
                  onChange={(v) => updateColor("primary", v)}
                />
                <ColorField
                  label="Secondary"
                  value={(colors.secondary as string) ?? "#8b5cf6"}
                  onChange={(v) => updateColor("secondary", v)}
                />
                <ColorField
                  label="Accent"
                  value={(colors.accent as string) ?? "#f59e0b"}
                  onChange={(v) => updateColor("accent", v)}
                />
                <ColorField
                  label="Background"
                  value={(colors.background as string) ?? "#ffffff"}
                  onChange={(v) => updateColor("background", v)}
                />
                <ColorField
                  label="Surface"
                  value={(colors.surface as string) ?? "#f8fafc"}
                  onChange={(v) => updateColor("surface", v)}
                />
                <ColorField
                  label="Text"
                  value={(colors.text as string) ?? "#0f172a"}
                  onChange={(v) => updateColor("text", v)}
                />
                <ColorField
                  label="Text Secondary"
                  value={(colors.textSecondary as string) ?? "#64748b"}
                  onChange={(v) => updateColor("textSecondary", v)}
                />
                <ColorField
                  label="Border"
                  value={(colors.border as string) ?? "#e2e8f0"}
                  onChange={(v) => updateColor("border", v)}
                />
              </div>
            </>
          )}

          {activeSection === "fonts" && (
            <>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Heading Font</Label>
                <Select
                  value={getFontName(typography.fontFamily?.heading)}
                  onValueChange={(v) => updateFont("heading", v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select heading font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span style={{ fontFamily: f.value }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Body Font</Label>
                <Select
                  value={getFontName(typography.fontFamily?.body)}
                  onValueChange={(v) => updateFont("body", v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select body font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        <span style={{ fontFamily: f.value }}>{f.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Font preview */}
              <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <h4
                  className="text-lg font-bold"
                  style={{
                    fontFamily: typography.fontFamily?.heading ?? "inherit",
                  }}
                >
                  Heading Preview
                </h4>
                <p
                  className="mt-2 text-sm text-neutral-600"
                  style={{
                    fontFamily: typography.fontFamily?.body ?? "inherit",
                  }}
                >
                  This is how body text will look with the selected font. It should be
                  easy to read and match your brand identity.
                </p>
              </div>
            </>
          )}

          {activeSection === "spacing" && (
            <>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Border Radius</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["sm", "md", "lg", "xl"] as const).map((size) => (
                      <div key={size}>
                        <Label className="text-[10px] text-neutral-500">{size}</Label>
                        <Input
                          value={overrides.borderRadius?.[size] ?? ""}
                          onChange={(e) => updateBorderRadius(size, e.target.value)}
                          placeholder={
                            { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" }[
                              size
                            ]
                          }
                          className="mt-0.5 h-7 text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Radius preview */}
                <div className="flex flex-wrap gap-2">
                  {(["sm", "md", "lg", "xl"] as const).map((size) => {
                    const radius =
                      overrides.borderRadius?.[size] ??
                      { sm: "0.25rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" }[size];
                    return (
                      <div
                        key={size}
                        className="flex h-12 w-12 items-center justify-center border-2 border-neutral-300 text-[10px] font-medium text-neutral-500 dark:border-neutral-600"
                        style={{ borderRadius: radius }}
                      >
                        {size}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
