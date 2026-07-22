import type {
  IValidationStationStandaloneWcElement,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { toast, Toaster } from "@uipath/apollo-wind";
import { useEffect, useState } from "react";
import {
  VALIDATION_STATION_TAG,
  waitForWcElementReady,
} from "./loadValidationStationWc.js";
import {
  submitValidatedData,
  saveValidatedDataAsDraft,
} from "./saveValidatedDataUtil.js";
import {
  ValidationStationLanguage,
  type ValidationStationProps,
} from "./types.js";
import { useBucketArtifacts } from "./useBucketArtifacts.js";

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
  const [wcReady, setWcReady] = useState(false);
  const [wcError, setWcError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    waitForWcElementReady(VALIDATION_STATION_TAG).then(
      () => {
        if (!cancelled) setWcReady(true);
      },
      (e: unknown) => {
        if (!cancelled) setWcError(e instanceof Error ? e.message : String(e));
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div>Failed to load document artifacts: {error}</div>;
  }

  // The WC-load error message is self-descriptive (points at the plugin / served
  // path), so surface it as-is rather than spinning on "Loading..." forever.
  if (wcError) {
    return <div>{wcError}</div>;
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
        onSubmitComplete,
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
