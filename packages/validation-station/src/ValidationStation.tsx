import { loadValidationStationWebComponent } from "@uipath/du-shared-util-mfe";
import { useEffect } from "react";
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
  setFieldValue,
  setTableCellValue,
  deleteFieldValue,
  deleteTableCellValue,
  selectAndFocusFieldValue,
}) => {
  const { artifacts, error } = useBucketArtifacts(sdk, data, folderId);

  useEffect(() => {
    loadValidationStationWebComponent(
      document,
      "packages/validation-station/node_modules/@uipath/du-validation-station-wc",
    );
  }, []);

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
      setFieldValue={setFieldValue}
      setTableCellValue={setTableCellValue}
      deleteFieldValue={deleteFieldValue}
      deleteTableCellValue={deleteTableCellValue}
      selectAndFocusFieldValue={selectAndFocusFieldValue}
    />
  );
};
