import { SCOPE_BY_ID } from "../models/constants";
import type { ReviewSpec, ScopeId } from "../models/capture";

export const scopeSentence = (scope: ScopeId, conditions: string[]) =>
  scope === "like"
    ? `claims that ${conditions.join(" and ") || "(no condition)"}`
    : SCOPE_BY_ID[scope].label.toLowerCase();

export const selectedConditions = (
  spec: ReviewSpec,
  selected: Record<string, boolean>,
) =>
  (spec.nextTime?.conditions ?? [])
    .filter((condition) => selected[condition.id])
    .map((condition) => condition.label);
