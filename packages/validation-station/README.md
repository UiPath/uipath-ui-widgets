# @uipath/ui-widgets-validation-station

A React wrapper for the UiPath Document Understanding Validation Station. It handles web component loading, bucket artifact fetching, and exposes a declarative props API for all Validation Station features.

## Installation

```bash
npm install @uipath/ui-widgets-validation-station
```

### Peer dependencies

```
react >= 19.2.0
react-dom >= 19.2.0
@uipath/uipath-typescript >= 1.4.2
```

## Quick start

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import {
  configureValidationStationWc,
  ValidationStation,
  ValidationStationLanguage,
} from "@uipath/ui-widgets-validation-station";
import { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";

// Once, at app startup — tells the widgets where the web component is hosted.
// See "Hosting the web component" below.
configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });

const sdk = new UiPath({
  baseUrl: "https://cloud.uipath.com",
  orgName: "your-org",
  tenantName: "your-tenant",
  secret: "your-secret",
});

await sdk.initialize();

function App() {
  return (
    <ValidationStation
      sdk={sdk}
      data={selectedTask.data as DuFramework.ContentValidationData}
      folderId={12345}
    />
  );
}
```

> `theme` defaults to `"light"` and `language` defaults to `ValidationStationLanguage.English`, so the minimal mount just needs `sdk`, `data`, and a folder.

> You must call `configureValidationStationWc` once before rendering any widget
> from this package, and host the web component's files at the `deploymentUrl` you
> pass it. See [Hosting the web component](#hosting-the-web-component).

## Props

| Prop                             | Type                                           | Required | Default   | Description                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ---------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sdk`                            | `UiPath`                                       | Yes      | —         | UiPath SDK instance for authentication and API calls                                                                                                                                                                                                                                                                                              |
| `data`                           | `ContentValidationData`                        | Yes      | —         | Document data containing bucket paths, document ID, and folder references                                                                                                                                                                                                                                                                         |
| `folderId`                       | `number`                                       | No\*     | —         | Storage bucket folder ID. Falls back to `data.FolderId`. **One of the two must resolve to a value** — otherwise the widget show an error.                                                                                                                                                                                                         |
| `theme`                          | `'light' \| 'dark' \| 'light-hc' \| 'dark-hc'` | No       | `'light'` | Visual theme                                                                                                                                                                                                                                                                                                                                      |
| `language`                       | `ValidationStationLanguage`                    | No       | `English` | UI language (see enum below)                                                                                                                                                                                                                                                                                                                      |
| `isReadonly`                     | `boolean`                                      | No       | `false`   | When `true`, renders in read-only mode                                                                                                                                                                                                                                                                                                            |
| `options`                        | `IValidationStationOptions`                    | No       | —         | Fine-grained UI feature flags                                                                                                                                                                                                                                                                                                                     |
| `save={{ validate: false }}`     | `{ validate: boolean }`                        | No       | —         | Trigger **save as draft**. ⚠ Requires `options.emitDtoStateChanges: true` — otherwise the web component won't surface the latest in-memory extraction state and the save will be a no-op.                                                                                                                                                         |
| `save={{ validate: true }}`      | `{ validate: boolean }`                        | No       | —         | Trigger **submit** — runs validation first, then saves.                                                                                                                                                                                                                                                                                           |
| `discardChanges`                 | `{ value: boolean }`                           | No       | —         | Trigger a discard-changes operation. Call `setDiscardChanges({ value: true })` (or `false` — the boolean is ignored) every time you want it to fire. Each call creates a brand-new object even if the content looks identical, and that's what the widget watches for — so calling it repeatedly with the same `{ value: true }` works just fine. |
| `setFieldValueByPath`            | `SetFieldValueByPath`                          | No       | —         | Set a field value addressed by a path of `{ fieldName, valueIndex }` segments                                                                                                                                                                                                                                                                     |
| `selectAndFocusFieldValueByPath` | `SelectAndFocusFieldValueByPath`               | No       | —         | Select and focus a field value addressed by a path; focuses the document reference if any                                                                                                                                                                                                                                                         |
| `deleteFieldValueByPath`         | `DeleteFieldValueByPath`                       | No       | —         | Delete a field value addressed by a path                                                                                                                                                                                                                                                                                                          |

> Three additional callback props (`onSubmitComplete`, `onSaveAsDraftComplete`, `onReportExceptionComplete`) are documented in the next section.

### Reacting to save / draft / exception flows

The widget surfaces three user-initiated flows. Submit and draft are owned end-to-end by the widget; exception reporting is forwarded to the host so it can call the SDK directly.

| Callback                    | User action             | Signature                                      | What the widget does                                                                                                                                                        | What the host does                                                                                           |
| --------------------------- | ----------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `onSubmitComplete`          | **Submit**              | `(result: SaveValidatedDataResult) => void`    | Calls `OrchestratorDuModule.processExtractedData(...)`, then uploads the merged result to `ValidatedExtractionResultsPath`. Fires the callback with the persistence result. | (optional) react to success/failure (complete the task, retry, log, etc.).                                   |
| `onSaveAsDraftComplete`     | **Save as draft**       | `(result: SaveValidatedDataResult) => void`    | Uploads the in-progress `validatedData` straight to `ValidatedExtractionResultsPath` (no `processExtractedData` call). Fires the callback with the persistence result.      | (optional) react to success/failure.                                                                         |
| `onReportExceptionComplete` | **Report as exception** | `(documentId: string, reason: string) => void` | Extracts `documentId` and `reason` from the web component's exception DTO and hands them to the host. **No API call.**                                                      | Required if you want the report persisted — call `OrchestratorDuModule.submitExceptionReport(...)` yourself. |

Submit/draft hand you a `SaveValidatedDataResult` (`{ success, error? }`) — the host owns all UI feedback (toast, retry, etc.); the widget does not surface failures itself. The exception callback hands you `documentId` and `reason` strings ready to forward to the SDK.

```tsx
import {
  ValidationStation,
  type SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";

function App({ sdk, data, task }) {
  const handleSubmitComplete = async (result: SaveValidatedDataResult) => {
    if (!result.success) {
      console.warn("Submit failed:", result.error);
      return;
    }
    await task.complete({ action: "Completed", type: "DocumentValidation" });
  };

  const handleDraftComplete = (result: SaveValidatedDataResult) => {
    if (!result.success) console.warn("Draft save failed:", result.error);
  };

  const handleReportException = async (documentId: string, reason: string) => {
    const response = await new OrchestratorDuModule(sdk).submitExceptionReport(
      task.id,
      documentId,
      reason || "Reported via Validation Station",
      { folderId: task.folderId },
    );
    if (!response.IsSuccessful) {
      console.error("submitExceptionReport failed:", response.ErrorMessage);
    }
  };

  return (
    <ValidationStation
      sdk={sdk}
      data={data}
      folderId={task.folderId}
      onSubmitComplete={handleSubmitComplete}
      onSaveAsDraftComplete={handleDraftComplete}
      onReportExceptionComplete={handleReportException}
    />
  );
}
```

> Submit and draft callbacks are optional, but failures are silent if you skip them — the widget does not surface errors on its own. The exception callback is the only place the report goes; without it the user's "Report as exception" click is a no-op.

## Language enum

`ValidationStationLanguage` provides all supported locales:

```ts
import { ValidationStationLanguage } from "@uipath/ui-widgets-validation-station";

ValidationStationLanguage.English; // "en"
ValidationStationLanguage.German; // "de"
ValidationStationLanguage.Spanish; // "es"
ValidationStationLanguage.SpanishMexico; // "es-MX"
ValidationStationLanguage.French; // "fr"
ValidationStationLanguage.Japanese; // "ja"
ValidationStationLanguage.Korean; // "ko"
ValidationStationLanguage.Portuguese; // "pt"
ValidationStationLanguage.PortugueseBrazil; // "pt-BR"
ValidationStationLanguage.Romanian; // "ro"
ValidationStationLanguage.Russian; // "ru"
ValidationStationLanguage.Turkish; // "tr"
ValidationStationLanguage.ChineseSimplified; // "zh-CN"
ValidationStationLanguage.ChineseTraditional; // "zh-TW"
```

## Exported types

All parameter types are re-exported from the package for convenience:

```ts
import {
  configureValidationStationWc,
  DU_WC_TAGS,
  VALIDATION_STATION_TAG,
  ValidationStationLanguage,
} from "@uipath/ui-widgets-validation-station";
import type {
  ValidationStationProps,
  ValidationStationWcConfig,
  IValidationStationOptions,
  SaveValidatedDataResult,
  SetFieldValueByPath,
  SelectAndFocusFieldValueByPath,
  DeleteFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";
```

`DU_WC_TAGS` and `VALIDATION_STATION_TAG` are the custom-element tag names the
loader registers — useful for `document.querySelector` or asserting readiness in
tests. The wrappers in this package render them for you.

## Examples

### Setting a field value by path

Address fields by path when you have nested groups or table rows. Each segment is `{ fieldName, valueIndex }`.

```tsx
import { useState } from "react";
import {
  ValidationStation,
  type SetFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";

function App({ sdk, data }) {
  const [fieldValueByPath, setFieldValueByPath] = useState<
    SetFieldValueByPath | undefined
  >(undefined);

  return (
    <>
      <button
        onClick={() =>
          setFieldValueByPath({
            path: [
              { fieldName: "Invoice", valueIndex: 0 }, // parent field name
              { fieldName: "Amount", valueIndex: 0 }, // child field name
            ],
            update: { Value: "100.00", OperatorConfirmed: true },
          })
        }
      >
        Set Amount by path
      </button>
      <ValidationStation
        sdk={sdk}
        data={data}
        folderId={67}
        setFieldValueByPath={fieldValueByPath}
      />
    </>
  );
}
```

### Focusing a field by path

```tsx
import { useState } from "react";
import {
  ValidationStation,
  type SelectAndFocusFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";

function App({ sdk, data }) {
  const [focus, setFocus] = useState<
    SelectAndFocusFieldValueByPath | undefined
  >(undefined);

  return (
    <>
      <button
        onClick={() =>
          setFocus({
            path: [
              { fieldName: "Invoice", valueIndex: 0 }, // parent field name
              { fieldName: "Amount", valueIndex: 0 }, // child field name
            ],
          })
        }
      >
        Focus Amount by path
      </button>
      <ValidationStation
        sdk={sdk}
        data={data}
        folderId={67}
        selectAndFocusFieldValueByPath={focus}
      />
    </>
  );
}
```

### Triggering save

```tsx
const [save, setSave] = useState<{ validate: boolean } | undefined>(undefined);

<button onClick={() => setSave({ validate: true })}>Save</button>
<ValidationStation sdk={sdk} data={data} folderId={1} save={save} />
```

## Hosting the web component

The widgets in this package render the Validation Station **web component**, which
ships as a prebuilt Angular bundle in
[`@uipath/du-validation-station-wc`](https://www.npmjs.com/package/@uipath/du-validation-station-wc).
The bundle is **not** imported by this package — it is loaded at runtime from a URL
you host, via [`@uipath/du-utils`](https://www.npmjs.com/package/@uipath/du-utils).

That means there is no bundler configuration to write. You need two things:

1. Serve the contents of `node_modules/@uipath/du-validation-station-wc` as static
   files at some path or origin.
2. Point `configureValidationStationWc` at it, once, before rendering any widget.

```ts
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

configureValidationStationWc({
  deploymentUrl: "/du-vs-wc",
  // Set true unless your app already loads Apollo fonts + Material Icons
  // globally — otherwise icon glyphs render as empty boxes.
  includeFonts: true,
}).catch((error) => {
  console.error("Validation Station web component failed to load", error);
});
```

The served directory must keep the package's own layout, because the bundle
resolves these against its own `import.meta.url`:

```
/du-vs-wc/
├── main.js          ← entry, plus its hashed chunk-*.js siblings
├── polyfills.js     ← zone.js; must load before main.js (the loader handles ordering)
├── styles.css       ← fetched as raw CSS and adopted into the shadow root
├── fonts.css        ← Apollo fonts + Material Icons (opt-in via includeFonts)
├── media/           ← the font files fonts.css references
└── du-assets/       ← PDF.js worker, cmaps, wasm, i18n translations
```

Copying the package directory verbatim satisfies this. In this repo, that is
`npm run stage-du-wc` (see `scripts/copy-du-wc-assets.mjs`), wired to `predev`,
which stages it into the gitignored `public/du-vs-wc`.

### Notes

- **Call it once.** Loading is cached per page, so a second call with a different
  `deploymentUrl` is ignored. A _failed_ load is not cached — call again to retry.
- **The returned promise is the error channel.** Components only observe success;
  a bad URL or a 404 surfaces on the promise, so attach a `.catch`. Without it, a
  load failure leaves the widgets showing their loading state.
- **`deploymentUrl` is a script source.** The loader injects
  `<script type="module" src>` from it, so whoever controls the URL executes code
  in your app's origin. Pass a literal or build-time constant — never a value from
  `location`, a query parameter, or other user input.
- **CSP.** Serving from your own origin needs no more than `script-src 'self'`.
  A separate origin must be added to `script-src` and `style-src`, and note that
  the loader offers no Subresource Integrity hook — self-hosting avoids that
  exposure entirely.
- **Version skew.** The URL decides which web component version actually runs, and
  it is not checked against the installed `@uipath/du-validation-station-wc`. Keep
  the hosted copy in step with the version this package's types are built against.

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```
