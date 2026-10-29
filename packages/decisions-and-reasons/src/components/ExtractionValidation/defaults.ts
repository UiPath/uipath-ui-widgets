import type { ReviewOutcome } from "../../models/capture";

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
