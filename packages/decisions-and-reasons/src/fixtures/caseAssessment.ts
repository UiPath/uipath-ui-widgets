import type { CaseAssessmentProps } from "../components/CaseAssessment/types";

export const FIXTURE_CASE: Omit<CaseAssessmentProps, "onComplete"> = {
  title: "Warranty claim WC-2026-1187",
  subtitle: "Sign-off",
  proposedBy: "Warranty claims agent v4",
  facts: [
    { label: "Customer", value: "Harlow Marine Services" },
    { label: "Claim", value: "$8,185" },
    { label: "Plan ceiling", value: "$5,000" },
  ],
  outcomes: [
    {
      id: "Approve",
      label: "Approve in full",
      description: "Pay the full claim.",
    },
    {
      id: "ApprovePartial",
      label: "Approve partial",
      description:
        "Pay up to the ceiling and tell the customer which part was covered.",
      blendsReasons: true,
    },
    {
      id: "Deny",
      label: "Deny",
      description: "Close the claim and explain which part was covered.",
      recommended: true,
    },
  ],
  reasons: [
    {
      id: "r1",
      title: "A manufacturing defect caused the seal failure",
      detail: "Lab report LR-2209 traces the failure to batch defect 22-114.",
      supports: "Approve",
      weight: "High",
      source: "Document extractor v3",
      confidence: 91,
    },
    {
      id: "r2",
      title: "Water entered through an unsealed cable gland",
      detail:
        "Site photos 14-17 show an installer error, which the plan excludes.",
      supports: "Deny",
      weight: "High",
      source: "Warranty claims agent v4",
      confidence: 72,
    },
    {
      id: "r3",
      title: "The claim is above the plan ceiling",
      detail: "$8,185 against a $5,000 ceiling for Standard Plus.",
      supports: "Deny",
      weight: "Medium",
      source: "Rule WC-12 v6 (plan ceiling)",
      confidence: 99,
    },
    {
      id: "r4",
      title: "No earlier claims in four years",
      detail: "On the plan since November 2022 with a clean history.",
      supports: "Approve",
      weight: "Low",
      source: "Customer history service v2",
      confidence: 95,
    },
  ],
  fields: [
    {
      id: "approvedAmount",
      label: "Approved amount",
      kind: "money",
      byOutcome: { Approve: "8185", ApprovePartial: "5000", Deny: "0" },
    },
    {
      id: "goodwillAmount",
      label: "Goodwill amount",
      kind: "money",
      byOutcome: { Approve: "0", ApprovePartial: "1500", Deny: "0" },
    },
    {
      id: "customerMessage",
      label: "Message to the customer",
      kind: "long",
      byOutcome: {
        Approve: "Your claim of $8,185 is approved in full.",
        ApprovePartial:
          "We can cover $5,000 under your plan and add $1,500 as goodwill. The remaining $1,685 is not covered because water entered through an unsealed cable gland.",
        Deny: "We cannot approve this claim. The seal failure came from a manufacturing defect, which the plan covers, but water also entered through an unsealed cable gland, which it excludes, and the amount is above the $5,000 ceiling.",
      },
    },
  ],
  nextTime: {
    options: [
      {
        id: "l1",
        text: "When a covered defect and an excluded cause occur together, approve the covered part.",
        basis: "From: your decision differs from the recommendation.",
      },
      {
        id: "l2",
        text: "Weigh an installer error lower when a lab report names a batch defect.",
        basis: "From: you changed how much a reason counts.",
      },
    ],
    conditions: [
      { id: "k1", label: "are above the plan ceiling" },
      { id: "k2", label: "have two causes" },
      { id: "k3", label: "have a lab report" },
    ],
  },
};
