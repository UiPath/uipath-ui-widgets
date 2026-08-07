import type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
} from "@uipath/du-validation-station-wc";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { SaveValidatedDataResult } from "./saveValidatedDataUtil.js";
import type { DuArtifactsSource } from "./useResolvedArtifacts.js";

export type {
  DeleteFieldValueByPath,
  IValidationStationOptions,
  // Payloads of the save callbacks, for handlers declared outside JSX.
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SetFieldValueByPath,
};

export enum TelemetryEvent {
  Load = "ValidationStation.Load",
  /**
   * One event per submit. Its status is the persistence outcome where the
   * widget did the write-back, and the attempt where the host owns it.
   */
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

/**
 * Everything the Validation Station elements need to render one document:
 * the taxonomy, the extraction result to edit, the digitised document model,
 * and the document itself.
 *
 * Storage-agnostic — `fetchDuDocumentArtifacts` produces one of these from an
 * Orchestrator storage bucket, but a host holding the same pieces anywhere
 * else can build one by hand and pass it as the `artifacts` prop.
 */
export interface DuDocumentArtifacts {
  taxonomy: DuFramework.DocumentTaxonomy;
  extractionResult: DuFramework.ExtractionResult;
  dom: DuFramework.DocumentEntity;
  text: string | undefined;
  customizationInfo: unknown;
  original: string | undefined;
}

/**
 * The save flows every save-capable widget reports — `ValidationStation` and
 * `CompactFieldsForm`. Both implement them identically, so a host swapping one
 * for the other keeps its handlers.
 */
export interface DuSaveCallbacks {
  /**
   * The user submitted (`save={{ validate: true }}`). Always fires, and always
   * carries the request the web component produced.
   *
   * `result` is present only when the widget persisted the data itself, i.e.
   * when it has `sdk` + `data` + a resolved folder id. Otherwise the write-back
   * is yours — the exported `submitValidatedData` does what the widget would
   * have done for a bucket-backed document.
   */
  onSubmit?: (
    request: IVsSaveValidatedDataRequest,
    result?: SaveValidatedDataResult,
  ) => void;
  /**
   * The user saved a draft (`save={{ validate: false }}`). Same contract as
   * {@link DuSaveCallbacks.onSubmit}; the host-side equivalent is
   * `saveValidatedDataAsDraft`.
   */
  onSaveAsDraft?: (
    request: IVsSaveValidatedDataAsDraftRequest,
    result?: SaveValidatedDataResult,
  ) => void;
  /**
   * The user reported the document as an exception. The widget never persists
   * this in either mode, so there is no `result` — the host owns it, typically
   * via `OrchestratorDuModule.submitExceptionReport(...)`. The reason lives at
   * `request.exceptionReport.Reason`.
   */
  onReportException?: (request: IVsSaveExceptionReportRequest) => void;
}

/**
 * Props for the monolithic `ValidationStation`.
 *
 * The document data comes from a {@link DuArtifactsSource}: either
 * pre-fetched `artifacts` handed in directly, or `sdk` + `data` for the widget
 * to fetch from the bucket paths on `ContentValidationData`.
 */
export interface ValidationStationProps
  extends DuArtifactsSource, DuSaveCallbacks {
  theme?: "light" | "dark" | "light-hc" | "dark-hc";
  language?: ValidationStationLanguage;
  isReadonly?: boolean;
  options?: IValidationStationOptions;
  save?: { validate: boolean };
  discardChanges?: { value: boolean };
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
}
