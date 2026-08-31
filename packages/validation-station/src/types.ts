import type {
  DeleteFieldValueByPath,
  DeleteFieldValueByPathResult,
  EvaluatedBusinessRulesForFieldValueDto,
  IFieldValueDetailsDto,
  ISaveResult,
  IValidationStationOptions,
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SelectAndFocusFieldValueByPath,
  SelectAndFocusFieldValueByPathResult,
  SetFieldValueByPath,
  SetFieldValueByPathResult,
} from "@uipath/du-validation-station-wc";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { SaveValidatedDataResult } from "./saveValidatedDataUtil.js";
import type { DuArtifactsSource } from "./useResolvedArtifacts.js";

export type {
  DeleteFieldValueByPath,
  // Payloads of the state/command-result callbacks, so handlers declared
  // outside JSX can name their parameter.
  DeleteFieldValueByPathResult,
  EvaluatedBusinessRulesForFieldValueDto,
  IFieldValueDetailsDto,
  ISaveResult,
  IValidationStationOptions,
  // Payloads of the save callbacks, for handlers declared outside JSX.
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
  SaveValidatedDataResult,
  SelectAndFocusFieldValueByPath,
  SelectAndFocusFieldValueByPathResult,
  SetFieldValueByPath,
  SetFieldValueByPathResult,
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

export type DuTheme = "light" | "dark" | "light-hc" | "dark-hc";

/**
 * The inputs every DU element takes, whichever one you render — as opposed to
 * the data, commands and outputs that differ between them.
 */
export interface DuCommonProps {
  theme?: DuTheme;
  language?: ValidationStationLanguage;
  /** Render the document without editing affordances. */
  isReadonly?: boolean;
  /**
   * Render the persistent element variant, which survives portal/DOM
   * detachment (e.g. tab switches) and is torn down via `forceDestroy()` when
   * the React component unmounts. Defaults to `false`.
   */
  persistent?: boolean;
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
   * when it has `sdk` + `data` naming a folder. Otherwise the write-back
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
 * Callbacks for the edit/state events reported by the four widgets that share
 * the Validation Station's extraction store: the full `ValidationStation`, the
 * compact fields form, the table editor and the business-rules panel. One store
 * means one set of events — an edit or selection driven through any of them
 * reaches the others — so a host swapping one for another keeps its handlers.
 *
 * `DocumentViewer` (`loaded`, `selectAndFocusFieldValueByPathResult`) and
 * `CompactDocTypeField` (`loaded`, `documentTypeChanged`) overlap on a few of
 * these and declare them on their own props instead.
 *
 * Mirrors the web component's `IVsWcCommonStateEventMap`.
 */
export interface VsStateEventProps {
  /**
   * The element finished loading. The path-addressed command props need the
   * taxonomy and extraction result this signals, so gate them on it.
   */
  onLoaded?: (loaded: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onDocumentTypeChanged?: (documentTypeId: string) => void;
  /**
   * Every change to the extraction result, i.e. the host's window onto the
   * user's edits.
   *
   * Requires `options={{ emitDtoStateChanges: true }}`; the element defaults
   * the flag to `false`.
   */
  onExtractionResultChanged?: (result: DuFramework.ExtractionResult) => void;
  onFieldValueSelected?: (details: IFieldValueDetailsDto) => void;
  onFieldValueChanged?: (details: IFieldValueDetailsDto) => void;
  /** Field validation errors and business rules, re-evaluated. */
  onBusinessRulesEvaluated?: (
    rules: EvaluatedBusinessRulesForFieldValueDto[],
  ) => void;
  /** Outcome of the `setFieldValueByPath` command. */
  onSetFieldValueByPathResult?: (result: SetFieldValueByPathResult) => void;
  /** Outcome of the `selectAndFocusFieldValueByPath` command. */
  onSelectAndFocusFieldValueByPathResult?: (
    result: SelectAndFocusFieldValueByPathResult,
  ) => void;
  /** Outcome of the `deleteFieldValueByPath` command. */
  onDeleteFieldValueByPathResult?: (
    result: DeleteFieldValueByPathResult,
  ) => void;
}

/**
 * Reported by the two widgets that have a `save` command: `ValidationStation`
 * and `CompactFieldsForm`. Composed alongside {@link VsStateEventProps} rather
 * than extending it, so the table editor and business-rules panel can take the
 * state events on their own.
 *
 * Together the two make up the web component's `IVsWcCommonEventMap`.
 */
export interface VsSaveResultEventProps {
  /** Outcome of a `save` command. */
  onSaveResult?: (result: ISaveResult) => void;
}

/**
 * The output surface unique to the full `ValidationStation` element: overall
 * validity plus the document-viewer panel layout. Mirrors the web component's
 * `IVsWcSharedEventMap`.
 */
export interface ValidationStationEventProps
  extends VsStateEventProps, VsSaveResultEventProps {
  /**
   * Validity changed. `true` when no critical (Must) business rule is broken and
   * no field value fails validation — the element weighs both, and counts every
   * validation error as Must.
   */
  onIsValidChange?: (isValid: boolean) => void;
  /** The fields panel was resized. Detail is the width in pixels. */
  onFieldsPanelWidthChanged?: (width: number) => void;
  /** The fields panel moved to the other side of the document viewer. */
  onFieldsPanelSideChanged?: (side: "left" | "right") => void;
}

/**
 * Props for the monolithic `ValidationStation`.
 *
 * The document data comes from a {@link DuArtifactsSource}: either
 * pre-fetched `artifacts` handed in directly, or `sdk` + `data` for the widget
 * to fetch from the bucket paths on `ContentValidationData`.
 */
export interface ValidationStationProps
  extends
    DuArtifactsSource,
    DuCommonProps,
    DuSaveCallbacks,
    ValidationStationEventProps {
  options?: IValidationStationOptions;
  save?: { validate: boolean };
  discardChanges?: { value: boolean };
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
}
