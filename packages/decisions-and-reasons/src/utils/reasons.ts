import { NOT_RELEVANT } from "../models/constants";
import type {
  ReasonView,
  ReviewPart,
  ReviewSpec,
  ReviewState,
  WhyPick,
} from "../models/capture";
import { partChanged } from "./parts";
import { whyText } from "./whys";

type ReasonInput = Partial<
  Pick<ReviewState, "weights" | "reasonWhys" | "added">
>;

const whyOf = (reasonWhys: Record<string, WhyPick>, id: string): WhyPick => ({
  why: reasonWhys[id]?.why ?? null,
  note: reasonWhys[id]?.note ?? "",
});

export const resolveReasons = (
  spec: ReviewSpec,
  parts: ReviewPart[],
  { weights = {}, reasonWhys = {}, added = [] }: ReasonInput,
): ReasonView[] => {
  const partsById = new Map(parts.map((part) => [part.id, part]));

  const proposed = spec.reasons.map((reason): ReasonView => {
    const part = reason.partId ? partsById.get(reason.partId) : undefined;
    const proposedWeight = reason.weight ?? "High";
    const setAside = part !== undefined && partChanged(part);
    return {
      ...reason,
      supports: reason.supports ?? spec.recommended,
      proposedWeight,
      weight: weights[reason.id] ?? (setAside ? NOT_RELEVANT : proposedWeight),
      added: false,
      ...whyOf(reasonWhys, reason.id),
    };
  });

  const reviewerAdded = added.map(
    (reason): ReasonView => ({
      ...reason,
      supports: reason.supports ?? spec.recommended,
      proposedWeight: "High",
      weight: weights[reason.id] ?? "High",
      added: true,
      ...whyOf(reasonWhys, reason.id),
    }),
  );

  return [...proposed, ...reviewerAdded];
};

export const notRelevantReason = (reason: ReasonView) =>
  reason.weight === NOT_RELEVANT && reason.why
    ? whyText({ why: reason.why, note: reason.note })
    : null;

export const weightText = (reason: ReasonView) => {
  const why = notRelevantReason(reason);
  return why ? `${reason.weight} · ${why}` : reason.weight;
};

export const reasonChanged = (reason: ReasonView) =>
  !reason.added && reason.weight !== reason.proposedWeight;
