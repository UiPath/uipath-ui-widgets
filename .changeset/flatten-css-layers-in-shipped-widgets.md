---
"@uipath/ui-widgets-conversational-agent-chat": patch
"@uipath/ui-widgets-datatable": patch
"@uipath/ui-widgets-multi-file-upload": patch
"@uipath/ui-widgets-validation-station": patch
---

Strip `@layer X { ... }` block wrappers from each widget's published CSS so the packages can be consumed by projects on any Tailwind major version (or no Tailwind at all).

Tailwind v4 — used internally to compile the widgets' styles via `@uipath/apollo-wind` — emits CSS that organises rules into native CSS Cascade Layers. Tailwind v3 consumer projects, however, overload the `@layer` syntax for their own directive system: when v3's PostCSS plugin encounters a `@layer base { ... }` block in any CSS it processes (including imports from `node_modules`), it requires a matching `@tailwind base` declaration in the same compilation unit and otherwise errors. This made the widgets unusable in Tailwind v3 host apps without consumer-side workarounds.

A new `postcss-flatten-layers` plugin is added at the repo root (`scripts/postcss-flatten-layers.js`) and wired into every widget's PostCSS pipeline. It runs after Tailwind v4 + autoprefixer and removes `@layer X { ... }` block wrappers, hoisting their rules to the surrounding scope. Declaration-only forms (`@layer X;`, `@layer a, b, c;`) are left untouched. Cascade-layer ordering is lost, but utility precedence is already baked into the rule order by Tailwind v4 at build time, so flattening loses no behaviour.
