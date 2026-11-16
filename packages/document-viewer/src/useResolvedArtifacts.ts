import { BucketService } from "@uipath/uipath-typescript/buckets";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts, folderScope } from "./bucketArtifactsUtil.js";
import {
  type DvArtifactsSource,
  type DvDocumentArtifacts,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

export interface ResolvedArtifacts {
  artifacts: DvDocumentArtifacts | null;
  error: string | null;
}

/**
 * Resolves the artifacts `DocumentViewer` renders, transparently handling both
 * the pre-fetched and self-fetching modes described on
 * {@link DvArtifactsSource}.
 */
export function useResolvedArtifacts(
  source: DvArtifactsSource,
): ResolvedArtifacts {
  const { sdk, data, artifacts: provided } = source;
  // The outcome is tagged with the document it belongs to, so another
  // document shows the loading state instead of the previous one while its
  // fetch is in flight. The DOM path names the document when the id is unset.
  const key = data ? `${data.DocumentId}|${data.DocumentObjectModelPath}` : "";
  const [outcome, setOutcome] = useState<{
    key: string;
    artifacts: DvDocumentArtifacts | null;
    error: string | null;
  } | null>(null);
  const hasFolder = !!data && !!folderScope(data);
  const shouldFetch = !provided && !!sdk && hasFolder;

  // Keep the latest sdk reachable so each fetch uses the current instance
  // without making sdk identity a fetch trigger.
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
        setOutcome({ key, artifacts, error: null });
        trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Success);
      })
      .catch((er: unknown) => {
        if (cancelled) return;
        const message = er instanceof Error ? er.message : String(er);
        setOutcome({ key, artifacts: null, error: message });
        trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Error, {
          error: message,
        });
      });

    return () => {
      cancelled = true;
    };
    // Keyed on payload identity: a new payload must refetch even for the same
    // document. Callers pass a stable reference (React state).
  }, [shouldFetch, data, key]);

  if (provided) return { artifacts: provided, error: null };

  if (!sdk || !data) {
    return {
      artifacts: null,
      error:
        "No data source provided. Pass `artifacts` (pre-fetched), or `sdk` + `data` (to fetch).",
    };
  }

  if (!hasFolder) {
    return {
      artifacts: null,
      error:
        "The content data must carry FolderId or FolderKey (the storage bucket's folder).",
    };
  }

  const current = outcome?.key === key ? outcome : null;
  return {
    artifacts: current?.artifacts ?? null,
    error: current?.error ?? null,
  };
}
