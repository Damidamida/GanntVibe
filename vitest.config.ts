import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.spec.ts", "tests/**/*.spec.tsx"],
    exclude: ["**/e2e/**"],
    css: false,
    reporters: "dot",
  },
});
