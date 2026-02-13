/**
 * SDUI Visual Builder — main page component
 *
 * 3-panel layout:
 * - Left: ComponentPalette (draggable components)
 * - Center: Craft.js canvas (live editing)
 * - Right: PropertyPanel + ThemePanel (tabbed)
 *
 * Top: BuilderToolbar (undo/redo, breakpoints, save/preview/publish)
 */
import { Editor, Frame, Element, useEditor } from "@craftjs/core";
import { useState, useCallback, useRef, useEffect } from "react";
import type { SDUIScreen, SDUIThemeOverrides } from "@platform/sdui-schema";
import { ComponentPalette } from "./ComponentPalette";
import { PropertyPanel } from "./PropertyPanel";
import { ThemePanel } from "./ThemePanel";
import { BuilderToolbar, type Breakpoint } from "./BuilderToolbar";
import { buildCraftResolver } from "./craft-resolver";
import { sduiToCraftState, craftStateToSdui } from "./serialization";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Breakpoint widths                                                  */
/* ------------------------------------------------------------------ */

const breakpointWidths: Record<Breakpoint, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "375px",
};

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BuilderPageProps {
  /** Initial screen data to load into the builder */
  readonly initialScreen?: SDUIScreen;
  /** Screen metadata (id, name, slug) for save operations */
  readonly screenMeta: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  };
  /** Initial theme overrides from the instance */
  readonly initialThemeOverrides?: SDUIThemeOverrides;
  /** Creator branding for auto-populate hint */
  readonly creatorBranding?: {
    brandColor?: string | null;
    brandSecondaryColor?: string | null;
    fontFamily?: string | null;
  };
  /** Called when the user saves the template */
  readonly onSave: (screen: SDUIScreen, themeOverrides?: SDUIThemeOverrides) => Promise<void>;
  /** Called when the user wants to preview */
  readonly onPreview?: (screen: SDUIScreen) => void;
  /** Called when the user wants to publish */
  readonly onPublish?: (screen: SDUIScreen) => void;
  /** Called when the user clicks the back button */
  readonly onBack: () => void;
}

/* ------------------------------------------------------------------ */
/*  Canvas wrapper (required by Craft.js for root drop target)         */
/* ------------------------------------------------------------------ */

function CanvasRoot({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-[400px] bg-white p-4 dark:bg-neutral-950">
      {children}
    </div>
  );
}

// Craft.js metadata for the canvas root
(CanvasRoot as unknown as { craft: Record<string, unknown> }).craft = {
  displayName: "PageRoot",
  rules: {
    canMoveIn: () => true,
  },
};

/* ------------------------------------------------------------------ */
/*  Right panel tab type                                               */
/* ------------------------------------------------------------------ */

type RightPanelTab = "properties" | "theme";

/* ------------------------------------------------------------------ */
/*  Builder Page                                                       */
/* ------------------------------------------------------------------ */

export function BuilderPage({
  initialScreen,
  screenMeta,
  initialThemeOverrides,
  creatorBranding,
  onSave,
  onPreview,
  onPublish,
  onBack,
}: BuilderPageProps) {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [rightTab, setRightTab] = useState<RightPanelTab>("properties");
  const [themeOverrides, setThemeOverrides] = useState<SDUIThemeOverrides>(
    initialThemeOverrides ?? {},
  );
  const editorRef = useRef<{ query: { serialize: () => string } } | null>(null);

  const resolver = useRef(buildCraftResolver()).current;

  // Include CanvasRoot in the resolver under a non-conflicting name
  // ("Canvas" conflicts with Craft.js's internal Canvas concept)
  const fullResolver = { ...resolver, PageRoot: CanvasRoot };

  // Compute initial state from SDUI screen
  const initialState = initialScreen
    ? sduiToCraftState(initialScreen)
    : undefined;

  const handleThemeChange = useCallback((overrides: SDUIThemeOverrides) => {
    setThemeOverrides(overrides);
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    setIsSaving(true);
    try {
      const craftJson = editorRef.current.query.serialize();
      const screen = craftStateToSdui(craftJson, screenMeta);
      await onSave(screen, themeOverrides);
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  }, [screenMeta, onSave, themeOverrides]);

  const handlePreview = useCallback(() => {
    if (!editorRef.current || !onPreview) return;
    const craftJson = editorRef.current.query.serialize();
    const screen = craftStateToSdui(craftJson, screenMeta);
    onPreview(screen);
  }, [screenMeta, onPreview]);

  const handlePublish = useCallback(() => {
    if (!editorRef.current || !onPublish) return;
    const craftJson = editorRef.current.query.serialize();
    const screen = craftStateToSdui(craftJson, screenMeta);
    onPublish(screen);
  }, [screenMeta, onPublish]);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Editor
        resolver={fullResolver}
        onNodesChange={() => setIsDirty(true)}
        onRender={({ render }: { render: React.ReactElement }) => render}
      >
        <EditorRefCapture editorRef={editorRef} />

        {/* Toolbar */}
        <BuilderToolbar
          templateName={screenMeta.name}
          breakpoint={breakpoint}
          onBreakpointChange={setBreakpoint}
          onSave={handleSave}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onBack={onBack}
          isSaving={isSaving}
          isDirty={isDirty}
        />

        {/* 3-panel layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Component Palette */}
          <div className="w-64 flex-shrink-0 overflow-hidden">
            <ComponentPalette />
          </div>

          {/* Center: Canvas */}
          <div className="flex flex-1 flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-900">
            <div className="flex flex-1 items-start justify-center overflow-auto p-6">
              <div
                className={cn(
                  "transition-all duration-300 ease-in-out",
                  "rounded-lg border border-neutral-200 shadow-sm dark:border-neutral-700",
                  "overflow-auto bg-white dark:bg-neutral-950",
                  breakpoint !== "desktop" && "mx-auto",
                )}
                style={{
                  width: breakpointWidths[breakpoint],
                  maxWidth: "100%",
                  minHeight: "600px",
                }}
              >
                <Frame data={initialState}>
                  <Element is={CanvasRoot} canvas>
                    {/* Empty canvas — components dragged here from palette */}
                    {!initialScreen && (
                      <div className="flex min-h-[400px] items-center justify-center text-sm text-neutral-400">
                        Drag components from the left panel to start building
                      </div>
                    )}
                  </Element>
                </Frame>
              </div>
            </div>
          </div>

          {/* Right: Property Panel + Theme Panel (tabbed) */}
          <div className="flex w-72 flex-shrink-0 flex-col overflow-hidden border-l border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
            {/* Tab switcher */}
            <div className="flex border-b border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setRightTab("properties")}
                className={cn(
                  "flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
                  rightTab === "properties"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                )}
              >
                Properties
              </button>
              <button
                type="button"
                onClick={() => setRightTab("theme")}
                className={cn(
                  "flex-1 px-3 py-2.5 text-xs font-medium transition-colors",
                  rightTab === "theme"
                    ? "border-b-2 border-primary text-primary"
                    : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300",
                )}
              >
                Theme
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {rightTab === "properties" ? (
                <PropertyPanel />
              ) : (
                <ThemePanel
                  overrides={themeOverrides}
                  creatorBranding={creatorBranding}
                  onChange={handleThemeChange}
                />
              )}
            </div>
          </div>
        </div>
      </Editor>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Editor ref capture (Craft.js doesn't expose ref natively)          */
/* ------------------------------------------------------------------ */

function EditorRefCapture({
  editorRef,
}: {
  readonly editorRef: React.MutableRefObject<{
    query: { serialize: () => string };
  } | null>;
}) {
  const { query } = useEditor();

  useEffect(() => {
    editorRef.current = { query: { serialize: () => query.serialize() } };
  }, [query, editorRef]);

  return null;
}
