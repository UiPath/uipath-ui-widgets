import { loadValidationStationWebComponent } from "@uipath/du-shared-util-mfe";
import { useEffect, useState } from "react";
import type { ValidationStationProps } from "./types";
import { useBucketArtifacts } from "./useBucketArtifacts";

const DEFAULT_WC_ASSETS_URL = "node_modules/@uipath/du-validation-station-wc";

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
  wcAssetsUrl = DEFAULT_WC_ASSETS_URL,
}) => {
  const { artifacts, error } = useBucketArtifacts(sdk, data, folderId);
  const [wcLoadError, setWcLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadValidationStationWebComponent(document, wcAssetsUrl).catch((err) => {
      setWcLoadError(err instanceof Error ? err.message : String(err));
    });
  }, [wcAssetsUrl]);

  if (wcLoadError) {
    return <div>Failed to load validation station: {wcLoadError}</div>;
  }

  if (error) {
    return <div>Failed to load document artifacts: {error}</div>;
  }

  if (!artifacts) {
    return <div>Loading...</div>;
  }

  return (
    <ui-du-validation-station-standalone-wc-element
      documentId={data.DocumentId}
      taxonomy={artifacts.taxonomy}
      extractionResult={artifacts.extractionResult}
      dom={artifacts.dom}
      text={artifacts.text}
      customizationInfo={artifacts.customizationInfo}
      original={artifacts.original}
      theme={theme}
      language={language}
      isReadonly={isReadonly}
      enableSaveAsDraft={enableSaveAsDraft}
      options={options}
      save={save}
      discardChanges={discardChanges}
      setFieldValueByPath={setFieldValueByPath}
      selectAndFocusFieldValueByPath={selectAndFocusFieldValueByPath}
      deleteFieldValueByPath={deleteFieldValueByPath}
    />
  );
};
