# PDF Viewer - Architecture

## Overview

A React PDF viewer widget for UiPath coded apps. Renders PDFs from Orchestrator Storage Buckets, Data Fabric entity attachments, or plain URLs/Blobs — including password-protected documents (in-viewer prompt). Built on `react-pdf` (Mozilla pdf.js) with the worker **shipped inside this package** (no CDN) so it works behind enterprise CSP on `*.uipath.host`.

## Component Structure

- **PdfViewer** (`PdfViewer.tsx`) — toolbar + document canvas + loading/error/empty states; apollo-wind `Button` for controls.
- **PasswordPrompt** (`PasswordPrompt.tsx`) — in-viewer password form for protected documents (wired to react-pdf's `onPassword`; replaces the browser-native `window.prompt`).
- **icons/** — one SVG component per icon (repo convention; no icon library dependency).
- **useResolvedSource** (`sources/useResolvedSource.ts`) — resolves a `PdfViewerSource` into a renderable file (`Blob` or URL string). All SDK access lives here, plus `getSourceType()` / `getSourceKey()`.
- **pdfWorker** (`pdfWorker.ts`) — side-effect module configuring `pdfjs.GlobalWorkerOptions.workerSrc` as `new URL("./pdf.worker.min.mjs", import.meta.url)`. The worker file is **copied into `dist/` at build time** from the exact-pinned `pdfjs-dist` (`scripts/copy-worker.mjs`, which fails the build on version drift). Production bundlers emit it as a same-origin asset; dev servers serve it straight from `node_modules` — zero consumer configuration. Never replace this with a CDN URL.
- **utils/telemetryUtils.ts** — `trackTelemetry()` helper injecting `ApplicationName`/`WidgetVersion` (mirrors datatable).
- **types.ts** — `PdfViewerProps`, the `PdfViewerSource` union, and the `PdfViewerSourceType` / `TelemetryService` / `TelemetryStatus` enums.

## Source resolution (Data Flow)

```
source prop — kind inferred from the fields present (`type` is optional,
never read at runtime; set it with the PdfViewerSourceType enum if desired)
  ├─ { url }      → passed straight to react-pdf (it downloads; CORS applies)
  ├─ { data }     → normalized to a typed Blob (ArrayBuffer wrapped)
  ├─ { bucketId } → BucketService.getReadUri(bucketId, path, {folderId|folderKey|folderPath})
  │                  (the SDK's preferred positional overload; the
  │                   options-object form is deprecated in the SDK)
  │                  → fetch(uri, {headers}) → Blob             (requires sdk)
  ├─ { entityId } → Entities.downloadAttachment(entityId, recordId, fieldName)
  │                  → Blob                                      (requires sdk)
  └─ (none of the above — untyped JS misuse) → classified "unknown",
     rejected with a descriptive error on the widget's error card
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

| Prop            | Type                      | Required | Description                                                               |
| --------------- | ------------------------- | -------- | ------------------------------------------------------------------------- |
| `source`        | `PdfViewerSource`         | Yes      | bucket / entity / url / blob (kind inferred from fields)                  |
| `sdk`           | `UiPath`                  | No\*     | \*Required at runtime for bucket/entity                                   |
| `toolbar`       | `PdfViewerToolbarOptions` | No       | Per-feature toggles, default all on; disable all four to hide the toolbar |
| `fileName`      | `string`                  | No       | Toolbar label + download name                                             |
| `maxHeight`     | `number \| string`        | No       | Canvas max height (default 640), scrolls internally                       |
| `onLoadSuccess` | `({ numPages }) => void`  | No       | Load callback                                                             |
| `onLoadError`   | `(error) => void`         | No       | Fetch or render failure callback                                          |

## State Management

| State             | Purpose                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `numPages`        | Total pages from `onLoadSuccess`                                                              |
| `pageNumber`      | Current page (single-page view)                                                               |
| `scale`           | Zoom 0.5–3.0 (fit-to-width computes from container + natural page width)                      |
| `rotation`        | 0/90/180/270, clockwise steps                                                                 |
| `retryKey`        | Bumps to re-resolve + remount after errors                                                    |
| `renderError`     | pdf.js render failures (fetch errors live in the resolver state)                              |
| `passwordRequest` | Pending pdf.js password callback — `<Document>` stays mounted (hidden) while the prompt is up |

## Telemetry

`TelemetryService` / `TelemetryStatus` enums (`Widget.PdfViewer`): `PDFV.LoadDocument` usage (SourceType, NumPages) / error (Stage: fetch|render), `PDFV.DownloadFile` usage/error. `trackTelemetry()` mirrors the datatable pattern.

## Embedding contract (coded action apps)

Designed for a narrow split pane beside a form: fills its container (`w-full`),
canvas scrolls internally under `maxHeight`, toolbar wraps at narrow widths,
failures stay inside the widget's box. Verified by the `EmbeddedInActionApp`
Storybook story (~480px pane) and live on an alpha coded action app inside
Action Center's sandboxed CSP iframe.
