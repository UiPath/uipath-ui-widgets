# @uipath/ui-widgets-decisions-and-reasons

Preview components for capturing a reviewer's decision in a Coded Action App, a QuickForm or a document-validation task. The process proposes the reasons, the reviewer weighs them, picks a decision and completes the task. Proposals can come from an agent, an automation or a person, so the UI says "Proposed".

## Installation

```bash
npm install @uipath/ui-widgets-decisions-and-reasons
```

## Preview components

Three preview components for apps that build their own layout. They are exported only from the `/preview` subpath, so an app opts in by importing from it.

| Piece                           | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `DecisionCaptureCodedActionApp` | One column of cards driven by task data: context, reasons with a weight menu, the decision (nothing pre-selected), final details that follow the decision, an "Add a reason" row, Next time with a scope, and What changed. The record of how the decision was reached goes to the payload and is not shown to the reviewer; the `showRecord` prop (default false) renders it as a collapsed drawer for demos. Returns the decision and a payload through `onComplete(decision, payload)`. |
| `withReasonCapture`             | Takes a QuickForm schema and returns it with one optional "Why?" dropdown under every select field (`dropdown`, `radioGroup`, `checkbox`). A rule shows each one only when the value differs from the field's `defaultValue`.                                                                                                                                                                                                                                                              |
| `DocumentReasonRow`             | One optional row of reasons (Extraction misread, Not in the document, Rule doesn't fit, Other) for a single edited document field.                                                                                                                                                                                                                                                                                                                                                         |

```tsx
import {
  DecisionCaptureCodedActionApp,
  FIXTURE_CLAIM,
} from "@uipath/ui-widgets-decisions-and-reasons/preview";
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<DecisionCaptureCodedActionApp
  data={FIXTURE_CLAIM}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(decision, payload) => service.completeTask(decision, payload)}
/>;
```

`DecisionCaptureCodedActionApp` input is `ClaimData`: the claim context, `recommendedDecision`, `reasons` (with `proposedWeight`, `source` and `sourceConfidence`), `fields` (final details with a `byDecision` value for each outcome), `nextTimeOptions` and `conditionOptions`. The reviewer adds a reason of their own with "Add a reason" (a one-line title and the outcome it supports, starting at High); it is recorded as Added from the reviewer. The rationale is not shown: `rationaleText` is generated from the deciding reasons and the decision. The payload adds `rationaleText`, `decidingReasons`, `nextTime*`, `changes`, `record`, `changeLog` and `timeOnTaskSeconds` to the reasons and fields it received.

The record rows say how much each part changed (Kept, Lightly edited, Rewritten, Rejected, Added or Untouched) and whether the reviewer looked at it. Opening a reason's menu or clicking its text counts as looking.

```ts
import { withReasonCapture } from "@uipath/ui-widgets-decisions-and-reasons/preview";

const { schema, added } = withReasonCapture(developerSchema);
```

## Props

`DecisionCaptureCodedActionApp`:

| Prop         | Type                                                                                         | Required | Description                                                                  |
| ------------ | -------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------- |
| `data`       | `ClaimData`                                                                                  | Yes      | The task data: context, reasons, final details, Next time rules              |
| `onComplete` | `(decision: string, payload: DecisionCaptureCodedActionAppPayload) => Promise<void> \| void` | Yes      | Called with the clicked outcome name and the payload                         |
| `onChange`   | `(payload: DecisionCaptureCodedActionAppPayload) => void`                                    | No       | Called as the reviewer changes something, so the host can save the task data |
| `readOnly`   | `boolean`                                                                                    | No       | Renders the saved values and never completes                                 |
| `reviewerId` | `string`                                                                                     | No       | Written into the record when the host provides one                           |
| `showRecord` | `boolean`                                                                                    | No       | Shows the record as a collapsed drawer; default false, for demos only        |

Every input is optional except the claim facts and outcomes; a missing one renders an empty state, and the payload never returns a field the task did not send. The reasons come back in the shape they arrived, with only `weight`, `notRelevantWhy` and `notRelevantNote` changed where the reviewer changed them, plus `added: true` on a reason the reviewer added.

## Intrinsic signals

The widget's controls carry the `data-signal-*` markup the intrinsic signals script reads; the host app attaches the script and adds its snapshot to `completeTask`.

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

## License

MIT
