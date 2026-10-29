import type { Dispatch, SetStateAction } from "react";
import { NOT_RELEVANT, SCOPE_BY_ID } from "../models/constants";
import type {
  ReasonView,
  ReviewSpec,
  ReviewState,
  ScopeId,
  Weight,
} from "../models/capture";
import { outcomeLabel } from "../utils/outcomes";
import { addedReasonId } from "../utils/payload";
import { notedWhy, toggledWhy } from "../utils/whys";
import type { Commit } from "./useCaptureState";

type ReasonActionsInput = {
  spec: ReviewSpec;
  state: ReviewState;
  reasons: ReasonView[];
  labelOf: (id: string) => string;
  setState: Dispatch<SetStateAction<ReviewState>>;
  commit: Commit;
};

export function useReasonActions({
  spec,
  state,
  reasons,
  labelOf,
  setState,
  commit,
}: ReasonActionsInput) {
  const reasonById = (id: string) => reasons.find((reason) => reason.id === id);

  const setWeight = (id: string, weight: Weight) => {
    const reason = reasonById(id);
    if (!reason) return;
    const reasonWhys = { ...state.reasonWhys };
    if (weight !== NOT_RELEVANT) delete reasonWhys[id];
    commit(`Reason weight: ${reason.title}, ${reason.weight} → ${weight}`, {
      weights: { ...state.weights, [id]: weight },
      reasonWhys,
    });
  };

  const toggleReasonWhy = (id: string, why: string) => {
    const reason = reasonById(id);
    if (!reason) return;
    commit(`Why not relevant: ${reason.title}, ${why}`, {
      reasonWhys: {
        ...state.reasonWhys,
        [id]: toggledWhy(reason, why),
      },
    });
  };

  const editReasonNote = (id: string, note: string) =>
    setState((current) => ({
      ...current,
      reasonWhys: {
        ...current.reasonWhys,
        [id]: notedWhy(current.reasonWhys[id], note),
      },
    }));

  const addReason = (title: string, supports: string) => {
    const supported = supports || state.outcome || spec.recommended;
    commit(
      `Reason added: ${title}, supports ${outcomeLabel(spec, supported)}`,
      {
        added: [
          ...state.added,
          {
            id: addedReasonId(reasons.length + 1, Date.now()),
            title,
            detail: "",
            supports: supported,
          },
        ],
      },
    );
  };

  const removeReason = (id: string) =>
    commit(`Reason removed: ${labelOf(id)}`, {
      added: state.added.filter((reason) => reason.id !== id),
    });

  const pickLesson = (id: string) => {
    const lesson = state.lesson === id ? null : id;
    const text = spec.nextTime?.options.find(
      (option) => option.id === id,
    )?.text;
    commit(`Next time ${lesson ? "picked" : "cleared"}: ${text}`, { lesson });
  };

  const chooseScope = (scope: ScopeId) =>
    commit(`Scope: ${SCOPE_BY_ID[scope].label}`, { scope });

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
