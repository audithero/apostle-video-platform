/**
 * Post-build script: copies and compiles the service worker to dist/client/sw.js
 *
 * For now this is a simple file copy using esbuild-style transform via Bun.
 * In the future this can be upgraded to use workbox-build injectManifest
 * for precache manifest injection.
 *
 * Usage:
 *   bun scripts/generate-sw.ts
 *
 * Config (future workbox integration):
 *   - swSrc: src/sw.ts (compiled to JS)
 *   - swDest: dist/client/sw.js
 *   - globDirectory: dist/client
 *   - globPatterns: ['**\/*.{js,css,html,png,svg,ico}']
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SW_SRC = resolve(ROOT, "src/sw.ts");
const SW_DEST = resolve(ROOT, "dist/client/sw.js");

async function main() {
  console.log("[generate-sw] Building service worker...");

  if (!existsSync(SW_SRC)) {
    console.error(`[generate-sw] Source file not found: ${SW_SRC}`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outDir = dirname(SW_DEST);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
  }

  // Use Bun's built-in transpiler to compile TS -> JS
  const transpiler = new Bun.Transpiler({
    loader: "ts",
    target: "browser",
  });

  const source = readFileSync(SW_SRC, "utf-8");
  const compiled = transpiler.transformSync(source);

  // Write the compiled JS
  writeFileSync(SW_DEST, compiled, "utf-8");

  console.log(`[generate-sw] Service worker written to ${SW_DEST}`);
  console.log(
    `[generate-sw] Size: ${(Buffer.byteLength(compiled) / 1024).toFixed(1)} KB`,
  );
}

main().catch((err) => {
  console.error("[generate-sw] Failed:", err);
  process.exit(1);
});
