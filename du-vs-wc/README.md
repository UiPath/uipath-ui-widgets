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
- [React](#react)
  - [React 18](#react-18)
  - [React 19](#react-19)
- [Persistent variant](#persistent-variant)
- [Lazy loading](#lazy-loading)
- [Static assets](#static-assets)
- [Fonts](#fonts)
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
import '@uipath/du-validation-station-wc/styles.css';
// Fonts are opt-in — import this only if your app does not already load
// Apollo fonts and Material Icons globally. See Fonts below.
import '@uipath/du-validation-station-wc/fonts.css';
```

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

The shapes of `taxonomy`, `extractionResult`, `dom`, `customizationInfo`,
and the save-request payloads are typed as `unknown` in the public type
defs because they originate in UiPath's Document Understanding domain
DTOs. Cast to the relevant DTO when forwarding to your backend.

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

import '@uipath/du-validation-station-wc/polyfills';
import '@uipath/du-validation-station-wc/main';
import '@uipath/du-validation-station-wc/styles.css';
// Only if your app does not already load Apollo fonts + Material Icons:
import '@uipath/du-validation-station-wc/fonts.css';

export function ValidationStation(props: {
    documentId: string;
    taxonomy: unknown;
    extractionResult: unknown;
    dom: unknown;
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
        import('@uipath/du-validation-station-wc/styles.css'),
        // Drop this line if your app already ships Apollo fonts + Material Icons.
        import('@uipath/du-validation-station-wc/fonts.css'),
    ]);
    // …mount the element.
}
```

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Static assets

The WC loads runtime assets (PDF.js worker, cmaps, wasm, i18n) from a
sibling `du-assets/` directory at runtime, resolved relative to where
the WC's main bundle is served via `import.meta.url`.

**`du-assets/` must be deployed at the same path level as your output
bundle**, otherwise PDF rendering and translations will silently 404
in the browser (no build error).

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

## Fonts

The component uses Apollo fonts and Material Icons. Because `@font-face`
rules are ignored inside a shadow root, the fonts are shipped as a
**separate, opt-in** `fonts.css` that must load into the light DOM
(the document, not the component's shadow tree) rather than being
bundled into `styles.css`.

**Import `fonts.css` if your host page does not already load Apollo
fonts and Material Icons.** Without it, text falls back to system fonts
and icon glyphs render as empty boxes.

```ts
import '@uipath/du-validation-station-wc/fonts.css';
```

Importing it as a CSS side effect (as above) applies the `@font-face`
rules at the document (light-DOM) scope — where they must live to take
effect, since rules scoped inside the component's shadow root are
ignored. Skip the import if your app already provides these fonts
globally, to avoid double-loading them.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>

## Versioning

This package follows semantic versioning. See `CHANGELOG.md` for
release notes.

<div align="right">

[↑ Back to top](#uipath-document-understanding--validation-station-web-component)

</div>
