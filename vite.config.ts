import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
// This config is used for both rolldown-vite (dev/build) and standard vite (tests)
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
