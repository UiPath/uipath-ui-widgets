import type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { SaveValidatedDataResult } from "./saveValidatedDataUtil.js";

export type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
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
   * Fired after the submit flow (`save={{ validate: true }}`) finishes
   * (ProcessExtractedData + bucket upload). `result.success` is `false` on
   * any failure — the host app decides whether to retry, complete the task,
   * surface an error, etc.
   */
  onSubmitComplete?: (result: SaveValidatedDataResult) => void;
  /**
   * Fired after the save-as-draft flow (`save={{ validate: false }}`)
   * finishes (uploads `validatedData` straight to the bucket, no
   * `ProcessExtractedData` call).
   */
  onSaveAsDraftComplete?: (result: SaveValidatedDataResult) => void;
  /**
   * Fired when the user reports the document as an exception. The widget does
   * NOT call any API for this flow — the host owns persistence (typically a
   * `OrchestratorDuModule.submitExceptionReport(taskId, documentId, reason, ...)`
   * call).
   */
  onReportExceptionComplete?: (documentId: string, reason: string) => void;
}
