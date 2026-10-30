import type { ReviewOutcome } from "../../models/capture";

export const DRAFT_EDIT_REASONS = [
  "Wrong tone",
  "Missing a step",
  "Factual error",
  "Too long",
  "Other",
] as const;

export const DRAFT_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Send",
    label: "Send",
    description: "Send the text as it stands, with any edits you made.",
    recommended: true,
  },
  {
    id: "Revise",
    label: "Revise",
    description: "Return the draft to the agent to write again.",
    reasons: ["Wrong tone", "Missing information", "Too long", "Other"],
  },
  {
    id: "Reject",
    label: "Reject",
    description: "Do not send anything. Needs a reason.",
    requiresReason: true,
    reasons: [
      "Off topic",
      "Answer is incorrect",
      "A person should answer",
      "Other",
    ],
  },
];
