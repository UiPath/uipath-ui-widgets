import type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { SaveValidatedDataResult } from "./orchestratorPersistence.js";

export type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
};

export enum TelemetryEvent {
  Load = "ValidationStation.Load",
  Submit = "ValidationStation.Submit",
  ExceptionRequest = "ValidationStation.ExceptionRequest",
}

export enum TelemetryStatus {
  Success = "ValidationStation.Success",
  Error = "ValidationStation.Error",
}

export enum ValidationStationLanguage {
  German = "de",
  English = "en",
  Spanish = "es",
  SpanishMexico = "es-MX",
  French = "fr",
  Japanese = "ja",
  Korean = "ko",
  Portuguese = "pt",
  PortugueseBrazil = "pt-BR",
  Romanian = "ro",
  Russian = "ru",
  Turkish = "tr",
  ChineseSimplified = "zh-CN",
  ChineseTraditional = "zh-TW",
}

export interface BucketArtifacts {
  taxonomy: DuFramework.DocumentTaxonomy;
  extractionResult: DuFramework.ExtractionResult;
  dom: DuFramework.DocumentEntity;
  text: string | undefined;
  customizationInfo: unknown;
  original: string | undefined;
}

export interface ValidationStationProps {
  sdk: UiPath;
  data: DuFramework.ContentValidationData;
  folderId?: number;
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  language?: ValidationStationLanguage;
  isReadonly?: boolean;
  options?: IValidationStationOptions;
  save?: { validate: boolean };
  discardChanges?: { value: boolean };
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
  /**
   * Fired when the user submits (`save={{ validate: true }}`). The widget makes
   * **no** API call — it hands you the edited extraction result, the automatic
   * one, and the taxonomy. Persist them with the exported
   * {@link submitValidatedDataToOrchestrator} helper (ProcessExtractedData + bucket upload) or
   * your own flow, then complete the task.
   */
  onSaveValidatedDataRequest?: (request: IVsSaveValidatedDataRequest) => void;
  /**
   * Fired when the user saves as draft (`save={{ validate: false }}`). No API
   * call — persist `request.validatedData` yourself, typically via the exported
   * {@link saveValidatedDataAsDraftToOrchestrator} helper.
   */
  onSaveValidatedDataAsDraftRequest?: (
    request: IVsSaveValidatedDataAsDraftRequest,
  ) => void;
  /**
   * Fired when the user reports the document as an exception. The widget does
   * NOT call any API for this flow — the host owns persistence (typically a
   * `OrchestratorDuModule.submitExceptionReport(taskId, documentId, reason, ...)`
   * call).
   */
  onReportExceptionComplete?: (documentId: string, reason: string) => void;
}
