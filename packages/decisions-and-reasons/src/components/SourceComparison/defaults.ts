import type { ReviewOutcome } from "../../models/capture";

export const NEEDS_REVIEW = "Needs review";

export const COMPARISON_VERDICTS = [
  "Correct",
  "Extraction wrong",
  "System value wrong",
] as const;

export const COMPARISON_REASONS = [
  "Misread number",
  "Superseded by an amendment",
  "Wrong clause cited",
  "System record out of date",
  "Other",
] as const;

const BYPASS_OUTCOME: ReviewOutcome = {
  id: "Bypass",
  label: "Bypass",
  description: "Close without a full review. Needs a reason.",
  requiresReason: true,
  reasons: [
    "Out of scope",
    "Reviewed outside this task",
    "Escalated to the agreement owner",
    "Other",
  ],
};

export const COMPARISON_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Complete",
    label: "Complete review",
    description: "Every field needs a verdict first.",
    recommended: true,
    requiresCoverage: true,
  },
  {
    id: "Reject",
    label: "Reject",
    description:
      "Stop the review, for example when the documents are unusable. Needs a reason.",
    requiresReason: true,
    reasons: [
      "Documents incomplete",
      "Wrong agreement uploaded",
      "Unreadable source",
      "Other",
    ],
  },
  BYPASS_OUTCOME,
];

export const AUDIT_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Complete",
    label: "Complete audit",
    description: "Every field needs a verdict first.",
    recommended: true,
    requiresCoverage: true,
  },
  {
    id: "Fail",
    label: "Fail",
    description: "The reviewer's verdicts cannot be relied on. Needs a reason.",
    requiresReason: true,
    reasons: ["Verdicts unreliable", "Systematic extraction issue", "Other"],
  },
  BYPASS_OUTCOME,
];
