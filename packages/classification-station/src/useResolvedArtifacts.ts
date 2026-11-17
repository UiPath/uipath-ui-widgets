import { BucketService } from "@uipath/uipath-typescript/buckets";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts, folderScope } from "./bucketArtifactsUtil.js";
import {
  type CsArtifactsSource,
  type CsDocumentArtifacts,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

export interface ResolvedArtifacts {
  artifacts: CsDocumentArtifacts | null;
  error: string | null;
  documentId: string | undefined;
}

/**
 * Resolves the artifacts `ClassificationStation` needs, transparently handling
 * both the pre-fetched and self-fetching modes described on
 * {@link CsArtifactsSource}.
 */
export function useResolvedArtifacts(
  source: CsArtifactsSource,
): ResolvedArtifacts {
  const { sdk, data, artifacts: provided, documentId } = source;
  const resolvedDocumentId = documentId ?? data?.DocumentId;
  // The outcome is tagged with the document it belongs to, so another
  // document shows the loading state instead of the previous one while its
  // fetch is in flight.
  const [outcome, setOutcome] = useState<{
    key: string | undefined;
    artifacts: CsDocumentArtifacts | null;
    error: string | null;
  } | null>(null);
  const hasFolder = !!data && !!folderScope(data);
  // Fetch only when the caller did not supply artifacts and a full context is
  // present (the missing-folder case is surfaced at render).
  const shouldFetch = !provided && !!sdk && hasFolder;

  // Keep the latest sdk reachable so each fetch uses the current instance
  // (token refresh / tenant switch) without making sdk identity a trigger.
  const sdkRef = useRef(sdk);
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;
    fetchBucketArtifacts(new BucketService(sdkRef.current!), data!)
      .then((artifacts) => {
        if (cancelled) return;
        setOutcome({ key: resolvedDocumentId, artifacts, error: null });
        trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Success);
      })
      .catch((er: unknown) => {
        if (cancelled) return;
        const message = er instanceof Error ? er.message : String(er);
        setOutcome({
          key: resolvedDocumentId,
          artifacts: null,
          error: message,
        });
        trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Error, {
          error: message,
        });
      });

    return () => {
      cancelled = true;
    };
    // Keyed on payload identity: the fetch reads the bucket PATH fields off
    // `data`, not just the document id, so a new payload with the same id must
    // refetch. Callers pass a stable reference (React state).
  }, [shouldFetch, data, resolvedDocumentId]);

  if (provided) {
    return { artifacts: provided, error: null, documentId: resolvedDocumentId };
  }

  if (!sdk || !data) {
    return {
      artifacts: null,
      error:
        "No data source provided. Pass `artifacts` (pre-fetched), or `sdk` + `data` (to fetch).",
      documentId: resolvedDocumentId,
    };
  }

  if (!hasFolder) {
    return {
      artifacts: null,
      error:
        "CsContentValidationData must carry FolderId or FolderKey (the storage bucket's folder).",
      documentId: resolvedDocumentId,
    };
  }

  const current = outcome?.key === resolvedDocumentId ? outcome : null;
  return {
    artifacts: current?.artifacts ?? null,
    error: current?.error ?? null,
    documentId: resolvedDocumentId,
  };
}
