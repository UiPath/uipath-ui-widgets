import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";

/**
 * Fetches a document's artifacts from its storage bucket, tied to a component's
 * lifecycle. The hook counterpart of `fetchDuDocumentArtifacts` — reach for that
 * one when the fetch is not driven by render.
 */
export function useDuDocumentArtifacts(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number | undefined,
) {
  const { artifacts, error } = useResolvedArtifacts({
    sdk,
    data,
    folderId,
  });
  return { artifacts, error };
}
