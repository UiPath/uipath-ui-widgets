# Validation Station Subcomponents (Composition)

The **compact subcomponents** are the individual panels of the Document Understanding Validation Station, exposed as separate React elements you lay out yourself: `DocumentViewer`, `CompactFieldsForm`, `CompactTableEditor`, `CompactBusinessRules`, `CompactDocTypeField`. Use them to build a **custom document-review layout** instead of the single all-in-one `ValidationStation`.

Package: [`@uipath/ui-widgets-validation-station`](https://www.npmjs.com/package/@uipath/ui-widgets-validation-station). They render the **same** underlying web component as the monolith (`@uipath/du-validation-station-wc`) — so all install/build/auth plumbing is identical; only the composition responsibilities are new. Full prop surface lives in the package README — this file covers the composition steps that are easy to get wrong.

## When to Use

- User wants a **custom-laid-out** document-review UI: e.g. viewer on the left, a separate fields form, a standalone business-rules panel, a doc-type selector, and a table editor — arranged in the host's own grid, side panels, tabs, or resizable splits.
- User wants panels to **cross-link** (selecting a field highlights it in the viewer; a rule click focuses the offending field) without wiring that themselves.
- User wants to embed **one or two** panels only (e.g. just the `DocumentViewer` as a read-only preview).

If the user just wants the standard, self-contained review screen, use the monolithic `ValidationStation` — do **not** hand-compose the subcomponents to reproduce it. And do **not** rebuild any of these panels (PDF viewer, field editor, table editor, rules) from scratch.

## Critical Rules

1. **Fetch artifacts once, in the parent — never per subcomponent.** Call `useBucketArtifacts(sdk, data, folderId)` once and pass the resulting `artifacts` to every panel. Each subcomponent _can_ self-fetch if given `sdk` + `data`, but composing N self-fetching panels hits the bucket N times for the same document. Pre-fetch, then hand down `artifacts`.
2. **Give every subcomponent the same `instanceId`.** That is what makes them share one store and mirror each other's selection/edits/document-type. Different (or missing) `instanceId` → isolated stores → no cross-linking. It is immutable once mounted — set it before render, don't change it.
3. **Set `persistent={false}` for a static layout.** The panels live in a fixed grid and are never re-parented, so they don't need the portal-survival path. Leaving `persistent` on makes React StrictMode's throwaway unmount call `forceDestroy()`, tearing down the Angular element so it never re-renders (blank panel). Only set `persistent={true}` if a panel is genuinely moved across the DOM (e.g. into a portal / tab that unmounts).
4. **Only `CompactFieldsForm` persists.** Other panels may still be _editable_ — `CompactTableEditor` edits cells/rows, `CompactDocTypeField` changes the type — but none write to Orchestrator. Those edits land in the shared store and are committed when the user saves through the form. Submit / save-as-draft / report-exception all flow through `CompactFieldsForm` — it is the only panel that takes `sdk` + `data` + `folderId`.
5. **Avoid duplicate surfaces.** If you render standalone `CompactBusinessRules` and/or `CompactDocTypeField` panels, tell the form to drop its built-in ones via `options={{ hideBusinessRules: true, hideDocumentTypeField: true }}` — otherwise the field appears twice.
6. **Save-as-draft needs a flag.** Set `options={{ emitDtoStateChanges: true }}` on `CompactFieldsForm` or the save-as-draft flow (and `onSaveAsDraftComplete`) never fires.

## Install

```bash
npm install @uipath/ui-widgets-validation-station
```

## The Subcomponents

| Component              | Purpose                                 | Editable?         | Owns save flow? | Key extra props                                                                                                |
| ---------------------- | --------------------------------------- | ----------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `DocumentViewer`       | PDF/text viewer with bounding boxes     | No (read-only)    | No              | `onTokensSelect`, `onCurrentPageChange`, `goToPage`                                                            |
| `CompactFieldsForm`    | Extraction-fields editor + save actions | Yes (fields)      | **Yes**         | `sdk`, `data`, `folderId`, `options`, `onSubmitComplete`, `onSaveAsDraftComplete`, `onReportExceptionComplete` |
| `CompactTableEditor`   | Line-items / table-field editor         | Yes (cells, rows) | No              | `onClosed`, `isTableSelectionEnabled`                                                                          |
| `CompactBusinessRules` | Evaluated business-rules panel          | No (read-only)    | No              | `onBusinessRuleClick`, `onBusinessRulesToggle`                                                                 |
| `CompactDocTypeField`  | Document-type selector                  | Yes (doc-type)    | No              | `onDocumentTypeChanged`, `onPanelOpenChange`                                                                   |

> **"Editable?" vs "Owns save flow?" — they are different questions.** _Editable_ means the panel lets the user change data in place (edit fields, edit table cells/rows, pick a document type). _Owns save flow_ means the panel writes back to Orchestrator — it takes `sdk` + `data` + `folderId` and exposes submit / save-as-draft / report-exception. Only `CompactFieldsForm` does the latter. Every panel sharing the same `instanceId` mutates **one shared store**, so edits made in `CompactTableEditor` (or `CompactDocTypeField`) are committed when the user saves **through `CompactFieldsForm`** — the table editor deliberately has no save button of its own. It signals its changes via `onDirtyChange` / `onFieldValueChanged` / `onExtractionResultChanged`.

**Shared props** (every subcomponent — `SubcomponentCommonProps`):

| Prop                  | Required          | Notes                                                                                                                                                    |
| --------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifacts`           | Yes\*             | Pre-fetched `BucketArtifacts` from `useBucketArtifacts`. \*Omit only if you deliberately let this one panel self-fetch (then pass `sdk`+`data` instead). |
| `documentId`          | No                | Falls back to `data.DocumentId`. Pass it in pre-fetched mode where there's no `data`.                                                                    |
| `instanceId`          | Yes (for linking) | Same value across panels → shared store. Omit for an isolated panel.                                                                                     |
| `theme`               | No                | `'light' \| 'dark' \| 'light-hc' \| 'dark-hc'`. Keep in sync with body class.                                                                            |
| `language`            | No                | `ValidationStationLanguage` enum from the package.                                                                                                       |
| `persistent`          | No                | Default `false`. Keep `false` for static grids (see Critical Rule 3).                                                                                    |
| `isReadonly`          | No                | `true` for an audit/read-only view.                                                                                                                      |
| `style` / `className` | No                | The viewer usually wants `style={{ height: '100%' }}`.                                                                                                   |

## Composition Pattern (worked example)

A web app that lists DU validation tasks and opens each one in a custom five-panel review workspace. Two layers: a **task hook** (list → hydrate → mutations) and a **workspace** (pre-fetch once → lay out the panels sharing one `instanceId`).

### 1. Task hook — list, hydrate, mutate

```tsx
// useReviewTasks.ts
import { useCallback, useEffect, useState } from "react";
import type { SaveValidatedDataResult } from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { Tasks, TaskType } from "@uipath/uipath-typescript/tasks";
import type { TaskGetResponse } from "@uipath/uipath-typescript/tasks";

export function useReviewTasks(sdk: UiPath) {
  const [selectedTask, setSelectedTask] = useState<TaskGetResponse | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    message: string;
    severity: "success" | "error";
  } | null>(null);

  // getAll() rows omit `data` — always hydrate the full task before rendering the panels.
  const openTask = useCallback(
    async (taskId: number, folderId: number) => {
      const task = await new Tasks(sdk).getById(
        taskId,
        { taskType: TaskType.DocumentValidation },
        folderId,
      );
      setSelectedTask(task);
    },
    [sdk],
  );

  // Submit succeeded → complete the task. The widget renders NO error UI — surface it here.
  const handleSubmitComplete = useCallback(
    async (result: SaveValidatedDataResult) => {
      if (!result.success)
        return setNotification({ message: "Submit failed", severity: "error" });
      if (!selectedTask) return;
      await selectedTask.complete({
        type: TaskType.DocumentValidation,
        action: "Completed",
      });
      setSelectedTask(null);
      setNotification({ message: "Document submitted", severity: "success" });
    },
    [selectedTask],
  );

  // Save-as-draft persists edits WITHOUT completing the task — leave the selection in place.
  const handleSaveAsDraftComplete = useCallback(
    (result: SaveValidatedDataResult) => {
      setNotification(
        result.success
          ? { message: "Draft saved", severity: "success" }
          : { message: "Failed to save draft", severity: "error" },
      );
    },
    [],
  );

  // Report-as-exception makes NO API call in the widget — the host must persist it.
  const handleReportException = useCallback(
    async (documentId: string, reason: string) => {
      if (!selectedTask) return;
      const res = await new OrchestratorDuModule(sdk).submitExceptionReport(
        selectedTask.id,
        documentId,
        reason || "Reported via review workspace",
        { folderId: selectedTask.folderId },
      );
      if (!res.IsSuccessful)
        return setNotification({
          message: "Failed to report exception",
          severity: "error",
        });
      setSelectedTask(null);
      setNotification({ message: "Exception reported", severity: "success" });
    },
    [sdk, selectedTask],
  );

  return {
    selectedTask,
    openTask,
    notification,
    handleSubmitComplete,
    handleSaveAsDraftComplete,
    handleReportException,
  };
}
```

### 2. Workspace — pre-fetch once, share one `instanceId`

```tsx
// ReviewWorkspace.tsx
import {
  CompactBusinessRules,
  CompactDocTypeField,
  CompactFieldsForm,
  CompactTableEditor,
  DocumentViewer,
  useBucketArtifacts,
  ValidationStationLanguage,
  type SaveValidatedDataResult,
} from "@uipath/ui-widgets-validation-station";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { TaskGetResponse } from "@uipath/uipath-typescript/tasks";

export function ReviewWorkspace({
  sdk,
  task,
  onSubmitComplete,
  onSaveAsDraftComplete,
  onReportException,
}: {
  sdk: UiPath;
  task: TaskGetResponse;
  onSubmitComplete: (r: SaveValidatedDataResult) => void;
  onSaveAsDraftComplete: (r: SaveValidatedDataResult) => void;
  onReportException: (documentId: string, reason: string) => void;
}) {
  const data = task.data as DuFramework.ContentValidationData;
  const folderId = task.folderId;

  // FETCH ONCE. All five panels below share this result.
  const { artifacts, error } = useBucketArtifacts(sdk, data, folderId);
  if (error) return <div>Failed to load document: {error}</div>;
  if (!artifacts) return <div>Loading document…</div>;

  // Props every panel shares — SAME instanceId ties them into one store.
  const shared = {
    artifacts,
    documentId: data.DocumentId,
    instanceId: `review-${data.DocumentId ?? task.id}`,
    theme: "light" as const,
    language: ValidationStationLanguage.English,
    persistent: false, // static grid — see Critical Rule 3
  };

  return (
    <div
      style={{
        display: "grid",
        height: "100%",
        gap: 8,
        gridTemplateColumns: "1.3fr 1fr",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: '"viewer doctype" "viewer form" "table rules"',
      }}
    >
      <div style={{ gridArea: "viewer" }}>
        <DocumentViewer {...shared} style={{ height: "100%" }} />
      </div>

      <div style={{ gridArea: "doctype" }}>
        <CompactDocTypeField {...shared} />
      </div>

      <div style={{ gridArea: "form" }}>
        {/* hide the surfaces owned by the standalone panels below */}
        <CompactFieldsForm
          {...shared}
          sdk={sdk}
          data={data}
          folderId={folderId}
          options={{
            hideBusinessRules: true,
            hideDocumentTypeField: true,
            emitDtoStateChanges: true,
          }}
          onSubmitComplete={onSubmitComplete}
          onSaveAsDraftComplete={onSaveAsDraftComplete}
          onReportExceptionComplete={onReportException}
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

### 3. Wire it up

```tsx
// App.tsx (sdk from useAuth() — the app's single initialized instance)
const { sdk } = useAuth();
const t = useReviewTasks(sdk);

return (
  <>
    {/* …task list that calls t.openTask(taskId, folderId)… */}
    {t.selectedTask && (
      <ReviewWorkspace
        sdk={sdk}
        task={t.selectedTask}
        onSubmitComplete={t.handleSubmitComplete}
        onSaveAsDraftComplete={t.handleSaveAsDraftComplete}
        onReportException={t.handleReportException}
      />
    )}
    {/* render t.notification in your toast/snackbar */}
  </>
);
```

## Cross-linking (free, via shared `instanceId`)

With one shared store, selection and edits propagate automatically — no host wiring:

- Select a field in `CompactFieldsForm` → it highlights in `DocumentViewer`.
- Click a rule in `CompactBusinessRules` → the offending field focuses in the form/viewer.
- Select a table field → `CompactTableEditor` opens on it.
- Change the type in `CompactDocTypeField` → the form re-extracts for the new type.

The `on*` callbacks (`onFieldValueSelected`, `onBusinessRuleClick`, `onDocumentTypeChanged`, `onTokensSelect`, …) are for the **host** to react (status bars, analytics) — they are not needed to link the panels to each other.

## Anti-patterns

- **Do not self-fetch in each panel.** Passing `sdk`+`data` to all five triggers five bucket fetches for one document. Pre-fetch once with `useBucketArtifacts`, pass `artifacts` down.
- **Do not give panels different `instanceId`s** (or omit it) and then expect cross-linking. Same document → same `instanceId`.
- **Do not leave `persistent` at `true` in a static grid.** StrictMode's dev double-mount calls `forceDestroy()` and blanks the panel. Use `persistent={false}` unless the panel is truly re-parented.
- **Do not render duplicate surfaces.** Standalone `CompactBusinessRules`/`CompactDocTypeField` + a form that still shows its own = the field twice. Set `hideBusinessRules`/`hideDocumentTypeField`.
- **Do not compose the subcomponents to rebuild the standard station.** If the layout is just "the normal Validation Station," use `ValidationStation`.
- **Do not pass a `tasks.getAll()` row into the workspace.** Its `data` is undefined — hydrate with `tasks.getById(id, { taskType: TaskType.DocumentValidation }, folderId)` first.
- **Do not assume any panel shows an error on failure.** Submit/draft return `{ success: false, error }` with no UI; report-exception persists nothing. The host owns all feedback and the exception API call (`OrchestratorDuModule.submitExceptionReport`).
- **Do not construct a second `UiPath` SDK** for the widgets. Reuse the app's authenticated instance.
