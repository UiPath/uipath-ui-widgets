# @uipath/ui-widgets-validation-station

A React wrapper for the UiPath Document Understanding Validation Station web component (`@uipath/du-validation-station-wc`). It handles web component loading, bucket artifact fetching, and exposes a declarative props API for all Validation Station features.

## Installation

```bash
npm install @uipath/ui-widgets-validation-station
```

### Peer dependencies

```
react >= 19.2.0
react-dom >= 19.2.0
@uipath/uipath-typescript >= 1.2.2
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

## Props

| Prop                       | Type                                           | Required | Default   | Description                                                               |
| -------------------------- | ---------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------- |
| `sdk`                      | `UiPath`                                       | Yes      | —         | UiPath SDK instance for authentication and API calls                      |
| `data`                     | `ContentValidationData`                        | Yes      | —         | Document data containing bucket paths, document ID, and folder references |
| `folderId`                 | `number`                                       | No       | —         | Storage bucket folder ID. Falls back to `data.FolderId` if not provided   |
| `theme`                    | `'light' \| 'dark' \| 'light-hc' \| 'dark-hc'` | No       | `'light'` | Visual theme                                                              |
| `language`                 | `Language`                                     | No       | —         | UI language (see Language enum below)                                     |
| `isReadonly`               | `boolean`                                      | No       | `false`   | When `true`, renders in read-only mode                                    |
| `enableSaveAsDraft`        | `boolean`                                      | No       | `false`   | Enables the "Save as draft" action                                        |
| `options`                  | `IValidationStationOptions`                    | No       | —         | Fine-grained UI feature flags                                             |
| `save`                     | `{ validate: boolean }`                        | No       | —         | Trigger a save. Set `{ validate: true }` to validate before saving        |
| `discardChanges`           | `{ value: boolean }`                           | No       | —         | Trigger a discard-changes operation                                       |
| `setFieldValue`            | `ISetFieldValueParameters[]`                   | No       | —         | Set one or more field values programmatically                             |
| `setTableCellValue`        | `ISetTableCellValueParameters[]`               | No       | —         | Set one or more table cell values programmatically                        |
| `deleteFieldValue`         | `IDeleteFieldValueParameters[]`                | No       | —         | Delete one or more field values programmatically                          |
| `deleteTableCellValue`     | `IDeleteTableCellValueParameters[]`            | No       | —         | Delete one or more table cell values programmatically                     |
| `selectAndFocusFieldValue` | `ISelectAndFocusFieldValueParams`              | No       | —         | Scroll to and focus a specific field value                                |

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
  ISetFieldValueParameters,
  ISetTableCellValueParameters,
  IDeleteFieldValueParameters,
  IDeleteTableCellValueParameters,
  ISelectAndFocusFieldValueParams,
  IValidationStationOptions,
} from "@uipath/ui-widgets-validation-station";
```

## Examples

### Setting a field value

```tsx
import { useState } from "react";
import {
  ValidationStation,
  type ISetFieldValueParameters,
} from "@uipath/ui-widgets-validation-station";

function App({ sdk, data }) {
  const [setFieldValue, setSetFieldValue] = useState<
    ISetFieldValueParameters[] | undefined
  >(undefined);

  return (
    <>
      <button
        onClick={() =>
          setSetFieldValue([
            { fieldId: "NoGroup.NoCategory.Invoice.Amount", value: "100.00" },
          ])
        }
      >
        Set Amount
      </button>
      <ValidationStation
        sdk={sdk}
        data={data}
        folderId={67}
        setFieldValue={setFieldValue}
      />
    </>
  );
}
```

### Focusing a field

```tsx
import { useState } from "react";
import {
  ValidationStation,
  type ISelectAndFocusFieldValueParams,
} from "@uipath/ui-widgets-validation-station";

function App({ sdk, data }) {
  const [focus, setFocus] = useState<
    ISelectAndFocusFieldValueParams | undefined
  >(undefined);

  return (
    <>
      <button
        onClick={() =>
          setFocus({ fieldId: "NoGroup.NoCategory.Invoice.Amount" })
        }
      >
        Focus Amount
      </button>
      <ValidationStation
        sdk={sdk}
        data={data}
        folderId={67}
        selectAndFocusFieldValue={focus}
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

## Development

```bash
# Build
npm run build

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```
