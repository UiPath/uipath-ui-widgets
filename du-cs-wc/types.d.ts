/**
 * Public TypeScript types for `@uipath/du-classification-station-wc`.
 *
 * Covers the **standalone** web component exposed by this package:
 *
 *   Classification Station (page thumbnails + document viewer + split/classify form):
 *     <ui-du-classification-station-standalone-wc-element>
 *     <ui-du-classification-station-standalone-wc-persistent-element>
 *
 * The standalone variant makes **no HTTP calls**. The consumer provides all
 * document data as JS properties, and persistence is handled by the host
 * listening to `saveClassificationRequest` / `saveClassificationAsDraftRequest` /
 * `saveExceptionReportRequest`.
 *
 * The package also registers `<ui-du-classification-station-wc-element>` (and a
 * persistent variant). That is the **cloud** element: it fetches the document
 * from Orchestrator storage buckets using an `authToken` + `platform` pair, and
 * is intended for UiPath-internal Action Center hosts. It is deliberately not
 * typed here — use the standalone element unless you are that host.
 */

import { DocumentEntity, DocumentTypeEntity, ResultsContentReference } from '@uipath/uipath-typescript/document-understanding';

/** Theme id accepted by the `theme` input. `future-light` and `future-dark` are the Apollo Modern themes. */
export type WcTheme = 'light' | 'dark' | 'light-hc' | 'dark-hc' | 'future-light' | 'future-dark';

// ─── Document viewer ──────────────────────────────────────────────────────────

/** Document-viewer interaction mode. */
export type InteractionType = 'Tokens' | 'Area' | 'UserChoice' | 'Text';

/** Visibility/behavior toggles for the document viewer's floating controls. */
export interface DocumentViewerFloatingButtonsOptions {
    /** Hide the text-view toggle button. */
    hideTextView?: boolean;
    /** Hide the interaction-type (selection mode) button. */
    hideInteractionTypeButton?: boolean;
    /** Interaction mode the viewer starts in. @default 'Tokens' */
    defaultInteractionType?: InteractionType;
    /** Hide the button that flips the viewer to the other side of the panel. */
    hideSwitchPanelSidesButton?: boolean;
    /** Hide the keyboard-shortcuts button. */
    hideKeyboardShortcutsButton?: boolean;
    /** Hide the in-document search button. */
    hideSearch?: boolean;
}

/** Fine-grained configuration for the document viewer. */
export interface DocumentViewerOptions {
    floatingButtonsOptions?: DocumentViewerFloatingButtonsOptions;
    /**
     * Auto-rotate a page when a rotation type is detected across a proportion of
     * the page's sections greater than this threshold.
     *
     * Accepted values: (0,1]. @default 0.7
     */
    autoRotationThreshold?: number;
    /**
     * Disable text/area selection in the viewer for apps that don't need it.
     * Also hides the interaction-type button, which only switches selection modes.
     */
    disableSelection?: boolean;
}

// ─── Classification results ───────────────────────────────────────────────────

/** Where a classified document starts and ends within the parent file. */
export interface IClassificationDocumentBoundsDTO {
    StartPage: number;
    PageCount: number;
    TextStartIndex: number;
    TextLength: number;
    /** Compressed page range (`'1-3,5'`). */
    PageRange?: string;
}

/** One classified document: a page range paired with the document type assigned to it. */
export interface IClassificationResultDTO {
    DocumentId: string;
    DocumentTypeId: string;
    Confidence: number;
    OcrConfidence: number;
    ClassifierName: string;
    DocumentBounds: IClassificationDocumentBoundsDTO;
    /** The OCR reference that justifies the classification, if one was assigned. */
    Reference: ResultsContentReference | null;
}

/**
 * The classification of a whole file — the payload of the `classificationResults`
 * input and of every save-request event.
 */
export interface IClassifierResultDTO {
    Classifications: IClassificationResultDTO[];
}

// ─── Exception reporting ──────────────────────────────────────────────────────

/** Payload of `saveExceptionReportRequest` — a document the validator could not classify. */
export interface IReportAsExceptionDTO {
    DocumentId: string;
    Reason: string | undefined;
}

// ─── Customization ────────────────────────────────────────────────────────────

/** Tenant-level feature toggles for the station. */
export interface IFeatureCustomization {
    /** Allows the validator to drag pages between classified groups. */
    EnablePageReordering?: boolean;
    /**
     * Turns the keyboard shortcuts off for every user, overriding the setting a
     * user picks in the keyboard-shortcuts dialog: the station's shortcuts stop
     * responding, their hints are hidden, and the document viewer menu drops its
     * "Show available keyboard shortcuts" entry. Inside the document viewer, the toolbar hints,
     * the search box's Enter navigation and the Alt+−, Alt++ and Alt+0 zoom keys
     * still work.
     */
    DisableKeyboardShortcuts?: boolean;
}

/**
 * Payload of the `customizationInfo` input. `FeatureCustomization: null` — the
 * element's default when the host assigns nothing — means "every customization off".
 */
export interface ICustomizationInfoDTO {
    FeatureCustomization: IFeatureCustomization | null;
}

// ─── Split output ─────────────────────────────────────────────────────────────

/** One document type paired with the compressed page range it covers (`'1-3,5'`). */
export interface SplitClassification {
    documentTypeId: string;
    pageRange: string;
}

/** Payload of the `splitClassifications` event. */
export interface SplitClassifications {
    split: SplitClassification[];
}

// ─── Save requests ────────────────────────────────────────────────────────────

/**
 * Payload of `saveClassificationRequest` — the user pressed **Save**.
 *
 * `classification` is the classification **after** the user's edits;
 * `automaticClassificationResults` is what the host originally supplied through the
 * `classificationResults` input, for hosts that want to diff the two.
 */
export interface ICsSaveClassificationRequest {
    documentId: string;
    classification: IClassifierResultDTO;
    automaticClassificationResults: IClassifierResultDTO | null;
}

/** Payload of `saveClassificationAsDraftRequest` — the user pressed **Save as draft**. */
export interface ICsSaveClassificationAsDraftRequest {
    documentId: string;
    classification: IClassifierResultDTO;
}

/** Payload of `saveExceptionReportRequest` — the user pressed **Report as exception**. */
export interface ICsSaveExceptionReportRequest {
    documentId: string;
    exceptionReport: IReportAsExceptionDTO;
}

// ─── Event map ────────────────────────────────────────────────────────────────

/**
 * Maps every custom-event name emitted by the standalone Classification Station
 * web component to the type carried in `CustomEvent.detail`.
 *
 * Note that `dirty` and `hasChanges` are **not** the same signal and neither is
 * derived from the other. `dirty` is a flag set by any mutation routed through the
 * station's dirtying path; `hasChanges` is a structural comparison of the current
 * classification against the one loaded (or last saved), and considers only group
 * count, each group's document type, each group's page count, and each page's
 * index / index-in-group. Assigning an OCR reference to a group sets `dirty` but
 * not `hasChanges`; a change that cancels out structurally can clear `hasChanges`
 * while `dirty` stays set.
 */
export interface IClassificationStationStandaloneWcEventMap {
    /** Unsaved changes (true) / clean (false). A flag, not a comparison — see above. */
    dirty: boolean;
    /** The classification differs structurally from the loaded one — see above. */
    hasChanges: boolean;
    /** The current split, as document type + compressed page range pairs. */
    splitClassifications: SplitClassifications;
    /**
     * The user asked to create a new document type. Only reachable when
     * `showCreateNewDocTypeOption` is set; the host owns the creation flow.
     */
    createNewDocType: void;
    /** The user pressed **Save** — the host must persist this. */
    saveClassificationRequest: ICsSaveClassificationRequest;
    /** The user pressed **Save as draft** — the host must persist this. */
    saveClassificationAsDraftRequest: ICsSaveClassificationAsDraftRequest;
    /** The user pressed **Report as exception** — the host routes the document onward. */
    saveExceptionReportRequest: ICsSaveExceptionReportRequest;
}

// ─── Element interfaces ───────────────────────────────────────────────────────

/**
 * Strongly-typed interface for `<ui-du-classification-station-standalone-wc-element>`.
 *
 * The standalone variant makes no HTTP calls. The consumer provides document data
 * as JS properties and persists by listening to the three save-request events.
 *
 * Object-valued inputs (`dom`, `docTypes`, `classificationResults`,
 * `customizationInfo`, `pdfSettings`, `pageUris`) **must be set as JS properties,
 * not HTML attributes** — Angular Elements cannot deserialise object JSON from
 * attributes. They are compared by reference, so mutating an object you already
 * assigned does nothing; assign a new one.
 */
export interface IClassificationStationStandaloneWcElement extends HTMLElement {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /**
     * Document identifier. The element renders an idle screen until this is set, so assign it
     * **last** — after the data inputs — and the station mounts exactly once with all of its data
     * already buffered, rather than mounting empty and having the inputs arrive underneath.
     */
    documentId: string | undefined;

    // ── Data inputs (replace the HTTP fetches of the cloud variant) ───────────

    /** Document object model (digitized document). */
    dom: DocumentEntity | undefined;
    /** Plain text content of the document. */
    text: string | undefined;
    /** Original document as a base64 data URL — drives the PDF/canvas viewer. */
    original: string | undefined;
    /**
     * The document types the validator may classify into — normally
     * `taxonomy.DocumentTypes`.
     */
    docTypes: DocumentTypeEntity[] | undefined;
    /**
     * The classification to load. Pass the validated (draft) results if the document
     * has been partially reviewed, otherwise the automatic classifier output. `null`
     * is meaningful — an unclassified document — and is distinct from leaving the
     * input unset, which keeps the element waiting.
     */
    classificationResults: IClassifierResultDTO | null | undefined;
    /**
     * Station customization. Defaults to `{ FeatureCustomization: null }` — every
     * customization off.
     */
    customizationInfo: ICustomizationInfoDTO;

    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: WcTheme;
    /** BCP-47 language code for the UI. Unsupported values are ignored. @default 'en' */
    language: string;
    /** When true, the component renders in read-only mode. @default false */
    isReadonly: boolean;
    /** When true, a "Save as draft" action is available. @default false */
    enableSaveAsDraft: boolean;
    /** PDF viewer settings. Type: the `IPDFSettings` / `DocumentSettings` shape. */
    pdfSettings: unknown;
    /** Pre-rendered page images, one per page, used instead of rendering the PDF. */
    pageUris: string[] | undefined;
    /** Enables token-level selection in the viewer. @default true */
    enableTokenFeatures: boolean;
    /** Allows pages to remain unassigned to any document type. @default true */
    allowNotClassifiedGroups: boolean;
    /** Renders a dedicated "not classified" group for unassigned pages. @default false */
    supportNotClassifiedGroups: boolean;
    /** Hides the keyboard-shortcuts panel. @default false */
    disableShortcutsPanel: boolean;
    /**
     * Offers a "create a new document type" entry in the type picker. The element
     * only emits `createNewDocType`; the host owns the creation flow. @default false
     */
    showCreateNewDocTypeOption: boolean;
    /** Overrides the label shown on the "not classified" group. */
    customNotClassifiedLabel: string | undefined;
    /** Document-viewer chrome and settings. Unset keeps the viewer as it is. */
    documentViewerOptions: DocumentViewerOptions | undefined;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof IClassificationStationStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IClassificationStationStandaloneWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof IClassificationStationStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IClassificationStationStandaloneWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Extends `IClassificationStationStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive portal
 * detachments (e.g. tab switches). Call `forceDestroy()` when the element is being
 * permanently removed (`ngOnDestroy` / `useEffect` cleanup / `componentWillUnmount`),
 * or the inner Angular component leaks.
 */
export interface IPersistentClassificationStationStandaloneWcElement extends IClassificationStationStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

// ─── React JSX props ──────────────────────────────────────────────────────────

/**
 * Props for `<ui-du-classification-station-standalone-wc-element>` in React JSX.
 *
 * React 18 — complex object inputs (`dom`, `docTypes`, `classificationResults`,
 * `customizationInfo`, `pdfSettings`, `pageUris`) must be set via a `ref` as JS
 * properties; React 18 serialises JSX props to HTML attributes and Angular
 * Elements cannot deserialise object JSON.
 *
 * React 19 — supports passing complex object props directly as JSX attributes.
 */
export interface IClassificationStationStandaloneWcJsxProps {
    // ── Setup + data inputs ───────────────────────────────────────────────────
    documentId?: string;
    dom?: DocumentEntity;
    text?: string;
    original?: string;
    docTypes?: DocumentTypeEntity[];
    classificationResults?: IClassifierResultDTO | null;
    customizationInfo?: ICustomizationInfoDTO;

    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: WcTheme;
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    /** JS property form. */
    enableSaveAsDraft?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'enable-save-as-draft'?: boolean;
    /** JS property form. */
    enableTokenFeatures?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'enable-token-features'?: boolean;
    /** JS property form. */
    allowNotClassifiedGroups?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'allow-not-classified-groups'?: boolean;
    /** JS property form. */
    supportNotClassifiedGroups?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'support-not-classified-groups'?: boolean;
    /** JS property form. */
    disableShortcutsPanel?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'disable-shortcuts-panel'?: boolean;
    /** JS property form. */
    showCreateNewDocTypeOption?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'show-create-new-doc-type-option'?: boolean;
    customNotClassifiedLabel?: string;
    documentViewerOptions?: DocumentViewerOptions;

    // ── Complex configuration inputs ──────────────────────────────────────────
    /** PDF viewer settings. Type: the `IPDFSettings` / `DocumentSettings` shape. */
    pdfSettings?: unknown;
    pageUris?: string[];

    // ── Common HTML attributes ────────────────────────────────────────────────
    id?: string;
    className?: string;
    class?: string;
    style?: string | Record<string, string | number>;
    title?: string;
    role?: string;
    tabIndex?: number;
    part?: string;
    slot?: string;
    draggable?: boolean;
    hidden?: boolean;
    // Allow arbitrary data-* / aria-* attributes while preserving strong typing
    [dataAttr: `data-${string}`]: string | number | boolean | null | undefined;
    [ariaAttr: `aria-${string}`]: string | number | boolean | null | undefined;
}

/** Props for `<ui-du-classification-station-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentClassificationStationStandaloneWcJsxProps = IClassificationStationStandaloneWcJsxProps;

// ─── Global type augmentations ────────────────────────────────────────────────

declare global {
    interface HTMLElementTagNameMap {
        'ui-du-classification-station-standalone-wc-element': IClassificationStationStandaloneWcElement;
        'ui-du-classification-station-standalone-wc-persistent-element': IPersistentClassificationStationStandaloneWcElement;
    }

    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'ui-du-classification-station-standalone-wc-element': IClassificationStationStandaloneWcJsxProps;
                'ui-du-classification-station-standalone-wc-persistent-element': IPersistentClassificationStationStandaloneWcJsxProps;
            }
        }
    }
}
