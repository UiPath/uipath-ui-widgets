import { useState } from "react";
import type {
  CaptureLogEntry,
  ReviewPart,
  ReviewSaved,
  ReviewSeed,
  ReviewSpec,
  ReviewState,
} from "../models/capture";
import type { ReviewPayload } from "../models/payload";
import { applyParts } from "../utils/parts";
import { buildPayload } from "../utils/payload";
import { resolveReasons } from "../utils/reasons";
import { initialState } from "../utils/state";
import { secondsSince } from "../utils/time";

export type CaptureStateInput = {
  spec: ReviewSpec;
  seeds: ReviewSeed[];
  readOnly: boolean;
  saved?: ReviewSaved;
  keep: (part: ReviewPart) => boolean;
  reviewerId: string;
  onChange?: (payload: ReviewPayload) => void;
};

export type Commit = (what: string | null, over: Partial<ReviewState>) => void;

export function useCaptureState({
  spec,
  seeds,
  readOnly,
  saved,
  keep,
  reviewerId,
  onChange,
}: CaptureStateInput) {
  const [state, setState] = useState<ReviewState>(() =>
    initialState(spec, seeds, readOnly, saved),
  );
  const [log, setLog] = useState<CaptureLogEntry[]>([]);
  const [startedAt] = useState(() => Date.now());

  const parts = applyParts(seeds, state, spec.recommended);
  const reasons = resolveReasons(spec, parts, state);
  const keptParts = parts.filter(keep);
  const elapsedSeconds = () => secondsSince(startedAt);

  const labelOf = (id: string) =>
    seeds.find((seed) => seed.id === id)?.label ??
    reasons.find((reason) => reason.id === id)?.title ??
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

  const commit: Commit = (what, over) => {
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

  return {
    state,
    setState,
    log,
    parts,
    keptParts,
    reasons,
    labelOf,
    commit,
    elapsedSeconds,
    payload: () => payloadOf(state, log),
  };
}
