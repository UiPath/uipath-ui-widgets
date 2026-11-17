import type {
  IClassificationStationStandaloneWcEventMap,
  IClassificationStationStandaloneWcJsxProps,
} from "@uipath/du-classification-station-wc";
import { useWcRef } from "./bindWcEvents.js";
import {
  CLASSIFICATION_STATION_TAG,
  convertToPersistentTag,
} from "./loadClassificationStationWc.js";
import { loadingFallback, renderWcElement, wcStyle } from "./renderWc.js";
import { createSaveHandlers } from "./saveHandlers.js";
import {
  ClassificationStationLanguage,
  type ClassificationStationProps,
} from "./types.js";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";
import { useWcReady } from "./useWcReady.js";

/**
 * The Document Understanding Classification Station: page thumbnails, the
 * document viewer and the split/classify form, for a reviewer to confirm or
 * correct how a file was split into documents and which type each one is.
 *
 * Takes its file pre-fetched (`artifacts`) or self-fetched from the bucket
 * paths on `data` (`sdk` + `data`) — see {@link CsArtifactsSource}. Reports
 * every event in the element's `IClassificationStationStandaloneWcEventMap`:
 * the save flows through {@link CsSaveCallbacks}, the rest through
 * {@link ClassificationStationEventProps}.
 */
export const ClassificationStation: React.FC<ClassificationStationProps> = ({
  sdk,
  data,
  artifacts: providedArtifacts,
  documentId: documentIdProp,
  theme = "light",
  language = ClassificationStationLanguage.English,
  isReadonly = false,
  enableSaveAsDraft = true,
  persistent = false,
  documentViewerOptions,
  enableTokenFeatures,
  allowNotClassifiedGroups,
  supportNotClassifiedGroups,
  customNotClassifiedLabel,
  disableShortcutsPanel,
  showCreateNewDocTypeOption,
  pdfSettings,
  pageUris,
  className,
  style,
  onSubmit,
  onSaveAsDraft,
  onReportException,
  onDirtyChange,
  onHasChangesChange,
  onSplitClassifications,
  onCreateNewDocType,
}) => {
  const { artifacts, error, documentId } = useResolvedArtifacts({
    sdk,
    data,
    artifacts: providedArtifacts,
    documentId: documentIdProp,
  });
  const tag = persistent
    ? convertToPersistentTag(CLASSIFICATION_STATION_TAG)
    : CLASSIFICATION_STATION_TAG;
  // Gate on the tag actually rendered, not always the base one.
  const wcReady = useWcReady(tag);

  const { handleSubmit, handleSaveAsDraft, handleException } =
    createSaveHandlers(
      { sdk, data },
      { onSubmit, onSaveAsDraft, onReportException },
    );

  const ref = useWcRef<IClassificationStationStandaloneWcEventMap>(
    {
      dirty: onDirtyChange,
      hasChanges: onHasChangesChange,
      splitClassifications: onSplitClassifications,
      createNewDocType: onCreateNewDocType,
      saveClassificationRequest: handleSubmit,
      saveClassificationAsDraftRequest: handleSaveAsDraft,
      saveExceptionReportRequest: handleException,
    },
    persistent,
  );

  if (error || !artifacts || !wcReady) return loadingFallback(error);

  const props: IClassificationStationStandaloneWcJsxProps = {
    className,
    style: wcStyle(style),
    theme,
    language,
    isReadonly,
    enableSaveAsDraft,
    documentViewerOptions,
    enableTokenFeatures,
    allowNotClassifiedGroups,
    supportNotClassifiedGroups,
    customNotClassifiedLabel,
    disableShortcutsPanel,
    showCreateNewDocTypeOption,
    pdfSettings,
    pageUris,
    dom: artifacts.dom,
    text: artifacts.text,
    original: artifacts.original,
    docTypes: artifacts.docTypes,
    classificationResults: artifacts.classificationResults,
    customizationInfo: artifacts.customizationInfo,
    // Last on purpose: the element shows an idle screen until `documentId`
    // arrives, so assigning it after every data input mounts the station once,
    // with its data in place.
    documentId,
  };

  return renderWcElement(tag, props, ref);
};
