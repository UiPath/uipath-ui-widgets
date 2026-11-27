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

// The payload's id comes from Flow and the span's from the service that
// digitized, so neither promises the other a GUID's letter case.
const isSameRun = (spanRunId: unknown, pipelineRunId: string): boolean =>
  typeof spanRunId === "string" &&
  spanRunId.toLowerCase() === pipelineRunId.toLowerCase();

/**
 * The artifacts of the document digitized for the pipeline run
 * `pipelineRunId`. The document and its DOM are required to render; the OCR
 * text is not.
 */
export function resolveDocumentArtifacts(
  spans: TraceSpan[],
  pipelineRunId: string,
): DocumentArtifactRefs {
  // A Flow run's trace holds every extraction it ran, and each run stamps its
  // digitization span with its own id: pick by that, never by position.
  const ofRun = spans.flatMap((span) => {
    if (span.spanType !== DIGITIZATION_SPAN_TYPE) return [];
    const attributes = parseAttributes(span.attributes);
    if (!attributes || !isSameRun(attributes["pipelineRunId"], pipelineRunId)) {
      return [];
    }
    return [{ span, attributes }];
  });
  if (ofRun.length > 1) {
    refuse(
      `the trace carries ${ofRun.length} ${DIGITIZATION_SPAN_TYPE} spans for pipeline run ${pipelineRunId}`,
    );
  }
  const match = ofRun[0];
  if (!match) {
    refuse(
      `the trace carries no ${DIGITIZATION_SPAN_TYPE} span for pipeline run ${pipelineRunId}`,
    );
  }
  const { span, attributes } = match;
  const artifacts = attributes["digitizationArtifacts"];
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    refuse(
      `the ${DIGITIZATION_SPAN_TYPE} span declares no digitizationArtifacts`,
    );
  }
  if (artifacts.length > 1) {
    refuse(
      `the pipeline run digitized ${artifacts.length} documents, and only one can be validated`,
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
    refuse("the pipeline run produced no document artifact");
  }
  if (!dom) {
    refuse("the pipeline run produced no dom artifact");
  }

  return {
    document,
    dom,
    text: toArtifactRef(attachments, artifact?.textAttachmentId),
  };
}
