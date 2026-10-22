# Decisions and Reasons - Architecture

## Overview

Preview components for the decision part of a Coded Action App, a QuickForm or a document-validation task. The process proposes reasons; the reviewer weighs them, picks a decision and completes the task. The host forwards the result as `completeTask('<OUTCOME_NAME>', data)`.

Proposals can come from an agent, an automation or a person, so the UI says "Proposed" and never "agent".

The spec is `skills/uipath-human-in-the-loop/references/decision-capture-action-app-guide.md` in UiPath/skills. The package exports only from the `/preview` subpath, so an app opts in by importing it.

## Component Structure

- **DecisionCaptureCodedActionApp** (`DecisionCaptureCodedActionApp.tsx`) - the app shell: context, Decision with final details that follow it, and Next time with a scope, as one column of cards driven by task data. A rejected `onComplete` shows an inline error and leaves the task open.
- **ReasonsCard** (`ReasonsCard.tsx`) - the Reasons card with the weight menu, the optional Why chips and "+ Add a reason", plus the `WeightBars` indicator.
- **ChangesCard** (`ChangesCard.tsx`) - What changed and the Complete action, plus the `RecordDrawer` that shows the record (`record`, `changeLog`, `timeOnTaskSeconds`) only with `showRecord`.
- **DocumentReasonRow** (`DocumentReasonRow.tsx`) - the one optional reason row under a single edited document field, and the `Chip` pressed-state pill shared by reasons, scopes and conditions.
- **reviewModel** (`reviewModel.ts`) - the `useDecisionCaptureCodedActionApp` hook with its state and handlers, the pure functions that build typed change rows and record entries (`kind`, ids, values, `howMuch`, scope id) with no formatted text, the serializers that turn them into the payload strings (`changes`, `record`, `changeLog`, `rationaleText`), and `withReasonCapture`, which adds one optional Why dropdown under every select field of a QuickForm schema. Components render the same data with JSX and never format it.
- **Use-case widgets** (`ContractFieldReviewCodedActionApp.tsx`, `DocumentValidationCodedActionApp.tsx`, `TicketTriageCodedActionApp.tsx`) - one file each. Each declares its parts (`PartSeed`: proposed value, confidence) and its outcomes in a `UseCaseSpec`, calls `useUseCaseCapture`, and renders. Adding a use case is one new widget file, a fixture and a story.
- **UseCaseParts** (`UseCaseParts.tsx`) - the shared outcome card, reason chips and confidence badge for the use-case widgets.
- **useUseCaseCapture** (`reviewModel.ts`) - holds the values, reasons, looked-at ids and change log, and `buildUseCasePayload` serializes `UseCasePayload` (`decision`, `reasons`, `fields` with `byDecision` proposed and `value` final plus `setBy`, `changes`, `record`, `changeLog`), the same keys the claim widget returns.
- **types** (`types.ts`) - the data and payload types, and the weights, decisions, scopes and document reasons.
- **claim-review-fixture.ts** - `FIXTURE_CLAIM`, the warranty claim used by the stories and tests.

## Completion contract

The backend builds the persisted Decision from the completed task's data: each `inOuts` field becomes `Data.<field>` with the proposed value in and the final value out, and the clicked outcome becomes `AcceptedOutcome`. `DecisionCaptureCodedActionApp` returns the reasons and fields in the shape they arrived, adding only the keys the guide names. `rationaleText` is generated from the deciding reasons and the decision and is never shown.

## Intrinsic signals

The widget's controls carry the `data-signal-*` markup the intrinsic signals script reads, and the weight menu portals into the widget root; the host app attaches the script and adds its snapshot to `completeTask`.

## Styling

- Built from `@uipath/apollo-wind` barrel exports (`Alert`, `Badge`, `Button`, `Card`, `Collapsible`, `DropdownMenu`, `Input`, `Label`, `Table`, `Textarea`, `Toggle`, `ToggleGroup`) and Tailwind utility classes over its custom properties. No hand-rolled chrome.
- Root element carries the `uipath-decisions-and-reasons` class for consumer overrides.
- `DecisionsAndReasons.scss` is compiled into `dist/DecisionsAndReasons.css` by the `copy-styles` script. Stories import the scss directly.

## Testing

Tests in `src/__tests__/` use Vitest with Testing Library: `DecisionCaptureCodedActionApp.test.tsx` (no pre-selection, final details that follow the decision, added reasons, the record and `showRecord`, a rejected `onComplete`, read-only), and `outputs.test.tsx` (a snapshot of the `onChange` and `onComplete` payloads for a scripted review, which pins the output contract), `withReasonCapture.test.ts` and `DocumentReasonRow.test.tsx`.
