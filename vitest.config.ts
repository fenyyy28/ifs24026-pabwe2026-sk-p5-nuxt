import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";

const src = fileURLToPath(new URL("./src", import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { "~": src, "@": src } },
  define: { DELCOM_BASEURL: JSON.stringify("https://example.test/api/v1") },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,vue}"],
      exclude: ["src/**/*.d.ts", "src/app.vue"],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});