import type {
  IXPExtraction,
  IXPTaxonomy,
} from "@uipath/du-validation-station-wc";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { isIXPExtraction, isIXPTaxonomy } from "../ixpUtil.js";
import type {
  ArtifactRef,
  FeedbackAnchor,
  TraceSpan,
  TraceSpanAttachment,
} from "./platformClient.js";
import type { ProcessedDocument } from "./types.js";

const DIGITIZATION_SPAN_TYPE = "idpDigitization";

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
    refuse(`type "${type}" is not an extraction`);
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

export interface DocumentArtifactRefs {
  /** The normalized PDF. */
  document: ArtifactRef;
  /** Gzipped. */
  dom: ArtifactRef;
  /** Gzipped. */
  text: ArtifactRef | null;
}

interface DigitizationArtifacts {
  domAttachmentId?: string;
  textAttachmentId?: string;
  normalizedPdfAttachmentId?: string;
}

const parseAttributes = (
  attributes: string | null,
): Record<string, unknown> | null => {
  if (!attributes) return null;
  try {
    const parsed: unknown = JSON.parse(attributes);
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
};

// The ids on `digitizationArtifacts` are bucket *paths*; the bucket holding
// each one is only on the span's attachment list, matched by that path.
const toArtifactRef = (
  attachments: TraceSpanAttachment[],
  fileName: string | undefined,
): ArtifactRef | null => {
  if (!fileName) return null;
  const attachment = attachments.find((a) => a.FileName === fileName);
  return attachment ? { bucketId: attachment.Id, fileName } : null;
};

/** The document and its DOM are required to render; the OCR text is not. */
export function resolveDocumentArtifacts(
  spans: TraceSpan[],
): DocumentArtifactRefs {
  const span = spans.find((s) => s.SpanType === DIGITIZATION_SPAN_TYPE);
  if (!span) {
    refuse(`the trace carries no ${DIGITIZATION_SPAN_TYPE} span`);
  }
  const attributes = parseAttributes(span.Attributes);
  if (!attributes) {
    refuse(`the ${DIGITIZATION_SPAN_TYPE} span carries no readable attributes`);
  }
  const artifacts = attributes["digitizationArtifacts"];
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    refuse(
      `the ${DIGITIZATION_SPAN_TYPE} span declares no digitizationArtifacts`,
    );
  }
  if (artifacts.length > 1) {
    refuse(
      `the run digitized ${artifacts.length} documents, and only one can be validated`,
    );
  }
  const artifact = artifacts[0] as DigitizationArtifacts | null;
  const attachments = span.Attachments ?? [];
  const document = toArtifactRef(
    attachments,
    artifact?.normalizedPdfAttachmentId,
  );
  const dom = toArtifactRef(attachments, artifact?.domAttachmentId);
  if (!document) {
    refuse("the run produced no document artifact");
  }
  if (!dom) {
    refuse("the run produced no dom artifact");
  }

  return {
    document,
    dom,
    text: toArtifactRef(attachments, artifact?.textAttachmentId),
  };
}

const toPascalCase = (key: string): string =>
  key.charAt(0).toUpperCase() + key.slice(1);

// Safe to rename every key: nothing in a DOM is a keyed map (its metadata
// travels as `{ Key, Value }` pairs), so no key is data.
const withPascalCaseKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withPascalCaseKeys);
  if (value == null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      toPascalCase(key),
      withPascalCaseKeys(nested),
    ]),
  );
};

// Refused rather than passed on: the web component walks every level unguarded,
// so a partial model would surface as a TypeError.
const isDigitizedDocument = (dom: unknown): boolean => {
  const pages = (dom as { Pages?: unknown } | null)?.Pages;
  return (
    Array.isArray(pages) &&
    pages.every(
      (page) =>
        Array.isArray(page?.Size) &&
        Array.isArray(page?.Sections) &&
        page.Sections.every(
          (section: { WordGroups?: unknown }) =>
            Array.isArray(section?.WordGroups) &&
            section.WordGroups.every(
              (group: { Words?: unknown }) =>
                Array.isArray(group?.Words) &&
                group.Words.every((word: { Box?: unknown }) =>
                  Array.isArray(word?.Box),
                ),
            ),
        ),
    )
  );
};

/**
 * The pipeline serializes the DOM with camelCase keys; the DU contracts are
 * PascalCase. An artifact that already arrives PascalCase passes through.
 */
export function parseDigitizedDocument(
  json: string,
): DuFramework.DocumentEntity {
  let parsed: unknown;
  try {
    parsed = withPascalCaseKeys(JSON.parse(json));
  } catch {
    refuse("the resolved document object model could not be read");
  }
  if (!isDigitizedDocument(parsed)) {
    refuse("the resolved document object model is not a digitized document");
  }
  return parsed as DuFramework.DocumentEntity;
}

export function parseRecordedResult(metadata: string): IXPExtraction | null {
  try {
    const parsed: unknown = JSON.parse(metadata);
    return isIXPExtraction(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
