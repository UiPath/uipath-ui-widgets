import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts } from "./bucketArtifactsUtil.js";
import { fetchProcessedDocumentArtifacts } from "./processedDocument/artifacts.js";
import type { ProcessedDocument } from "./processedDocument/types.js";
import {
  type DuDocumentArtifacts,
  type DuFrameworkDocumentArtifacts,
  TelemetryEvent,
  TelemetryStatus,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

interface DuArtifactsSourceBase {
  /** SDK instance — required for self-fetching mode. */
  sdk?: UiPath;
  /**
   * Content-validation descriptor — self-fetching from a storage bucket.
   * Carries the bucket paths and the folder they live in (`FolderId` or
   * `FolderKey`).
   */
  data?: DuFramework.ContentValidationData;
  /** Document id. Falls back to `data.DocumentId`, else the `processedDocument`'s trace id. */
  documentId?: string;
}

/** The subcomponents' data source: {@link DuArtifactsSource} without an IXP document. */
export interface DuFrameworkArtifactsSource extends DuArtifactsSourceBase {
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: DuFrameworkDocumentArtifacts;
}

/**
 * `ValidationStation`'s data source. Three mutually-exclusive modes:
 *
 * 1. **Pre-fetched** — pass `artifacts` (and usually `documentId`). No HTTP
 *    call is made. This is the composition mode: a parent fetches once and
 *    hands the same artifacts to a linked viewer + fields-form + table-editor,
 *    and the mode to use when the host already holds the taxonomy / extraction
 *    result / DOM in memory rather than in a storage bucket.
 * 2. **Self-fetching, bucket** — pass `sdk` + `data`. The hook fetches the
 *    bucket artifacts itself from the paths on `data`, scoped to the folder
 *    `data` names.
 * 3. **Self-fetching, Flow** — pass `sdk` + `processedDocument`. The hook
 *    fetches the document's artifacts through its producing run, as
 *    `fetchProcessedDocumentArtifacts` does.
 *
 * `data` wins when both it and `processedDocument` are set, as it does on the
 * web component.
 */
export interface DuArtifactsSource extends DuArtifactsSourceBase {
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: DuDocumentArtifacts;
  /** A Flow IDP node's output — self-fetching through its producing run. */
  processedDocument?: ProcessedDocument;
}

/** The artifacts a source can resolve to — narrowed by the `artifacts` it accepts. */
export type ArtifactsOf<S extends DuArtifactsSource> = NonNullable<
  S["artifacts"]
>;

export interface ResolvedArtifacts<
  A extends DuDocumentArtifacts = DuDocumentArtifacts,
> {
  artifacts: A | null;
  error: string | null;
  documentId: string | undefined;
}

/**
 * Resolves the artifacts a widget needs — `ValidationStation` and every
 * subcomponent alike — transparently handling both the pre-fetched and
 * self-fetching modes described on {@link DuArtifactsSource}.
 */
export function useResolvedArtifacts<S extends DuArtifactsSource>(
  source: S,
): ResolvedArtifacts<ArtifactsOf<S>> {
  const { sdk, data, artifacts: provided, documentId } = source;
  // `data` wins when both payloads are set, matching the web component.
  const processedDocument = data ? undefined : source.processedDocument;
  const resolvedDocumentId =
    documentId ?? data?.DocumentId ?? processedDocument?.metadata?.traceId;
  // Tagged with the document it belongs to, so another document shows the
  // loading state instead of the previous one while its fetch is in flight.
  // By id rather than payload identity: a caller passing an inline payload
  // would otherwise never see its own fetch land.
  const [outcome, setOutcome] = useState<{
    documentId: string | undefined;
    artifacts: DuDocumentArtifacts | null;
    error: string | null;
  } | null>(null);
  const hasFolder = !!(data?.FolderKey || data?.FolderId);
  // Fetch only when the caller did not supply artifacts and a full context is
  // present (the missing-folder case is surfaced at render).
  const shouldFetch =
    !provided && !!sdk && (data ? hasFolder : !!processedDocument);

  // Keep the latest sdk reachable so each fetch uses the current instance (token
  // refresh / tenant switch) without making sdk identity a fetch trigger.
  const sdkRef = useRef(sdk);
  useEffect(() => {
    sdkRef.current = sdk;
  }, [sdk]);

  useEffect(() => {
    if (!shouldFetch) return;

    let cancelled = false;
    // Build the fetch from the CURRENT sdk each time — caching it in a ref
    // would pin the original sdk's auth/base URL.
    const pending: Promise<DuDocumentArtifacts> = data
      ? fetchBucketArtifacts(new BucketService(sdkRef.current!), data)
      : fetchProcessedDocumentArtifacts(sdkRef.current!, processedDocument!);

    pending
      .then((artifacts) => {
        if (!cancelled) {
          setOutcome({
            documentId: resolvedDocumentId,
            artifacts,
            error: null,
          });
          trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Success);
        }
      })
      .catch((er) => {
        if (!cancelled) {
          const message = er instanceof Error ? er.message : String(er);
          setOutcome({
            documentId: resolvedDocumentId,
            artifacts: null,
            error: message,
          });
          trackTelemetry(TelemetryEvent.Load, TelemetryStatus.Error, {
            error: message,
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // Keyed on payload identity: the fetch reads the bucket PATH fields off
    // `data` (the trace ids off `processedDocument`), not just the document id,
    // so a new payload with the same id must refetch. Callers pass a stable
    // reference (React state) so this does not refetch on unrelated re-renders.
  }, [shouldFetch, data, processedDocument, resolvedDocumentId]);

  if (provided) {
    return {
      artifacts: provided as ArtifactsOf<S>,
      error: null,
      documentId: resolvedDocumentId,
    };
  }

  if (!sdk || !(data || processedDocument)) {
    return {
      artifacts: null,
      error:
        "No data source provided. Pass `artifacts` (pre-fetched), or `sdk` + `data` or `sdk` + `processedDocument` (to fetch).",
      documentId: resolvedDocumentId,
    };
  }

  if (data && !hasFolder) {
    return {
      artifacts: null,
      error:
        "ContentValidationData must carry FolderId or FolderKey (the storage bucket's folder).",
      documentId: resolvedDocumentId,
    };
  }

  const current = outcome?.documentId === resolvedDocumentId ? outcome : null;
  return {
    artifacts: (current?.artifacts ?? null) as ArtifactsOf<S> | null,
    error: current?.error ?? null,
    documentId: resolvedDocumentId,
  };
}
