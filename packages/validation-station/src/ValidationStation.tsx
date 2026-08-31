import type {
  IValidationStationStandaloneWcEventMap,
  IValidationStationStandaloneWcJsxProps,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "./bindWcEvents.js";
import {
  convertToPersistentTag,
  VALIDATION_STATION_TAG,
} from "./loadValidationStationWc.js";
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
 * bucket paths on `data` (`sdk` + `data`) — see {@link DuArtifactsSource}.
 *
 * Reports every event in the element's public
 * `IValidationStationStandaloneWcEventMap`: the save flows through
 * {@link DuSaveCallbacks}, and the edit, validity, command-outcome and panel
 * events through {@link ValidationStationEventProps}.
 */
export const ValidationStation: React.FC<ValidationStationProps> = ({
  sdk,
  data,
  artifacts: providedArtifacts,
  documentId: documentIdProp,
  theme = "light",
  language = ValidationStationLanguage.English,
  isReadonly = false,
  persistent = false,
  options,
  save,
  discardChanges,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  onSubmit,
  onSaveAsDraft,
  onReportException,
  onLoaded,
  onDirtyChange,
  onIsValidChange,
  onDocumentTypeChanged,
  onExtractionResultChanged,
  onFieldValueSelected,
  onFieldValueChanged,
  onBusinessRulesEvaluated,
  onSaveResult,
  onSetFieldValueByPathResult,
  onSelectAndFocusFieldValueByPathResult,
  onDeleteFieldValueByPathResult,
  onFieldsPanelWidthChanged,
  onFieldsPanelSideChanged,
}) => {
  const { artifacts, error, documentId } = useResolvedArtifacts({
    sdk,
    data,
    artifacts: providedArtifacts,
    documentId: documentIdProp,
  });
  const tag = persistent
    ? convertToPersistentTag(VALIDATION_STATION_TAG)
    : VALIDATION_STATION_TAG;
  // Gate on the tag actually rendered, not always the base one.
  const wcReady = useWcReady(tag);

  const { handleSubmit, handleSaveAsDraft, handleException } =
    createSaveHandlers(
      { sdk, data },
      { onSubmit, onSaveAsDraft, onReportException },
    );

  const ref = useWcRef<IValidationStationStandaloneWcEventMap>(
    {
      loaded: onLoaded,
      dirty: onDirtyChange,
      isValid: onIsValidChange,
      documentTypeChanged: onDocumentTypeChanged,
      extractionResultChanged: onExtractionResultChanged,
      fieldValueSelected: onFieldValueSelected,
      fieldValueChanged: onFieldValueChanged,
      businessRulesEvaluated: onBusinessRulesEvaluated,
      saveResult: onSaveResult,
      setFieldValueByPathResult: onSetFieldValueByPathResult,
      selectAndFocusFieldValueByPathResult:
        onSelectAndFocusFieldValueByPathResult,
      deleteFieldValueByPathResult: onDeleteFieldValueByPathResult,
      fieldsPanelWidthChanged: onFieldsPanelWidthChanged,
      fieldsPanelSideChanged: onFieldsPanelSideChanged,
      saveValidatedDataRequest: handleSubmit,
      saveValidatedDataAsDraftRequest: handleSaveAsDraft,
      saveExceptionReportRequest: handleException,
    },
    persistent,
  );

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

  return renderWcElement(tag, props, ref);
};
