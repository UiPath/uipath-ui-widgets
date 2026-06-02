import react from "@vitejs/plugin-react";
import { cp } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);

// The validation-station WC self-resolves `du-assets/` (PDF.js worker, ICU
// data, translations) via `import.meta.url` at runtime. In a production
// build the resolved URL points next to the emitted JS chunks, so the
// package's `du-assets/` must be copied there. See
// @uipath/du-validation-station-wc README → "Static assets".
function copyDuValidationStationAssets(): Plugin {
  let destDir = "";
  return {
    name: "copy-du-validation-station-assets",
    apply: "build",
    configResolved(config) {
      destDir = resolve(
        config.root,
        config.build.outDir,
        config.build.assetsDir,
        "du-assets",
      );
    },
    async closeBundle() {
      const wcRoot = dirname(
        require.resolve("@uipath/du-validation-station-wc/package.json"),
      );
      await cp(resolve(wcRoot, "du-assets"), destDir, { recursive: true });
    },
  };
}

// https://vite.dev/config/
// This config is used for both rolldown-vite (dev/build) and standard vite (tests)
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    copyDuValidationStationAssets(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    exclude: ["@uipath/du-validation-station-wc"],
  },
  build: {
    sourcemap: true,
  },
});
