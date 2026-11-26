import { defineConfig, mergeConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { react18Overrides } from "../../test/vitest.react18";

export default mergeConfig(
  defineConfig({
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
          "**/types.ts",
        ],
        include: ["src/**/*.{ts,tsx}"],
      },
    },
    resolve: {
      alias: {
        "@uipath/ui-widgets-validation-station": path.resolve(
          __dirname,
          "./src",
        ),
        "@uipath/validation-station": path.resolve(__dirname, "./src"),
      },
    },
    css: {
      modules: {
        classNameStrategy: "non-scoped",
      },
    },
  }),
  react18Overrides(),
);
