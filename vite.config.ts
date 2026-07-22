import { copyValidationStationWcAssets } from "@uipath/ui-widgets-validation-station/assets";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Provision the DU Validation Station web component the same way a real consumer
// would with `uipath-vs-wc copy-assets` — copy the bundle into `public`, which
// Vite serves at `/du-vs-wc/` in dev and emits into the build. Runs once at
// config load; idempotent via the .wc-version marker. (public/du-vs-wc is
// gitignored.) The widget's baseUrl defaults to this path, so no runtime config.
await copyValidationStationWcAssets("public/du-vs-wc");

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    sourcemap: true,
  },
});
