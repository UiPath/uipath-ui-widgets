export { ValidationStationLanguage } from "./types.js";
export type {
  BucketArtifacts,
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
  ValidationStationProps,
} from "./types.js";
export { ValidationStation } from "./ValidationStation.js";
export { DU_VS_WC_BASE } from "./constants.js";
export {
  configureValidationStationWc,
  ensureValidationStationWcLoaded,
  type ValidationStationWcConfig,
} from "./loadValidationStationWc.js";
export { useBucketArtifacts } from "./useBucketArtifacts.js";

// ─── Subcomponents ────────────────────────────────────────────────────────────
export { CompactBusinessRules } from "./subcomponents/CompactBusinessRules.js";
export { CompactDocTypeField } from "./subcomponents/CompactDocTypeField.js";
export { CompactFieldsForm } from "./subcomponents/CompactFieldsForm.js";
export { CompactTableEditor } from "./subcomponents/CompactTableEditor.js";
export { DocumentViewer } from "./subcomponents/DocumentViewer.js";
export type { SubcomponentDataSource } from "./useSubcomponentArtifacts.js";
export type {
  CompactBusinessRulesProps,
  CompactDocTypeFieldProps,
  CompactFieldsFormProps,
  CompactTableEditorProps,
  DocumentViewerProps,
  SubcomponentCommandProps,
  SubcomponentCommonProps,
  SubcomponentStateEventProps,
} from "./subcomponents/types.js";
