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
@uipath/uipath-typescript >= 1.3.9
```

## Quick start

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import {
  ValidationStation,
  Language,
} from "@uipath/ui-widgets-validation-station";
import "@uipath/ui-widgets-validation-station/ValidationStation.css";
import { UiPath } from "@uipath/uipath-typescript/core";

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
      data={myContentValidationData}
      folderId={12345}
      theme="light"
      language={Language.English}
    />
  );
}
```

> See [Static assets](#static-assets) below — you must copy the WC's
> `du-assets/` folder into your build output, or PDF rendering and
> translations will silently 404 in production.

## Props

| Prop                             | Type                                           | Required | Default   | Description                                                                               |
| -------------------------------- | ---------------------------------------------- | -------- | --------- | ----------------------------------------------------------------------------------------- |
| `sdk`                            | `UiPath`                                       | Yes      | —         | UiPath SDK instance for authentication and API calls                                      |
| `data`                           | `ContentValidationData`                        | Yes      | —         | Document data containing bucket paths, document ID, and folder references                 |
| `folderId`                       | `number`                                       | No       | —         | Storage bucket folder ID. Falls back to `data.FolderId` if not provided                   |
| `theme`                          | `'light' \| 'dark' \| 'light-hc' \| 'dark-hc'` | No       | `'light'` | Visual theme                                                                              |
| `language`                       | `Language`                                     | No       | —         | UI language (see Language enum below)                                                     |
| `isReadonly`                     | `boolean`                                      | No       | `false`   | When `true`, renders in read-only mode                                                    |
| `enableSaveAsDraft`              | `boolean`                                      | No       | `false`   | Enables the "Save as draft" action                                                        |
| `options`                        | `IValidationStationOptions`                    | No       | —         | Fine-grained UI feature flags                                                             |
| `save`                           | `{ validate: boolean }`                        | No       | —         | Trigger a save. Set `{ validate: true }` to validate before saving                        |
| `discardChanges`                 | `{ value: boolean }`                           | No       | —         | Trigger a discard-changes operation                                                       |
| `setTableCellValue`              | `ISetTableCellValueParameters[]`               | No       | —         | Set one or more table cell values programmatically                                        |
| `deleteTableCellValue`           | `IDeleteTableCellValueParameters[]`            | No       | —         | Delete one or more table cell values programmatically                                     |
| `setFieldValueByPath`            | `SetFieldValueByPath`                          | No       | —         | Set a field value addressed by a path of `{ fieldName, valueIndex }` segments             |
| `selectAndFocusFieldValueByPath` | `SelectAndFocusFieldValueByPath`               | No       | —         | Select and focus a field value addressed by a path; focuses the document reference if any |
| `deleteFieldValueByPath`         | `DeleteFieldValueByPath`                       | No       | —         | Delete a field value addressed by a path                                                  |

### Reacting to save completion

`onSaveComplete` fires after the save flow finishes (ProcessExtractedData + bucket upload). The callback receives a `SaveValidatedDataResult` — `success: true` on success, or `success: false` with an `error` message string on failure. Use it to complete task, retry, or surface your own error UI.

```tsx
import {
  ValidationStation,
  type SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";

function App({ sdk, data, task }) {
  const handleSaveComplete = async (result: SaveValidatedDataResult) => {
    if (!result.success) {
      // ValidationStation already shows a toast for the failure; add
      // your own retry / logging / analytics here if needed.
      console.warn("Save failed:", result.error);
      return;
    }
    await task.complete({ action: "Completed", type: "DocumentValidation" });
  };

  return (
    <ValidationStation
      sdk={sdk}
      data={data}
      folderId={task.folderId}
      onSaveComplete={handleSaveComplete}
    />
  );
}
```

## Language enum

The `Language` enum provides all supported locales:

```ts
import { Language } from "@uipath/ui-widgets-validation-station";

Language.English; // "en"
Language.German; // "de"
Language.Spanish; // "es"
Language.SpanishMexico; // "es-MX"
Language.French; // "fr"
Language.Japanese; // "ja"
Language.Korean; // "ko"
Language.Portuguese; // "pt"
Language.PortugueseBrazil; // "pt-BR"
Language.Romanian; // "ro"
Language.Russian; // "ru"
Language.Turkish; // "tr"
Language.ChineseSimplified; // "zh-CN"
Language.ChineseTraditional; // "zh-TW"
```

## Exported types

All parameter types are re-exported from the package for convenience:

```ts
import { Language } from "@uipath/ui-widgets-validation-station";
import type {
  ValidationStationProps,
  ISetTableCellValueParameters,
  IDeleteTableCellValueParameters,
  IValidationStationOptions,
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

## Static assets

The underlying web component loads runtime assets (PDF.js worker, cmaps,
wasm, i18n translations) from a sibling `du-assets/` directory, resolved
relative to where the WC's main bundle is served via `import.meta.url`.

**`du-assets/` must be deployed at the same path level as your output
bundle**, otherwise PDF rendering and translations will silently 404 in
the browser (no build error). You need to copy
`node_modules/@uipath/du-validation-station-wc/du-assets/` into your
build output as a post-build step.

### Vite

Add a small plugin to `vite.config.ts` that copies `du-assets/` next to
your emitted JS chunks after each build:

```ts
// vite.config.ts
import react from "@vitejs/plugin-react";
import { cp } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const require = createRequire(import.meta.url);

function copyDuValidationStationAssets(): Plugin {
  let destDir = "";
  return {
    name: "copy-du-validation-station-assets",
    apply: "build",
    configResolved(config) {
      destDir = resolve(
        config.root,
        config.build.outDir,
        config.build.assetsDir,
        "du-assets",
      );
    },
    async closeBundle() {
      const wcRoot = dirname(
        require.resolve("@uipath/du-validation-station-wc/package.json"),
      );
      await cp(resolve(wcRoot, "du-assets"), destDir, { recursive: true });
    },
  };
}

export default defineConfig({
  plugins: [react(), copyDuValidationStationAssets()],
  optimizeDeps: {
    exclude: ["@uipath/du-validation-station-wc"],
  },
});
```

`optimizeDeps.exclude` is required — Vite's pre-bundler rewrites
`import.meta.url`, which breaks the WC's runtime asset resolution.

### webpack

Use [`copy-webpack-plugin`](https://github.com/webpack-contrib/copy-webpack-plugin):

```js
// webpack.config.js
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");

module.exports = {
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from:
            path.dirname(
              require.resolve("@uipath/du-validation-station-wc/package.json"),
            ) + "/du-assets",
          to: "assets/du-assets",
        },
      ],
    }),
  ],
};
```

### Other bundlers

Any asset-copy mechanism works — Angular's `assets` array,
`rollup-plugin-copy`, a `postbuild` npm script with `cp -r`, etc. The
only requirement is that the final deployed layout has `du-assets/`
sitting next to the JS chunks that import the WC.

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```
