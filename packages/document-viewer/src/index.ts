export { DocumentViewer } from "./DocumentViewer.js";
export { DocumentViewerLanguage } from "./types.js";
export type {
  DocumentViewerContentData,
  DocumentViewerEventProps,
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  DocumentViewerProps,
  DocumentViewerSelection,
  DvArtifactsSource,
  DvDocumentArtifacts,
  DvTheme,
  GoToPage,
  GoToPageResult,
  GoToPageTarget,
  InteractionType,
} from "./types.js";
export { useDvDocumentArtifacts } from "./useDvDocumentArtifacts.js";

// ─── Host-driven fetch ────────────────────────────────────────────────────────
export { fetchDvDocumentArtifacts } from "./bucketArtifactsUtil.js";

// ─── Web component loading ────────────────────────────────────────────────────
export {
  configureDocumentViewerWc,
  DOCUMENT_VIEWER_TAG,
} from "./loadDocumentViewerWc.js";
export type { DocumentViewerWcConfig } from "./loadDocumentViewerWc.js";
export { joinDeploymentUrl } from "./urlUtil.js";
