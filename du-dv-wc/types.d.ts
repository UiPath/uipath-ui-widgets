/**
 * Public TypeScript types for `@uipath/du-document-viewer-wc`.
 *
 * Covers the document viewer web component:
 *
 *   <ui-du-document-viewer-wc-element>
 *   <ui-du-document-viewer-wc-persistent-element>
 *
 * The element is the document viewer Validation Station and Classification Station share, with no
 * station behind it. It makes no HTTP calls and keeps no extraction or classification state: the
 * host assigns the document as JS properties, and links the viewer to its other elements through
 * DU content references — `highlightReference`, `passiveReferences` and `outlineReference` in,
 * `referenceSelect` out.
 */

import type {
    DocumentEntity,
    ResultsContentReference,
} from '@uipath/uipath-typescript/document-understanding';

/** Theme id accepted by the `theme` input. `future-light` and `future-dark` are the Apollo Modern themes. */
export type WcTheme = 'light' | 'dark' | 'light-hc' | 'dark-hc' | 'future-light' | 'future-dark';

// ─── Options ──────────────────────────────────────────────────────────────────

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
    /**
     * Hide the button that asks the host to move the viewer to the other side of its layout
     * (`switchPanelSides`).
     */
    hideSwitchPanelSidesButton?: boolean;
    /** Hide the keyboard-shortcuts button. */
    hideKeyboardShortcutsButton?: boolean;
    /** Hide the in-document search button. */
    hideSearch?: boolean;
    /** Hide the menu entry that shows or hides the `passiveReferences` highlight. */
    hideExtractedTokensToggle?: boolean;
}

/**
 * Fine-grained configuration for the document viewer. The same shape the Validation Station and
 * Classification Station elements take as their document-viewer options.
 */
export interface DocumentViewerOptions {
    floatingButtonsOptions?: DocumentViewerFloatingButtonsOptions;
    /**
     * Auto-rotate a page when a rotation type is detected across a proportion of the page's
     * sections greater than this threshold.
     *
     * Accepted values: (0,1]. @default 0.7
     */
    autoRotationThreshold?: number;
    /**
     * Disable text/area selection. Also hides the interaction-type button, which only switches
     * selection modes.
     */
    disableSelection?: boolean;
}

// ─── Page navigation ──────────────────────────────────────────────────────────

export type GoToPageTarget = number | 'next' | 'previous' | 'first' | 'last';

/**
 * Programmatic page-navigation command.
 *
 * Set as a JS property and assign a NEW object reference on every call — re-assigning the same
 * reference does not navigate again. A command assigned before the element is `ready` is queued
 * and runs once it is.
 */
export interface GoToPage {
    /**
     * Page to navigate to. A number is a 1-based page number; the keywords move relative to the
     * current page (`next`/`previous`) or to the document bounds (`first`/`last`). Out-of-range
     * numbers are clamped to the first/last page.
     */
    target: GoToPageTarget;
    /** Scroll behavior used to bring the page into view. @default 'instant' */
    behavior?: ScrollBehavior;
}

export interface GoToPageResult {
    success: boolean;
    error?: string;
    /** The resolved 1-based page number after clamping, or -1 when the command failed. */
    pageNumber: number;
}

// ─── Selection ────────────────────────────────────────────────────────────────

/** What the user selected in the viewer, as `referenceSelect` emits it. */
export interface DocumentViewerSelection {
    /** The selected words, in reading order, separated by spaces. */
    text: string;
    /**
     * Where the selection is, in the shape a DU extraction value's `Reference` takes: one token per
     * page, each box as `[top, left, width, height]` in page units. Empty `Tokens` when the
     * selection was cleared.
     */
    reference: ResultsContentReference;
}

// ─── Events ───────────────────────────────────────────────────────────────────

/** Maps every custom-event name the element emits to the type carried in `CustomEvent.detail`. */
export interface IDocumentViewerWcEventMap {
    /** Fires once the document is rendered. */
    ready: boolean;
    /** Fires once the document is rendered. Detail is the total number of pages. */
    pageCountChange: number;
    /** Fires when the visible page changes (scroll or `goToPage`). Detail is the 1-based page number. */
    currentPageChange: number;
    /** Fires when the viewer switches to the text view (`true`) or back to the page view (`false`). */
    textModeChange: boolean;
    /** Result of the `goToPage` command. */
    goToPageResult: GoToPageResult;
    /** Fires when the user selects words, or clears the selection. */
    referenceSelect: DocumentViewerSelection;
    /**
     * Fires when the user asks to move the viewer to the other side of the host's layout. The
     * element does not move itself; the host decides.
     */
    switchPanelSides: void;
}

// ─── Element interfaces ───────────────────────────────────────────────────────

/**
 * Strongly-typed interface for `<ui-du-document-viewer-wc-element>`.
 *
 * Object-valued inputs must be assigned as JS properties, not HTML attributes: Angular Elements
 * cannot deserialise object JSON from attributes.
 */
export interface IDocumentViewerWcElement extends HTMLElement {
    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme. @default 'light' */
    theme: WcTheme;
    /** BCP-47 language code for the UI; an unsupported one is ignored. @default 'en' */
    language: string;
    /** Which viewer controls show and how selection behaves. */
    options: DocumentViewerOptions | undefined;

    // ── Content inputs ────────────────────────────────────────────────────────

    /** The digitized document. Required in every view mode: nothing renders without it. */
    dom: DocumentEntity | undefined;
    /** The original document as a base64 data URL. Enables the page view. */
    document: string | undefined;
    /** The document text. Enables the text view; with `document` too, the viewer can switch. */
    text: string | undefined;

    // ── Command inputs ────────────────────────────────────────────────────────

    /**
     * The content to highlight and scroll to, such as the `Reference` of the extraction value a
     * sibling element selected. `null` clears the highlight.
     */
    highlightReference: ResultsContentReference | null | undefined;
    /**
     * The content drawn as a passive highlight, such as the `Reference` of every extracted value.
     * The user can hide it from the viewer's menu, unless `hideExtractedTokensToggle` is set.
     */
    passiveReferences: readonly ResultsContentReference[] | null | undefined;
    /**
     * The content to outline, such as the `Reference` of the value the user hovers in a sibling
     * element. `null` clears the outline.
     */
    outlineReference: ResultsContentReference | null | undefined;
    /** Navigate to a page. Assign a new `GoToPage` reference for every navigation. */
    goToPage: GoToPage | undefined;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof IDocumentViewerWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IDocumentViewerWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof IDocumentViewerWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IDocumentViewerWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Strongly-typed interface for `<ui-du-document-viewer-wc-persistent-element>`: the same element,
 * kept alive across DOM detachment (portals, tab switches). Call `forceDestroy()` when removing it
 * for good, or the inner component leaks.
 */
export interface IPersistentDocumentViewerWcElement extends IDocumentViewerWcElement {
    forceDestroy(): void;
}

// ─── JSX ──────────────────────────────────────────────────────────────────────

/**
 * Props for `<ui-du-document-viewer-wc-element>` in React JSX.
 *
 * React 18 sets JSX props as attributes, so assign the object inputs (`dom`, `options`,
 * `highlightReference`, `passiveReferences`, `outlineReference`, `goToPage`) through a `ref` there. React 19 sets them as properties.
 */
export interface IDocumentViewerWcJsxProps {
    id?: string;
    className?: string;
    class?: string;
    style?: string | Record<string, string | number>;
    title?: string;
    role?: string;
    tabIndex?: number;
    part?: string;
    slot?: string;
    hidden?: boolean;
    [dataAttr: `data-${string}`]: string | number | boolean | null | undefined;
    [ariaAttr: `aria-${string}`]: string | number | boolean | null | undefined;
    theme?: WcTheme;
    language?: string;
    options?: DocumentViewerOptions;
    dom?: DocumentEntity;
    document?: string;
    text?: string;
    highlightReference?: ResultsContentReference | null;
    passiveReferences?: readonly ResultsContentReference[] | null;
    outlineReference?: ResultsContentReference | null;
    goToPage?: GoToPage;
}

/** Props for `<ui-du-document-viewer-wc-persistent-element>` in React JSX. */
export type IPersistentDocumentViewerWcJsxProps = IDocumentViewerWcJsxProps;

// ─── Global type augmentations ────────────────────────────────────────────────

declare global {
    interface HTMLElementTagNameMap {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'ui-du-document-viewer-wc-element': IDocumentViewerWcElement;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'ui-du-document-viewer-wc-persistent-element': IPersistentDocumentViewerWcElement;
    }

    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'ui-du-document-viewer-wc-element': IDocumentViewerWcJsxProps;
                // eslint-disable-next-line @typescript-eslint/naming-convention
                'ui-du-document-viewer-wc-persistent-element': IPersistentDocumentViewerWcJsxProps;
            }
        }
    }
}
