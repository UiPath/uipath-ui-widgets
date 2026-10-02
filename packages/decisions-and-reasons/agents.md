# Decisions and Reasons - Architecture

## Overview

The decision part of a Coded Action App. The process proposes an outcome, reasons, rationale chips and lessons; the reviewer confirms or corrects them with taps and completes the task with one button. The host forwards the result as `completeTask('<OUTCOME_NAME>', data)`.

Proposals can come from an agent, an automation or a person, so the UI says "Proposed" and never "agent".

The spec is `skills/uipath-human-in-the-loop/references/decision-capture-action-app-guide.md` in UiPath/skills ("Fields the toggle adds" and "The guided layout"). The visual and interaction source is the design team's decision-capture mock, approach A (inline reveal) for the not-relevant why. Two flavors share one data flow.

## Component Structure

- **DecisionCapture** (`DecisionCapture.tsx`) - the full flavor: Decision, Reasons, Rationale and Teach cards beside a sticky "What changed" rail that holds the one action button.
- **DecisionCaptureInline** (`DecisionCaptureInline.tsx`) - the compact flavor: one line with the proposed outcome and confidence, plus a disclosure that opens the same sections stacked.
- **DecisionControls** (`DecisionControls.tsx`) - the sections both flavors compose: `DecisionSection`, `ReasonsSection` (weight menu with bar marks, inline "Why is it not relevant?"), `RationaleSection`, `TeachSection`, `ChangesRail` and `DecisionBody`.
- **useDecisionCapture** (`useDecisionCapture.ts`) - the stateful logic: fetching the decision, the reviewer's edits against the proposal, the change list, the gate and the completion data.
- **mock-data-source.ts** - `MockDecisionSource` + `FIXTURE_DECISION` (a help-channel triage), the default `DecisionSource` and the fixture used by every story.
- **icons/** - one SVG component per icon (repo convention; no icon library dependency).

## Task fields

| Section | Field                | Holds                                                                                            |
| ------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| inputs  | `proposedOutcome`    | The outcome the process proposes; equals one outcome name                                        |
| inputs  | `proposalConfidence` | 0 to 100                                                                                         |
| inputs  | `rationaleOptions`   | Rationale chips (`string[]`)                                                                     |
| inputs  | `instructionOptions` | Lessons (`string[]`), one sentence each                                                          |
| inOuts  | `evidence`           | Reasons: `id`, `title`, `description`, `supports`, `weight`, `notRelevantWhy`, `notRelevantNote` |
| outputs | `rationale`          | The chips the reviewer kept, plus their own (`string[]`)                                         |
| outputs | `instructionText`    | The lesson picked or edited; `""` when none                                                      |
| outputs | `instructionScope`   | `this-task`, `similar-tasks` or `all-tasks`                                                      |

Every input is treated as possibly absent: the widget renders an empty state and never returns a field the task did not send.

## Data Flow

```
source.getDecision(taskId) -> DecisionModel
  -> useDecisionCapture holds the reviewer's edits (outcome, weights, whys, chips, lesson, scope) next to the untouched proposal
  -> every changed control shows "Proposed: <value>" and adds a row to "What changed"
  -> one action button: "Agree · <proposedOutcome>" with no change, else "Record decision"
  -> onComplete(outcomeName, data), then the filed read-only state
```

## Completion contract

The backend builds the persisted Decision from the completed task's data: each `inOuts` field becomes `Data.<field>` with the value sent in as the proposed value and the value returned as the final value, and the clicked outcome becomes `AcceptedOutcome`. Anything extra written into task data shows up as a change nobody made, so:

- `data` holds `evidence` (only when the task sent it), `rationale`, `instructionText` and `instructionScope`, and nothing else.
- Evidence items are returned in exactly the shape they arrived; only `weight`, `notRelevantWhy` and `notRelevantNote` differ, and only where the reviewer changed them. An item returned to its proposed weight is the original object.
- No computed or telemetry values are written into the data.
- The decision is the outcome: one card per outcome, never a single Submit.

Rules:

- Outcome cards are never pre-selected; the proposed one is badged "Proposed · N%". Once picked, a chip says "As proposed" or "Override".
- Every control whose value differs from the proposal shows "Proposed: <value>".
- Rationale is optional when nothing changed and required once the reviewer departs. The Teach section (lesson cards plus "Applies to") is live only after a departure and a lesson is then required.
- "Record decision" is disabled until an outcome is picked, every Not relevant reason has a why, a rationale chip is picked and a lesson is picked. The note under the button names what is missing.
- `readOnly`, or a task that arrives with `completedOutcome`, renders the saved values and never completes.

## Contract differences from `@uipath/decision-capture`

- No `writer` / `DecisionCaptureConnectionConfig` / OKF+Traces client - this repo takes data through props; `source` defaults to `MockDecisionSource`, and `onComplete` is the host's only write-back hook.
- No `DecisionCaptureLauncher` (pill + draggable overlay) flavor.
- No analysis-store singleton and no live analysis prop; the proposal comes from the task.
- No interaction-signal tracking and no Signals tab.
- Styling is Tailwind utility classes over apollo-wind's CSS custom properties.
- Icons are hand-rolled SVGs under `icons/`, matching `pdf-viewer`'s convention.
- No i18n catalog - only `conversational-agent-chat` has one in this repo.

## Styling

- Built from `@uipath/apollo-wind` barrel exports (`Button`, `DropdownMenu*`, `Input`, `Textarea`).
- `DecisionsAndReasons.css` in `src/` is a stub for tests; the real stylesheet is compiled from `DecisionsAndReasons.scss` into `dist/` by the `copy-styles` script.
- Root elements carry `uipath-decisions-and-reasons` / `uipath-decisions-and-reasons-inline` classes for consumer overrides.

## Testing

Tests in `src/__tests__/` using Vitest with Testing Library: `DecisionCapture.test.tsx` and `DecisionCaptureInline.test.tsx` cover the proposed badge and no pre-selection, one-click agree, override and the missing-items note, the inline not-relevant why, the change list, rationale and lesson gating, empty states and the completion data shape.
