import { KIND_PARTS } from "../models/constants";
import type {
  CaptureLogEntry,
  CaptureRecordRow,
  ChangeRow,
  PayloadReason,
  ReasonView,
  ReviewOutcome,
  ReviewPart,
  ReviewPayload,
  ReviewSpec,
  ReviewState,
  WhyPick,
} from "../models/decision";
import {
  DASH,
  buildChanges,
  outcomeLabel,
  partChanged,
  partHow,
  partSetBy,
  reasonChanged,
  resolveReasons,
  scopeById,
  selectedConditions,
  weightHow,
  weightText,
  whyText,
} from "./changes";

export const addedReasonId = (count: number, now: number) =>
  `added-${count}-${now}`;

const proposer = (name?: string, confidence?: number) =>
  name ? (confidence !== undefined ? `${name} · ${confidence}%` : name) : "";

export const changeText = (row: ChangeRow) =>
  `${KIND_PARTS[row.kind]}${row.label ? ` · ${row.label}` : ""}: ${row.from ? `${row.from} → ` : ""}${row.to} (${row.how}${row.note ? ` · ${row.note}` : ""})`;

export const serializeReason = (r: ReasonView): PayloadReason => {
  const item: PayloadReason = {
    id: r.id,
    title: r.title,
    detail: r.detail,
    supports: r.supports,
    proposedWeight: r.proposedWeight,
    weight: r.weight,
  };
  if (r.added) {
    item.added = true;
    item.source = "Reviewer";
  } else if (r.source) item.source = r.source;
  if (!r.added && r.confidence !== undefined)
    item.sourceConfidence = r.confidence;
  if (r.weight === "Not relevant" && r.why) {
    item.notRelevantWhy = r.why;
    if (r.why === "Other") item.notRelevantNote = r.note;
  }
  return item;
};

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

export const decidingOf = (
  outcome: ReviewOutcome | undefined,
  reasons: PayloadReason[],
) => {
  if (!outcome) return [];
  const live = reasons.filter(
    (r) =>
      r.weight !== "Not relevant" &&
      (outcome.blendsReasons || r.supports === outcome.id),
  );
  const top = live.filter((r) => r.weight === "High");
  return top.length ? top : live.slice(0, 2);
};

const rationaleOf = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  outcome: string | null,
  reasons: PayloadReason[],
  deciding: PayloadReason[],
) => {
  if (!outcome) return "";
  const head = `${outcomeLabel(spec, outcome)}.`;
  if (spec.weighted) {
    const off = reasons
      .filter((r) => r.weight === "Not relevant")
      .map((r) => r.title);
    return [
      head,
      deciding.length &&
        `Decided by: ${deciding.map((r) => r.title).join("; ")}.`,
      off.length && `Set aside as not relevant: ${off.join("; ")}.`,
    ]
      .filter(Boolean)
      .join(" ");
  }
  const corrected = parts.filter(partChanged).map((p) => p.label);
  const because = reasons.filter((r) => r.added).map((r) => r.title);
  return `${head}${corrected.length ? ` Corrected: ${corrected.join("; ")}.` : ""}${because.length ? ` Because: ${because.join("; ")}.` : ""}`;
};

type RecordInput = Pick<ReviewState, "outcome" | "looked" | "lesson" | "scope">;

const buildRecord = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  reasons: ReasonView[],
  state: RecordInput,
): CaptureRecordRow[] => {
  const { outcome, looked, lesson, scope } = state;
  const counts = spec.nextTime ? scopeById(scope).counts : DASH;
  const rows: CaptureRecordRow[] = [
    {
      part: KIND_PARTS.decision,
      proposed: outcomeLabel(spec, spec.recommended),
      submitted: outcome ? outcomeLabel(spec, outcome) : DASH,
      howMuch: !outcome
        ? "Untouched"
        : outcome === spec.recommended
          ? "Kept"
          : "Rejected",
      source: proposer(spec.proposedBy),
      lookedAt: !!outcome,
      scope: outcome && outcome !== spec.recommended ? counts : DASH,
    },
  ];
  if (spec.weighted)
    reasons.forEach((r) => {
      const changed = reasonChanged(r);
      rows.push({
        part: `${KIND_PARTS.reason}: ${r.title}`,
        proposed: r.added ? DASH : r.proposedWeight,
        submitted: weightText(r),
        howMuch: r.added
          ? "Added"
          : changed
            ? weightHow(r.proposedWeight, r.weight)
            : looked[r.id]
              ? "Kept"
              : "Untouched",
        source: r.added ? "Reviewer" : proposer(r.source, r.confidence),
        lookedAt: r.added || !!looked[r.id] || changed,
        scope: r.added || changed ? counts : DASH,
      });
    });
  parts.forEach((p) =>
    rows.push({
      part: `${KIND_PARTS.field}: ${p.label}`,
      proposed: p.proposed || DASH,
      submitted: p.value || DASH,
      howMuch: partHow(p),
      source: partChanged(p)
        ? "Reviewer"
        : p.follows !== undefined && p.follows !== p.proposed
          ? "Follows decision"
          : proposer(p.source ?? spec.proposedBy, p.confidence),
      lookedAt: p.looked || partChanged(p),
      scope: p.value !== p.proposed ? counts : DASH,
    }),
  );
  if (spec.nextTime) {
    const picked = spec.nextTime.options.find((x) => x.id === lesson);
    rows.push({
      part: KIND_PARTS.nextTime,
      proposed: spec.nextTime.options.length
        ? `${spec.nextTime.options.length} drafts`
        : DASH,
      submitted: picked?.text ?? DASH,
      howMuch: picked ? "Kept" : "Untouched",
      source: proposer(spec.proposedBy),
      lookedAt: !!picked,
      scope: picked ? counts : DASH,
    });
  }
  return rows;
};

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
  ...rest
}: PayloadInput): ReviewPayload => {
  const views = resolveReasons(spec, parts, rest);
  const recommendedFor = outcome ?? spec.recommended;
  const reasons: PayloadReason[] = [
    ...views.map(serializeReason),
    ...parts
      .filter((p) => p.why)
      .map((p) =>
        reviewerReason(
          `why-${p.id}`,
          whyText({ why: p.why, note: p.note }),
          p.label,
          recommendedFor,
        ),
      ),
    ...(outcome && outcomeWhy.why
      ? [reviewerReason("why-outcome", whyText(outcomeWhy), "Outcome", outcome)]
      : []),
  ];
  const deciding = decidingOf(
    spec.outcomes.find((o) => o.id === outcome),
    reasons,
  );
  const state = { outcome, looked, lesson, scope, conds };
  const picked = spec.nextTime?.options.find((x) => x.id === lesson);

  return {
    decision: outcome,
    reasons,
    rationaleText: rationaleOf(spec, parts, outcome, reasons, deciding),
    decidingReasons: deciding.map((r) => r.id),
    fields: parts.map((p) => ({
      id: p.id,
      label: p.label,
      kind: p.kind,
      byDecision: p.byOutcome ?? { [spec.recommended]: p.proposed },
      value: p.value,
      setBy: partSetBy(p),
    })),
    nextTimeId: picked?.id ?? "",
    nextTimeText: picked?.text ?? "",
    nextTimeScope: picked ? scopeById(scope).value : "",
    nextTimeConditions:
      picked && scope === "like" ? selectedConditions(spec, conds) : [],
    changes: buildChanges(spec, parts, views, state).map(changeText),
    record: buildRecord(spec, parts, views, state),
    reviewerId,
    timeOnTaskSeconds: Math.round((Date.now() - startedAt) / 1000),
    changeLog: log,
  };
};
