import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts } from "./bucketArtifactsUtil.js";
import {
  type DuDocumentArtifacts,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

/**
 * Data source shared by `ValidationStation` and every subcomponent wrapper. Two
 * mutually-exclusive modes:
 *
 * 1. **Pre-fetched** — pass `artifacts` (and usually `documentId`). No HTTP
 *    call is made. This is the composition mode: a parent fetches once and
 *    hands the same artifacts to a linked viewer + fields-form + table-editor,
 *    and the mode to use when the host already holds the taxonomy / extraction
 *    result / DOM in memory rather than in a storage bucket.
 * 2. **Self-fetching** — pass `sdk` + `data`. The hook fetches the bucket
 *    artifacts itself from the paths on `data`, scoped to the folder `data`
 *    names.
 */
export interface DuArtifactsSource {
  /** SDK instance — required for self-fetching mode. */
  sdk?: UiPath;
  /**
   * Content-validation descriptor — required for self-fetching mode. Carries
   * the bucket paths and the folder they live in (`FolderId` or `FolderKey`).
   */
  data?: DuFramework.ContentValidationData;
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: DuDocumentArtifacts;
  /** Document id. Falls back to `data.DocumentId`. */
  documentId?: string;
}

export interface ResolvedArtifacts {
  artifacts: DuDocumentArtifacts | null;
  error: string | null;
  documentId: string | undefined;
}

/**
 * Resolves the artifacts a widget needs — `ValidationStation` and every
 * subcomponent alike — transparently handling both the pre-fetched and
 * self-fetching modes described on {@link DuArtifactsSource}.
 */
export function useResolvedArtifacts({
  sdk,
  data,
  artifacts: provided,
  documentId,
}: DuArtifactsSource): ResolvedArtifacts {
  const [fetched, setFetched] = useState<DuDocumentArtifacts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedDocumentId = documentId ?? data?.DocumentId;
  const hasFolder = !!(data?.FolderKey || data?.FolderId);
  // Fetch only when the caller did not supply artifacts and a full context is
  // present (the missing-folder case is surfaced at render).
  const shouldFetch = !provided && !!sdk && !!data && hasFolder;

  // Keep the latest sdk reachable so each fetch uses the current instance (token
  // refresh / tenant switch) without making sdk identity a fetch trigger.
  const sdkRef = useRef(sdk);
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;
    // Build the service from the CURRENT sdk on each fetch — caching it in a ref
    // would pin the original sdk's auth/base URL.
    const bucketService = new BucketService(sdkRef.current!);

    fetchBucketArtifacts(bucketService, data!)
      .then((result) => {
        if (!cancelled) {
          setFetched(result);
          setError(null);
          trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Success);
        }
      })
      .catch((er) => {
        if (!cancelled) {
          const message = er instanceof Error ? er.message : String(er);
          setFetched(null);
          setError(message);
          trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Error, {
            error: message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // Keyed on `data` identity: the fetch reads the bucket PATH fields off it,
    // not just DocumentId, so a new payload with the same DocumentId but
    // different paths must refetch. Callers pass a stable `data` reference
    // (React state) so this does not refetch on unrelated re-renders.
  }, [shouldFetch, data]);

  if (provided) {
    return {
      artifacts: provided,
      error: null,
      documentId: resolvedDocumentId,
    };
  }

  if (!sdk || !data) {
    return {
      artifacts: null,
      error:
        "No data source provided. Pass `artifacts` (pre-fetched) or `sdk` + `data` (to fetch).",
      documentId: resolvedDocumentId,
    };
  }

  if (!hasFolder) {
    return {
      artifacts: null,
      error:
        "ContentValidationData must carry FolderId or FolderKey (the storage bucket's folder).",
      documentId: resolvedDocumentId,
    };
  }

  return {
    artifacts: fetched,
    error,
    documentId: resolvedDocumentId,
  };
}
