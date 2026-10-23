import type { ReviewOutcome } from "../../models/capture";

export const TRIAGE_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Confirm",
    label: "Confirm",
    description: "Apply the labels and route the item.",
    recommended: true,
  },
  {
    id: "SendBack",
    label: "Send back",
    description: "Return the item for more information.",
    reasons: [
      "Missing details",
      "Needs a reply from the requester",
      "Belongs to another process",
      "Other",
    ],
  },
];
