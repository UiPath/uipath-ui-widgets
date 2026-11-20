import type { UiPath } from "@uipath/uipath-typescript/core";
import type { ProcessedDocument } from "./processedDocument/types.js";
import { useResolvedArtifacts } from "./useResolvedArtifacts.js";

/**
 * Fetches a Flow document's artifacts through the run that produced it, tied
 * to a component's lifecycle. The IXP counterpart of `useDuDocumentArtifacts`,
 * and the hook counterpart of `fetchProcessedDocumentArtifacts` — reach for
 * that one when the fetch is not driven by render.
 *
 * Fetch once in a parent and pass the `artifacts` to every linked subcomponent,
 * rather than giving each one `sdk` + `processedDocument` to fetch for itself.
 */
export function useProcessedDocumentArtifacts(
  sdk: UiPath,
  processedDocument: ProcessedDocument,
) {
  const { artifacts, error } = useResolvedArtifacts({
    sdk,
    processedDocument,
  });
  return { artifacts, error };
}
