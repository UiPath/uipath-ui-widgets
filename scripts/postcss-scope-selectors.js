/**
 * Scopes compiled widget CSS to its root container.
 *
 * Handles ordinary, document/theme, and escaped Tailwind selectors while
 * preserving nesting and leaving keyframes, custom properties, and fonts
 * global. The transform is idempotent.
 *
 * @param {string} rootSelector the widget root
 * @returns {import('postcss').Plugin}
 */
const scopeSelectors = (rootSelector) => {
  const DOC_ROOT = /^(html|body|:root|:host)([^\s>+~]*)/;
  // Apollo Wind theme classes apply to an ancestor, not the widget itself.
  const THEME_HEAD =
    /^(\.(?:light-hc|dark-hc|future-dark|future-light|light|dark|wireframe)(?![\w-])[^\s>+~]*)/;
  const NESTING_AMPERSAND = /(?:^|[^\\])&/;

  const isScopable = (rule) => {
    for (let node = rule.parent; node; node = node.parent) {
      // Nested rules inherit their scoped parent; keyframe children are offsets.
      if (node.type === "rule") return false;
      if (node.type === "atrule" && /^(-\w+-)?keyframes$/i.test(node.name)) {
        return false;
      }
    }
    return true;
  };

  const scopeSelector = (selector) => {
    const trimmed = selector.trim();
    if (NESTING_AMPERSAND.test(trimmed)) return selector;
    if (trimmed.includes(rootSelector)) return selector;

    const docRoot = DOC_ROOT.exec(trimmed);
    if (docRoot) {
      const [head, , qualifiers] = docRoot;
      const rest = trimmed.slice(head.length);
      if (!qualifiers && !rest) return rootSelector;
      return `${head} ${rootSelector}${rest}`;
    }

    const themeHead = THEME_HEAD.exec(trimmed);
    if (themeHead) {
      const head = themeHead[1];
      const rest = trimmed.slice(head.length);
      return `${head} ${rootSelector}${rest}`;
    }

    return `${rootSelector} ${trimmed}`;
  };

  return {
    postcssPlugin: "postcss-scope-selectors",
    // Run after Tailwind and layer flattening have produced final selectors.
    OnceExit(root) {
      root.walkRules((rule) => {
        if (!isScopable(rule)) return;
        rule.selectors = rule.selectors.map(scopeSelector);
      });
    },
  };
};

scopeSelectors.postcss = true;

export default scopeSelectors;
