import { Button } from "@uipath/apollo-wind";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, PasswordResponses } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./pdfWorker";
import "./PdfViewer.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  ErrorIcon,
  FileIcon,
  FitWidthIcon,
  RotateIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./icons";
import { PasswordPrompt, PasswordRequest } from "./PasswordPrompt";
import {
  getSourceKey,
  getSourceType,
  useResolvedSource,
} from "./sources/useResolvedSource";
import {
  PdfViewerProps,
  PdfViewerSource,
  TelemetryService,
  TelemetryStatus,
} from "./types";
import { trackTelemetry } from "./utils/telemetryUtils";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;
const DEFAULT_MAX_HEIGHT = 640;
const CANVAS_PADDING_PX = 32;

const DEFAULT_TOOLBAR = {
  pagination: true,
  zoom: true,
  rotate: true,
  download: true,
};

/** Derive a sensible download name when the consumer doesn't pass one. */
function defaultFileName(source: PdfViewerSource): string {
  if ("bucketId" in source) {
    return source.path.split("/").pop() || "document.pdf";
  }
  if ("url" in source) {
    try {
      const name = new URL(source.url, "http://placeholder.local").pathname
        .split("/")
        .pop();
      return name || "document.pdf";
    } catch {
      return "document.pdf";
    }
  }
  if ("entityId" in source) {
    return `${source.fieldName}.pdf`;
  }
  return "document.pdf";
}

const LoadingState = () => (
  <div
    className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-[var(--color-foreground-light)]"
    data-testid="pdf-viewer-loading"
  >
    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border-de-emp)] border-t-[var(--color-foreground-de-emp)]" />
    Loading document…
  </div>
);

/** Thin vertical line between toolbar groups (see the design mock). */
const ToolbarSeparator = () => (
  <div className="mx-1 h-5 w-px bg-[var(--color-border-de-emp)]" aria-hidden />
);

export const PdfViewer: FC<PdfViewerProps> = ({
  source,
  sdk,
  toolbar,
  fileName,
  maxHeight = DEFAULT_MAX_HEIGHT,
  onLoadSuccess,
  onLoadError,
}) => {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [retryKey, setRetryKey] = useState(0);
  const [renderError, setRenderError] = useState<Error | null>(null);
  const [passwordRequest, setPasswordRequest] =
    useState<PasswordRequest | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  // Natural page size at scale 1, captured on page load — used by fit-to-width.
  const pageDims = useRef<{ width: number; height: number } | null>(null);

  const sourceKey = getSourceKey(source);
  // Derived from the fields present; reported with telemetry.
  const sourceType = getSourceType(source);
  // All blob sources share the sourceKey "blob", so track the blob identity
  // separately to also detect a switch between two different blob sources.
  const blobIdentity = "data" in source ? source.data : null;
  const {
    file,
    isResolving,
    error: resolveError,
  } = useResolvedSource(source, sdk, retryKey);

  // Per-feature toggles merged over the all-on defaults; disabling every
  // feature hides the toolbar row entirely.
  const toolbarOptions = useMemo(() => {
    const merged = { ...DEFAULT_TOOLBAR, ...toolbar };
    const anyVisible =
      merged.pagination || merged.zoom || merged.rotate || merged.download;
    return anyVisible ? merged : null;
  }, [toolbar]);

  const resolvedFileName = fileName ?? defaultFileName(source);

  // Reset the full view state when the document changes — a new document opens
  // at page 1, unzoomed, and unrotated. blobIdentity is included so switching
  // between two blob sources (which share the same sourceKey) resets too.
  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setScale(1);
    setRotation(0);
    setRenderError(null);
    setPasswordRequest(null);
    pageDims.current = null;
  }, [sourceKey, blobIdentity]);

  // Surface adapter (fetch) failures: telemetry + consumer callback.
  useEffect(() => {
    if (!resolveError) return;
    trackTelemetry(TelemetryService.LoadDocument, TelemetryStatus.Error, {
      SourceType: sourceType,
      Stage: "fetch",
      Error: resolveError.message,
    });
    onLoadError?.(resolveError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveError]);

  // Structurally typed (only numPages is used) — importing PDFDocumentProxy
  // from pdfjs-dist risks resolving a different copy than react-pdf's own,
  // which makes the two nominally-identical types incompatible.
  const handleDocumentLoadSuccess = useCallback(
    (pdf: { numPages: number }) => {
      setNumPages(pdf.numPages);
      setPageNumber(1);
      setPasswordRequest(null);
      trackTelemetry(TelemetryService.LoadDocument, TelemetryStatus.Usage, {
        SourceType: sourceType,
        NumPages: pdf.numPages,
      });
      onLoadSuccess?.({ numPages: pdf.numPages });
    },
    [sourceType, onLoadSuccess],
  );

  const handleDocumentLoadError = useCallback(
    (error: Error) => {
      setRenderError(error);
      setPasswordRequest(null);
      trackTelemetry(TelemetryService.LoadDocument, TelemetryStatus.Error, {
        SourceType: sourceType,
        Stage: "render",
        Error: error.message,
      });
      onLoadError?.(error);
    },
    [sourceType, onLoadError],
  );

  const handleRetry = useCallback(() => {
    setRenderError(null);
    setPasswordRequest(null);
    setRetryKey((key) => key + 1);
  }, []);

  // pdf.js requests a password (or re-requests one after a wrong attempt).
  // Show the widget's own styled prompt instead of react-pdf's default,
  // which calls the browser-native window.prompt.
  const handlePassword = useCallback(
    (callback: (password: string | null) => void, reason: number) => {
      setPasswordRequest({
        callback,
        isRetry: reason === PasswordResponses.INCORRECT_PASSWORD,
      });
    },
    [],
  );

  const goToPage = useCallback(
    (page: number) => {
      setPageNumber(Math.min(Math.max(page, 1), numPages || 1));
    },
    [numPages],
  );

  const handleZoom = useCallback((delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, MIN_SCALE), MAX_SCALE));
  }, []);

  const handleFitWidth = useCallback(() => {
    const container = canvasRef.current;
    const dims = pageDims.current;
    if (!container || !dims) return;
    // Rotation by 90°/270° swaps which natural dimension spans the width.
    const naturalWidth = rotation % 180 === 0 ? dims.width : dims.height;
    const available = container.clientWidth - CANVAS_PADDING_PX;
    if (naturalWidth > 0 && available > 0) {
      setScale(
        Math.min(Math.max(available / naturalWidth, MIN_SCALE), MAX_SCALE),
      );
    }
  }, [rotation]);

  const handleRotate = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      let blob = file?.blob;
      if (!blob && file?.url) {
        const response = await fetch(file.url);
        if (!response.ok) {
          throw new Error(`Download failed (HTTP ${response.status}).`);
        }
        blob = await response.blob();
      }
      if (!blob) return;

      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = resolvedFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);

      trackTelemetry(TelemetryService.DownloadFile, TelemetryStatus.Usage, {
        SourceType: sourceType,
      });
    } catch (error) {
      trackTelemetry(TelemetryService.DownloadFile, TelemetryStatus.Error, {
        SourceType: sourceType,
        Error: error instanceof Error ? error.message : "Download failed",
      });
    }
  }, [file, resolvedFileName, sourceType]);

  const error = resolveError ?? renderError;
  const documentFile = file?.blob ?? file?.url ?? null;
  const maxHeightStyle =
    typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight;

  const showRotateOrDownload =
    toolbarOptions?.rotate || toolbarOptions?.download;

  return (
    <div className="uipath-pdf-viewer flex w-full flex-col overflow-hidden rounded-lg border border-[var(--color-border-de-emp)] bg-background">
      {toolbarOptions && (
        <div
          role="toolbar"
          aria-label="PDF viewer toolbar"
          className="flex flex-wrap items-center gap-1 border-b border-[var(--color-border-de-emp)] px-2 py-1.5"
        >
          {toolbarOptions.pagination && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Previous page"
                onClick={() => goToPage(pageNumber - 1)}
                disabled={pageNumber <= 1 || !numPages}
              >
                <ChevronLeftIcon />
              </Button>
              <span className="flex items-center gap-1 text-sm tabular-nums text-foreground">
                <input
                  type="number"
                  min={1}
                  max={numPages || 1}
                  value={pageNumber}
                  aria-label="Page number"
                  className="w-12 rounded border border-[var(--color-border-de-emp)] bg-background px-1 py-0.5 text-center text-sm text-foreground"
                  onChange={(event) => {
                    const page = Number.parseInt(event.target.value, 10);
                    if (!Number.isNaN(page)) goToPage(page);
                  }}
                />
                / {numPages || "–"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Next page"
                onClick={() => goToPage(pageNumber + 1)}
                disabled={pageNumber >= numPages}
              >
                <ChevronRightIcon />
              </Button>
            </div>
          )}

          {toolbarOptions.pagination &&
            (toolbarOptions.zoom || showRotateOrDownload) && (
              <ToolbarSeparator />
            )}

          {toolbarOptions.zoom && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom out"
                onClick={() => handleZoom(-SCALE_STEP)}
                disabled={scale <= MIN_SCALE}
              >
                <ZoomOutIcon />
              </Button>
              <span className="min-w-12 text-center text-sm tabular-nums text-foreground">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Zoom in"
                onClick={() => handleZoom(SCALE_STEP)}
                disabled={scale >= MAX_SCALE}
              >
                <ZoomInIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Fit to width"
                onClick={handleFitWidth}
                disabled={!numPages}
              >
                <FitWidthIcon />
              </Button>
            </div>
          )}

          {toolbarOptions.zoom && showRotateOrDownload && <ToolbarSeparator />}

          {toolbarOptions.rotate && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Rotate clockwise"
              onClick={handleRotate}
              disabled={!numPages}
            >
              <RotateIcon />
            </Button>
          )}

          {toolbarOptions.download && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Download"
              onClick={handleDownload}
              disabled={!documentFile}
            >
              <DownloadIcon />
            </Button>
          )}

          <span className="ml-auto flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-foreground-light)]">
            <FileIcon />
            <span className="truncate" title={resolvedFileName}>
              {resolvedFileName}
            </span>
          </span>
        </div>
      )}

      <div
        ref={canvasRef}
        className="flex justify-center overflow-auto bg-[var(--color-background-secondary)] px-4 py-6"
        style={{ maxHeight: maxHeightStyle }}
      >
        {error ? (
          <div
            className="flex flex-col items-center justify-center gap-3 py-16 text-center"
            data-testid="pdf-viewer-error"
          >
            <span className="text-[var(--color-error-icon)]">
              <ErrorIcon />
            </span>
            <p className="text-sm font-semibold text-foreground">
              Couldn't load the document
            </p>
            <p className="max-w-xs text-sm text-[var(--color-foreground-light)]">
              {error.message}
            </p>
            <Button variant="outline" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        ) : isResolving ? (
          <LoadingState />
        ) : documentFile ? (
          <>
            {passwordRequest && (
              <PasswordPrompt
                isRetry={passwordRequest.isRetry}
                onSubmit={(password) => {
                  setPasswordRequest(null);
                  passwordRequest.callback(password);
                }}
                onCancel={() => passwordRequest.callback(null)}
              />
            )}
            {/* Keep <Document> mounted while the prompt is up — pdf.js is
                suspended awaiting the password callback; unmounting would
                destroy the pending load. */}
            <div style={passwordRequest ? { display: "none" } : undefined}>
              <Document
                key={`${sourceKey}-${retryKey}`}
                file={documentFile}
                onLoadSuccess={handleDocumentLoadSuccess}
                onLoadError={handleDocumentLoadError}
                onPassword={handlePassword}
                loading={<LoadingState />}
                noData={
                  <p className="py-16 text-sm text-[var(--color-foreground-light)]">
                    No document to display.
                  </p>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  rotate={rotation}
                  renderTextLayer
                  renderAnnotationLayer
                  className="shadow-md"
                  onLoadSuccess={(page) => {
                    pageDims.current = {
                      width: page.originalWidth,
                      height: page.originalHeight,
                    };
                  }}
                />
              </Document>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
