import type {
  IValidationStationStandaloneWcElement,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { useEffect, useState } from "react";
import { validationStationWcReady } from "./loadValidationStationWc.js";
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
  onSaveValidatedDataRequest,
  onSaveValidatedDataAsDraftRequest,
  onReportExceptionComplete,
}) => {
  const { artifacts, error } = useBucketArtifacts(sdk, data, folderId);
  const [wcReady, setWcReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    validationStationWcReady.then(() => {
      if (!cancelled) setWcReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div>Failed to load document artifacts: {error}</div>;
  }

  if (!artifacts || !wcReady) {
    return <div>Loading...</div>;
  }

  const refCallback = (el: IValidationStationStandaloneWcElement | null) => {
    if (!el) return;

    // The widget performs no persistence: it emits the save payloads and the
    // host writes them back (see the exported submitValidatedDataToOrchestrator /
    // saveValidatedDataAsDraftToOrchestrator helpers). Telemetry marks the emit, not the
    // outcome — the host owns the API calls and their success/failure.
    const onSubmitRequest = (
      event: CustomEvent<IVsSaveValidatedDataRequest>,
    ) => {
      trackTelemetry(TelemetryEvent.Submit, TelemetryStatus.Success);
      onSaveValidatedDataRequest?.(event.detail);
    };

    const onSaveAsDraftRequest = (
      event: CustomEvent<IVsSaveValidatedDataAsDraftRequest>,
    ) => onSaveValidatedDataAsDraftRequest?.(event.detail);

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
  );
};
