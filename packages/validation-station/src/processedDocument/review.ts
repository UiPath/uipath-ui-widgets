import type { IXPExtraction } from "@uipath/du-validation-station-wc";
import { isIXPExtraction } from "../ixpUtil.js";

/**
 * What a review's Feedback record holds as `metadata`, serialized — the shape
 * the Angular Validation Station writes (`ValidatedFlowExtraction`), so either
 * reopens a review the other saved. `draft` tells a saved draft from a
 * submitted result; both reopen on `extraction`.
 */
export interface RecordedReview {
  draft: boolean;
  extraction: IXPExtraction;
}

const isRecordedReview = (value: unknown): value is RecordedReview =>
  !!value &&
  typeof value === "object" &&
  typeof (value as { draft?: unknown }).draft === "boolean" &&
  isIXPExtraction((value as { extraction?: unknown }).extraction);

/** Serializes a review of `validatedData`, which must be an IXP extraction. */
export function serializeReview(
  validatedData: unknown,
  draft: boolean,
): string {
  if (!isIXPExtraction(validatedData)) {
    throw new Error(
      "validatedData is not an IXP extraction, so it cannot be recorded against a ProcessedDocument.",
    );
  }
  const review: RecordedReview = { draft, extraction: validatedData };
  return JSON.stringify(review);
}

/**
 * The extraction a review's record holds, draft or submitted, or `null` when
 * the metadata is not a {@link RecordedReview} — the document then opens on the
 * payload's result, as the Angular Validation Station does.
 */
export function parseReview(metadata: string): IXPExtraction | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    return isRecordedReview(parsed) ? parsed.extraction : null;
  } catch {
    return null;
  }
}
