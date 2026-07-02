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

> See [Static assets & runtime stylesheets](#static-assets--runtime-stylesheets)
> below — you must copy the WC's `du-assets/` folder **and its stylesheets**
> into your build output (and serve raw CSS in dev), or PDF rendering,
> translations, and **icons** will silently break with no build error.

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
| `save={{ validate: false }}`     | `{ validate: boolean }`                        | No       | —         | Trigger **save as draft**. ⚠ Requires `options.emitDtoStateChanges: true` — otherwise the WC won't surface the latest in-memory extraction state and the save will be a no-op.                                                                                                                                                                    |
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
| `onReportExceptionComplete` | **Report as exception** | `(documentId: string, reason: string) => void` | Extracts `documentId` and `reason` from the WC's exception DTO and hands them to the host. **No API call.**                                                                 | Required if you want the report persisted — call `OrchestratorDuModule.submitExceptionReport(...)` yourself. |

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

## Static assets & runtime stylesheets

The underlying web component resolves several files **at runtime**, relative
to where its main bundle is served (via `import.meta.url`):

- **`du-assets/`** — PDF.js worker, cmaps, wasm, and i18n translations.
- **`styles.css`** — fetched as raw CSS text and adopted into the component's
  **shadow root**. This is what styles the icons (`<mat-icon>`) and everything
  else _inside_ the shadow boundary.
- **`fonts.css`** + **`media/`** — the Apollo / Material Icons `@font-face`
  declarations and the font files they reference.

> **The React wrapper already imports `styles.css` and `fonts.css` as ES
> modules for you**, so the _light DOM_ concerns (`@font-face` registration,
> plus CDK overlays like menus/tooltips that portal to `document.body`) are
> handled automatically — you do **not** add those imports yourself. What you
> still have to handle is making the same files reachable by the WC's
> **runtime `fetch`**, covered below.

**These files must be deployed at the same path level as your output bundle.**
If they're missing there's no build error — they silently 404 at runtime:
PDFs fail to render, and because the shadow root never receives `styles.css`,
**icons fall back to a system font and render as empty boxes or raw text**.

There are two things to get right:

1. **Build** — copy `du-assets/`, `styles.css`, `fonts.css`, and `media/` next
   to your emitted JS chunks.
2. **Dev server** — if your dev server rewrites `.css` requests into JS modules
   (Vite does this), the WC's `fetch("styles.css")` receives JavaScript instead
   of CSS, `CSSStyleSheet.replaceSync()` parses nothing, and the shadow-root
   styles never load (→ broken icons). You must serve the **raw CSS** for that
   fetch. Bundlers that serve copied files verbatim in dev (e.g.
   webpack-dev-server) don't have this problem — copying alone is enough.

### Vite

Two plugins: one copies the runtime files after a build, one serves raw CSS to
the WC's `fetch` during dev. `optimizeDeps.exclude` is also required — Vite's
pre-bundler rewrites `import.meta.url`, which breaks the WC's runtime
resolution.

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { cp, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);

const WC_ROOT = dirname(
  require.resolve("@uipath/du-validation-station-wc/package.json"),
);

// Stylesheets the WC fetches (as raw CSS) at runtime to adopt into its
// shadow root.
const WC_RUNTIME_CSS = ["styles.css", "fonts.css"];

// BUILD: place the WC's runtime files next to the emitted JS chunks, where
// `import.meta.url` will resolve them.
function copyDuValidationStationAssets(): Plugin {
  let assetsDir = "";
  return {
    name: "copy-du-validation-station-assets",
    apply: "build",
    configResolved(config) {
      assetsDir = resolve(
        config.root,
        config.build.outDir,
        config.build.assetsDir,
      );
    },
    async closeBundle() {
      await cp(resolve(WC_ROOT, "du-assets"), resolve(assetsDir, "du-assets"), {
        recursive: true,
      });
      await cp(resolve(WC_ROOT, "media"), resolve(assetsDir, "media"), {
        recursive: true,
      });
      for (const css of WC_RUNTIME_CSS) {
        await cp(resolve(WC_ROOT, css), resolve(assetsDir, css));
      }
    },
  };
}

// DEV: Vite serves any `.css` request as a JS module. Return the real CSS to
// the WC's raw `fetch` (identified by `Sec-Fetch-Dest: empty`), while letting
// genuine ES-module imports (`Sec-Fetch-Dest: script`) pass through to Vite.
function serveDuValidationStationRawCss(): Plugin {
  const pattern = new RegExp(
    `/@uipath/du-validation-station-wc/(${WC_RUNTIME_CSS.join("|")})$`,
  );
  return {
    name: "serve-du-validation-station-raw-css",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.headers["sec-fetch-dest"] !== "empty") return next();
        const match = pattern.exec((req.url ?? "").split("?")[0]);
        if (!match) return next();
        readFile(resolve(WC_ROOT, match[1]), "utf8").then((css) => {
          res.setHeader("Content-Type", "text/css");
          res.end(css);
        }, next);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyDuValidationStationAssets(),
    serveDuValidationStationRawCss(),
  ],
  optimizeDeps: {
    exclude: ["@uipath/du-validation-station-wc"],
  },
});
```

### webpack

Use [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin) to copy `du-assets/`, the stylesheets, and `media/` next to your bundle, **and** opt the WC bundle out of webpack's `new URL(..., import.meta.url)` parsing — the WC uses that pattern for its runtime resolution, and webpack will otherwise try to bundle the directory and fail with `Module not found: Error: Can't resolve './du-assets/'`. webpack-dev-server serves the copied files verbatim, so no separate raw-CSS handling is needed.

```js
// webpack.config.js
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

const wcRoot = path.dirname(
  require.resolve("@uipath/du-validation-station-wc/package.json"),
);

module.exports = {
  module: {
    rules: [
      // Don't parse runtime URL / dynamic-require expressions inside the WC —
      // its assets and stylesheets are resolved at runtime from `import.meta.url`.
      {
        test: /node_modules[\\/]@uipath[\\/]du-validation-station-wc[\\/].*\.js$/,
        parser: {
          url: false,
          exprContextCritical: false,
          unknownContextCritical: false,
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: `${wcRoot}/du-assets`, to: "assets/du-assets" },
        { from: `${wcRoot}/media`, to: "assets/media" },
        { from: `${wcRoot}/styles.css`, to: "assets/styles.css" },
        { from: `${wcRoot}/fonts.css`, to: "assets/fonts.css" },
      ],
    }),
  ],
};
```

### Other bundlers

Any asset-copy mechanism works — Angular's `assets` array,
`rollup-plugin-copy`, a `postbuild` npm script with `cp -r`, etc. The
requirement is the same: the final deployed layout must have `du-assets/`,
`styles.css`, `fonts.css`, and `media/` sitting next to the JS chunks that
import the WC. If your dev server transforms `.css` into JS modules, also make
sure the WC's runtime `fetch` for `styles.css`/`fonts.css` receives raw CSS.

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```
