import { useRef, useState } from "react";
import type {
  CaptureLogEntry,
  ReviewPart,
  ReviewPayload,
  ReviewSaved,
  ReviewSeed,
  ReviewSpec,
  ReviewState,
  WhyPick,
} from "../models/decision";
import {
  EMPTY_WHY,
  applyParts,
  buildChanges,
  cut,
  hasChanges,
  initialState,
  outcomeLabel,
  partChanged,
  resolveReasons,
  whyText,
} from "../utils/changes";
import { buildPayload } from "../utils/payload";
import { useReasonActions } from "./useReasonActions";

export type ReviewCaptureOptions = {
  spec: ReviewSpec;
  seeds: ReviewSeed[];
  reviewerId?: string;
  readOnly?: boolean;
  saved?: ReviewSaved;
  keep?: (p: ReviewPart) => boolean;
  gate?: (
    parts: ReviewPart[],
    outcome: string,
    outcomeWhy: WhyPick,
  ) => string | null;
  logEdits?: boolean;
  onChange?: (payload: ReviewPayload) => void;
  onComplete: (outcome: string, payload: ReviewPayload) => Promise<void> | void;
};

export type ReviewModel = ReturnType<typeof useDecisionCapture>;

export function useDecisionCapture({
  spec,
  seeds,
  reviewerId = "",
  readOnly = false,
  saved,
  keep = () => true,
  gate,
  logEdits = true,
  onChange,
  onComplete,
}: ReviewCaptureOptions) {
  const [state, setState] = useState<ReviewState>(() =>
    initialState(spec, seeds, readOnly, saved),
  );
  const [log, setLog] = useState<CaptureLogEntry[]>([]);
  const [done, setDone] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startedAt] = useState(() => Date.now());
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const settled = useRef<Record<string, string>>({});

  const { outcome, outcomeWhy, looked } = state;
  const parts = applyParts(seeds, state, spec.recommended);
  const reasons = resolveReasons(spec, parts, state);
  const kept = parts.filter(keep);
  const elapsedSeconds = () => Math.round((Date.now() - startedAt) / 1000);

  const labelOf = (id: string) =>
    seeds.find((s) => s.id === id)?.label ??
    reasons.find((r) => r.id === id)?.title ??
    id;

  const payloadOf = (next: ReviewState, nextLog: CaptureLogEntry[]) =>
    buildPayload({
      ...next,
      spec,
      parts: applyParts(seeds, next, spec.recommended).filter(keep),
      log: nextLog,
      reviewerId,
      startedAt,
    });

  const commit = (what: string | null, over: Partial<ReviewState>) => {
    const next = { ...state, ...over };
    const nextLog = what
      ? [
          ...log,
          {
            step: log.length + 1,
            what,
            atSecond: elapsedSeconds(),
            lookedAt: Object.keys(next.looked).map(labelOf),
          },
        ]
      : log;
    setState(next);
    setLog(nextLog);
    onChange?.(payloadOf(next, nextLog));
  };

  const lookAt = (id: string) =>
    setState((s) =>
      s.looked[id] ? s : { ...s, looked: { ...s.looked, [id]: true } },
    );

  const pickMany = (
    patch: Record<string, string | null>,
    lookId: string,
    what: string,
  ) => {
    const values = { ...state.values };
    Object.entries(patch).forEach(([id, v]) => {
      if (v === null) delete values[id];
      else values[id] = v;
    });
    commit(what, { values, looked: { ...looked, [lookId]: true } });
  };

  const valueOf = (id: string) => parts.find((p) => p.id === id)?.value ?? "";

  const pick = (id: string, value: string) =>
    pickMany(
      { [id]: value },
      id,
      `Field: ${labelOf(id)}, ${valueOf(id)} → ${value}`,
    );

  const edit = (id: string, value: string) =>
    setState((s) => ({ ...s, values: { ...s.values, [id]: value } }));

  const settle = (id: string) => {
    const value = state.values[id];
    if (value === undefined || settled.current[id] === value) return;
    settled.current[id] = value;
    const from = seeds.find((s) => s.id === id)?.proposed ?? "";
    commit(
      logEdits
        ? `Field: ${labelOf(id)}, ${cut(from, 60)} → ${cut(value, 60)}`
        : null,
      {
        looked: { ...looked, [id]: true },
      },
    );
  };

  const toggleWhy = (id: string, why: string) => {
    const now = state.whys[id] ?? EMPTY_WHY;
    commit(`Why: ${labelOf(id)}, ${why}`, {
      whys: {
        ...state.whys,
        [id]: { why: now.why === why ? null : why, note: now.note },
      },
    });
  };

  const editNote = (id: string, note: string) =>
    setState((s) => ({
      ...s,
      whys: { ...s.whys, [id]: { why: s.whys[id]?.why ?? null, note } },
    }));

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
    setState((s) => ({ ...s, outcomeWhy: { ...s.outcomeWhy, note } }));

  const reasonActions = useReasonActions({
    spec,
    state,
    reasons,
    labelOf,
    setState,
    commit,
  });

  const chosen = spec.outcomes.find((o) => o.id === outcome);
  const blocker = !chosen
    ? null
    : chosen.requiresReason && !whyText(outcomeWhy)
      ? "Pick a reason for this outcome."
      : chosen.requiresCoverage
        ? (gate?.(parts, chosen.id, outcomeWhy) ?? null)
        : null;

  const submit = async () => {
    if (!outcome || blocker) return;
    setBusy(true);
    setError(null);
    try {
      await onComplete(outcome, payloadOf(state, log));
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
    reasons,
    state,
    root,
    setRoot,
    outcome,
    outcomeWhy,
    looked,
    log,
    done,
    busy,
    error,
    blocker,
    locked: done || readOnly,
    changes: buildChanges(spec, kept, reasons, state),
    changed: kept.filter(partChanged),
    hasChange: hasChanges(spec, state, reasons),
    payload: () => payloadOf(state, log),
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
    ...reasonActions,
    submit,
  };
}
