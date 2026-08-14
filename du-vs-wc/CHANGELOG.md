# Changelog

All notable consumer-facing changes to `@uipath/du-validation-station-wc`
are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package
follows [Semantic Versioning](https://semver.org/).

## [1.0.0-rc.1] - 2026-07-01

First release candidate for `1.0.0`. No breaking changes to element tags,
JS properties, events, or command methods since `1.0.0-beta.3`.

> 🚀 This is a **release candidate**. Public APIs (element tags, JS
> properties, events, command methods) are now considered stable and are
> not expected to change before `1.0.0`. Please report any issues before
> the stable release.

### Added

- **Individually embeddable sub-components.** Beyond the full validation
  station, the compact-mode building blocks are now published as their
  own standalone web components, so a host can embed just the piece it
  needs:
  - a document viewer, with configuration options and programmatic
    navigation commands;
  - a fields form;
  - a table editor;
  - a document-type field;
  - a business-rules panel.
- Keyboard shortcuts are now captured on shadow-DOM roots, so they work
  correctly when the component is embedded inside another shadow tree.
- Standalone web components now ship with sensible customization
  defaults, so they render correctly out of the box without requiring
  every option to be set explicitly.
- Translations refreshed from the localization pipeline across all
  supported locales.

### Changed

- **Fonts are now an opt-in `fonts.css`.** `@font-face` rules (Apollo
  fonts and Material Icons) are shipped as a separate stylesheet that
  loads into the light DOM, instead of being bundled into `styles.css`.
  If your host page does not already provide these fonts globally,
  import `@uipath/du-validation-station-wc/fonts.css` — otherwise text
  falls back to system fonts and icon glyphs render as empty boxes. See
  the **Fonts** section of the README.
- The component theme is now served as a standalone, cacheable
  `styles.css` rather than inlined into `main.js`, shrinking the main
  bundle. `styles.css` is still imported the same way — no consumer
  change required.

### Fixed

- Dark-mode theming is corrected across the scrollbar, resize gutter, and
  Material 3 color tokens, and the active language is now isolated
  per element so multiple instances on a page no longer share a locale.
- Classic mode now honors the display-mode override and renders the
  correct confidence colors.
- The effective display mode is used in domain logic so validations
  re-run as expected when the mode changes.
- A host-supplied CSS class applied to the validation-station element is
  no longer dropped.
- A clear error message is shown when a deferred bundle chunk fails to
  load, instead of failing silently.
- Compact mode now renders taxonomy fields when the extraction result is
  empty.
- Including data in the bug-report dialog reloads correctly.

## [1.0.0-beta.3] - 2026-06-11

Third public beta. No breaking changes to element tags, JS properties,
events, or command methods since `1.0.0-beta.2`.

> ⚠️ Still a **beta** release. Public APIs are not yet stable and data
> contracts may change before `1.0.0`.

### Added

- Translations refreshed from the localization pipeline across all
  supported locales.

### Changed

- **Styles are now restructured for Shadow DOM isolation.** Component
  styles are scoped to the web component's shadow root, reducing the
  chance of style bleed between the WC and the host page.
- The WC no longer emits telemetry for non-command inputs/outputs, and
  no longer tracks network requests made by the parent host page —
  telemetry is now limited to the component's own activity.
- Removed obsolete command inputs from the standalone WC element. Use
  the documented command methods (`setFieldValue`, `setFieldValueByPath`,
  and friends) instead.
- Expanded the public README with eager- and lazy-load playground
  examples covering the recommended integration patterns.

### Fixed

- Date parsing now handles day ranges in derived date parts.
- Number and address parsing is aligned with the backend for
  undetermined-language input and cross-locale addresses.
- Inserting a row in the compact table editor no longer triggers
  unwanted horizontal scrolling.
- `Reference.TextLength` is now coerced from `NaN` to `0` on area
  selections, preventing invalid reference data.

### Security

- Addressed critical CVEs in `axios` and `@nevware21/ts-utils`, and
  removed the unused `@angular-architects/module-federation` dependency.
- Remediated additional transitive-dependency CVEs (`postcss`, `hono`,
  `ip-address`, `brace-expansion`, `webpack-dev-server`).

## [1.0.0-beta.2] - 2026-05-19

Second public beta. No breaking changes since `1.0.0-beta.1` — element
tags, JS properties, events, and command methods are unchanged.

> ⚠️ Still a **beta** release. Public APIs are not yet stable and data
> contracts may change before `1.0.0`.

### Added

- Translations refreshed from the localization pipeline across all
  supported locales.

### Changed

- **Runtime asset location is now self-resolved.** The WC locates its
  `du-assets/` directory (PDF.js worker, cmaps, wasm, i18n) at runtime
  via `import.meta.url`, relative to wherever the main bundle is
  served — no more reliance on a build-time CDN path baked into the
  bundle. Consumers must deploy `du-assets/` at the same path level as
  the WC bundle they serve; see the **Static assets** section of the
  README for the full deployment guidance. Without co-location, PDF
  rendering and translations will silently 404.

### Fixed

- `<ui-du-validation-station-standalone-wc-persistent-element>` no
  longer emits command-result events multiple times for a single
  invocation.
- Resolved drift between `DataVersion` and `DocumentTypeDataVersion`
  that could cause stale taxonomy / extraction-result combinations to
  render incorrectly after a document-type change.

### Security

- Updated transitive dependencies to address 6 critical CVEs
  (`axios`, `koa`, `lodash`, `picomatch`).

## [1.0.0-beta.1] - 2026-05-08

Initial public beta release of the Validation Station web component.

> ⚠️ This is a **beta** release. Public APIs (element tags, JS
> properties, events) are not yet stable
> and data contracts may change before `1.0.0`.

### Added

- Standalone validation-station web components:
  - `<ui-du-validation-station-standalone-wc-element>` — render a
    document for validation; data is provided via JS properties; save /
    save-as-draft / report-as-exception requests are emitted as events
    so the consumer's backend stays in control of all I/O.
  - `<ui-du-validation-station-standalone-wc-persistent-element>` — same
    as above, but suppresses `disconnectedCallback()` so internal state
    survives portal detachments. Includes an explicit `forceDestroy()`
    method that must be called when permanently removing the element.
- TypeScript declarations covering both element interfaces, all
  command-input shapes, the full event map, and JSX prop types for
  React 18 (refs) and React 19 (direct prop pass-through).
- Global `HTMLElementTagNameMap` and `React.JSX.IntrinsicElements`
  augmentations — `document.querySelector` returns the typed element,
  and the custom tags are recognised in JSX without per-file imports.
- Programmatic command API: `setFieldValue`, `setTableCellValue`,
  `deleteFieldValue`, `deleteTableCellValue`, `selectAndFocusFieldValue`,
  `save`, `discardChanges`, plus by-path equivalents
  (`setFieldValueByPath`, `selectAndFocusFieldValueByPath`,
  `deleteFieldValueByPath`).
- Configuration inputs: `theme` (`light` / `dark` / `light-hc` /
  `dark-hc`), `language` (BCP-47), `isReadonly`, `enableSaveAsDraft`,
  and a fine-grained `options` object (`hideSubmitButton`,
  `hideReportAsExceptionButton`, `hideDocumentTypeField`, `hideFields`,
  `fieldsSectionPosition`, `enableUserPreferences`,
  `userPreferencesKeySuffix`, `emitDtoStateChanges`).
- Events: `loaded`, `dirty`, `documentTypeChanged`,
  `extractionResultChanged`, `fieldValueSelected`, `fieldValueChanged`,
  `businessRulesEvaluated`, `fieldsPanelWidthChanged`,
  `fieldsPanelSideChanged`, plus result events for every command
  (`setFieldValueResult`, `setTableCellValueResult`,
  `deleteFieldValueResult`, `deleteTableCellValueResult`,
  `selectAndFocusFieldValueResult`, `setFieldValueByPathResult`,
  `selectAndFocusFieldValueByPathResult`,
  `deleteFieldValueByPathResult`).
- Bundle ships as MIT-licensed under the `@uipath` scope.

### Notes

- The bundle is non-trivial (≈6 MB uncompressed). Lazy-load it behind a
  route boundary if the WC is conditional in your app.
- Complex object props in React 18 require a `ref` — see the README for
  the full pattern.
