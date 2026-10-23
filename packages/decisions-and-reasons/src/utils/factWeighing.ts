import type {
  FactItem,
  FactRationale,
  FactWeighingPayload,
  ReviewPayload,
} from "../models/decision";

export const withFactWeighing = (
  payload: ReviewPayload,
  items: FactItem[],
  rationale: FactRationale,
): FactWeighingPayload => ({
  ...payload,
  facts: items.map((item) => {
    const field = payload.fields.find((f) => f.id === item.id);
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
});

export const missingItems = (
  outcome: string | null,
  rationale: FactRationale,
) =>
  [
    !outcome && "a decision",
    rationale.tags.length === 0 && "a reason tag",
    !rationale.text.trim() && "a rationale",
  ].filter((x): x is string => !!x);

export const toggleTag = (tags: string[], tag: string) =>
  tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];

export const groupFacts = (items: FactItem[]) =>
  items.reduce<{ group: string; items: FactItem[] }[]>((groups, item) => {
    const last = groups.find((g) => g.group === item.group);
    if (last) last.items.push(item);
    else groups.push({ group: item.group, items: [item] });
    return groups;
  }, []);
