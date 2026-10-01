import type { IXPExtraction } from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { gunzipSync, strFromU8 } from "fflate";
import type { IxpDocumentArtifacts } from "../types.js";
import {
  type ArtifactRef,
  type FeedbackAnchor,
  type PlatformClient,
  createPlatformClient,
} from "./platformClient.js";
import type { ProcessedDocument } from "./types.js";
import {
  parseDigitizedDocument,
  parseRecordedResult,
  resolveDocumentArtifacts,
  validateProcessedDocument,
} from "./validate.js";

// The viewer takes a data URI, which the `ContentValidationData` artifact
// already is; this one is bare bytes.
const PDF_DATA_URI_PREFIX = "data:application/pdf;base64,";

// Chunked because `String.fromCharCode` takes one argument per byte: spreading
// a whole PDF throws a RangeError.
const CHUNK_SIZE = 8192;

const toBase64 = (data: ArrayBuffer): string => {
  const bytes = new Uint8Array(data);
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += CHUNK_SIZE) {
    binary += String.fromCharCode(
      ...bytes.subarray(offset, offset + CHUNK_SIZE),
    );
  }
  return btoa(binary);
};

// The pipeline's DOM and OCR text are raw gzip streams, not ZIP archives like
// the `ContentValidationData` artifacts.
const gunzipToText = (data: ArrayBuffer): string =>
  strFromU8(gunzipSync(new Uint8Array(data)));

// A failed lookup fails the load: opening on the payload's result instead
// would let the next save overwrite the reviewer's draft with it.
async function resultToOpenOn(
  client: PlatformClient,
  anchor: FeedbackAnchor,
  payloadResult: IXPExtraction,
): Promise<IXPExtraction> {
  const record = await client.findFeedback(anchor);
  const recorded = record?.metadata
    ? parseRecordedResult(record.metadata)
    : null;
  return recorded ?? payloadResult;
}

/**
 * Fetches a {@link ProcessedDocument}'s artifacts, ready to pass as the
 * `artifacts` prop — the same fetch the widgets run when given `sdk` +
 * `processedDocument`. Opens on the draft last saved against the producing
 * span, else on the payload's result.
 *
 * @throws if the payload is not a renderable extraction, or its run's trace
 * does not describe exactly one digitized document.
 */
export async function fetchProcessedDocumentArtifacts(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
): Promise<IxpDocumentArtifacts> {
  const { taxonomy, extraction, anchor } =
    validateProcessedDocument(processedDocument);
  const client = createPlatformClient(sdk);

  const refs = resolveDocumentArtifacts(
    await client.getSpans(anchor.traceId, anchor.folderKey),
  );
  const read = async (ref: ArtifactRef) =>
    client.readBytes(await client.getEcsReadUri(ref, anchor.folderKey));

  const [original, dom, text, extractionResult] = await Promise.all([
    read(refs.document).then((bytes) => PDF_DATA_URI_PREFIX + toBase64(bytes)),
    read(refs.dom).then((bytes) => parseDigitizedDocument(gunzipToText(bytes))),
    refs.text ? read(refs.text).then(gunzipToText) : "",
    resultToOpenOn(client, anchor, extraction),
  ]);

  return {
    taxonomy,
    extractionResult,
    dom,
    text,
    customizationInfo: {},
    original,
  };
}
