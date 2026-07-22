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

## Hello world

Two steps: serve the web component, mount a component.

**1. Add the bundled Vite plugin.** It serves the web component in dev and copies it into your build output, under `/du-vs-wc/`.

```ts
// vite.config.ts
import { validationStationAssets } from "@uipath/ui-widgets-validation-station/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), validationStationAssets()], // serves + emits under /du-vs-wc/
});
```

**2. Mount a component.**

```tsx
import { ValidationStation } from "@uipath/ui-widgets-validation-station";

export function App({ sdk, data, folderId }) {
  return <ValidationStation sdk={sdk} data={data} folderId={folderId} />;
}
```

That's it — no wiring in between. The widget loads the web component from `/du-vs-wc/` at runtime (the plugin's default path), so nothing heavy is bundled into your app.

> Serving the bundle somewhere other than the default path? Call `configureValidationStationWc({ baseUrl })` once before anything mounts, passing the same path you gave the plugin's `basePath`.

Other components you can mount the same way — `DocumentViewer`, `CompactFieldsForm`, `CompactTableEditor`, `CompactBusinessRules`, `CompactDocTypeField`. Give several the same `instanceId` to compose them around one shared document.

### Using a bundler other than Vite

`validationStationAssets()` is Vite-specific sugar. The web component and the loader work with **any** bundler — only step 1 (getting the WC files served) differs. On webpack, rspack, Next, Angular, SvelteKit, Astro, etc., copy the bundle into a static folder your app serves, with the bundled CLI:

```jsonc
// package.json — runs before dev and build; gitignore the destination
"scripts": {
  "predev":   "uipath-vs-wc copy-assets public/du-vs-wc",
  "prebuild": "uipath-vs-wc copy-assets public/du-vs-wc"
}
```

That static folder is dev-served **and** emitted to the build output by every one of those frameworks, so this one command covers dev + prod without a bundler plugin. Copying into `public/du-vs-wc` serves it at `/du-vs-wc/` — the widget's default — so no `configureValidationStationWc()` call is needed. If your framework serves static files from elsewhere (Angular `src/assets`, SvelteKit `static`) or you use a different folder, call `configureValidationStationWc({ baseUrl })` with the matching URL path. Add the destination to `.gitignore`.

Prefer to run it inside your build rather than a script? Import the same copy step and call it wherever your bundler lets you run Node (a webpack/rspack plugin hook, a Rollup plugin, a build script):

```ts
import { copyValidationStationWcAssets } from "@uipath/ui-widgets-validation-station/assets";

await copyValidationStationWcAssets("dist/du-vs-wc");
```

## Quick start

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import {
  ValidationStation,
  ValidationStationLanguage,
} from "@uipath/ui-widgets-validation-station";
import { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";

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

> This assumes the [Hello world](#hello-world) setup is done — the
> `validationStationAssets()` plugin (or `uipath-vs-wc copy-assets` on other
> bundlers) serving the bundle. Without it, PDF rendering, translations, and
> icons silently break at runtime. See
> [How the web component is served](#how-the-web-component-is-served).

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
import { ValidationStationLanguage } from "@uipath/ui-widgets-validation-station";
import type {
  ValidationStationProps,
  IValidationStationOptions,
  SaveValidatedDataResult,
  SetFieldValueByPath,
  SelectAndFocusFieldValueByPath,
  DeleteFieldValueByPath,
} from "@uipath/ui-widgets-validation-station";
```

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

## How the web component is served

The widget loads the DU web component **at runtime** from `baseUrl` (defaults to
`/du-vs-wc/`; override with `configureValidationStationWc({ baseUrl })`) — it is
never bundled into your app. The component then resolves a few files **relative
to that URL**:

- **`du-assets/`** — PDF.js worker, cmaps, wasm, and i18n translations.
- **`styles.css`** — fetched as raw CSS and adopted into the component's shadow
  root (this styles the icons and everything inside the shadow boundary).
- **`fonts.css`** + **`media/`** — the Apollo / Material Icons `@font-face`
  rules and the font files they reference.

You don't wire any of this by hand. The loader injects `styles.css` and
`fonts.css` as light-DOM `<link>`s from `baseUrl` for you, and the component
resolves `du-assets/` and `media/` as siblings of its main bundle. **Your only
job is to make the bundle reachable at `baseUrl`** — which is what the
[Hello world](#hello-world) setup already does:

- **Vite** — the `validationStationAssets()` plugin serves the files in dev and
  copies them into the build output.
- **Any other bundler** — `uipath-vs-wc copy-assets <static-dir>`, or import
  `copyValidationStationWcAssets` from
  `@uipath/ui-widgets-validation-station/assets` and call it in your build. See
  [Using a bundler other than Vite](#using-a-bundler-other-than-vite).

If the bundle isn't reachable at `baseUrl` there's no build error, but the loader
throws a descriptive error at runtime when `main.js` fails to load, pointing you
back at the plugin / `copy-assets` setup. (If only some sibling files are
missing — e.g. `styles.css` — the element may still upgrade but render
degraded: PDFs fail and shadow-root icons fall back to a system font.)

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```
