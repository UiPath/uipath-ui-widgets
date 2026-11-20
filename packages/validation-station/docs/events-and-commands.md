# Props, events and commands

> **Note: Applies to `@uipath/ui-widgets-validation-station` with web component `1.0.0-rc.6`.**
> Start with the [package README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#readme) for install, hosting and a working Coded Action App.

Every prop, every callback, and how to drive the widget from your own code.

## All props

| Prop                             | Type                                          | Required | Default   | Description                                                                                                                                                                                                                                                                                             |
| -------------------------------- | --------------------------------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `sdk`                            | `UiPath`                                      | No\*     | —         | UiPath SDK instance for authentication and API calls. Required for self-fetching / persistence                                                                                                                                                                                                          |
| `data`                           | `ContentValidationData`                       | No\*     | —         | Document data containing the bucket paths, document ID, and the folder they live in — `FolderId` or `FolderKey`, whichever the producing activity set. Required for self-fetching / persistence                                                                                                         |
| `processedDocument`              | `ProcessedDocument`                           | No\*     | —         | A Flow IDP node's output. With `sdk`, the widget fetches its artifacts and records reviews through the producing run — see [IXP documents](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/data-sources.md#ixp-processeddocument). Ignored when `data` is set |
| `artifacts`                      | `DuDocumentArtifacts \| IxpDocumentArtifacts` | No\*     | —         | Pre-fetched document artifacts. When supplied, no fetch is performed. \*Either `artifacts`, `sdk` + `data` or `sdk` + `processedDocument` must be provided                                                                                                                                              |
| `documentId`                     | `string`                                      | No       | —         | Document ID forwarded to the web component. Falls back to `data.DocumentId`, else `processedDocument.metadata.traceId` — pass it in pre-fetched mode                                                                                                                                                    |
| `theme`                          | `DuTheme`                                     | No       | `'light'` | Visual theme: `'light'`, `'dark'`, `'light-hc'`, `'dark-hc'`, or the Apollo Modern `'future-light'` / `'future-dark'`                                                                                                                                                                                   |
| `language`                       | `ValidationStationLanguage`                   | No       | `English` | UI language (see [the enum](#language-enum))                                                                                                                                                                                                                                                            |
| `isReadonly`                     | `boolean`                                     | No       | `false`   | When `true`, renders in read-only mode                                                                                                                                                                                                                                                                  |
| `persistent`                     | `boolean`                                     | No       | `false`   | Render the persistent element variant, which survives portal/DOM detachment (e.g. tab switches)                                                                                                                                                                                                         |
| `options`                        | `IValidationStationOptions`                   | No       | —         | Fine-grained UI feature flags, passed through to the element as given                                                                                                                                                                                                                                   |
| `save={{ validate: false }}`     | `{ validate: boolean }`                       | No       | —         | Trigger **save as draft**                                                                                                                                                                                                                                                                               |
| `save={{ validate: true }}`      | `{ validate: boolean }`                       | No       | —         | Trigger **submit** — runs validation first, then saves                                                                                                                                                                                                                                                  |
| `discardChanges`                 | `{ value: boolean }`                          | No       | —         | Trigger a discard-changes operation. Call `setDiscardChanges({ value: true })` (or `false` — the boolean is ignored) every time you want it to fire. Each call creates a brand-new object even if the content looks identical, and that is what the widget watches for                                  |
| `setFieldValueByPath`            | `SetFieldValueByPath`                         | No       | —         | Set a field value addressed by a path of `{ fieldName, valueIndex }` segments                                                                                                                                                                                                                           |
| `selectAndFocusFieldValueByPath` | `SelectAndFocusFieldValueByPath`              | No       | —         | Select and focus a field value addressed by a path; focuses the document reference if any                                                                                                                                                                                                               |
| `deleteFieldValueByPath`         | `DeleteFieldValueByPath`                      | No       | —         | Delete a field value addressed by a path                                                                                                                                                                                                                                                                |

The three save callbacks (`onSubmit`, `onSaveAsDraft`, `onReportException`) are documented [below](#reacting-to-save-draft-and-exception-flows); the state callbacks in [Reading the document state](#reading-the-document-state).

## Reacting to save, draft and exception flows

The widget surfaces three user-initiated flows and reports each through exactly one callback, whichever mode it is in. Every callback receives the raw request; `result` is filled in only for the flows the widget persisted itself.

| Callback            | User action             | Signature                    | What the widget does                                                                                                                                                                   | What the host does                                                                                                                       |
| ------------------- | ----------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `onSubmit`          | **Submit**              | `(request, result?) => void` | With `sdk` + `data`: `processExtractedData`, then uploads to `ValidatedExtractionResultsPath`, and passes the outcome as `result`. Without: emits the request only                     | React to `result`, or — when it is absent — persist the request yourself (`submitValidatedData` does exactly what the widget would have) |
| `onSaveAsDraft`     | **Save as draft**       | `(request, result?) => void` | With `sdk` + `data`: uploads `validatedData` straight to the bucket (no `processExtractedData`). Without: emits the request only                                                       | Same as above; the host-side equivalent is `saveValidatedDataAsDraft`                                                                    |
| `onReportException` | **Report as exception** | `(request, result?) => void` | With `sdk` + `processedDocument`: records the rejection against the Flow run and passes the outcome as `result`. Otherwise nothing — the reason is at `request.exceptionReport.Reason` | For any other source, persist it yourself — call `OrchestratorDuModule.submitExceptionReport(...)`                                       |

Submit and draft hand you a `SaveValidatedDataResult` (`{ success, error? }`) — the host owns all UI feedback (toast, retry, etc.); the widget does not surface failures itself. The exception callback hands you `documentId` and `reason` strings ready to forward to the SDK.

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
      onSubmit={handleSubmit}
      onSaveAsDraft={handleSaveAsDraft}
      onReportException={handleReportException}
    />
  );
}
```

> **Warning: Failures are silent if you skip the callbacks**
> All three callbacks are optional, but the widget surfaces no errors on its own. Outside a `processedDocument`, `onReportException` is the only place the report goes — without it, the user's **Report as exception** click is a no-op.

## Reading the document state

These callbacks report the rest of the element's `IValidationStationStandaloneWcEventMap`; the three save flows are above.

| Prop                                     | Fires when                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onExtractionResultChanged`              | Any change to the extraction result — needs `options={{ emitDtoStateChanges: true }}`. An IXP document reports an `IXPReviewedExtraction`, with its `confirmations` |
| `onLoaded`                               | The element finished loading                                                                                                                                        |
| `onDirtyChange`                          | Unsaved changes appear or are cleared                                                                                                                               |
| `onIsValidChange`                        | Validity flips (`true` = no Must rule broken, no invalid values)                                                                                                    |
| `onDocumentTypeChanged`                  | The user picks another document type                                                                                                                                |
| `onFieldValueSelected`                   | The user selects a field value                                                                                                                                      |
| `onFieldValueChanged`                    | The user edits a field value                                                                                                                                        |
| `onBusinessRulesEvaluated`               | Validation errors and business rules are re-evaluated                                                                                                               |
| `onSaveResult`                           | A `save` command completes                                                                                                                                          |
| `onSetFieldValueByPathResult`            | A `setFieldValueByPath` command completes                                                                                                                           |
| `onSelectAndFocusFieldValueByPathResult` | A `selectAndFocusFieldValueByPath` command completes                                                                                                                |
| `onDeleteFieldValueByPathResult`         | A `deleteFieldValueByPath` command completes                                                                                                                        |
| `onFieldsPanelWidthChanged`              | The fields panel is resized (width in px)                                                                                                                           |
| `onFieldsPanelSideChanged`               | The panel moves to the other side of the viewer                                                                                                                     |
| `onWcMessage`                            | The element publishes a message on its bus (`ui-du-vs-wc-message`) — see below                                                                                      |

> **Attention: Commands need a loaded document**
> `setFieldValueByPath`, `selectAndFocusFieldValueByPath` and `deleteFieldValueByPath` resolve their `path` against the taxonomy and the current extraction result, so one issued before those arrive fails to resolve. Gate on `onLoaded`, and wire the matching `*Result` callback — it carries the reason (`No field value found at path …`), which is otherwise invisible.

The subcomponents report subsets of this set — see [subcomponents](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/validation-station-subcomponents.md).

### Rendering your own value-indicator overlay

Hovering a value's confidence indicator opens a built-in popover. `onWcMessage` receives an `IVsWcMessage`, discriminated on `type`: `indicator-overlay-show` carries the value's confidence, thresholds, confirmation and broken-rule state (`IVsIndicatorOverlayContext`) plus the trigger's viewport rect to position against, and `indicator-overlay-hide` closes it. Hide the built-in popover with CSS, then render your own:

```css
ui-du-validation-station-standalone-wc-element::part(indicator-overlay) {
  display: none;
}
```

```tsx
<ValidationStation
  sdk={sdk}
  data={data}
  onWcMessage={(message) => {
    if (message.type === "indicator-overlay-show") showPopover(message.context);
    else hidePopover();
  }}
/>
```

`message.instanceId` tells elements apart when several report to one handler. `CompactFieldsForm`, `CompactTableEditor` and `CompactBusinessRules` take `onWcMessage` too.

### Opening a field in your taxonomy editor

An annotation host — one that sets `options={{ intendedUse: "document-annotation" }}` — gets an _Edit instructions_ link on each prediction-diff warning. Clicking it publishes `taxonomy-field-focus-request` on the same bus, naming the field group or table (`fieldId`) and its `documentTypeId`:

```tsx
<ValidationStation
  artifacts={artifacts}
  options={{ intendedUse: "document-annotation" }}
  onWcMessage={(message) => {
    if (message.type === "taxonomy-field-focus-request")
      openTaxonomyField(message.documentTypeId, message.fieldId);
  }}
/>
```

`ValidationStation` and `CompactFieldsForm` publish it; the table editor does not. Since `IVsWcMessage` gained this member, an exhaustive `switch` over `message.type` needs a new case.

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

## Examples

### Setting a field value by path

Address fields by path when you have nested groups or table rows. Each segment is `{ fieldName, valueIndex }`.

> **Note: Paths resolve only after the document loads**
> See [Reading the document state](#reading-the-document-state). Wire `onSetFieldValueByPathResult` while you are building this, or a mistimed command fails silently.

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
              { fieldName: "Invoice", valueIndex: 0 },
              { fieldName: "Amount", valueIndex: 0 },
            ],
          })
        }
      >
        Focus Amount by path
      </button>
      <ValidationStation
        sdk={sdk}
        data={data}
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
<ValidationStation sdk={sdk} data={data} save={save} />
```
