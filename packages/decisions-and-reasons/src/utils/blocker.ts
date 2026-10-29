import type { ReviewOutcome, ReviewPart, WhyPick } from "../models/capture";
import { whyText } from "./whys";

export type CompletionGate = (
  parts: ReviewPart[],
  outcome: string,
  outcomeWhy: WhyPick,
) => string | null;

export const completionBlocker = (
  chosen: ReviewOutcome | undefined,
  outcomeWhy: WhyPick,
  parts: ReviewPart[],
  gate?: CompletionGate,
) => {
  if (!chosen) return null;
  if (chosen.requiresReason && !whyText(outcomeWhy)) {
    return "Pick a reason for this outcome.";
  }
  return chosen.requiresCoverage
    ? (gate?.(parts, chosen.id, outcomeWhy) ?? null)
    : null;
};
