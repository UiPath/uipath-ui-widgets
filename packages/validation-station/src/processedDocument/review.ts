import type {
  IXPExtraction,
  IXPReviewedExtraction,
} from "@uipath/du-validation-station-wc";
import { isProcessedDocument } from "@uipath/du-utils";
import { isIXPExtraction } from "../ixpUtil.js";
import type { ProcessedDocument, ProcessedDocumentMetadata } from "./types.js";

/**
 * A {@link ProcessedDocument} after a human-in-the-loop review: the payload the
 * widget was given, with its `result` replaced by the validated one and
 * `metadata.hitl.draft` telling a draft from a submit.
 *
 * It is what a review's Feedback record holds as `metadata`, serialized — the
 * shape the Angular Validation Station writes, so either reopens a review the
 * other saved — and, from a submit, what the host completes the task with.
 */
export interface ValidatedProcessedDocument extends ProcessedDocument {
  /** The validated extraction. A draft's carries the reviewer's `confirmations`; a submit's none. */
  result: IXPReviewedExtraction;
  metadata: ProcessedDocumentMetadata & {
    /** Human-in-the-loop state, absent on a producer's output. */
    hitl: { draft: boolean };
  };
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

/** The extraction without its `confirmations`. */
const withoutConfirmations = (
  extraction: IXPReviewedExtraction,
): IXPExtraction => {
  const rest = { ...extraction };
  delete rest.confirmations;
  return rest;
};

/**
 * The extraction, keeping `confirmations` only when they are a list of JSON
 * Pointers — a malformed list confirms nothing, as the Angular station does.
 */
export function toReviewedExtraction(
  extraction: IXPReviewedExtraction,
): IXPReviewedExtraction {
  if (!("confirmations" in extraction)) return extraction;
  return isStringArray(extraction.confirmations)
    ? extraction
    : withoutConfirmations(extraction);
}

/**
 * The validated {@link ProcessedDocument}: `processedDocument` with `result`
 * replaced by `validatedData` and `metadata.hitl.draft` set. A submit's result
 * carries no `confirmations` — a submit confirms every value.
 *
 * Complete the Action Center task with a submit's document, verbatim: the node
 * downstream reads it as its output.
 *
 * @throws if `validatedData` is not an IXP extraction.
 */
export function toValidatedProcessedDocument(
  processedDocument: ProcessedDocument,
  validatedData: unknown,
  draft: boolean,
): ValidatedProcessedDocument {
  if (!isIXPExtraction(validatedData)) {
    throw new Error(
      "validatedData is not an IXP extraction, so it cannot be recorded against a ProcessedDocument.",
    );
  }
  return {
    ...processedDocument,
    result: draft
      ? (validatedData as IXPReviewedExtraction)
      : withoutConfirmations(validatedData),
    metadata: { ...processedDocument.metadata, hitl: { draft } },
  };
}

/**
 * The extraction a review's record holds, draft or submitted, or `null` when
 * the metadata is not a validated {@link ProcessedDocument} — the document then
 * opens on the payload's result, as the Angular Validation Station does. A
 * record in the retired `{ draft, extraction }` envelope is one of those.
 */
export function parseReview(metadata: string): IXPReviewedExtraction | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    return isProcessedDocument(parsed) && isIXPExtraction(parsed.result)
      ? toReviewedExtraction(parsed.result)
      : null;
  } catch {
    return null;
  }
}
