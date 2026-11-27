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
  /** The extraction's pipeline run, stamped on its trace's spans. */
  pipelineRunId: string;
}

/**
 * Refuses a payload it cannot render: the artifacts are unreachable without
 * `traceId` and `folderKey`, a review cannot be recorded without `spanId`, and
 * without `pipelineRunId` the document has no id and cannot be told apart from
 * the Flow run's other extractions on the trace.
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
  const { traceId, spanId, folderKey, pipelineRunId } = metadata ?? {};
  if (!isNonEmptyString(traceId)) refuse("metadata.traceId is empty");
  if (!isNonEmptyString(spanId)) refuse("metadata.spanId is empty");
  if (!isNonEmptyString(folderKey)) refuse("metadata.folderKey is empty");
  if (!isNonEmptyString(pipelineRunId)) {
    refuse("metadata.pipelineRunId is empty");
  }

  return {
    taxonomy,
    extraction: result,
    anchor: { traceId, spanId, folderKey },
    pipelineRunId,
  };
}
