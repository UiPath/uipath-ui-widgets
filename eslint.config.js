// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import i18next from "eslint-plugin-i18next";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores([
    "dist",
    "**/dist",
    "**/node_modules",
    "storybook-static",
    "coverage",
    "**/coverage",
    // Third-party bundle staged from node_modules by `npm run stage-du-wc`;
    // its du-assets/ ship .ts sources that are not ours to lint.
    "public/du-vs-wc",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  // i18n enforcement for conversational-agent-chat.
  // Narrow scope + strict enforcement: fire only on surfaces that definitely
  // render to users (JSX text + explicit user-facing attributes + setError args)
  // so the rule's false-positive rate stays near zero and eslint-disable
  // comments don't become normalized.
  {
    files: ["packages/conversational-agent-chat/src/**/*.{ts,tsx}"],
    ignores: ["**/*.stories.{ts,tsx}", "**/*.test.{ts,tsx}", "**/__tests__/**"],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": [
        "error",
        {
          mode: "jsx-only",
          "jsx-attributes": {
            include: [
              "label",
              "title",
              "placeholder",
              "aria-label",
              "alt",
              "tooltip",
              "description",
              "message",
              "footerDisclaimer",
              "inputPlaceholder",
            ],
          },
          callees: {
            exclude: [
              "i18n(ext)?",
              "t",
              "require",
              "addEventListener",
              "removeEventListener",
              "postMessage",
              "getElementById",
              "dispatch",
              "commit",
              "includes",
              "indexOf",
              "endsWith",
              "startsWith",
              "console\\..*",
              "trackTelemetry",
            ],
          },
        },
      ],
      // Catch raw literals passed to setError / chatService.setError,
      // which are rendered to the user but live outside JSX ancestry and
      // so escape no-literal-string's jsx-only mode. The `value=/.+/`
      // filter skips `setError(null)` / `setError("")` (legitimate clears).
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.property.name='setError'][arguments.0.type='Literal'][arguments.0.value=/.+/]",
          message:
            "Pass a translated string via t('key') to setError, not a raw literal.",
        },
        {
          selector:
            "CallExpression[callee.name='setError'][arguments.0.type='Literal'][arguments.0.value=/.+/]",
          message:
            "Pass a translated string via t('key') to setError, not a raw literal.",
        },
        {
          selector:
            "CallExpression[callee.property.name='setError'][arguments.0.type='TemplateLiteral']",
          message:
            "Pass a translated string via t('key') to setError, not a template literal.",
        },
        {
          selector:
            "CallExpression[callee.name='setError'][arguments.0.type='TemplateLiteral']",
          message:
            "Pass a translated string via t('key') to setError, not a template literal.",
        },
        // Lock t() keys to static string literals. Dynamic keys (t(someVar),
        // t(`prefix_${x}`)) bypass check-i18n's key-coverage verification AND
        // silently render un-localized English when the dynamic value happens
        // to be an English string (i18next falls back to the key when the
        // lookup misses). If you need a conditional, switch/if on the known
        // keys: t(cond ? "key_a" : "key_b").
        {
          selector:
            "CallExpression[callee.name='t'][arguments.length>0][arguments.0.type!='Literal'][arguments.0.type!='TemplateLiteral']",
          message:
            "t() key must be a static string literal. If genuinely dynamic, enumerate possible keys in a comment and disable this rule on the next line (see CONTRIBUTING.md § Internationalization).",
        },
        {
          selector:
            "CallExpression[callee.name='t'][arguments.0.type='TemplateLiteral'][arguments.0.expressions.length>0]",
          message:
            "t() key must be a static string literal. Interpolated template literals cannot be verified at PR time. If genuinely dynamic, enumerate possible keys in a comment and disable this rule on the next line (see CONTRIBUTING.md § Internationalization).",
        },
        {
          selector:
            "CallExpression[callee.property.name='t'][arguments.length>0][arguments.0.type!='Literal'][arguments.0.type!='TemplateLiteral']",
          message:
            "t() key must be a static string literal. If genuinely dynamic, enumerate possible keys in a comment and disable this rule on the next line (see CONTRIBUTING.md § Internationalization).",
        },
        {
          selector:
            "CallExpression[callee.property.name='t'][arguments.0.type='TemplateLiteral'][arguments.0.expressions.length>0]",
          message:
            "t() key must be a static string literal. Interpolated template literals cannot be verified at PR time. If genuinely dynamic, enumerate possible keys in a comment and disable this rule on the next line (see CONTRIBUTING.md § Internationalization).",
        },
      ],
    },
  },
  ...storybook.configs["flat/recommended"],
]);
