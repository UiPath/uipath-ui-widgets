# Changelog

All notable consumer-facing changes to `@uipath/du-validation-station-wc`
are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package
follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0-rc.2] - 2026-09-28

Second release candidate for `1.0.0`. No element tag, event or command
method from `1.0.0-rc.1` is renamed or removed. The new inputs, options and
flags below are opt-in, but some compact-mode UI appears by default: the
field-filter toolbar, expandable field groups, the table editor's
line-number column and the *Waiting for input* screen. A few changes can
also affect an existing integration: read **Changed** before upgrading.

> 🚀 This is a **release candidate**. Please report any issues before the
> stable release.

### Added

- `predictedExtractionResult` on the validation-station, fields-form and
  table-editor elements: the model's prediction — the extraction output
  nobody edited — next to `extractionResult`, the result the user
  reviews. Set `null` to clear it. By itself it changes nothing visible.
- New `FeatureCustomization` flags on the `customization-info` input:
  - `EnablePredictionDiff` — honored by the validation-station,
    fields-form and table-editor elements, compact mode only. Where the
    prediction differs from the current values, the element shows the
    predicted value with a button that takes it over. Assign the
    prediction with or before the extraction result; a document that
    finishes loading without one logs a single console warning.
  - `HideConfirmationCheckboxes` (validation-station, fields-form, and
    table-editor elements, compact mode only, for hosts that display
    predictions rather than collect a review, e.g. readonly embeds) —
    hides the per-value and per-row confirmation checkboxes. Purely
    visual: the submit flow is unchanged (submitting with unconfirmed
    values still shows the confirm-all prompt).
  - `HideReadonlyModeIndicator` (validation-station and fields-form
    elements, for hosts that display predictions rather than collect a
    review, e.g. readonly embeds) — hides the READ-ONLY indicator shown
    at the bottom of the fields list when `is-readonly` is set.
  - `IgnoreConfidence` (validation-station, fields-form, and table-editor
    elements, both modes, for hosts where confidence carries no meaning) —
    takes confidence out of the experience entirely: no confidence
    indicator (red or green), no confidence rows in a value's hover
    breakdown, and confidence no longer makes a value count as an issue —
    so the *hide fields with no issues* filter and the collapsed group/row
    dots follow suit. Broken business rules and failed extraction
    validation are unaffected and still flag the value. The indicator keeps
    its fixed-width slot so the value column stays aligned, unless the
    document type defines no business rules at all - nothing can then ever
    occupy the slot, so it collapses and the space is reclaimed.
- The package now exports the `ICustomizationInfoDTO` / `IFeatureCustomization`
  shapes for opt-in typing of the `customization-info` payload. The
  `customizationInfo` inputs themselves stay typed `unknown`, so existing
  consumers are unaffected.
- New members on the validation-station element's `options`:
  - `fieldFilterOptions` — trims or removes the compact fields form's
    field-filter toolbar. `hideBar` removes the whole toolbar;
    `hideConfirmed`, `hideNotExtracted` and `hideNoFlaggedIssues` each drop
    one entry of the *Hide fields* menu. A hidden filter also stops
    filtering, so a value the user saved in an earlier session is not left
    applied with no way to clear it.
  - `defaultFieldsAreaPercentage` / `defaultFieldsAreaWidth` — the width the
    fields panel starts at, as a percentage of the element or in pixels (the
    percentage wins if both are set). A width the user has dragged still wins
    over both, and the panel stays within 30–80% of the element.
  - `documentViewerOptions` — the same `DocumentViewerOptions` object the
    document-viewer element accepts, now applied to the viewer embedded in
    the validation station.
- Two new `DocumentViewerOptions.floatingButtonsOptions` flags, honored by the
  document-viewer element and through `documentViewerOptions`:
  `hideExtractedTokensToggle` (removes the show/hide extracted-tokens menu
  entry and its keyboard shortcut) and `hideLanguageSelect` (removes the
  language dropdown, where the `DisableLanguageSelection` customization only
  disables it).
- `flowTaxonomy` + `flowExtraction` on the validation-station element: an
  alternative to `taxonomy` + `extractionResult` for documents produced by a
  UiPath Flow extraction (a JSON Schema plus the extracted values). Supply one
  pair or the other. A document supplied this way saves back in the same
  representation: `saveValidatedDataRequest`'s `validatedData` is then an
  `IVsFlowValidatedResult` (`output` + `attribution`) instead of an
  `ExtractionResult`.
- A host-rendered value-indicator overlay. The elements publish typed
  messages on a single `ui-du-vs-wc-message` event (`IVsWcMessage`,
  discriminated on `type`); `indicator-overlay-show` carries the value's
  confidence and broken-rule state plus the trigger's viewport rect. Hide the
  built-in popover with `::part(indicator-overlay) { display: none }` and
  render your own.
- The compact fields form (validation-station and fields-form elements)
  gains:
  - a field-filter toolbar — a *Hide fields* menu (confirmed, not
    extracted, with no flagged issues), a field search and a reset button;
  - field groups and group rows that expand and collapse, with a dot on a
    collapsed one that hides an issue.
- The compact table editor gains a 30 rows-per-page option and a pinned
  line-number column.
- The element shows a *Waiting for input* screen until its document data
  arrives, instead of rendering empty.
- A `styles` side-effect entry
  (`import '@uipath/du-validation-station-wc/styles'`) that registers the
  theme with the component, which adopts it into its own shadow root. See
  **Changed** for why it replaces the `styles.css` import.
- Translations refreshed from the localization pipeline across all
  supported locales.

### Changed

- `options.hideDocumentTypeField` now defaults to `true` when the
  validation-station element is given Flow data (`processedDocument`, or
  `flowTaxonomy` on the standalone element). Set it to `false` to show the
  document type field again.
- `FeatureCustomization.HideConfidence` now also takes effect in **compact
  mode**, where it was previously ignored — it only ever reached classic mode.
  A host that already sets it and renders in compact will now see the
  confidence indicator disappear and low-confidence values stop counting as
  issues. Set it to `false` (or drop it) to keep the old compact behavior.
- The **suggestions dropdown** now hides its per-suggestion confidence whenever
  confidence is ignored, in both classic and compact. Previously it kept showing
  it even with `HideConfidence` set, which contradicted the flag's purpose.

- **`fonts.css` no longer carries the Apollo text fonts** — only Material
  Icons. The import is unchanged:

  ```ts
  import '@uipath/du-validation-station-wc/fonts.css';
  ```

  Poppins, Noto Sans (including the CJK subsets), Inconsolata and the Apollo
  icon font were tens of MB of the install, a UiPath-styled host already loads
  them, and without them the component inherits your app's own font stack —
  which is what most embedders want. Material Icons stay, because without those
  every icon renders as its ligature text.

  If you do want the UiPath typography, install
  [`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts)
  and import its `font.css` — it also contains Material Icons, so it can replace
  the `fonts.css` import outright. Loading the WC from a UiPath-hosted
  deployment URL with `{ includeFonts: true }` is unaffected: that deployment
  is built with the full set. See the README "Fonts" section.

- **Import the `styles` entry instead of `styles.css`.** Linked or imported
  into your document, `styles.css` does not stay inside the component: it
  carries Angular Material tokens on `html` and theme rules on generic
  classes (`body.light`, `.dark`, `.mat-*`) that restyle a host built on
  Angular Material or Apollo. Replace

  ```ts
  import '@uipath/du-validation-station-wc/styles.css';
  ```

  with

  ```ts
  import '@uipath/du-validation-station-wc/styles';
  ```

  `styles.css` is still shipped, so the old import keeps working. See the
  README "Styles" section.
- **The package declares an `exports` map and `"type": "module"`.** Only
  `.`, `./main`, `./polyfills`, `./styles`, `./styles.css`, `./fonts.css`
  and `./package.json` resolve through the package name. A deep import of
  any other file now fails to resolve; copying `du-assets/` out of
  `node_modules` by path is unaffected.
- **Data inputs are typed with the Document Understanding SDK contracts.**
  `taxonomy`, `extractionResult`, `predictedExtractionResult` and `dom` are
  now `DocumentTaxonomy`, `ExtractionResult` and `DocumentEntity` from
  `@uipath/uipath-typescript/document-understanding`, instead of `unknown`,
  and the package declares `@uipath/uipath-typescript` (`^1.5.1`) as a peer
  dependency. Install it, or those types resolve to `any`. On the
  validation-station element `taxonomy` and `extractionResult` are now
  optional, because the Flow pair can stand in for them.
- **`polyfills` no longer loads `zone.js`.** The component runs Angular
  without zones, so importing the `polyfills` entry no longer patches the
  host page's timers, promises and event listeners.

### Fixed

- `isValid` could report `true` while values were still broken: once one
  value of a field merged into a business-rule result, validation errors on
  the field's other values were dropped from `businessRulesEvaluated`. A host
  that gates submit on `isValid` could let invalid data through.
- Very large extraction results no longer fail to load with
  `RangeError: Maximum call stack size exceeded`.
- `dirty` no longer fires while the extraction result is still loading.
- A `customizationInfo` that sets only some flags no longer switches the
  element out of compact mode.
- Component scrollbar and theme styles no longer leak into the host page.
- Compact mode no longer shows an OCR confidence of `-100%` for a value with
  no OCR measurement, such as an area drawn by the reviewer. The OCR row is
  now omitted.
- Confirming a table row selects and highlights the whole row.
- A value shows the same formatting in readonly and edit mode.
- The value-indicator overlay no longer flickers on hover.
- The field picker stays open when the host page takes focus, and no longer
  scrolls horizontally.
- Classic mode: the confidence-threshold slider is seeded from
  `FieldsValidationConfidence` again, and table cells show their keyboard
  shortcuts.
- Readonly mode is honored for table validator notes, and validator notes
  keep their details when the operator note is empty.
- The passive-token toggle and the viewer's burger menu are hidden when they
  have nothing to show.
- pdf.js built-ins missing from older Chromium-based browsers are now
  polyfilled.

### Security

- Updated transitive dependencies to address known CVEs.

### Deprecated

- `FeatureCustomization.HideConfidence` is renamed to `IgnoreConfidence`.
  It is still honored, and the two combine with OR — either flag on its own
  takes confidence out of the experience — so a host that serializes both
  (a typed DTO that always emits every property) keeps working.

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
