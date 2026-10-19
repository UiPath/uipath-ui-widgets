import { refuse } from "./payload.js";
import type {
  ArtifactRef,
  DocumentArtifactRefs,
  TraceSpan,
  TraceSpanAttachment,
} from "./types.js";

const DIGITIZATION_SPAN_TYPE = "idpDigitization";

interface DigitizationArtifacts {
  domAttachmentId?: string;
  textAttachmentId?: string;
  normalizedPdfAttachmentId?: string;
}

// The service sends attributes as a JSON string; take an object as it is too.
const parseAttributes = (
  attributes: unknown,
): Record<string, unknown> | null => {
  let parsed = attributes;
  if (typeof attributes === "string") {
    try {
      parsed = JSON.parse(attributes);
    } catch {
      return null;
    }
  }
  return parsed && typeof parsed === "object"
    ? (parsed as Record<string, unknown>)
    : null;
};

// The ids on `digitizationArtifacts` are bucket *paths*; the bucket holding
// each one is only on the span's attachment list, matched by that path.
const toArtifactRef = (
  attachments: TraceSpanAttachment[],
  fileName: string | undefined,
): ArtifactRef | null => {
  if (!fileName) return null;
  const attachment = attachments.find((a) => a.fileName === fileName);
  return attachment ? { bucketId: attachment.id, fileName } : null;
};

/** The document and its DOM are required to render; the OCR text is not. */
export function resolveDocumentArtifacts(
  spans: TraceSpan[],
): DocumentArtifactRefs {
  // Nothing on a span ties it to the extraction it fed, so with more than one
  // the document could belong to another extraction: refuse rather than guess.
  const digitizations = spans.filter(
    (s) => s.spanType === DIGITIZATION_SPAN_TYPE,
  );
  if (digitizations.length > 1) {
    refuse(
      `the trace carries ${digitizations.length} ${DIGITIZATION_SPAN_TYPE} spans, so the document cannot be matched to this extraction`,
    );
  }
  const span = digitizations[0];
  if (!span) {
    refuse(`the trace carries no ${DIGITIZATION_SPAN_TYPE} span`);
  }
  const attributes = parseAttributes(span.attributes);
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
  const attachments = span.attachments ?? [];
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
