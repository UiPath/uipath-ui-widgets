import type { SourceComparisonProps } from "../components/SourceComparison/types";

export const FIXTURE_COMPARISON: Omit<SourceComparisonProps, "onComplete"> = {
  title: "Supplier pricing agreement",
  subtitle: "SPA-2026-0412",
  proposedBy: "Contract comparison agent v2",
  copy: { extracted: "Contract value", record: "System value" },
  fields: [
    {
      id: "rebate-rate",
      group: "Pricing",
      label: "Rebate rate",
      extractedValue: "12.5% of net purchases",
      recordValue: "12.5% of net purchases",
      confidence: 96,
      evidence:
        "Both records state the same rate and the same basis, found in the rebate clause.",
      citation: {
        document: "Base agreement",
        page: 14,
        before: "Section 6.2. The Supplier shall pay a quarterly rebate of ",
        highlight: "12.5% of net purchases",
        after: " made by the Buyer during the calendar quarter.",
      },
    },
    {
      id: "handling-fee",
      group: "Pricing",
      label: "Handling fee",
      extractedValue: "$1.85 per unit",
      recordValue: "$1.95 per unit",
      confidence: 88,
      evidence:
        "Amendment 2 lowers the fee to $1.85. The system record still holds the base agreement fee.",
      citation: {
        document: "Amendment 2",
        page: 3,
        before: "Section 4.1 of the Base agreement is replaced: the fee is ",
        highlight: "$1.85 per unit",
        after: ", effective 1 January.",
      },
    },
    {
      id: "price-cap",
      group: "Pricing",
      label: "Annual price increase cap",
      extractedValue: "4% per year",
      recordValue: "3% per year",
      confidence: 61,
      evidence:
        "The cap appears twice with different figures. The agent could not tell which clause governs.",
      citation: {
        document: "Base agreement",
        page: 9,
        before: "Section 5.4. Unit prices shall not increase by more than ",
        highlight: "4% per year",
        after: " without written consent.",
      },
    },
    {
      id: "term-length",
      group: "Term",
      label: "Term length",
      extractedValue: "36 months",
      recordValue: "36 months",
      confidence: 98,
      evidence: "The initial term is stated once and agrees with the record.",
      citation: {
        document: "Base agreement",
        page: 2,
        before: "Section 2.1. This agreement runs for an initial term of ",
        highlight: "36 months",
        after: " from the effective date.",
      },
    },
    {
      id: "renewal-notice",
      group: "Term",
      label: "Renewal notice period",
      extractedValue: "90 days",
      recordValue: "60 days",
      confidence: 74,
      evidence:
        "The notice period is in the renewal clause. The record shows a shorter period.",
      citation: {
        document: "Base agreement",
        page: 2,
        before: "Section 2.3. Either party may end the term by giving ",
        highlight: "90 days",
        after: " written notice before expiry.",
      },
    },
    {
      id: "payment-terms",
      group: "Payment",
      label: "Payment terms",
      extractedValue: "Net 45",
      recordValue: "Net 45",
      confidence: 93,
      evidence: "Invoice payment terms match in both records.",
    },
  ],
};

export const FIXTURE_COMPARISON_QC: Omit<SourceComparisonProps, "onComplete"> =
  {
    ...FIXTURE_COMPARISON,
    proposedBy: "First-stage reviewer",
    show: { qcLane: true },
    fields: FIXTURE_COMPARISON.fields.map((f) => {
      if (f.id === "handling-fee")
        return {
          ...f,
          reviewer: {
            verdict: "System value wrong" as const,
            recordValue: "$1.85 per unit",
          },
        };
      if (f.id === "renewal-notice")
        return {
          ...f,
          reviewer: {
            verdict: "System value wrong" as const,
            recordValue: "90 days",
          },
        };
      return { ...f, reviewer: { verdict: "Correct" as const } };
    }),
  };
