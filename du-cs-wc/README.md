<div align="center">

# UiPath Document Understanding — Classification Station Web Component

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@uipath/du-classification-station-wc?logo=npm)](https://www.npmjs.com/package/@uipath/du-classification-station-wc)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.dev/)

[Install](#install) • [Usage](#usage--standalone-variant) • [React](#react) • [Persistent variant](#persistent-variant) • [Lazy loading](#lazy-loading)

A drop-in web component that renders the UiPath Document Understanding Classification Station inside any frontend project.

</div>

## About Classification Station

Classification Station is the human-in-the-loop **split and classify** step of a UiPath Document Understanding pipeline. It renders the pages of a file as thumbnails next to the original document and lets a reviewer confirm or correct how the classifier split that file into documents — dragging pages between groups, assigning a document type to each group, and optionally anchoring a group to an OCR reference. The confirmed classification is emitted to the host application on save, or routed to an exception flow when a document can't be processed.

It is the step *before* extraction. Its sibling, [`@uipath/du-validation-station-wc`](https://www.npmjs.com/package/@uipath/du-validation-station-wc), reviews the extracted field values of a document that has already been classified.

Learn more in the [UiPath Document Understanding docs](https://docs.uipath.com/activities/other/latest/document-understanding/present-classification-station).

<details>
<summary><strong>Table of contents</strong></summary>

- [About Classification Station](#about-classification-station)
- [Install](#install)
- [Usage — standalone variant](#usage--standalone-variant)
  - [1. Register the custom elements](#1-register-the-custom-elements)
  - [2. Mount the element](#2-mount-the-element)
  - [3. Wire up data and event handlers](#3-wire-up-data-and-event-handlers)
  - [`dirty` vs `hasChanges`](#dirty-vs-haschanges)
  - [Updating the data inputs after mount](#updating-the-data-inputs-after-mount)
- [Customization options](#customization-options)
- [Document viewer options](#document-viewer-options)
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

</details>

## Install

```bash
# npm
npm install @uipath/du-classification-station-wc

# yarn
yarn add @uipath/du-classification-station-wc

# pnpm
pnpm add @uipath/du-classification-station-wc
```

The package's `fonts.css` carries the **Material Icons** font it needs, but
**not** the Apollo text fonts. Those are optional: add
[`@uipath/apollo-fonts`](https://www.npmjs.com/package/@uipath/apollo-fonts)
alongside it only if you want the UiPath typography and your app does not
already load it — see [Fonts](#fonts).

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Usage — standalone variant

The **standalone** variant (`<ui-du-classification-station-standalone-wc-element>`)
does not make any HTTP calls. The consumer provides all document data
as JS properties and handles save / draft / exception requests by
listening to events. This is the variant for external consumers — your
backend stays in control of all I/O.

### 1. Register the custom elements

Side-effect imports register the custom elements with the browser. Do
this once at app startup (or lazily, behind a route boundary — see
[Lazy loading](#lazy-loading) below).

```ts
import '@uipath/du-classification-station-wc/polyfills';
import '@uipath/du-classification-station-wc/main';
// Registers the component's theme CSS with the runtime (adopted into the
// component's shadow root — nothing is applied to your page). See Styles below.
import '@uipath/du-classification-station-wc/styles';
// Material Icons, so icons render as glyphs rather than their ligature text.
// Apollo text fonts are NOT in this package — see Fonts below.
import '@uipath/du-classification-station-wc/fonts.css';
```

### 2. Mount the element

```html
<ui-du-classification-station-standalone-wc-element id="cs"></ui-du-classification-station-standalone-wc-element>
```

### 3. Wire up data and event handlers

```ts
import type {
    IClassificationStationStandaloneWcElement,
    ICsSaveClassificationRequest,
    SplitClassifications,
} from '@uipath/du-classification-station-wc';

const el = document.querySelector<IClassificationStationStandaloneWcElement>('#cs')!;

// Data inputs (object inputs must be JS properties, not HTML attributes).
el.dom                   = await fetchDocumentObjectModel();
el.text                  = await fetchText();
el.original              = await fetchOriginalAsBase64DataUrl();
el.docTypes              = (await fetchTaxonomy()).DocumentTypes;
el.classificationResults = await fetchClassification();  // `null` = unclassified

// Optional configuration.
el.theme             = 'light';  // any WcTheme: 'light', 'dark', 'light-hc', 'dark-hc', 'future-light', 'future-dark'
el.language          = 'en';
el.enableSaveAsDraft = true;

// User pressed Save — call YOUR backend. The element never does.
el.addEventListener('saveClassificationRequest', (e: CustomEvent<ICsSaveClassificationRequest>) => {
    submitClassification(e.detail.documentId, e.detail.classification);
});

// The current split, as document type + compressed page range ('1-3,5') pairs.
el.addEventListener('splitClassifications', (e: CustomEvent<SplitClassifications>) => {
    console.log('Split:', e.detail.split);
});

// Assign the document id LAST. The element renders an idle screen until it arrives, so assigning
// it once everything else is in place mounts the station exactly once, with all its data ready —
// rather than mounting it empty and letting the inputs arrive underneath.
el.documentId = 'doc-123';
```

`dom` and `docTypes` are typed with the Document Understanding contracts
`DocumentEntity` and `DocumentTypeEntity`, imported from
`@uipath/uipath-typescript/document-understanding`. This package declares
`@uipath/uipath-typescript` as a peer dependency; it must be installed for
those two to resolve to anything other than `any`.

Three things are easy to get wrong:

- **Assign `documentId` last**, as above — see the comment in the snippet.
- **`docTypes` is the document-type array, not the taxonomy.** Pass
  `taxonomy.DocumentTypes`.
- **`classificationResults: null` is meaningful** — it loads an unclassified
  document, and is *not* the same as leaving the input unset, which keeps the
  element waiting for data.

### `dirty` vs `hasChanges`

The element emits both, they are **not** the same signal, and neither is
derived from the other:

- **`dirty`** is a flag, set by any mutation routed through the station's
  dirtying path.
- **`hasChanges`** is a structural comparison against the classification as
  loaded (or last saved). It considers **only** the group count, each group's
  document type, each group's page count, and each page's index and
  index-in-group.

So assigning an OCR reference to a group sets `dirty` but leaves `hasChanges`
false. Gate an "unsaved work" prompt on `dirty`; gate a save button on whichever
matches your product.

### Updating the data inputs after mount

These are object inputs, and the component compares them by reference.
Mutating an object you already assigned has no effect — **assign a new
object** for an update to be picked up.

**Re-feeding `classificationResults` is destructive.** The loaded groups are
replaced wholesale, which discards any edits the reviewer has not saved and
resets the current selection. Persist pending edits before you re-feed.

Because of that, recreating the element is often the clearer option, and it
costs no more: call `forceDestroy()` if your variant has it, `remove()` the
element, then create a fresh one with the new inputs and re-attach your
event listeners. Defer this with `queueMicrotask` when the trigger is one of
the WC's own event handlers, so you are not destroying the element from
inside its own event dispatch. Either route loses unsaved edits, so save
first if they matter.

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Customization options

`customizationInfo` carries the element's customization payload. The package
exports its shape as `ICustomizationInfoDTO`, and the flags below live under
its `FeatureCustomization` member, typed `IFeatureCustomization`. Unset, or
`{ FeatureCustomization: null }`, every flag is off.

| Flag | Effect |
|---|---|
| `EnablePageReordering` | When `true`, the reviewer can drag pages between classified groups. The document viewer's text-view toggle is hidden while it is on. |
| `DisableKeyboardShortcuts` | When `true`, turns the keyboard shortcuts off for every user, overriding the setting a user picks in the keyboard-shortcuts dialog: the station's shortcuts stop responding, their hints are hidden, and the document viewer menu drops its "Show available keyboard shortcuts" entry. Inside the document viewer, the toolbar hints, the search box's Enter navigation and the Alt+−, Alt++ and Alt+0 zoom keys still work. Omitted or `false`, each user's own setting applies. |

```ts
el.customizationInfo = {
    FeatureCustomization: { EnablePageReordering: true },
};
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Document viewer options

`documentViewerOptions` (typed `DocumentViewerOptions`) configures the
embedded document viewer. It is the same object the Validation Station
elements take as `options.documentViewerOptions` and
[`@uipath/du-document-viewer-wc`](https://www.npmjs.com/package/@uipath/du-document-viewer-wc)
takes as `options`, so one configuration drives all of them. Every member is
optional; unset, the viewer is unchanged. Assign a new object to change it.

| Option | Effect |
|---|---|
| `floatingButtonsOptions.hideTextView` | Hides the image/text view toggle. It is always hidden while `EnablePageReordering` is on. |
| `floatingButtonsOptions.hideInteractionTypeButton` | Hides the "Selection mode" button. It is always hidden when `enableTokenFeatures` is `false`. |
| `floatingButtonsOptions.hideSearch` | Hides the in-document search. It is always hidden when `enableTokenFeatures` is `false`. |
| `floatingButtonsOptions.defaultInteractionType` | The selection mode the viewer starts in: `'Tokens'` (default), `'Area'`, `'UserChoice'` or `'Text'`. The user can still switch. |
| `floatingButtonsOptions.hideSwitchPanelSidesButton` | Removes "Switch panel sides" from the viewer's menu. |
| `floatingButtonsOptions.hideKeyboardShortcutsButton` | Removes "Show available keyboard shortcuts" from the viewer's menu. The `?` shortcut still opens the dialog; `disableShortcutsPanel` or `DisableKeyboardShortcuts` turn it off. |
| `autoRotationThreshold` | Rotates a page automatically when more than this share of its sections, in (0, 1], is detected as rotated. Default `0.7`. |
| `disableSelection` | Turns word and area selection off, and hides the "Selection mode" button. The reviewer can then no longer pick a group's reference from the document. |

With both menu entries removed, the menu button is hidden too.

```ts
el.documentViewerOptions = {
    floatingButtonsOptions: { hideSwitchPanelSidesButton: true, defaultInteractionType: 'Area' },
};
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

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
    IClassificationStationStandaloneWcElement,
    IClassifierResultDTO,
    ICsSaveClassificationRequest,
} from '@uipath/du-classification-station-wc';
import type {
    DocumentEntity,
    DocumentTypeEntity,
} from '@uipath/uipath-typescript/document-understanding';

import '@uipath/du-classification-station-wc/polyfills';
import '@uipath/du-classification-station-wc/main';
import '@uipath/du-classification-station-wc/styles';
import '@uipath/du-classification-station-wc/fonts.css';
// Only if you want the UiPath typography and your app does not already load it:
import '@uipath/apollo-fonts/font.css';

export function ClassificationStation(props: {
    documentId: string;
    dom: DocumentEntity;
    text: string;
    original: string;
    docTypes: DocumentTypeEntity[];
    classificationResults: IClassifierResultDTO | null;
    onSave: (req: ICsSaveClassificationRequest) => void;
}) {
    const ref = useRef<IClassificationStationStandaloneWcElement | null>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.dom                   = props.dom;
        el.text                  = props.text;
        el.original              = props.original;
        el.docTypes              = props.docTypes;
        el.classificationResults = props.classificationResults;
        el.documentId            = props.documentId;

        const handler = (e: CustomEvent<ICsSaveClassificationRequest>) => props.onSave(e.detail);
        el.addEventListener('saveClassificationRequest', handler);
        return () => el.removeEventListener('saveClassificationRequest', handler);
    }, [props]);

    return (
        <ui-du-classification-station-standalone-wc-element
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
<ui-du-classification-station-standalone-wc-element
    documentId={documentId}
    dom={dom}
    text={text}
    original={original}
    docTypes={docTypes}
    classificationResults={classificationResults}
    theme="light"
/>
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Persistent variant

If your app moves the element through portals or tab switches, use the
persistent variant — it suppresses `disconnectedCallback()` so the
internal Angular state survives detachments. **Always call
`forceDestroy()`** when permanently removing the element to avoid
memory leaks.

```html
<ui-du-classification-station-standalone-wc-persistent-element></ui-du-classification-station-standalone-wc-persistent-element>
```

```ts
import type { IPersistentClassificationStationStandaloneWcElement } from '@uipath/du-classification-station-wc';

const el = document.querySelector<IPersistentClassificationStationStandaloneWcElement>('#cs');
el?.forceDestroy();
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Lazy loading

The bundle is non-trivial (several MB). If your app loads the WC
conditionally, defer the side-effect imports behind a dynamic
`import()` so the bundler can split it off:

```ts
async function showClassificationStation() {
    await Promise.all([
        import('@uipath/du-classification-station-wc/polyfills'),
        import('@uipath/du-classification-station-wc/main'),
        import('@uipath/du-classification-station-wc/styles'),
        import('@uipath/du-classification-station-wc/fonts.css'),
    ]);
    // …mount the element.
}
```

The `styles` entry carries the full theme (a large CSS payload as a JS string),
so deferring it alongside `main` keeps all of it out of your initial bundle.

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Static assets

The WC loads runtime assets (pdf.js scripts, cmaps and wasm decoders,
and translations) from a sibling `du-assets/` directory at runtime,
resolved relative to where the WC's main bundle is served via
`import.meta.url`.

**`du-assets/` must be deployed at the same path level as your output
bundle.** Nothing fails at build time if it is missing — the failure
surfaces at runtime, and quietly: the requests 404 and the component
carries on, with unrendered pages, no page thumbnails, or untranslated
labels.

How you deploy it depends on how you serve the WC:

- **If your bundler inlines the WC into your app bundle** (typical
  npm consumers): copy
  `node_modules/@uipath/du-classification-station-wc/du-assets/` to your
  dist root as a post-build step. Most bundlers have an asset-copy
  plugin (Vite `publicDir`, webpack `CopyPlugin`,
  `rollup-plugin-copy`, Angular `assets` array).
- **If you load `main.js` as a separate browser bundle** (e.g.
  `<script type="module" src="…/main.js">`): make sure your CDN or
  static host serves the package's `du-assets/` folder alongside.

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Styles

The component's Material/Apollo theme is **adopted into its shadow
root** — it never styles your page. The `styles` side-effect entry:

```ts
import '@uipath/du-classification-station-wc/styles';
```

registers the theme CSS with the component's runtime; each component
instance then adopts it as a constructed stylesheet inside its own
shadow root. Import it before mounting the first element (alongside
`main`, as in the snippets above).

**Do not link or import the package's raw `styles.css` into your
document.** It is the same CSS, but applied at document level it is not
inert: it carries Angular Material core/density tokens and theme rules
scoped to generic classes (`.apollo-design`, `.mat-*`) that will restyle
a host app using Angular Material or Apollo. `styles.css` remains in the
package for deployments that serve the WC as a separate browser bundle
(there the component fetches it automatically from alongside `main.js` —
no import needed at all).

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Fonts

The component uses Material Icons and Apollo text fonts (Poppins /
Noto Sans / Inconsolata). Import the package's `fonts.css` once, at app
startup:

```ts
import '@uipath/du-classification-station-wc/fonts.css';
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
> the full Apollo set. `loadClassificationStationWebComponent(document, url, { includeFonts: true })`
> from [`@uipath/du-utils`](https://www.npmjs.com/package/@uipath/du-utils)
> links it for you. The option works the same way against a base you
> assemble from this package — you just get the icons-only file.

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>

## Versioning

This package follows semantic versioning. See `CHANGELOG.md` for
release notes.

<div align="right">

[↑ Back to top](#uipath-document-understanding--classification-station-web-component)

</div>
