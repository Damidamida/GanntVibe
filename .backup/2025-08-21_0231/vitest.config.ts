import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["tests/**/*.spec.ts", "tests/**/*.spec.tsx"],
    css: false,
    reporters: "dot",
  },
});
