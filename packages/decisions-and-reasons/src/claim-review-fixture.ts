import type { ClaimData } from "./types";

export const FIXTURE_CLAIM: ClaimData = {
  claimId: "WC-2026-1187",
  customer: "Harlow Marine Services",
  claimAmount: 8185,
  planCeiling: 5000,
  planName: "Standard Plus",
  proposedBy: "Warranty claims agent v4",
  involvement: "Sign-off",
  recommendedDecision: "Deny",
  reasons: [
    {
      id: "r1",
      title: "A manufacturing defect caused the seal failure",
      detail: "Lab report LR-2209 traces the failure to batch defect 22-114.",
      supports: "Approve",
      proposedWeight: "High",
      weight: "High",
      source: "Document extractor v3",
      sourceConfidence: 91,
    },
    {
      id: "r2",
      title: "Water entered through an unsealed cable gland",
      detail:
        "Site photos 14-17 show an installer error, which the plan excludes.",
      supports: "Deny",
      proposedWeight: "High",
      weight: "High",
      source: "Warranty claims agent v4",
      sourceConfidence: 72,
    },
    {
      id: "r3",
      title: "The claim is above the plan ceiling",
      detail: "$8,185 against a $5,000 ceiling for Standard Plus.",
      supports: "Deny",
      proposedWeight: "Medium",
      weight: "Medium",
      source: "Rule WC-12 v6 (plan ceiling)",
      sourceConfidence: 99,
    },
    {
      id: "r4",
      title: "No earlier claims in four years",
      detail: "On the plan since November 2022 with a clean history.",
      supports: "Approve",
      proposedWeight: "Low",
      weight: "Low",
      source: "Customer history service v2",
      sourceConfidence: 95,
    },
  ],
  fields: [
    {
      id: "approvedAmount",
      label: "Approved amount",
      kind: "money",
      byDecision: { Approve: "8185", ApprovePartial: "5000", Deny: "0" },
    },
    {
      id: "goodwillAmount",
      label: "Goodwill amount",
      kind: "money",
      byDecision: { Approve: "0", ApprovePartial: "1500", Deny: "0" },
    },
    {
      id: "customerMessage",
      label: "Message to the customer",
      kind: "long",
      byDecision: {
        Approve: "Your claim of $8,185 is approved in full.",
        ApprovePartial:
          "We can cover $5,000 under your plan and add $1,500 as goodwill. The remaining $1,685 is not covered because water entered through an unsealed cable gland.",
        Deny: "We cannot approve this claim. The seal failure came from a manufacturing defect, which the plan covers, but water also entered through an unsealed cable gland, which it excludes, and the amount is above the $5,000 ceiling.",
      },
    },
  ],
  nextTimeOptions: [
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
  conditionOptions: [
    { id: "k1", label: "are above the plan ceiling" },
    { id: "k2", label: "have two causes" },
    { id: "k3", label: "have a lab report" },
  ],
};
