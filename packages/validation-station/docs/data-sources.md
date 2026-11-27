# Data sources and the round trip

> **Note: Applies to `@uipath/ui-widgets-validation-station` with web component `1.0.0-rc.6`.**
> Start with the [package README](https://github.com/UiPath/uipath-ui-widgets/tree/develop/packages/validation-station#readme) for install, hosting and a working Coded Action App.

How the widget gets its document, and how to load and save it yourself when the self-fetching default does not fit.

The widget needs a taxonomy, an extraction result and a document DOM. There are three mutually exclusive ways to give it those:

| Mode                   | Pass                         | Who fetches                                                   | Who writes back                                       |
| ---------------------- | ---------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| **Self-fetching**      | `sdk` + `data`               | The widget, from the bucket paths on `ContentValidationData`  | The widget, to `ValidatedExtractionResultsPath`       |
| **Self-fetching, IXP** | `sdk` + `processedDocument`  | The widget, through the Flow run that produced the document   | The widget, as a review recorded against the Flow run |
| **Pre-fetched**        | `artifacts` (+ `documentId`) | You — hand it a `DuDocumentArtifacts` object you already hold | You, from the request the widget emits                |

If both `data` and `processedDocument` are set, `data` wins.

**The outputs do not change with the mode.** `onSubmit`, `onSaveAsDraft` and `onReportException` fire for every user action either way, and always carry the request the web component produced. The only difference is a second argument: when the widget persisted the data itself, it passes the outcome too.

Pre-fetched mode is what you want when the document does not live in a storage bucket, when the artifacts are already in memory (e.g. fetched once and shared with the [subcomponents](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/validation-station-subcomponents.md)), when persistence goes somewhere other than `ValidatedExtractionResultsPath`, or when you want to change the taxonomy or the extraction before handing them to the component. For the last, fetch them with `fetchDuDocumentArtifacts` (or `fetchProcessedDocumentArtifacts` for IXP), edit them, and pass the result as `artifacts`.

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

Every bucket call is scoped to the folder `data` names — `FolderId`, or `FolderKey` when both are present. The activity that produces the `ContentValidationData` sets one of them; if neither is there, the widget renders an error instead of fetching.

> **Info: `DuDocumentArtifacts`**
> `{ taxonomy, extractionResult, dom, text, customizationInfo, original }` — `original` is the base64-encoded document the viewer renders. In `DuDocumentArtifacts`, `taxonomy` and `extractionResult` are UiPath DU contracts. `ValidationStation` also takes `IxpDocumentArtifacts`, the same shape with both in the IXP representation (an `IXPTaxonomy` JSON Schema, and an `IXPReviewedExtraction` — an `IXPExtraction` plus optional `confirmations`). So do the `CompactFieldsForm`, `CompactTableEditor` and `DocumentViewer` subcomponents; `CompactBusinessRules` and `CompactDocTypeField` take `DuDocumentArtifacts` only.

## Owning the round-trip

Pre-fetched mode does not mean writing the bucket plumbing yourself. Everything the widget does internally is exported, so a host can drive the same flow:

| Export                                         | Use                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `fetchDuDocumentArtifacts(sdk, data)`          | Fetch `DuDocumentArtifacts` imperatively — outside render, ahead of time, or in a loader |
| `useDuDocumentArtifacts(sdk, data)`            | The same fetch as a hook, for when the fetch belongs to a component's lifecycle          |
| `submitValidatedData(sdk, data, request)`      | The submit flow: `ProcessExtractedData`, then upload to `ValidatedExtractionResultsPath` |
| `saveValidatedDataAsDraft(sdk, data, request)` | The draft flow: upload `validatedData` straight to the bucket                            |

```tsx
import {
  fetchDuDocumentArtifacts,
  submitValidatedData,
  saveValidatedDataAsDraft,
  ValidationStation,
  type DuDocumentArtifacts,
} from "@uipath/ui-widgets-validation-station";

function HostOwnedReview({ sdk, data }) {
  const [artifacts, setArtifacts] = useState<DuDocumentArtifacts | null>(null);

  useEffect(() => {
    fetchDuDocumentArtifacts(sdk, data).then(setArtifacts);
  }, [sdk, data]);

  if (!artifacts) return <div>Loading document…</div>;

  return (
    <ValidationStation
      artifacts={artifacts}
      documentId={data.DocumentId}
      // no sdk / data — the host loads and persists
      onSubmit={async (request) => {
        const result = await submitValidatedData(sdk, data, request);
        afterSubmit(result);
      }}
      onSaveAsDraft={(request) => saveValidatedDataAsDraft(sdk, data, request)}
    />
  );
}
```

> **Warning: Handle both callbacks**
> If you persist yourself, handle `onSaveAsDraft` as well as `onSubmit`.

The request payloads are exported too — `IVsSaveValidatedDataRequest`, `IVsSaveValidatedDataAsDraftRequest` and `IVsSaveExceptionReportRequest` — so handlers declared outside JSX can name their parameter.

## IXP (`ProcessedDocument`)

A Flow IDP extract node emits a `ProcessedDocument` rather than a `ContentValidationData`. It carries the taxonomy (an `IXPTaxonomy`) and the result (an `IXPExtraction`) inline, plus `metadata` naming the run that produced it — `pipelineRunId`, `traceId`, `spanId` and `folderKey`. All four are required, and a cloud Flow run always sets them. The document, its DOM and its OCR text are read through that run's trace.

```tsx
<ValidationStation
  sdk={sdk}
  processedDocument={task.data}
  onSubmit={(request, result) => completeTask(result?.processedDocument)}
/>
```

- **Loading.** The document opens on the result last saved against the producing span (a draft), else on the payload's `result`. A draft reopens with the values the reviewer had confirmed. `documentId` defaults to `metadata.pipelineRunId`, one per extraction. The trace id is shared by every IDP node a Flow run executes, so it does not tell two documents apart.
- **Several documents from one run.** Each document is read from the digitization its own `pipelineRunId` produced, so the documents of one Flow run can be shown side by side.
- **Saving.** Submit and draft record the review against the producing span; report-as-exception records a rejection with the reason. `onSubmit`, `onSaveAsDraft` and `onReportException` receive the outcome as their second argument. `request.validatedData` is an `IXPExtraction` on submit, and an `IXPReviewedExtraction` — the same plus the reviewer's `confirmations` — on a draft.
- **Record format.** A review is stored as the `ProcessedDocument` the widget was given, with its `result` replaced by the validated one and `metadata.hitl.draft` set — `true` for a draft, `false` for a submit. This is the shape the Angular Validation Station uses, so either reopens a review the other saved. A record in any other shape — including the `{ draft, extraction }` envelope both used before — is ignored on load, and the document opens on the payload's `result`.
- **Completing the task is yours.** The downstream Flow node reads the validated document from the task completion. A submit's `result.processedDocument` is that document — the same one the record holds, a `ValidatedProcessedDocument` — so complete the task with it, verbatim, whatever `result.success` says: a failed record write must not block the review. `toValidatedProcessedDocument(processedDocument, validatedData, draft)` builds it when you persist yourself.
- **Subcomponents.** `CompactFieldsForm`, `CompactTableEditor` and `DocumentViewer` take `processedDocument` or `IxpDocumentArtifacts` too, and `CompactFieldsForm` saves a Flow document as `ValidationStation` does. `CompactBusinessRules` and `CompactDocTypeField` are Document Understanding-only. See the [subcomponents guide](https://github.com/UiPath/uipath-ui-widgets/blob/develop/packages/validation-station/docs/validation-station-subcomponents.md#ixp-documents).
- **OAuth scopes.** The `sdk`'s token needs `Traces.Api` (the run's spans, and the review record) and `OR.Buckets.Read` (the document, DOM and OCR text, via ECS). A coded action app completing the task also needs `OR.Tasks`. A missing scope surfaces as a 401/403 in the load or save error.
- **Hosting.** The artifacts are downloaded in the browser from pre-signed ECS storage URLs, so the host's origin must be in the ECS storage account's CORS rules. Coded apps (`https://{org}.{env}.uipath.host`) are.

The widget does this through exported functions, so a host that fetches up front runs exactly the same code:

| Export                                                              | Use                                                                                             |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `fetchProcessedDocumentArtifacts(sdk, processedDocument)`           | Fetch the `IxpDocumentArtifacts` — what the widget fetches given `processedDocument`            |
| `useProcessedDocumentArtifacts(sdk, processedDocument)`             | The same fetch as a hook, for when the fetch belongs to a component's lifecycle                 |
| `submitProcessedDocument(sdk, processedDocument, request)`          | Record a submitted review; its result carries the `processedDocument` to complete the task with |
| `saveProcessedDocumentAsDraft(sdk, processedDocument, request)`     | Record a draft — the one the next load opens on                                                 |
| `reportProcessedDocumentException(sdk, processedDocument, request)` | Record a rejection with the reviewer's reason. Replaces a saved draft                           |

```tsx
const artifacts = await fetchProcessedDocumentArtifacts(sdk, processedDocument);

<ValidationStation
  artifacts={artifacts}
  onSubmit={async (request) => {
    const result = await submitProcessedDocument(
      sdk,
      processedDocument,
      request,
    );
    // Undefined only for a payload the station could not have reviewed.
    if (result.processedDocument) completeTask(result.processedDocument);
  }}
  onSaveAsDraft={(request) =>
    saveProcessedDocumentAsDraft(sdk, processedDocument, request)
  }
/>;
```

The save functions are stateless: each one edits the span's newest review record, or creates it when there is none, so the widget and a host saving outside it always land on the same record.
