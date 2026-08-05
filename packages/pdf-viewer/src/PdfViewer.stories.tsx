import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiPath } from "@uipath/uipath-typescript/core";
import { pdfjs } from "react-pdf";
import "./PdfViewer.scss";
import { PdfViewer } from "./PdfViewer";

// Storybook consumes the widget's *source*, where the packaged worker file
// (copied into dist/ at build time — see scripts/copy-worker.mjs) doesn't
// exist next to pdfWorker.ts. Resolve it from pdfjs-dist via the bundler
// instead — the same one-line override documented for consumers with
// non-standard setups. Runs after the widget's own default (import order).
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

/**
 * A tiny 3-page PDF embedded as base64 so the default stories render
 * offline (no network, no backend) — safe for CI and docs builds.
 */
const SAMPLE_PDF_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUiA1IDAgUiA3IDAgUl0gL0NvdW50IDMgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA2MTIgNzkyXSAvQ29udGVudHMgNCAwIFIgL1Jlc291cmNlcyA8PCAvRm9udCA8PCAvRjEgOSAwIFIgPj4gPj4gPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxOTAgPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgo3MiA3MjAgVGQKKFRlc3QgUERGIC0gUGFnZSAxKSBUagowIC0zNCBUZAooKSBUagowIC0zNCBUZAooUExULTEwNDE1NyBQZGZWaWV3ZXIgd2lkZ2V0KSBUagowIC0zNCBUZAooUmVuZGVyaW5nIGNoZWNrOiB0ZXh0IGxheWVyLCkgVGoKMCAtMzQgVGQKKHpvb20sIHJvdGF0aW9uLCBuYXZpZ2F0aW9uLikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago1IDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gL0NvbnRlbnRzIDYgMCBSIC9SZXNvdXJjZXMgPDwgL0ZvbnQgPDwgL0YxIDkgMCBSID4+ID4+ID4+CmVuZG9iago2IDAgb2JqCjw8IC9MZW5ndGggMTkwID4+CnN0cmVhbQpCVAovRjEgMjQgVGYKNzIgNzIwIFRkCihUZXN0IFBERiAtIFBhZ2UgMikgVGoKMCAtMzQgVGQKKCkgVGoKMCAtMzQgVGQKKFRoaXMgcGFnZSB2ZXJpZmllcyBtdWx0aS1wYWdlKSBUagowIC0zNCBUZAoobmF2aWdhdGlvbiBcKE5leHQgLyBQcmV2aW91cyAvKSBUagowIC0zNCBUZAooRmlyc3QgLyBMYXN0IGJ1dHRvbnNcKS4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNyAwIG9iago8PCAvVHlwZSAvUGFnZSAvUGFyZW50IDIgMCBSIC9NZWRpYUJveCBbMCAwIDYxMiA3OTJdIC9Db250ZW50cyA4IDAgUiAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA5IDAgUiA+PiA+PiA+PgplbmRvYmoKOCAwIG9iago8PCAvTGVuZ3RoIDE4NSA+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjcyIDcyMCBUZAooVGVzdCBQREYgLSBQYWdlIDMpIFRqCjAgLTM0IFRkCigpIFRqCjAgLTM0IFRkCihUaGUgZW5kLiBJZiB5b3UgY2FuIHJlYWQgdGhpcywpIFRqCjAgLTM0IFRkCihyZWFjdC1wZGYgKyBwZGYuanMgd29ya2VyIGFyZSkgVGoKMCAtMzQgVGQKKHdvcmtpbmcgY29ycmVjdGx5LikgVGoKRVQKZW5kc3RyZWFtCmVuZG9iago5IDAgb2JqCjw8IC9UeXBlIC9Gb250IC9TdWJ0eXBlIC9UeXBlMSAvQmFzZUZvbnQgL0hlbHZldGljYSA+PgplbmRvYmoKeHJlZgowIDEwCjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMjcgMDAwMDAgbiAKMDAwMDAwMDI1MyAwMDAwMCBuIAowMDAwMDAwNDk0IDAwMDAwIG4gCjAwMDAwMDA2MjAgMDAwMDAgbiAKMDAwMDAwMDg2MSAwMDAwMCBuIAowMDAwMDAwOTg3IDAwMDAwIG4gCjAwMDAwMDEyMjMgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAxMCAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKMTI5MwolJUVPRg==";

function base64ToBlob(base64: string): Blob {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: "application/pdf" });
}

const samplePdfBlob = base64ToBlob(SAMPLE_PDF_BASE64);

// Dummy SDK instance for the bucket/entity stories. These stories demonstrate
// the props wiring; the fetch itself needs a real, authenticated tenant, so in
// Storybook they surface the widget's error state instead.
const mockSdk = new UiPath({
  baseUrl: "https://mock.uipath.com",
  orgName: "storybook-org",
  tenantName: "storybook-tenant",
  secret: "dummy-secret",
});

const meta = {
  title: "Components/PdfViewer",
  component: PdfViewer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: `
A React PDF viewer widget for UiPath coded apps. Renders PDFs from Orchestrator
Storage Buckets, Data Fabric entity attachments, or plain URLs/Blobs — with a
prop-toggleable toolbar (page navigation, zoom, fit-to-width, rotation, download),
selectable text, and built-in loading/error states.

## Features

- **Four sources, one prop** — \`bucket\`, \`entity\`, \`url\`, and \`blob\` via a discriminated union
- Page navigation with direct page entry
- Zoom (50%–300%), fit-to-width, and 90° rotation
- Download the original file
- Selectable/copyable text (pdf.js text layer)
- Loading, error (with retry), and empty states built in
- **No CDN**: the pdf.js worker is bundled locally, so the widget works behind
  enterprise CSP/firewalls (e.g. on \\*.uipath.host)

## Installation

\`\`\`bash
npm install @uipath/ui-widgets-pdf-viewer
\`\`\`

## Usage

> **Note:** Add either \`light\` or \`dark\` class to your HTML \`<body>\` element to enable proper theming.

\`\`\`tsx
import { PdfViewer } from '@uipath/ui-widgets-pdf-viewer';
import '@uipath/ui-widgets-pdf-viewer/PdfViewer.css';
import { UiPath } from '@uipath/uipath-typescript';

function App() {
  const sdk = new UiPath({
    // SDK configuration
  });

  return (
    <PdfViewer
      sdk={sdk}
      source={{
        bucketId: 123,
        folderKey: '<folder-guid>', // or folderId / folderPath
        path: 'invoices/inv-0714.pdf',
      }}
    />
  );
}
\`\`\`

Data Fabric entity attachments work the same way:

\`\`\`tsx
<PdfViewer
  sdk={sdk}
  source={{
    entityId: '<entity-id>',
    recordId: '<record-id>',
    fieldName: 'document',
  }}
/>
\`\`\`

And for custom data stores, pass a URL or pre-fetched bytes directly (no \`sdk\` needed):

\`\`\`tsx
<PdfViewer source={{ url: signedUrl }} />
<PdfViewer source={{ data: blob }} />
\`\`\`

The widget selects the adapter from the fields you pass.
        `,
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof PdfViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default viewer rendering an embedded 3-page sample PDF (offline, CI-safe).
 * Try the page navigation, zoom, rotation, and text selection.
 */
export const Default: Story = {
  args: {
    source: { data: samplePdfBlob },
    fileName: "sample-document.pdf",
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};

/**
 * The primary embedding target: a narrow (~480px) pane beside other content,
 * as in a coded action app showing a document next to an approval form.
 */
export const EmbeddedInActionApp: Story = {
  args: {
    source: { data: samplePdfBlob },
    fileName: "invoice-2026-0714.pdf",
    maxHeight: 480,
  },
  render: (args) => (
    <div style={{ display: "flex", gap: 16, width: 820 }}>
      <div style={{ width: 480, flexShrink: 0 }}>
        <PdfViewer {...args} />
      </div>
      <div
        style={{
          flex: 1,
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          fontFamily: "sans-serif",
          fontSize: 14,
        }}
      >
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>
          Review &amp; approve
        </h3>
        <p style={{ color: "#6b7280", margin: "0 0 16px" }}>
          The widget stays fully usable in a constrained split pane — the
          toolbar wraps and the canvas scrolls internally.
        </p>
        <button
          style={{
            background: "#0067df",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "8px 16px",
          }}
        >
          Approve
        </button>
      </div>
    </div>
  ),
};

/** Toolbar hidden entirely (all features disabled) — a bare page renderer. */
export const WithoutToolbar: Story = {
  args: {
    source: { data: samplePdfBlob },
    toolbar: { pagination: false, zoom: false, rotate: false, download: false },
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};

/** Per-feature toolbar toggles: pagination only. */
export const PaginationOnly: Story = {
  args: {
    source: { data: samplePdfBlob },
    toolbar: { pagination: true, zoom: false, rotate: false, download: false },
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};

/**
 * Storage bucket source. Requires a real, authenticated tenant — with the
 * Storybook mock SDK this demonstrates the widget's error state and Retry.
 */
export const FromStorageBucket: Story = {
  args: {
    sdk: mockSdk,
    source: {
      bucketId: 123,
      folderId: 456,
      path: "invoices/inv-0714.pdf",
    },
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};

/**
 * Data Fabric entity attachment source. Requires a real, authenticated
 * tenant — with the Storybook mock SDK this demonstrates the error state.
 */
export const FromDataFabricEntity: Story = {
  args: {
    sdk: mockSdk,
    source: {
      entityId: "00000000-0000-0000-0000-000000000000",
      recordId: "00000000-0000-0000-0000-000000000001",
      fieldName: "document",
    },
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};

/** Fetch failure → error state with Retry (URL that always 404s). */
export const ErrorState: Story = {
  args: {
    source: { url: "/this-file-does-not-exist.pdf" },
  },
  render: (args) => (
    <div style={{ width: 720 }}>
      <PdfViewer {...args} />
    </div>
  ),
};
