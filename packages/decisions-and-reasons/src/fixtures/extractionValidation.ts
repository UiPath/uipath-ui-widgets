import type { ExtractionValidationProps } from "../components/ExtractionValidation/types";

export const FIXTURE_EXTRACTION: Omit<ExtractionValidationProps, "onComplete"> =
  {
    title: "Invoice INV-48213",
    subtitle: "northfield-inv-48213.pdf",
    proposedBy: "Document extractor v3",
    facts: [{ label: "Supplier", value: "Northfield Components Ltd" }],
    fields: [
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
      {
        id: "due-date",
        label: "Due date",
        value: "2026-11-02",
        confidence: 72,
      },
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
