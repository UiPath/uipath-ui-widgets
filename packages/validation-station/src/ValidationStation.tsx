import type {
  IValidationStationStandaloneWcEventMap,
  IValidationStationStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "./bindWcEvents.js";
import { VALIDATION_STATION_TAG } from "./loadValidationStationWc.js";
import { createSaveHandlers } from "./saveHandlers.js";
import { renderWcElement, resolveArtifacts } from "./subcomponents/shared.js";
import {
  ValidationStationLanguage,
  type ValidationStationProps,
} from "./types.js";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";
import { useWcReady } from "./useWcReady.js";

/**
 * The all-in-one Document Understanding Validation Station: document viewer,
 * fields form, table editor, business rules and save actions in one element.
 *
 * Takes its document either pre-fetched (`artifacts`) or self-fetched from the
 * bucket paths on `data` (`sdk` + `data` + folder id) — see
 * {@link DuArtifactsSource}.
 */
export const ValidationStation: React.FC<ValidationStationProps> = ({
  sdk,
  data,
  folderId,
  artifacts: providedArtifacts,
  documentId: documentIdProp,
  theme = "light",
  language = ValidationStationLanguage.English,
  isReadonly = false,
  options,
  save,
  discardChanges,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  onSubmit,
  onSaveAsDraft,
  onReportException,
}) => {
  const { artifacts, error, documentId, canPersist, resolvedFolderId } =
    useResolvedArtifacts({
      sdk,
      data,
      folderId,
      artifacts: providedArtifacts,
      documentId: documentIdProp,
    });
  const wcReady = useWcReady(VALIDATION_STATION_TAG);

  const { handleSubmit, handleSaveAsDraft, handleException } =
    createSaveHandlers(
      { sdk, data, resolvedFolderId, canPersist },
      { onSubmit, onSaveAsDraft, onReportException },
    );

  const ref = useWcRef<IValidationStationStandaloneWcEventMap>({
    saveValidatedDataRequest: handleSubmit,
    saveValidatedDataAsDraftRequest: handleSaveAsDraft,
    saveExceptionReportRequest: handleException,
  });

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;

  const props: IValidationStationStandaloneWcJsxProps = {
    theme,
    language,
    isReadonly,
    enableSaveAsDraft: true,
    documentId,
    taxonomy: gate.artifacts.taxonomy,
    extractionResult: gate.artifacts.extractionResult,
    dom: gate.artifacts.dom,
    text: gate.artifacts.text,
    customizationInfo: gate.artifacts.customizationInfo,
    original: gate.artifacts.original,
    options,
    save,
    discardChanges,
    setFieldValueByPath,
    selectAndFocusFieldValueByPath,
    deleteFieldValueByPath,
  };

  return renderWcElement(VALIDATION_STATION_TAG, props, ref);
};
