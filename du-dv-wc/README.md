<div align="center">

# UiPath Document Understanding — Document Viewer Web Component

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@uipath/du-document-viewer-wc?logo=npm)](https://www.npmjs.com/package/@uipath/du-document-viewer-wc)

A drop-in web component that renders a UiPath Document Understanding document — its pages, its
text, or both — inside any frontend project.

</div>

## About the document viewer

This is the document viewer of UiPath Document Understanding's Validation Station and
Classification Station, as an element of its own. It renders a digitized document, lets the user
search it, zoom, rotate pages and select words or areas, highlights a content reference, and reports
the user's selection as a content reference — the same shape an extracted value's `Reference` has.

It holds no extraction or classification data and makes no HTTP calls. Use it on its own as a
document preview, or next to other elements, such as the compact fields form of
[`@uipath/du-validation-station-wc`](https://www.npmjs.com/package/@uipath/du-validation-station-wc),
and wire them together in your host.

It supersedes the deprecated `<ui-du-document-viewer-standalone-wc-element>` of
`@uipath/du-validation-station-wc`. Keep that one only while it must link to another element of
that package through `instance-id`, which this element cannot do yet.

## Install

```bash
npm install @uipath/du-document-viewer-wc
```

`dom` and the reference inputs are typed with the Document Understanding contracts
`DocumentEntity` and `ResultsContentReference`, imported from
`@uipath/uipath-typescript/document-understanding`. The package declares
`@uipath/uipath-typescript` as a peer dependency; install it for those types to resolve to
anything other than `any`.

## Usage

### 1. Register the custom element

```ts
import '@uipath/du-document-viewer-wc/polyfills';
import '@uipath/du-document-viewer-wc/main';
// Pre-registers the theme the element adopts into its shadow root.
import '@uipath/du-document-viewer-wc/styles';
// Material Icons. Without it every icon renders as its ligature text.
import '@uipath/du-document-viewer-wc/fonts.css';
```

### 2. Mount the element

```html
<ui-du-document-viewer-wc-element id="viewer"></ui-du-document-viewer-wc-element>
```

### 3. Assign the document and listen to it

Object inputs must be assigned as JS properties, not HTML attributes.

```ts
import type {
    DocumentViewerSelection,
    IDocumentViewerWcElement,
} from '@uipath/du-document-viewer-wc';

const viewer = document.querySelector<IDocumentViewerWcElement>('#viewer')!;

viewer.dom = await fetchDocumentObjectModel();     // required in every view mode
viewer.document = await fetchOriginalAsDataUrl();  // enables the page view
viewer.text = await fetchText();                   // enables the text view

viewer.addEventListener('ready', () => {
    viewer.goToPage = { target: 2 };               // a new object for every navigation
});

viewer.addEventListener('referenceSelect', (e: CustomEvent<DocumentViewerSelection>) => {
    console.log('selected', e.detail.text, e.detail.reference);
});

// Highlight and scroll to a content reference, e.g. an extracted value's Reference.
viewer.highlightReference = extractionResult.ResultsDocument.Fields[0].Values[0].Reference;

// Mark every extracted value, as Validation Station does.
viewer.passiveReferences = extractionResult.ResultsDocument.Fields
    .flatMap(field => field.Values.map(value => value.Reference));
```

### Inputs

| Property | Type | Notes |
|---|---|---|
| `dom` | `DocumentEntity` | The digitized document. Nothing renders without it. |
| `document` | `string` | The original document as a base64 data URL. Enables the page view. |
| `text` | `string` | The document text. Enables the text view. |
| `options` | `DocumentViewerOptions` | Which controls show and how selection behaves; see [Options](#options). |
| `highlightReference` | `ResultsContentReference \| null` | Highlights and scrolls to it; `null` clears the highlight. |
| `passiveReferences` | `readonly ResultsContentReference[] \| null` | Draws a passive highlight, e.g. every extracted value. The user can hide it from the viewer menu, unless `hideExtractedTokensToggle` is set. |
| `outlineReference` | `ResultsContentReference \| null` | Outlines it, e.g. the value the user hovers in another element; `null` clears the outline. |
| `goToPage` | `GoToPage` | Navigates to `target`: a 1-based page number, clamped to the document, or `'next'`, `'previous'`, `'first'` or `'last'`. `behavior` defaults to `'instant'`. Assign a new object for every navigation; assigned before `ready`, it waits until then. |
| `theme` | `'light' \| 'dark' \| 'light-hc' \| 'dark-hc' \| 'future-light' \| 'future-dark'` | Default `'light'`; `future-*` are the Apollo Modern themes. |
| `language` | `string` | A BCP-47 code. Default `'en'`. |

### Events

| Event | `detail` | Fires when |
|---|---|---|
| `ready` | `boolean` | The document is rendered. |
| `pageCountChange` | `number` | The document is rendered; the page count. |
| `currentPageChange` | `number` | Another page comes into view, and once with the initial page as the document loads; 1-based. |
| `textModeChange` | `boolean` | The user switches to the text view (`true`) or back. |
| `goToPageResult` | `GoToPageResult` | A `goToPage` command finished; `pageNumber` is the page it reached, or `-1` when it failed. |
| `referenceSelect` | `DocumentViewerSelection` | The user selects words, or clears the selection. |
| `switchPanelSides` | — | The user asks to move the viewer to the other side of your layout. The element does not move itself. |

### Options

`options` is the same `DocumentViewerOptions` object the Validation Station elements take as
`options.documentViewerOptions` and the Classification Station element takes as
`documentViewerOptions`, so one configuration drives all of them. Every member is optional. Assign
a new object to change it.

| Option | Effect |
|---|---|
| `floatingButtonsOptions.hideTextView` | Hides the image/text view toggle. The toggle shows only when both `document` and `text` are set. |
| `floatingButtonsOptions.hideInteractionTypeButton` | Hides the "Selection mode" button. |
| `floatingButtonsOptions.defaultInteractionType` | The selection mode the viewer starts in: `'Tokens'` (default), `'Area'`, `'UserChoice'` or `'Text'`. The user can still switch. |
| `floatingButtonsOptions.hideSearch` | Hides the in-document search. |
| `floatingButtonsOptions.hideKeyboardShortcutsButton` | Removes "Show available keyboard shortcuts" from the viewer's menu. The `?` shortcut still opens the dialog. |
| `floatingButtonsOptions.hideSwitchPanelSidesButton` | Removes "Switch panel sides" from the viewer's menu, so `switchPanelSides` no longer fires. |
| `floatingButtonsOptions.hideExtractedTokensToggle` | Removes the menu entry that shows or hides the `passiveReferences` highlight. The entry appears only while `passiveReferences` is non-empty. |
| `autoRotationThreshold` | Rotates a page automatically when more than this share of its sections, in (0, 1], is detected as rotated. Default `0.7`. |
| `disableSelection` | Turns word and area selection off, and hides the "Selection mode" button. |

With every menu entry removed, the menu button is hidden too. The element takes no
`customizationInfo`, so its keyboard shortcuts cannot be turned off.

```ts
viewer.options = {
    floatingButtonsOptions: { hideSwitchPanelSidesButton: true, hideSearch: true },
    disableSelection: true,
};
```

## Linking it to the Validation Station elements

```ts
const form = document.querySelector('ui-du-compact-fields-form-standalone-wc-element')!;

form.addEventListener('fieldValueSelected', e => {
    viewer.highlightReference = e.detail.FieldValue?.Reference ?? null;
});
```

## React

- **React 18** sets JSX props as attributes: assign the object inputs (`dom`, `options`,
  `highlightReference`, `passiveReferences`, `outlineReference`, `goToPage`) through a `ref`, in
  an effect.
- **React 19** sets them as properties, so they can be JSX props.

The JSX prop type is `IDocumentViewerWcJsxProps`.

## Persistent variant

If your host moves the element through portals or tab switches, use
`<ui-du-document-viewer-wc-persistent-element>`: it keeps its state across DOM detachment. Call
`forceDestroy()` when you remove it for good, or it leaks.

## Static assets

The element loads pdf.js, its character maps and decoders, and its translations from a sibling
`du-assets/` directory. Deploy `du-assets/` next to the bundle, or rendering and translations
silently fail.

## Fonts

`fonts.css` carries Material Icons only. The element inherits your page's font unless you load the
UiPath typography from [`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts)
yourself. `@font-face` rules are ignored inside a shadow root, so fonts must load in your document.

## Versioning

The package follows [Semantic Versioning](https://semver.org/). See [CHANGELOG.md](./CHANGELOG.md).
