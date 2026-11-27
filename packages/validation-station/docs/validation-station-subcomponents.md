# Building with the Validation Station subcomponents

The subcomponents are the panels of the Validation Station as separate React elements you lay out yourself: `DocumentViewer`, `CompactFieldsForm`, `CompactTableEditor`, `CompactBusinessRules` and `CompactDocTypeField`. They render the same web component as `ValidationStation`, so the install, hosting and auth in the [package README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station) apply unchanged. This page covers only what composing them adds.

## When you need this

- **Your own layout:** the viewer in one place, the fields in a drawer, the line items in a sheet, the rules in a side panel.
- **One or two panels only,** for example a fields form next to the viewer.
- **Panels that link to each other** (select a field and the viewer highlights it, click a rule and its field focuses) without wiring that yourself.

For the standard review screen, use `ValidationStation`; don't recompose it from the panels. For a viewer on its own, with no form linked to it, use [`@uipath/ui-widgets-document-viewer`](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/document-viewer).

## Five things to get right

1. **Fetch once, in the parent.** Call `useDuDocumentArtifacts(sdk, data)` (or `useProcessedDocumentArtifacts(sdk, processedDocument)` for a Flow document) once, and pass the same `artifacts` to every panel. A panel given `sdk` + `data` fetches for itself, so five of them download the same document five times.
2. **One `instanceId` per document, and per contract.** Panels with the same `instanceId` share one store, and that is all the linking needs. Use a different one for each document on screen, and never let a DU and an IXP rendering of a document share one: panels fed the wrong representation show every field as "Is missing". It cannot change once mounted.
3. **`persistent={false}` in a fixed layout.** With `persistent` on, React StrictMode's throwaway unmount destroys the element, and the panel renders blank. Turn it on only for a panel that really moves across the DOM, such as into a portal.
4. **Only `CompactFieldsForm` saves, and it needs `emitDtoStateChanges`.** The table editor and the document type field edit the shared store, and those edits are saved when the reviewer saves through the form. Give `sdk` + `data` to the form only, with `options={{ emitDtoStateChanges: true }}`, or **Save as draft** never fires.
5. **Hide the form's own copies.** When you render `CompactBusinessRules` or `CompactDocTypeField` as panels, pass `hideBusinessRules: true` and `hideDocumentTypeField: true` in the form's `options`, or they appear twice.

## The subcomponents

| Component              | What it is                                 | Edits             | Saves   | Extra props worth knowing                                                  |
| ---------------------- | ------------------------------------------ | ----------------- | ------- | -------------------------------------------------------------------------- |
| `DocumentViewer` ⚠️    | The page and text viewer, with highlights  | —                 | —       | `onTokensSelect`, `onCurrentPageChange`, `goToPage`                        |
| `CompactFieldsForm`    | The extracted fields, and the save buttons | Fields            | **Yes** | `sdk`, `data`, `options`, `onSubmit`, `onSaveAsDraft`, `onReportException` |
| `CompactTableEditor`   | The editor for one table field             | Cells, rows       | —       | `onClosed`, `isTableSelectionEnabled`                                      |
| `CompactBusinessRules` | The evaluated business rules               | —                 | —       | `onBusinessRuleClick`, `onBusinessRulesToggle`                             |
| `CompactDocTypeField`  | The document type selector                 | The document type | —       | `onDocumentTypeChanged`, `onPanelOpenChange`                               |

> **Warning: `DocumentViewer` is deprecated**
> Web component `1.0.0-rc.5` deprecates the element it wraps in favour of `@uipath/du-document-viewer-wc`. Keep using it only to link the viewer to the other panels through `instanceId`, which the standalone viewer cannot do yet.

Every panel also takes `artifacts`, `documentId` (falls back to `data.DocumentId`, then `processedDocument.metadata.pipelineRunId`), `instanceId`, `theme`, `language`, `persistent`, `isReadonly`, `className` and `style`. The viewer usually wants `style={{ height: "100%" }}`.

## Worked example: a Coded Action App

A cut-down version of the [`action-app-with-document-validation-subcomponents`](https://github.com/UiPath/uipath-typescript/tree/main/samples/coded-action-apps/action-app-with-document-validation-subcomponents) sample: the task's `contentValidationData` reviewed in a five-panel grid. `sdk` and `codedActionApp` come from `src/uipath.ts`, as in the package README's [quick start](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#quick-start-a-coded-action-app), which also shows reading the task.

```tsx title="src/Workspace.tsx"
import {
  CompactBusinessRules,
  CompactDocTypeField,
  CompactFieldsForm,
  CompactTableEditor,
  DocumentViewer,
  useDuDocumentArtifacts,
  type IValidationStationOptions,
} from "@uipath/ui-widgets-validation-station";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { MessageSeverity } from "@uipath/coded-action-app";
import { codedActionApp, sdk } from "./uipath";

const FIELDS_FORM_OPTIONS: IValidationStationOptions = {
  hideBusinessRules: true, // rendered as their own panels below
  hideDocumentTypeField: true,
  emitDtoStateChanges: true, // makes "Save as draft" work
  hideReportAsExceptionButton: true, // an app task cannot record an exception report
};

export function Workspace({
  taskData,
  data,
  isReadonly,
}: {
  taskData: { contentValidationData?: DuFramework.ContentValidationData };
  data: DuFramework.ContentValidationData; // with FolderId filled in from the task
  isReadonly: boolean;
}) {
  // Fetched once, here, and shared by all five panels.
  const { artifacts, error } = useDuDocumentArtifacts(sdk, data);
  if (error) return <p>Failed to load the document: {error}</p>;
  if (!artifacts) return <p>Loading the document…</p>;

  const shared = {
    artifacts,
    documentId: data.DocumentId,
    instanceId: `action-review-${data.DocumentId}`, // one store for this document
    isReadonly,
    persistent: false, // a fixed grid
  };

  return (
    // Each panel sits in its own grid cell: a panel's loading state is a plain <div>.
    <div className="workspace">
      <div style={{ gridArea: "viewer" }}>
        <DocumentViewer {...shared} style={{ height: "100%" }} />
      </div>
      <div style={{ gridArea: "doctype" }}>
        <CompactDocTypeField {...shared} />
      </div>
      <div style={{ gridArea: "form" }}>
        {/* The only panel that saves, so the only one given sdk + data. */}
        <CompactFieldsForm
          {...shared}
          sdk={sdk}
          data={data}
          options={FIELDS_FORM_OPTIONS}
          onSubmit={async (_request, result) => {
            if (!result?.success) {
              codedActionApp.showMessage(
                result?.error ?? "Failed to submit.",
                MessageSeverity.Error,
              );
              return;
            }
            // completeTask replaces the task's data: pass all of it back.
            await codedActionApp.completeTask("Submit", taskData);
          }}
          onSaveAsDraft={(_request, result) =>
            codedActionApp.showMessage(
              result?.success
                ? "Draft saved."
                : (result?.error ?? "Failed to save the draft."),
              result?.success ? MessageSeverity.Success : MessageSeverity.Error,
            )
          }
        />
      </div>
      <div style={{ gridArea: "table" }}>
        <CompactTableEditor {...shared} />
      </div>
      <div style={{ gridArea: "rules" }}>
        <CompactBusinessRules {...shared} />
      </div>
    </div>
  );
}
```

For a standalone web app that lists validation tasks and opens each in a custom workspace, see the [`document-validation-subcomponents-app`](https://github.com/UiPath/uipath-typescript/tree/main/samples/document-validation-subcomponents-app) sample.

> **Note: Hide a panel, don't unmount it**
> To show a panel on demand (a fields drawer, a line-items sheet), keep it mounted and hide it with CSS, plus `inert` so it takes no focus. Unmounting destroys its element: a hidden fields form stops validating and tracking edits, and a table editor mounted late misses the table field the reviewer just picked.

## IXP documents

`CompactFieldsForm`, `CompactTableEditor` and `DocumentViewer` take a Flow `processedDocument`, or `IxpDocumentArtifacts`, as `ValidationStation` does. `CompactBusinessRules` and `CompactDocTypeField` don't: the web component evaluates rules and document types for Document Understanding only, and their props reject IXP artifacts at compile time.

```tsx
const { artifacts, error } = useProcessedDocumentArtifacts(
  sdk,
  processedDocument,
);
// …error and loading states as above…
const { pipelineRunId } = processedDocument.metadata;
const shared = {
  artifacts,
  documentId: pipelineRunId,
  instanceId: `review-${pipelineRunId}`, // unique per Flow document
  persistent: false,
};

return (
  <>
    <DocumentViewer {...shared} style={{ height: "100%" }} />
    <CompactFieldsForm
      {...shared}
      sdk={sdk}
      processedDocument={processedDocument}
      options={{ emitDtoStateChanges: true }}
      // Complete the task with the validated document, verbatim: the next node reads it.
      onSubmit={(_request, result) => completeTask(result?.processedDocument)}
    />
    <CompactTableEditor {...shared} />
  </>
);
```

- **Saving** works as for `ValidationStation`: see [IXP (`ProcessedDocument`)](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/data-sources.md#ixp-processeddocument). Completing the task is still yours. With both `data` and `processedDocument`, `data` wins.
- **Cite with `references`.** The fields form and the table editor have no document to place `boundingBoxes` in, so an extraction whose sources cite by `boundingBoxes` alone shows no predicted values. Current IXP models cite with `references`.
- **Events report in the document's representation.** `onExtractionResultChanged` hands back an `IXPReviewedExtraction` for an IXP document.

## What links for free

With one shared `instanceId`, these need no wiring:

- Select a field in the form, and the viewer highlights it.
- Click a rule, and its field focuses.
- Select a table field, and the table editor opens on it.
- Change the document type, and the form switches to the new type's fields.

The `on*` callbacks (`onFieldValueSelected`, `onBusinessRuleClick`, `onDocumentTypeChanged`, `onTokensSelect`, …) are for your own reactions, such as a status bar or analytics. The panels don't need them to link.

## Also avoid

- **Passing a `tasks.getAll()` row** to the panels in a standalone app. Its `data` is undefined; load the task with `tasks.getById(id, { taskType: TaskType.DocumentValidation }, folderId)` first.
- **Expecting a panel to show an error.** A failed submit or draft returns `{ success: false, error }` and shows nothing. Report-as-exception persists nothing outside a Flow document: record it yourself (`OrchestratorDuModule.submitExceptionReport` for a Document Understanding validation task), or hide the button.
- **Creating a second `UiPath` instance** for the panels. Reuse the app's.
