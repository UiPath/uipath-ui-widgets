import type { Dispatch, SetStateAction } from "react";
import type {
  ReasonView,
  ReviewSpec,
  ReviewState,
  ScopeId,
  Weight,
} from "../models/decision";
import { outcomeLabel, scopeById } from "../utils/changes";
import { addedReasonId } from "../utils/payload";

type ReasonActionsInput = {
  spec: ReviewSpec;
  state: ReviewState;
  reasons: ReasonView[];
  labelOf: (id: string) => string;
  setState: Dispatch<SetStateAction<ReviewState>>;
  commit: (what: string | null, over: Partial<ReviewState>) => void;
};

export function useReasonActions({
  spec,
  state,
  reasons,
  labelOf,
  setState,
  commit,
}: ReasonActionsInput) {
  const setWeight = (id: string, weight: Weight) => {
    const r = reasons.find((x) => x.id === id)!;
    const reasonWhys = { ...state.reasonWhys };
    if (weight !== "Not relevant") delete reasonWhys[id];
    commit(`Reason weight: ${r.title}, ${r.weight} → ${weight}`, {
      weights: { ...state.weights, [id]: weight },
      reasonWhys,
    });
  };

  const toggleReasonWhy = (id: string, why: string) => {
    const r = reasons.find((x) => x.id === id)!;
    commit(`Why not relevant: ${r.title}, ${why}`, {
      reasonWhys: {
        ...state.reasonWhys,
        [id]: { why: r.why === why ? null : why, note: r.note },
      },
    });
  };

  const editReasonNote = (id: string, note: string) =>
    setState((s) => ({
      ...s,
      reasonWhys: {
        ...s.reasonWhys,
        [id]: { why: s.reasonWhys[id]?.why ?? null, note },
      },
    }));

  const addReason = (title: string, supports: string) => {
    const to = supports || state.outcome || spec.recommended;
    commit(`Reason added: ${title}, supports ${outcomeLabel(spec, to)}`, {
      added: [
        ...state.added,
        {
          id: addedReasonId(reasons.length + 1, Date.now()),
          title,
          detail: "",
          supports: to,
        },
      ],
    });
  };

  const removeReason = (id: string) =>
    commit(`Reason removed: ${labelOf(id)}`, {
      added: state.added.filter((r) => r.id !== id),
    });

  const pickLesson = (id: string) => {
    const lesson = state.lesson === id ? null : id;
    const text = spec.nextTime?.options.find((x) => x.id === id)?.text;
    commit(`Next time ${lesson ? "picked" : "cleared"}: ${text}`, { lesson });
  };

  const chooseScope = (scope: ScopeId) =>
    commit(`Scope: ${scopeById(scope).label}`, { scope });

  const toggleCondition = (id: string) =>
    commit(null, { conds: { ...state.conds, [id]: !state.conds[id] } });

  return {
    setWeight,
    toggleReasonWhy,
    editReasonNote,
    addReason,
    removeReason,
    pickLesson,
    chooseScope,
    toggleCondition,
  };
}
