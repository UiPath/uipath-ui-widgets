import type {
  ICompactFieldsFormStandaloneWcEventMap,
  ICompactFieldsFormStandaloneWcJsxProps,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { useWcRef } from "../bindWcEvents.js";
import { DU_WC_TAGS } from "../loadValidationStationWc.js";
import {
  saveValidatedDataAsDraft,
  submitValidatedData,
} from "../saveValidatedDataUtil.js";
import { TelemetryEvent, TelemetryStatus } from "../types.js";
import { trackTelemetry } from "../utils/telemetryUtils.js";
import { renderWcElement, resolveArtifacts } from "./shared.js";
import type { CompactFieldsFormProps } from "./types.js";
import { useWcElement } from "./useWcElement.js";

/**
 * React wrapper for `<ui-du-compact-fields-form-standalone-wc-element>` — the
 * extraction-fields panel without a document viewer. Save-capable: when an
 * `sdk` + `data` + folder id are available it auto-wires the submit / draft
 * flows (like `ValidationStation`); otherwise handle the raw save-request
 * events yourself.
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
  onSubmitComplete,
  onSaveAsDraftComplete,
  onReportExceptionComplete,
  onSaveValidatedDataRequest,
  onSaveValidatedDataAsDraftRequest,
  onSaveExceptionReportRequest,
}) => {
  const {
    artifacts,
    error,
    wcReady,
    tag,
    commonProps,
    canPersist,
    resolvedFolderId,
  } = useWcElement({
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

  // Auto-wire persistence only when a full self-fetching context is available
  // (canPersist); otherwise the raw save-request callbacks are the only signal.
  const handleSubmit = (request: IVsSaveValidatedDataRequest) => {
    onSaveValidatedDataRequest?.(request);
    if (canPersist) {
      submitValidatedData(sdk!, data!, resolvedFolderId!, request).then(
        (result) => {
          trackTelemetry(
            TelemetryEvent.Submit,
            result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
          );
          onSubmitComplete?.(result);
        },
      );
    }
  };

  const handleSaveAsDraft = (request: IVsSaveValidatedDataAsDraftRequest) => {
    onSaveValidatedDataAsDraftRequest?.(request);
    if (canPersist) {
      saveValidatedDataAsDraft(sdk!, data!, resolvedFolderId!, request).then(
        onSaveAsDraftComplete,
      );
    }
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
