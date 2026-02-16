import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    server: {
      deps: {
        inline: ["ag-grid-community", "ag-grid-react"],
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html", "lcov"],
      exclude: [
        "node_modules/",
        "**/__tests__/",
        "**/*.spec.ts",
        "**/*.spec.tsx",
        "**/*.test.ts",
        "**/*.test.tsx",
        "**/dist/",
        "**/*.config.{js,ts}",
        "**/index.ts",
        "**/*.scss",
        "**/*.stories.tsx",
      ],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@uipath/ui-widgets-datatable": path.resolve(__dirname, "./src"),
      "@uipath/datatable": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    modules: {
      classNameStrategy: "non-scoped",
    },
  },
});
