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

export const missingItems = (outcome: string | null, reasonCount: number) =>
  [!outcome && "a decision", reasonCount === 0 && "a reason"].filter(
    (missing): missing is string => !!missing,
  );

export const groupFacts = (items: FactItem[]) =>
  [...new Set(items.map((item) => item.group))].map((group) => ({
    group,
    items: items.filter((item) => item.group === group),
  }));
