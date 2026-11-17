import type {
  IDocumentViewerWcEventMap,
  IDocumentViewerWcJsxProps,
} from "@uipath/du-document-viewer-wc";
import { useWcRef } from "./bindWcEvents.js";
import {
  convertToPersistentTag,
  DOCUMENT_VIEWER_TAG,
} from "./loadDocumentViewerWc.js";
import { loadingFallback, renderWcElement, wcStyle } from "./renderWc.js";
import { DocumentViewerLanguage, type DocumentViewerProps } from "./types.js";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";
import { useWcReady } from "./useWcReady.js";

/**
 * The Document Understanding document viewer on its own: renders a digitised
 * document's pages and text, lets the user search, zoom, rotate and select,
 * highlights content references, and reports the user's selection as one.
 *
 * It holds no extraction or classification data. Link it to a form yourself:
 * feed a selected value's `Reference` to `highlightReference`, every value's to
 * `passiveReferences`, and read the user's selection from `onReferenceSelect`.
 *
 * Takes its document pre-fetched (`artifacts`) or self-fetched from the bucket
 * paths on `data` (`sdk` + `data`) — see {@link DvArtifactsSource}.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  sdk,
  data,
  artifacts: providedArtifacts,
  theme = "light",
  language = DocumentViewerLanguage.English,
  options,
  highlightReference,
  passiveReferences,
  outlineReference,
  goToPage,
  persistent = false,
  className,
  style,
  onReady,
  onPageCountChange,
  onCurrentPageChange,
  onTextModeChange,
  onGoToPageResult,
  onReferenceSelect,
  onSwitchPanelSides,
}) => {
  const { artifacts, error } = useResolvedArtifacts({
    sdk,
    data,
    artifacts: providedArtifacts,
  });
  const tag = persistent
    ? convertToPersistentTag(DOCUMENT_VIEWER_TAG)
    : DOCUMENT_VIEWER_TAG;
  // Gate on the tag actually rendered, not always the base one.
  const wcReady = useWcReady(tag);

  const ref = useWcRef<IDocumentViewerWcEventMap>(
    {
      ready: onReady,
      pageCountChange: onPageCountChange,
      currentPageChange: onCurrentPageChange,
      textModeChange: onTextModeChange,
      goToPageResult: onGoToPageResult,
      referenceSelect: onReferenceSelect,
      switchPanelSides: onSwitchPanelSides,
    },
    persistent,
  );

  if (error || !artifacts || !wcReady) return loadingFallback(error);

  const props: IDocumentViewerWcJsxProps = {
    className,
    style: wcStyle(style),
    theme,
    language,
    options,
    dom: artifacts.dom,
    document: artifacts.original,
    text: artifacts.text,
    highlightReference,
    passiveReferences,
    outlineReference,
    goToPage,
  };

  return renderWcElement(tag, props, ref);
};
