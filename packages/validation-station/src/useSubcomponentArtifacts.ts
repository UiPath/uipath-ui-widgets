import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts } from "./bucketArtifactsUtil.js";
import {
  type BucketArtifacts,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

/**
 * Data source shared by every subcomponent wrapper. Two mutually-exclusive
 * modes:
 *
 * 1. **Pre-fetched** — pass `artifacts` (and usually `documentId`). No HTTP
 *    call is made. This is the composition mode: a parent fetches once and
 *    hands the same artifacts to a linked viewer + fields-form + table-editor.
 * 2. **Self-fetching** — pass `sdk` + `data` (+ optional `folderId`). The hook
 *    fetches the bucket artifacts itself, exactly like `ValidationStation`.
 */
export interface SubcomponentDataSource {
  /** SDK instance — required for self-fetching mode. */
  sdk?: UiPath;
  /** Content-validation descriptor — required for self-fetching mode. */
  data?: DuFramework.ContentValidationData;
  /** Storage-bucket folder id. Falls back to `data.FolderId`. */
  folderId?: number;
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: BucketArtifacts;
  /** Document id. Falls back to `data.DocumentId`. */
  documentId?: string;
}

export interface ResolvedArtifacts {
  artifacts: BucketArtifacts | null;
  error: string | null;
  documentId: string | undefined;
  /**
   * True when a full self-fetching / persistence context (`sdk` + `data` +
   * resolved folder id) is available — i.e. the fields-form can round-trip
   * submit / save-as-draft through the SDK.
   */
  canPersist: boolean;
  /** Folder id used for fetch/persist, resolved from the prop or `data.FolderId`. */
  resolvedFolderId: number | undefined;
}

/**
 * Resolves the artifacts a subcomponent needs, transparently handling both the
 * pre-fetched and self-fetching modes described on {@link SubcomponentDataSource}.
 */
export function useSubcomponentArtifacts({
  sdk,
  data,
  folderId,
  artifacts: provided,
  documentId,
}: SubcomponentDataSource): ResolvedArtifacts {
  const [fetched, setFetched] = useState<BucketArtifacts | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resolvedFolderId = folderId ?? data?.FolderId;
  const resolvedDocumentId = documentId ?? data?.DocumentId;
  const canPersist = !!sdk && !!data && !!resolvedFolderId;
  // Fetch only when the caller did not supply artifacts and a full context is
  // present (the missing-folderId case is surfaced at render).
  const shouldFetch = !provided && canPersist;

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

    fetchBucketArtifacts(bucketService, data!, resolvedFolderId!)
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
    // Keyed on `data` identity (as useBucketArtifacts always has) + folder: the
    // fetch reads the bucket PATH fields off `data`, not just DocumentId, so a
    // new payload with the same DocumentId but different paths must refetch.
    // Callers pass a stable `data` reference (React state) so this does not
    // refetch on unrelated re-renders.
  }, [shouldFetch, data, resolvedFolderId]);

  if (provided) {
    return {
      artifacts: provided,
      error: null,
      documentId: resolvedDocumentId,
      canPersist,
      resolvedFolderId,
    };
  }

  if (!sdk || !data) {
    return {
      artifacts: null,
      error:
        "No data source provided. Pass `artifacts` (pre-fetched) or `sdk` + `data` (to fetch).",
      documentId: resolvedDocumentId,
      canPersist,
      resolvedFolderId,
    };
  }

  if (!resolvedFolderId) {
    return {
      artifacts: null,
      error:
        "folderId of Storage bucket is required. Provide it as a prop or ensure data.FolderId is set.",
      documentId: resolvedDocumentId,
      canPersist,
      resolvedFolderId,
    };
  }

  return {
    artifacts: fetched,
    error,
    documentId: resolvedDocumentId,
    canPersist,
    resolvedFolderId,
  };
}
