# Decisions and Reasons - Architecture

## Overview

A HITL decision-capture widget: a task's recommended resolution, its evidence, amount, rationale, and resolution options, captured as a `DecisionSubmission` the host writes back. Ported from `@uipath/decision-capture` in the `decision-ledger` repo, in two flavors over one shared data flow.

## Component Structure

- **DecisionCapture** (`DecisionCapture.tsx`) — the full-card flavor: a Decision tab (header, Evidence table, Amount card, Rationale, Resolution radio cards, footer) and a Signals tab.
- **DecisionCaptureInline** (`DecisionCaptureInline.tsx`) — the compact-inline flavor: one line with the recommended resolution and confidence, plus a disclosure that expands the evidence and resolution choice in place. No card frame, no Signals tab — meant to sit inside a host banner.
- **useDecisionCapture** (`useDecisionCapture.ts`) — the stateful logic both flavors share: fetching the decision, tracking evidence/rationale/resolution edits, deriving interaction signals, and submitting. Neither view component owns this state itself.
- **SignalsPanel** (`SignalsPanel.tsx`) — renders the derived interaction signals; only used by the full-card flavor.
- **interaction-signals.ts** — `InteractionSignalTracker`, framework-free, ported unchanged from the source widget.
- **mock-data-source.ts** — `MockDecisionSource` + `FIXTURE_DECISION`, the default `DecisionSource` and the fixture used by every story.
- **icons/** — one SVG component per icon (repo convention; no icon library dependency).

## Data Flow

```
source.getDecision(taskId) → DecisionModel
  → useDecisionCapture seeds refund/rationale/evidence state, starts InteractionSignalTracker
  → apAnalysis prop (AutopilotDecisionAnalysis) merges in on its own timing, never
    overwriting rationale the human already typed, never overwriting touched evidence rows
  → user edits evidence/rationale/resolution → tracker records derived signals only
  → submit() → DecisionSubmission → onSubmitted(submission)
```

## Contract differences from `@uipath/decision-capture`

- No `writer` / `DecisionCaptureConnectionConfig` / OKF+Traces client — this repo takes data through props; `source` defaults to `MockDecisionSource`, and `onSubmitted` is the host's only write-back hook.
- No `DecisionCaptureLauncher` (pill + draggable overlay) flavor — the two required flavors (full card, compact inline) cover the "pinned vs. embedded" need without a floating-positioning system.
- No `analysis-store.ts` publish/subscribe singleton — it only existed for the Launcher's push updates; `apAnalysis` is a direct prop on both flavors instead.
- Styling is Tailwind utility classes (apollo-wind's CSS custom properties via arbitrary values) rather than inline `style` objects, matching this repo's other widgets.
- Icons are hand-rolled SVGs under `icons/` rather than a `lucide-react` dependency, matching `pdf-viewer`'s convention — no other package here pulls in an icon library.
- No i18n catalog — only `conversational-agent-chat` has one in this repo (`check-i18n`'s script path and the i18n eslint rule are both scoped to it alone); none of the other five widgets have one either.

## Styling

- Built from `@uipath/apollo-wind` barrel exports (`Button`, `Card*`, `DropdownMenu*`, `Progress`, `RadioGroup*`, `Tabs*`, `Textarea`) — the same import convention every other widget in this repo uses.
- `DecisionsAndReasons.css` in `src/` is a stub for tests; the real stylesheet is compiled from `DecisionsAndReasons.scss` into `dist/` by the `copy-styles` script.
- Root elements carry `uipath-decisions-and-reasons` / `uipath-decisions-and-reasons-inline` classes for consumer overrides.

## Testing

Tests in `src/__tests__/` using Vitest with Testing Library: `interaction-signals.test.ts` (ported from the source widget, framework-free), `DecisionCapture.test.tsx`, `DecisionCaptureInline.test.tsx`.
