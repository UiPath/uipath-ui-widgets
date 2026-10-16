# Decisions and Reasons - Architecture

## Overview

An instructional HITL decision-capture widget. The reviewer corrects what the agent proposed, explains why (`rationaleText`), tells the agent what to do next time (`instructionText`), and completes the task by clicking one outcome. The host forwards the result as `completeTask('<OUTCOME_NAME>', data)`. Two flavors over one shared data flow. The spec is `skills/uipath-human-in-the-loop/references/decision-capture-action-app-guide.md` in UiPath/skills (the decision capture path of `uipath-human-in-the-loop`): its Decision model, Critical Rules and Step 3 capture rules.

## Component Structure

- **DecisionCapture** (`DecisionCapture.tsx`) - the full-card flavor: header with the recommendation and confidence, use-case fields, one row per reason, rationale and instruction textareas, and one button per outcome.
- **DecisionCaptureInline** (`DecisionCaptureInline.tsx`) - the compact-inline flavor: one line with the recommended outcome and confidence, plus a disclosure that expands the same parts in place. No card frame, meant to sit inside a host banner.
- **DecisionControls** (`DecisionControls.tsx`) - the controls both flavors compose: `FieldControl`, `EvidenceRow`, `RationaleAndInstruction`, `OutcomeButtons` and the "Agent proposed" note.
- **useDecisionCapture** (`useDecisionCapture.ts`) - the stateful logic both flavors share: fetching the decision, tracking edits against the agent's proposal, deciding when an outcome can be completed, and building the completion data. Neither view component owns this state itself.
- **mock-data-source.ts** - `MockDecisionSource` + `FIXTURE_DECISION`, the default `DecisionSource` and the fixture used by every story.
- **icons/** - one SVG component per icon (repo convention; no icon library dependency).

## Data Flow

```
source.getDecision(taskId) -> DecisionModel
  -> useDecisionCapture seeds field values, evidence and the rationale prefill; remembers the agent's proposal
  -> apAnalysis prop (AutopilotDecisionAnalysis) merges in on its own timing, never overwriting
     rationale the human already typed, never overwriting touched evidence rows
  -> reviewer edits values, relevance, verdict, rationale, instruction
  -> click an outcome -> onComplete(outcomeName, data)
```

## Completion contract

The backend builds the persisted Decision from the completed task's data: each `inOuts` field becomes `Data.<field>` with the value sent in as `proposedValue` and the value returned as `finalValue`, and the clicked outcome becomes `AcceptedOutcome`. Anything extra written into task data shows up as a change nobody made, so:

- `data` holds one key per use-case field, `evidence`, `rationaleText` and `instructionText`, and nothing else.
- Evidence items are returned in exactly the shape they arrived; only `relevance` and `verdict` differ, and only where the reviewer changed them. No keys are added to items.
- No computed or telemetry values (no `signals`, no `Action`) are written into the data.
- The decision is the outcome: one button per outcome, never a single Submit.

Capture rules:

- Controls open at the agent's value; the recommended outcome is badged with its confidence and never pre-selected.
- Every control whose value differs from the agent's shows "Agent proposed: <value>".
- Every outcome is disabled until the rationale is non-empty.
- The instruction is required when the reviewer overrides the agent (an outcome other than the recommendation, or any changed value), optional otherwise.

## Contract differences from `@uipath/decision-capture`

- No `writer` / `DecisionCaptureConnectionConfig` / OKF+Traces client - this repo takes data through props; `source` defaults to `MockDecisionSource`, and `onComplete` is the host's only write-back hook.
- No `DecisionCaptureLauncher` (pill + draggable overlay) flavor - the two required flavors (full card, compact inline) cover the "pinned vs. embedded" need without a floating-positioning system.
- No `analysis-store.ts` publish/subscribe singleton - it only existed for the Launcher's push updates; `apAnalysis` is a direct prop on both flavors instead.
- No interaction-signal tracking and no Signals tab - derived signals are not written into task data.
- Styling is Tailwind utility classes (apollo-wind's CSS custom properties via arbitrary values) rather than inline `style` objects, matching this repo's other widgets.
- Icons are hand-rolled SVGs under `icons/` rather than a `lucide-react` dependency, matching `pdf-viewer`'s convention.
- No i18n catalog - only `conversational-agent-chat` has one in this repo.

## Styling

- Built from `@uipath/apollo-wind` barrel exports (`Button`, `DropdownMenu*`, `Progress`, `Textarea`) - the same import convention every other widget in this repo uses.
- `DecisionsAndReasons.css` in `src/` is a stub for tests; the real stylesheet is compiled from `DecisionsAndReasons.scss` into `dist/` by the `copy-styles` script.
- Root elements carry `uipath-decisions-and-reasons` / `uipath-decisions-and-reasons-inline` classes for consumer overrides.

## Testing

Tests in `src/__tests__/` using Vitest with Testing Library: `DecisionCapture.test.tsx` and `DecisionCaptureInline.test.tsx` cover the recommendation badge, the rationale gate, the instruction requirement on override, the "Agent proposed" note and the completion data shape.
