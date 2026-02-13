import type { SDUIComponentDef } from "@platform/sdui-schema";

export { categories } from "./categories.js";
export type { CategoryDef } from "./categories.js";
export { componentRegistry } from "./registry.js";
export { componentDefaults } from "./defaults.js";

import { componentRegistry } from "./registry.js";

/** Look up a component definition by its type string. */
export function resolveComponent(type: string): SDUIComponentDef | undefined {
  return componentRegistry.get(type);
}
