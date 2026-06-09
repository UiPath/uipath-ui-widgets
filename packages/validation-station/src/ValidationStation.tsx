import type {
  IValidationStationStandaloneWcElement,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { toast, Toaster } from "@uipath/apollo-wind";
import { useEffect, useState } from "react";
import { validationStationWcReady } from "./loadValidationStationWc";
import { saveValidatedData } from "./saveValidatedDataUtil";
import type { ValidationStationProps } from "./types";
import { useBucketArtifacts } from "./useBucketArtifacts";

export const ValidationStation: React.FC<ValidationStationProps> = ({
  sdk,
  data,
  folderId,
  theme,
  language,
  isReadonly,
  enableSaveAsDraft,
  options,
  save,
  discardChanges,
  setFieldValueByPath,
  selectAndFocusFieldValueByPath,
  deleteFieldValueByPath,
  onSaveComplete,
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

  const resolvedFolderId = folderId ?? data.FolderId;

  const refCallback = (el: IValidationStationStandaloneWcElement | null) => {
    if (!el) return;
    const onSaveRequest = (event: CustomEvent<IVsSaveValidatedDataRequest>) => {
      if (!resolvedFolderId) {
        toast.error(
          "[ValidationStation] cannot save: folderId is not available",
        );
        return;
      }
      saveValidatedData(sdk, data, resolvedFolderId, event.detail).then(
        (result) => {
          if (!result.success) {
            toast.error(
              `[ValidationStation] saveValidatedData failed: ${result.error}`,
            );
          }
          onSaveComplete?.(result);
        },
      );
    };
    el.addEventListener("saveValidatedDataRequest", onSaveRequest);
    return () => {
      el.removeEventListener("saveValidatedDataRequest", onSaveRequest);
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
        enableSaveAsDraft={enableSaveAsDraft}
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
