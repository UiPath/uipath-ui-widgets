import { validationStationAssets } from "@uipath/ui-widgets-validation-station/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    validationStationAssets(),
  ],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  build: {
    sourcemap: true,
  },
});
