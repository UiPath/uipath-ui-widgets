import { SCOPE_BY_ID } from "../models/constants";
import type {
  ChangeRow,
  ReasonView,
  ReviewPart,
  ReviewSpec,
  ReviewState,
} from "../models/capture";
import { outcomeLabel } from "./outcomes";
import { partChanged, partResolution } from "./parts";
import { reasonChanged, weightText } from "./reasons";
import { weightResolution } from "./resolution";
import { scopeSentence, selectedConditions } from "./scope";
import { orEmpty, truncate } from "./text";

const PREVIEW_LENGTH = 60;

type ChangeInput = Pick<ReviewState, "outcome" | "lesson" | "scope" | "conds">;

const decisionRows = (spec: ReviewSpec, state: ChangeInput): ChangeRow[] =>
  state.outcome && state.outcome !== spec.recommended
    ? [
        {
          kind: "decision",
          id: state.outcome,
          label: null,
          from: outcomeLabel(spec, spec.recommended),
          to: outcomeLabel(spec, state.outcome),
          how: "Rejected",
          note: spec.nextTime ? SCOPE_BY_ID[state.scope].counts : undefined,
        },
      ]
    : [];

const addedReasonRows = (reasons: ReasonView[]): ChangeRow[] =>
  reasons
    .filter((reason) => reason.added)
    .map((reason) => ({
      kind: "reason",
      id: reason.id,
      label: reason.title,
      from: null,
      to: `Added · ${reason.weight}`,
      how: "Added",
    }));

const weightRows = (spec: ReviewSpec, reasons: ReasonView[]): ChangeRow[] =>
  spec.weighted
    ? reasons.filter(reasonChanged).map((reason) => ({
        kind: "reason",
        id: reason.id,
        label: reason.title,
        from: reason.proposedWeight,
        to: weightText(reason),
        how: weightResolution(reason.proposedWeight, reason.weight),
      }))
    : [];

const fieldRows = (parts: ReviewPart[]): ChangeRow[] =>
  parts.filter(partChanged).map((part) => ({
    kind: "field",
    id: part.id,
    label: part.label,
    from: orEmpty(truncate(part.proposed, PREVIEW_LENGTH)),
    to: orEmpty(truncate(part.value, PREVIEW_LENGTH)),
    how: partResolution(part),
  }));

const nextTimeRows = (spec: ReviewSpec, state: ChangeInput): ChangeRow[] =>
  state.lesson
    ? [
        {
          kind: "nextTime",
          id: state.lesson,
          label: null,
          from: null,
          to: `Applies to ${scopeSentence(state.scope, selectedConditions(spec, state.conds))}`,
          how: "Kept",
        },
      ]
    : [];

export const buildChanges = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  reasons: ReasonView[],
  state: ChangeInput,
): ChangeRow[] => [
  ...decisionRows(spec, state),
  ...addedReasonRows(reasons),
  ...weightRows(spec, reasons),
  ...fieldRows(parts),
  ...nextTimeRows(spec, state),
];

export const hasChanges = (
  spec: ReviewSpec,
  state: Pick<ReviewState, "outcome" | "added">,
  reasons: ReasonView[],
) =>
  (state.outcome !== null && state.outcome !== spec.recommended) ||
  state.added.length > 0 ||
  reasons.some(reasonChanged);
