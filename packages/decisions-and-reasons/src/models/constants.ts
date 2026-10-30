import type { ScopeId, Weight } from "./capture";

export const NOT_RELEVANT = "Not relevant" as const;

export const WEIGHTS: Weight[] = ["High", "Medium", "Low", NOT_RELEVANT];

export const NOT_RELEVANT_WHYS = ["Wrong", "Outdated", "Other"];

export const SCOPES = [
  {
    id: "this",
    value: "this-claim",
    label: "Just this claim",
    counts: "Just this claim",
  },
  {
    id: "like",
    value: "similar-claims",
    label: "Claims like this",
    counts: "Counts for claims like this",
  },
  {
    id: "always",
    value: "all-claims",
    label: "Always",
    counts: "Counts for all claims",
  },
] as const;

export const SCOPE_BY_ID = Object.fromEntries(
  SCOPES.map((scope) => [scope.id, scope]),
) as Record<ScopeId, (typeof SCOPES)[number]>;

export const KIND_PARTS = {
  decision: "Decision",
  reason: "Reason",
  field: "Field",
  nextTime: "Next time",
} as const;

export const LOW_CONFIDENCE = 80;

export const EMPTY_VALUE = "—";

export const DOCUMENT_REASONS = [
  "Extraction misread",
  "Not in the document",
  "Rule doesn't fit",
  "Other",
] as const;
