import { Suspense } from "react";
import type { SDUIScreen, SDUISection, SDUIBlock } from "@platform/sdui-schema";
import { SectionErrorBoundary } from "./ErrorBoundary";
import { componentMap } from "../components/sdui";

interface SDUIRendererProps {
  screen: SDUIScreen;
}

export function SDUIRenderer({ screen }: SDUIRendererProps) {
  return (
    <div className="sdui-screen" data-screen-id={screen.id}>
      {screen.sections.map((section) => (
        <SectionErrorBoundary key={section.id} sectionId={section.id}>
          <Suspense
            fallback={
              <div className="flex min-h-[100px] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--sdui-color-primary)]" />
              </div>
            }
          >
            <SectionRenderer section={section} />
          </Suspense>
        </SectionErrorBoundary>
      ))}
    </div>
  );
}

interface SectionRendererProps {
  section: SDUISection;
}

function SectionRenderer({ section }: SectionRendererProps) {
  const Component = componentMap[section.type];

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Unknown section type: <code>{section.type}</code>
        </div>
      );
    }
    return null;
  }

  const children = section.blocks?.map((block) => (
    <BlockRenderer key={block.id} block={block} />
  ));

  const style = section.style
    ? buildStyleFromOverrides(section.style)
    : undefined;

  return (
    <div
      className="sdui-section"
      data-section-id={section.id}
      data-section-type={section.type}
      style={style}
    >
      <Component {...section.props} sectionId={section.id}>
        {children}
      </Component>
    </div>
  );
}

interface BlockRendererProps {
  block: SDUIBlock;
}

function BlockRenderer({ block }: BlockRendererProps) {
  const Component = componentMap[block.type];

  if (!Component) {
    if (process.env.NODE_ENV === "development") {
      return (
        <div className="rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">
          Unknown block type: <code>{block.type}</code>
        </div>
      );
    }
    return null;
  }

  const children = block.children?.map((child) => (
    <BlockRenderer key={child.id} block={child} />
  ));

  const style = block.style ? buildStyleFromOverrides(block.style) : undefined;

  return (
    <div
      className="sdui-block"
      data-block-id={block.id}
      data-block-type={block.type}
      style={style}
    >
      <Component {...block.props} blockId={block.id}>
        {children}
      </Component>
    </div>
  );
}

function buildStyleFromOverrides(
  overrides: Record<string, unknown>,
): React.CSSProperties {
  const style: Record<string, string> = {};
  const mapping: Record<string, string> = {
    padding: "padding",
    margin: "margin",
    backgroundColor: "backgroundColor",
    borderRadius: "borderRadius",
    shadow: "boxShadow",
    display: "display",
    flexDirection: "flexDirection",
    alignItems: "alignItems",
    justifyContent: "justifyContent",
    gap: "gap",
    width: "width",
    height: "height",
    maxWidth: "maxWidth",
  };

  for (const [key, cssProperty] of Object.entries(mapping)) {
    const value = overrides[key];
    if (typeof value === "string" && value) {
      style[cssProperty] = value;
    }
  }

  return style as React.CSSProperties;
}
