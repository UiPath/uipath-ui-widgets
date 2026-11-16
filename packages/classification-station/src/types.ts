import type {
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  IClassificationDocumentBoundsDTO,
  IClassificationResultDTO,
  IClassifierResultDTO,
  ICsSaveClassificationAsDraftRequest,
  ICsSaveClassificationRequest,
  ICsSaveExceptionReportRequest,
  ICustomizationInfoDTO,
  IFeatureCustomization,
  InteractionType,
  IReportAsExceptionDTO,
  SplitClassification,
  SplitClassifications,
  WcTheme,
} from "@uipath/du-classification-station-wc";
import type { CsContentValidationData } from "@uipath/du-utils";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { CSSProperties } from "react";
import type { SaveClassificationResult } from "./saveClassificationUtil.js";

export type {
  // The bucket descriptor of a classification task, for self-fetching mode.
  CsContentValidationData,
  // `documentViewerOptions` and its members.
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  // The classification contracts the element loads and the save flows carry.
  IClassificationDocumentBoundsDTO,
  IClassificationResultDTO,
  IClassifierResultDTO,
  // Payloads of the save callbacks, for handlers declared outside JSX.
  ICsSaveClassificationAsDraftRequest,
  ICsSaveClassificationRequest,
  ICsSaveExceptionReportRequest,
  // Typing for `customizationInfo`.
  ICustomizationInfoDTO,
  IFeatureCustomization,
  InteractionType,
  IReportAsExceptionDTO,
  SaveClassificationResult,
  // Payload of `onSplitClassifications`.
  SplitClassification,
  SplitClassifications,
};

export enum TelemetryEvent {
  Load = "ClassificationStation.Load",
  /**
   * One event per submit. Its status is the persistence outcome where the
   * widget did the write-back, and the attempt where the host owns it.
   */
  Submit = "ClassificationStation.Submit",
  ExceptionRequest = "ClassificationStation.ExceptionRequest",
}

export enum TelemetryStatus {
  Success = "ClassificationStation.Success",
  Error = "ClassificationStation.Error",
}

/** The UI languages the Classification Station ships translations for. */
export enum ClassificationStationLanguage {
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
 * Theme id the element accepts. `future-light` and `future-dark` are the
 * Apollo Modern themes. The web component's own `WcTheme`.
 */
export type CsTheme = WcTheme;

/**
 * Everything the Classification Station needs to render one file: the
 * document types to classify into, the classification to review, the
 * digitised document model, and the document itself.
 *
 * Storage-agnostic — `fetchCsDocumentArtifacts` produces one of these from an
 * Orchestrator storage bucket, but a host holding the same pieces anywhere
 * else can build one by hand and pass it as the `artifacts` prop.
 */
export interface CsDocumentArtifacts {
  /**
   * The document types the reviewer may classify into — the taxonomy's
   * `DocumentTypes`, not the taxonomy itself.
   */
  docTypes: DuFramework.DocumentTypeEntity[];
  /**
   * The classification to load: the validated (draft) one once the reviewer
   * has saved one, else the classifier's. `null` is meaningful — it loads an
   * unclassified file.
   */
  classificationResults: IClassifierResultDTO | null;
  dom: DuFramework.DocumentEntity;
  text: string | undefined;
  /** The original document as a base64 data URL — drives the viewer. */
  original: string | undefined;
  /**
   * Station customization. Unset, every customization is off
   * (`{ FeatureCustomization: null }`).
   */
  customizationInfo?: ICustomizationInfoDTO;
}

/**
 * Where `ClassificationStation` gets its document. Two mutually-exclusive
 * modes:
 *
 * 1. **Pre-fetched** — pass `artifacts` (and usually `documentId`). No HTTP
 *    call is made.
 * 2. **Self-fetching** — pass `sdk` + `data`. The widget reads the artifacts
 *    from the bucket paths on `data`, scoped to the folder `data` names, and
 *    writes submits and drafts back to `ValidatedClassificationResultsPath`.
 *
 * Pass `artifacts` together with `sdk` + `data` to skip the fetch but keep the
 * built-in write-back.
 */
export interface CsArtifactsSource {
  /** SDK instance — required for self-fetching mode. */
  sdk?: UiPath;
  /**
   * The classification task's bucket descriptor — required for self-fetching
   * mode. Carries the bucket paths and the folder they live in (`FolderId` or
   * `FolderKey`).
   */
  data?: CsContentValidationData;
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: CsDocumentArtifacts;
  /** Document id. Falls back to `data.DocumentId`. */
  documentId?: string;
}

/**
 * The save flows `ClassificationStation` reports. Each always fires, and
 * always carries the request the web component produced.
 */
export interface CsSaveCallbacks {
  /**
   * The user pressed **Save**. `result` is present only when the widget
   * persisted the classification itself, i.e. when it has `sdk` + `data`
   * naming a folder. Otherwise the write-back is yours — the exported
   * `submitClassification` does what the widget would have done.
   *
   * Completing the Action Center task is always the host's.
   */
  onSubmit?: (
    request: ICsSaveClassificationRequest,
    result?: SaveClassificationResult,
  ) => void;
  /**
   * The user pressed **Save as draft**. Same contract as
   * {@link CsSaveCallbacks.onSubmit}; the host-side equivalent is
   * `saveClassificationAsDraft`.
   */
  onSaveAsDraft?: (
    request: ICsSaveClassificationAsDraftRequest,
    result?: SaveClassificationResult,
  ) => void;
  /**
   * The user reported the file as an exception. The reason lives at
   * `request.exceptionReport.Reason`. The widget never persists this one: route
   * it yourself, typically via `OrchestratorDuModule.submitExceptionReport(...)`.
   */
  onReportException?: (request: ICsSaveExceptionReportRequest) => void;
}

/**
 * The state events of the element, beyond the save flows. Mirrors the rest of
 * the web component's `IClassificationStationStandaloneWcEventMap`.
 */
export interface ClassificationStationEventProps {
  /**
   * Unsaved changes appeared (`true`) or were cleared. A flag set by any
   * mutation — gate an "unsaved work" prompt on it.
   */
  onDirtyChange?: (dirty: boolean) => void;
  /**
   * The classification differs structurally from the one loaded (or last
   * saved): group count, each group's document type and page count, and each
   * page's position. Assigning a reference sets `dirty` but not this.
   */
  onHasChangesChange?: (hasChanges: boolean) => void;
  /** The current split, as document type + compressed page range (`'1-3,5'`) pairs. */
  onSplitClassifications?: (split: SplitClassifications) => void;
  /**
   * The user asked to create a new document type. Only reachable with
   * `showCreateNewDocTypeOption`; the creation flow is the host's.
   */
  onCreateNewDocType?: () => void;
}

/** Props for `ClassificationStation`. See {@link CsArtifactsSource} for the data modes. */
export interface ClassificationStationProps
  extends CsArtifactsSource, CsSaveCallbacks, ClassificationStationEventProps {
  /** @default "light" */
  theme?: CsTheme;
  /** @default ClassificationStationLanguage.English */
  language?: ClassificationStationLanguage;
  /** Render without editing affordances. @default false */
  isReadonly?: boolean;
  /** Offer a **Save as draft** action. @default true */
  enableSaveAsDraft?: boolean;
  /**
   * Render the persistent element variant, which survives portal/DOM
   * detachment (e.g. tab switches) and is torn down via `forceDestroy()` when
   * the React component unmounts. @default false
   */
  persistent?: boolean;
  /** Document-viewer chrome and settings. */
  documentViewerOptions?: DocumentViewerOptions;
  /** Enables token-level selection in the viewer. @default true */
  enableTokenFeatures?: boolean;
  /** Allows pages to remain unassigned to any document type. @default true */
  allowNotClassifiedGroups?: boolean;
  /** Renders a dedicated "not classified" group for unassigned pages. @default false */
  supportNotClassifiedGroups?: boolean;
  /** Overrides the label of the "not classified" group. Pass it already localized. */
  customNotClassifiedLabel?: string;
  /** Hides the keyboard-shortcuts panel. @default false */
  disableShortcutsPanel?: boolean;
  /**
   * Offers "create a new document type" in the type picker; the element only
   * emits `onCreateNewDocType`. @default false
   */
  showCreateNewDocTypeOption?: boolean;
  /** PDF viewer settings (the `IPDFSettings` / `DocumentSettings` shape). */
  pdfSettings?: unknown;
  /** Pre-rendered page images, one per page, used instead of rendering the PDF. */
  pageUris?: string[];
  className?: string;
  style?: CSSProperties;
}
