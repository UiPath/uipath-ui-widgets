import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DocumentViewerContentData } from "./types.js";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";

/**
 * Fetches what the viewer renders from a task's storage bucket, tied to a
 * component's lifecycle. The hook counterpart of `fetchDvDocumentArtifacts` —
 * reach for that one when the fetch is not driven by render.
 */
export function useDvDocumentArtifacts(
  sdk: UiPath,
  data: DocumentViewerContentData,
) {
  return useResolvedArtifacts({ sdk, data });
}
