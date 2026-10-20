// Tailwind v4 + autoprefixer, then flatten the @layer wrappers for Tailwind v3 consumers.
// Shared flatten plugin: scripts/postcss-flatten-layers.js at the repo root.
import apolloWindPostcss from "@uipath/apollo-wind/postcss";
import flattenLayers from "../../scripts/postcss-flatten-layers.js";

export default {
  plugins: [...apolloWindPostcss.plugins, flattenLayers()],
};
