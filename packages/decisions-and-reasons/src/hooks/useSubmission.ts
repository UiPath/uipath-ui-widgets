import { useState } from "react";
import type { ReviewPayload } from "../models/payload";

const FALLBACK_ERROR = "Could not complete the task. Try again.";

type SubmissionInput = {
  readOnly: boolean;
  outcome: string | null;
  blocker: string | null;
  payload: () => ReviewPayload;
  onComplete: (outcome: string, payload: ReviewPayload) => Promise<void> | void;
};

export function useSubmission({
  readOnly,
  outcome,
  blocker,
  payload,
  onComplete,
}: SubmissionInput) {
  const [done, setDone] = useState(readOnly);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!outcome || blocker) return;
    setBusy(true);
    setError(null);
    try {
      await onComplete(outcome, payload());
      setDone(true);
    } catch (failure) {
      setError(
        failure instanceof Error && failure.message
          ? failure.message
          : FALLBACK_ERROR,
      );
    } finally {
      setBusy(false);
    }
  };

  return { done, busy, error, submit };
}
