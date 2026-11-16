import type { CsContentValidationData } from "@uipath/du-utils";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";

/**
 * Fetches a file's classification artifacts from its storage bucket, tied to
 * a component's lifecycle. The hook counterpart of `fetchCsDocumentArtifacts`
 * — reach for that one when the fetch is not driven by render.
 */
export function useCsDocumentArtifacts(
  sdk: UiPath,
  data: CsContentValidationData,
) {
  const { artifacts, error } = useResolvedArtifacts({ sdk, data });
  return { artifacts, error };
}
