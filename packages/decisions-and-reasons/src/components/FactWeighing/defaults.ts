import type { ReviewOutcome } from "../../models/capture";
import type { FactPosition } from "./types";

export const FACT_POSITIONS: FactPosition[] = [
  { id: "Strongly fraud", label: "Strongly fraud", side: "fraud" },
  { id: "Leans fraud", label: "Leans fraud", side: "fraud" },
  { id: "Not relevant", label: "Not relevant", side: "neutral" },
  { id: "Leans legitimate", label: "Leans legitimate", side: "legitimate" },
  {
    id: "Strongly legitimate",
    label: "Strongly legitimate",
    side: "legitimate",
  },
];

export const FACT_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Approve",
    label: "Approve",
    description: "Ship the order",
  },
  {
    id: "Decline",
    label: "Decline",
    description: "Cancel the order and refund the payment",
  },
];

export const FACT_REASONS = [
  "Legitimate customer",
  "Legitimate in-store retry",
  "Screen false positive",
  "Promo abuse or reseller ring",
  "Account takeover",
  "Card testing or stolen card",
  "Other",
] as const;

export const FACT_GRID =
  "grid grid-cols-[minmax(0,1fr)_7rem_repeat(5,2.75rem)] gap-x-1";
