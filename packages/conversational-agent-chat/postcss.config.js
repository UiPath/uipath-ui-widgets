// Tailwind v4 + autoprefixer (from apollo-wind), then strip the
// `@layer X { ... }` wrappers Tailwind v4 emits so consumers on
// Tailwind v3 don't misinterpret them as v3 directives. The flatten
// plugin is shared with all other widgets — see `scripts/postcss-flatten-layers.js`
// at the repo root.
import apolloWindPostcss from "@uipath/apollo-wind/postcss";
import flattenLayers from "../../scripts/postcss-flatten-layers.js";
import scopeSelectors from "../../scripts/postcss-scope-selectors.js";

// Scope flattened CSS to the widget root so it cannot affect host pages.
export default {
  plugins: [
    ...apolloWindPostcss.plugins,
    flattenLayers(),
    scopeSelectors(".uipath-conversational-agent-chat"),
  ],
};
