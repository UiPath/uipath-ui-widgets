import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useSubcomponentArtifacts } from "./useSubcomponentArtifacts.js";

/**
 * Fetches the bucket artifacts for a document-validation task.
 *
 * Thin wrapper over {@link useSubcomponentArtifacts}'s self-fetching mode, kept
 * as a focused `(sdk, data, folderId)` signature for the monolithic
 * `ValidationStation` and for composition parents that always fetch once and
 * hand the result to several subcomponents. All fetch/cancel/error logic lives
 * in the shared hook — this only narrows the return to `{ artifacts, error }`.
 */
export function useBucketArtifacts(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number | undefined,
) {
  const { artifacts, error } = useSubcomponentArtifacts({
    sdk,
    data,
    folderId,
  });
  return { artifacts, error };
}
