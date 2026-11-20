# Data sources, props and outputs

> **Note: Applies to `@uipath/ui-widgets-classification-station` with web component `1.0.0-rc.2`.**
> Start with the [package README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/classification-station#readme) for install, hosting and a working Coded Action App.

## Data sources

The widget needs the document types to classify into, the classification to review, a document DOM, and the document itself. There are two ways to give it those:

| Mode              | Pass                         | Who fetches                                                    | Who writes back                                     |
| ----------------- | ---------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| **Self-fetching** | `sdk` + `data`               | The widget, from the bucket paths on `CsContentValidationData` | The widget, to `ValidatedClassificationResultsPath` |
| **Pre-fetched**   | `artifacts` (+ `documentId`) | You — hand it a `CsDocumentArtifacts` object you already hold  | You, from the request the widget emits              |

**The outputs do not change with the mode.** `onSubmit`, `onSaveAsDraft` and `onReportException` fire for every user action either way, and always carry the request the web component produced. When the widget persisted the classification itself, `onSubmit` and `onSaveAsDraft` get the outcome as a second argument.

The two modes can be mixed: pass `artifacts` **and** `sdk` + `data` to skip the fetch while keeping the built-in write-back.

Every bucket call is scoped to the folder `data` names — `FolderKey`, or `FolderId` when there is no key. If neither is there, the widget renders an error instead of fetching.

## What self-fetching reads and writes

It does what the cloud Classification Station in Action Center does, so either reopens what the other saved:

- **Reads** `TaxonomyPath` (for its `DocumentTypes`), `DocumentObjectModelPath`, `TextPath`, `EncodedDocumentPath`, `CustomizationInfoPath` when set (otherwise every customization is off), and the classification: `ValidatedClassificationResultsPath` once a reviewer has saved one, else `AutomaticClassificationResultsPath`.
- **Writes** submits and drafts alike to `ValidatedClassificationResultsPath`: the `Classifications` array, as a `.zip` holding one JSON file. A submit and a draft write the same file — what makes a submit final is the host completing the Action Center task.
- **Never** reports an exception: route `onReportException` yourself, typically via `OrchestratorDuModule.submitExceptionReport(...)`.

> **Info: `CsDocumentArtifacts`**
> `{ docTypes, classificationResults, dom, text, original, customizationInfo? }` — `docTypes` is the taxonomy's `DocumentTypes` array, not the taxonomy itself, and `original` is the document as a base64 data URL. `classificationResults: null` is meaningful: it loads an unclassified file.

## Owning the round-trip

Everything the widget does internally is exported, so a host can drive the same flow:

| Export                                          | Use                                                                                      |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fetchCsDocumentArtifacts(sdk, data)`           | Fetch `CsDocumentArtifacts` imperatively — outside render, ahead of time, or in a loader |
| `useCsDocumentArtifacts(sdk, data)`             | The same fetch as a hook                                                                 |
| `submitClassification(sdk, data, request)`      | The submit write-back to `ValidatedClassificationResultsPath`                            |
| `saveClassificationAsDraft(sdk, data, request)` | The draft write-back, to the same path                                                   |

```tsx
import {
  ClassificationStation,
  fetchCsDocumentArtifacts,
  submitClassification,
} from "@uipath/ui-widgets-classification-station";

const artifacts = await fetchCsDocumentArtifacts(sdk, data);

<ClassificationStation
  artifacts={artifacts}
  documentId={data.DocumentId}
  onSubmit={async (request) => {
    const result = await submitClassification(sdk, data, request);
    if (result.success) completeTask(request.classification);
  }}
/>;
```

## Props

| Prop                         | Type                            | Default   | Description                                                                                                    |
| ---------------------------- | ------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `sdk`                        | `UiPath`                        | —         | SDK instance. Required for self-fetching and the built-in write-back.                                          |
| `data`                       | `CsContentValidationData`       | —         | The classification task's bucket descriptor. Required for self-fetching.                                       |
| `artifacts`                  | `CsDocumentArtifacts`           | —         | Pre-fetched artifacts. When supplied, no fetch is performed.                                                   |
| `documentId`                 | `string`                        | —         | Falls back to `data.DocumentId`. The element waits for it, so the widget assigns it after every other input.   |
| `theme`                      | `CsTheme`                       | `'light'` | `'light'`, `'dark'`, `'light-hc'`, `'dark-hc'`, or the Apollo Modern `'future-light'` / `'future-dark'`        |
| `language`                   | `ClassificationStationLanguage` | `English` | UI language                                                                                                    |
| `isReadonly`                 | `boolean`                       | `false`   | Renders without editing affordances                                                                            |
| `enableSaveAsDraft`          | `boolean`                       | `true`    | Offers a **Save as draft** action                                                                              |
| `persistent`                 | `boolean`                       | `false`   | Renders the persistent element variant, which survives portal/DOM detachment and is force-destroyed on unmount |
| `documentViewerOptions`      | `DocumentViewerOptions`         | —         | The embedded viewer's chrome and selection behaviour — the same object the other DU widgets take               |
| `enableTokenFeatures`        | `boolean`                       | `true`    | Token-level selection in the viewer. Off, the selection-mode button and the search are hidden                  |
| `allowNotClassifiedGroups`   | `boolean`                       | `true`    | Lets pages stay unassigned to any document type                                                                |
| `supportNotClassifiedGroups` | `boolean`                       | `false`   | Renders a dedicated "not classified" group for unassigned pages                                                |
| `customNotClassifiedLabel`   | `string`                        | —         | Overrides that group's label. Pass it already localized                                                        |
| `disableShortcutsPanel`      | `boolean`                       | `false`   | Hides the keyboard-shortcuts panel                                                                             |
| `showCreateNewDocTypeOption` | `boolean`                       | `false`   | Offers "create a new document type" in the type picker; see `onCreateNewDocType`                               |
| `pdfSettings`                | `unknown`                       | —         | PDF viewer settings (`IPDFSettings`)                                                                           |
| `pageUris`                   | `string[]`                      | —         | Pre-rendered page images, one per page, used instead of rendering the PDF                                      |
| `className`, `style`         |                                 | —         | Set on the element                                                                                             |

Unset inputs are not assigned, so the element keeps its own defaults. Customization flags — `EnablePageReordering`, `DisableKeyboardShortcuts` — live under `FeatureCustomization` in `artifacts.customizationInfo` (typed `ICustomizationInfoDTO`).

## Outputs

| Prop                     | Fires when                                                                                                     |
| ------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `onSubmit`               | The user pressed **Save**. `(request: ICsSaveClassificationRequest, result?)`                                  |
| `onSaveAsDraft`          | The user pressed **Save as draft**. `(request: ICsSaveClassificationAsDraftRequest, result?)`                  |
| `onReportException`      | The user reported the file as an exception. `(request: ICsSaveExceptionReportRequest)` — always yours to route |
| `onDirtyChange`          | Unsaved changes appear or are cleared. A flag set by any edit — gate an "unsaved work" prompt on it            |
| `onHasChangesChange`     | The classification differs structurally from the one loaded (group count, types, page counts, page positions)  |
| `onSplitClassifications` | The current split changed: `{ split: [{ documentTypeId, pageRange: '1-3,5' }] }`                               |
| `onCreateNewDocType`     | The user asked to create a new document type (needs `showCreateNewDocTypeOption`); the creation flow is yours  |

`dirty` and `hasChanges` are different signals and neither is derived from the other: assigning an OCR reference to a group sets `dirty` but not `hasChanges`.

> **Attention: Re-feeding the data is destructive**
> The element compares its inputs by reference. A new `classificationResults` (a new `artifacts` or `data`) replaces the loaded groups wholesale, discarding unsaved edits and the selection. Keep the object stable across renders — React state — and persist pending edits before you switch documents.

## Language enum

`ClassificationStationLanguage` lists the 14 languages the station ships translations for: `German` (`de`), `English` (`en`), `Spanish` (`es`), `SpanishMexico` (`es-MX`), `French` (`fr`), `Japanese` (`ja`), `Korean` (`ko`), `Portuguese` (`pt`), `PortugueseBrazil` (`pt-BR`), `Romanian` (`ro`), `Russian` (`ru`), `Turkish` (`tr`), `ChineseSimplified` (`zh-CN`), `ChineseTraditional` (`zh-TW`).
