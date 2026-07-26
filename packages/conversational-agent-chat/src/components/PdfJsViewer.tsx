import { Column, Spinner } from "@uipath/apollo-wind";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { PDFDocumentProxy } from "pdfjs-dist";

/**
 * Lazily loads pdfjs-dist and configures it to run the PDF parsing engine
 * on the main thread instead of spawning a Web Worker, which is blocked
 * inside sandboxed iframes.
 *
 * Setting globalThis.pdfjsWorker causes pdfjs to use the main-thread
 * WorkerMessageHandler directly (see PDFWorker.#mainThreadWorkerMessageHandler
 * in pdfjs source). This skips Worker creation entirely — #initialize() sees
 * the handler and calls #setupFakeWorker() immediately without attempting
 * new Worker().
 */
const loadPdfJs = async () => {
  const pdfjs = await import("pdfjs-dist");
  if (!(globalThis as Record<string, unknown>).pdfjsWorker) {
    // @ts-expect-error - worker module has no type declarations
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs");
    (globalThis as Record<string, unknown>).pdfjsWorker = worker;
  }
  // Ensure workerSrc is set as a fallback — prevents "No workerSrc specified"
  // error in any code path that checks it before the globalThis handler
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/build/pdf.worker.min.mjs";
  }
  return pdfjs;
};

const PAGE_GAP = 8;
const RENDER_BUFFER = 2; // render this many pages above/below the visible area
const MIN_PAGE_WIDTH = 200; // floor so a collapsed container can't yield a non-positive scale

interface PdfJsViewerProps {
  file: File;
  pageNumber?: number;
}

const PdfJsViewer = ({ file, pageNumber = 1 }: PdfJsViewerProps) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const renderedPages = useRef<Set<number>>(new Set());
  const renderingPages = useRef<Set<number>>(new Set());

  const { t } = useTranslation();

  // Load the PDF document
  useEffect(() => {
    let cancelled = false;

    // Clear state from any previously loaded document
    renderedPages.current.clear();
    renderingPages.current.clear();
    canvasRefs.current.clear();

    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const pdfjs = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

        if (cancelled) {
          doc.destroy();
          return;
        }

        setPdfDocument(doc);
        setNumPages(doc.numPages);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load PDF", e);
          setError(t("file_preview_error"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      cancelled = true;
    };
  }, [file, t]);

  // Cleanup PDF document on unmount
  useEffect(() => {
    return () => {
      pdfDocument?.destroy();
    };
  }, [pdfDocument]);

  const renderPage = useCallback(
    async (pageNum: number) => {
      if (
        !pdfDocument ||
        renderingPages.current.has(pageNum) ||
        renderedPages.current.has(pageNum)
      )
        return;

      const canvas = canvasRefs.current.get(pageNum);
      if (!canvas) return;

      renderingPages.current.add(pageNum);

      try {
        const page = await pdfDocument.getPage(pageNum);
        const container = containerRef.current;
        if (!container) return;

        // Clamp width so a zero/narrow container (e.g. during first layout)
        // can't produce a non-positive scale and an invalid canvas.
        const containerWidth = Math.max(
          container.clientWidth - 32,
          MIN_PAGE_WIDTH,
        );
        const unscaledViewport = page.getViewport({ scale: 1 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext("2d");
        if (!context) return;

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        renderedPages.current.add(pageNum);
      } catch (e) {
        console.error(`Failed to render PDF page ${pageNum}`, e);
      } finally {
        renderingPages.current.delete(pageNum);
      }
    },
    [pdfDocument],
  );

  // Render visible pages based on scroll position
  const renderVisiblePages = useCallback(() => {
    const container = containerRef.current;
    if (!container || !pdfDocument) return;

    const { scrollTop, clientHeight } = container;
    const visibleTop = scrollTop;
    const visibleBottom = scrollTop + clientHeight;

    // Find which pages are in or near the visible area
    let offset = 0;
    for (let i = 1; i <= numPages; i++) {
      const canvas = canvasRefs.current.get(i);
      const pageHeight = canvas?.height || 800;

      const pageTop = offset;
      const pageBottom = offset + pageHeight;
      offset = pageBottom + PAGE_GAP;

      const bufferTop = visibleTop - clientHeight * RENDER_BUFFER;
      const bufferBottom = visibleBottom + clientHeight * RENDER_BUFFER;

      // Pages are stacked top-to-bottom; once we're past the buffer, so is
      // everything below — stop scanning instead of walking all numPages.
      if (pageTop > bufferBottom) break;

      if (pageBottom >= bufferTop) {
        renderPage(i);
      }
    }
  }, [pdfDocument, numPages, renderPage]);

  // Scroll to cited page once loaded and render initial pages
  useEffect(() => {
    if (!pdfDocument || numPages === 0) return;

    const targetPage = Math.min(Math.max(1, pageNumber), numPages);

    const renderInitialPages = async () => {
      // Render page 1 (or target) first to get the typical page dimensions
      await renderPage(1);
      const firstCanvas = canvasRefs.current.get(1);
      const estimatedHeight = firstCanvas?.height || 800;
      const estimatedWidth = firstCanvas?.width || 600;

      // Size all unrendered canvases so the scroll container has correct total height
      for (let i = 1; i <= numPages; i++) {
        if (!renderedPages.current.has(i)) {
          const canvas = canvasRefs.current.get(i);
          if (canvas) {
            canvas.height = estimatedHeight;
            canvas.width = estimatedWidth;
          }
        }
      }

      // Render target page and surrounding pages
      const startPage = Math.max(1, targetPage - RENDER_BUFFER);
      const endPage = Math.min(numPages, targetPage + RENDER_BUFFER);
      for (let i = startPage; i <= endPage; i++) {
        await renderPage(i);
      }

      // Scroll to the target page
      const targetCanvas = canvasRefs.current.get(targetPage);
      if (targetCanvas) {
        targetCanvas.scrollIntoView({ block: "start" });
      }
    };

    renderInitialPages();
  }, [pdfDocument, numPages, pageNumber, renderPage]);

  // Listen for scroll to lazy-render pages
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !pdfDocument) return;

    const handleScroll = () => {
      requestAnimationFrame(renderVisiblePages);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [pdfDocument, renderVisiblePages]);

  if (isLoading) {
    return (
      <Column w="full" h="full" align="center" justify="center">
        <Spinner size="lg" />
      </Column>
    );
  }

  if (error) {
    return (
      <Column w="full" h="full" align="center" justify="center">
        {error}
      </Column>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        padding: "16px",
      }}
    >
      {Array.from({ length: numPages }, (_, i) => i + 1).map((pageNum) => (
        <canvas
          key={pageNum}
          ref={(el) => {
            if (el) {
              canvasRefs.current.set(pageNum, el);
            } else {
              canvasRefs.current.delete(pageNum);
            }
          }}
          style={{
            display: "block",
            margin: "0 auto",
            marginBottom: `${PAGE_GAP}px`,
          }}
        />
      ))}
    </div>
  );
};

export default PdfJsViewer;
