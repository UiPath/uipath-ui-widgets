export { ValidationStationLanguage } from "./types.js";
export type { DuArtifactsSource } from "./useResolvedArtifacts.js";
export type {
  DeleteFieldValueByPath,
  DeleteFieldValueByPathResult,
  DuCommonProps,
  DuDocumentArtifacts,
  DuSaveCallbacks,
  DuTheme,
  EvaluatedBusinessRulesForFieldValueDto,
  IFieldValueDetailsDto,
  ISaveResult,
  IValidationStationOptions,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SelectAndFocusFieldValueByPathResult,
  SetFieldValueByPath,
  SetFieldValueByPathResult,
  ValidationStationEventProps,
  ValidationStationProps,
  VsSaveResultEventProps,
  VsStateEventProps,
} from "./types.js";
export { ValidationStation } from "./ValidationStation.js";
export { useDuDocumentArtifacts } from "./useDuDocumentArtifacts.js";

// ─── Host-driven fetch & persistence ──────────────────────────────────────────
export { fetchDuDocumentArtifacts } from "./bucketArtifactsUtil.js";
export {
  saveValidatedDataAsDraft,
  submitValidatedData,
} from "./saveValidatedDataUtil.js";

// ─── Web component loading ────────────────────────────────────────────────────
export {
  configureValidationStationWc,
  DU_WC_TAGS,
  VALIDATION_STATION_TAG,
} from "./loadValidationStationWc.js";
export type { ValidationStationWcConfig } from "./loadValidationStationWc.js";
export { joinDeploymentUrl } from "./urlUtil.js";

// ─── Subcomponents ────────────────────────────────────────────────────────────
export { CompactBusinessRules } from "./subcomponents/CompactBusinessRules.js";
export { CompactDocTypeField } from "./subcomponents/CompactDocTypeField.js";
export { CompactFieldsForm } from "./subcomponents/CompactFieldsForm.js";
export { CompactTableEditor } from "./subcomponents/CompactTableEditor.js";
export { DocumentViewer } from "./subcomponents/DocumentViewer.js";
export type {
  CompactBusinessRulesProps,
  CompactDocTypeFieldProps,
  CompactFieldsFormProps,
  CompactTableEditorProps,
  DocumentViewerProps,
  SubcomponentCommandProps,
  SubcomponentCommonProps,
} from "./subcomponents/types.js";
