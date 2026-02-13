/**
 * SDUI <-> Craft.js serialization layer
 *
 * Converts between the flat SDUI JSON format (SDUIScreen → SDUISection[])
 * and Craft.js's internal node tree format.
 */
import type { SDUIScreen, SDUISection, SDUIStyleOverrides } from "@platform/sdui-schema";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CraftNodeData {
  type: string | { resolvedName: string };
  props: Record<string, unknown>;
  nodes: string[];
  parent?: string;
  displayName?: string;
  custom?: Record<string, unknown>;
  isCanvas?: boolean;
  hidden?: boolean;
}

export interface CraftSerializedState {
  [nodeId: string]: CraftNodeData;
}

/* ------------------------------------------------------------------ */
/*  SDUI → Craft.js                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert an SDUIScreen into a Craft.js serialized state that can
 * be loaded into an `<Editor>` via `actions.deserialize()`.
 */
export function sduiToCraftState(screen: SDUIScreen): string {
  const state: CraftSerializedState = {};
  const rootChildren: string[] = [];

  for (const section of screen.sections) {
    const nodeId = section.id;
    rootChildren.push(nodeId);

    state[nodeId] = {
      type: { resolvedName: section.type },
      props: {
        ...section.props,
        ...(section.style ? { _styleOverrides: section.style } : {}),
        sectionId: section.id,
      },
      nodes: [],
      parent: "ROOT",
      displayName: section.type,
      custom: {
        sduiSectionId: section.id,
        sduiType: section.type,
      },
    };

    // Handle nested blocks
    if (section.blocks) {
      const blockIds: string[] = [];
      for (const block of section.blocks) {
        blockIds.push(block.id);
        state[block.id] = {
          type: { resolvedName: block.type },
          props: {
            ...block.props,
            ...(block.style ? { _styleOverrides: block.style } : {}),
            blockId: block.id,
          },
          nodes: [],
          parent: nodeId,
          displayName: block.type,
          custom: {
            sduiBlockId: block.id,
            sduiType: block.type,
          },
        };
      }
      state[nodeId].nodes = blockIds;
    }
  }

  // ROOT node — use "PageRoot" (not "Canvas" which conflicts with Craft.js internals)
  state["ROOT"] = {
    type: { resolvedName: "PageRoot" },
    props: { className: "sdui-canvas" },
    nodes: rootChildren,
    isCanvas: true,
    displayName: "PageRoot",
  };

  return JSON.stringify(state);
}

/* ------------------------------------------------------------------ */
/*  Craft.js → SDUI                                                    */
/* ------------------------------------------------------------------ */

/**
 * Convert a Craft.js serialized state back into an SDUIScreen.
 */
export function craftStateToSdui(
  craftJson: string,
  screenMeta: { id: string; name: string; slug: string; description?: string },
): SDUIScreen {
  const state: CraftSerializedState = JSON.parse(craftJson);
  const root = state["ROOT"];
  if (!root) {
    return {
      ...screenMeta,
      description: screenMeta.description ?? "",
      sections: [],
    };
  }

  const sections: SDUISection[] = [];

  for (const sectionNodeId of root.nodes) {
    const node = state[sectionNodeId];
    if (!node) continue;

    const resolvedName =
      typeof node.type === "string" ? node.type : node.type.resolvedName;

    // Extract style overrides from props
    const { _styleOverrides, sectionId: _sId, blockId: _bId, ...sectionProps } =
      node.props as Record<string, unknown>;

    const section: SDUISection = {
      id: sectionNodeId,
      type: resolvedName,
      props: sectionProps,
      ...((_styleOverrides as SDUIStyleOverrides)
        ? { style: _styleOverrides as SDUIStyleOverrides }
        : {}),
    };

    // Handle child blocks
    if (node.nodes.length > 0) {
      section.blocks = node.nodes
        .map((blockNodeId) => {
          const blockNode = state[blockNodeId];
          if (!blockNode) return null;

          const blockResolvedName =
            typeof blockNode.type === "string"
              ? blockNode.type
              : blockNode.type.resolvedName;

          const {
            _styleOverrides: blockStyle,
            sectionId: _s,
            blockId: _b,
            ...blockProps
          } = blockNode.props as Record<string, unknown>;

          return {
            id: blockNodeId,
            type: blockResolvedName,
            props: blockProps,
            ...(blockStyle ? { style: blockStyle as SDUIStyleOverrides } : {}),
          };
        })
        .filter(Boolean) as SDUISection["blocks"];
    }

    sections.push(section);
  }

  return {
    ...screenMeta,
    description: screenMeta.description ?? "",
    sections,
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Generate a unique section/block ID */
export function generateNodeId(prefix = "section"): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
