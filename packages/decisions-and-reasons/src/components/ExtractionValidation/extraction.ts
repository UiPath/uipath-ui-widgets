import type { ReviewReason, ReviewSeed } from "../../models/capture";
import type { ValueField } from "../../models/props";
import type { DocumentLineItem } from "./types";

export const headerId = (field: ValueField) => `header.${field.id}`;

export const lineId = (itemId: string, field: ValueField) =>
  `line.${itemId}.${field.id}`;

export const seedsOf = (
  fields: ValueField[],
  lineItems: DocumentLineItem[],
): ReviewSeed[] => [
  ...fields.map((field) => ({
    id: headerId(field),
    label: field.label,
    kind: "header",
    proposed: field.value,
    confidence: field.confidence,
  })),
  ...lineItems.flatMap((item, index) =>
    item.fields.map((field) => ({
      id: lineId(item.id, field),
      label: `Line ${index + 1} · ${field.label}`,
      kind: "lineItem",
      proposed: field.value,
      confidence: field.confidence,
    })),
  ),
];

export const lowConfidenceReason = (
  seed: ReviewSeed,
  proposedBy?: string,
): ReviewReason => ({
  id: `low-${seed.id}`,
  title: `Low confidence on ${seed.label}`,
  detail: `Extracted with ${seed.confidence}% confidence.`,
  partId: seed.id,
  source: proposedBy,
  confidence: seed.confidence,
});
