import postgresPlugin from "@neondatabase/vite-plugin-postgres";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { nitroV2Plugin } from "@tanstack/nitro-v2-vite-plugin";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import dotenv from "dotenv";
import { defineConfig } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

dotenv.config();

export default defineConfig({
  optimizeDeps: {
    entries: ["src/**/*.tsx", "src/**/*.ts"],
  },
  environments: {
    ssr: {
      resolve: {
        noExternal: [],
        external: ["better-auth", "@better-auth/stripe"],
      },
    },
  },
  server: {
    port: 3000,
  },
  plugins: [
    devtools(),
    viteTsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    postgresPlugin(),
    tailwindcss(),
    tanstackStart({
      router: {
        routeToken: "layout",
      },
      srcDirectory: "src",
      start: { entry: "./start.tsx" },
      server: { entry: "./server.ts" },
    }),
    nitroV2Plugin({ preset: "vercel", compatibilityDate: "2025-04-01" }),
    viteReact(),
  ],
});
