<div align="center">

# UiPath Document Understanding — Validation Station Web Component

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@uipath/du-validation-station-wc?logo=npm)](https://www.npmjs.com/package/@uipath/du-validation-station-wc)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)

[Install](#install) • [Usage](#usage--standalone-variant) • [React](#react) • [Persistent variant](#persistent-variant) • [Lazy loading](#lazy-loading)

A drop-in web component that renders the UiPath Document Understanding Validation Station inside any frontend project.

</div>

## About Validation Station

Validation Station is the human-in-the-loop review step of a UiPath Document Understanding pipeline. It renders extracted fields next to the original document and lets a reviewer confirm or correct what the extractor produced — scalar and multi-value fields, tables, and the document's classification — with selections in the document mapping back to fields and low-confidence values surfaced for review. The validated payload is emitted to the host application on save, or routed to an exception flow when a document can't be processed.

Learn more in the [UiPath Document Understanding docs](https://docs.uipath.com/activities/other/latest/document-understanding/compact-validation-station).

<details>
<summary><strong>Table of contents</strong></summary>

- [About Validation Station](#about-validation-station)
- [Install](#install)
- [Usage — standalone variant](#usage--standalone-variant)
  - [1. Register the custom elements](#1-register-the-custom-elements)
  - [2. Mount the element](#2-mount-the-element)
  - [3. Wire up data and event handlers](#3-wire-up-data-and-event-handlers)
  - [Updating the data inputs after mount](#updating-the-data-inputs-after-mount)
  - [Supplying a Flow extraction instead](#supplying-a-flow-extraction-instead)
- [Customization options](#customization-options)
- [Element options](#element-options)
- [Custom value-indicator overlay](#custom-value-indicator-overlay)
- [React](#react)
  - [React 18](#react-18)
  - [React 19](#react-19)
- [Persistent variant](#persistent-variant)
- [Lazy loading](#lazy-loading)
- [Static assets](#static-assets)
- [Styles](#styles)
- [Fonts](#fonts)
  - [What is in it, and what is not](#what-is-in-it-and-what-is-not)
- [Versioning](#versioning)
- [Support](#support)

</details>

## Install

```bash
# npm
npm install @uipath/du-validation-station-wc

# yarn
yarn add @uipath/du-validation-station-wc

# pnpm
pnpm add @uipath/du-validation-station-wc
```

The package's `fonts.css` carries the **Material Icons** font it needs, but
**not** the Apollo text fonts. Those are optional: add
[`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts)
alongside it only if you want the UiPath typography and your app does not
already load it — see [Fonts](#fonts).

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Usage — standalone variant

The **standalone** variant (`<ui-du-validation-station-standalone-wc-element>`)
does not make any HTTP calls. The consumer provides all document data
as JS properties and handles save / draft / exception requests by
listening to events. This is the recommended variant for external
consumers — your backend stays in control of all I/O.

### 1. Register the custom elements

Side-effect imports register the custom elements with the browser. Do
this once at app startup (or lazily, behind a route boundary — see
[Lazy loading](#lazy-loading) below).

```ts
import '@uipath/du-validation-station-wc/polyfills';
import '@uipath/du-validation-station-wc/main';
// Registers the component's theme CSS with the runtime (adopted into the
// component's shadow root — nothing is applied to your page). See Styles below.
import '@uipath/du-validation-station-wc/styles';
// Material Icons, so icons render as glyphs rather than their ligature text.
// Apollo text fonts are NOT in this package — see Fonts below.
import '@uipath/du-validation-station-wc/fonts.css';
```

> **Upgrading from a previous release candidate?** Earlier READMEs said to
> import `styles.css` (a real CSS file) instead of the `styles` JS entry.
> That still works, but applies the stylesheet to your whole document —
> replace it with `import '@uipath/du-validation-station-wc/styles';`.
> See [Styles](#styles) for why.

### 2. Mount the element

```html
<ui-du-validation-station-standalone-wc-element id="vs"></ui-du-validation-station-standalone-wc-element>
```

### 3. Wire up data and event handlers

```ts
import type {
    IValidationStationStandaloneWcElement,
    IVsSaveValidatedDataRequest,
    IFieldValueDetailsDto,
} from '@uipath/du-validation-station-wc';

const el = document.querySelector<IValidationStationStandaloneWcElement>('#vs')!;

// Required setup (object inputs must be JS properties, not HTML attributes).
el.documentId        = 'doc-123';
el.taxonomy          = await fetchTaxonomy();
el.extractionResult  = await fetchExtractionResult();
el.dom               = await fetchDocumentObjectModel();
el.text              = await fetchText();
el.original          = await fetchOriginalAsBase64DataUrl();

// Optional: the model's prediction — the extraction output nobody edited — as opposed to
// extractionResult, the result the user reviews and edits. It enables features that compare
// against the predicted extractions; set to null to clear it.
el.predictedExtractionResult = await fetchPredictedExtractionResult();

// Optional configuration.
el.theme    = 'light';
el.language = 'en';
el.options  = { hideReportAsExceptionButton: true };

// User pressed Save — call YOUR backend.
el.addEventListener('saveValidatedDataRequest', (e: CustomEvent<IVsSaveValidatedDataRequest>) => {
    submitValidatedData(e.detail.documentId, e.detail.validatedData);
});

// React to field selection.
el.addEventListener('fieldValueSelected', (e: CustomEvent<IFieldValueDetailsDto>) => {
    console.log('Selected:', e.detail);
});
```

`taxonomy`, `extractionResult`, `predictedExtractionResult` and `dom` are typed with the Document
Understanding contracts `DocumentTaxonomy`, `ExtractionResult` and
`DocumentEntity`, imported from
`@uipath/uipath-typescript/document-understanding`. This package declares
`@uipath/uipath-typescript` as a peer dependency; it must be installed for
them to resolve to anything other than `any`.

`customizationInfo` is typed `unknown`; the package exports its shape as
`ICustomizationInfoDTO` for opt-in typing (see
[Customization options](#customization-options)).

### Supplying a Flow extraction instead

A document produced by a UiPath Flow extraction can be supplied as
`flowTaxonomy` (the output JSON Schema) + `flowExtraction` (the extracted
values and their confidences) **instead of** `taxonomy` + `extractionResult`.
Supply one pair or the other, and both halves of it — a half-supplied pair
leaves the element waiting for the other half.

```ts
el.flowTaxonomy   = await fetchFlowOutputSchema();
el.flowExtraction = await fetchFlowExtraction();
```

Such a document saves back in the representation it arrived in:
`saveValidatedDataRequest`'s `validatedData` is then an
`IVsFlowValidatedResult` — the reviewer's `output` plus an `attribution` map
keyed by JSON Pointer — rather than an `ExtractionResult`. Tell the two apart
by the `output` property, which an `ExtractionResult` never has.

### Updating the data inputs after mount

These are object inputs, and the component compares them by reference.
Mutating an object you already assigned has no effect — **assign a new
object** for an update to be picked up.

> **Changing `taxonomy` alone does not re-map extraction values that are
> already loaded.** The fields panel keeps the values it built from the
> previous taxonomy, so a new taxonomy on its own can leave it showing
> fields from the old one. Assign a new `extractionResult` in the same
> update, and the values are re-mapped against the new taxonomy.

**Re-feeding `extractionResult` is destructive.** The loaded values are
replaced wholesale, which discards any edits the reviewer has not saved
and resets the current selection. Persist pending edits before you
re-feed.

Because of that, recreating the element is often the clearer option, and it
costs no more: call `forceDestroy()` if your variant has it, `remove()` the
element, then create a fresh one with the new inputs and re-attach your
event listeners. Defer this with `queueMicrotask` when the trigger is one of
the WC's own event handlers, so you are not destroying the element from
inside its own event dispatch. Either route loses unsaved edits, so save
first if they matter.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Customization options

`customizationInfo` carries the element's customization payload. The package
exports its shape as `ICustomizationInfoDTO`, and the flags below live under
its `FeatureCustomization` member, typed `IFeatureCustomization`. A supplied
`customizationInfo` is merged over a built-in default that renders compact.

| Flag | Effect | Mode | Elements |
|---|---|---|---|
| `DisableLanguageSelection` | When `true`, hides the document viewer's OCR language dropdown and leaves only the selected language on display. | both | validation-station, document-viewer |
| `DisableReportException` | When `true`, hides the "Report as exception" action from the fields form (`options.hideReportAsExceptionButton` hides it independently). | both | validation-station, fields-form |
| `DefaultSelectionMode` | Sets the document viewer's initial selection tool — `'Tokens'` for word selection, `'Area'` for free-form boxes, `'UserChoice'` to decide per selection — which the user can still switch afterwards. | both | validation-station, document-viewer |
| `DisableFieldCrops` | Has no effect in the current version. | n/a | none |
| `HideConfidence` | Deprecated alias of `IgnoreConfidence`; either flag on its own takes confidence out of the experience. | both | validation-station, fields-form, table-editor |
| `IgnoreConfidence` | When `true`, takes confidence out of the experience: no confidence indicator, no confidence rows in a value's hover breakdown, no per-suggestion confidence in the suggestions dropdown, and confidence no longer makes a value count as an issue, so the "hide fields with no issues" filter and the collapsed group and row dots follow suit. Broken business rules and failed extraction validation still flag the value. | both | validation-station, fields-form, table-editor |
| `DisableAnchorSelectionMode` | Anchor selection is disabled unless you set this flag to `false` explicitly — an absent flag disables it too. Enabled, it shows the anchor icon on fields whose only edit reference is an anchor, and adds the viewer's Anchor tool on the validation-station element. | both | validation-station, fields-form |
| `FieldsValidationConfidence` | Seeds the classic fields form's confidence-threshold slider once on first load, as a percentage from 0 to 100 (`null` or `0` seeds nothing); the user can move the threshold afterwards. | classic | validation-station |
| `EnableRTLFeatures` | When `true`, adds a text-direction toggle and a "reverse words" action to the value and table-cell action menus, for right-to-left text extracted in the wrong order. | both | validation-station, fields-form, table-editor |
| `DisplayMode` | Chooses which shell the validation-station element renders. Only that element reads it — every other element always renders compact. Omitted, it keeps the compact default; `'classic'` selects the classic shell. | selects the mode | validation-station |
| `TextOnlyMode` | When `true`, the document viewer skips the page image and runs text-only, with no token creation on the canvas; the document-viewer element ignores the flag and derives text-only mode from the content inputs it was given. | both | validation-station |
| `HideConfirmationCheckboxes` | When `true`, hides the per-value, per-row and per-cell confirmation checkboxes. Purely visual — the confirmation state and the submit flow are unchanged. | compact | validation-station, fields-form, table-editor |
| `HideReadonlyModeIndicator` | When `true`, hides the READ-ONLY indicator shown at the bottom of the fields list while the element is read-only. | both | validation-station, fields-form |
| `EnablePredictionDiff` | When `true`, shows the predicted value where it differs from the current values, with a button that takes it over. Needs `predictedExtractionResult`. | compact | validation-station, fields-form, table-editor |

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Element options

`options` (typed `IValidationStationOptions`) configures the host-facing
chrome of the validation-station element. Every member is optional.

| Option | Effect |
|---|---|
| `hideSubmitButton`, `hideReportAsExceptionButton`, `hideDocumentTypeField`, `hideFields`, `hideBusinessRules` | Hide the matching part of the fields panel. |
| `fieldsSectionPosition` | `'left'` (default) or `'right'` — which side the fields panel sits on. |
| `fieldFilterOptions` | Trims the compact field-filter toolbar: `hideBar` removes it entirely; `hideConfirmed`, `hideNotExtracted` and `hideNoFlaggedIssues` each drop one entry of the *Hide fields* menu, and the menu button disappears once all three are hidden. A hidden filter also stops filtering. |
| `defaultFieldsAreaPercentage` | Width the fields panel starts at, as a percentage (0–100) of the element. Wins over `defaultFieldsAreaWidth`. |
| `defaultFieldsAreaWidth` | Width the fields panel starts at, in pixels. |
| `enableUserPreferences` | Default `true`. Remembers the reviewer's dragged panel width, which then wins over the two defaults above, and their field filters. The panel always stays within 30–80% of the element. |
| `userPreferencesKeySuffix` | Separates the stored preferences of several embeds on one origin. |
| `emitDtoStateChanges` | When `true`, `extractionResultChanged` fires on every internal state change. |
| `documentViewerOptions` | Configures the embedded document viewer. It is the same `DocumentViewerOptions` object the document-viewer element takes, so one configuration drives both. |

```ts
el.options = {
    fieldFilterOptions: { hideConfirmed: true, hideNotExtracted: true },
    defaultFieldsAreaPercentage: 40, // 40% fields, 60% viewer
    documentViewerOptions: {
        floatingButtonsOptions: {
            hideLanguageSelect: true,
            hideExtractedTokensToggle: true,
        },
    },
};
```

`floatingButtonsOptions` hides individual viewer controls:
`hideTextView`, `hideInteractionTypeButton`, `hideSwitchPanelSidesButton`,
`hideKeyboardShortcutsButton`, `hideSearch`, `hideExtractedTokensToggle`
(also disables its keyboard shortcut) and `hideLanguageSelect` (removes the
dropdown, where the `DisableLanguageSelection` customization only disables
it). `defaultInteractionType` picks the selection mode the viewer starts in.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Custom value-indicator overlay

Hovering a value's confidence indicator opens a built-in popover. To render
your own instead, hide the built-in one and listen to the WC message bus —
a single composed `ui-du-vs-wc-message` event whose `detail` is an
`IVsWcMessage`:

```css
ui-du-validation-station-standalone-wc-element::part(indicator-overlay) {
    display: none;
}
```

```ts
import type { IVsWcMessage } from '@uipath/du-validation-station-wc';

el.addEventListener('ui-du-vs-wc-message', (e: CustomEvent<IVsWcMessage>) => {
    switch (e.detail.type) {
        case 'indicator-overlay-show':
            // Confidences, thresholds, confirmation and broken-rule state,
            // plus the trigger's viewport rect to position against.
            showPopover(e.detail.context);
            break;
        case 'indicator-overlay-hide':
            hidePopover();
            break;
    }
});
```

`detail.instanceId` tells instances apart when several elements share a
listener.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## React

### React 18

In React 18, complex object props must be set via a `ref` as JS
properties — React 18 serialises JSX props to HTML attributes and
Angular Elements cannot deserialise object JSON. Scalar inputs
(`theme`, `language`, `is-readonly`, …) work directly as JSX
attributes.

```tsx
import { useEffect, useRef } from 'react';
import type {
    IValidationStationStandaloneWcElement,
    IVsSaveValidatedDataRequest,
} from '@uipath/du-validation-station-wc';
import type {
    DocumentEntity,
    DocumentTaxonomy,
    ExtractionResult,
} from '@uipath/uipath-typescript/document-understanding';

import '@uipath/du-validation-station-wc/polyfills';
import '@uipath/du-validation-station-wc/main';
import '@uipath/du-validation-station-wc/styles';
import '@uipath/du-validation-station-wc/fonts.css';
// Only if you want the UiPath typography and your app does not already load it:
import '@uipath/apollo-fonts/font.css';

export function ValidationStation(props: {
    documentId: string;
    taxonomy: DocumentTaxonomy;
    extractionResult: ExtractionResult;
    dom: DocumentEntity;
    text: string;
    original: string;
    onSave: (req: IVsSaveValidatedDataRequest) => void;
}) {
    const ref = useRef<IValidationStationStandaloneWcElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.documentId       = props.documentId;
        el.taxonomy         = props.taxonomy;
        el.extractionResult = props.extractionResult;
        el.dom              = props.dom;
        el.text             = props.text;
        el.original         = props.original;

        const handler = (e: CustomEvent<IVsSaveValidatedDataRequest>) => props.onSave(e.detail);
        el.addEventListener('saveValidatedDataRequest', handler);
        return () => el.removeEventListener('saveValidatedDataRequest', handler);
    }, [props]);

    return (
        <ui-du-validation-station-standalone-wc-element
            ref={ref}
            theme="light"
            is-readonly={false}
        />
    );
}
```

### React 19

React 19 supports passing complex object props directly as JSX
attributes. Refs become optional for static data:

```tsx
<ui-du-validation-station-standalone-wc-element
    documentId={documentId}
    taxonomy={taxonomy}
    extractionResult={extractionResult}
    dom={dom}
    text={text}
    original={original}
    theme="light"
/>
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Persistent variant

If your app moves the element through portals or tab switches, use the
persistent variant — it suppresses `disconnectedCallback()` so the
internal Angular state survives detachments. **Always call
`forceDestroy()`** when permanently removing the element to avoid
memory leaks.

```html
<ui-du-validation-station-standalone-wc-persistent-element></ui-du-validation-station-standalone-wc-persistent-element>
```

```ts
import type { IPersistentValidationStationStandaloneWcElement } from '@uipath/du-validation-station-wc';

const el = document.querySelector<IPersistentValidationStationStandaloneWcElement>('#vs');
el?.forceDestroy();
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Lazy loading

The bundle is non-trivial (several MB). If your app loads the WC
conditionally, defer the side-effect imports behind a dynamic
`import()` so the bundler can split it off:

```ts
async function showValidationStation() {
    await Promise.all([
        import('@uipath/du-validation-station-wc/polyfills'),
        import('@uipath/du-validation-station-wc/main'),
        import('@uipath/du-validation-station-wc/styles'),
        import('@uipath/du-validation-station-wc/fonts.css'),
    ]);
    // …mount the element.
}
```

The `styles` entry carries the full theme (~1.2 MB of CSS as a JS string),
so deferring it alongside `main` keeps all of it out of your initial bundle.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Static assets

The WC loads runtime assets (pdf.js scripts, cmaps and wasm decoders,
translations, and the business-rules executor) from a sibling
`du-assets/` directory at runtime, resolved relative to where the WC's
main bundle is served via `import.meta.url`.

**`du-assets/` must be deployed at the same path level as your output
bundle.** Nothing fails at build time if it is missing — the failure
surfaces at runtime, and not uniformly:

- **PDF rendering and translations degrade silently.** The requests 404
  and the component carries on, with unrendered pages or untranslated
  labels.
- **Business-rules validation rejects.** The executor is pulled in with a
  dynamic `import()`, so a missing `du-assets/` surfaces as a failed
  module load rather than a silent 404.

How you deploy it depends on how you serve the WC:

- **If your bundler inlines the WC into your app bundle** (typical
  npm consumers): copy
  `node_modules/@uipath/du-validation-station-wc/du-assets/` to your
  dist root as a post-build step. Most bundlers have an asset-copy
  plugin (Vite `publicDir`, webpack `CopyPlugin`,
  `rollup-plugin-copy`, Angular `assets` array).
- **If you load `main.js` as a separate browser bundle** (e.g.
  `<script type="module" src="…/main.js">`): make sure your CDN or
  static host serves the package's `du-assets/` folder alongside.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Styles

The component's Material/Apollo theme is **adopted into its shadow
root** — it never styles your page. The `styles` side-effect entry:

```ts
import '@uipath/du-validation-station-wc/styles';
```

registers the theme CSS with the component's runtime; each component
instance then adopts it as a constructed stylesheet inside its own
shadow root. Import it before mounting the first element (alongside
`main`, as in the snippets above).

**Do not link or import the package's raw `styles.css` into your
document.** It is the same CSS, but applied at document level it is not
inert: it carries Angular Material core/density tokens (`html { --mat-* }`)
and theme rules scoped to generic classes (`body.light`, `.dark`,
`.apollo-design`, `.mat-*`) that will restyle a host app using Angular
Material or Apollo. `styles.css` remains in the package for backwards
compatibility and for deployments that serve the WC as a separate
browser bundle (there the component fetches it automatically from
alongside `main.js` — no import needed at all).

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Fonts

The component uses Material Icons and Apollo text fonts (Poppins /
Noto Sans / Inconsolata). Import the package's `fonts.css` once, at app
startup:

```ts
import '@uipath/du-validation-station-wc/fonts.css';
```

It has to apply at the **document (light-DOM) scope**, as a plain CSS
side-effect import does: `@font-face` is ignored inside a shadow root,
so it cannot travel with the component's theme (see [Styles](#styles))
and a rule you scope into the shadow tree yourself will not take effect.

If you serve `main.js` as a separate browser bundle instead of importing
it through a bundler (see [Static assets](#static-assets)), link the file
and serve its sibling `media/` directory alongside:

```html
<link rel="stylesheet" href="…/fonts.css">
```

### What is in it, and what is not

This package's `fonts.css` carries **Material Icons only** — the two
`@font-face` rules and ~280 kB of binaries. Without it every icon
renders as its ligature text (`menu`, `close`, …), so it is the one
font the component genuinely cannot do without.

**The Apollo text fonts are deliberately not included, and most consumers
will not want them.** They are tens of megabytes, a UiPath-styled host
already loads them, and without them the component's text simply inherits
whatever font stack your app already uses — which is usually the point of
embedding it. Nothing breaks either way.

Add them only if you specifically want the UiPath typography and your app
does not already load it:

```sh
npm install @uipath/apollo-fonts
```

```ts
import '@uipath/apollo-fonts/font.css';
```

That file already contains Material Icons, so you can drop the
`fonts.css` import if you use it.

> **Loading the WC from a deployment URL instead?** The UiPath-hosted
> deployment is built differently: the `fonts.css` served there carries
> the full Apollo set. `loadValidationStationWebComponent(document, url, { includeFonts: true })`
> from [`@uipath/du-utils`](https://www.npmjs.com/package/@uipath/du-utils)
> links it for you. The option works the same way against a base you
> assemble from this package — you just get the icons-only file.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Versioning

This package follows semantic versioning. See `CHANGELOG.md` for
release notes.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>
