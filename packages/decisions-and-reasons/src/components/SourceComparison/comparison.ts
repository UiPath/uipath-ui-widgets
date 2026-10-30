import type {
  ReviewPart,
  ReviewReason,
  ReviewSeed,
} from "../../models/capture";
import type { ReviewCopy } from "../../models/props";
import type { CompletionGate } from "../../utils/blocker";
import { partChanged } from "../../utils/parts";
import { NEEDS_REVIEW } from "./defaults";
import type { ComparisonField, FieldStatus } from "./types";

export type ComparisonIds = {
  verdict: string;
  contract: string;
  system: string;
};

export type ComparisonLabels = Required<
  Pick<ReviewCopy, "extracted" | "record">
>;

type FindPart = (id: string) => ReviewPart | undefined;

export const idsOf = (field: ComparisonField): ComparisonIds => ({
  verdict: `${field.id}:verdict`,
  contract: `${field.id}:contract`,
  system: `${field.id}:system`,
});

const normalized = (value: string) => value.trim().toLowerCase();

export const extractionMatchesRecord = (field: ComparisonField) =>
  normalized(field.extractedValue) === normalized(field.recordValue);

export const seedsOf = (
  fields: ComparisonField[],
  qc: boolean,
  labels: ComparisonLabels,
): ReviewSeed[] =>
  fields.flatMap((field) => {
    const ids = idsOf(field);
    const lane = qc ? field.reviewer : undefined;
    const matched = extractionMatchesRecord(field) ? "Correct" : NEEDS_REVIEW;
    return [
      {
        id: ids.verdict,
        label: field.label,
        kind: "verdict",
        proposed: lane ? lane.verdict : matched,
        confidence: field.confidence,
      },
      {
        id: ids.contract,
        label: `${field.label} · ${labels.extracted.toLowerCase()}`,
        kind: "contractValue",
        proposed: lane?.extractedValue ?? field.extractedValue,
      },
      {
        id: ids.system,
        label: `${field.label} · ${labels.record.toLowerCase()}`,
        kind: "systemValue",
        proposed: lane?.recordValue ?? field.recordValue,
      },
    ];
  });

export const evidenceReasons = (
  fields: ComparisonField[],
  proposedBy?: string,
): ReviewReason[] =>
  fields.flatMap((field) =>
    field.evidence
      ? [
          {
            id: `evidence-${field.id}`,
            title: field.evidence,
            detail: `${extractionMatchesRecord(field) ? "Match" : "Mismatch"} on ${field.label}`,
            partId: idsOf(field).verdict,
            source: proposedBy,
            confidence: field.confidence,
          },
        ]
      : [],
  );

export const correctionPartId = (verdict: string, ids: ComparisonIds) => {
  if (verdict === "Extraction wrong") return ids.contract;
  if (verdict === "System value wrong") return ids.system;
  return null;
};

export const fieldStatus = (
  field: ComparisonField,
  qc: boolean,
  looked: Record<string, boolean>,
  findPart: FindPart,
): FieldStatus => {
  const ids = idsOf(field);
  if (!looked[ids.verdict]) return "pending";
  if (qc) {
    const changed = Object.values(ids).some((id) => {
      const part = findPart(id);
      return !!part && partChanged(part);
    });
    return changed ? "flagged" : "validated";
  }
  return findPart(ids.verdict)?.value === "Correct" ? "validated" : "flagged";
};

export const coverageCounts = (statuses: FieldStatus[]) => {
  const count = (status: FieldStatus) =>
    statuses.filter((candidate) => candidate === status).length;
  return {
    validated: count("validated"),
    flagged: count("flagged"),
    pending: count("pending"),
  };
};

const lacksCorrection = (
  field: ComparisonField,
  qc: boolean,
  findPart: FindPart,
) => {
  const ids = idsOf(field);
  const verdict = findPart(ids.verdict);
  if (!verdict || (qc && verdict.value === verdict.proposed)) return false;
  const correctionId = correctionPartId(verdict.value, ids);
  const corrected = correctionId ? findPart(correctionId) : undefined;
  return !!corrected && corrected.value === corrected.proposed;
};

export const comparisonGate =
  (fields: ComparisonField[], qc: boolean): CompletionGate =>
  (parts) => {
    const partsById = new Map(parts.map((part) => [part.id, part]));
    const findPart: FindPart = (id) => partsById.get(id);
    const open = fields.filter(
      (field) => !findPart(idsOf(field).verdict)?.looked,
    );
    if (open.length) {
      return `${open.length} ${open.length === 1 ? "field" : "fields"} still ${qc ? "to audit" : "to review"}.`;
    }
    const uncorrected = fields.find((field) =>
      lacksCorrection(field, qc, findPart),
    );
    return uncorrected
      ? `Add the corrected value for ${uncorrected.label}.`
      : null;
  };
