export { ValidationStationLanguage } from "./types.js";
export type {
  BucketArtifacts,
  DeleteFieldValueByPath,
  IValidationStationOptions,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
  ValidationStationProps,
} from "./types.js";
export { ValidationStation } from "./ValidationStation.js";
export { useBucketArtifacts } from "./useBucketArtifacts.js";

// ─── Orchestrator persistence helpers (opt-in) ────────────────────────────────
// The widgets never call these — they emit the save payloads and the host
// persists them. Use these for the standard Orchestrator write (DU module
// ProcessExtractedData + zipped upload to the storage bucket), or write your own.
export {
  saveValidatedDataAsDraftToOrchestrator,
  submitValidatedDataToOrchestrator,
} from "./orchestratorPersistence.js";

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
