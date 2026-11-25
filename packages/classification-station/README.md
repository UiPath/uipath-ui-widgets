# @uipath/ui-widgets-classification-station

A React wrapper for the UiPath Document Understanding **Classification Station** — the human-in-the-loop _split and classify_ step. It renders a file's pages next to the original document and lets a reviewer confirm or correct how the classifier split the file into documents, and which document type each one is. It handles web component loading and bucket artifact fetching, and exposes a declarative props API for the station's inputs and outputs.

It is the step before extraction; [`@uipath/ui-widgets-validation-station`](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station) reviews the extracted values of a document that has already been classified.

## Installation

```bash
npm install @uipath/ui-widgets-classification-station
```

### Peer dependencies

```bash
npm install react@^19.2.0 react-dom@^19.2.0 @uipath/uipath-typescript@^1.5.1
```

## Quick start

> **Note: Theming**
> Add either a `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import {
  configureClassificationStationWc,
  ClassificationStation,
  type CsContentValidationData,
} from "@uipath/ui-widgets-classification-station";
import { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState } from "react";

// Once, at app startup — loads the web component from `du-cs-wc`, next to
// your app's own root by default. See "Hosting the web component" below.
configureClassificationStationWc();

function App({ task }: { task: { data: CsContentValidationData } }) {
  const [sdk, setSdk] = useState<UiPath | null>(null);

  useEffect(() => {
    const init = async () => {
      const uipath = new UiPath({
        baseUrl: "https://api.uipath.com",
        orgName: "your-org",
        tenantName: "your-tenant",
        clientId: "your-client-id",
        // `OR.Buckets` is the widget's own need; `OR.Tasks` is for the host
        // code that fetches the task and completes it after submit.
        scope: "OR.Buckets OR.Tasks",
        redirectUri: "http://localhost:3000/callback",
      });
      await uipath.initialize();
      setSdk(uipath);
    };
    init();
  }, []);

  if (!sdk) return <div>Loading...</div>;

  return (
    <ClassificationStation
      sdk={sdk}
      data={task.data}
      onSubmit={(request, result) => {
        if (result?.success) completeTask(request.classification);
      }}
    />
  );
}
```

`theme` defaults to `"light"`, `language` to `ClassificationStationLanguage.English` and `enableSaveAsDraft` to `true`, so the minimal mount just needs `sdk` and `data`.

> **Warning: Call `configureClassificationStationWc` first**
> You must call it once before rendering `ClassificationStation`, and host the web component's files where it expects them. See [Hosting the web component](#hosting-the-web-component).

## Data sources

The widget needs the document types to classify into, the classification to review, a document DOM, and the document itself. There are two ways to give it those:

| Mode              | Pass                         | Who fetches                                                    | Who writes back                                     |
| ----------------- | ---------------------------- | -------------------------------------------------------------- | --------------------------------------------------- |
| **Self-fetching** | `sdk` + `data`               | The widget, from the bucket paths on `CsContentValidationData` | The widget, to `ValidatedClassificationResultsPath` |
| **Pre-fetched**   | `artifacts` (+ `documentId`) | You — hand it a `CsDocumentArtifacts` object you already hold  | You, from the request the widget emits              |

**The outputs do not change with the mode.** `onSubmit`, `onSaveAsDraft` and `onReportException` fire for every user action either way, and always carry the request the web component produced. When the widget persisted the classification itself, `onSubmit` and `onSaveAsDraft` get the outcome as a second argument.

The two modes can be mixed: pass `artifacts` **and** `sdk` + `data` to skip the fetch while keeping the built-in write-back.

Every bucket call is scoped to the folder `data` names — `FolderKey`, or `FolderId` when there is no key. If neither is there, the widget renders an error instead of fetching.

### What self-fetching reads and writes

It does what the cloud Classification Station in Action Center does, so either reopens what the other saved:

- **Reads** `TaxonomyPath` (for its `DocumentTypes`), `DocumentObjectModelPath`, `TextPath`, `EncodedDocumentPath`, `CustomizationInfoPath` when set (otherwise every customization is off), and the classification: `ValidatedClassificationResultsPath` once a reviewer has saved one, else `AutomaticClassificationResultsPath`.
- **Writes** submits and drafts alike to `ValidatedClassificationResultsPath`: the `Classifications` array, as a `.zip` holding one JSON file. A submit and a draft write the same file — what makes a submit final is the host completing the Action Center task.
- **Never** reports an exception: route `onReportException` yourself, typically via `OrchestratorDuModule.submitExceptionReport(...)`.

> **Info: `CsDocumentArtifacts`**
> `{ docTypes, classificationResults, dom, text, original, customizationInfo? }` — `docTypes` is the taxonomy's `DocumentTypes` array, not the taxonomy itself, and `original` is the document as a base64 data URL. `classificationResults: null` is meaningful: it loads an unclassified file.

### Owning the round-trip

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

## Hosting the web component

`configureClassificationStationWc` loads `@uipath/du-classification-station-wc` at runtime from a URL, rather than bundling it into your app — the bundle is several megabytes, and it resolves its own `du-assets/` (pdf.js, decoders, translations) and `media/` (fonts) relative to where `main.js` is served.

| Option          | Default                               | Description                                                                                                   |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `deploymentUrl` | `du-cs-wc` joined onto `getAppBase()` | Base URL the web component's files are served from. A string, or a `() => string \| Promise<string>` resolver |
| `includeFonts`  | `false`                               | Injects the component's `fonts.css` (Material Icons) as a light-DOM stylesheet                                |

Serve the **whole** contents of `node_modules/@uipath/du-classification-station-wc` at that URL — for Vite, copy it into `public/du-cs-wc` before `dev` and `build`. Without `du-assets/`, page rendering, thumbnails and translations 404 silently; without `media/`, `includeFonts` loads no fonts. Keep the staged copy out of git and in step with the version this package's types are built against (`1.0.0-rc.2`).

The notes in the Validation Station README's [Hosting the web component](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#hosting-the-web-component) apply here as well: call it once, the returned promise is the error channel, `deploymentUrl` is a script source — never derive it from user input — and self-hosting needs no more than `script-src 'self'`.

### Fonts

`fonts.css` in the npm package carries **Material Icons only** — the one font the component cannot do without. The component's text inherits your app's font stack; install [`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts) and import its `font.css` for the UiPath typography.

## Exported types

```ts
import {
  ClassificationStation,
  ClassificationStationLanguage,
  CLASSIFICATION_STATION_TAG,
  configureClassificationStationWc,
  fetchCsDocumentArtifacts,
  joinDeploymentUrl,
  saveClassificationAsDraft,
  submitClassification,
  useCsDocumentArtifacts,
} from "@uipath/ui-widgets-classification-station";
import type {
  ClassificationStationEventProps,
  ClassificationStationProps,
  ClassificationStationWcConfig,
  CsArtifactsSource,
  CsContentValidationData,
  CsDocumentArtifacts,
  CsSaveCallbacks,
  CsTheme,
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  IClassificationDocumentBoundsDTO,
  IClassificationResultDTO,
  IClassifierResultDTO,
  ICsSaveClassificationAsDraftRequest,
  ICsSaveClassificationRequest,
  ICsSaveExceptionReportRequest,
  ICustomizationInfoDTO,
  IFeatureCustomization,
  InteractionType,
  IReportAsExceptionDTO,
  SaveClassificationResult,
  SplitClassification,
  SplitClassifications,
} from "@uipath/ui-widgets-classification-station";
```

## Development

```bash
# Build
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## License

MIT
