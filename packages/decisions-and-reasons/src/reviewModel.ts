import { useRef, useState } from "react";
import { DECISIONS, KIND_PARTS, SCOPES, WEIGHTS } from "./types";
import type {
  CaptureLogEntry,
  CaptureRecordRow,
  ChangeRow,
  ClaimData,
  ClaimReason,
  DecisionCaptureCodedActionAppPayload,
  DecisionCaptureCodedActionAppProps,
  FinalDetailField,
  HowMuch,
  ReasonOutcome,
  ReasonState,
  RecordEntry,
  RecordSource,
  ReviewContext,
  ReviewEvent,
  ReviewState,
  ScopeId,
  SetBy,
  PartSeed,
  UseCasePart,
  UseCasePayload,
  UseCaseSaved,
  UseCaseSpec,
  Weight,
  WhyPick,
} from "./types";

const lev = (a: string, b: string) => {
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

export const byD = (m: Record<string, string> | undefined, d: string) =>
  m?.[d] ?? m?.[d.charAt(0).toLowerCase() + d.slice(1)] ?? "";

export const decisionLabel = (id: string) =>
  DECISIONS.find((d) => d.id === id)?.t ?? id;

export const supportsLabel = (s: string) =>
  s === "ApprovePartial" ? "Approve partial" : s;

export const scopeById = (scope: ScopeId) =>
  SCOPES.find((x) => x.id === scope)!;

export const fieldLookKey = (id: string) => `f:${id}`;

export const lookedLabel = (data: ClaimData, id: string) =>
  data.reasons.find((r) => r.id === id)?.title ?? id;

export const weightBars = (w: Weight) =>
  w === "High" ? 3 : w === "Medium" ? 2 : w === "Low" ? 1 : 0;

const stepsApart = (a: string, b: string) =>
  Math.abs(WEIGHTS.indexOf(a as Weight) - WEIGHTS.indexOf(b as Weight));

const weightHow = (from: string, to: string): HowMuch =>
  from === to
    ? "Kept"
    : to === "Not relevant"
      ? "Rejected"
      : stepsApart(from, to) > 1
        ? "Rewritten"
        : "Lightly edited";

const weightOutcome = (r: ReasonState): ReasonOutcome => ({
  weight: r.w,
  reason:
    r.w === "Not relevant" && r.why
      ? r.why === "Other"
        ? r.note || "Other"
        : r.why
      : null,
});

const matches = (supports: string, d: string) =>
  d === "ApprovePartial" ? true : supports === d;

export const decidingReasons = (d: string, rr: ReasonState[]) => {
  const live = rr.filter(
    (r) => r.w !== "Not relevant" && matches(r.supports, d),
  );
  const top = live.filter((r) => r.w === "High");
  return top.length ? top : live.slice(0, 2);
};

export const fieldProposed = (f: FinalDetailField, agent: string) =>
  byD(f.byDecision, agent);

export const fieldValue = (
  f: FinalDetailField,
  state: ReviewState,
  agent: string,
) => state.fieldVals[f.id] ?? byD(f.byDecision, state.decision ?? agent);

export const fieldHow = (
  proposed: string,
  v: string,
  wasLooked: boolean,
): HowMuch => {
  if (v === proposed) return wasLooked ? "Kept" : "Untouched";
  if (!v.trim()) return "Rejected";
  return lev(proposed, v) / Math.max(proposed.length, v.length, 1) <= 0.3
    ? "Lightly edited"
    : "Rewritten";
};

export const weightChangesOf = (rs: ReasonState[]) =>
  rs.filter((r) => !r.added && r.w !== r.proposedWeight);

export const addedReasonsOf = (rs: ReasonState[]) => rs.filter((r) => r.added);

export const hasChanges = (state: ReviewState, agent: string) =>
  (state.decision !== null && state.decision !== agent) ||
  weightChangesOf(state.rs).length > 0 ||
  addedReasonsOf(state.rs).length > 0;

export const initialReasons = (
  data: ClaimData,
  readOnly: boolean,
): ReasonState[] =>
  data.reasons.map((r) => ({
    ...r,
    w: ((readOnly ? r.weight : undefined) ?? r.proposedWeight) as Weight,
    why: readOnly ? (r.notRelevantWhy ?? null) : null,
    note: readOnly ? (r.notRelevantNote ?? "") : "",
  }));

export const initialState = (
  data: ClaimData,
  readOnly: boolean,
): ReviewState => ({
  decision: readOnly ? (data.decision ?? null) : null,
  rs: initialReasons(data, readOnly),
  fieldVals: Object.fromEntries(
    (readOnly ? (data.fields ?? []) : [])
      .filter((f) => f.value !== undefined)
      .map((f) => [f.id, f.value as string]),
  ),
  lesson: readOnly ? (data.nextTimeId ?? null) : null,
  scope: readOnly
    ? (SCOPES.find((x) => x.value === data.nextTimeScope)?.id ?? "like")
    : "like",
  conds: readOnly
    ? Object.fromEntries(
        (data.nextTimeConditions ?? []).map((c) => [
          data.conditionOptions.find((k) => k.label === c)?.id ?? c,
          true,
        ]),
      )
    : Object.fromEntries(
        data.conditionOptions.slice(0, 2).map((k) => [k.id, true]),
      ),
});

export const selectedConditions = (state: ReviewState, data: ClaimData) =>
  data.conditionOptions.filter((k) => state.conds[k.id]).map((k) => k.label);

export const buildChangeRows = (
  state: ReviewState,
  { data, looked }: ReviewContext,
): ChangeRow[] => {
  const agent = data.recommendedDecision;
  const rows: ChangeRow[] = [];
  if (state.decision && state.decision !== agent)
    rows.push({
      kind: "decision",
      id: state.decision,
      label: null,
      from: agent,
      to: state.decision,
      howMuch: "Rejected",
      scope: state.scope,
    });
  addedReasonsOf(state.rs).forEach((r) =>
    rows.push({
      kind: "reason",
      id: r.id,
      label: r.title,
      from: null,
      to: { weight: r.w, reason: null },
      howMuch: "Added",
      scope: state.scope,
    }),
  );
  weightChangesOf(state.rs).forEach((r) =>
    rows.push({
      kind: "reason",
      id: r.id,
      label: r.title,
      from: r.proposedWeight,
      to: weightOutcome(r),
      howMuch: weightHow(r.proposedWeight, r.w),
      scope: state.scope,
    }),
  );
  (data.fields ?? []).forEach((f) => {
    const v = fieldValue(f, state, agent);
    const proposed = fieldProposed(f, agent);
    if (state.fieldVals[f.id] !== undefined && v !== proposed)
      rows.push({
        kind: "field",
        id: f.id,
        label: f.label,
        from: proposed,
        to: v,
        howMuch: fieldHow(proposed, v, !!looked[fieldLookKey(f.id)]),
        scope: state.scope,
      });
  });
  if (state.lesson)
    rows.push({
      kind: "nextTime",
      id: state.lesson,
      label: null,
      from: null,
      to: {
        scope: state.scope,
        conditions: selectedConditions(state, data),
      },
      howMuch: "Kept",
      scope: state.scope,
    });
  return rows;
};

export const buildRecordRows = (
  state: ReviewState,
  { data, looked }: ReviewContext,
): RecordEntry[] => {
  const agent = data.recommendedDecision;
  const d = state.decision;
  const proposer: RecordSource | null = data.proposedBy
    ? { kind: "proposer", name: data.proposedBy }
    : null;
  const rows: RecordEntry[] = [];
  rows.push({
    kind: "decision",
    id: "decision",
    label: null,
    proposed: agent,
    submitted: d,
    howMuch: !d ? "Untouched" : d === agent ? "Kept" : "Rejected",
    source: proposer,
    lookedAt: !!d,
    scope: d && d !== agent ? state.scope : null,
  });
  state.rs.forEach((r) =>
    rows.push(
      r.added
        ? {
            kind: "reason",
            id: r.id,
            label: r.title,
            proposed: null,
            submitted: { weight: r.w, reason: null },
            howMuch: "Added",
            source: { kind: "reviewer" },
            lookedAt: true,
            scope: state.scope,
          }
        : {
            kind: "reason",
            id: r.id,
            label: r.title,
            proposed: r.proposedWeight,
            submitted: weightOutcome(r),
            howMuch:
              r.w !== r.proposedWeight
                ? weightHow(r.proposedWeight, r.w)
                : looked[r.id]
                  ? "Kept"
                  : "Untouched",
            source: r.source
              ? {
                  kind: "proposer",
                  name: r.source,
                  confidence: r.sourceConfidence,
                }
              : null,
            lookedAt: !!looked[r.id] || r.w !== r.proposedWeight,
            scope: r.w !== r.proposedWeight ? state.scope : null,
          },
    ),
  );
  (data.fields ?? []).forEach((f) => {
    const v = fieldValue(f, state, agent);
    const proposed = fieldProposed(f, agent);
    rows.push({
      kind: "field",
      id: f.id,
      label: f.label,
      proposed,
      submitted: v,
      howMuch: fieldHow(proposed, v, !!looked[fieldLookKey(f.id)]),
      source:
        state.fieldVals[f.id] === undefined && d && d !== agent
          ? { kind: "followsDecision" }
          : proposer,
      lookedAt:
        !!looked[fieldLookKey(f.id)] || state.fieldVals[f.id] !== undefined,
      scope: v !== proposed ? state.scope : null,
    });
  });
  const lesson = data.nextTimeOptions.find((x) => x.id === state.lesson);
  rows.push({
    kind: "nextTime",
    id: "nextTime",
    label: null,
    proposed: data.nextTimeOptions.length,
    submitted: lesson ? lesson.id : null,
    howMuch: lesson ? "Kept" : "Untouched",
    source: proposer,
    lookedAt: !!lesson,
    scope: lesson ? state.scope : null,
  });
  return rows;
};

export const DASH = "—";

export const addedReasonId = (count: number, now: number) =>
  `added-${count}-${now}`;

const outcomeText = ({ weight, reason }: ReasonOutcome) =>
  reason ? `${weight} · ${reason}` : weight;

export const sourceText = (source: RecordSource | null) => {
  if (!source) return "";
  if (source.kind === "reviewer") return "Reviewer";
  if (source.kind === "followsDecision") return "Follows decision";
  return source.confidence !== undefined
    ? `${source.name} · ${source.confidence}%`
    : source.name;
};

export const cut = (x: string, max: number) =>
  x.length > max ? `${x.slice(0, max)}...` : x;

const scopeSentence = (scope: ScopeId, conditions: string[]) =>
  scope === "like"
    ? `claims that ${conditions.join(" and ") || "(no condition)"}`
    : scopeById(scope).label.toLowerCase();

const changeText = (row: ChangeRow) => {
  const subject = row.label ? ` · ${row.label}` : "";
  let from = "";
  let to = "";
  let how: string = row.howMuch;
  if (row.kind === "decision") {
    from = decisionLabel(row.from);
    to = decisionLabel(row.to);
    how = `${row.howMuch} · ${scopeById(row.scope).counts}`;
  } else if (row.kind === "reason") {
    from = row.from ?? "";
    to =
      row.howMuch === "Added"
        ? `Added · ${row.to.weight}`
        : outcomeText(row.to);
  } else if (row.kind === "field") {
    from = cut(row.from, 60) || DASH;
    to = cut(row.to, 60) || DASH;
  } else {
    to = `Applies to ${scopeSentence(row.to.scope, row.to.conditions)}`;
  }
  return `${KIND_PARTS[row.kind]}${subject}: ${from ? `${from} → ` : ""}${to}${how ? ` (${how})` : ""}`;
};

export const serializeChanges = (rows: ChangeRow[]): string[] =>
  rows.map(changeText);

const recordValues = (entry: RecordEntry, data: ClaimData) => {
  if (entry.kind === "decision")
    return {
      part: KIND_PARTS.decision,
      proposed: decisionLabel(entry.proposed),
      submitted: entry.submitted ? decisionLabel(entry.submitted) : DASH,
    };
  if (entry.kind === "reason")
    return {
      part: `${KIND_PARTS.reason}: ${entry.label}`,
      proposed: entry.proposed === null ? DASH : entry.proposed,
      submitted: outcomeText(entry.submitted),
    };
  if (entry.kind === "field")
    return {
      part: `${KIND_PARTS.field}: ${entry.label}`,
      proposed: entry.proposed || DASH,
      submitted: entry.submitted || DASH,
    };
  return {
    part: KIND_PARTS.nextTime,
    proposed: entry.proposed ? `${entry.proposed} drafts` : DASH,
    submitted:
      data.nextTimeOptions.find((x) => x.id === entry.submitted)?.text ?? DASH,
  };
};

export const serializeRecord = (
  entries: RecordEntry[],
  data: ClaimData,
): CaptureRecordRow[] =>
  entries.map((entry) => ({
    ...recordValues(entry, data),
    howMuch: entry.howMuch,
    source: sourceText(entry.source),
    lookedAt: entry.lookedAt,
    scope: entry.scope ? scopeById(entry.scope).counts : DASH,
  }));

const eventText = (event: ReviewEvent, data: ClaimData) => {
  if (event.kind === "decision")
    return `Decision: ${decisionLabel(event.to ?? "")}`;
  if (event.kind === "weight")
    return `Reason weight: ${event.label}, ${event.from} → ${event.to}`;
  if (event.kind === "why")
    return `Why not relevant: ${event.label}, ${event.to}`;
  if (event.kind === "reasonAdded")
    return `Reason added: ${event.label}, supports ${decisionLabel(event.to ?? "")}`;
  if (event.kind === "reasonRemoved") return `Reason removed: ${event.label}`;
  if (event.kind === "nextTime")
    return `Next time ${event.to ? "picked" : "cleared"}: ${data.nextTimeOptions.find((x) => x.id === event.targetId)?.text}`;
  return `Scope: ${SCOPES.find((x) => x.id === event.targetId)?.label}`;
};

export const serializeLog = (
  events: ReviewEvent[],
  data: ClaimData,
): CaptureLogEntry[] =>
  events.map((event, i) => ({
    step: i + 1,
    what: eventText(event, data),
    atSecond: event.at,
    lookedAt: event.looked.map((id) => lookedLabel(data, id)),
  }));

const rationaleText = (d: string | null, rr: ReasonState[]) => {
  if (!d) return "";
  const deciders = decidingReasons(d, rr).map((r) => r.title);
  const off = rr.filter((r) => r.w === "Not relevant").map((r) => r.title);
  return `${decisionLabel(d)}. ${deciders.length ? `Decided by: ${deciders.join("; ")}.` : ""}${off.length ? ` Set aside as not relevant: ${off.join("; ")}.` : ""}`.trim();
};

const serializeReasons = (rs: ReasonState[]): ClaimReason[] =>
  rs.map((r) => {
    const item: ClaimReason = {
      id: r.id,
      title: r.title,
      detail: r.detail,
      supports: r.supports,
      proposedWeight: r.proposedWeight,
      weight: r.w,
    };
    if (r.added) {
      item.added = true;
      item.source = "Reviewer";
    } else if (r.source) item.source = r.source;
    if (!r.added && r.sourceConfidence !== undefined)
      item.sourceConfidence = r.sourceConfidence;
    if (r.w === "Not relevant" && r.why) {
      item.notRelevantWhy = r.why;
      if (r.why === "Other") item.notRelevantNote = r.note;
    }
    return item;
  });

export const buildPayload = (
  current: ReviewState,
  over: Partial<ReviewState>,
  ctx: ReviewContext,
  changes: ChangeRow[],
): DecisionCaptureCodedActionAppPayload => {
  const { data, log, reviewerId, startedAt } = ctx;
  const agent = data.recommendedDecision;
  const next: ReviewState = { ...current, ...over };
  const d = next.decision;
  const lessonObj = data.nextTimeOptions.find((x) => x.id === next.lesson);
  return {
    decision: d,
    reasons: serializeReasons(next.rs),
    rationaleText: rationaleText(d, next.rs),
    decidingReasons: d ? decidingReasons(d, next.rs).map((r) => r.id) : [],
    fields: (data.fields ?? []).map((f) => ({
      ...f,
      value: next.fieldVals[f.id] ?? byD(f.byDecision, d ?? agent),
    })),
    nextTimeId: next.lesson ?? "",
    nextTimeText: lessonObj?.text ?? "",
    nextTimeScope: next.lesson ? scopeById(next.scope).value : "",
    nextTimeConditions:
      next.lesson && next.scope === "like"
        ? data.conditionOptions
            .filter((k) => next.conds[k.id])
            .map((k) => k.label)
        : [],
    changes: serializeChanges(changes),
    record: serializeRecord(
      buildRecordRows({ ...next, scope: current.scope }, ctx),
      data,
    ),
    reviewerId,
    timeOnTaskSeconds: Math.round((Date.now() - startedAt) / 1000),
    changeLog: serializeLog(log, data),
  };
};

export type DecisionCaptureCodedActionAppModel = ReturnType<
  typeof useDecisionCaptureCodedActionApp
>;

type EventInput = Omit<ReviewEvent, "at" | "looked">;

export function useDecisionCaptureCodedActionApp({
  data,
  readOnly = false,
  reviewerId = "",
  onChange,
  onComplete,
}: DecisionCaptureCodedActionAppProps) {
  const agent = data.recommendedDecision;
  const [state, setState] = useState<ReviewState>(() =>
    initialState(data, readOnly),
  );
  const [looked, setLooked] = useState<Record<string, boolean>>({});
  const [log, setLog] = useState<ReviewEvent[]>([]);
  const [done, setDone] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  const ctx: ReviewContext = { data, looked, log, reviewerId, startedAt };
  const changes = buildChangeRows(state, ctx);
  const elapsedSeconds = () => Math.round((Date.now() - startedAt) / 1000);

  const lookAt = (id: string) =>
    setLooked((o) => (o[id] ? o : { ...o, [id]: true }));

  const emit = (over: Partial<ReviewState>) =>
    onChange?.(buildPayload(state, over, ctx, changes));

  const record = (event: EventInput) => {
    const entry: ReviewEvent = {
      ...event,
      at: elapsedSeconds(),
      looked: Object.keys(looked),
    };
    setLog((o) => [...o, entry]);
  };

  const setReasons = (rs: ReasonState[], event: EventInput) => {
    setState({ ...state, rs });
    record(event);
    emit({ rs });
  };

  const setWeight = (i: number, w: Weight) => {
    const r = state.rs[i];
    setReasons(
      state.rs.map((x, j) =>
        j === i ? { ...x, w, why: w === "Not relevant" ? x.why : null } : x,
      ),
      {
        kind: "weight",
        targetId: r.id,
        label: r.title,
        from: r.w,
        to: w,
      },
    );
  };

  const toggleWhy = (i: number, why: string) => {
    const r = state.rs[i];
    setReasons(
      state.rs.map((x, j) =>
        j === i ? { ...x, why: x.why === why ? null : why } : x,
      ),
      {
        kind: "why",
        targetId: r.id,
        label: r.title,
        from: r.why,
        to: why,
      },
    );
  };

  const editReasonNote = (i: number, text: string) =>
    setState((s) => ({
      ...s,
      rs: s.rs.map((x, j) => (j === i ? { ...x, note: text } : x)),
    }));

  const addReason = (title: string, picked: string) => {
    const supports = picked || state.decision || agent;
    const r: ReasonState = {
      id: addedReasonId(state.rs.length + 1, Date.now()),
      title,
      detail: "",
      supports,
      proposedWeight: "High",
      weight: "High",
      added: true,
      w: "High",
      why: null,
      note: "",
    };
    setReasons([...state.rs, r], {
      kind: "reasonAdded",
      targetId: r.id,
      label: title,
      from: null,
      to: supports,
    });
  };

  const removeReason = (i: number) => {
    const gone = state.rs[i];
    setReasons(
      state.rs.filter((_, j) => j !== i),
      {
        kind: "reasonRemoved",
        targetId: gone.id,
        label: gone.title,
        from: null,
        to: null,
      },
    );
  };

  const choose = (id: string) => {
    setState({ ...state, decision: id });
    record({
      kind: "decision",
      targetId: id,
      label: null,
      from: state.decision,
      to: id,
    });
    emit({ decision: id });
  };

  const editField = (id: string, value: string) =>
    setState((s) => ({ ...s, fieldVals: { ...s.fieldVals, [id]: value } }));

  const commitField = (id: string) => {
    if (state.fieldVals[id] === undefined) return;
    lookAt(fieldLookKey(id));
    emit({ fieldVals: state.fieldVals });
  };

  const pickLesson = (id: string) => {
    const lesson = state.lesson === id ? null : id;
    setState({ ...state, lesson });
    record({
      kind: "nextTime",
      targetId: id,
      label: null,
      from: state.lesson,
      to: lesson,
    });
    emit({ lesson });
  };

  const chooseScope = (scope: ScopeId) => {
    setState({ ...state, scope });
    record({
      kind: "scope",
      targetId: scope,
      label: null,
      from: state.scope,
      to: scope,
    });
    emit({ scope });
  };

  const toggleCondition = (id: string) => {
    const conds = { ...state.conds, [id]: !state.conds[id] };
    setState({ ...state, conds });
    emit({ conds });
  };

  const submit = async () => {
    if (!state.decision) return;
    setBusy(true);
    setError(null);
    try {
      await onComplete(state.decision, buildPayload(state, {}, ctx, changes));
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Could not complete the task. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    agent,
    data,
    fields: data.fields ?? [],
    root,
    setRoot,
    state,
    log,
    changes,
    done,
    busy,
    error,
    locked: done || readOnly,
    hasChange: hasChanges(state, agent),
    elapsedSeconds,
    recordRows: () => buildRecordRows(state, ctx),
    lookAt,
    setWeight,
    toggleWhy,
    editReasonNote,
    addReason,
    removeReason,
    choose,
    editField,
    commitField,
    pickLesson,
    chooseScope,
    toggleCondition,
    submit,
  };
}

export const REASON_CAPTURE_WHYS = ["Wrong", "Outdated", "Other"] as const;

const CAPTURE_CONTROLS = new Set(["dropdown", "radioGroup", "checkbox"]);

export interface ReasonCaptureField {
  id: string;
  direction: string;
  controlType?: string;
  defaultValue?: string | string[];
  [extra: string]: unknown;
}

export interface ReasonCaptureSchema {
  fields: ReasonCaptureField[];
  [extra: string]: unknown;
}

export interface ReasonCaptureOptions {
  /** Label of each added field. Defaults to "Why? (optional)". */
  label?: string;
  /** Options of each added dropdown. Defaults to Wrong, Outdated, Other. */
  whys?: readonly string[];
  /** Replaces the default id, `why_<fieldId>`. */
  idFor?: (fieldId: string) => string;
}

export interface ReasonCaptureResult<S extends ReasonCaptureSchema> {
  schema: S;
  /** The fields that were added, in schema order. */
  added: ReasonCaptureField[];
}

/**
 * Adds one optional "Why?" dropdown under every select field of a QuickForm schema.
 * The field is hidden by a rule until the value differs from the field's defaultValue,
 * is never required, and is skipped for input-direction fields and non-select controls.
 */
export function withReasonCapture<S extends ReasonCaptureSchema>(
  schema: S,
  options: ReasonCaptureOptions = {},
): ReasonCaptureResult<S> {
  const label = options.label ?? "Why? (optional)";
  const whys = options.whys ?? REASON_CAPTURE_WHYS;
  const idFor = options.idFor ?? ((fieldId: string) => `why_${fieldId}`);
  const added: ReasonCaptureField[] = [];

  const fields = schema.fields.flatMap((field) => {
    if (
      field.direction === "input" ||
      !CAPTURE_CONTROLS.has(String(field.controlType))
    ) {
      return [field];
    }

    const id = idFor(field.id);
    const why: ReasonCaptureField = {
      id,
      type: "string",
      label,
      direction: "output",
      controlType: "dropdown",
      options: whys.map((value) => ({
        id: `${id}-${value}`,
        value,
        label: value,
      })),
      rules: [
        {
          id: `rule_${id}`,
          conditions: [{ when: field.id, isNot: field.defaultValue }],
          effects: { visible: true },
        },
      ],
    };
    added.push(why);
    return [field, why];
  });

  return { schema: { ...schema, fields }, added };
}

export const whyText = (pick: WhyPick) =>
  pick.why === "Other" ? pick.note || "Other" : (pick.why ?? "");

export const partChanged = (p: UseCasePart) => p.value !== p.proposed;

export const partSetBy = (p: UseCasePart): SetBy =>
  partChanged(p) ? "reviewer" : "model";

export const partHow = (p: UseCasePart): HowMuch =>
  fieldHow(p.proposed, p.value, p.looked);

export const outcomeLabel = (spec: UseCaseSpec, id: string) =>
  spec.outcomes.find((o) => o.id === id)?.label ?? id;

export type UseCaseSnapshot = {
  values: Record<string, string>;
  whys: Record<string, WhyPick>;
  looked: Record<string, boolean>;
  outcome: string | null;
  outcomeWhy: WhyPick;
};

export const applyParts = (
  seeds: PartSeed[],
  values: Record<string, string>,
  whys: Record<string, WhyPick>,
  looked: Record<string, boolean>,
): UseCasePart[] =>
  seeds.map((s) => ({
    ...s,
    value: values[s.id] ?? s.proposed,
    looked: !!looked[s.id],
    why: whys[s.id]?.why ?? null,
    note: whys[s.id]?.note ?? "",
  }));

const reviewerReason = (
  id: string,
  title: string,
  detail: string,
  supports: string,
): ClaimReason => ({
  id,
  title,
  detail,
  supports,
  proposedWeight: "High",
  weight: "High",
  added: true,
  source: "Reviewer",
});

const caseReasons = (
  spec: UseCaseSpec,
  parts: UseCasePart[],
  outcome: string | null,
  outcomeWhy: WhyPick,
): ClaimReason[] => {
  const model = spec.reasons.map((r): ClaimReason => {
    const part = parts.find((p) => p.id === r.partId);
    const item: ClaimReason = {
      id: r.id,
      title: r.title,
      detail: r.detail,
      supports: part?.proposed ?? spec.recommended,
      proposedWeight: "High",
      weight: part && partChanged(part) ? "Not relevant" : "High",
    };
    if (r.source) item.source = r.source;
    if (r.confidence !== undefined) item.sourceConfidence = r.confidence;
    return item;
  });
  const fromParts = parts
    .filter((p) => p.why)
    .map((p) =>
      reviewerReason(
        `why-${p.id}`,
        whyText({ why: p.why, note: p.note }),
        p.label,
        p.value,
      ),
    );
  const fromOutcome =
    outcome && outcomeWhy.why
      ? [reviewerReason("why-outcome", whyText(outcomeWhy), "Outcome", outcome)]
      : [];
  return [...model, ...fromParts, ...fromOutcome];
};

const caseRationale = (
  spec: UseCaseSpec,
  parts: UseCasePart[],
  outcome: string | null,
  reasons: ClaimReason[],
) => {
  if (!outcome) return "";
  const corrected = parts.filter(partChanged).map((p) => p.label);
  const because = reasons.filter((r) => r.added).map((r) => r.title);
  return `${outcomeLabel(spec, outcome)}.${corrected.length ? ` Corrected: ${corrected.join("; ")}.` : ""}${because.length ? ` Because: ${because.join("; ")}.` : ""}`;
};

const caseChanges = (
  spec: UseCaseSpec,
  parts: UseCasePart[],
  outcome: string | null,
) => [
  ...(outcome && outcome !== spec.recommended
    ? [
        `${KIND_PARTS.decision}: ${outcomeLabel(spec, spec.recommended)} → ${outcomeLabel(spec, outcome)} (Rejected)`,
      ]
    : []),
  ...parts
    .filter(partChanged)
    .map(
      (p) =>
        `${KIND_PARTS.field} · ${p.label}: ${cut(p.proposed, 60) || DASH} → ${cut(p.value, 60) || DASH} (${partHow(p)})`,
    ),
];

const caseRecord = (
  spec: UseCaseSpec,
  parts: UseCasePart[],
  outcome: string | null,
): CaptureRecordRow[] => {
  const proposer = (name?: string, confidence?: number) =>
    name ? sourceText({ kind: "proposer", name, confidence }) : "";
  return [
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
      scope: DASH,
    },
    ...parts.map((p) => ({
      part: `${KIND_PARTS.field}: ${p.label}`,
      proposed: p.proposed || DASH,
      submitted: p.value || DASH,
      howMuch: partHow(p),
      source:
        partSetBy(p) === "reviewer"
          ? sourceText({ kind: "reviewer" })
          : proposer(p.source ?? spec.proposedBy, p.confidence),
      lookedAt: p.looked || partChanged(p),
      scope: DASH,
    })),
  ];
};

export const buildUseCasePayload = ({
  spec,
  parts,
  outcome,
  outcomeWhy,
  log,
  reviewerId,
  startedAt,
}: {
  spec: UseCaseSpec;
  parts: UseCasePart[];
  outcome: string | null;
  outcomeWhy: WhyPick;
  log: CaptureLogEntry[];
  reviewerId: string;
  startedAt: number;
}): UseCasePayload => {
  const reasons = caseReasons(spec, parts, outcome, outcomeWhy);
  return {
    decision: outcome,
    reasons,
    rationaleText: caseRationale(spec, parts, outcome, reasons),
    decidingReasons: reasons
      .filter((r) => r.weight === "High")
      .map((r) => r.id),
    fields: parts.map((p) => ({
      id: p.id,
      label: p.label,
      kind: p.kind,
      byDecision: { [spec.recommended]: p.proposed },
      value: p.value,
      setBy: partSetBy(p),
    })),
    changes: caseChanges(spec, parts, outcome),
    record: caseRecord(spec, parts, outcome),
    reviewerId,
    timeOnTaskSeconds: Math.round((Date.now() - startedAt) / 1000),
    changeLog: log,
  };
};

export type UseCaseCaptureOptions = {
  spec: UseCaseSpec;
  seeds: PartSeed[];
  reviewerId?: string;
  readOnly?: boolean;
  saved?: UseCaseSaved;
  keep?: (p: UseCasePart) => boolean;
  gate?: (
    parts: UseCasePart[],
    outcome: string,
    outcomeWhy: WhyPick,
  ) => string | null;
  onChange?: (payload: UseCasePayload) => void;
  onComplete: (
    outcome: string,
    payload: UseCasePayload,
  ) => Promise<void> | void;
};

export type UseCaseCaptureModel = ReturnType<typeof useUseCaseCapture>;

const EMPTY_WHY: WhyPick = { why: null, note: "" };

export function useUseCaseCapture({
  spec,
  seeds,
  reviewerId = "",
  readOnly = false,
  saved,
  keep = () => true,
  gate,
  onChange,
  onComplete,
}: UseCaseCaptureOptions) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    readOnly ? { ...saved?.values } : {},
  );
  const [whys, setWhys] = useState<Record<string, WhyPick>>(() =>
    readOnly ? { ...saved?.whys } : {},
  );
  const [looked, setLooked] = useState<Record<string, boolean>>(() =>
    readOnly ? Object.fromEntries(seeds.map((s) => [s.id, true])) : {},
  );
  const [outcome, setOutcome] = useState<string | null>(() =>
    readOnly ? (saved?.outcome ?? null) : null,
  );
  const [outcomeWhy, setOutcomeWhy] = useState<WhyPick>(() =>
    readOnly ? { why: saved?.outcomeWhy ?? null, note: "" } : EMPTY_WHY,
  );
  const [log, setLog] = useState<CaptureLogEntry[]>([]);
  const [done, setDone] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const settled = useRef<Record<string, string>>({});

  const current: UseCaseSnapshot = {
    values,
    whys,
    looked,
    outcome,
    outcomeWhy,
  };
  const partsOf = (s: UseCaseSnapshot) =>
    applyParts(seeds, s.values, s.whys, s.looked);
  const parts = partsOf(current);
  const elapsedSeconds = () => Math.round((Date.now() - startedAt) / 1000);

  const payloadOf = (
    over: Partial<UseCaseSnapshot> = {},
    nextLog: CaptureLogEntry[] = log,
  ) => {
    const s = { ...current, ...over };
    return buildUseCasePayload({
      spec,
      parts: partsOf(s).filter(keep),
      outcome: s.outcome,
      outcomeWhy: s.outcomeWhy,
      log: nextLog,
      reviewerId,
      startedAt,
    });
  };

  const labelOf = (id: string) => seeds.find((s) => s.id === id)?.label ?? id;
  const valueOf = (id: string) =>
    values[id] ?? seeds.find((s) => s.id === id)?.proposed ?? "";

  const commit = (what: string, over: Partial<UseCaseSnapshot>) => {
    const next = { ...current, ...over };
    const entry: CaptureLogEntry = {
      step: log.length + 1,
      what,
      atSecond: elapsedSeconds(),
      lookedAt: Object.keys(next.looked).map(labelOf),
    };
    const nextLog = [...log, entry];
    setValues(next.values);
    setWhys(next.whys);
    setLooked(next.looked);
    setOutcome(next.outcome);
    setOutcomeWhy(next.outcomeWhy);
    setLog(nextLog);
    onChange?.(payloadOf(over, nextLog));
  };

  const lookAt = (id: string) =>
    setLooked((o) => (o[id] ? o : { ...o, [id]: true }));

  const pickMany = (
    patch: Record<string, string | null>,
    lookId: string,
    what: string,
  ) => {
    const next = { ...values };
    Object.entries(patch).forEach(([id, v]) => {
      if (v === null) delete next[id];
      else next[id] = v;
    });
    commit(what, { values: next, looked: { ...looked, [lookId]: true } });
  };

  const pick = (id: string, value: string) =>
    pickMany(
      { [id]: value },
      id,
      `${KIND_PARTS.field}: ${labelOf(id)}, ${valueOf(id)} → ${value}`,
    );

  const edit = (id: string, value: string) =>
    setValues((v) => ({ ...v, [id]: value }));

  const settle = (id: string) => {
    const value = values[id];
    if (value === undefined || settled.current[id] === value) return;
    settled.current[id] = value;
    const from = seeds.find((s) => s.id === id)?.proposed ?? "";
    commit(`${KIND_PARTS.field}: ${labelOf(id)}, ${from} → ${value}`, {
      looked: { ...looked, [id]: true },
    });
  };

  const toggleWhy = (id: string, why: string) => {
    const now = whys[id] ?? EMPTY_WHY;
    commit(`Why: ${labelOf(id)}, ${why}`, {
      whys: {
        ...whys,
        [id]: { why: now.why === why ? null : why, note: now.note },
      },
    });
  };

  const editNote = (id: string, note: string) =>
    setWhys((w) => ({ ...w, [id]: { why: w[id]?.why ?? null, note } }));

  const choose = (id: string) =>
    commit(`Decision: ${outcomeLabel(spec, id)}`, {
      outcome: id,
      outcomeWhy: id === outcome ? outcomeWhy : EMPTY_WHY,
    });

  const toggleOutcomeWhy = (why: string) =>
    commit(`Why: ${outcome ? outcomeLabel(spec, outcome) : ""}, ${why}`, {
      outcomeWhy: {
        why: outcomeWhy.why === why ? null : why,
        note: outcomeWhy.note,
      },
    });

  const editOutcomeNote = (note: string) =>
    setOutcomeWhy((w) => ({ ...w, note }));

  const requiresReason = !!spec.outcomes.find((o) => o.id === outcome)
    ?.requiresReason;
  const blocker = !outcome
    ? null
    : requiresReason && !whyText(outcomeWhy)
      ? "Pick a reason for this outcome."
      : (gate?.(parts, outcome, outcomeWhy) ?? null);

  const submit = async () => {
    if (!outcome || blocker) return;
    setBusy(true);
    setError(null);
    try {
      await onComplete(outcome, payloadOf());
      setDone(true);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "Could not complete the task. Try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return {
    spec,
    parts,
    root,
    setRoot,
    outcome,
    outcomeWhy,
    whys,
    looked,
    log,
    done,
    busy,
    error,
    blocker,
    locked: done || readOnly,
    changed: parts.filter(partChanged),
    payload: () => payloadOf(),
    elapsedSeconds,
    lookAt,
    pick,
    pickMany,
    edit,
    settle,
    toggleWhy,
    editNote,
    choose,
    toggleOutcomeWhy,
    editOutcomeNote,
    submit,
  };
}
