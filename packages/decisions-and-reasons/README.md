# @uipath/ui-widgets-decisions-and-reasons

A HITL decision-capture widget: a task's recommended resolution, its evidence, amount, rationale, and resolution options, in two flavors — a full card and a compact inline disclosure.

## Installation

```bash
npm install @uipath/ui-widgets-decisions-and-reasons
```

## Features

- Decision header with the selected resolution, an "Agent recommended" chip, and a confidence score
- Evidence table with a Relevance and a Decision dropdown per row, expand/collapse, and "Add evidence"
- Amount card, shown only when the task has an amount
- Rationale, required, prefilled from the agent's suggestion only while empty
- Resolution picked from radio cards; the recommended one is marked but never pre-selected
- Derived interaction signals (no raw keystrokes or text) submitted alongside the decision
- Two flavors: `DecisionCapture` (full card, with a Signals tab) and `DecisionCaptureInline` (one line plus a disclosure, no card frame)

## Usage

> **Note:** Add either `light` or `dark` class to your HTML `<body>` element to enable proper theming.

```tsx
import { DecisionCapture } from "@uipath/ui-widgets-decisions-and-reasons";
import "@uipath/ui-widgets-decisions-and-reasons/DecisionsAndReasons.css";

function App() {
  return (
    <DecisionCapture
      taskId="task-123"
      capturedBy="human:jane@example.com"
      onSubmitted={(submission) => console.log(submission)}
    />
  );
}
```

```tsx
import { DecisionCaptureInline } from "@uipath/ui-widgets-decisions-and-reasons";

<DecisionCaptureInline
  taskId="task-123"
  capturedBy="human:jane@example.com"
  onSubmitted={(submission) => console.log(submission)}
/>;
```

Without a `source` prop, both flavors render `MockDecisionSource`'s fixture decision — useful for a first look before wiring a real `DecisionSource`.

## Props

Shared by both flavors:

| Prop             | Type                                       | Required | Description                                                    |
| ---------------- | ------------------------------------------ | -------- | -------------------------------------------------------------- |
| `taskId`         | `string`                                   | Yes      | Task to fetch the decision for                                 |
| `capturedBy`     | `string`                                   | Yes      | Opaque identity string, e.g. `"human:jane@example.com"`        |
| `source`         | `DecisionSource`                           | No       | Supplies the `DecisionModel`; defaults to the built-in fixture |
| `apAnalysis`     | `AutopilotDecisionAnalysis`                | No       | An agent's live analysis of this task's evidence               |
| `maxReasons`     | `number`                                   | No       | How many evidence rows to show and submit (default 3)          |
| `onSubmitted`    | `(submission: DecisionSubmission) => void` | No       | Called with the human's decision on Submit                     |
| `onSubmitFailed` | `(error: Error) => void`                   | No       | Called if `onSubmitted` throws                                 |

`DecisionCapture` only: `embedded` (drops the card frame) and `showSignals` (adds the Signals tab, default `true`).

## Development

```bash
# Run tests
npm test

# Build the package
npm run build
```

## License

MIT
