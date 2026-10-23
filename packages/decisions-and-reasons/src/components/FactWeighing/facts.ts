import type { ReviewPayload } from "../../models/payload";
import type { FactItem, FactRationale, FactWeighingPayload } from "./types";

export const withFactWeighing = (
  payload: ReviewPayload,
  items: FactItem[],
  rationale: FactRationale,
): FactWeighingPayload => {
  const fieldsById = new Map(payload.fields.map((field) => [field.id, field]));
  return {
    ...payload,
    facts: items.map((item) => {
      const field = fieldsById.get(item.id);
      return {
        id: item.id,
        label: item.label,
        group: item.group,
        agentRead: item.agentRead ?? "",
        weight: field?.value ?? "",
        setBy: field?.setBy ?? "model",
      };
    }),
    rationale,
  };
};

export const missingItems = (
  outcome: string | null,
  rationale: FactRationale,
) =>
  [
    !outcome && "a decision",
    rationale.tags.length === 0 && "a reason tag",
    !rationale.text.trim() && "a rationale",
  ].filter((missing): missing is string => !!missing);

export const toggleTag = (tags: string[], tag: string) =>
  tags.includes(tag)
    ? tags.filter((current) => current !== tag)
    : [...tags, tag];

export const groupFacts = (items: FactItem[]) =>
  [...new Set(items.map((item) => item.group))].map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  }));
