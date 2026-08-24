/**
 * Scopes every selector in a widget's compiled stylesheet to the widget's
 * root container, so the sheet is inert outside the widget's own DOM.
 *
 * Needed because `postcss-flatten-layers` ships the compiled Tailwind
 * output unlayered, and unlayered author styles beat *every* layered
 * style in a consumer — the preflight reset, ~2000 utility classes and
 * the theme token blocks were all overriding host apps document-wide
 * (JAR-10167). Scoping removes any dependence on cascade layers or
 * stylesheet load order, so flattening stays harmless.
 *
 * Selector handling:
 * - `.foo`, `*`, `hr`, `[hidden]`, `::before` … → `<root> <selector>`
 * - bare `html` / `body` / `:root` / `:host`    → `<root>` (the widget's
 *   root *is* its document root once scoped)
 * - qualified document roots (`body.light`, `html[dir='rtl']`) keep the
 *   ancestor test and re-target the root (`body.light <root>`): the theme
 *   blocks carry ~130 custom properties apiece and the widget root has no
 *   theme class of its own, so a plain prefix would strand the tokens and
 *   no transform would keep overwriting the host's tokens on <body>.
 * - theme-class heads (`.light:not(.react-flow)`, `.future-dark`, `.wireframe *`)
 *   are ancestors of the widget for the same reason → `.future-dark <root> …`
 * - selectors with a nesting `&` resolve against their (already scoped)
 *   parent rule and are left alone — but only an *unescaped* `&`: Tailwind
 *   escapes `\&` into arbitrary-variant class names
 *   (`.hover\:\[\&\>td\]\:bg-…`), which must be scoped like any class.
 * - selectors already containing the root are left alone (idempotent).
 * - `@font-face`, `@property` and `@keyframes` contents stay global: they
 *   register names rather than match elements.
 *
 * @param {string} rootSelector the widget root, e.g. ".uipath-conversational-agent-chat"
 * @returns {import('postcss').Plugin}
 */
const scopeSelectors = (rootSelector) => {
  const DOC_ROOT = /^(html|body|:root|:host)([^\s>+~]*)/;
  // The apollo-wind theme families; always applied to an ancestor (body or a
  // themed wrapper), never inside the widget.
  const THEME_HEAD =
    /^(\.(?:light-hc|dark-hc|future-dark|future-light|light|dark|wireframe)(?![\w-])[^\s>+~]*)/;
  const NESTING_AMPERSAND = /(?:^|[^\\])&/;

  const isScopable = (rule) => {
    for (let node = rule.parent; node; node = node.parent) {
      // A nested rule resolves against its parent, which is scoped on its
      // own; `@keyframes` children are offsets (`from`, `50%`), not selectors.
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
    // OnceExit so Tailwind has emitted all utilities and flatten-layers has
    // unwrapped them before we walk.
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
