# @uipath/ui-widgets-decisions-and-reasons

An instructional HITL decision-capture widget. A reviewer corrects what an agent proposed, explains why, tells the agent what to do next time, and completes the task by clicking one outcome. Two flavors: a full card and a compact inline disclosure.

## Installation

```bash
npm install @uipath/ui-widgets-decisions-and-reasons
```

## Features

- Decision header with the agent's recommended outcome and confidence score
- Use-case values (text, number, select) that open at the agent's value
- One row per reason with a Relevance and a Verdict dropdown, both opening at the agent's values
- "Agent proposed: <value>" under every control whose value differs from the agent's
- "Why is this the right decision?" textarea, prefilled from the agent's rationale suggestion while empty
- "What should the agent do next time?" textarea, empty on load
- One button per outcome; the recommended one carries "Recommended · <confidence>%" and is never pre-selected
- Two flavors: `DecisionCapture` (full card) and `DecisionCaptureInline` (one line plus a disclosure, no card frame)

## Completion contract

The Decision Ledger builds the persisted Decision from the completed task's data. Each `inOuts` field becomes a `Data` entry with the value sent in as `proposedValue` and the value returned as `finalValue`, and the clicked outcome becomes `AcceptedOutcome`. The widget therefore returns every proposed value in exactly the shape it arrived in, changing only what the reviewer changed.

`onComplete(outcome, data)` is called with the clicked outcome name and the task data. The host forwards both:

```tsx
<DecisionCapture
  taskId={task.id}
  source={source}
  onComplete={(outcome, data) => completeTask(outcome, data)}
/>
```

`data` holds:

| Key                        | Value                                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| one key per use-case field | The field's value, same type as it arrived                                                        |
| `evidence`                 | Every reason as it arrived; only `relevance` and `verdict` differ where the reviewer changed them |
| `rationaleText`            | The rationale textarea                                                                            |
| `instructionText`          | The instruction textarea, empty string when none                                                  |

The widget adds no keys to evidence items and writes no computed or telemetry fields (no `signals`, no `Action`) into the data.

Completion rules:

- Every outcome is disabled until the rationale is non-empty.
- The instruction is required when the reviewer overrode the agent: clicks an outcome other than the recommendation, or changed any proposed value. Otherwise it is optional.

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

Without a `source` prop, both flavors render `MockDecisionSource`'s fixture decision, useful for a first look before wiring a real `DecisionSource`.

## Decision model

A `DecisionSource` returns a `DecisionModel`:

| Field                     | Description                                                                       |
| ------------------------- | --------------------------------------------------------------------------------- |
| `outcomes`                | The resolutions the reviewer can choose; `name` is what `onComplete` receives     |
| `agentRecommendedOutcome` | An outcome name; badged, never pre-selected                                       |
| `confidenceScore`         | 0 to 100                                                                          |
| `fields`                  | Use-case values the agent proposes: `key`, `label`, `type`, `value`, `options`    |
| `evidence`                | Reasons: `id`, `title`, `description`, `tags`, `supports`, `relevance`, `verdict` |
| `rationaleSuggestion`     | Prefills the rationale while it is empty                                          |
| `instructionPlaceholder`  | One concrete example shown in the empty instruction field                         |

`supports` and `verdict` are outcome names.

## Props

Shared by both flavors:

| Prop               | Type                                                | Required | Description                                                    |
| ------------------ | --------------------------------------------------- | -------- | -------------------------------------------------------------- |
| `taskId`           | `string`                                            | Yes      | Task to fetch the decision for                                 |
| `source`           | `DecisionSource`                                    | No       | Supplies the `DecisionModel`; defaults to the built-in fixture |
| `apAnalysis`       | `AutopilotDecisionAnalysis`                         | No       | An agent's live analysis of this task's outcomes and reasons   |
| `onComplete`       | `(outcome: string, data: DecisionTaskData) => void` | No       | Called with the clicked outcome name and the task data         |
| `onCompleteFailed` | `(error: Error) => void`                            | No       | Called if `onComplete` throws                                  |

`DecisionCapture` only: `embedded` (drops the card frame).

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

## License

MIT
