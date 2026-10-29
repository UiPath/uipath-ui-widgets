import type {
  ReviewSaved,
  ReviewSeed,
  ReviewSpec,
  ReviewState,
} from "../models/capture";
import { EMPTY_WHY } from "./whys";

const DEFAULT_SELECTED_CONDITIONS = 2;

const flagged = (ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, true]));

const blankState = (spec: ReviewSpec): ReviewState => ({
  values: {},
  whys: {},
  looked: {},
  outcome: null,
  outcomeWhy: EMPTY_WHY,
  weights: {},
  reasonWhys: {},
  added: [],
  lesson: null,
  scope: "like",
  conds: flagged(
    (spec.nextTime?.conditions ?? [])
      .slice(0, DEFAULT_SELECTED_CONDITIONS)
      .map((condition) => condition.id),
  ),
});

const savedState = (
  spec: ReviewSpec,
  seeds: ReviewSeed[],
  saved?: ReviewSaved,
): ReviewState => {
  const conditions = spec.nextTime?.conditions ?? [];
  return {
    values: { ...saved?.values },
    whys: { ...saved?.whys },
    looked: flagged(seeds.map((seed) => seed.id)),
    outcome: saved?.outcome ?? null,
    outcomeWhy: { why: saved?.outcomeWhy ?? null, note: "" },
    weights: { ...saved?.weights },
    reasonWhys: { ...saved?.reasonWhys },
    added: [],
    lesson: saved?.lesson ?? null,
    scope: saved?.scope ?? "like",
    conds: flagged(
      (saved?.conditions ?? []).map(
        (label) =>
          conditions.find((condition) => condition.label === label)?.id ??
          label,
      ),
    ),
  };
};

export const initialState = (
  spec: ReviewSpec,
  seeds: ReviewSeed[],
  readOnly: boolean,
  saved?: ReviewSaved,
): ReviewState =>
  readOnly ? savedState(spec, seeds, saved) : blankState(spec);
