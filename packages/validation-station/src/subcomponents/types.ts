import type {
  BusinessRuleModel,
  DeleteFieldValueByPath,
  DocumentViewerOptions,
  GoToPage,
  GoToPageResult,
  IValidationStationOptions,
  SelectAndFocusFieldValueByPath,
  SelectAndFocusFieldValueByPathResult,
  SetFieldValueByPath,
} from "@uipath/du-validation-station-wc";
import type { CSSProperties } from "react";
import type {
  DuArtifactsSource,
  ValidationStationArtifactsSource,
} from "../useResolvedArtifacts.js";
import type {
  DuCommonProps,
  DuSaveCallbacks,
  VsAnyRepresentationStateEventProps,
  VsSaveResultEventProps,
  VsStateEventProps,
} from "../types.js";

/** Shared-store linking and presentation, common to every subcomponent wrapper. */
interface SubcomponentPresentationProps extends DuCommonProps {
  /**
   * Links this element's store to sibling standalone elements. Elements sharing
   * the same `instanceId` mirror each other's edits, selection, and document
   * type — pass the same value to a viewer + fields-form + table-editor to
   * compose them side by side. Immutable once mounted (set as an attribute
   * before the element connects). Omit for an isolated store.
   */
  instanceId?: string;

  className?: string;
  style?: CSSProperties;
}

/**
 * Props common to the subcomponent wrappers that take Document Understanding
 * documents only — `CompactBusinessRules` and `CompactDocTypeField`: a data
 * source (see {@link DuArtifactsSource}), shared-store linking, and
 * presentation.
 */
export interface SubcomponentCommonProps
  extends DuArtifactsSource, SubcomponentPresentationProps {}

/**
 * Props common to the subcomponent wrappers that take a document in either
 * representation — `CompactFieldsForm`, `CompactTableEditor` and
 * `DocumentViewer`: a data source that may be an IXP document (pre-fetched
 * `IxpDocumentArtifacts`, or `sdk` + `processedDocument` — see
 * {@link ValidationStationArtifactsSource}), shared-store linking, and
 * presentation.
 *
 * Elements linked through one `instanceId` must all be given the same
 * representation.
 */
export interface IxpCapableSubcomponentCommonProps
  extends ValidationStationArtifactsSource, SubcomponentPresentationProps {}

/** Command inputs shared by the editable subcomponents. */
export interface SubcomponentCommandProps {
  setFieldValueByPath?: SetFieldValueByPath;
  selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
  deleteFieldValueByPath?: DeleteFieldValueByPath;
  discardChanges?: { value: boolean };
}

// ─── Compact fields form ──────────────────────────────────────────────────────

export interface CompactFieldsFormProps
  extends
    IxpCapableSubcomponentCommonProps,
    SubcomponentCommandProps,
    VsAnyRepresentationStateEventProps,
    VsSaveResultEventProps,
    DuSaveCallbacks {
  options?: IValidationStationOptions;
  save?: { validate: boolean };
  enableSaveAsDraft?: boolean;
}

// ─── Compact table editor ─────────────────────────────────────────────────────

export interface CompactTableEditorProps
  extends
    IxpCapableSubcomponentCommonProps,
    SubcomponentCommandProps,
    VsAnyRepresentationStateEventProps {
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
  extends SubcomponentCommonProps, SubcomponentCommandProps, VsStateEventProps {
  options?: IValidationStationOptions;
  /** Fires when the user expands (true) / collapses (false) the panel. */
  onBusinessRulesToggle?: (expanded: boolean) => void;
  /** Fires when the user clicks an evaluated rule. */
  onBusinessRuleClick?: (rule: BusinessRuleModel) => void;
}

// ─── Document viewer ──────────────────────────────────────────────────────────

export interface DocumentViewerProps extends IxpCapableSubcomponentCommonProps {
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
