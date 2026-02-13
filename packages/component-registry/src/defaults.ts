import { componentRegistry } from "./registry.js";

/**
 * Default prop values per component, derived from the registry's defaultProps.
 * Used when a component is first placed into the builder canvas.
 */
export const componentDefaults = new Map<string, Record<string, unknown>>(
  [...componentRegistry.entries()].map(([type, def]) => [
    type,
    { ...def.defaultProps },
  ]),
);
