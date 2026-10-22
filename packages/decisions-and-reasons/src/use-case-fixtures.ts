import type { ContractReviewData } from "./ContractFieldReviewCodedActionApp";
import type { DocumentValidationData } from "./DocumentValidationCodedActionApp";
import type { TicketTriageData } from "./TicketTriageCodedActionApp";

export const FIXTURE_CONTRACT: ContractReviewData = {
  agreementId: "SPA-2026-0412",
  title: "Supplier pricing agreement",
  proposedBy: "Contract comparison agent v2",
  fields: [
    {
      id: "rebate-rate",
      section: "Pricing",
      label: "Rebate rate",
      contractValue: "12.5% of net purchases",
      systemValue: "12.5% of net purchases",
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
      id: "dispensing-fee",
      section: "Pricing",
      label: "Dispensing fee",
      contractValue: "$1.85 per unit",
      systemValue: "$1.95 per unit",
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
      section: "Pricing",
      label: "Annual price increase cap",
      contractValue: "4% per year",
      systemValue: "3% per year",
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
      section: "Term",
      label: "Term length",
      contractValue: "36 months",
      systemValue: "36 months",
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
      section: "Term",
      label: "Renewal notice period",
      contractValue: "90 days",
      systemValue: "60 days",
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
      section: "Payment",
      label: "Payment terms",
      contractValue: "Net 45",
      systemValue: "Net 45",
      confidence: 93,
      evidence: "Invoice payment terms match in both records.",
    },
  ],
};

export const FIXTURE_CONTRACT_QC: ContractReviewData = {
  ...FIXTURE_CONTRACT,
  mode: "qc",
  proposedBy: "First-stage reviewer",
  fields: FIXTURE_CONTRACT.fields.map((f) => {
    if (f.id === "dispensing-fee")
      return {
        ...f,
        reviewer: {
          verdict: "System value wrong" as const,
          systemValue: "$1.85 per unit",
        },
      };
    if (f.id === "price-cap")
      return { ...f, reviewer: { verdict: "Correct" as const } };
    if (f.id === "renewal-notice")
      return {
        ...f,
        reviewer: {
          verdict: "System value wrong" as const,
          systemValue: "90 days",
        },
      };
    return { ...f, reviewer: { verdict: "Correct" as const } };
  }),
};

export const FIXTURE_INVOICE: DocumentValidationData = {
  documentId: "INV-48213",
  documentType: "Invoice",
  supplier: "Northfield Components Ltd",
  fileName: "northfield-inv-48213.pdf",
  proposedBy: "Document extractor v3",
  recommendedOutcome: "Validate",
  header: [
    {
      id: "invoice-number",
      label: "Invoice number",
      value: "INV-48213",
      confidence: 99,
    },
    {
      id: "invoice-date",
      label: "Invoice date",
      value: "2026-09-18",
      confidence: 97,
    },
    { id: "due-date", label: "Due date", value: "2026-11-02", confidence: 72 },
    {
      id: "po-number",
      label: "Purchase order",
      value: "PO-77120",
      confidence: 91,
    },
    { id: "currency", label: "Currency", value: "USD", confidence: 99 },
    { id: "total", label: "Total", value: "4,236.00", confidence: 68 },
  ],
  lineItems: [
    {
      id: "1",
      fields: [
        {
          id: "description",
          label: "Description",
          value: "Hydraulic seal kit",
          confidence: 94,
        },
        { id: "quantity", label: "Qty", value: "12", confidence: 96 },
        {
          id: "unit-price",
          label: "Unit price",
          value: "148.00",
          confidence: 92,
        },
        { id: "amount", label: "Amount", value: "1,776.00", confidence: 95 },
      ],
    },
    {
      id: "2",
      fields: [
        {
          id: "description",
          label: "Description",
          value: "Cable gland, M20",
          confidence: 90,
        },
        { id: "quantity", label: "Qty", value: "200", confidence: 88 },
        {
          id: "unit-price",
          label: "Unit price",
          value: "6.30",
          confidence: 64,
        },
        { id: "amount", label: "Amount", value: "1,260.00", confidence: 90 },
      ],
    },
    {
      id: "3",
      fields: [
        {
          id: "description",
          label: "Description",
          value: "Freight and handling",
          confidence: 85,
        },
        { id: "quantity", label: "Qty", value: "1", confidence: 99 },
        {
          id: "unit-price",
          label: "Unit price",
          value: "1,200.00",
          confidence: 93,
        },
        { id: "amount", label: "Amount", value: "1,200.00", confidence: 93 },
      ],
    },
  ],
};

export const FIXTURE_TICKET: TicketTriageData = {
  ticketId: "TCK-30418",
  subject: "Cannot export monthly usage report since the update",
  requester: "Finance Operations contact",
  channel: "Email",
  excerpt:
    "Since last night's update the monthly usage export fails with a timeout. Finance closes the books on Friday and we need the file before then.",
  proposedBy: "Ticket triage agent v2",
  recommendedOutcome: "Confirm",
  dimensions: [
    {
      id: "category",
      label: "Category",
      options: ["Reporting", "Access", "Billing", "Integration", "Other"],
      proposed: "Reporting",
      confidence: 93,
      reason: "The request is about exporting a report.",
      changeReasons: [
        "Root cause is elsewhere",
        "Request covers two areas",
        "Other",
      ],
    },
    {
      id: "priority",
      label: "Priority",
      options: ["Low", "Normal", "High", "Urgent"],
      proposed: "Normal",
      confidence: 71,
      reason: "No outage is described and a workaround may exist.",
      changeReasons: [
        "Deadline is close",
        "Many users affected",
        "Not blocking anyone",
        "Other",
      ],
    },
    {
      id: "team",
      label: "Routing team",
      options: [
        "Reporting support",
        "Platform engineering",
        "Finance systems",
        "Customer success",
      ],
      proposed: "Reporting support",
      confidence: 84,
      reason: "Reporting exports are handled by this team.",
      changeReasons: ["Needs an engineer", "Customer is at risk", "Other"],
    },
  ],
};
