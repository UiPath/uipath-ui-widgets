import type { FactPosition, ReviewOutcome, Weight } from "./decision";

export const WEIGHTS: Weight[] = ["High", "Medium", "Low", "Not relevant"];

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

export const KIND_PARTS = {
  decision: "Decision",
  reason: "Reason",
  field: "Field",
  nextTime: "Next time",
} as const;

export const LOW_CONFIDENCE = 80;

export const NEEDS_REVIEW = "Needs review";

export const CHIP_CLASS =
  "rounded-full px-3 data-[state=on]:border-foreground data-[state=on]:bg-foreground data-[state=on]:text-background";

export const DOCUMENT_REASONS = [
  "Extraction misread",
  "Not in the document",
  "Rule doesn't fit",
  "Other",
] as const;

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

export const DRAFT_EDIT_REASONS = [
  "Wrong tone",
  "Missing a step",
  "Factual error",
  "Too long",
  "Other",
] as const;

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
  {
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
  },
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
  COMPARISON_OUTCOMES[2],
];

export const DOCUMENT_OUTCOMES: ReviewOutcome[] = [
  {
    id: "Validate",
    label: "Validate",
    description: "Accept the document and release it for processing.",
    recommended: true,
  },
  {
    id: "Reject",
    label: "Reject",
    description: "Return the document to the sender without processing it.",
    reasons: [
      "Not a supported document",
      "Duplicate submission",
      "Illegible scan",
      "Supplier not recognised",
      "Other",
    ],
  },
];

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
