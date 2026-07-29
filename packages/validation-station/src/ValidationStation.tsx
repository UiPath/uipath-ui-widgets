import type {
  IValidationStationStandaloneWcElement,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { toast, Toaster } from "@uipath/apollo-wind";
import { VALIDATION_STATION_TAG } from "./loadValidationStationWc.js";
import { useWcReady } from "./useWcReady.js";
import {
  submitValidatedData,
  saveValidatedDataAsDraft,
} from "./saveValidatedDataUtil.js";
import {
  TelemetryEvent,
  TelemetryStatus,
  ValidationStationLanguage,
  type ValidationStationProps,
} from "./types.js";
import { useBucketArtifacts } from "./useBucketArtifacts.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

export const ValidationStation: React.FC<ValidationStationProps> = ({
  sdk,
  data,
  folderId,
  theme = "light",
  language = ValidationStationLanguage.English,
  isReadonly = false,
  options,
  save,
  discardChanges,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  onSubmitComplete,
  onSaveAsDraftComplete,
  onReportExceptionComplete,
}) => {
  const { artifacts, error } = useBucketArtifacts(sdk, data, folderId);
  const wcReady = useWcReady(VALIDATION_STATION_TAG);

  if (error) {
    return <div>Failed to load document artifacts: {error}</div>;
  }

  if (!artifacts || !wcReady) {
    return <div>Loading...</div>;
  }

  const resolvedFolderId = folderId ?? data.FolderId;

  const refCallback = (el: IValidationStationStandaloneWcElement | null) => {
    if (!el) return;
    if (!resolvedFolderId) {
      toast.error(
        "folderId of Storage bucket is required. Provide it as a prop or ensure data.FolderId is set.",
      );
      return;
    }

    const onSubmitRequest = (event: CustomEvent<IVsSaveValidatedDataRequest>) =>
      submitValidatedData(sdk, data, resolvedFolderId, event.detail).then(
        (result) => {
          trackTelemetry(
            TelemetryEvent.Submit,
            result.success ? TelemetryStatus.Success : TelemetryStatus.Error,
          );
          onSubmitComplete?.(result);
        },
      );

    const onSaveAsDraftRequest = (
      event: CustomEvent<IVsSaveValidatedDataAsDraftRequest>,
    ) =>
      saveValidatedDataAsDraft(sdk, data, resolvedFolderId, event.detail).then(
        onSaveAsDraftComplete,
      );

    const onExceptionRequest = (
      event: CustomEvent<IVsSaveExceptionReportRequest>,
    ) => {
      const { documentId, exceptionReport } = event.detail;
      const reason =
        (exceptionReport as { Reason?: string } | null)?.Reason ?? "";
      trackTelemetry(TelemetryEvent.ExceptionRequest, TelemetryStatus.Success);
      onReportExceptionComplete?.(documentId, reason);
    };

    el.addEventListener("saveValidatedDataRequest", onSubmitRequest);
    el.addEventListener(
      "saveValidatedDataAsDraftRequest",
      onSaveAsDraftRequest,
    );
    el.addEventListener("saveExceptionReportRequest", onExceptionRequest);

    return () => {
      el.removeEventListener("saveValidatedDataRequest", onSubmitRequest);
      el.removeEventListener(
        "saveValidatedDataAsDraftRequest",
        onSaveAsDraftRequest,
      );
      el.removeEventListener("saveExceptionReportRequest", onExceptionRequest);
    };
  };

  return (
    <>
      <ui-du-validation-station-standalone-wc-element
        {...({ ref: refCallback } as {
          ref: React.Ref<IValidationStationStandaloneWcElement>;
        })}
        theme={theme}
        language={language}
        isReadonly={isReadonly}
        enableSaveAsDraft={true}
        documentId={data.DocumentId}
        taxonomy={artifacts.taxonomy}
        extractionResult={artifacts.extractionResult}
        dom={artifacts.dom}
        text={artifacts.text}
        customizationInfo={artifacts.customizationInfo}
        original={artifacts.original}
        options={options}
        save={save}
        discardChanges={discardChanges}
        setFieldValueByPath={setFieldValueByPath}
        selectAndFocusFieldValueByPath={selectAndFocusFieldValueByPath}
        deleteFieldValueByPath={deleteFieldValueByPath}
      />
      <Toaster position="top-right" />
    </>
  );
};
