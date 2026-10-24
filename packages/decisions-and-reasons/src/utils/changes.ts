import { SCOPES, WEIGHTS } from "../models/constants";
import type {
  ChangeRow,
  HowMuch,
  ReasonView,
  ReviewOutcome,
  ReviewPart,
  ReviewSaved,
  ReviewSeed,
  ReviewSpec,
  ReviewState,
  ScopeId,
  SetBy,
  WhyPick,
  Weight,
} from "../models/decision";

export const EMPTY_WHY: WhyPick = { why: null, note: "" };

export const DASH = "—";

export const lev = (a: string, b: string) => {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [
    i,
    ...Array(b.length).fill(0),
  ]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return d[a.length][b.length];
};

export const cut = (x: string, max: number) =>
  x.length > max ? `${x.slice(0, max)}...` : x;

export const scopeById = (scope: ScopeId) =>
  SCOPES.find((x) => x.id === scope)!;

export const whyText = (pick: WhyPick) =>
  pick.why === "Other" ? pick.note || "Other" : (pick.why ?? "");

export const weightHow = (from: string, to: string): HowMuch =>
  from === to
    ? "Kept"
    : to === "Not relevant"
      ? "Rejected"
      : Math.abs(
            WEIGHTS.indexOf(from as Weight) - WEIGHTS.indexOf(to as Weight),
          ) > 1
        ? "Rewritten"
        : "Lightly edited";

export const fieldHow = (
  proposed: string,
  value: string,
  looked: boolean,
): HowMuch => {
  if (value === proposed) return looked ? "Kept" : "Untouched";
  if (!value.trim()) return "Rejected";
  return lev(proposed, value) / Math.max(proposed.length, value.length, 1) <=
    0.3
    ? "Lightly edited"
    : "Rewritten";
};

export const partChanged = (p: ReviewPart) =>
  p.value !== (p.follows ?? p.proposed);

export const partSetBy = (p: ReviewPart): SetBy =>
  partChanged(p) ? "reviewer" : "model";

export const partHow = (p: ReviewPart): HowMuch =>
  fieldHow(p.proposed, p.value, p.looked);

export const recommendedId = (outcomes: ReviewOutcome[]) =>
  (outcomes.find((o) => o.recommended) ?? outcomes[0])?.id ?? "";

export const outcomeLabel = (spec: ReviewSpec, id: string) =>
  spec.outcomes.find((o) => o.id === id)?.label ?? id;

export const applyParts = (
  seeds: ReviewSeed[],
  state: Pick<ReviewState, "values" | "whys" | "looked" | "outcome">,
  recommended: string,
): ReviewPart[] =>
  seeds.map((s) => {
    const follows = s.byOutcome
      ? (s.byOutcome[state.outcome ?? recommended] ?? s.proposed)
      : undefined;
    return {
      ...s,
      follows,
      value: state.values[s.id] ?? follows ?? s.proposed,
      looked: !!state.looked[s.id],
      why: state.whys[s.id]?.why ?? null,
      note: state.whys[s.id]?.note ?? "",
    };
  });

type ReasonInput = Partial<
  Pick<ReviewState, "weights" | "reasonWhys" | "added">
>;

export const resolveReasons = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  { weights = {}, reasonWhys = {}, added = [] }: ReasonInput,
): ReasonView[] => [
  ...spec.reasons.map((r) => {
    const part = parts.find((p) => p.id === r.partId);
    const proposedWeight = r.weight ?? "High";
    return {
      ...r,
      supports: r.supports ?? spec.recommended,
      proposedWeight,
      weight:
        weights[r.id] ??
        (part && partChanged(part) ? "Not relevant" : proposedWeight),
      added: false,
      why: reasonWhys[r.id]?.why ?? null,
      note: reasonWhys[r.id]?.note ?? "",
    } as ReasonView;
  }),
  ...added.map(
    (r) =>
      ({
        ...r,
        supports: r.supports ?? spec.recommended,
        proposedWeight: "High",
        weight: weights[r.id] ?? "High",
        added: true,
        why: reasonWhys[r.id]?.why ?? null,
        note: reasonWhys[r.id]?.note ?? "",
      }) as ReasonView,
  ),
];

export const notRelevantReason = (r: ReasonView) =>
  r.weight === "Not relevant" && r.why
    ? r.why === "Other"
      ? r.note || "Other"
      : r.why
    : null;

export const weightText = (r: ReasonView) => {
  const reason = notRelevantReason(r);
  return reason ? `${r.weight} · ${reason}` : r.weight;
};

export const reasonChanged = (r: ReasonView) =>
  !r.added && r.weight !== r.proposedWeight;

export const hasChanges = (
  spec: ReviewSpec,
  state: Pick<ReviewState, "outcome" | "added">,
  reasons: ReasonView[],
) =>
  (state.outcome !== null && state.outcome !== spec.recommended) ||
  state.added.length > 0 ||
  reasons.some(reasonChanged);

export const scopeSentence = (scope: ScopeId, conditions: string[]) =>
  scope === "like"
    ? `claims that ${conditions.join(" and ") || "(no condition)"}`
    : scopeById(scope).label.toLowerCase();

export const selectedConditions = (
  spec: ReviewSpec,
  conds: Record<string, boolean>,
) =>
  (spec.nextTime?.conditions ?? [])
    .filter((k) => conds[k.id])
    .map((k) => k.label);

type ChangeInput = Pick<ReviewState, "outcome" | "lesson" | "scope" | "conds">;

export const buildChanges = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  reasons: ReasonView[],
  state: ChangeInput,
): ChangeRow[] => {
  const rows: ChangeRow[] = [];
  if (state.outcome && state.outcome !== spec.recommended)
    rows.push({
      kind: "decision",
      id: state.outcome,
      label: null,
      from: outcomeLabel(spec, spec.recommended),
      to: outcomeLabel(spec, state.outcome),
      how: "Rejected",
      note: spec.nextTime ? scopeById(state.scope).counts : undefined,
    });
  reasons
    .filter((r) => r.added)
    .forEach((r) =>
      rows.push({
        kind: "reason",
        id: r.id,
        label: r.title,
        from: null,
        to: `Added · ${r.weight}`,
        how: "Added",
      }),
    );
  if (spec.weighted)
    reasons.filter(reasonChanged).forEach((r) =>
      rows.push({
        kind: "reason",
        id: r.id,
        label: r.title,
        from: r.proposedWeight,
        to: weightText(r),
        how: weightHow(r.proposedWeight, r.weight),
      }),
    );
  parts.filter(partChanged).forEach((p) =>
    rows.push({
      kind: "field",
      id: p.id,
      label: p.label,
      from: cut(p.proposed, 60) || DASH,
      to: cut(p.value, 60) || DASH,
      how: partHow(p),
    }),
  );
  if (state.lesson)
    rows.push({
      kind: "nextTime",
      id: state.lesson,
      label: null,
      from: null,
      to: `Applies to ${scopeSentence(state.scope, selectedConditions(spec, state.conds))}`,
      how: "Kept",
    });
  return rows;
};

export const initialState = (
  spec: ReviewSpec,
  seeds: ReviewSeed[],
  readOnly: boolean,
  saved?: ReviewSaved,
): ReviewState => {
  const conditions = spec.nextTime?.conditions ?? [];
  return {
    values: readOnly ? { ...saved?.values } : {},
    whys: readOnly ? { ...saved?.whys } : {},
    looked: readOnly ? Object.fromEntries(seeds.map((s) => [s.id, true])) : {},
    outcome: readOnly ? (saved?.outcome ?? null) : null,
    outcomeWhy: readOnly
      ? { why: saved?.outcomeWhy ?? null, note: "" }
      : EMPTY_WHY,
    weights: readOnly ? { ...saved?.weights } : {},
    reasonWhys: readOnly ? { ...saved?.reasonWhys } : {},
    added: [],
    lesson: readOnly ? (saved?.lesson ?? null) : null,
    scope: readOnly ? (saved?.scope ?? "like") : "like",
    conds: readOnly
      ? Object.fromEntries(
          (saved?.conditions ?? []).map((c) => [
            conditions.find((k) => k.label === c)?.id ?? c,
            true,
          ]),
        )
      : Object.fromEntries(conditions.slice(0, 2).map((k) => [k.id, true])),
  };
};
