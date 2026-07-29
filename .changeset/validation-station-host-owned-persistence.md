---
"@uipath/ui-widgets-validation-station": major
---

**Breaking:** the widgets no longer persist validated data. `ProcessExtractedData` and the zipped bucket upload move out of the save flow — `ValidationStation` and `CompactFieldsForm` now emit the save payloads and the host writes them back.

The widget was making Orchestrator write calls on the user's behalf, which meant hosts could not sequence persistence against their own work (complete the task, write elsewhere, use a different backend) or replace the write entirely. Report-as-exception already worked this way; submit and save-as-draft now match it.

- `onSubmitComplete` / `onSaveAsDraftComplete` are replaced by `onSaveValidatedDataRequest` / `onSaveValidatedDataAsDraftRequest`, which receive the raw web-component payloads (`IVsSaveValidatedDataRequest` / `IVsSaveValidatedDataAsDraftRequest`, both now exported). `CompactFieldsForm` already exposed these two — its `onSubmitComplete` / `onSaveAsDraftComplete` props are gone.
- `submitValidatedDataToOrchestrator` and `saveValidatedDataAsDraftToOrchestrator` are now **exported as opt-in helpers** so hosts keep the standard DU write contract (ProcessExtractedData + zipped upload to `ValidatedExtractionResultsPath`) without reimplementing it. The widgets never call them. Both still resolve to `SaveValidatedDataResult` and never throw.
- Without a request callback, Submit / Save-draft are no-ops — the widget writes nothing and shows nothing.
- `TelemetryEvent.Submit` now fires when the widget **emits** the payload rather than when a write succeeds; the widget can no longer observe the outcome.
- `ValidationStation` no longer renders a `Toaster`. Its only toast was an unreachable missing-folder guard — that case is already surfaced as the inline artifacts-load error.

Migration:

```tsx
// before
<ValidationStation sdk={sdk} data={data} folderId={folderId}
  onSubmitComplete={(r) => r.success && completeTask()} />

// after
<ValidationStation sdk={sdk} data={data} folderId={folderId}
  onSaveValidatedDataRequest={async (request) => {
    const r = await submitValidatedDataToOrchestrator(sdk, data, folderId, request);
    if (r.success) await completeTask();
  }} />
```
