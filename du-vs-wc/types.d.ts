/**
 * Public TypeScript types for `@uipath/du-validation-station-wc`.
 *
 * Covers the **standalone** web components exposed by this package:
 *
 *   Full validation station (fields panel + PDF/document viewer):
 *     <ui-du-validation-station-standalone-wc-element>
 *     <ui-du-validation-station-standalone-wc-persistent-element>
 *
 *   Compact fields form (fields panel only, no document viewer):
 *     <ui-du-compact-fields-form-standalone-wc-element>
 *     <ui-du-compact-fields-form-standalone-wc-persistent-element>
 *
 *   Compact table editor (single-table editor only, no document viewer):
 *     <ui-du-compact-table-editor-standalone-wc-element>
 *     <ui-du-compact-table-editor-standalone-wc-persistent-element>
 *
 *   Document viewer (viewer only, no fields form):
 *     <ui-du-document-viewer-standalone-wc-element>
 *     <ui-du-document-viewer-standalone-wc-persistent-element>
 *
 *   Compact doc-type field (document-type selector only):
 *     <ui-du-compact-doc-type-field-standalone-wc-element>
 *     <ui-du-compact-doc-type-field-standalone-wc-persistent-element>
 *
 * None of the standalone variants make HTTP calls. The consumer provides
 * all document data as JS properties.
 *
 * The validation-station and compact fields-form elements handle persistence
 * via the `saveValidatedDataRequest` / `saveValidatedDataAsDraftRequest` /
 * `saveExceptionReportRequest` events.
 *
 * The compact fields-form element is a form-only subset of the full
 * validation-station element: it omits the document-viewer data inputs
 * (`dom`, `text`, `original`) and the panel layout events
 * (`fieldsPanelWidthChanged`, `fieldsPanelSideChanged`).
 *
 * The compact table editor element renders a single extracted table for
 * inline editing. It is edit-only: it has no save action and emits no
 * save-request events — the host persists edits by listening to the change
 * events (`fieldValueChanged`, `extractionResultChanged`, `dirty`). It renders
 * a table only while a table field is selected in the store — selected by the
 * host via `selectAndFocusFieldValueByPath`, or mirrored from a sibling element
 * sharing the same `instance-id`; otherwise it renders empty. It also exposes a
 * PDF table-selection round-trip (`tableSelectionEvent` out, `applyTableSelection`
 * in) for hosts that supply their own region picker.
 */

import { Criticality, DocumentEntity, DocumentTaxonomy, ExtractionResult, LogicalOperator, ResultsDataPoint, ResultsValue } from '@uipath/uipath-typescript/document-understanding';

// ─── Field-value details ──────────────────────────────────────────────────────

/**
 * Details of the selected field and value, emitted in `fieldValueSelected`
 * and `fieldValueChanged` events.
 *
 * `Field` and `FieldValue` carry the underlying UiPath Document Understanding
 * SDK contracts (`@uipath/uipath-typescript`).
 */
export interface IFieldValueDetailsDto {
    Field: ResultsDataPoint;
    FieldValueIndex: number;
    FieldValue?: ResultsValue;
}

// ─── Business-rule evaluation ─────────────────────────────────────────────────

/**
 * The evaluated result of a rule set for a value with given Index in Field.
 * Index is -1 if Field has no extracted value.
 */
export interface EvaluatedBusinessRulesForFieldValueDto {
    FieldId: string;
    ParentFieldId?: string;
    FieldName: string;
    /**
     * The index of the value when a field is multi-value; the row index
     * when the field is a table; -1 for rules defined on fields without a
     * value.
     */
    Index: number;
    IsValid: boolean;
    Criticality: Criticality;
    LogicalOperator: LogicalOperator;
    Rules: EvaluatedBusinessRuleDetailsDto[];
}

export interface EvaluatedBusinessRuleDetailsDto {
    RuleName: string;
    RuleMessage: string;
    IsValid: boolean;
}

/**
 * A single invalid business rule surfaced by the compact business-rules panel,
 * carried in the `businessRuleClick` event. `level` reflects the rule-set
 * criticality (`'error'` for `Must`, otherwise `'warning'`); `messageKey` /
 * `messageParams` are the i18n key and interpolation params for the rule message.
 */
export interface BusinessRuleModel {
    id: string;
    fieldId: string;
    fieldValueIndex: number;
    level: 'info' | 'error' | 'warning' | 'success';
    messageKey: string;
    messageParams: object;
}

// ─── Configuration inputs ─────────────────────────────────────────────────────

export interface IValidationStationOptions {
    hideSubmitButton?: boolean;
    hideReportAsExceptionButton?: boolean;
    hideDocumentTypeField?: boolean;
    hideFields?: boolean;
    /**
     * If true, the compact fields form hides its built-in business-rules panel.
     * Use when the host renders the rules separately (e.g. the standalone
     * compact-business-rules web component).
     */
    hideBusinessRules?: boolean;
    /** @default 'left' */
    fieldsSectionPosition?: 'left' | 'right';
    /** @default true */
    enableUserPreferences?: boolean;
    userPreferencesKeySuffix?: string;
    /**
     * If true, `extractionResultChanged` will emit on every internal state
     * change (mapped to ExtractionResult).
     */
    emitDtoStateChanges?: boolean;
}

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

/** Fine-grained configuration for the document-viewer element. */
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

// ─── Path-based inputs ────────────────────────────────────────────────────────

export interface ExtractedPathSegment {
    fieldName: string;
    valueIndex: number;
}

export interface FieldValueUpdate {
    Value: string;
    DeleteReference: boolean;
    Confidence: number;
    OperatorConfirmed: boolean;
}

export interface SetFieldValueByPath {
    path: ExtractedPathSegment[];
    update: Partial<FieldValueUpdate>;
}

export interface SelectAndFocusFieldValueByPath {
    path: ExtractedPathSegment[];
}

export interface DeleteFieldValueByPath {
    path: ExtractedPathSegment[];
}

// ─── Action-result outputs ────────────────────────────────────────────────────

export interface IVsWcActionResultOutput {
    success: boolean;
    error?: string;
}

export type ISaveResult = IVsWcActionResultOutput;
export type SetFieldValueByPathResult = IVsWcActionResultOutput;
export type SelectAndFocusFieldValueByPathResult = IVsWcActionResultOutput;
export type DeleteFieldValueByPathResult = IVsWcActionResultOutput;

// ─── Document-viewer page navigation ──────────────────────────────────────────

export type GoToPageTarget = number | 'next' | 'previous' | 'first' | 'last';

/**
 * Programmatic page-navigation command for the document-viewer element.
 *
 * Set as a JS property (not an HTML attribute) and assign a NEW object reference
 * on every call — re-assigning the same reference will not re-trigger navigation.
 * Navigation only works after the element has emitted `ready`/`loaded`; a command
 * sent before then resolves to `{ success: false, error: 'Document is not ready' }`.
 */
export interface GoToPage {
    /**
     * Page to navigate to. A number is a 1-based page number; the keywords move
     * relative to the current page (`next`/`previous`) or to the document bounds
     * (`first`/`last`). Out-of-range numbers are clamped to the first/last page.
     */
    target: GoToPageTarget;
    /** Scroll behavior used to bring the page into view. @default 'instant' */
    behavior?: ScrollBehavior;
}

export interface GoToPageResult extends IVsWcActionResultOutput {
    /** The resolved 1-based page number after clamping, or -1 when the command failed. */
    pageNumber: number;
}

// ─── Standalone save-request payloads ─────────────────────────────────────────

/**
 * Payload of the `saveValidatedDataRequest` event.
 *
 * `validatedData`, `automaticExtractionResult`, and `taxonomy` carry UiPath
 * Document Understanding SDK contracts from `@uipath/uipath-typescript`.
 */
export interface IVsSaveValidatedDataRequest {
    documentId: string;
    /** The extraction result after user edits. */
    validatedData: ExtractionResult;
    /** The automatic (pre-edit) extraction result. */
    automaticExtractionResult: ExtractionResult | null;
    /** The taxonomy for this document. */
    taxonomy: DocumentTaxonomy | null;
}

/** Payload of the `saveValidatedDataAsDraftRequest` event. */
export interface IVsSaveValidatedDataAsDraftRequest {
    documentId: string;
    validatedData: ExtractionResult;
}

/**
 * Payload of the `saveExceptionReportRequest` event.
 *
 * `exceptionReport` carries the IReportAsExceptionDTO shape; cast when
 * forwarding to your backend.
 */
export interface IVsSaveExceptionReportRequest {
    documentId: string;
    /** Type: IReportAsExceptionDTO */
    exceptionReport: unknown;
}

// ─── Event maps ───────────────────────────────────────────────────────────────

/**
 * Edit/state events common to every standalone VS-family web component — the full
 * validation-station element, the compact fields-form element, and the compact
 * table-editor element all emit these. Deliberately excludes `saveResult`: only
 * elements that expose a `save` command emit it (see `IVsWcCommonEventMap`); the
 * edit-only table editor does not.
 */
export interface IVsWcCommonStateEventMap {
    /** Fires once when the component has finished loading. */
    loaded: boolean;
    /** Fires when the user has unsaved changes (true) or the state is clean (false). */
    dirty: boolean;
    /** Fires when the user changes the document type. Detail is the new document type ID. */
    documentTypeChanged: string;
    /** Fires on every extraction result change when `IValidationStationOptions.emitDtoStateChanges` is true. */
    extractionResultChanged: ExtractionResult;
    /** Fires when the user selects a field value. */
    fieldValueSelected: IFieldValueDetailsDto;
    /** Fires when the user edits a field value. */
    fieldValueChanged: IFieldValueDetailsDto;
    /** Fires after business rules are evaluated. */
    businessRulesEvaluated: EvaluatedBusinessRulesForFieldValueDto[];
    /** Result of the `setFieldValueByPath` command. */
    setFieldValueByPathResult: SetFieldValueByPathResult;
    /** Result of the `selectAndFocusFieldValueByPath` command. */
    selectAndFocusFieldValueByPathResult: SelectAndFocusFieldValueByPathResult;
    /** Result of the `deleteFieldValueByPath` command. */
    deleteFieldValueByPathResult: DeleteFieldValueByPathResult;
}

/**
 * Events common to the save-capable standalone VS-family elements — the full
 * validation-station element and the compact fields-form element. Adds the
 * `save`-command result to the shared edit/state events.
 */
export interface IVsWcCommonEventMap extends IVsWcCommonStateEventMap {
    /** Result of a `save` command. */
    saveResult: ISaveResult;
}

/**
 * Events emitted by the standalone validation-station web component
 * that are also shared with the (internal) standard variant.
 *
 * Extends the common map with the document-viewer panel layout events that
 * only the full validation-station element (which renders a PDF viewer) emits.
 */
export interface IVsWcSharedEventMap extends IVsWcCommonEventMap {
    /** Fires when the component's validity changes. Detail is true when there are no critical (Must) invalid business rules. */
    isValid: boolean;
    /** Fires when the fields panel width changes. Detail is the width in pixels. */
    fieldsPanelWidthChanged: number;
    /** Fires when the fields panel moves to the other side of the document viewer. */
    fieldsPanelSideChanged: 'left' | 'right';
}

/** The standalone save-request events shared by every standalone VS-family element. */
export interface IVsWcSaveRequestEventMap {
    /** Emitted when the user saves. Handle this to call the ProcessExtractedData API. */
    saveValidatedDataRequest: IVsSaveValidatedDataRequest;
    /** Emitted when the user saves as draft. */
    saveValidatedDataAsDraftRequest: IVsSaveValidatedDataAsDraftRequest;
    /** Emitted when the user reports an exception. */
    saveExceptionReportRequest: IVsSaveExceptionReportRequest;
}

/**
 * Maps every custom-event name emitted by the standalone validation-station
 * web component to the type carried in CustomEvent.detail.
 *
 * The standalone variant emits API command events instead of making HTTP calls.
 */
export interface IValidationStationStandaloneWcEventMap extends IVsWcSharedEventMap, IVsWcSaveRequestEventMap {}

/**
 * Maps every custom-event name emitted by the standalone compact fields-form
 * web component to the type carried in CustomEvent.detail.
 *
 * Mirrors `IValidationStationStandaloneWcEventMap` minus the document-viewer
 * panel layout events (`fieldsPanelWidthChanged` / `fieldsPanelSideChanged`):
 * the compact form renders fields only, with no PDF viewer or resizable panel.
 */
export interface ICompactFieldsFormStandaloneWcEventMap extends IVsWcCommonEventMap, IVsWcSaveRequestEventMap {}

/**
 * Maps every custom-event name emitted by the standalone compact table-editor
 * web component to the type carried in CustomEvent.detail.
 *
 * Edit-only: it shares the common edit/state events but emits no save-request
 * events and no `saveResult` — hence it extends `IVsWcCommonStateEventMap`, not
 * `IVsWcCommonEventMap`. Adds `tableSelectionEvent` for the PDF table-selection
 * round-trip.
 */
export interface ICompactTableEditorStandaloneWcEventMap extends IVsWcCommonStateEventMap {
    /**
     * Fires when the user starts/stops a PDF table selection from the editor's
     * extract controls; null when the selection is cancelled.
     * Type: IPDFTableSelectionInput | null
     */
    tableSelectionEvent: unknown;
    /**
     * Fires when the user closes the editor with the "Done" button. After this the
     * element renders empty until another table field is selected.
     */
    closed: void;
}

/**
 * Maps every custom-event name emitted by the standalone compact business-rules
 * web component to the type carried in CustomEvent.detail.
 *
 * Read-only panel: it surfaces the common edit/state events (so a host can observe
 * the shared store) but emits no save-request events and no `saveResult` — hence it
 * extends `IVsWcCommonStateEventMap`, not `IVsWcCommonEventMap`. Adds the two
 * panel-specific outputs.
 */
export interface ICompactBusinessRulesStandaloneWcEventMap extends IVsWcCommonStateEventMap {
    /** Fires when the user expands (true) or collapses (false) the rules panel. */
    businessRulesToggle: boolean;
    /** Fires when the user clicks an evaluated rule. */
    businessRuleClick: BusinessRuleModel;
}

/**
 * Maps every custom-event name emitted by the standalone document-viewer
 * web component to the type carried in CustomEvent.detail.
 *
 * The document-viewer element renders only the document/text viewer (no fields
 * form, no save flow), so it does not share the common VS event map — it
 * defines its own viewer-centric outputs.
 *
 * `tokensSelect` carries an internal PDF-viewer shape (`IPDFToken[]`) that is
 * not part of the public WC type surface; it is exposed opaquely as `unknown[]`.
 */
export interface IDocumentViewerStandaloneWcEventMap {
    /** Fires when the inner document viewer is ready. */
    ready: boolean;
    /** Fires once the document/extraction data has finished loading. */
    loaded: boolean;
    /** Fires when the user selects tokens in the viewer. detail: IPDFToken[] */
    tokensSelect: unknown[];
    /** Fires when the viewer toggles between text and document (canvas) mode. */
    textModeChange: boolean;
    /** Result of the `selectAndFocusFieldValueByPath` command. */
    selectAndFocusFieldValueByPathResult: SelectAndFocusFieldValueByPathResult;
    /** Result of the `goToPage` command. */
    goToPageResult: GoToPageResult;
    /** Fires when the visible page changes (scroll or `goToPage`). Detail is the 1-based page number. */
    currentPageChange: number;
    /** Fires once the document is ready. Detail is the total number of pages. */
    pageCountChange: number;
}

/**
 * Maps every custom-event name emitted by the standalone compact doc-type field
 * web component to the type carried in CustomEvent.detail.
 *
 * The doc-type field element is a lightweight selector: it emits only load state,
 * the selected document-type id, and panel open/close — no edit/save events.
 */
export interface ICompactDocTypeFieldStandaloneWcEventMap {
    /** Fires once when extraction and rules have finished loading. */
    loaded: boolean;
    /** Fires when the user changes the document type. Detail is the new document type ID. */
    documentTypeChanged: string;
    /** Fires when the dropdown panel opens (true) or closes (false). */
    panelOpenChange: boolean;
}

// ─── Element interfaces ───────────────────────────────────────────────────────

/**
 * Internal base shared by the standalone VS element interfaces (the full
 * validation-station element and the compact fields-form element). Carries
 * the configuration inputs, command inputs, and typed event listeners common
 * to both.
 * @internal Consumers should use `IValidationStationStandaloneWcElement` or
 * `ICompactFieldsFormStandaloneWcElement` directly.
 */
export interface IVsWcBaseElement<TEventMap> extends HTMLElement {
    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    /** BCP-47 language code for the UI. @default 'en' */
    language: string;
    /** When true, the component renders in read-only mode. @default false */
    isReadonly: boolean;
    /** When true, a "Save as draft" action is available. @default false */
    enableSaveAsDraft: boolean;
    /** Fine-grained UI feature flags. */
    options: IValidationStationOptions;

    // ── Command inputs ────────────────────────────────────────────────────────
    //
    // Assigning a new object reference triggers the action.

    /** Trigger a save operation. Set { validate: true } to validate before saving. */
    save: { validate: boolean } | undefined;
    /** Trigger a discard-changes operation. Assign { value: true } to confirm. */
    discardChanges: { value: boolean } | undefined;
    /** Set field values by path. Listen to `setFieldValueByPathResult` for outcomes. */
    setFieldValueByPath: SetFieldValueByPath | undefined;
    /**
     * Select the field in the extraction panel by path; if the value has a
     * document reference, focus it in the PDF viewer. Listen to
     * `selectAndFocusFieldValueByPathResult` for the outcome.
     */
    selectAndFocusFieldValueByPath: SelectAndFocusFieldValueByPath | undefined;
    /** Delete a field value by path. Listen to `deleteFieldValueByPathResult` for outcomes. */
    deleteFieldValueByPath: DeleteFieldValueByPath | undefined;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof TEventMap>(
        type: K,
        listener: (event: CustomEvent<TEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof TEventMap>(
        type: K,
        listener: (event: CustomEvent<TEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Strongly-typed interface for `<ui-du-validation-station-standalone-wc-element>`.
 *
 * The standalone variant does not make HTTP calls. The consumer provides
 * document data as JS properties and handles API commands by listening
 * to `saveValidatedDataRequest` / `saveValidatedDataAsDraftRequest` /
 * `saveExceptionReportRequest`.
 */
export interface IValidationStationStandaloneWcElement extends IVsWcBaseElement<IValidationStationStandaloneWcEventMap> {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    // ── Data inputs (replace the HTTP fetches of the non-standalone variant) ──

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Document object model (digitized document). */
    dom: DocumentEntity;
    /** Plain text content of the document. */
    text: string | undefined;
    /** Customization configuration. Type: ICustomizationInfoDTO (no SDK equivalent). */
    customizationInfo: unknown;
    /** Original document as a base64 data URL. */
    original: string | undefined;
}

/**
 * Extends `IValidationStationStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentValidationStationStandaloneWcElement extends IValidationStationStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

/**
 * Strongly-typed interface for `<ui-du-compact-fields-form-standalone-wc-element>`.
 *
 * A form-only standalone variant: it renders the extraction fields panel
 * without the PDF/document viewer. Like the full VS standalone element it
 * makes no HTTP calls — the consumer supplies document data as JS properties
 * and handles persistence by listening to `saveValidatedDataRequest` /
 * `saveValidatedDataAsDraftRequest` / `saveExceptionReportRequest`.
 *
 * Differs from `IValidationStationStandaloneWcElement` by omitting the
 * document-viewer data inputs (`dom`, `text`, `original`) and the panel
 * layout events (`fieldsPanelWidthChanged` / `fieldsPanelSideChanged`).
 */
export interface ICompactFieldsFormStandaloneWcElement extends IVsWcBaseElement<ICompactFieldsFormStandaloneWcEventMap> {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    /**
     * Links this element's store to other compact fields-form elements: elements
     * that carry the same value mirror each other's edits and selection. Must be
     * set as the `instance-id` attribute before the element connects to the DOM —
     * it is read once at construction and is immutable thereafter. Omit for an
     * isolated store (the default).
     */
    instanceId: string | undefined;

    // ── Data inputs (replace the HTTP fetches of the non-standalone variant) ──

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Customization configuration. Type: ICustomizationInfoDTO */
    customizationInfo: unknown;
}

/**
 * Extends `ICompactFieldsFormStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentCompactFieldsFormStandaloneWcElement extends ICompactFieldsFormStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

/**
 * Strongly-typed interface for `<ui-du-compact-table-editor-standalone-wc-element>`.
 *
 * Renders a single extracted table for inline editing — no PDF/document viewer,
 * no HTTP calls. The consumer supplies document data as JS properties.
 *
 * The editor shows a table only while a table field is selected in the store:
 * select one by pushing a table-field path through `selectAndFocusFieldValueByPath`
 * (use `valueIndex: -1` to target the table itself), or have a sibling element
 * sharing the same `instance-id` select it. Otherwise the element renders empty.
 *
 * Edit-only: there is no `save` command and no save-request events. Persist edits
 * by listening to `fieldValueChanged` / `extractionResultChanged` / `dirty`.
 */
export interface ICompactTableEditorStandaloneWcElement extends HTMLElement {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    /**
     * Links this element's store to other VS-family elements that carry the same
     * value: they mirror each other's edits and selection. This is the primary way
     * a table becomes visible — a sibling element (e.g. the compact-fields-form
     * element) sharing this id selects a table field and this editor renders it.
     * Must be set as the `instance-id` attribute before the element connects to the
     * DOM — it is read once at construction and is immutable thereafter. Omit for an
     * isolated store (the default).
     */
    instanceId: string | undefined;

    // ── Data inputs (replace the HTTP fetches of the non-standalone variant) ──

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Customization configuration. Type: ICustomizationInfoDTO */
    customizationInfo: unknown;

    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    /** BCP-47 language code for the UI. @default 'en' */
    language: string;
    /** When true, the table renders in read-only mode. @default false */
    isReadonly: boolean;
    /** Fine-grained UI feature flags. */
    options: IValidationStationOptions;

    // ── Command inputs ────────────────────────────────────────────────────────
    //
    // Assigning a new object reference triggers the action.

    /** Trigger a discard-changes operation. Assign { value: true } to confirm. */
    discardChanges: { value: boolean } | undefined;
    /** Set field values by path. Listen to `setFieldValueByPathResult` for outcomes. */
    setFieldValueByPath: SetFieldValueByPath | undefined;
    /** Select and focus a field value by path. Listen to `selectAndFocusFieldValueByPathResult`. */
    selectAndFocusFieldValueByPath: SelectAndFocusFieldValueByPath | undefined;
    /** Delete a field value by path. Listen to `deleteFieldValueByPathResult` for outcomes. */
    deleteFieldValueByPath: DeleteFieldValueByPath | undefined;

    // ── PDF table-selection round-trip ────────────────────────────────────────

    /** Reflects a host PDF picker's "selection enabled" state into the editor UI. @default false */
    isTableSelectionEnabled: boolean;
    /** Reflects a host PDF picker's "drawing cells" state into the editor UI. @default false */
    isDrawingTableSelectionCells: boolean;
    /**
     * Apply a host-driven PDF table selection result back into the table. Assign a
     * new object reference to trigger. Type: IPDFTableSelectionOutput.
     * Note: area-based references require the document DOM, which a no-viewer host
     * does not provide; token-based selections are unaffected.
     */
    applyTableSelection: unknown;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof ICompactTableEditorStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactTableEditorStandaloneWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof ICompactTableEditorStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactTableEditorStandaloneWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Extends `ICompactTableEditorStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentCompactTableEditorStandaloneWcElement extends ICompactTableEditorStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

/**
 * Strongly-typed interface for `<ui-du-compact-business-rules-standalone-wc-element>`.
 *
 * Renders the evaluated business-rules panel (errors / warnings) — no PDF/document
 * viewer, no HTTP calls. The consumer supplies document data as JS properties.
 *
 * Rules are evaluated on the store once a document has loaded — by this element (via
 * `documentId` + data inputs) or by a sibling element sharing the same `instance-id`.
 * The panel is read-only: it has no `save` command and no save-request events. It
 * surfaces the user's rule interactions via `businessRulesToggle` (expand/collapse)
 * and `businessRuleClick`; a host can react to the latter by driving selection through
 * `selectAndFocusFieldValueByPath`.
 */
export interface ICompactBusinessRulesStandaloneWcElement extends HTMLElement {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    /**
     * Links this element's store to other VS-family elements that carry the same
     * value: they mirror each other's edits, selection, and rule evaluation. This is
     * the primary way the panel becomes populated — a sibling element (e.g. the
     * compact-fields-form element) sharing this id loads the document and this panel
     * renders the rules. Must be set as the `instance-id` attribute before the element
     * connects to the DOM — it is read once at construction and is immutable
     * thereafter. Omit for an isolated store (the default).
     */
    instanceId: string | undefined;

    // ── Data inputs (replace the HTTP fetches of the non-standalone variant) ──

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Customization configuration. Type: ICustomizationInfoDTO */
    customizationInfo: unknown;

    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    /** BCP-47 language code for the UI. @default 'en' */
    language: string;
    /** When true, the component renders in read-only mode. @default false */
    isReadonly: boolean;
    /** Fine-grained UI feature flags. */
    options: IValidationStationOptions;

    // ── Command inputs ────────────────────────────────────────────────────────
    //
    // Assigning a new object reference triggers the action. They operate on the
    // shared store, so a host can drive sibling elements through this panel.

    /** Trigger a discard-changes operation. Assign { value: true } to confirm. */
    discardChanges: { value: boolean } | undefined;
    /** Set field values by path. Listen to `setFieldValueByPathResult` for outcomes. */
    setFieldValueByPath: SetFieldValueByPath | undefined;
    /** Select and focus a field value by path. Listen to `selectAndFocusFieldValueByPathResult`. */
    selectAndFocusFieldValueByPath: SelectAndFocusFieldValueByPath | undefined;
    /** Delete a field value by path. Listen to `deleteFieldValueByPathResult` for outcomes. */
    deleteFieldValueByPath: DeleteFieldValueByPath | undefined;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof ICompactBusinessRulesStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactBusinessRulesStandaloneWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof ICompactBusinessRulesStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactBusinessRulesStandaloneWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Extends `ICompactBusinessRulesStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentCompactBusinessRulesStandaloneWcElement extends ICompactBusinessRulesStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

/**
 * Strongly-typed interface for `<ui-du-document-viewer-standalone-wc-element>`.
 *
 * A viewer-only standalone variant: it renders the document/text viewer with no
 * fields form and no save flow. The view mode (text / document / both-with-toggle)
 * is driven by which content inputs are supplied:
 *  - `text` only → text view;
 *  - `document` (+ `dom`) only → document/canvas view;
 *  - both → toggle between the two.
 *
 * Like the other standalone variants it makes no HTTP calls — the consumer
 * supplies document data as JS properties.
 *
 * Does not extend the common VS element base in the same way as the fields-form
 * variants: it carries no save/discard/field-mutation commands, only the
 * configuration inputs, content inputs, optional VS data, and the
 * `selectAndFocusFieldValueByPath` command.
 */
export interface IDocumentViewerStandaloneWcElement extends HTMLElement {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    /**
     * Links this element's store to other VS-family standalone elements (e.g. a
     * compact fields-form element): elements that carry the same value mirror
     * each other's selection and highlights. Must be set as the `instance-id`
     * attribute before the element connects to the DOM — it is read once at
     * construction and is immutable thereafter. Omit for an isolated store
     * (the default).
     */
    instanceId: string | undefined;

    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    /** BCP-47 language code for the UI. @default 'en' */
    language: string;
    /** When true, the component renders in read-only mode. @default false */
    isReadonly: boolean;
    /**
     * Fine-grained viewer configuration (floating-control visibility, default
     * interaction mode, auto-rotation, selection). Set as a JS property (not an
     * HTML attribute) for this complex object value.
     */
    options: DocumentViewerOptions | undefined;

    // ── Content inputs (drive the view mode) ──────────────────────────────────

    /** Plain text content of the document. Supply to enable the text view. */
    text: string | undefined;
    /** Original document as a base64 data URL. Supply to enable the document/canvas view. */
    document: string | undefined;
    /** Document object model (digitized document). */
    dom: DocumentEntity;

    // ── Optional VS data (enables field-aware highlighting & anchors) ─────────

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Customization configuration. Type: ICustomizationInfoDTO (no SDK equivalent). */
    customizationInfo: unknown;

    // ── Command inputs ────────────────────────────────────────────────────────
    //
    // Assigning a new object reference triggers the action.

    /**
     * Select the field by path; if the value has a document reference, focus it
     * in the viewer. Listen to `selectAndFocusFieldValueByPathResult` for the
     * outcome.
     */
    selectAndFocusFieldValueByPath: SelectAndFocusFieldValueByPath | undefined;
    /**
     * Navigate the document to a page. Assign a new `GoToPage` reference to
     * trigger. Listen to `goToPageResult` for the outcome and
     * `currentPageChange` / `pageCountChange` for navigation state.
     *
     * Note: when the provided extraction result contains a document type value
     * reference, that reference is highlighted and scrolled into view by default
     * on first load, overriding any `goToPage` supplied at that time. Commands
     * assigned afterwards take effect normally.
     */
    goToPage: GoToPage | undefined;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof IDocumentViewerStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IDocumentViewerStandaloneWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof IDocumentViewerStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<IDocumentViewerStandaloneWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Extends `IDocumentViewerStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentDocumentViewerStandaloneWcElement extends IDocumentViewerStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

/**
 * Strongly-typed interface for `<ui-du-compact-doc-type-field-standalone-wc-element>`.
 *
 * A doc-type-selector-only standalone variant: it renders the compact
 * document-type dropdown. No fields form, no document viewer, no save flow.
 * Like the other standalone variants it makes no HTTP calls — the consumer
 * supplies document data as JS properties.
 *
 * Emits `documentTypeChanged` when the user picks a type and `panelOpenChange`
 * when the dropdown opens or closes. Shares an `instance-id` with sibling
 * elements to mirror the document-type selection via the shared store.
 */
export interface ICompactDocTypeFieldStandaloneWcElement extends HTMLElement {
    // ── Setup inputs ──────────────────────────────────────────────────────────

    /** Document identifier. Required before any data inputs are set. */
    documentId: string | undefined;

    /**
     * Links this element's store to other VS-family standalone elements (e.g. a
     * compact fields-form element): elements that carry the same value mirror
     * each other's document-type selection. Must be set as the `instance-id`
     * attribute before the element connects to the DOM — it is read once at
     * construction and is immutable thereafter. Omit for an isolated store
     * (the default).
     */
    instanceId: string | undefined;

    /** Taxonomy for this document. */
    taxonomy: DocumentTaxonomy;
    /** Initial extraction results. */
    extractionResult: ExtractionResult;
    /** Customization configuration. Type: ICustomizationInfoDTO */
    customizationInfo: unknown;

    // ── Configuration inputs ──────────────────────────────────────────────────

    /** Visual theme applied to the component. @default 'light' */
    theme: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    /** BCP-47 language code for the UI. @default 'en' */
    language: string;
    /** When true, the component renders in read-only mode. @default false */
    isReadonly: boolean;
    /** Fine-grained UI feature flags. */
    options: IValidationStationOptions;

    // ── Typed event listeners ─────────────────────────────────────────────────

    addEventListener<K extends keyof ICompactDocTypeFieldStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactDocTypeFieldStandaloneWcEventMap[K]>) => void,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;

    removeEventListener<K extends keyof ICompactDocTypeFieldStandaloneWcEventMap>(
        type: K,
        listener: (event: CustomEvent<ICompactDocTypeFieldStandaloneWcEventMap[K]>) => void,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

/**
 * Extends `ICompactDocTypeFieldStandaloneWcElement` with an explicit teardown method.
 *
 * The persistent element suppresses `disconnectedCallback()` to survive
 * portal detachments (e.g. tab switches). Call `forceDestroy()` when the
 * element is being permanently removed (`ngOnDestroy` / `useEffect`
 * cleanup / `componentWillUnmount`).
 */
export interface IPersistentCompactDocTypeFieldStandaloneWcElement extends ICompactDocTypeFieldStandaloneWcElement {
    /**
     * Explicitly tears down the inner Angular component.
     * Must be called when the element is being permanently removed.
     */
    forceDestroy(): void;
}

// ─── Shared JSX props ─────────────────────────────────────────────────────────

/**
 * Common HTML attributes accepted by every VS-family element in React JSX,
 * plus arbitrary `data-*` / `aria-*` attributes. Shared by the JSX prop
 * interfaces of each standalone element so they only declare their own
 * configuration/command inputs.
 */
export interface IVsWcCommonHtmlJsxProps {
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

/**
 * JSX props shared by the standalone validation-station element variants
 * (full VS element + compact fields-form element). Covers configuration
 * inputs, command inputs, and common HTML attributes.
 */
export interface IVsWcSharedJsxProps extends IVsWcCommonHtmlJsxProps {
    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    /** JS property form. */
    enableSaveAsDraft?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'enable-save-as-draft'?: boolean;
    // ── Complex configuration + command inputs ────────────────────────────────
    options?: IValidationStationOptions;
    save?: { validate: boolean };
    discardChanges?: { value: boolean };
    setFieldValueByPath?: SetFieldValueByPath;
    selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
    deleteFieldValueByPath?: DeleteFieldValueByPath;
}

/**
 * Props for `<ui-du-validation-station-standalone-wc-element>` in React JSX.
 *
 * React 18 — complex object inputs (`taxonomy`, `extractionResult`, `dom`,
 * `customizationInfo`, and all command payloads) must be set via a `ref`
 * as JS properties; React 18 serialises JSX props to HTML attributes and
 * Angular Elements cannot deserialise object JSON.
 *
 * React 19 — supports passing complex object props directly as JSX
 * attributes. Refs become unnecessary for static data.
 */
export interface IValidationStationStandaloneWcJsxProps extends IVsWcSharedJsxProps {
    documentId?: string;
    text?: string;
    original?: string;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    dom?: DocumentEntity;
    customizationInfo?: unknown;
}

/** Props for `<ui-du-validation-station-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentValidationStationStandaloneWcJsxProps = IValidationStationStandaloneWcJsxProps;

/**
 * Props for `<ui-du-compact-fields-form-standalone-wc-element>` in React JSX.
 *
 * Same React 18 / 19 caveats as `IValidationStationStandaloneWcJsxProps`:
 * under React 18, complex object inputs (`taxonomy`, `extractionResult`,
 * `customizationInfo`, and all command payloads) must be set via a `ref`
 * as JS properties; React 19 supports passing them directly as JSX props.
 *
 * Omits the document-viewer inputs (`dom`, `text`, `original`) — the compact
 * form renders fields only.
 */
export interface ICompactFieldsFormStandaloneWcJsxProps extends IVsWcSharedJsxProps {
    documentId?: string;
    /** Link id — set as the `instance-id` attribute before connect. See {@link ICompactFieldsFormStandaloneWcElement.instanceId}. */
    'instance-id'?: string;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    customizationInfo?: unknown;
}

/** Props for `<ui-du-compact-fields-form-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentCompactFieldsFormStandaloneWcJsxProps = ICompactFieldsFormStandaloneWcJsxProps;

/**
 * Props for `<ui-du-compact-table-editor-standalone-wc-element>` in React JSX.
 *
 * Same React 18 / 19 caveats as `IValidationStationStandaloneWcJsxProps`:
 * under React 18, complex object inputs (`taxonomy`, `extractionResult`,
 * `customizationInfo`, `applyTableSelection`, and all command payloads) must be
 * set via a `ref` as JS properties; React 19 supports passing them directly as
 * JSX props.
 *
 * Edit-only: omits the `save` / `enableSaveAsDraft` props of the validation-station
 * elements. Adds the PDF table-selection round-trip props.
 */
export interface ICompactTableEditorStandaloneWcJsxProps extends IVsWcCommonHtmlJsxProps {
    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    /** JS property form. */
    isTableSelectionEnabled?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-table-selection-enabled'?: boolean;
    /** JS property form. */
    isDrawingTableSelectionCells?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-drawing-table-selection-cells'?: boolean;
    // ── Complex configuration + command inputs ────────────────────────────────
    options?: IValidationStationOptions;
    discardChanges?: { value: boolean };
    setFieldValueByPath?: SetFieldValueByPath;
    selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
    deleteFieldValueByPath?: DeleteFieldValueByPath;
    /** Apply a host-driven PDF table selection result. Type: IPDFTableSelectionOutput. */
    applyTableSelection?: unknown;
    // ── Setup + data inputs ───────────────────────────────────────────────────
    documentId?: string;
    /** Link id — set as the `instance-id` attribute before connect. See {@link ICompactTableEditorStandaloneWcElement.instanceId}. */
    'instance-id'?: string;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    customizationInfo?: unknown;
}

/** Props for `<ui-du-compact-table-editor-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentCompactTableEditorStandaloneWcJsxProps = ICompactTableEditorStandaloneWcJsxProps;

/**
 * Props for `<ui-du-compact-business-rules-standalone-wc-element>` in React JSX.
 *
 * Same React 18 / 19 caveats as `IValidationStationStandaloneWcJsxProps`:
 * under React 18, complex object inputs (`taxonomy`, `extractionResult`,
 * `customizationInfo`, and all command payloads) must be set via a `ref` as JS
 * properties; React 19 supports passing them directly as JSX props.
 *
 * Read-only panel: omits the `save` / `enableSaveAsDraft` props of the
 * validation-station elements.
 */
export interface ICompactBusinessRulesStandaloneWcJsxProps extends IVsWcCommonHtmlJsxProps {
    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    // ── Complex configuration + command inputs ────────────────────────────────
    options?: IValidationStationOptions;
    discardChanges?: { value: boolean };
    setFieldValueByPath?: SetFieldValueByPath;
    selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
    deleteFieldValueByPath?: DeleteFieldValueByPath;
    // ── Setup + data inputs ───────────────────────────────────────────────────
    documentId?: string;
    /** Link id — set as the `instance-id` attribute before connect. See {@link ICompactBusinessRulesStandaloneWcElement.instanceId}. */
    'instance-id'?: string;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    customizationInfo?: unknown;
}

/** Props for `<ui-du-compact-business-rules-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentCompactBusinessRulesStandaloneWcJsxProps = ICompactBusinessRulesStandaloneWcJsxProps;

/**
 * Props for `<ui-du-document-viewer-standalone-wc-element>` in React JSX.
 *
 * Same React 18 / 19 caveats as `IValidationStationStandaloneWcJsxProps`:
 * under React 18, complex object inputs (`dom`, `taxonomy`, `extractionResult`,
 * `customizationInfo`, and the `selectAndFocusFieldValueByPath` command) must be
 * set via a `ref` as JS properties; React 19 supports passing them directly as
 * JSX props.
 *
 * A viewer-only element: it omits the save/discard/field-mutation commands and
 * exposes content inputs (`text` / `document` / `dom`) that drive the view mode.
 */
export interface IDocumentViewerStandaloneWcJsxProps {
    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    options?: DocumentViewerOptions;
    // ── Setup + content inputs ────────────────────────────────────────────────
    documentId?: string;
    /** Link id — set as the `instance-id` attribute before connect. See {@link IDocumentViewerStandaloneWcElement.instanceId}. */
    'instance-id'?: string;
    text?: string;
    document?: string;
    dom?: DocumentEntity;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    customizationInfo?: unknown;
    // ── Command inputs ────────────────────────────────────────────────────────
    selectAndFocusFieldValueByPath?: SelectAndFocusFieldValueByPath;
    goToPage?: GoToPage;
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

/** Props for `<ui-du-document-viewer-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentDocumentViewerStandaloneWcJsxProps = IDocumentViewerStandaloneWcJsxProps;

/**
 * Props for `<ui-du-compact-doc-type-field-standalone-wc-element>` in React JSX.
 *
 * Same React 18 / 19 caveats as `IValidationStationStandaloneWcJsxProps`:
 * under React 18, complex object inputs (`taxonomy`, `extractionResult`,
 * `customizationInfo`) must be set via a `ref` as JS properties; React 19
 * supports passing them directly as JSX props.
 *
 * A doc-type-selector-only element: it omits all save/discard/field-mutation
 * commands and viewer inputs.
 */
export interface ICompactDocTypeFieldStandaloneWcJsxProps extends IVsWcCommonHtmlJsxProps {
    // ── Scalar configuration inputs ───────────────────────────────────────────
    theme?: 'light' | 'dark' | 'light-hc' | 'dark-hc';
    language?: string;
    /** JS property form. */
    isReadonly?: boolean;
    /** Attribute form (kebab-case). Coerced via Angular's `booleanAttribute` transform. */
    'is-readonly'?: boolean;
    // ── Setup + data inputs ───────────────────────────────────────────────────
    documentId?: string;
    /** Link id — set as the `instance-id` attribute before connect. See {@link ICompactDocTypeFieldStandaloneWcElement.instanceId}. */
    'instance-id'?: string;
    taxonomy?: DocumentTaxonomy;
    extractionResult?: ExtractionResult;
    customizationInfo?: unknown;
    options?: IValidationStationOptions;
}

/** Props for `<ui-du-compact-doc-type-field-standalone-wc-persistent-element>` in React JSX. */
export type IPersistentCompactDocTypeFieldStandaloneWcJsxProps = ICompactDocTypeFieldStandaloneWcJsxProps;

// ─── Global type augmentations ────────────────────────────────────────────────

declare global {
    interface HTMLElementTagNameMap {
        'ui-du-validation-station-standalone-wc-element': IValidationStationStandaloneWcElement;
        'ui-du-validation-station-standalone-wc-persistent-element': IPersistentValidationStationStandaloneWcElement;
        'ui-du-compact-fields-form-standalone-wc-element': ICompactFieldsFormStandaloneWcElement;
        'ui-du-compact-fields-form-standalone-wc-persistent-element': IPersistentCompactFieldsFormStandaloneWcElement;
        'ui-du-compact-table-editor-standalone-wc-element': ICompactTableEditorStandaloneWcElement;
        'ui-du-compact-table-editor-standalone-wc-persistent-element': IPersistentCompactTableEditorStandaloneWcElement;
        'ui-du-compact-business-rules-standalone-wc-element': ICompactBusinessRulesStandaloneWcElement;
        'ui-du-compact-business-rules-standalone-wc-persistent-element': IPersistentCompactBusinessRulesStandaloneWcElement;
        'ui-du-document-viewer-standalone-wc-element': IDocumentViewerStandaloneWcElement;
        'ui-du-document-viewer-standalone-wc-persistent-element': IPersistentDocumentViewerStandaloneWcElement;
        'ui-du-compact-doc-type-field-standalone-wc-element': ICompactDocTypeFieldStandaloneWcElement;
        'ui-du-compact-doc-type-field-standalone-wc-persistent-element': IPersistentCompactDocTypeFieldStandaloneWcElement;
    }

    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'ui-du-validation-station-standalone-wc-element': IValidationStationStandaloneWcJsxProps;
                'ui-du-validation-station-standalone-wc-persistent-element': IPersistentValidationStationStandaloneWcJsxProps;
                'ui-du-compact-fields-form-standalone-wc-element': ICompactFieldsFormStandaloneWcJsxProps;
                'ui-du-compact-fields-form-standalone-wc-persistent-element': IPersistentCompactFieldsFormStandaloneWcJsxProps;
                'ui-du-compact-table-editor-standalone-wc-element': ICompactTableEditorStandaloneWcJsxProps;
                'ui-du-compact-table-editor-standalone-wc-persistent-element': IPersistentCompactTableEditorStandaloneWcJsxProps;
                'ui-du-compact-business-rules-standalone-wc-element': ICompactBusinessRulesStandaloneWcJsxProps;
                'ui-du-compact-business-rules-standalone-wc-persistent-element': IPersistentCompactBusinessRulesStandaloneWcJsxProps;
                'ui-du-document-viewer-standalone-wc-element': IDocumentViewerStandaloneWcJsxProps;
                'ui-du-document-viewer-standalone-wc-persistent-element': IPersistentDocumentViewerStandaloneWcJsxProps;
                'ui-du-compact-doc-type-field-standalone-wc-element': ICompactDocTypeFieldStandaloneWcJsxProps;
                'ui-du-compact-doc-type-field-standalone-wc-persistent-element': IPersistentCompactDocTypeFieldStandaloneWcJsxProps;
            }
        }
    }
}
