import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { useEffect, useState, useRef } from "react";
import { fetchBucketArtifacts } from "./bucketArtifactsUtil.js";
import type { BucketArtifacts } from "./types.js";

export function useBucketArtifacts(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number | undefined,
) {
  const bucketServiceRef = useRef(new BucketService(sdk));
  const [artifacts, setArtifacts] = useState<BucketArtifacts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedFolderId = folderId || data.FolderId;

  useEffect(() => {
    if (resolvedFolderId) {
      let cancelled = false;

      fetchBucketArtifacts(bucketServiceRef.current, data, resolvedFolderId)
        .then((result) => {
          if (!cancelled) {
            setArtifacts(result);
            setError(null);
          }
        })
        .catch((er) => {
          if (!cancelled) {
            setArtifacts(null);
            setError(er instanceof Error ? er.message : String(er));
          }
        });

      return () => {
        cancelled = true;
      };
    }
  }, [data, resolvedFolderId]);

  // Derive error for missing folderId at render time, not inside the effect
  if (!resolvedFolderId) {
    return {
      artifacts: null,
      error:
        "folderId of Storage bucket is required. Provide it as a prop or ensure data.FolderId is set.",
    };
  }

  return { artifacts, error };
}
