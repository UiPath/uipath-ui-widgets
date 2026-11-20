# Changelog

All notable consumer-facing changes to `@uipath/du-validation-station-wc`
are documented in this file. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the package
follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.0.0-rc.6] - 2026-11-17

Sixth release candidate for `1.0.0`. No element tag, input, event or
command method from `1.0.0-rc.5` is renamed or removed, and the new options
are opt-in. Some compact- and modern-mode UI appears by default: the
field filter bar's confirmed counter and the *Replace value* button. A
document supplied through `processedDocument` now opens in the modern
display mode, and the standalone table editor's types take the
representation parameter: read **Changed** before upgrading.

> 🚀 This is a **release candidate**. Please report any issues before the
> stable release.

### Added

- In compact and modern display modes, the field filter bar shows how many
  fields are confirmed, as "3 of 10 confirmed". A field confirmed as missing
  counts, and each instance of a value counts separately.
- In compact and modern display modes, a filled field and a filled table cell
  show a *Replace value* button, which replaces the value with the words
  selected in the document, as the actions menu's entry and its keyboard
  shortcut do. It is disabled while nothing usable is selected, and the
  document type field does not show it.
- `documentViewerOptions.floatingButtonsOptions.showDownloadButton` adds a
  "Download document" entry to the document viewer's menu, which saves the
  original file the viewer was given. Off by default; hidden for a text-only
  document.
- `options.hideDiscardButton` hides the *Discard* button in the fields panel
  footer and turns off its keyboard shortcut, for hosts that keep edits as a
  draft and offer their own discard. Off by default.
- The document-viewer element accepts an IXP document: `taxonomy` as an
  `IXPTaxonomy` and `extractionResult` as an `IXPReviewedExtraction` (a bare
  `IXPExtraction` works, with nothing confirmed). Its element types take the
  representation parameter — `IDocumentViewerStandaloneWcElement<'ixp'>` — and
  default to both representations, so existing code compiles unchanged.
- The table-editor element accepts an IXP document the same way, including
  `predictedExtractionResult` as an `IXPExtraction`, and its
  `extractionResultChanged` then carries an `IXPReviewedExtraction`.

### Changed

- A document supplied through `processedDocument` opens in the modern display
  mode. It carries no customizations, so it previously opened in compact.
- `ICompactTableEditorStandaloneWcElement` and its event map take the
  representation parameter. The event map previously fixed it to `'du'`, so a
  listener that types `extractionResultChanged`'s detail as `ExtractionResult`
  now needs `ICompactTableEditorStandaloneWcElement<'du'>`.
- The compact fields-form and table-editor elements no longer supply an empty
  document for an IXP extraction. One whose sources carry `references`, or
  that cites nothing, loads without a document. One whose sources cite by
  `boundingBoxes` alone is not supported on these elements: locating those
  boxes needs the document, which neither element has, so such an
  `extractionResult` does not load and such a `predictedExtractionResult`
  provides no predicted values.
- In compact and modern display modes, the popover listing the fields a
  document word belongs to now shows each field's group path, instance number
  and type icon, lists every field instead of the first three, and highlights
  the row under the pointer.
- In modern display mode, each field group instance header reads
  "1 of 2 (values)", as in compact, instead of showing the instance number in
  a box.

### Fixed

- The prediction diff and the popover that lists the fields referencing a
  word compare reference boxes with a small tolerance, so boxes drawn slightly
  differently around the same words no longer count as a different reference.
- `fieldValueChanged` is emitted when a value of an IXP document is edited, on
  every element that has the output. It was emitted only for UiPath
  extractions.
- In modern display mode, fields inside a field group no longer keep an empty
  chevron-wide gap on their left; fields next to a field group keep it, so
  their names stay aligned with the group's chevron.

## [1.0.0-rc.5] - 2026-11-11

Fifth release candidate for `1.0.0`. No element tag, input, event or
command method from `1.0.0-rc.4` is renamed or removed; the document-viewer
element is deprecated in favour of `@uipath/du-document-viewer-wc`. The new
flags and options are opt-in, but some compact-mode UI appears by default:
the field group's confirm-all checkbox, the table editor's clickable line
numbers, set-field autocomplete and field filters inside field groups. A few
changes can also affect an existing integration — values with a validation
error can no longer be confirmed, `setFieldValueByPath` confirms
differently, an IXP document saves new citations, and the value-indicator
popover's custom properties are renamed: read **Changed** before upgrading.

> 🚀 This is a **release candidate**. Please report any issues before the
> stable release.

### Deprecated

- `<ui-du-document-viewer-standalone-wc-element>` and its persistent variant.
  The same viewer now ships on its own as `<ui-du-document-viewer-wc-element>`
  in [`@uipath/du-document-viewer-wc`](https://www.npmjs.com/package/@uipath/du-document-viewer-wc);
  move to it. It takes no taxonomy or extraction result: link it to a fields
  form yourself, by assigning the selected value's `Reference` to its
  `highlightReference`. Stay on the deprecated element only while you need it
  linked to another element of this package through `instance-id`, which the
  new element cannot do yet. It will be removed in a later release.

### Added

- `x-uipath-suggested-currencies` on a monetary (`format: "monetary"`) `$defs`
  entry of an IXP taxonomy. In compact mode the currency box suggests these
  currencies while editing and still accepts any other.
- With `EnablePredictionDiff` on, the compact form marks each value that
  differs from the prediction, and flags the field groups, rows and tables
  that contain one.
- A `taxonomy-field-focus-request` message on `ui-du-vs-wc-message`, sent when
  an annotator clicks *Edit instructions* on one of those flags. The link shows
  only with `options.intendedUse: 'document-annotation'`, so an annotation host
  must set it; otherwise the flags use the validation wording. Handle the
  message to open that field in your taxonomy editor. `IVsWcMessage` gains this member,
  so an exhaustive `switch` over its `type` needs a new case.
- `EnableMarkReferenceAsMissing` on `FeatureCustomization`. When `true`, the
  value and table-cell action menus of the validation-station, fields-form
  and table-editor elements get a "Mark reference as missing" action. It
  removes only the value's reference to the document and keeps the extracted
  value, as an edit that Revert and Discard undo. It's enabled only on a value
  that has a reference, in a field whose taxonomy doesn't require one. When
  `false`, the action is removed even where the platform enables it.
- The validation-station and compact fields-form element types take a
  representation parameter — `IValidationStationStandaloneWcElement<'ixp'>`,
  `ICompactFieldsFormStandaloneWcElement<'du'>` — that narrows `taxonomy`,
  `extractionResult`, `predictedExtractionResult`, `extractionResultChanged`
  and the save-request payloads to one representation, and rejects mixing a
  UiPath taxonomy with an IXP extraction. New exports: `VsRepresentation`,
  `ExtractionOf`, `ReviewedExtractionOf`, `TaxonomyOf`. The parameter defaults to both
  representations, so existing code compiles unchanged.
- `options.intendedUse` tells the station what the host uses it for:
  `'extraction-validation'` (the default) when a reviewer checks extracted data
  before automation acts on it, or `'document-annotation'` when an annotator
  produces the reference data a model learns from. It tunes the wording and the
  in-feature actions of features that are already on, and never turns a feature
  on or off.
- `IXPReviewedExtraction`: an `IXPExtraction` plus the reviewer's
  `confirmations`, JSON Pointers of the confirmed values. The
  validation-station and compact fields-form elements take it as an IXP
  document's `extractionResult` and open with those values confirmed; a row's
  or group's pointer confirms every value under it, or a group with no rows
  as empty. A bare `IXPExtraction`
  still works, with nothing confirmed. `predictedExtractionResult` stays an
  `IXPExtraction`.
- `DistinguishUnconfirmedValues` on `FeatureCustomization`. When `true`, the
  document viewer of the validation-station and document-viewer elements
  draws the words of values that are not yet confirmed with a faint tint of
  the field color and an underline, and keeps the filled highlight for
  confirmed values. Off by default.
- Hovering a word in the document outlines every word of the value it belongs
  to in the field colour and, after a moment, lists the values containing it so
  one can be selected. Available in the validation-station and document-viewer
  elements. In compact mode, hovering a value, field, row or table in the list
  outlines its words in the document, and hovering a word highlights the values
  containing it in the list, along with a group or row around them only while
  it is collapsed. The fields-form and table-editor elements
  highlight hovers only within themselves.
- Clicking a field, group or table name selects it (validation-station and
  fields-form elements); in the validation-station element a table name also
  opens the table editor.
- `hideReferencedFieldsPopover` on `DocumentViewerOptions`. When `true`, the
  document viewer stops showing the popover that lists the fields referencing
  a word; selecting words still works. Applies to the document-viewer element
  and, through `options.documentViewerOptions`, to the validation-station
  elements.
- `DisableKeyboardShortcuts` on `FeatureCustomization`. When `true`, the
  validation-station, fields-form, table-editor and document-viewer elements
  turn their keyboard shortcuts off for every user, overriding the
  setting a user picks in the keyboard-shortcuts dialog: no shortcut responds,
  no shortcut hint is shown next to fields, cells and actions, and the
  document viewer menu drops its "Show available keyboard shortcuts" entry.
  The document viewer's own zoom, rotate and search keys still work.
- `EnableFieldGroupTableView` on `FeatureCustomization` (validation-station
  and fields-form elements, compact mode only) — a field group whose fields
  are all simple fields gets a table toggle on its header.
  Switched on, the group behaves as a table field: its line shows the table
  summary, and selecting it opens the table editor (a table-editor element
  sharing the same `instance-id` edits it too). The taxonomy can open a group
  as a table from the start, and the user can still switch it back: a UiPath
  taxonomy with `Metadata: [{ Key: 'DisplayAsTable', Value: 'true' }]` on the
  field group, an IXP taxonomy with
  `"x-uipath-display-settings": { "tableView": true }` on the group's
  property. Without the flag, both are ignored.
- A checkbox on a field group's line confirms or unconfirms all its
  instances ("Confirm all instances in this field group"), and shows as
  indeterminate while only some are confirmed (validation-station and
  fields-form elements, compact mode). `HideConfirmationCheckboxes` hides it.
- In the compact table editor (validation-station and table-editor
  elements), each row's line number is a button, "Select row N", and a Tab
  stop. Clicking it, or pressing Enter or Space, selects the row's first cell
  and highlights the row in the document, in read-only mode too.
- An IXP attribution source can cite its place on the page in page units:
  `references`, each with a `kind` (`'word'` or `'area'`), a `box`
  (`[top, left, width, height]`) and an optional `ocrConfidence`, plus the
  page's `pageWidth` and `pageHeight`. When any source carries `references`,
  the values load from them without waiting for the document, so they load
  even when the document fails to. A source without them is still located
  from `boundingBoxes` against `dom`; `boundingBoxes` is deprecated. A
  reference of an unknown kind or with a malformed box, and a source on no
  valid page, are dropped.
- `theme` accepts the Apollo Modern themes, `'future-light'` and
  `'future-dark'`. The accepted ids are exported as `WcTheme`.

### Fixed

- The validation-station element renders its fields panel and compact table
  editor as soon as their data is ready. They waited for the browser to go
  idle, so on a busy page they could stay blank.
- Selecting a value, stepping through search matches and moving between
  words no longer scroll the host page, or shift the page image inside the
  viewer (validation-station and document-viewer elements).
- An empty field inside a field-group row shows its broken business-rule
  indicator. It showed none, although the rule still blocked submitting.
- An IXP document no longer opens with *Discard* enabled and `dirty` `true`:
  both wait for the reviewer's first change.
- Picking a table cell from the list of fields that reference a word opens
  the table editor with that cell selected, also after that table's editor
  was closed. It selected the cell but left the editor closed.
- While the list of fields that reference a word is open and focused, the
  fields' assignment keys and F + A work. They were ignored until it closed.
- With keyboard shortcuts off, a field's colour button no longer shows the
  "No key was assigned to this field" tooltip.
- `saveValidatedDataAsDraftRequest`'s `validatedData` is typed
  `ExtractionResult | IXPReviewedExtraction`; it was typed `ExtractionResult`
  although an IXP document's draft carries an IXP extraction.
- `extractionResultChanged` on the compact table-editor and business-rules
  elements is typed `ExtractionResult`, the only representation they emit.

### Changed

- `extractionResultChanged` now fires for a document supplied as an
  `IXPExtraction` on the validation-station and compact fields-form elements,
  carrying an `IXPReviewedExtraction` — the same representation a draft save
  emits as `validatedData`. It previously never fired for such a document. It is still
  gated on `options.emitDtoStateChanges`, and an `ExtractionResult` document
  still emits an `ExtractionResult`. Feed the emitted object back as
  `extractionResult` to reopen a draft with its confirmations.
- `EnablePredictionDiff` now also inserts the predicted rows and values the
  extraction result lacks, as unconfirmed values the user confirms or deletes.
  The flag means the prediction is the annotation baseline. Rows whose content
  matches several predicted rows equally well are paired with the one cited at
  the same place in the document; only rows that neither content nor place
  tells apart stay unpaired, and their predictions are inserted.
- The inline predicted-value line appears only when the predicted value differs;
  a reference that differs alone is labelled in the crop popover footer only.
- Changing `predictedExtractionResult` on its own, after the element has paired
  the previous prediction, resets the element to the last `extractionResult` it
  was fed before pairing the new one; so does changing `taxonomy` alone while a
  prediction is paired. Re-feed the inputs together.
- A value with a validation error can no longer be confirmed, and neither can
  the row, table or field group containing it. Validation errors are a
  required value left empty or blank, a value outside its set's options, an
  anchor error and, in compact mode, an unparseable date, number or amount
  part; broken business rules don't block confirming. The checkbox is
  disabled, with a tooltip such as "Fix the validation error before
  confirming this value", the confirm shortcuts skip the value, and editing a
  value into an error unconfirms it. The `setFieldValueByPath` command
  follows suit: `OperatorConfirmed: true` on such a value, or on a row, table
  or group containing one, fails with `success: false` and applies nothing;
  `OperatorConfirmed: false` keeps a valid value unconfirmed; without
  `OperatorConfirmed`, an updated value is confirmed when valid and left
  unconfirmed when not.
- In compact mode a set field or cell is a text box with an autocomplete list
  instead of a dropdown. Typing filters the options; Enter or leaving the box
  commits the text only when it matches an option, ignoring case, and
  otherwise keeps the previous value. Escape restores the value.
- F + C on a selected empty field extracts its value, as the field's "+"
  button does, and F + A only adds a value to a multi-value field that
  already has one. F + A used to create an empty field's value, and F + C did
  nothing there. In classic mode, T + C creates an empty table header cell's
  value.
- Field-group rows are called instances (compact mode): the add button reads
  "Add instance", where it read "Add value", with the tooltip "Add an
  additional instance", and a row's "Highlight row" action reads "Highlight
  instance". In read-only mode a row no longer shows its actions menu;
  clicking the row still highlights it.
- The compact field filters reach inside field groups (validation-station and
  fields-form elements). The field-search picker lists a group's fields under
  it, and picking the group picks them all. The *Hide fields* filters apply to
  a group's fields too: a row whose fields are all hidden is hidden, and so is
  a group whose rows all are, and the group line and its rows show how many
  fields they hide. A row the reviewer just added stays visible until the
  filters change. Table columns and rows are still not filtered.
- An IXP document's `validatedData`, on submit and on a draft save, and its
  `extractionResultChanged` cite every value afresh: each source carries
  `references`, `pageWidth` and `pageHeight` (`null` when unknown), and
  `boundingBoxes` for words only, so a value the reviewer didn't touch no
  longer echoes its incoming `sources`. A `null` value whose attribution cites
  words loads as an empty value that keeps its reference, and a value emptied
  in place saves as `null` with its citation.
- The value-indicator popover's styling custom properties are renamed from
  `--du-vs-indicator-overlay-padding`, `-shadow`, `-radius` and `-background`
  to `--ui-hover-popover-padding`, `-shadow`, `-radius` and `-background`. A
  host that sets the old names silently loses that styling. The
  `::part(indicator-overlay)` parts are unchanged.

## [1.0.0-rc.4] - 2026-10-09

Fourth release candidate for `1.0.0`. No element tag, input, event or
command method from `1.0.0-rc.3` is renamed or removed. The new options are
opt-in, but some compact-mode UI appears by default: the *No taxonomy
defined* state, the table editor's *Duplicate row* action and column
freezing.

> 🚀 This is a **release candidate**. Please report any issues before the
> stable release.

### Added

- `predictedExtractionResult` on the validation-station and compact
  fields-form elements accepts an `IXPExtraction`, like `extractionResult`,
  so an IXP document can show the prediction diff. Supply it in the same
  representation as `extractionResult`. The table editor still takes an
  `ExtractionResult` only.
- IXP taxonomies can declare a **single-instance field group**: a nullable
  `object` whose fields sit directly under `properties`. It renders as one
  row; `null` or a missing value renders as not found, and the reviewer can
  add the instance but not a second one. It saves back as an object, or
  `null` when there is no row. Previously such a taxonomy failed to load.
- `emptyTaxonomyMessage` option — when the selected document type has no
  fields, the compact fields form shows a *No taxonomy defined* state with
  this text, or a default message when it is unset. Pass it already
  localized. Submitting is still allowed; use `hideSubmitButton` to prevent
  it.
- Table columns can be frozen up to a chosen column, so they stay visible
  while the table scrolls horizontally.
- A *Duplicate row* action in the compact table editor's row menu. It
  inserts a copy of the row directly below it; the copied values are
  unconfirmed and have no document reference. It is not offered in
  read-only mode or in the classic table editor.
- **Shift+N** keyboard shortcut — moves to the next value or table cell with
  a flagged issue (a failed validation, a broken business rule, or an
  unconfirmed value below its confidence threshold), in the same order as
  `N` / `P`, wrapping at the end. Unlike `N`, it never confirms the value it
  leaves.

### Fixed

- IXP field groups no longer require a document reference, so a row can be
  added without first selecting something in the document. Each field still
  follows its own reference rule.
- The *Continue & save* prompt for unconfirmed values closes as soon as the
  user edits a field, confirms a value or changes the document type, so it
  can no longer submit values changed after it opened.
- The prediction diff compares numbers and date parts by value, so `1.50`
  and `1.5` no longer show as a difference.
- Classic mode shows the document type's real extraction confidence instead
  of always 100%.
- Frozen table columns: no gap after the line-number column, and a dedicated
  tooltip when no columns fit.
- Component theme overrides are resolved by inheritance instead of
  `:host-context`.
- Accessibility: the date-range picker's controls are grouped under their
  form field label, and the page navigator's input has a visible label.

## [1.0.0-rc.3] - 2026-10-01

Third release candidate for `1.0.0`. It carries a breaking change for hosts
that supply a Flow extraction: `flowTaxonomy` + `flowExtraction` are removed,
and `taxonomy` + `extractionResult` take the IXP representation instead. Read
**Changed** before upgrading. Hosts that supply UiPath extraction results are
unaffected.

> 🚀 This is a **release candidate**. Please report any issues before the
> stable release.

### Added

- `HideHighlightRow` on `FeatureCustomization` (validation-station and
  fields-form elements, compact mode only) — hides the "Highlight row"
  action from the menu of each field group row in the fields list, for
  hosts with nothing to highlight, e.g. no document viewer. In read-only
  mode, where that leaves the menu empty, the menu button is hidden too.
  The table editors are unaffected.

### Changed

- **Breaking:** the validation-station element's `flowTaxonomy` +
  `flowExtraction` inputs are removed. `taxonomy` and `extractionResult` now
  accept the IXP representation directly, as an `IXPTaxonomy` and an
  `IXPExtraction`, on the validation-station and compact fields-form elements.
  The fields form hides its document type field by default for an
  `IXPTaxonomy`, like the validation-station element.
- **Breaking:** `IVsFlowValidatedResult` is replaced by `IXPExtraction`, the
  same type the `extractionResult` input takes, as the IXP `validatedData` of
  `saveValidatedDataRequest`.
- The compact fields form's expand / collapse-all control is redesigned and
  aligned with the field rows, and its labels now read *Expand all field
  groups* / *Collapse all field groups*.

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
