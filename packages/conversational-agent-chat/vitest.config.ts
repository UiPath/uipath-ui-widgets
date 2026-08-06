import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
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
        // Type-only declarations — no executable code to cover.
        "**/types.ts",
        "**/globals.d.ts",
      ],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
  resolve: {
    alias: {
      "@uipath/ui-widgets-conversational-agent-chat": path.resolve(
        __dirname,
        "./src",
      ),
    },
  },
});
