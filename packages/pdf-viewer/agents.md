# PDF Viewer - Architecture

## Overview

A React PDF viewer widget for UiPath coded apps. Renders PDFs from Orchestrator Storage Buckets, Data Fabric entity attachments, or plain URLs/Blobs. Built on `react-pdf` (Mozilla pdf.js) with the worker bundled locally (no CDN) so it works behind enterprise CSP on `*.uipath.host`.

## Component Structure

- **PdfViewer** (`PdfViewer.tsx`) — toolbar + document canvas + loading/error/empty states. Inline SVG icons (the repo has no icon library dependency); apollo-wind `Button` for controls.
- **useResolvedSource** (`sources/useResolvedSource.ts`) — resolves a `PdfViewerSource` into a renderable file (`Blob` or URL string). All SDK access lives here.
- **pdfWorker** (`pdfWorker.ts`) — side-effect module configuring `pdfjs.GlobalWorkerOptions.workerSrc` via `new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url)`. The package builds with plain `tsc`, so this line survives into `dist/` untouched and is resolved by the **consumer's** bundler (Vite/webpack 5), which copies the worker into the app's own build output — same-origin, version-pinned. Never replace this with a CDN URL.
- **types.ts** — `PdfViewerProps`, the `PdfViewerSource` discriminated union, `TelemetryConstants`.

## Source resolution (Data Flow)

```
source prop (discriminated union)
  ├─ { type:"url" }    → passed straight to react-pdf (it downloads; CORS applies)
  ├─ { type:"blob" }   → normalized to a typed Blob (ArrayBuffer wrapped)
  ├─ { type:"bucket" } → BucketService.getReadUri(bucketId, path, {folderId})
  │                       → fetch(uri, {headers}) → Blob        (requires sdk)
  └─ { type:"entity" } → Entities.downloadAttachment(entityId, recordId, fieldName)
                          → Blob                                 (requires sdk)
  → react-pdf <Document file={...}> → <Page> (canvas + text layer + annotations)
```

- `getSourceKey()` gives each source a stable identity so consumers passing
  inline object literals don't retrigger fetches every render (the classic
  react-pdf `file`-prop identity trap, solved inside the widget).
- Missing `sdk` for bucket/entity sources → the widget renders its own error
  state (never throws into the host app).
- `retryKey` (bumped by the Retry button) re-runs resolution and remounts
  `<Document>`.

## Props

| Prop            | Type                                 | Required | Description                                         |
| --------------- | ------------------------------------ | -------- | --------------------------------------------------- |
| `source`        | `PdfViewerSource`                    | Yes      | bucket / entity / url / blob (union)                |
| `sdk`           | `UiPath`                             | No\*     | \*Required at runtime for bucket/entity             |
| `toolbar`       | `boolean \| PdfViewerToolbarOptions` | No       | Feature toggles; default all on                     |
| `fileName`      | `string`                             | No       | Toolbar label + download name                       |
| `maxHeight`     | `number \| string`                   | No       | Canvas max height (default 640), scrolls internally |
| `onLoadSuccess` | `({ numPages }) => void`             | No       | Load callback                                       |
| `onLoadError`   | `(error) => void`                    | No       | Fetch or render failure callback                    |

## State Management

| State         | Purpose                                                                  |
| ------------- | ------------------------------------------------------------------------ |
| `numPages`    | Total pages from `onLoadSuccess`                                         |
| `pageNumber`  | Current page (single-page view)                                          |
| `scale`       | Zoom 0.5–3.0 (fit-to-width computes from container + natural page width) |
| `rotation`    | 0/90/180/270, clockwise steps                                            |
| `retryKey`    | Bumps to re-resolve + remount after errors                               |
| `renderError` | pdf.js render failures (fetch errors live in the resolver state)         |

## Telemetry

`TelemetryConstants` (`Widget.PdfViewer`): `PDFV.LoadDocument` usage (SourceType, NumPages) / error (Stage: fetch|render), `PDFV.DownloadFile` usage/error. Follows the multi-file-upload pattern.

## Embedding contract (coded action apps)

Designed for a narrow split pane beside a form: fills its container (`w-full`),
canvas scrolls internally under `maxHeight`, toolbar wraps at narrow widths,
failures stay inside the widget's box. Verified by the `EmbeddedInActionApp`
Storybook story (~480px pane).
