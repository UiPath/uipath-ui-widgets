import type {
  ICompactFieldsFormStandaloneWcEventMap,
  ICompactFieldsFormStandaloneWcJsxProps,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import { TelemetryEvent, TelemetryStatus } from "../types.js";
import { trackTelemetry } from "../utils/telemetryUtils.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactFieldsFormProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-fields-form-standalone-wc-element>` — the
 * extraction-fields panel without a document viewer. It renders the save
 * actions but performs no persistence: submit / save-as-draft / report-exception
 * are emitted to the host, which writes them back (see the exported
 * `submitValidatedDataToOrchestrator` / `saveValidatedDataAsDraftToOrchestrator` helpers).
 */
export const CompactFieldsForm: React.FC<CompactFieldsFormProps> = ({
  sdk,
  data,
  folderId,
  artifacts: providedArtifacts,
  documentId: documentIdProp,
  instanceId,
  theme,
  language,
  isReadonly,
  persistent,
  className,
  style,
  options,
  save,
  enableSaveAsDraft = true,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  discardChanges,
  onLoaded,
  onDirtyChange,
  onDocumentTypeChanged,
  onExtractionResultChanged,
  onFieldValueSelected,
  onFieldValueChanged,
  onBusinessRulesEvaluated,
  onSetFieldValueByPathResult,
  onSelectAndFocusFieldValueByPathResult,
  onDeleteFieldValueByPathResult,
  onSaveResult,
  onReportExceptionComplete,
  onSaveValidatedDataRequest,
  onSaveValidatedDataAsDraftRequest,
  onSaveExceptionReportRequest,
}) => {
  const { artifacts, error, wcReady, tag, commonProps } = useWcElement({
    baseTag: DU_WC_TAGS.compactFieldsForm,
    dataSource: {
      sdk,
      data,
      folderId,
      artifacts: providedArtifacts,
      documentId: documentIdProp,
    },
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

  // No persistence here — the payload goes to the host. Telemetry marks the
  // emit, not the outcome: the host owns the API calls and their result.
  const handleSubmit = (request: IVsSaveValidatedDataRequest) => {
    trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Success);
    onSaveValidatedDataRequest?.(request);
  };

  const handleSaveAsDraft = (request: IVsSaveValidatedDataAsDraftRequest) => {
    onSaveValidatedDataAsDraftRequest?.(request);
  };

  const handleException = (request: IVsSaveExceptionReportRequest) => {
    onSaveExceptionReportRequest?.(request);
    const reason =
      (request.exceptionReport as { Reason?: string } | null)?.Reason ?? "";
    trackTelemetry(TelemetryEvent.ExceptionRequest, TelemetryStatus.Success);
    onReportExceptionComplete?.(request.documentId, reason);
  };

  const ref = useWcRef<ICompactFieldsFormStandaloneWcEventMap>(
    {
      loaded: onLoaded,
      dirty: onDirtyChange,
      documentTypeChanged: onDocumentTypeChanged,
      extractionResultChanged: onExtractionResultChanged,
      fieldValueSelected: onFieldValueSelected,
      fieldValueChanged: onFieldValueChanged,
      businessRulesEvaluated: onBusinessRulesEvaluated,
      setFieldValueByPathResult: onSetFieldValueByPathResult,
      selectAndFocusFieldValueByPathResult:
        onSelectAndFocusFieldValueByPathResult,
      deleteFieldValueByPathResult: onDeleteFieldValueByPathResult,
      saveResult: onSaveResult,
      saveValidatedDataRequest: handleSubmit,
      saveValidatedDataAsDraftRequest: handleSaveAsDraft,
      saveExceptionReportRequest: handleException,
    },
    persistent,
  );

  const gate = resolveArtifacts(error, wcReady, artifacts);
  if (!gate.ready) return gate.fallback;
  const { taxonomy, extractionResult, customizationInfo } = gate.artifacts;

  const props: ICompactFieldsFormStandaloneWcJsxProps = {
    ...commonProps,
    enableSaveAsDraft,
    options,
    save,
    discardChanges,
    setFieldValueByPath,
    selectAndFocusFieldValueByPath,
    deleteFieldValueByPath,
    taxonomy,
    extractionResult,
    customizationInfo,
  };

  return renderWcElement(tag, props, ref);
};
