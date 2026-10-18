import type {
  IVsSaveExceptionReportRequest,
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { SaveValidatedDataResult } from "../saveValidatedDataUtil.js";
import { describeForHost } from "./errors.js";
import { validateProcessedDocument } from "./payload.js";
import { createPlatformClient } from "./platformClient.js";
import { serializeReview } from "./review.js";
import type { FeedbackWrite, ProcessedDocument } from "./types.js";

// Saves for one span run one at a time: find-then-create is not atomic, so two
// quick saves would otherwise both find no record and both create one.
const savesBySpan = new Map<string, Promise<unknown>>();

function oneAtATime<T>(key: string, task: () => Promise<T>): Promise<T> {
  const next = (savesBySpan.get(key) ?? Promise.resolve()).then(task, task);
  savesBySpan.set(key, next);
  const release = () => {
    if (savesBySpan.get(key) === next) savesBySpan.delete(key);
  };
  next.then(release, release);
  return next;
}

// Edits the span's newest record, or creates one, so the widget and a host
// saving outside it always land on the record the next load reopens.
async function recordReview(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
  write: () => FeedbackWrite,
): Promise<SaveValidatedDataResult> {
  try {
    const { anchor } = validateProcessedDocument(processedDocument);
    const body = write();
    const client = createPlatformClient(sdk);
    await oneAtATime(`${anchor.traceId}/${anchor.spanId}`, async () => {
      const existing = await client.findFeedback(anchor);
      await (existing
        ? client.editFeedback(anchor, existing.id, body)
        : client.createFeedback(anchor, body));
    });
    return { success: true };
  } catch (error) {
    // The result goes to the host's callbacks, not telemetry, so it may carry
    // the service's detail.
    return { success: false, error: describeForHost(error) };
  }
}

/**
 * Records a submitted {@link ProcessedDocument} review. The downstream Flow
 * node reads the result from the task completion, so complete the task with
 * `request.validatedData` whatever the outcome.
 */
export function submitProcessedDocument(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
  request: IVsSaveValidatedDataRequest,
): Promise<SaveValidatedDataResult> {
  return recordReview(sdk, processedDocument, () => ({
    isPositive: true,
    metadata: serializeReview(request.validatedData, false),
  }));
}

/**
 * Saves a draft of a {@link ProcessedDocument} review; the next load opens on
 * it. Writes the same record as a submit, flagged `draft` — what makes a
 * submit final is the host completing the task.
 */
export function saveProcessedDocumentAsDraft(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
  request: IVsSaveValidatedDataAsDraftRequest,
): Promise<SaveValidatedDataResult> {
  return recordReview(sdk, processedDocument, () => ({
    isPositive: true,
    metadata: serializeReview(request.validatedData, true),
  }));
}

/**
 * Records a {@link ProcessedDocument} rejected as an exception, replacing any
 * saved draft. As with a submit, completing the task is yours.
 */
export function reportProcessedDocumentException(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
  request: IVsSaveExceptionReportRequest,
): Promise<SaveValidatedDataResult> {
  const reason =
    (request.exceptionReport as { Reason?: string | null } | null)?.Reason ??
    "";
  return recordReview(sdk, processedDocument, () => ({
    isPositive: false,
    comment: reason,
  }));
}
