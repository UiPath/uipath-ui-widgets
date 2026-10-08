import type {
  IXPExtraction,
  IXPTaxonomy,
} from "@uipath/du-validation-station-wc";
import { isIXPExtraction, isIXPTaxonomy } from "../ixpUtil.js";
import type { FeedbackAnchor, ProcessedDocument } from "./types.js";

export function refuse(reason: string): never {
  throw new Error(`Cannot validate this ProcessedDocument: ${reason}.`);
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export interface ValidatedProcessedDocument {
  taxonomy: IXPTaxonomy;
  extraction: IXPExtraction;
  anchor: FeedbackAnchor;
}

/**
 * Refuses a payload it cannot render: the artifacts are unreachable without
 * `traceId` and `folderKey`, and a review cannot be recorded without `spanId`.
 */
export function validateProcessedDocument(
  processedDocument: ProcessedDocument,
): ValidatedProcessedDocument {
  const { type, taxonomy, result, metadata } = processedDocument;
  if (type !== "Extraction") {
    refuse("type is not Extraction");
  }
  if (!isIXPTaxonomy(taxonomy)) {
    refuse("taxonomy declares neither properties nor $defs");
  }
  if (!isIXPExtraction(result)) {
    refuse("result declares neither output nor attribution");
  }
  const { traceId, spanId, folderKey } = metadata ?? {};
  if (!isNonEmptyString(traceId)) refuse("metadata.traceId is empty");
  if (!isNonEmptyString(spanId)) refuse("metadata.spanId is empty");
  if (!isNonEmptyString(folderKey)) refuse("metadata.folderKey is empty");

  return {
    taxonomy,
    extraction: result,
    anchor: { traceId, spanId, folderKey },
  };
}
