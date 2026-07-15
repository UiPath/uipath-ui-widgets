import type {
  IDocumentViewerStandaloneWcEventMap,
  IDocumentViewerStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { DocumentViewerProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-document-viewer-standalone-wc-element>` — the
 * document/text viewer with no fields form or save flow. Share its store with a
 * fields-form / table-editor by passing the same `instanceId`.
 */
export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
  selectAndFocusFieldValueByPath,
  goToPage,
  onReady,
  onLoaded,
  onTokensSelect,
  onTextModeChange,
  onSelectAndFocusFieldValueByPathResult,
  onGoToPageResult,
  onCurrentPageChange,
  onPageCountChange,
  ...dataSource
}) => {
  const { artifacts, error, wcReady, tag, commonProps } = useWcElement({
    baseTag: DU_WC_TAGS.documentViewer,
    dataSource,
    common: {
      instanceId,
      theme,
      language,
      isReadonly,
      persistent,
      className,
      style,
    },
  });
  const ref = useWcRef<IDocumentViewerStandaloneWcEventMap>(
    {
      ready: onReady,
      loaded: onLoaded,
      tokensSelect: onTokensSelect,
      textModeChange: onTextModeChange,
      selectAndFocusFieldValueByPathResult:
        onSelectAndFocusFieldValueByPathResult,
      goToPageResult: onGoToPageResult,
      currentPageChange: onCurrentPageChange,
      pageCountChange: onPageCountChange,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { text, original, dom, taxonomy, extractionResult, customizationInfo } =
    gate.artifacts;

  const props: IDocumentViewerStandaloneWcJsxProps = {
    ...commonProps,
    options,
    text,
    document: original,
    dom,
    taxonomy,
    extractionResult,
    customizationInfo,
    selectAndFocusFieldValueByPath,
    goToPage,
  };

  return renderWcElement(tag, props, ref);
};
