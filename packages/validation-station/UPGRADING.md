# Upgrading `@uipath/ui-widgets-validation-station`

What changed in the web component releases this package renders, and how to move off `1.0.x`. For setup, start with the [README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#readme).

## Unreleased: Flow documents are matched by their pipeline run

For a `ProcessedDocument`:

- **`documentId` defaults to `metadata.pipelineRunId`**, not `metadata.traceId`. Every extraction of one Flow run shares its trace id, so the old default gave them all the same id. Host state keyed on `request.documentId` now sees the pipeline-run GUID.
- **`metadata.pipelineRunId` is required.** A payload without it is refused on load and save. A cloud Flow run always sets it.
- **The documents of one Flow run load side by side.** Each reads the digitization of its own pipeline run, where before every one failed with "the trace carries 2 idpDigitization spans".

## Web component 1.0.0-rc.6

The widgets now render `@uipath/du-validation-station-wc` `1.0.0-rc.6`. Keep the
hosted copy in step (see [Version skew](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/hosting.md#notes)). No prop of this package was
removed or renamed, but the web component changes a few things you will see.

From rc.6 — read the behaviour changes before upgrading:

- **IXP documents in the subcomponents.** `CompactFieldsForm`,
  `CompactTableEditor` and `DocumentViewer` take `processedDocument` or
  `IxpDocumentArtifacts` — see the
  [subcomponents guide](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/validation-station-subcomponents.md#ixp-documents).
  `onExtractionResultChanged` on `CompactFieldsForm` and `CompactTableEditor` is
  typed for either representation, so a handler typed for `ExtractionResult`
  alone no longer compiles on either one.
- **The compact fields form and table editor reject `boundingBoxes`-only IXP
  citations.** An IXP extraction whose sources cite by `boundingBoxes` alone
  (no `references`) does not load on these elements. Either cites fine in
  `ValidationStation` and `DocumentViewer`, which have the document.
- **New compact UI, on by default:** the field filter bar counts
  confirmed fields, and a filled field or table cell shows a _Replace value_
  button.
- **New options:** `options.hideDiscardButton`, and
  `documentViewerOptions.floatingButtonsOptions.showDownloadButton`.
- **`fieldValueChanged` now fires for IXP documents.**

From rc.5:

> **Warning: The Flow review record and the task completion changed**
> This release follows the Angular Validation Station in how a `ProcessedDocument` review is recorded and completed. A review is now stored as the validated `ProcessedDocument` (`metadata.hitl.draft` telling a draft from a submit) instead of `{ draft, extraction }`, and a draft saved in the old envelope no longer reopens — the document opens on the payload's `result`. Complete the task with a submit's `result.processedDocument` rather than `request.validatedData`. See [IXP (`ProcessedDocument`)](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/data-sources.md#ixp-processeddocument).

- **A value with a validation error can no longer be confirmed**, nor the row,
  table or field group containing it. `setFieldValueByPath` follows suit:
  `OperatorConfirmed: true` on such a value fails with `success: false` and
  applies nothing, and without `OperatorConfirmed` an updated value is
  confirmed only when valid.
- **IXP documents keep their confirmations.** `extractionResult` takes an
  `IXPReviewedExtraction` (`confirmations` are JSON Pointers of confirmed
  values), `onExtractionResultChanged` now fires for IXP documents, and a
  draft carries the confirmations, so a saved draft reopens with them. A bare
  `IXPExtraction` still opens with nothing confirmed.
- **IXP citations are rewritten on save.** `validatedData` cites every value
  afresh with `references` in page units plus `pageWidth` / `pageHeight`;
  `boundingBoxes` is deprecated and written for words only.
- **New compact UI, on by default:** a confirm-all checkbox on each field
  group, clickable line numbers in the table editor, an autocomplete box for
  set fields, and field filters that reach inside field groups. Field-group
  rows are now called _instances_.
- **The value-indicator popover's custom properties are renamed** from
  `--du-vs-indicator-overlay-*` to `--ui-hover-popover-*` (`padding`,
  `shadow`, `radius`, `background`). Old names are silently ignored.
- **New options:** `options.intendedUse` (`'extraction-validation'` or
  `'document-annotation'`), `documentViewerOptions.hideReferencedFieldsPopover`,
  and the `FeatureCustomization` flags `DisableKeyboardShortcuts`,
  `EnableFieldGroupTableView`, `EnableMarkReferenceAsMissing` and
  `DistinguishUnconfirmedValues`.
- **New message:** `taxonomy-field-focus-request` on `onWcMessage` — see
  [Opening a field in your taxonomy editor](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/events-and-commands.md#opening-a-field-in-your-taxonomy-editor).
- **New themes:** `theme` accepts the Apollo Modern `'future-light'` and
  `'future-dark'`.
- **`DocumentViewer` is deprecated**, following the web component's own
  document-viewer element. For a viewer that does not need `instanceId`
  linking, use [`@uipath/ui-widgets-document-viewer`](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/document-viewer).

From rc.4:

- **Single-instance field groups** in IXP taxonomies (a nullable `object`)
  render as one row; such a taxonomy failed to load before.
- **New compact UI, on by default:** a _No taxonomy defined_ state (text via
  `options.emptyTaxonomyMessage`), a _Duplicate row_ action and column freezing
  in the table editor, and a **Shift+N** shortcut to the next flagged value.

From rc.3:

- **The IXP representation.** `ValidationStation` takes an IXP document — a
  Flow `processedDocument`, or `IxpDocumentArtifacts` — see
  [IXP documents](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/data-sources.md#ixp-processeddocument).
- **`HideHighlightRow`** on `FeatureCustomization` (compact mode) hides the
  _Highlight row_ action from each field group row's menu.
- The compact fields form's expand / collapse-all control is redesigned, and
  reads _Expand all field groups_ / _Collapse all field groups_.

From rc.2:

- **New compact UI, on by default:** a field-filter toolbar (trim or remove it
  with `options.fieldFilterOptions`), expandable field groups, a line-number
  column in the table editor, and a _Waiting for input_ screen until the
  document data arrives.
- **`HideConfidence` now applies in compact mode too**, and is deprecated in
  favour of `IgnoreConfidence` (either one takes confidence out of the
  experience). A `customizationInfo` that already sets it will now hide the
  confidence indicator in compact.
- **`fonts.css` carries Material Icons only** — see [Fonts](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/hosting.md#fonts).
- **New options:** `fieldFilterOptions`, `defaultFieldsAreaPercentage` /
  `defaultFieldsAreaWidth`, and `documentViewerOptions` for the embedded viewer
  (with the new `hideExtractedTokensToggle` / `hideLanguageSelect` flags).
- **New output on this package:** `onWcMessage` — see
  [Rendering your own value-indicator overlay](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/events-and-commands.md#rendering-your-own-value-indicator-overlay).
- **`@uipath/uipath-typescript` `>= 1.5.1`** is now required — the web component
  declares it as a peer dependency.

## Migrating from 1.0.x

Four things changed since `1.0.1`, ordered by how loudly they fail.

<!-- details warning: The web component now loads from a URL -->

`1.0.x` imported the web component as a bare module specifier, which put a prebuilt Angular bundle into your module graph and made its assets your bundler's problem. It now loads at runtime from a hosted URL, so you must call `configureValidationStationWc` once before rendering any widget from this package:

```diff
+ import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";
+
+ configureValidationStationWc();
```

Miss it and nothing renders. See [Hosting the web component](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/hosting.md) for the `deploymentUrl` default and when to override it.

**Delete your 1.0.x bundler setup.** None of it applies any more, and what it produces is no longer read:

- the build-time `du-assets` / `media` / CSS copy plugin
- `optimizeDeps.exclude` for `@uipath/du-validation-station-wc`
- any dev-server middleware that intercepted the component's raw `fetch("styles.css")` by sniffing `Sec-Fetch-Dest`
<!-- /details -->

<!-- details warning: Save callbacks are unified -->

`1.0.x` had one pair of callbacks meaning "the widget persisted it" and another meaning "over to you", chosen by an unrelated input. There is now one callback per user action. It always carries the request, and takes the outcome as an optional second argument, present exactly when the widget did the write-back itself:

```diff
- onSubmitComplete={(result) => …}
- onSaveAsDraftComplete={(result) => …}
- onReportExceptionComplete={(documentId, reason) => …}
- onSaveValidatedDataRequest={(request) => …}
- onSaveValidatedDataAsDraftRequest={(request) => …}
+ onSubmit={(request, result) => …}
+ onSaveAsDraft={(request, result) => …}
+ onReportException={(request) => …}
```

**Check the first parameter, not just the name.** The old callbacks took the result first, the new ones take the request. A rename that leaves the body alone reads `success` off the wrong object — and does it silently wherever the handler isn't type-checked.

`onReportException` no longer receives `(documentId, reason)`; the reason is at `request.exceptionReport.Reason`. The widget still never persists that flow, so it has no `result` argument at all.

<!-- /details -->

<!-- details warning: The folder comes from `ContentValidationData` -->

The `folderId` prop is gone. The folder now travels on `ContentValidationData` itself, as `FolderId` or `FolderKey` — the activity that produces the payload sets one of them, so in the common case there is nothing to pass and nothing to wire up.

```diff
- <ValidationStation sdk={sdk} data={data} folderId={folderId} />
+ <ValidationStation sdk={sdk} data={data} />
```

The four exported helpers lost the same parameter:

```diff
- fetchDuDocumentArtifacts(sdk, data, folderId)
- useDuDocumentArtifacts(sdk, data, folderId)
- submitValidatedData(sdk, data, folderId, request)
- saveValidatedDataAsDraft(sdk, data, folderId, request)
+ fetchDuDocumentArtifacts(sdk, data)
+ useDuDocumentArtifacts(sdk, data)
+ submitValidatedData(sdk, data, request)
+ saveValidatedDataAsDraft(sdk, data, request)
```

If you construct the object yourself, set `FolderId` or `FolderKey` — for example from the Action Center task's folder, which the SDK surfaces as `task.folderId`. Memoise the object you pass in, or the widget takes a new reference on every render and refetches the document each time.

<!-- /details -->

<!-- details note: Renamed exports -->

Same shapes, new names — a find-and-replace:

| 1.0.x                         | Now                      |
| ----------------------------- | ------------------------ |
| `useBucketArtifacts`          | `useDuDocumentArtifacts` |
| `BucketArtifacts`             | `DuDocumentArtifacts`    |
| `SubcomponentDataSource`      | `DuArtifactsSource`      |
| `SubcomponentStateEventProps` | `VsStateEventProps`      |

<!-- /details -->

<!-- details note: Nothing to do -->

`sdk` and `data` became optional, alongside the new `artifacts` / `documentId` props — existing calls that pass both keep working. See [Data sources](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/data-sources.md). `ValidationStation` also gained `persistent` plus fourteen state, command-result and panel callbacks; all are additive.

<!-- /details -->
