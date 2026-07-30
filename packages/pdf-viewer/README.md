# @uipath/ui-widgets-pdf-viewer

A React PDF viewer widget for UiPath coded apps. Renders PDFs from **Orchestrator Storage Buckets**, **Data Fabric entity attachments**, or plain **URLs/Blobs** — with a prop-toggleable toolbar, selectable text, and built-in loading/error states.

Built on [react-pdf](https://www.npmjs.com/package/react-pdf) (Mozilla pdf.js). The pdf.js worker is **bundled locally** (no CDN), so the widget works behind enterprise CSP/firewalls — e.g. coded apps deployed on `*.uipath.host` — and UiPath owns the dependency update cadence.

## Installation

```bash
npm install @uipath/ui-widgets-pdf-viewer
```

## Usage

```tsx
import { PdfViewer } from "@uipath/ui-widgets-pdf-viewer";
import "@uipath/ui-widgets-pdf-viewer/PdfViewer.css";
import { UiPath } from "@uipath/uipath-typescript";

function App() {
  const sdk = new UiPath({
    // SDK configuration (or `new UiPath()` inside a coded app)
  });

  return (
    <PdfViewer
      sdk={sdk}
      source={{
        type: "bucket",
        bucketId: 123,
        folderId: 456,
        path: "invoices/inv-0714.pdf",
      }}
    />
  );
}
```

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

### Sources

One `source` prop, four shapes (a discriminated union — the `type` field selects which other fields apply):

```tsx
// Orchestrator storage bucket (requires `sdk`)
<PdfViewer sdk={sdk} source={{ type: "bucket", bucketId, folderId, path }} />

// Data Fabric entity file field (requires `sdk`)
<PdfViewer sdk={sdk} source={{ type: "entity", entityId, recordId, fieldName }} />

// Plain URL — same-origin or CORS-accessible (no sdk needed)
<PdfViewer source={{ type: "url", url: signedUrl }} />

// Pre-fetched bytes from your own data store (no sdk needed)
<PdfViewer source={{ type: "blob", data: blobOrArrayBuffer }} />
```

## Props

| Prop            | Type                                   | Required | Description                                                                                                     |
| --------------- | -------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------- |
| `source`        | `PdfViewerSource`                      | Yes      | Where the PDF lives (see Sources above)                                                                         |
| `sdk`           | `UiPath`                               | No\*     | Initialized UiPath SDK instance. \*Required for `bucket`/`entity` sources                                       |
| `toolbar`       | `boolean \| PdfViewerToolbarOptions`   | No       | `false` hides the toolbar; per-feature toggles: `pagination`, `zoom`, `rotate`, `download` (all default `true`) |
| `fileName`      | `string`                               | No       | Name shown in the toolbar and used for downloads                                                                |
| `maxHeight`     | `number \| string`                     | No       | Max canvas height (default `640`); the canvas scrolls internally                                                |
| `onLoadSuccess` | `(info: { numPages: number }) => void` | No       | Called when the document loads                                                                                  |
| `onLoadError`   | `(error: Error) => void`               | No       | Called when fetching or rendering fails                                                                         |

## Features

- Page navigation (prev/next + direct page entry)
- Zoom 50%–300%, fit-to-width, 90° rotation
- Download the original file
- Selectable/copyable text (pdf.js text layer) and clickable in-PDF links
- Loading, error (with Retry), and empty states built in
- Container-sized: fills its parent and scrolls internally — designed for
  embedding beside other content (e.g. an approval form in a coded action app)
- Telemetry (`Widget.PdfViewer`) for document load success/failure and downloads

## Development

```bash
npm run test        # vitest unit tests
npm run build       # tsc + compiled CSS → dist/
npm run storybook   # from the repo root — see Components/PdfViewer
```
