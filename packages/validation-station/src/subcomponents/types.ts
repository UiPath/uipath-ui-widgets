import type {
  BusinessRuleModel,
  DeleteFieldValueByPath,
  DeleteFieldValueByPathResult,
  DocumentViewerOptions,
  EvaluatedBusinessRulesForFieldValueDto,
  GoToPage,
  GoToPageResult,
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
import type { CSSProperties } from "react";
import type { SubcomponentDataSource } from "../useSubcomponentArtifacts.js";
import type { ValidationStationLanguage } from "../types.js";

/** Theme variants accepted by every DU standalone element. */
export type WcTheme = "light" | "dark" | "light-hc" | "dark-hc";

/**
 * Props common to every subcomponent wrapper: a data source (see
 * {@link SubcomponentDataSource}), shared-store linking, and presentation.
 */
export interface SubcomponentCommonProps extends SubcomponentDataSource {
  /**
   * Links this element's store to sibling standalone elements. Elements sharing
   * the same `instanceId` mirror each other's edits, selection, and document
   * type — pass the same value to a viewer + fields-form + table-editor to
   * compose them side by side. Immutable once mounted (set as an attribute
   * before the element connects). Omit for an isolated store.
   */
  instanceId?: string;
  theme?: WcTheme;
  language?: ValidationStationLanguage;
  isReadonly?: boolean;
  /**
   * Render the persistent element variant, which survives portal/DOM
   * detachment (e.g. tab switches) and is torn down via `forceDestroy()` when
   * this React component unmounts. Defaults to `false`.
   */
  persistent?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Command inputs shared by the editable subcomponents. */
export interface SubcomponentCommandProps {
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
  discardChanges?: { value: boolean };
}

/** Callbacks for the edit/state events shared by the compact VS-family elements. */
export interface SubcomponentStateEventProps {
  onLoaded?: (loaded: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
  onDocumentTypeChanged?: (documentTypeId: string) => void;
  onExtractionResultChanged?: (result: DuFramework.ExtractionResult) => void;
  onFieldValueSelected?: (details: IFieldValueDetailsDto) => void;
  onFieldValueChanged?: (details: IFieldValueDetailsDto) => void;
  onBusinessRulesEvaluated?: (
    rules: EvaluatedBusinessRulesForFieldValueDto[],
  ) => void;
  onSetFieldValueByPathResult?: (result: SetFieldValueByPathResult) => void;
  onSelectAndFocusFieldValueByPathResult?: (
    result: SelectAndFocusFieldValueByPathResult,
  ) => void;
  onDeleteFieldValueByPathResult?: (
    result: DeleteFieldValueByPathResult,
  ) => void;
}

// ─── Compact fields form ──────────────────────────────────────────────────────

export interface CompactFieldsFormProps
  extends
    SubcomponentCommonProps,
    SubcomponentCommandProps,
    SubcomponentStateEventProps {
  options?: IValidationStationOptions;
  /** Trigger a save; `{ validate: true }` validates before saving. */
  save?: { validate: boolean };
  /** Expose a "Save as draft" action. */
  enableSaveAsDraft?: boolean;
  /** Result of a `save` command. */
  onSaveResult?: (result: ISaveResult) => void;
  /** Fired when the user reports the document as an exception. */
  onReportExceptionComplete?: (documentId: string, reason: string) => void;
  /**
   * Fired when the user submits. The wrapper makes **no** API call — persist the
   * payload yourself, typically via the exported `submitValidatedDataToOrchestrator` helper
   * (ProcessExtractedData + bucket upload).
   */
  onSaveValidatedDataRequest?: (request: IVsSaveValidatedDataRequest) => void;
  /**
   * Fired when the user saves as draft. No API call — persist
   * `request.validatedData` yourself, typically via the exported
   * `saveValidatedDataAsDraftToOrchestrator` helper.
   */
  onSaveValidatedDataAsDraftRequest?: (
    request: IVsSaveValidatedDataAsDraftRequest,
  ) => void;
  /** Raw report-exception-request event. */
  onSaveExceptionReportRequest?: (
    request: IVsSaveExceptionReportRequest,
  ) => void;
}

// ─── Compact table editor ─────────────────────────────────────────────────────

export interface CompactTableEditorProps
  extends
    SubcomponentCommonProps,
    SubcomponentCommandProps,
    SubcomponentStateEventProps {
  options?: IValidationStationOptions;
  /** Enable the PDF table-selection round-trip controls. */
  isTableSelectionEnabled?: boolean;
  isDrawingTableSelectionCells?: boolean;
  /** Apply a host-driven PDF table selection result (`IPDFTableSelectionOutput`). */
  applyTableSelection?: unknown;
  /** Fires when the user starts/stops a PDF table selection (`IPDFTableSelectionInput | null`). */
  onTableSelectionEvent?: (selection: unknown) => void;
  /** Fires when the user closes the editor with "Done". */
  onClosed?: () => void;
}

// ─── Compact business rules ───────────────────────────────────────────────────

export interface CompactBusinessRulesProps
  extends
    SubcomponentCommonProps,
    SubcomponentCommandProps,
    SubcomponentStateEventProps {
  options?: IValidationStationOptions;
  /** Fires when the user expands (true) / collapses (false) the panel. */
  onBusinessRulesToggle?: (expanded: boolean) => void;
  /** Fires when the user clicks an evaluated rule. */
  onBusinessRuleClick?: (rule: BusinessRuleModel) => void;
}

// ─── Document viewer ──────────────────────────────────────────────────────────

export interface DocumentViewerProps extends SubcomponentCommonProps {
  options?: DocumentViewerOptions;
  /** Select a field by path and focus its document reference in the viewer. */
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  /** Navigate the document to a page. */
  goToPage?: GoToPage;
  onReady?: (ready: boolean) => void;
  onLoaded?: (loaded: boolean) => void;
  /** Fires when the user selects tokens in the viewer (`IPDFToken[]`). */
  onTokensSelect?: (tokens: unknown[]) => void;
  /** Fires when the viewer toggles between text and document (canvas) mode. */
  onTextModeChange?: (isTextMode: boolean) => void;
  onSelectAndFocusFieldValueByPathResult?: (
    result: SelectAndFocusFieldValueByPathResult,
  ) => void;
  onGoToPageResult?: (result: GoToPageResult) => void;
  /** Fires when the visible page changes. Detail is the 1-based page number. */
  onCurrentPageChange?: (page: number) => void;
  /** Fires once the document is ready. Detail is the total page count. */
  onPageCountChange?: (pageCount: number) => void;
}

// ─── Compact doc-type field ───────────────────────────────────────────────────

export interface CompactDocTypeFieldProps extends SubcomponentCommonProps {
  options?: IValidationStationOptions;
  onLoaded?: (loaded: boolean) => void;
  onDocumentTypeChanged?: (documentTypeId: string) => void;
  /** Fires when the dropdown panel opens (true) / closes (false). */
  onPanelOpenChange?: (open: boolean) => void;
}
