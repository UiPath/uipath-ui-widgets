import { KIND_PARTS, NOT_RELEVANT, SCOPE_BY_ID } from "../models/constants";
import type {
  CaptureLogEntry,
  ChangeRow,
  ReasonView,
  ReviewPart,
  ReviewSpec,
  ReviewState,
  WhyPick,
} from "../models/capture";
import type { PayloadReason, ReviewPayload } from "../models/payload";
import { buildChanges } from "./changes";
import { findOutcome } from "./outcomes";
import { partSetBy } from "./parts";
import { decidingOf, rationaleOf } from "./rationale";
import { buildRecord } from "./record";
import { resolveReasons } from "./reasons";
import { selectedConditions } from "./scope";
import { secondsSince } from "./time";
import { whyText } from "./whys";

export const addedReasonId = (count: number, now: number) =>
  `added-${count}-${now}`;

export const changeText = (row: ChangeRow) => {
  const subject = [KIND_PARTS[row.kind], row.label].filter(Boolean).join(" · ");
  const movement = row.from ? `${row.from} → ${row.to}` : row.to;
  const resolution = [row.how, row.note].filter(Boolean).join(" · ");
  return `${subject}: ${movement} (${resolution})`;
};

const sourceOf = (reason: ReasonView): Partial<PayloadReason> => {
  if (reason.added) return { added: true, source: "Reviewer" };
  return reason.source ? { source: reason.source } : {};
};

const confidenceOf = (reason: ReasonView): Partial<PayloadReason> =>
  !reason.added && reason.confidence !== undefined
    ? { sourceConfidence: reason.confidence }
    : {};

const notRelevantOf = (reason: ReasonView): Partial<PayloadReason> => {
  if (reason.weight !== NOT_RELEVANT || !reason.why) return {};
  return reason.why === "Other"
    ? { notRelevantWhy: reason.why, notRelevantNote: reason.note }
    : { notRelevantWhy: reason.why };
};

export const serializeReason = (reason: ReasonView): PayloadReason => ({
  id: reason.id,
  title: reason.title,
  detail: reason.detail,
  supports: reason.supports,
  proposedWeight: reason.proposedWeight,
  weight: reason.weight,
  ...sourceOf(reason),
  ...confidenceOf(reason),
  ...notRelevantOf(reason),
});

const reviewerReason = (
  id: string,
  title: string,
  detail: string,
  supports: string,
): PayloadReason => ({
  id,
  title,
  detail,
  supports,
  proposedWeight: "High",
  weight: "High",
  added: true,
  source: "Reviewer",
});

const explanationReasons = (
  parts: ReviewPart[],
  outcome: string | null,
  outcomeWhy: WhyPick,
  recommendedFor: string,
): PayloadReason[] => [
  ...parts
    .filter((part) => part.why)
    .map((part) =>
      reviewerReason(
        `why-${part.id}`,
        whyText({ why: part.why, note: part.note }),
        part.label,
        recommendedFor,
      ),
    ),
  ...(outcome && outcomeWhy.why
    ? [reviewerReason("why-outcome", whyText(outcomeWhy), "Outcome", outcome)]
    : []),
];

export type PayloadInput = {
  spec: ReviewSpec;
  parts: ReviewPart[];
  outcome: string | null;
  outcomeWhy: WhyPick;
  log: CaptureLogEntry[];
  reviewerId: string;
  startedAt: number;
} & Partial<
  Pick<
    ReviewState,
    "weights" | "reasonWhys" | "added" | "looked" | "lesson" | "scope" | "conds"
  >
>;

export const buildPayload = ({
  spec,
  parts,
  outcome,
  outcomeWhy,
  log,
  reviewerId,
  startedAt,
  looked = {},
  lesson = null,
  scope = "like",
  conds = {},
  ...reasonState
}: PayloadInput): ReviewPayload => {
  const views = resolveReasons(spec, parts, reasonState);
  const reasons = [
    ...views.map(serializeReason),
    ...explanationReasons(
      parts,
      outcome,
      outcomeWhy,
      outcome ?? spec.recommended,
    ),
  ];
  const deciding = decidingOf(findOutcome(spec.outcomes, outcome), reasons);
  const state = { outcome, looked, lesson, scope, conds };
  const picked = spec.nextTime?.options.find((option) => option.id === lesson);

  return {
    decision: outcome,
    reasons,
    rationaleText: rationaleOf(spec, parts, outcome, reasons, deciding),
    decidingReasons: deciding.map((reason) => reason.id),
    fields: parts.map((part) => ({
      id: part.id,
      label: part.label,
      kind: part.kind,
      byDecision: part.byOutcome ?? { [spec.recommended]: part.proposed },
      value: part.value,
      setBy: partSetBy(part),
    })),
    nextTimeId: picked?.id ?? "",
    nextTimeText: picked?.text ?? "",
    nextTimeScope: picked ? SCOPE_BY_ID[scope].value : "",
    nextTimeConditions:
      picked && scope === "like" ? selectedConditions(spec, conds) : [],
    changes: buildChanges(spec, parts, views, state).map(changeText),
    record: buildRecord(spec, parts, views, state),
    reviewerId,
    timeOnTaskSeconds: secondsSince(startedAt),
    changeLog: log,
  };
};
