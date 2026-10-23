import type {
  ReviewPart,
  ReviewSeed,
  ReviewState,
  SetBy,
} from "../models/capture";
import { valueResolution } from "./resolution";

export const partChanged = (part: ReviewPart) =>
  part.value !== (part.follows ?? part.proposed);

export const partSetBy = (part: ReviewPart): SetBy =>
  partChanged(part) ? "reviewer" : "model";

export const partResolution = (part: ReviewPart) =>
  valueResolution(part.proposed, part.value, part.looked);

const followedValue = (seed: ReviewSeed, outcome: string) =>
  seed.byOutcome ? (seed.byOutcome[outcome] ?? seed.proposed) : undefined;

export const applyParts = (
  seeds: ReviewSeed[],
  state: Pick<ReviewState, "values" | "whys" | "looked" | "outcome">,
  recommended: string,
): ReviewPart[] =>
  seeds.map((seed) => {
    const follows = followedValue(seed, state.outcome ?? recommended);
    const pick = state.whys[seed.id];
    return {
      ...seed,
      follows,
      value: state.values[seed.id] ?? follows ?? seed.proposed,
      looked: !!state.looked[seed.id],
      why: pick?.why ?? null,
      note: pick?.note ?? "",
    };
  });
