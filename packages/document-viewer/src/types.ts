import type {
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  DocumentViewerSelection,
  GoToPage,
  GoToPageResult,
  GoToPageTarget,
  InteractionType,
  WcTheme,
} from "@uipath/du-document-viewer-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { CSSProperties } from "react";

export type {
  DocumentViewerFloatingButtonsOptions,
  DocumentViewerOptions,
  // Payload of `onReferenceSelect`.
  DocumentViewerSelection,
  // The `goToPage` command and its outcome.
  GoToPage,
  GoToPageResult,
  GoToPageTarget,
  InteractionType,
};

export enum TelemetryEvent {
  Load = "DocumentViewer.Load",
}

export enum TelemetryStatus {
  Success = "DocumentViewer.Success",
  Error = "DocumentViewer.Error",
}

/** The UI languages the document viewer ships translations for. */
export enum DocumentViewerLanguage {
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
export type DvTheme = WcTheme;

/**
 * What the viewer renders: the digitised document model, plus the original
 * (enables the page view) and its text (enables the text view).
 *
 * The same `dom`, `original` and `text` members as the Validation Station's
 * `DuDocumentArtifacts` and the Classification Station's `CsDocumentArtifacts`,
 * so either can be passed as is.
 */
export interface DvDocumentArtifacts {
  /** The digitized document. Nothing renders without it. */
  dom: DuFramework.DocumentEntity;
  /** The original document as a base64 data URL. Enables the page view. */
  original: string | undefined;
  /** The document text. Enables the text view. */
  text: string | undefined;
}

/**
 * The bucket fields the viewer reads. A Validation Station task's
 * `ContentValidationData` and a Classification Station task's
 * `CsContentValidationData` both carry them, so either can be passed as is.
 */
export interface DocumentViewerContentData {
  BucketId?: number;
  /** The Orchestrator folder holding the bucket; supply this or `FolderKey`. */
  FolderId?: number;
  FolderKey?: string;
  DocumentId?: string;
  /** Required: the viewer renders nothing without the DOM. */
  DocumentObjectModelPath?: string | null;
  /** Optional: read when set, for the page view. */
  EncodedDocumentPath?: string | null;
  /** Optional: read when set, for the text view. */
  TextPath?: string | null;
}

/**
 * Where `DocumentViewer` gets its document. Two mutually-exclusive modes:
 *
 * 1. **Pre-fetched** — pass `artifacts`. No HTTP call is made.
 * 2. **Self-fetching** — pass `sdk` + `data`. The widget reads the DOM, the
 *    original and the text from the bucket paths on `data`, scoped to the
 *    folder `data` names. Nothing is written back: the viewer edits nothing.
 */
export interface DvArtifactsSource {
  /** SDK instance — required for self-fetching mode. */
  sdk?: UiPath;
  /** A task's bucket descriptor — required for self-fetching mode. */
  data?: DocumentViewerContentData;
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: DvDocumentArtifacts;
}

/** The element's events. Mirrors the web component's `IDocumentViewerWcEventMap`. */
export interface DocumentViewerEventProps {
  /** The document is rendered. */
  onReady?: (ready: boolean) => void;
  /** The document is rendered; detail is its page count. */
  onPageCountChange?: (pageCount: number) => void;
  /** Another page came into view (1-based), and once as the document loads. */
  onCurrentPageChange?: (page: number) => void;
  /** The user switched to the text view (`true`) or back. */
  onTextModeChange?: (isTextMode: boolean) => void;
  /** A `goToPage` command finished; `pageNumber` is `-1` when it failed. */
  onGoToPageResult?: (result: GoToPageResult) => void;
  /**
   * The user selected words, or cleared the selection (empty `Tokens`). The
   * `reference` has the shape of an extracted value's `Reference`.
   */
  onReferenceSelect?: (selection: DocumentViewerSelection) => void;
  /**
   * The user asked to move the viewer to the other side of your layout. The
   * element does not move itself. Hide the entry with
   * `options.floatingButtonsOptions.hideSwitchPanelSidesButton`.
   */
  onSwitchPanelSides?: () => void;
}

/** Props for `DocumentViewer`. See {@link DvArtifactsSource} for the data modes. */
export interface DocumentViewerProps
  extends DvArtifactsSource, DocumentViewerEventProps {
  /** @default "light" */
  theme?: DvTheme;
  /** @default DocumentViewerLanguage.English */
  language?: DocumentViewerLanguage;
  /** Which viewer controls show and how selection behaves. */
  options?: DocumentViewerOptions;
  /**
   * Highlights and scrolls to this content reference, e.g. the `Reference` of
   * the extracted value a sibling form selected. `null` clears it.
   */
  highlightReference?: DuFramework.ResultsContentReference | null;
  /**
   * Draws these as a passive highlight, e.g. every extracted value's
   * `Reference`. The user can hide it from the viewer menu, unless
   * `hideExtractedTokensToggle` is set.
   */
  passiveReferences?: readonly DuFramework.ResultsContentReference[] | null;
  /** Outlines this content reference, e.g. a hovered value. `null` clears it. */
  outlineReference?: DuFramework.ResultsContentReference | null;
  /**
   * Navigates to a page. Pass a new object for every navigation — the same
   * reference does not navigate again. Before `onReady`, it waits until then.
   */
  goToPage?: GoToPage;
  /**
   * Render the persistent element variant, which survives portal/DOM
   * detachment (e.g. tab switches) and is torn down via `forceDestroy()` when
   * the React component unmounts. @default false
   */
  persistent?: boolean;
  className?: string;
  style?: CSSProperties;
}
