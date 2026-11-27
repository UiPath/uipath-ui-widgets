import type {
  IXPExtraction,
  IXPReviewedExtraction,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { gunzipSync, strFromU8 } from "fflate";
import type { IxpDocumentArtifacts } from "../types.js";
import { parseDigitizedDocument } from "./dom.js";
import { validateProcessedDocument } from "./payload.js";
import { type PlatformClient, createPlatformClient } from "./platformClient.js";
import { parseReview, toReviewedExtraction } from "./review.js";
import { resolveDocumentArtifacts } from "./spans.js";
import type {
  ArtifactRef,
  FeedbackAnchor,
  ProcessedDocument,
  TraceSpan,
} from "./types.js";

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
// would let the next save overwrite the reviewer's draft with it. Without a
// draft, the payload's own `confirmations` open confirmed.
async function resultToOpenOn(
  client: PlatformClient,
  anchor: FeedbackAnchor,
  payloadResult: IXPExtraction,
): Promise<IXPReviewedExtraction> {
  const record = await client.findFeedback(anchor);
  const recorded = record?.metadata ? parseReview(record.metadata) : null;
  return recorded ?? toReviewedExtraction(payloadResult);
}

// Loads under way, by SDK and payload. React's StrictMode runs effects twice in
// development, and a host may remount quickly; both would otherwise send every
// request again. Keyed by the payload object, not its trace, so two payloads
// never share a result, and dropped once settled: a later load fetches afresh,
// and a failed one is never reused.
const loadsInFlight = new WeakMap<
  UiPath,
  WeakMap<ProcessedDocument, Promise<IxpDocumentArtifacts>>
>();

// Trace reads under way, by SDK and trace. The extractions of one Flow run
// share a trace, and a host showing several of them at once would otherwise
// read the whole trace once per document. Dropped once settled, like
// `loadsInFlight`.
const spansInFlight = new WeakMap<UiPath, Map<string, Promise<TraceSpan[]>>>();

function spansOf(
  sdk: UiPath,
  client: PlatformClient,
  traceId: string,
): Promise<TraceSpan[]> {
  return shareWhilePending(
    ofSdk(spansInFlight, sdk, () => new Map()),
    traceId,
    () => client.getSpans(traceId),
  );
}

interface PendingWork<K, V> {
  get(key: K): Promise<V> | undefined;
  set(key: K, work: Promise<V>): unknown;
  delete(key: K): boolean;
}

// Hands a caller the work already under way for `key`, else starts it. The
// entry is dropped once settled, so a later call starts afresh and a failure is
// never reused.
function shareWhilePending<K, V>(
  pending: PendingWork<K, V>,
  key: K,
  start: () => Promise<V>,
): Promise<V> {
  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const work = start();
  pending.set(key, work);
  const settle = () => {
    if (pending.get(key) === work) pending.delete(key);
  };
  work.then(settle, settle);
  return work;
}

function ofSdk<M extends object>(
  bySdk: WeakMap<UiPath, M>,
  sdk: UiPath,
  create: () => M,
): M {
  let forSdk = bySdk.get(sdk);
  if (!forSdk) {
    forSdk = create();
    bySdk.set(sdk, forSdk);
  }
  return forSdk;
}

/**
 * Fetches a {@link ProcessedDocument}'s artifacts, ready to pass as the
 * `artifacts` prop — the same fetch the widgets run when given `sdk` +
 * `processedDocument`. Opens on the draft last saved against the producing
 * span, else on the payload's result. A call while the same `sdk` is already
 * loading the same `processedDocument` shares that load.
 *
 * @throws if the payload is not a renderable extraction, or its run's trace
 * does not describe exactly one digitized document for its pipeline run.
 */
export function fetchProcessedDocumentArtifacts(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
): Promise<IxpDocumentArtifacts> {
  return shareWhilePending(
    ofSdk(loadsInFlight, sdk, () => new WeakMap()),
    processedDocument,
    () => loadArtifacts(sdk, processedDocument),
  );
}

async function loadArtifacts(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
): Promise<IxpDocumentArtifacts> {
  const { taxonomy, extraction, anchor, pipelineRunId } =
    validateProcessedDocument(processedDocument);
  const client = createPlatformClient(sdk);

  const refs = resolveDocumentArtifacts(
    await spansOf(sdk, client, anchor.traceId),
    pipelineRunId,
  );
  const read = async (ref: ArtifactRef) =>
    client.readBytes(await client.getEcsReadUri(ref, anchor));

  const [original, dom, text, extractionResult] = await Promise.all([
    read(refs.document).then((bytes) => PDF_DATA_URI_PREFIX + toBase64(bytes)),
    read(refs.dom).then((bytes) => parseDigitizedDocument(gunzipToText(bytes))),
    // Optional, so an unreadable one opens the document without it.
    refs.text ? read(refs.text).then(gunzipToText, () => "") : "",
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
