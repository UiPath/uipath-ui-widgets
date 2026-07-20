import { Button, Column, Row } from "@uipath/apollo-wind";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import PdfJsViewer from "./PdfJsViewer";

// ── File type checks ──

const isImage = (file: File) =>
  ["image/gif", "image/jpeg", "image/png"].includes(file?.type);
const isPdf = (file: File) => file?.type === "application/pdf";
const isText = (file: File) =>
  ["text/plain", "application/json"].includes(file?.type);
const isIframeViewable = (file: File) => isPdf(file) || isText(file);

// ── Component ──

interface FilePreviewerProps {
  file: File | undefined | null;
  /**
   * Rendering mode for file previews:
   * - true:  PDFs render via pdfjs <canvas>, text/JSON render inline via <pre>
   *          (needed for sandboxed iframe contexts where the browser PDF plugin is blocked)
   * - false: PDFs and text/JSON render via blob URL in <iframe> (original behavior)
   * Images always render via <img> regardless of this flag.
   */
  usePdfJs?: boolean;
  pageNumber?: number;
  iframeParams?: string;
}

const FilePreviewer = ({
  file,
  usePdfJs = false,
  pageNumber,
  iframeParams,
}: FilePreviewerProps) => {
  const [hasImageError, setHasImageError] = useState(false);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const copyBlobUrl = useRef<string | null>(null);
  const { t } = useTranslation();

  // ── Effects ──

  // Block external link navigation from iframe preview (e.g. clicking links in PDF)
  useEffect(() => {
    const beforeUnloadHandler = (event: BeforeUnloadEvent) => {
      if (document.activeElement === iframeRef.current) {
        event.preventDefault();
        event.returnValue = true;
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    return () =>
      window.removeEventListener("beforeunload", beforeUnloadHandler);
  }, []);

  // Create blob URL for:
  // - Images (always need a blob URL for <img src>)
  // - iframe mode: PDFs, text, JSON (need blob URL for <iframe src>)
  // Not needed in pdfjs mode for PDFs/text since they render without a URL.
  useEffect(() => {
    const needsBlobUrl =
      file && (isImage(file) || (!usePdfJs && isIframeViewable(file)));
    if (!needsBlobUrl) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFileUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, usePdfJs]);

  // Read file contents for inline text rendering (pdfjs mode only).
  // Only sets state from async callbacks (guarded by a cancel flag) to avoid
  // synchronous state updates inside the effect body.
  useEffect(() => {
    if (!(usePdfJs && file && isText(file))) return;
    let cancelled = false;
    file
      .text()
      .then((txt) => {
        if (!cancelled) setTextContent(txt);
      })
      .catch(() => {
        if (!cancelled) setTextContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [file, usePdfJs]);

  // Revoke copy blob URL when file changes or on unmount
  useEffect(() => {
    return () => {
      if (copyBlobUrl.current) {
        URL.revokeObjectURL(copyBlobUrl.current);
        copyBlobUrl.current = null;
      }
    };
  }, [file]);

  // ── Actions ──

  const handleDownload = useCallback(() => {
    if (!file) return;

    try {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download file", e);
    }
  }, [file]);

  const handleCopyLink = useCallback(async () => {
    if (!file) return;

    try {
      if (!copyBlobUrl.current) {
        copyBlobUrl.current = URL.createObjectURL(file);
      }
      await navigator.clipboard.writeText(copyBlobUrl.current);
    } catch (e) {
      console.error("Failed to copy link", e);
    }
  }, [file]);

  // ── Preview content ──
  //
  // Rendering paths by file type and mode:
  //
  // | File type  | usePdfJs: true           | usePdfJs: false (default) |
  // |------------|--------------------------|---------------------------|
  // | PDF        | pdfjs <canvas>           | <iframe src={blobUrl}>    |
  // | Text/JSON  | inline <pre>             | <iframe src={blobUrl}>    |
  // | Image      | <img src={blobUrl}>      | <img src={blobUrl}>       |
  // | Other      | "not supported" fallback | "not supported" fallback  |

  const preview = useMemo(() => {
    if (!file) {
      return (
        <Column flex={1} align="center" justify="center">
          {t("preview_not_supported_message")}
        </Column>
      );
    }

    // PDF
    if (isPdf(file)) {
      if (usePdfJs) {
        return <PdfJsViewer file={file} pageNumber={pageNumber} />;
      }
      if (fileUrl) {
        return (
          <iframe
            key={iframeParams}
            ref={iframeRef}
            src={fileUrl + (iframeParams || "")}
            title={t("file_content_title")}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        );
      }
    }

    // Text / JSON
    if (isText(file)) {
      if (usePdfJs && textContent !== null) {
        return (
          <pre
            style={{
              width: "100%",
              height: "100%",
              overflow: "auto",
              margin: 0,
              padding: "16px",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "monospace",
              fontSize: "14px",
            }}
          >
            {textContent}
          </pre>
        );
      }
      if (!usePdfJs && fileUrl) {
        return (
          <iframe
            key={iframeParams}
            ref={iframeRef}
            src={fileUrl + (iframeParams || "")}
            title={t("file_content_title")}
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        );
      }
    }

    // Image (same behavior regardless of usePdfJs)
    if (!hasImageError && isImage(file) && fileUrl) {
      return (
        <img
          src={fileUrl}
          alt={t("file_preview_alt_text")}
          onError={() => setHasImageError(true)}
          style={{ maxWidth: "100%", height: "auto" }}
        />
      );
    }

    // Unsupported file type
    return (
      <Column flex={1} align="center" justify="center">
        {t("preview_not_supported_message")}
      </Column>
    );
  }, [
    file,
    usePdfJs,
    pageNumber,
    iframeParams,
    hasImageError,
    fileUrl,
    textContent,
    t,
  ]);

  // ── Render ──

  return (
    <Column w="full" style={{ height: "60vh", maxHeight: "600px" }}>
      <Column flex={1} align="center" justify="center" overflow="hidden">
        {preview}
      </Column>
      {file && (
        <Row justify="center" gap={4} py={2}>
          <Button variant="ghost" onClick={handleDownload}>
            {t("download_file_button_text")}
          </Button>
          <Button variant="ghost" onClick={handleCopyLink}>
            {t("copy_link_button_text")}
          </Button>
        </Row>
      )}
    </Column>
  );
};

export default FilePreviewer;
