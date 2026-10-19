import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { ProcessedDocument } from "./processedDocument/types.js";

/** The one payload a widget loads from and saves to. */
export type SelectedPayload =
  | { data: DuFramework.ContentValidationData; processedDocument?: undefined }
  | { data?: undefined; processedDocument: ProcessedDocument }
  | { data?: undefined; processedDocument?: undefined };

/**
 * `data` wins when both payloads are set, matching the web component. Loading
 * and saving both resolve through here so they cannot disagree on the source.
 */
export function selectPayload(
  data: DuFramework.ContentValidationData | undefined,
  processedDocument: ProcessedDocument | undefined,
): SelectedPayload {
  if (data) return { data };
  if (processedDocument) return { processedDocument };
  return {};
}
