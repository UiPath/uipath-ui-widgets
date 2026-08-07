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

// Once, at app startup — loads the web component from `du-vs-wc`, next to
// your app's own root by default. See "Hosting the web component" below.
configureValidationStationWc();

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
> from this package, and host the web component's files where it expects them
> (a `deploymentUrl` default handles this for most hosts — override it if
> yours doesn't). See [Hosting the web component](#hosting-the-web-component).

## Data sources

The widget needs a taxonomy, an extraction result and a document DOM. There are two mutually-exclusive ways to give it those:

| Mode              | Pass                          | Who fetches                                                   | Who writes back                                 |
| ----------------- | ----------------------------- | ------------------------------------------------------------- | ----------------------------------------------- |
| **Self-fetching** | `sdk` + `data` (+ `folderId`) | The widget, from the bucket paths on `ContentValidationData`  | The widget, to `ValidatedExtractionResultsPath` |
| **Pre-fetched**   | `artifacts` (+ `documentId`)  | You — hand it a `DuDocumentArtifacts` object you already hold | You, from the request the widget emits          |

**The outputs do not change with the mode.** `onSubmit`, `onSaveAsDraft` and `onReportException` fire for every user action either way, and always carry the request the web component produced. The only difference is a second argument: when the widget persisted the data itself, it passes the outcome too.

Pre-fetched mode is what you want when the document does not live in a storage bucket, when the artifacts are already in memory (e.g. fetched once and shared with the [subcomponents](./docs/validation-station-subcomponents.md)), or when persistence goes somewhere other than `ValidatedExtractionResultsPath`.

```tsx
import {
  ValidationStation,
  type DuDocumentArtifacts,
} from "@uipath/ui-widgets-validation-station";

function App({ artifacts }: { artifacts: DuDocumentArtifacts }) {
  return (
    <ValidationStation
      artifacts={artifacts}
      documentId="doc-123"
      onSubmit={(request) => persistItYourself(request)}
    />
  );
}
```

The two modes can be mixed: pass `artifacts` **and** `sdk` + `data` + a folder id to skip the fetch while keeping the built-in write-back — `onSubmit` then receives the outcome as well.

> `DuDocumentArtifacts` is `{ taxonomy, extractionResult, dom, text, customizationInfo, original }` — `original` is the base64-encoded document the viewer renders.

### Owning the round-trip

Pre-fetched mode does not mean writing the bucket plumbing yourself. Everything the widget does internally is exported, so a host can drive the same flow:

| Export                                                   | Use                                                                                                                                 |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `fetchDuDocumentArtifacts(sdk, data, folderId?)`         | Fetch `DuDocumentArtifacts` imperatively — outside render, ahead of time, or in a loader. `folderId` falls back to `data.FolderId`. |
| `useDuDocumentArtifacts(sdk, data, folderId)`            | The same fetch as a hook, for when the fetch belongs to a component's lifecycle.                                                    |
| `submitValidatedData(sdk, data, folderId, request)`      | The submit flow: `ProcessExtractedData`, then upload to `ValidatedExtractionResultsPath`.                                           |
| `saveValidatedDataAsDraft(sdk, data, folderId, request)` | The draft flow: upload `validatedData` straight to the bucket.                                                                      |

```tsx
import {
  fetchDuDocumentArtifacts,
  submitValidatedData,
  saveValidatedDataAsDraft,
  ValidationStation,
  type DuDocumentArtifacts,
} from "@uipath/ui-widgets-validation-station";

function HostOwnedReview({ sdk, data, folderId }) {
  const [artifacts, setArtifacts] = useState<DuDocumentArtifacts | null>(null);

  useEffect(() => {
    fetchDuDocumentArtifacts(sdk, data, folderId).then(setArtifacts);
  }, [sdk, data, folderId]);

  if (!artifacts) return <div>Loading document…</div>;

  return (
    <ValidationStation
      artifacts={artifacts}
      documentId={data.DocumentId}
      // no sdk / data — the host loads and persists
      onSubmit={async (request) => {
        const result = await submitValidatedData(sdk, data, folderId, request);
        afterSubmit(result);
      }}
      onSaveAsDraft={(request) =>
        saveValidatedDataAsDraft(sdk, data, folderId, request)
      }
    />
  );
}
```

> Handle **both** callbacks. The widget always offers "Save as draft", so leaving `onSaveAsDraft` unwired means a draft click persists nothing.

The request payloads are exported too — `IVsSaveValidatedDataRequest`, `IVsSaveValidatedDataAsDraftRequest` and `IVsSaveExceptionReportRequest` — so handlers declared outside JSX can name their parameter.

A full working example lives in the repo's sample app under `samples/pages/ValidationStation/ValidationStationPrefetchedPage.tsx`.

## Props

| Prop                             | Type                                           | Required | Default   | Description                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ---------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sdk`                            | `UiPath`                                       | No\*     | —         | UiPath SDK instance for authentication and API calls. Required for self-fetching / persistence                                                                                                                                                                                                                                                    |
| `data`                           | `ContentValidationData`                        | No\*     | —         | Document data containing bucket paths, document ID, and folder references. Required for self-fetching / persistence                                                                                                                                                                                                                               |
| `artifacts`                      | `DuDocumentArtifacts`                          | No\*     | —         | Pre-fetched document artifacts. When supplied, no bucket fetch is performed. \*Either `artifacts` or `sdk` + `data` must be provided                                                                                                                                                                                                              |
| `documentId`                     | `string`                                       | No       | —         | Document id forwarded to the web component. Falls back to `data.DocumentId` — pass it in pre-fetched mode, where there is no `data`                                                                                                                                                                                                               |
| `folderId`                       | `number`                                       | No\*     | —         | Storage bucket folder ID. Falls back to `data.FolderId`. **In self-fetching mode one of the two must resolve to a value** — otherwise the widget shows an error.                                                                                                                                                                                  |
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

> The three callback props (`onSubmit`, `onSaveAsDraft`, `onReportException`) are documented in the next section.

### Reacting to save / draft / exception flows

The widget surfaces three user-initiated flows and reports each through exactly one callback, whichever mode it is in. Every callback receives the raw request; `result` is filled in only for the flows the widget persisted itself.

| Callback            | User action             | Signature                    | What the widget does                                                                                                                                                | What the host does                                                                                                                        |
| ------------------- | ----------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `onSubmit`          | **Submit**              | `(request, result?) => void` | With `sdk` + `data`: `processExtractedData`, then uploads to `ValidatedExtractionResultsPath`, and passes the outcome as `result`. Without: emits the request only. | React to `result`, or — when it is absent — persist the request yourself (`submitValidatedData` does exactly what the widget would have). |
| `onSaveAsDraft`     | **Save as draft**       | `(request, result?) => void` | With `sdk` + `data`: uploads `validatedData` straight to the bucket (no `processExtractedData`). Without: emits the request only.                                   | Same as above; the host-side equivalent is `saveValidatedDataAsDraft`.                                                                    |
| `onReportException` | **Report as exception** | `(request) => void`          | Nothing — the widget never persists exceptions, in either mode. The reason is at `request.exceptionReport.Reason`.                                                  | Required if you want the report persisted — call `OrchestratorDuModule.submitExceptionReport(...)` yourself.                              |

Submit/draft hand you a `SaveValidatedDataResult` (`{ success, error? }`) — the host owns all UI feedback (toast, retry, etc.); the widget does not surface failures itself. The exception callback hands you `documentId` and `reason` strings ready to forward to the SDK.

All three fire on every user action, regardless of mode — that is the contract. Only `result` varies.

```tsx
import {
  ValidationStation,
  type SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";

function App({ sdk, data, task }) {
  // `sdk` + `data` are set, so the widget persisted it and `result` is present.
  const handleSubmit = async (request, result?: SaveValidatedDataResult) => {
    if (!result?.success) {
      console.warn("Submit failed:", result?.error);
      return;
    }
    await task.complete({ action: "Completed", type: "DocumentValidation" });
  };

  const handleSaveAsDraft = (request, result?: SaveValidatedDataResult) => {
    if (!result?.success) console.warn("Draft save failed:", result?.error);
  };

  const handleReportException = async (request) => {
    const reason = request.exceptionReport?.Reason ?? "";
    const response = await new OrchestratorDuModule(sdk).submitExceptionReport(
      task.id,
      request.documentId,
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
      onSubmit={handleSubmit}
      onSaveAsDraft={handleSaveAsDraft}
      onReportException={handleReportException}
    />
  );
}
```

> All three callbacks are optional, but failures are silent if you skip them — the widget surfaces no errors on its own. `onReportException` is the only place the report goes; without it the user's "Report as exception" click is a no-op.

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
  joinDeploymentUrl,
  VALIDATION_STATION_TAG,
  ValidationStationLanguage,
} from "@uipath/ui-widgets-validation-station";
import type {
  ValidationStationProps,
  ValidationStationWcConfig,
  DuArtifactsSource,
  DuDocumentArtifacts,
  IValidationStationOptions,
  IVsSaveValidatedDataRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveExceptionReportRequest,
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
   files at `du-vs-wc`, next to your app's own root (see the default below —
   pass an explicit `deploymentUrl` if you host it somewhere else).
2. Call `configureValidationStationWc` once, before rendering any widget.

```ts
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

configureValidationStationWc({
  // Set true unless your app already loads Apollo fonts + Material Icons
  // globally — otherwise icon glyphs render as empty boxes.
  includeFonts: true,
}).catch((error) => {
  console.error("Validation Station web component failed to load", error);
});
```

`deploymentUrl` defaults to `du-vs-wc` joined onto
[`getAppBase()`](https://www.npmjs.com/package/@uipath/uipath-typescript) —
`/du-vs-wc` on a plain host, or the deployed app's own base path if you're
running as a UiPath Coded App. Most integrations need nothing more than the
call above. Pass an explicit `deploymentUrl` only when the web component is
hosted somewhere that default doesn't reach:

```ts
import {
  configureValidationStationWc,
  joinDeploymentUrl,
} from "@uipath/ui-widgets-validation-station";

configureValidationStationWc({
  // A literal, a build-time constant, or a resolver — see "Notes" below.
  deploymentUrl: joinDeploymentUrl(
    "https://cdn.example.com/my-app",
    "du-vs-wc",
  ),
  includeFonts: true,
});
```

`joinDeploymentUrl(base, path)` exists because hand-rolled string
concatenation is an easy way to end up with a doubled or missing slash — it
strips any trailing slash from `base` and any leading slash from `path` before
joining them, regardless of which one supplied it (or neither).

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
- **`deploymentUrl` accepts a resolver.** Pass `() => string | Promise<string>`
  instead of a plain string for cases where the URL isn't known synchronously —
  it's called lazily, at most once per load.
- **`deploymentUrl` is a script source.** The loader injects
  `<script type="module" src>` from it, so whoever controls the URL executes code
  in your app's origin. Pass a literal, a build-time constant, or a resolver
  derived from one of those — never a value from `location`, a query parameter,
  or other user input.
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
