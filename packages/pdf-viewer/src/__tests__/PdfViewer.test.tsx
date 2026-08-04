/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PdfViewer } from "../PdfViewer";
import { getSourceKey, getSourceType } from "../sources/useResolvedSource";
import { PdfViewerSourceType } from "../types";
import { UiPath, trackEvent } from "@uipath/uipath-typescript/core";

// Captures the `file` prop react-pdf receives, per render.
let lastDocumentFile: unknown = null;
// When true, the mocked <Document> behaves like a password-protected PDF:
// it fires onPassword and only "loads" once CORRECT_PASSWORD is supplied.
let simulatePasswordProtected = false;
const CORRECT_PASSWORD = "letmein";

// Mock react-pdf: <Document> "loads" 3 pages asynchronously; <Page> echoes its props.
vi.mock("react-pdf", async () => {
  const React = await import("react");
  return {
    pdfjs: { GlobalWorkerOptions: {} },
    PasswordResponses: { NEED_PASSWORD: 1, INCORRECT_PASSWORD: 2 },
    Document: ({
      file,
      onLoadSuccess,
      onLoadError,
      onPassword,
      children,
    }: any) => {
      lastDocumentFile = file;
      React.useEffect(() => {
        if (simulatePasswordProtected) {
          // Mirrors pdf.js: retries with INCORRECT_PASSWORD until the right
          // password arrives; a null password (cancel) fails the load.
          const attempt = (password: string | null) => {
            if (password === null) {
              onLoadError?.(new Error("No password given"));
            } else if (password === CORRECT_PASSWORD) {
              onLoadSuccess?.({ numPages: 3 });
            } else {
              onPassword?.(attempt, 2); // INCORRECT_PASSWORD
            }
          };
          onPassword?.(attempt, 1); // NEED_PASSWORD
        } else {
          onLoadSuccess?.({ numPages: 3 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return <div data-testid="pdf-document">{children}</div>;
    },
    Page: ({ pageNumber, scale, rotate }: any) => (
      <div data-testid="pdf-page">
        page-{pageNumber} scale-{scale} rotate-{rotate}
      </div>
    ),
  };
});

// Mock SDK services to avoid real network/auth.
const mockGetReadUri = vi.fn();
vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: class {
    getReadUri = mockGetReadUri;
  },
}));

const mockDownloadAttachment = vi.fn();
vi.mock("@uipath/uipath-typescript/entities", () => ({
  Entities: class {
    downloadAttachment = mockDownloadAttachment;
  },
}));

vi.mock("@uipath/uipath-typescript/core", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    trackEvent: vi.fn(),
  };
});

vi.mock("@uipath/apollo-wind", () => ({
  Button: ({ children, onClick, disabled, ...rest }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={rest.type ?? "button"}
      aria-label={rest["aria-label"]}
    >
      {children}
    </button>
  ),
}));

const sdk = new UiPath({
  baseUrl: "https://test.uipath.com",
  orgName: "test-org",
  tenantName: "test-tenant",
  secret: "test-secret",
});

const pdfBlob = new Blob(["%PDF-fake"], { type: "application/pdf" });

/** Waits until the mocked document has fully "loaded" (numPages committed). */
const waitForDocumentLoaded = () =>
  waitFor(() =>
    expect(
      screen.getByRole("spinbutton", { name: "Page number" }),
    ).toHaveAttribute("max", "3"),
  );

describe("PdfViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastDocumentFile = null;
    simulatePasswordProtected = false;
  });

  describe("url and blob sources (no SDK required)", () => {
    it("renders the document from a url source and passes the url through", async () => {
      render(
        <PdfViewer
          source={{
            type: PdfViewerSourceType.Url,
            url: "https://example.com/doc.pdf",
          }}
        />,
      );

      await waitForDocumentLoaded();
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-1");
      expect(lastDocumentFile).toBe("https://example.com/doc.pdf");
    });

    it("normalizes an ArrayBuffer blob source into a typed Blob", async () => {
      const buffer = new TextEncoder().encode("%PDF-fake").buffer;
      render(<PdfViewer source={{ data: buffer }} />);

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(lastDocumentFile).toBeInstanceOf(Blob);
      expect((lastDocumentFile as Blob).type).toBe("application/pdf");
    });

    it("reports load success via callback and telemetry", async () => {
      const onLoadSuccess = vi.fn();
      render(
        <PdfViewer source={{ data: pdfBlob }} onLoadSuccess={onLoadSuccess} />,
      );

      await waitFor(() =>
        expect(onLoadSuccess).toHaveBeenCalledWith({ numPages: 3 }),
      );
      expect(trackEvent).toHaveBeenCalledWith(
        "PDFV.LoadDocument",
        "PDFV.Usage",
        expect.objectContaining({ SourceType: "blob", NumPages: 3 }),
      );
    });
  });

  describe("password-protected PDFs", () => {
    it("shows the in-viewer password prompt instead of the native window.prompt", async () => {
      simulatePasswordProtected = true;
      render(<PdfViewer source={{ data: pdfBlob }} />);

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-password")).toBeInTheDocument(),
      );
      expect(screen.getByText(/password-protected/i)).toBeInTheDocument();
      expect(screen.getByLabelText("Document password")).toBeInTheDocument();
    });

    it("unlocks and renders once the correct password is submitted", async () => {
      simulatePasswordProtected = true;
      const user = userEvent.setup();
      const onLoadSuccess = vi.fn();
      render(
        <PdfViewer source={{ data: pdfBlob }} onLoadSuccess={onLoadSuccess} />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-password")).toBeInTheDocument(),
      );
      await user.type(
        screen.getByLabelText("Document password"),
        CORRECT_PASSWORD,
      );
      await user.click(screen.getByRole("button", { name: "Open document" }));

      await waitFor(() =>
        expect(onLoadSuccess).toHaveBeenCalledWith({ numPages: 3 }),
      );
      expect(
        screen.queryByTestId("pdf-viewer-password"),
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-1");
    });

    it("shows an incorrect-password message and allows retrying", async () => {
      simulatePasswordProtected = true;
      const user = userEvent.setup();
      const onLoadSuccess = vi.fn();
      render(
        <PdfViewer source={{ data: pdfBlob }} onLoadSuccess={onLoadSuccess} />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-password")).toBeInTheDocument(),
      );
      await user.type(screen.getByLabelText("Document password"), "wrong");
      await user.click(screen.getByRole("button", { name: "Open document" }));

      // The prompt returns with the incorrect-password message.
      await waitFor(() =>
        expect(screen.getByText(/incorrect password/i)).toBeInTheDocument(),
      );

      // Retrying with the right password recovers.
      await user.type(
        screen.getByLabelText("Document password"),
        CORRECT_PASSWORD,
      );
      await user.click(screen.getByRole("button", { name: "Open document" }));
      await waitFor(() =>
        expect(onLoadSuccess).toHaveBeenCalledWith({ numPages: 3 }),
      );
    });

    it("falls through to the error state when the prompt is cancelled", async () => {
      simulatePasswordProtected = true;
      const user = userEvent.setup();
      const onLoadError = vi.fn();
      render(
        <PdfViewer source={{ data: pdfBlob }} onLoadError={onLoadError} />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-password")).toBeInTheDocument(),
      );
      await user.click(screen.getByRole("button", { name: "Cancel" }));

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(onLoadError).toHaveBeenCalled();
      expect(
        screen.queryByTestId("pdf-viewer-password"),
      ).not.toBeInTheDocument();
    });
  });

  describe("source switching resets the view", () => {
    it("resets page, zoom, and rotation when the source changes", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PdfViewer source={{ data: pdfBlob }} />);
      await waitForDocumentLoaded();

      // Move off the default view: page 2, 125%, rotated 90°.
      await user.click(screen.getByRole("button", { name: "Next page" }));
      await user.click(screen.getByRole("button", { name: "Zoom in" }));
      await user.click(
        screen.getByRole("button", { name: "Rotate clockwise" }),
      );
      expect(screen.getByTestId("pdf-page")).toHaveTextContent(
        "page-2 scale-1.25 rotate-90",
      );

      // Switch to a different source → full view reset.
      rerender(<PdfViewer source={{ url: "https://example.com/b.pdf" }} />);
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toHaveTextContent(
          "page-1 scale-1 rotate-0",
        ),
      );
    });

    it("resets when switching between two different blob sources (same sourceKey)", async () => {
      const user = userEvent.setup();
      const blobA = new Blob(["%PDF-A"], { type: "application/pdf" });
      const blobB = new Blob(["%PDF-B"], { type: "application/pdf" });
      const { rerender } = render(<PdfViewer source={{ data: blobA }} />);
      await waitForDocumentLoaded();

      await user.click(
        screen.getByRole("button", { name: "Rotate clockwise" }),
      );
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("rotate-90");

      rerender(<PdfViewer source={{ data: blobB }} />);
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toHaveTextContent("rotate-0"),
      );
    });
  });

  describe("toolbar", () => {
    it("navigates pages with next/previous and the page input", async () => {
      const user = userEvent.setup();
      render(<PdfViewer source={{ data: pdfBlob }} />);
      await waitForDocumentLoaded();

      await user.click(screen.getByRole("button", { name: "Next page" }));
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-2");

      await user.click(screen.getByRole("button", { name: "Previous page" }));
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-1");

      fireEvent.change(
        screen.getByRole("spinbutton", { name: "Page number" }),
        {
          target: { value: "3" },
        },
      );
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-3");
      // Out-of-range input is clamped to the last page.
      fireEvent.change(
        screen.getByRole("spinbutton", { name: "Page number" }),
        {
          target: { value: "99" },
        },
      );
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-3");
    });

    it("zooms in and out within bounds", async () => {
      const user = userEvent.setup();
      render(<PdfViewer source={{ data: pdfBlob }} />);
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Zoom in" }));
      expect(screen.getByText("125%")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Zoom out" }));
      await user.click(screen.getByRole("button", { name: "Zoom out" }));
      expect(screen.getByText("75%")).toBeInTheDocument();
    });

    it("rotates the page clockwise in 90° steps", async () => {
      const user = userEvent.setup();
      render(<PdfViewer source={{ data: pdfBlob }} />);
      await waitForDocumentLoaded();

      await user.click(
        screen.getByRole("button", { name: "Rotate clockwise" }),
      );
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("rotate-90");
    });

    it("hides the toolbar entirely when every feature is disabled", async () => {
      render(
        <PdfViewer
          source={{ data: pdfBlob }}
          toolbar={{
            pagination: false,
            zoom: false,
            rotate: false,
            download: false,
          }}
        />,
      );
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("hides individual features via per-feature toggles", async () => {
      render(
        <PdfViewer
          source={{ data: pdfBlob }}
          toolbar={{ zoom: false, download: false }}
        />,
      );
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(
        screen.getByRole("button", { name: "Next page" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Zoom in" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Download" }),
      ).not.toBeInTheDocument();
    });

    it("downloads the resolved blob via an object URL", async () => {
      const user = userEvent.setup();
      const createObjectURL = vi.fn(() => "blob:mock-url");
      const revokeObjectURL = vi.fn();
      vi.stubGlobal(
        "URL",
        Object.assign(URL, { createObjectURL, revokeObjectURL }),
      );
      // jsdom can't navigate; stub the programmatic anchor click.
      const anchorClick = vi
        .spyOn(HTMLAnchorElement.prototype, "click")
        .mockImplementation(() => {});

      render(<PdfViewer source={{ data: pdfBlob }} fileName="invoice.pdf" />);
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );

      await user.click(screen.getByRole("button", { name: "Download" }));
      expect(createObjectURL).toHaveBeenCalledTimes(1);
      expect(anchorClick).toHaveBeenCalledTimes(1);
      expect(trackEvent).toHaveBeenCalledWith(
        "PDFV.DownloadFile",
        "PDFV.Usage",
        expect.objectContaining({ SourceType: "blob" }),
      );
      anchorClick.mockRestore();
    });
  });

  describe("bucket source", () => {
    it("resolves via getReadUri and downloads the signed uri with its headers", async () => {
      mockGetReadUri.mockResolvedValue({
        uri: "https://signed.example.com/inv.pdf",
        httpMethod: "GET",
        requiresAuth: false,
        headers: { "x-signed": "1" },
      });
      const fetchMock = vi.fn(async () => ({
        ok: true,
        blob: async () => pdfBlob,
      }));
      vi.stubGlobal("fetch", fetchMock);

      render(
        <PdfViewer
          sdk={sdk}
          source={{
            bucketId: 123,
            folderId: 456,
            path: "inv/0714.pdf",
          }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockGetReadUri).toHaveBeenCalledWith(
        123,
        "inv/0714.pdf",
        expect.objectContaining({ folderId: 456 }),
      );
      expect(fetchMock).toHaveBeenCalledWith(
        "https://signed.example.com/inv.pdf",
        {
          headers: { "x-signed": "1" },
        },
      );
      expect(lastDocumentFile).toBeInstanceOf(Blob);
    });

    it("scopes the bucket by folderKey when provided instead of folderId", async () => {
      mockGetReadUri.mockResolvedValue({
        uri: "https://signed.example.com/inv.pdf",
        httpMethod: "GET",
        requiresAuth: false,
        headers: {},
      });
      vi.stubGlobal(
        "fetch",
        vi.fn(async () => ({ ok: true, blob: async () => pdfBlob })),
      );

      render(
        <PdfViewer
          sdk={sdk}
          source={{
            bucketId: 123,
            folderKey: "5f6dadf1-3677-49dc-8aca-c2999dd4b3ba",
            path: "inv/0714.pdf",
          }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockGetReadUri).toHaveBeenCalledWith(
        123,
        "inv/0714.pdf",
        expect.objectContaining({
          folderKey: "5f6dadf1-3677-49dc-8aca-c2999dd4b3ba",
        }),
      );
    });

    it("shows the error state when no folder identifier is provided", async () => {
      render(<PdfViewer sdk={sdk} source={{ bucketId: 1, path: "a.pdf" }} />);
      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(
        screen.getByText(/one of folderId, folderKey, or folderPath/),
      ).toBeInTheDocument();
    });

    it("shows the error state when the sdk prop is missing", async () => {
      const onLoadError = vi.fn();
      render(
        <PdfViewer
          source={{ bucketId: 1, folderId: 2, path: "a.pdf" }}
          onLoadError={onLoadError}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(
        screen.getByText(/required for 'bucket' sources/),
      ).toBeInTheDocument();
      expect(onLoadError).toHaveBeenCalled();
      expect(trackEvent).toHaveBeenCalledWith(
        "PDFV.LoadDocument",
        "PDFV.Error",
        expect.objectContaining({ SourceType: "bucket", Stage: "fetch" }),
      );
    });
  });

  describe("entity source", () => {
    it("downloads the record's file field via downloadAttachment", async () => {
      mockDownloadAttachment.mockResolvedValue(pdfBlob);

      render(
        <PdfViewer
          sdk={sdk}
          source={{
            entityId: "entity-1",
            recordId: "record-1",
            fieldName: "document",
          }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockDownloadAttachment).toHaveBeenCalledWith(
        "entity-1",
        "record-1",
        "document",
      );
      expect(lastDocumentFile).toBeInstanceOf(Blob);
    });

    it("shows the error state on fetch failure and recovers via Retry", async () => {
      const user = userEvent.setup();
      mockDownloadAttachment
        .mockRejectedValueOnce(new Error("Attachment not found"))
        .mockResolvedValueOnce(pdfBlob);

      render(
        <PdfViewer
          sdk={sdk}
          source={{
            entityId: "entity-1",
            recordId: "record-1",
            fieldName: "document",
          }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(screen.getByText("Attachment not found")).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "Retry" }));
      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockDownloadAttachment).toHaveBeenCalledTimes(2);
    });
  });

  describe("getSourceKey", () => {
    it("produces distinct, stable keys per source identity", () => {
      expect(
        getSourceKey({
          bucketId: 1,
          folderId: 2,
          path: "a.pdf",
        }),
      ).toBe("bucket:1:2:a.pdf");
      expect(
        getSourceKey({
          entityId: "e",
          recordId: "r",
          fieldName: "f",
        }),
      ).toBe("entity:e:r:f");
      expect(getSourceKey({ url: "https://x/y.pdf" })).toBe(
        "url:https://x/y.pdf",
      );
      expect(getSourceKey({ data: pdfBlob })).toBe("blob");
    });

    it("produces the same key with or without the optional type field", () => {
      expect(getSourceKey({ bucketId: 1, folderId: 2, path: "a.pdf" })).toBe(
        getSourceKey({
          bucketId: 1,
          folderId: 2,
          path: "a.pdf",
        }),
      );
      expect(getSourceKey({ url: "https://x/y.pdf" })).toBe(
        getSourceKey({ url: "https://x/y.pdf" }),
      );
    });
  });

  describe("source kind inference (optional type field)", () => {
    it("renders a url source without an explicit type", async () => {
      render(<PdfViewer source={{ url: "https://example.com/doc.pdf" }} />);

      await waitForDocumentLoaded();
      expect(screen.getByTestId("pdf-page")).toHaveTextContent("page-1");
      expect(lastDocumentFile).toBe("https://example.com/doc.pdf");
    });

    it("renders a blob source without an explicit type", async () => {
      render(<PdfViewer source={{ data: pdfBlob }} />);

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(lastDocumentFile).toBeInstanceOf(Blob);
    });

    it("resolves a bucket source without an explicit type", async () => {
      mockGetReadUri.mockResolvedValue({
        uri: "https://signed.example.com/inv.pdf",
        httpMethod: "GET",
        requiresAuth: false,
        headers: {},
      });
      const fetchMock = vi.fn(async () => ({
        ok: true,
        blob: async () => pdfBlob,
      }));
      vi.stubGlobal("fetch", fetchMock);

      render(
        <PdfViewer
          sdk={sdk}
          source={{ bucketId: 123, folderKey: "fk-1", path: "inv/0714.pdf" }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockGetReadUri).toHaveBeenCalledWith(
        123,
        "inv/0714.pdf",
        expect.objectContaining({ folderKey: "fk-1" }),
      );
    });

    it("resolves an entity source without an explicit type", async () => {
      mockDownloadAttachment.mockResolvedValue(pdfBlob);

      render(
        <PdfViewer
          sdk={sdk}
          source={{ entityId: "e-1", recordId: "r-1", fieldName: "FileField" }}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(mockDownloadAttachment).toHaveBeenCalledWith(
        "e-1",
        "r-1",
        "FileField",
      );
    });

    it("shows a clear error for an unrecognized source shape", async () => {
      render(
        <PdfViewer
          source={{} as unknown as import("../types").PdfViewerSource}
        />,
      );

      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(screen.getByText(/Unrecognized source/)).toBeInTheDocument();
      // The failure is never misclassified as a blob — diagnostics report it
      // honestly as "unknown".
      expect(trackEvent).toHaveBeenCalledWith(
        "PDFV.LoadDocument",
        "PDFV.Error",
        expect.objectContaining({ SourceType: "unknown", Stage: "fetch" }),
      );
    });

    it("classifies an unrecognized shape as unknown, never as blob", () => {
      const garbage = {
        foo: "bar",
      } as unknown as import("../types").PdfViewerSource;
      expect(getSourceType(garbage)).toBe("unknown");
      expect(getSourceKey(garbage)).toBe("unknown");
      // A real blob source is still classified as blob.
      expect(getSourceType({ data: pdfBlob })).toBe("blob");
      expect(getSourceKey({ data: pdfBlob })).toBe("blob");
    });

    it("recovers and renders when an unrecognized source is replaced by a valid one", async () => {
      const { rerender } = render(
        <PdfViewer
          source={{} as unknown as import("../types").PdfViewerSource}
        />,
      );

      // Starts in the unrecognized-source error state.
      await waitFor(() =>
        expect(screen.getByTestId("pdf-viewer-error")).toBeInTheDocument(),
      );
      expect(screen.getByText(/Unrecognized source/)).toBeInTheDocument();

      // Passing a valid source changes the sourceKey ("unknown" → "blob"),
      // which re-resolves and renders — the error state is not sticky.
      rerender(<PdfViewer source={{ data: pdfBlob }} />);

      await waitFor(() =>
        expect(screen.getByTestId("pdf-page")).toBeInTheDocument(),
      );
      expect(screen.queryByTestId("pdf-viewer-error")).not.toBeInTheDocument();
      expect(lastDocumentFile).toBeInstanceOf(Blob);
    });
  });
});
