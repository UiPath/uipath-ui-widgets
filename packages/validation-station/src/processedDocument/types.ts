// Mirrors `ProcessedDocument` from `@uipath/du-utils` 1.0.0-rc.2. Replace with
// a re-export once the repo's `min-release-age` lets the package be bumped.

export interface ProcessedDocumentMetadata {
  /** Correlation only. */
  pipelineRunId: string;
  /** The folder the producing run executed in — not necessarily the task's. */
  folderKey: string;
  traceId: string;
  /** The producing `idpExtraction` span, which a review is recorded against. */
  spanId: string;
}

export type ProcessedDocumentType =
  | "Extraction"
  | "Classification"
  | "Summarization";

export interface ProcessedDocumentTaxonomy {
  properties?: Record<string, unknown>;
  $defs?: Record<string, unknown>;
  type?: string | string[];
  required?: string[];
  additionalProperties?: boolean;
}

/**
 * The Flow counterpart of `ContentValidationData`. Carries the taxonomy and the
 * result inline; the document, DOM and OCR text are resolved through the
 * producing run's trace.
 */
export interface ProcessedDocument {
  version: string;
  type: ProcessedDocumentType;
  /** For `Extraction`, an `IXPExtraction`. */
  result: unknown;
  taxonomy: ProcessedDocumentTaxonomy;
  metadata: ProcessedDocumentMetadata;
}
