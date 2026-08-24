---
"@uipath/ui-widgets-conversational-agent-chat": patch
"@uipath/ui-widgets-datatable": patch
"@uipath/ui-widgets-multi-file-upload": patch
---

Scope the conversational-agent-chat widget's published CSS to its root container and trim ~1 MB of duplicated fonts and utilities from the shipped stylesheets (JAR-10167).

Because `postcss-flatten-layers` ships the compiled Tailwind output unlayered, unlayered author styles beat every layered style in consumers: the widget's preflight reset, ~2,100 utility classes and the theme token blocks were overriding host apps document-wide. A new `postcss-scope-selectors` plugin (repo root, shared) now confines every selector in the chat widget's stylesheet to `.uipath-conversational-agent-chat`, so the sheet is inert outside the widget's DOM with no dependence on cascade layers or load order. Document-level and theme-class selectors (`body.light`, `.future-dark`, `html[dir='rtl']`) keep their ancestor test and re-target the widget root, so theme tokens land on the widget instead of overwriting the host's on `<body>`.

Bundle trims, mirrored across chat/datatable/multi-file-upload where applicable:

- The chat widget no longer inlines `@uipath/apollo-react/core/fonts/font.css` (~914 KB of CJK body-font catalogs); it imports only the apollo icon glyphs for standalone consumers.
- Tailwind `@source` globs now scan only the apollo-wind modules each widget transitively imports instead of all of `apollo-wind/dist/**`, guarded by a test that recomputes the import closure.

`ConversationalAgentChat.css` drops from ~1.3 MB to ~297 KB with zero unscoped top-level selectors. Scoping is not applied to datatable/multi-file-upload: they portal overlays to `document.body`, outside any scoping root.
