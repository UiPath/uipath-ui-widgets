/**
 * Strips `@layer X { ... }` block wrappers from compiled CSS, hoisting
 * inner rules to the surrounding scope. Declaration-only forms
 * (`@layer X;`, `@layer a, b, c;`) are preserved.
 *
 * Needed because Tailwind v4 (used to build these widgets via
 * `@uipath/apollo-wind`) emits CSS with native Cascade Layers, while
 * Tailwind v3 consumers reinterpret those `@layer` blocks as v3
 * directives and error if `@tailwind base` isn't present in the same
 * file. Shared across all widget packages via `postcss.config.js`.
 *
 * @returns {import('postcss').Plugin}
 */
const flattenLayers = () => ({
  postcssPlugin: "postcss-flatten-layers",
  AtRule: {
    layer(atRule) {
      if (atRule.nodes === undefined) return;
      atRule.replaceWith(atRule.nodes);
    },
  },
});

flattenLayers.postcss = true;

export default flattenLayers;
