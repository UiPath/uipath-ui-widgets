# @uipath/ui-widgets-decisions-and-reasons

Preview components for capturing a reviewer's decision in a Coded Action App, a QuickForm or a document-validation task. The process proposes values and reasons, the reviewer checks them, picks an outcome and completes the task. Proposals can come from an agent, an automation or a person, so the UI says "Proposed".

Reviewers do different jobs, so the package has one component for each job. All of them share one capture model and one payload.

## Installation

```bash
npm install @uipath/ui-widgets-decisions-and-reasons
```

## Choosing a format

Everything is exported from the `/preview` subpath, so an app opts in by importing from it.

| Export                 | The reviewer's job                                                                | Layout                                                                                                                                                |
| ---------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CaseAssessment`       | Weigh the reasons in a case and decide its outcome, for example claims or refunds | Reasons with weights and Add a reason, outcome cards, final details that follow the outcome, Next time with a scope                                   |
| `SourceComparison`     | Compare extracted values against a system of record, field by field               | Sections of field rows: extracted value beside the system-of-record value, verdict and corrected value, citation, optional QC lane, coverage bar      |
| `ExtractionValidation` | Confirm or correct values extracted from a document                               | Fields with confidence (low highlighted), line-item table, Validate or Reject with reason chips                                                       |
| `TriageRouting`        | Confirm or change the category, priority and team the agent picked                | One row per label with option chips and the agent's reason, Confirm or Send back                                                                      |
| `DraftEditing`         | Accept, edit or rewrite agent-written text                                        | Editable draft with the original kept, an edit-size indicator (kept, lightly edited, rewritten), reason-for-edit chips, Send, Revise or Reject        |
| `FactWeighing`         | Weigh each fact in a case from fraud to legitimate, beside the agent's read       | Facts grouped by section on a five-point scale, the agent's recommendation, Approve or Decline, reason chips and a rationale, a saved-payload preview |

Two smaller pieces sit beside them:

| Export              | What it is                                                                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `withReasonCapture` | Takes a QuickForm schema and returns it with one optional "Why?" dropdown under every select field (`dropdown`, `radioGroup`, `checkbox`). A rule shows each one only when the value differs from `defaultValue`. |
| `DocumentReasonRow` | One optional row of reasons (Extraction misread, Not in the document, Rule doesn't fit, Other) for a single edited document field.                                                                                |

```tsx
import {
  DraftEditing,
  FIXTURE_DRAFT,
} from "@uipath/ui-widgets-decisions-and-reasons/preview";
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<DraftEditing
  {...FIXTURE_DRAFT}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(outcome, payload) => service.completeTask(outcome, payload)}
/>;
```

## Customizing

Every format takes the same props. The payload contract, the `data-signal-*` markup and the rule that no outcome is pre-selected are fixed.

| Prop                           | What it changes                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `fields`, `reasons`, `labels`  | The items to review, with their kinds, groups, labels and copy. Which one a format takes is in its props type |
| `outcomes`                     | The outcome cards, with `recommended`, `requiresReason` and `requiresCoverage`                                |
| `reasonOptions`                | The reason chip vocabulary                                                                                    |
| `show`                         | Optional pieces: `confidence`, `citation`, `qcLane`, `nextTime`, `comparison`, `record`                       |
| `copy`                         | A few labels, such as the noun used for the outcome                                                           |
| `aside`                        | A node rendered beside the form, for example a PDF viewer                                                     |
| `renderField(field, default)`  | Replaces how one field renders                                                                                |
| `className`                    | Added to the root element                                                                                     |
| `onChange(payload)`            | Called as the reviewer changes something, so the host can save the task data                                  |
| `onComplete(outcome, payload)` | Called with the clicked outcome id and the payload                                                            |

```tsx
<SourceComparison
  {...FIXTURE_COMPARISON}
  outcomes={[
    {
      id: "Accept",
      label: "Accept",
      description: "Every field has a verdict.",
      recommended: true,
      requiresCoverage: true,
    },
    {
      id: "Escalate",
      label: "Escalate",
      description: "Send to the owner. Needs a reason.",
      requiresReason: true,
      reasons: ["Needs legal review", "Other"],
    },
  ]}
  show={{ citation: false }}
  aside={<PdfViewer url={documentUrl} />}
  renderField={(field, node) => (field.group === "Term" ? null : node)}
  onComplete={(outcome, payload) => service.completeTask(outcome, payload)}
/>
```

## Payload

Each part keeps its proposed value and its final value, and says who set it, so a consumer can tell what the reviewer changed.

| Key                                                                 | Content                                                                                                                                      |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `decision`                                                          | The outcome id, or null before one is picked                                                                                                 |
| `fields`                                                            | Per part: `byDecision` (proposed), `value` (final) and `setBy` (`model` or `reviewer`)                                                       |
| `reasons`, `decidingReasons`, `rationaleText`                       | The reasons with their weights, the ones that decided, and a generated sentence, never shown                                                 |
| `changes`, `record`, `changeLog`, `timeOnTaskSeconds`               | How much each part changed (Kept, Lightly edited, Rewritten, Rejected, Added, Untouched), whether it was looked at, and the order of changes |
| `nextTimeId`, `nextTimeText`, `nextTimeScope`, `nextTimeConditions` | The Next time rule of `CaseAssessment`, empty elsewhere                                                                                      |

## Architecture

Components render and import from hooks, utils and models, never the reverse. `preview.ts` imports the files directly, with no barrels.

```
src/
  preview.ts
  components/
    CaseAssessment/        CaseAssessment, ReasonsSection, NextTimeSection
    SourceComparison/    SourceComparison, ComparisonRow, CoverageBar
    ExtractionValidation/        ExtractionValidation, LineItems
    TriageRouting/  TriageRouting
    DraftEditing/           DraftEditing
    FactWeighing/          FactWeighing, FactTable, FactRow, ScaleCell, RecommendationCard, RationaleCard
    shared/                OutcomePicker, ReasonChips, ChangesSummary, DocumentReasonRow
  hooks/                   useDecisionCapture, the one hook behind every format
  models/                  decision (types), constants
  utils/                   changes (diff and how much), payload (serializers), withReasonCapture
  fixtures/                synthetic data, one file per format
  stories/                 one story file per format, plus withReasonCapture
  __tests__/               one test file per format, plus utils
```

The backend builds the persisted Decision from the completed task's data: each `inOuts` field becomes `Data.<field>` with the proposed value in and the final value out, and the clicked outcome becomes `AcceptedOutcome`.

The components are built from `@uipath/apollo-wind` and Tailwind utility classes. The root element carries the `uipath-decisions-and-reasons` class for overrides, and `DecisionsAndReasons.scss` is compiled into `dist/DecisionsAndReasons.css` by `copy-styles`.

## Intrinsic signals

The controls carry the `data-signal-*` markup the intrinsic signals script reads; the host app attaches the script and adds its snapshot to `completeTask`.

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

## License

MIT
