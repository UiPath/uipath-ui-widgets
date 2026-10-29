import { useState } from "react";
import type {
  ReviewPart,
  ReviewSaved,
  ReviewSeed,
  ReviewSpec,
} from "../models/capture";
import type { ReviewPayload } from "../models/payload";
import { completionBlocker } from "../utils/blocker";
import type { CompletionGate } from "../utils/blocker";
import { buildChanges, hasChanges } from "../utils/changes";
import { findOutcome } from "../utils/outcomes";
import { partChanged } from "../utils/parts";
import { buildRecord } from "../utils/record";
import { resolveReasons } from "../utils/reasons";
import { useCaptureState } from "./useCaptureState";
import { useFieldActions } from "./useFieldActions";
import { useOutcomeActions } from "./useOutcomeActions";
import { useReasonActions } from "./useReasonActions";
import { useTagActions } from "./useTagActions";
import { useSubmission } from "./useSubmission";

export type ReviewCaptureOptions = {
  spec: ReviewSpec;
  seeds: ReviewSeed[];
  reviewerId?: string;
  readOnly?: boolean;
  saved?: ReviewSaved;
  keep?: (part: ReviewPart) => boolean;
  gate?: CompletionGate;
  logEdits?: boolean;
  onChange?: (payload: ReviewPayload) => void;
  onComplete: (outcome: string, payload: ReviewPayload) => Promise<void> | void;
};

export type ReviewModel = ReturnType<typeof useDecisionCapture>;

const keepEveryPart = () => true;

export function useDecisionCapture({
  spec,
  seeds,
  reviewerId = "",
  readOnly = false,
  saved,
  keep = keepEveryPart,
  gate,
  logEdits = true,
  onChange,
  onComplete,
}: ReviewCaptureOptions) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const capture = useCaptureState({
    spec,
    seeds,
    readOnly,
    saved,
    keep,
    reviewerId,
    onChange,
  });
  const { state, setState, log, parts, keptParts, reasons, commit } = capture;
  const { outcome, outcomeWhy, looked } = state;

  const fieldActions = useFieldActions({
    state,
    setState,
    commit,
    seeds,
    parts,
    labelOf: capture.labelOf,
    logEdits,
  });
  const outcomeActions = useOutcomeActions({ spec, state, setState, commit });
  const reasonActions = useReasonActions({
    spec,
    state,
    reasons,
    labelOf: capture.labelOf,
    setState,
    commit,
  });

  const tagActions = useTagActions({ state, commit });

  const blocker = completionBlocker(
    findOutcome(spec.outcomes, outcome),
    outcomeWhy,
    parts,
    gate,
  );
  const submission = useSubmission({
    readOnly,
    outcome,
    blocker,
    payload: capture.payload,
    onComplete,
  });

  const partsById = new Map(parts.map((part) => [part.id, part]));
  const findPart = (id: string) => partsById.get(id);
  const getPart = (id: string) => {
    const part = partsById.get(id);
    if (!part) throw new Error(`No part with id "${id}" in this review`);
    return part;
  };

  return {
    spec,
    parts,
    findPart,
    getPart,
    reasons,
    state,
    root,
    setRoot,
    outcome,
    outcomeWhy,
    looked,
    log,
    blocker,
    locked: submission.done || readOnly,
    changes: buildChanges(spec, keptParts, reasons, state),
    changed: keptParts.filter(partChanged),
    hasChange: hasChanges(spec, state, reasons),
    record: buildRecord(
      spec,
      keptParts,
      resolveReasons(spec, keptParts, state),
      state,
    ),
    payload: capture.payload,
    elapsedSeconds: capture.elapsedSeconds,
    ...fieldActions,
    ...outcomeActions,
    ...reasonActions,
    ...tagActions,
    ...submission,
  };
}
