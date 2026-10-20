# @uipath/ui-widgets-decisions-and-reasons

The decision part of a Coded Action App. The process proposes an outcome, the reasons behind it, rationale chips and lessons. The reviewer confirms or corrects them with taps, and completes the task with one button. Two flavors: a full layout with a "What changed" rail and a compact inline disclosure.

Proposals can come from an agent, an automation or a person, so the UI says "Proposed".

## Installation

```bash
npm install @uipath/ui-widgets-decisions-and-reasons
```

## Features

- Decision cards, one per outcome; the proposed one is badged "Proposed · N%" and never pre-selected. Once picked, a chip says "As proposed" or "Override".
- Reasons with a weight menu (High, Medium, Low, Not relevant) showing bar marks. Choosing Not relevant reveals "Why is it not relevant?" with Wrong, Outdated and Other; Other opens a short note.
- "Proposed: <value>" under every control whose value differs from the proposal
- Rationale chips from `rationaleOptions` plus "Add your own"; optional when nothing changed, required once the reviewer departs
- A Teach section after a departure: `instructionOptions` as lesson cards and an "Applies to" control (This task, Similar tasks, All tasks)
- A "What changed" panel listing each change, for example Reason `High → Not relevant · Wrong`
- One button: "Agree · <proposedOutcome>" when nothing changed, otherwise "Record decision", with a note naming what is missing
- A filed read-only state after completion

## Prop-driven capture pieces

Three pieces for apps that build their own layout. None of them needs a data source.

| Piece               | What it is                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ClaimReview`       | One column of cards driven by task data: context, reasons with a weight menu, the decision (nothing pre-selected), final details that follow the decision, a rationale composed from the weighted reasons, Next time with a scope, What changed, and a collapsed record of how the decision was reached. Returns the decision and a payload through `onComplete(decision, payload)`. |
| `withReasonCapture` | Takes a QuickForm schema and returns it with one optional "Why?" dropdown under every select field (`dropdown`, `radioGroup`, `checkbox`). A rule shows each one only when the value differs from the field's `defaultValue`.                                                                                                                                                        |
| `DocumentReasonRow` | One optional row of reasons (Extraction misread, Not in the document, Rule doesn't fit, Other) for a single edited document field.                                                                                                                                                                                                                                                   |

```tsx
import {
  ClaimReview,
  FIXTURE_CLAIM,
} from "@uipath/ui-widgets-decisions-and-reasons";
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

<ClaimReview
  data={FIXTURE_CLAIM}
  onChange={(payload) => service.setTaskData(payload)}
  onComplete={(decision, payload) => service.completeTask(decision, payload)}
/>;
```

`ClaimReview` input is `ClaimData`: the claim context, `recommendedDecision`, `reasons` (with `proposedWeight`, `source` and `sourceConfidence`), `fields` (final details with a `byDecision` value for each outcome), `nextTimeOptions` and `conditionOptions`. The payload adds `rationaleText`, `decidingReasons`, `nextTime*`, `changes`, `record`, `changeLog` and `timeOnTaskSeconds` to the reasons and fields it received.

The record rows say how much each part changed (Kept, Lightly edited, Rewritten, Rejected or Untouched) and whether the reviewer looked at it. Opening a reason's menu or clicking its text counts as looking.

```ts
import { withReasonCapture } from "@uipath/ui-widgets-decisions-and-reasons";

const { schema, added } = withReasonCapture(developerSchema);
```

## Task fields

| Section | Field                | Type                                        |
| ------- | -------------------- | ------------------------------------------- |
| inputs  | `proposedOutcome`    | string, equals one outcome name             |
| inputs  | `proposalConfidence` | number, 0 to 100                            |
| inputs  | `rationaleOptions`   | string[]                                    |
| inputs  | `instructionOptions` | string[]                                    |
| inOuts  | `evidence`           | array of reasons (below)                    |
| outputs | `rationale`          | string[]                                    |
| outputs | `instructionText`    | string, `""` when none                      |
| outputs | `instructionScope`   | `this-task`, `similar-tasks` or `all-tasks` |

An `evidence` item: `id`, `title`, `description`, `supports` (an outcome name), `weight` (`High`, `Medium`, `Low` or `Not relevant`), `notRelevantWhy` (`Wrong`, `Outdated` or `Other`) and `notRelevantNote` (only for `Other`).

Every input is optional. The widget renders an empty state for a missing one and never returns a field the task did not send.

## Completion contract

The backend builds the persisted Decision from the completed task's data: each `inOuts` field becomes `Data.<field>` with the proposed value in and the final value out, and the clicked outcome becomes `AcceptedOutcome`. The widget therefore returns every reason in the shape it arrived; only `weight`, `notRelevantWhy` and `notRelevantNote` differ, and only where the reviewer changed them.

`onComplete(outcome, data)` is called with the clicked outcome name and the task data. The host forwards both:

```tsx
<DecisionCapture
  taskId={task.id}
  source={source}
  onComplete={(outcome, data) => completeTask(outcome, data)}
/>
```

`data` holds:

| Key                | Value                                                          |
| ------------------ | -------------------------------------------------------------- |
| `evidence`         | Every reason as it arrived, only when the task sent `evidence` |
| `rationale`        | The chips the reviewer kept plus their own                     |
| `instructionText`  | The picked or edited lesson, `""` when none                    |
| `instructionScope` | `this-task`, `similar-tasks` or `all-tasks`                    |

The widget adds no keys to reasons and writes no computed or telemetry fields into the data.

Completion rules:

- With no change, "Agree · <proposedOutcome>" completes in one click.
- With any change, "Record decision" is disabled until an outcome is picked, every Not relevant reason has a why, at least one rationale chip is picked and a lesson is picked.

## Usage

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import { DecisionCapture } from "@uipath/ui-widgets-decisions-and-reasons";
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

function App() {
  return (
    <DecisionCapture
      taskId="task-123"
      onComplete={(outcome, data) => completeTask(outcome, data)}
    />
  );
}
```

```tsx
import { DecisionCaptureInline } from "@uipath/ui-widgets-decisions-and-reasons";

<DecisionCaptureInline
  taskId="task-123"
  onComplete={(outcome, data) => completeTask(outcome, data)}
/>;
```

Without a `source` prop, both flavors render `MockDecisionSource`'s fixture decision, a help-channel triage, useful for a first look before wiring a real `DecisionSource`.

## Decision model

A `DecisionSource` returns a `DecisionModel`:

| Field                                              | Description                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------- |
| `outcomes`                                         | The resolutions the reviewer can choose; `name` is what `onComplete` receives |
| `proposedOutcome`                                  | An outcome name; badged, never pre-selected                                   |
| `proposalConfidence`                               | 0 to 100                                                                      |
| `evidence`                                         | The reasons                                                                   |
| `rationaleOptions`                                 | Rationale chips                                                               |
| `instructionOptions`                               | Lessons, one sentence each                                                    |
| `completedOutcome`                                 | Set when the task is already completed; renders the filed state               |
| `rationale`, `instructionText`, `instructionScope` | Saved values shown in the filed state                                         |

## Props

Shared by both flavors:

| Prop               | Type                                                | Required | Description                                                    |
| ------------------ | --------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `taskId`           | `string`                                            | Yes      | Task to fetch the decision for                                 |
| `source`           | `DecisionSource`                                    | No       | Supplies the `DecisionModel`; defaults to the built-in fixture |
| `readOnly`         | `boolean`                                           | No       | Renders the saved values and never completes                   |
| `onComplete`       | `(outcome: string, data: DecisionTaskData) => void` | No       | Called with the clicked outcome name and the task data         |
| `onCompleteFailed` | `(error: Error) => void`                            | No       | Called if `onComplete` throws                                  |

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

## License

MIT
