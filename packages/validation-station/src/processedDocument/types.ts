// The Flow IDP node's data contract, owned by `@uipath/du-utils`.
export type {
  ProcessedDocument,
  ProcessedDocumentMetadata,
  ProcessedDocumentTaxonomy,
  ProcessedDocumentType,
} from "@uipath/du-utils";

// ─── Internal: shared by the parsers and the platform client ─────────────────

/** What a review is recorded against, and the folder every call is made in. */
export interface FeedbackAnchor {
  traceId: string;
  spanId: string;
  folderKey: string;
}

export interface TraceSpanAttachment {
  /** The storage bucket holding the file. */
  id: string;
  /** The path inside the bucket. */
  fileName: string;
}

/** The fields of a trace span the artifact resolver reads. */
export interface TraceSpan {
  id: string;
  spanType: string | null;
  /** Typed as an object by the SDK, but the service sends a JSON string. */
  attributes: unknown;
  attachments: TraceSpanAttachment[] | null;
}

export interface ArtifactRef {
  bucketId: string;
  fileName: string;
}

export interface DocumentArtifactRefs {
  /** The normalized PDF. */
  document: ArtifactRef;
  /** Gzipped. */
  dom: ArtifactRef;
  /** Gzipped. */
  text: ArtifactRef | null;
}

/** An edit replaces the whole record, so an absent field is sent as `null`. */
export interface FeedbackWrite {
  isPositive: boolean;
  /** A serialized {@link RecordedReview}. */
  metadata?: string;
  comment?: string;
}

export interface FeedbackRecord {
  id: string;
  metadata?: string;
}
