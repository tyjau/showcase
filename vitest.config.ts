import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Root dir (no trailing slash) so the "@/x" alias resolves to "<root>/x" exactly
// like tsconfig paths ("@/*" -> "./*"). Keeps test imports identical to app code.
const root = fileURLToPath(new URL(".", import.meta.url)).replace(/[\\/]$/, "");

export default defineConfig({
  test: {
    // Default to node; lib/api + lib/partner tests opt into jsdom via a
    // `// @vitest-environment jsdom` docblock (they touch localStorage/window).
    environment: "node",
    globals: true,
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "scripts/**"],
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: { "@": root },
  },
});
