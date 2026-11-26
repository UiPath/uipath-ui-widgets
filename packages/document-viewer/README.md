# @uipath/ui-widgets-document-viewer

A React wrapper for the UiPath Document Understanding **document viewer** — the viewer of Validation Station and Classification Station, as a component of its own. It renders a digitised document's pages, its text, or both; lets the user search, zoom, rotate pages and select words or areas; highlights content references; and reports the user's selection as one. It handles web component loading and bucket artifact fetching.

It holds no extraction or classification data and edits nothing. Use it as a document preview, or next to a form of your own, and link the two through content references — the same shape an extracted value's `Reference` has.

## Installation

```bash
npm install @uipath/ui-widgets-document-viewer
```

### Peer dependencies

```bash
npm install react@^19.2.0 react-dom@^19.2.0 @uipath/uipath-typescript@^1.5.1
```

## Quick start

The viewer is a web component that this package loads at runtime, so it needs two things before it renders: its files hosted next to your app, and one call to `configureDocumentViewerWc`.

**1. Host the web component's files.** For Vite, copy them into `public/` before `dev` and `build`, and keep the copy out of git:

```jsonc
// package.json
"scripts": {
  "stage-dv-wc": "rm -rf public/du-dv-wc && cp -R node_modules/@uipath/du-document-viewer-wc public/du-dv-wc",
  "predev": "npm run stage-dv-wc",
  "prebuild": "npm run stage-dv-wc"
}
```

```gitignore
public/du-dv-wc
```

**2. Load it once, at app startup.** `includeFonts: true` loads the Material Icons the viewer's buttons use; leave it out only if your app already loads them. The returned promise is the only place a load failure surfaces.

```tsx
import { configureDocumentViewerWc } from "@uipath/ui-widgets-document-viewer";

configureDocumentViewerWc({ includeFonts: true }).catch((error) =>
  console.error("Document viewer failed to load", error),
);
```

**3. Render it** with an SDK instance and a Validation Station or Classification Station task's data:

```tsx
import { DocumentViewer } from "@uipath/ui-widgets-document-viewer";

function Preview({ sdk, task }) {
  // task.data is the task's ContentValidationData (or CsContentValidationData).
  return <DocumentViewer sdk={sdk} data={task.data} />;
}
```

> **Note: Theming**
> Add either a `light` or `dark` class to your HTML `<body>` element to enable proper theming.

The default `deploymentUrl` is `du-dv-wc` under your app's base path, so the same setup works in a local Vite app and in a deployed UiPath Coded App. To serve the files elsewhere, see [Hosting the web component](#hosting-the-web-component).

## Data sources

| Mode              | Pass           | Who fetches                                                                               |
| ----------------- | -------------- | ----------------------------------------------------------------------------------------- |
| **Self-fetching** | `sdk` + `data` | The widget: `DocumentObjectModelPath`, plus `EncodedDocumentPath` and `TextPath` when set |
| **Pre-fetched**   | `artifacts`    | You — hand it `{ dom, original, text }`                                                   |

`data` is any object with the bucket fields the viewer reads (`DocumentViewerContentData`): a Validation Station task's `ContentValidationData` and a Classification Station task's `CsContentValidationData` both qualify, as they are.

| Field                     | Required    | Read for                                         |
| ------------------------- | ----------- | ------------------------------------------------ |
| `BucketId`                | Yes         | Every bucket read                                |
| `FolderKey` or `FolderId` | One of them | The folder scope; `FolderKey` wins when both set |
| `DocumentObjectModelPath` | Yes         | The DOM. Nothing renders without it              |
| `EncodedDocumentPath`     | No          | `original`, for the page view                    |
| `TextPath`                | No          | `text`, for the text view                        |
| `DocumentId`              | No          | Telling documents apart while a new one loads    |

A missing required field renders an error instead of fetching. Every new `data` object triggers a new fetch, so pass a stable reference — React state or a memoized value, never an object literal built during render.

`artifacts` takes the `dom`, `original` and `text` members of the Validation Station's `DuDocumentArtifacts` or the Classification Station's `CsDocumentArtifacts`, so artifacts you already fetched for a station can be passed as they are. `original` (a base64 data URL, not a Blob or an http URL) enables the page view, `text` the text view; with both, the user can switch.

| Export                                | Use                                                                                                                                                 |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetchDvDocumentArtifacts(sdk, data)` | Fetch `DvDocumentArtifacts` imperatively — outside render, ahead of time                                                                            |
| `useDvDocumentArtifacts(sdk, data)`   | The same fetch as a hook. Returns `{ artifacts, error }`; `artifacts` is `null` until the fetch finishes, and `error` is a message string or `null` |

### Loading and errors

Until the artifacts are fetched and the web component is loaded, the viewer renders a plain `Loading...` element; a failed fetch renders `Failed to load document artifacts: <message>` in its place. Neither is styled or replaceable — to show your own states, fetch with `useDvDocumentArtifacts` and render `DocumentViewer` with `artifacts` once they are ready.

If the web component itself fails to load, the viewer stays on `Loading...`: the error surfaces only on the promise `configureDocumentViewerWc` returns, so handle it there.

## Supported formats

The page view renders `original`, and picks a renderer from its data URL's MIME type:

| Format                    | MIME type                               | Page view                                                    |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------ |
| PDF                       | `application/pdf`                       | All pages                                                    |
| JPEG, PNG, WebP           | `image/jpeg`, `image/png`, `image/webp` | Single-page images                                           |
| TIFF, BMP, GIF and others | —                                       | Not rendered: the page stays blank and `onReady` never fires |

There is no automatic fallback to the text view, which does not depend on the original's format. To show a document whose original is not supported, check the MIME type and leave `original` out:

```tsx
const PAGE_VIEW_TYPES = /^data:(application\/pdf|image\/(jpeg|png|webp))[;,]/i;

const { artifacts } = useDvDocumentArtifacts(sdk, data);
const viewable = artifacts && {
  ...artifacts,
  original: PAGE_VIEW_TYPES.test(artifacts.original ?? "")
    ? artifacts.original
    : undefined,
};

return viewable ? <DocumentViewer artifacts={viewable} /> : <Spinner />;
```

With `original` left out and `text` set, the viewer opens in text view.

## Linking it to a form

The viewer is linked through content references, in and out. A reference is a `DuFramework.ResultsContentReference` — the `Reference` of each value in an extraction result's `ResultsDocument.Fields`. This package holds no extraction result, so the fields come from your own source:

```tsx
import { useMemo, useState } from "react";
import { DocumentViewer } from "@uipath/ui-widgets-document-viewer";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";

function Review({
  sdk,
  data,
  fields,
}: {
  sdk: UiPath;
  data: DuFramework.ContentValidationData;
  fields: DuFramework.ResultsDataPoint[];
}) {
  const [selected, setSelected] =
    useState<DuFramework.ResultsContentReference | null>(null);
  // Memoized: a new array redraws every passive highlight.
  const references = useMemo(
    () =>
      fields.flatMap((f) => (f.Values ?? []).flatMap((v) => v.Reference ?? [])),
    [fields],
  );

  return (
    <>
      <DocumentViewer
        sdk={sdk}
        data={data}
        highlightReference={selected}
        passiveReferences={references}
        // The user's selection; empty `reference.Tokens` means it was cleared.
        onReferenceSelect={({ text, reference }) =>
          console.log(text, reference.Tokens)
        }
      />
      <ul>
        {fields.map((f) => (
          <li
            key={f.FieldId}
            onClick={() => setSelected(f.Values?.[0]?.Reference ?? null)}
          >
            {f.FieldName}: {f.Values?.[0]?.Value}
          </li>
        ))}
      </ul>
    </>
  );
}
```

With the Validation Station package, its artifacts carry the extraction result (`artifacts.extractionResult.ResultsDocument.Fields`), and its `CompactFieldsForm` reports the clicked value through `onFieldValueSelected` — pass `e.FieldValue?.Reference` to `highlightReference`.

> **Note: Linking through `instanceId`**
> This viewer cannot share a store with the Validation Station subcomponents through `instanceId` yet. When you need that — selecting a field highlights it, a rule click focuses its value, with nothing wired by hand — keep the Validation Station's own (deprecated) `DocumentViewer` subcomponent.

## Props

| Prop                 | Type                                         | Default   | Description                                                                                                    |
| -------------------- | -------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------- |
| `sdk`                | `UiPath`                                     | —         | SDK instance. Required for self-fetching                                                                       |
| `data`               | `DocumentViewerContentData`                  | —         | A task's bucket descriptor. Required for self-fetching                                                         |
| `artifacts`          | `DvDocumentArtifacts`                        | —         | Pre-fetched `{ dom, original, text }`. When supplied, no fetch is performed                                    |
| `theme`              | `DvTheme`                                    | `'light'` | `'light'`, `'dark'`, `'light-hc'`, `'dark-hc'`, or the Apollo Modern `'future-light'` / `'future-dark'`        |
| `language`           | `DocumentViewerLanguage`                     | `English` | UI language                                                                                                    |
| `options`            | `DocumentViewerOptions`                      | —         | Which controls show and how selection behaves — see below                                                      |
| `highlightReference` | `ResultsContentReference \| null`            | —         | Highlights and scrolls to it; `null` clears the highlight                                                      |
| `passiveReferences`  | `readonly ResultsContentReference[] \| null` | —         | Drawn as a passive highlight, e.g. every extracted value. The user can hide it from the viewer menu            |
| `outlineReference`   | `ResultsContentReference \| null`            | —         | Outlines it, e.g. the value hovered in another component; `null` clears it                                     |
| `goToPage`           | `GoToPage`                                   | —         | `{ target: 2 }` or `'next'`, `'previous'`, `'first'`, `'last'`. Pass a **new object** for every navigation     |
| `persistent`         | `boolean`                                    | `false`   | Renders the persistent element variant, which survives portal/DOM detachment and is force-destroyed on unmount |
| `className`, `style` |                                              | —         | Set on the element                                                                                             |

`options` is the same `DocumentViewerOptions` object the Validation Station takes as `options.documentViewerOptions` and the Classification Station as `documentViewerOptions`: `floatingButtonsOptions` (`hideTextView`, `hideInteractionTypeButton`, `defaultInteractionType`, `hideSearch`, `hideKeyboardShortcutsButton`, `hideSwitchPanelSidesButton`, `hideExtractedTokensToggle`), `autoRotationThreshold` and `disableSelection`. Pass a new object to change it.

## Outputs

| Prop                  | Fires when                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `onReady`             | The document is rendered                                                                                |
| `onPageCountChange`   | The document is rendered; detail is the page count                                                      |
| `onCurrentPageChange` | Another page comes into view (1-based), and once with the initial page                                  |
| `onTextModeChange`    | The user switches to the text view (`true`) or back                                                     |
| `onGoToPageResult`    | A `goToPage` command finished; `pageNumber` is the page reached, or `-1` when it failed                 |
| `onReferenceSelect`   | The user selects words or clears the selection: `{ text, reference }`, with empty `Tokens` when cleared |
| `onSwitchPanelSides`  | The user asks to move the viewer to the other side of your layout. The element does not move itself     |

## Language enum

`DocumentViewerLanguage` lists the 14 languages the viewer ships translations for: `German` (`de`), `English` (`en`), `Spanish` (`es`), `SpanishMexico` (`es-MX`), `French` (`fr`), `Japanese` (`ja`), `Korean` (`ko`), `Portuguese` (`pt`), `PortugueseBrazil` (`pt-BR`), `Romanian` (`ro`), `Russian` (`ru`), `Turkish` (`tr`), `ChineseSimplified` (`zh-CN`), `ChineseTraditional` (`zh-TW`).

## Hosting the web component

`configureDocumentViewerWc` loads `@uipath/du-document-viewer-wc` at runtime from a URL rather than bundling it — it resolves its own `du-assets/` (pdf.js, decoders, translations) and `media/` (fonts) relative to where `main.js` is served.

| Option          | Default                               | Description                                                                                                   |
| --------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `deploymentUrl` | `du-dv-wc` joined onto `getAppBase()` | Base URL the web component's files are served from. A string, or a `() => string \| Promise<string>` resolver |
| `includeFonts`  | `false`                               | Injects the component's `fonts.css` (Material Icons) as a light-DOM stylesheet                                |

Serve the **whole** contents of `node_modules/@uipath/du-document-viewer-wc` at that URL — for Vite, copy it into `public/du-dv-wc` before `dev` and `build`. Without `du-assets/`, rendering and translations fail silently. Keep the staged copy out of git and in step with the version this package's types are built against (`1.0.0-beta.1`).

The notes in the Validation Station README's [Hosting the web component](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#hosting-the-web-component) apply here as well: call it once, the returned promise is the error channel, `deploymentUrl` is a script source — never derive it from user input — and self-hosting needs no more than `script-src 'self'`.

### Fonts

`fonts.css` carries **Material Icons only**. The viewer's text inherits your app's font stack; install [`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts) and import its `font.css` for the UiPath typography.

## Exported types

```ts
import {
  configureDocumentViewerWc,
  DOCUMENT_VIEWER_TAG,
  DocumentViewer,
  DocumentViewerLanguage,
  fetchDvDocumentArtifacts,
  joinDeploymentUrl,
  useDvDocumentArtifacts,
} from "@uipath/ui-widgets-document-viewer";
import type {
  DocumentViewerContentData,
  DocumentViewerEventProps,
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  DocumentViewerProps,
  DocumentViewerSelection,
  DocumentViewerWcConfig,
  DvArtifactsSource,
  DvDocumentArtifacts,
  DvTheme,
  GoToPage,
  GoToPageResult,
  GoToPageTarget,
  InteractionType,
} from "@uipath/ui-widgets-document-viewer";
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
