import { NOT_RELEVANT } from "../models/constants";
import type { ReviewOutcome, ReviewPart, ReviewSpec } from "../models/capture";
import type { PayloadReason } from "../models/payload";
import { outcomeLabel } from "./outcomes";
import { partChanged } from "./parts";

const DECIDING_FALLBACK_COUNT = 2;

export const decidingOf = (
  outcome: ReviewOutcome | undefined,
  reasons: PayloadReason[],
) => {
  if (!outcome) return [];
  const live = reasons.filter(
    (reason) =>
      reason.weight !== NOT_RELEVANT &&
      (outcome.blendsReasons || reason.supports === outcome.id),
  );
  const top = live.filter((reason) => reason.weight === "High");
  return top.length ? top : live.slice(0, DECIDING_FALLBACK_COUNT);
};

const titles = (reasons: { title: string }[]) =>
  reasons.map((reason) => reason.title).join("; ");

const clause = (lead: string, items: string) =>
  items ? `${lead} ${items}.` : "";

export const rationaleOf = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  outcome: string | null,
  reasons: PayloadReason[],
  deciding: PayloadReason[],
) => {
  if (!outcome) return "";
  const head = `${outcomeLabel(spec, outcome)}.`;

  if (spec.weighted) {
    const setAside = reasons.filter((reason) => reason.weight === NOT_RELEVANT);
    return [
      head,
      clause("Decided by:", titles(deciding)),
      clause("Set aside as not relevant:", titles(setAside)),
    ]
      .filter(Boolean)
      .join(" ");
  }

  const corrected = parts.filter(partChanged).map((part) => part.label);
  const added = reasons.filter((reason) => reason.added);
  return [
    head,
    clause("Corrected:", corrected.join("; ")),
    clause("Because:", titles(added)),
  ]
    .filter(Boolean)
    .join(" ");
};
