import type { Dispatch, SetStateAction } from "react";
import type { ReviewSpec, ReviewState } from "../models/capture";
import { outcomeLabel } from "../utils/outcomes";
import { EMPTY_WHY, notedWhy, toggledWhy } from "../utils/whys";
import type { Commit } from "./useCaptureState";

type OutcomeActionsInput = {
  spec: ReviewSpec;
  state: ReviewState;
  setState: Dispatch<SetStateAction<ReviewState>>;
  commit: Commit;
};

export function useOutcomeActions({
  spec,
  state,
  setState,
  commit,
}: OutcomeActionsInput) {
  const { outcome, outcomeWhy } = state;

  const choose = (id: string) =>
    commit(`Decision: ${outcomeLabel(spec, id)}`, {
      outcome: id,
      outcomeWhy: id === outcome ? outcomeWhy : EMPTY_WHY,
    });

  const toggleOutcomeWhy = (why: string) =>
    commit(`Why: ${outcome ? outcomeLabel(spec, outcome) : ""}, ${why}`, {
      outcomeWhy: toggledWhy(outcomeWhy, why),
    });

  const editOutcomeNote = (note: string) =>
    setState((current) => ({
      ...current,
      outcomeWhy: notedWhy(current.outcomeWhy, note),
    }));

  return { choose, toggleOutcomeWhy, editOutcomeNote };
}
