import { NOT_RELEVANT } from "../models/constants";
import type { Resolution, Weight } from "../models/capture";

export const weightResolution = (
  proposed: Weight,
  submitted: Weight,
): Resolution => {
  if (proposed === submitted) return "Kept";
  return submitted === NOT_RELEVANT ? "Rejected" : "Changed";
};

export const valueResolution = (
  proposed: string,
  submitted: string,
  looked: boolean,
): Resolution => {
  if (submitted === proposed) return looked ? "Kept" : "Untouched";
  return submitted.trim() ? "Changed" : "Rejected";
};

export const outcomeResolution = (
  recommended: string,
  outcome: string | null,
): Resolution => {
  if (!outcome) return "Untouched";
  return outcome === recommended ? "Kept" : "Rejected";
};
