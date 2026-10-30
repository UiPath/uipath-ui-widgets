import { EMPTY_VALUE, KIND_PARTS, SCOPE_BY_ID } from "../models/constants";
import type {
  ReasonView,
  Resolution,
  ReviewPart,
  ReviewSpec,
  ReviewState,
} from "../models/capture";
import type { CaptureRecordRow } from "../models/payload";
import { outcomeLabel } from "./outcomes";
import { partChanged, partResolution } from "./parts";
import { reasonChanged, weightText } from "./reasons";
import { outcomeResolution, weightResolution } from "./resolution";
import { orEmpty } from "./text";

type RecordInput = Pick<ReviewState, "outcome" | "looked" | "lesson" | "scope">;

const proposer = (name?: string, confidence?: number) => {
  if (!name) return "";
  return confidence === undefined ? name : `${name} · ${confidence}%`;
};

const reasonResolution = (reason: ReasonView, looked: boolean): Resolution => {
  if (reason.added) return "Added";
  if (reasonChanged(reason)) {
    return weightResolution(reason.proposedWeight, reason.weight);
  }
  return looked ? "Kept" : "Untouched";
};

const partSource = (part: ReviewPart, spec: ReviewSpec) => {
  if (partChanged(part)) return "Reviewer";
  if (part.follows !== undefined && part.follows !== part.proposed) {
    return "Follows decision";
  }
  return proposer(part.source ?? spec.proposedBy, part.confidence);
};

const decisionRow = (
  spec: ReviewSpec,
  { outcome }: RecordInput,
  counts: string,
): CaptureRecordRow => ({
  part: KIND_PARTS.decision,
  proposed: outcomeLabel(spec, spec.recommended),
  submitted: outcome ? outcomeLabel(spec, outcome) : EMPTY_VALUE,
  howMuch: outcomeResolution(spec.recommended, outcome),
  source: proposer(spec.proposedBy),
  lookedAt: !!outcome,
  scope: outcome && outcome !== spec.recommended ? counts : EMPTY_VALUE,
});

const reasonRows = (
  spec: ReviewSpec,
  reasons: ReasonView[],
  { looked }: RecordInput,
  counts: string,
): CaptureRecordRow[] =>
  spec.weighted
    ? reasons.map((reason) => {
        const changed = reasonChanged(reason);
        return {
          part: `${KIND_PARTS.reason}: ${reason.title}`,
          proposed: reason.added ? EMPTY_VALUE : reason.proposedWeight,
          submitted: weightText(reason),
          howMuch: reasonResolution(reason, !!looked[reason.id]),
          source: reason.added
            ? "Reviewer"
            : proposer(reason.source, reason.confidence),
          lookedAt: reason.added || !!looked[reason.id] || changed,
          scope: reason.added || changed ? counts : EMPTY_VALUE,
        };
      })
    : [];

const partRows = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  counts: string,
): CaptureRecordRow[] =>
  parts.map((part) => ({
    part: `${KIND_PARTS.field}: ${part.label}`,
    proposed: orEmpty(part.proposed),
    submitted: orEmpty(part.value),
    howMuch: partResolution(part),
    source: partSource(part, spec),
    lookedAt: part.looked || partChanged(part),
    scope: part.value !== part.proposed ? counts : EMPTY_VALUE,
  }));

const nextTimeRows = (
  spec: ReviewSpec,
  { lesson }: RecordInput,
  counts: string,
): CaptureRecordRow[] => {
  if (!spec.nextTime) return [];
  const picked = spec.nextTime.options.find((option) => option.id === lesson);
  const draftCount = spec.nextTime.options.length;
  return [
    {
      part: KIND_PARTS.nextTime,
      proposed: draftCount ? `${draftCount} drafts` : EMPTY_VALUE,
      submitted: picked?.text ?? EMPTY_VALUE,
      howMuch: picked ? "Kept" : "Untouched",
      source: proposer(spec.proposedBy),
      lookedAt: !!picked,
      scope: picked ? counts : EMPTY_VALUE,
    },
  ];
};

export const buildRecord = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  reasons: ReasonView[],
  state: RecordInput,
): CaptureRecordRow[] => {
  const counts = spec.nextTime ? SCOPE_BY_ID[state.scope].counts : EMPTY_VALUE;
  return [
    decisionRow(spec, state, counts),
    ...reasonRows(spec, reasons, state, counts),
    ...partRows(spec, parts, counts),
    ...nextTimeRows(spec, state, counts),
  ];
};
