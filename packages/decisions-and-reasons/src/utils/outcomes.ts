import type { ReviewOutcome, ReviewSpec } from "../models/capture";

export const findOutcome = (outcomes: ReviewOutcome[], id: string | null) =>
  outcomes.find((outcome) => outcome.id === id);

export const recommendedId = (outcomes: ReviewOutcome[]) =>
  (outcomes.find((outcome) => outcome.recommended) ?? outcomes[0])?.id ?? "";

export const outcomeLabel = (spec: ReviewSpec, id: string) =>
  findOutcome(spec.outcomes, id)?.label ?? id;
