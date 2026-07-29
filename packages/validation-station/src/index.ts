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
export { useBucketArtifacts } from "./useBucketArtifacts.js";

// ─── Web component loading ────────────────────────────────────────────────────
export {
  configureValidationStationWc,
  DU_WC_TAGS,
  VALIDATION_STATION_TAG,
} from "./loadValidationStationWc.js";
export type { ValidationStationWcConfig } from "./loadValidationStationWc.js";

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
