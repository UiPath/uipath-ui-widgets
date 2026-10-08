import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { useEffect, useRef, useState } from "react";
import { fetchBucketArtifacts } from "./bucketArtifactsUtil.js";
import { selectPayload } from "./payloadSource.js";
import { fetchProcessedDocumentArtifacts } from "./processedDocument/artifacts.js";
import type { ProcessedDocument } from "./processedDocument/types.js";
import {
  type DuDocumentArtifacts,
  TelemetryEvent,
  TelemetryStatus,
  type ValidationStationArtifacts,
} from "./types.js";
import { trackTelemetry } from "./utils/telemetryUtils.js";

/**
 * Data source of every subcomponent wrapper. Two mutually-exclusive modes:
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

/**
 * `ValidationStation`'s data source: {@link DuArtifactsSource}, whose
 * `artifacts` may also be in the IXP representation, plus a third mode:
 *
 * 3. **Self-fetching, IXP** — pass `sdk` + `processedDocument`. The hook
 *    fetches the document's artifacts through its producing run, as
 *    `fetchProcessedDocumentArtifacts` does.
 *
 * `data` wins when both it and `processedDocument` are set.
 */
export interface ValidationStationArtifactsSource extends Omit<
  DuArtifactsSource,
  "artifacts" | "documentId"
> {
  /** Pre-fetched artifacts. When supplied, no fetch is performed. */
  artifacts?: ValidationStationArtifacts;
  /** A Flow IDP node's output — self-fetching through its producing run. */
  processedDocument?: ProcessedDocument;
  /** Document id. Falls back to `data.DocumentId`, else the `processedDocument`'s trace id. */
  documentId?: string;
}

export interface ResolvedArtifacts<
  A extends ValidationStationArtifacts = ValidationStationArtifacts,
> {
  artifacts: A | null;
  error: string | null;
  documentId: string | undefined;
}

/**
 * Resolves the artifacts a widget needs — `ValidationStation` and every
 * subcomponent alike — transparently handling both the pre-fetched and
 * self-fetching modes described on {@link ValidationStationArtifactsSource}.
 */
export function useResolvedArtifacts(
  source: DuArtifactsSource,
): ResolvedArtifacts<DuDocumentArtifacts>;
export function useResolvedArtifacts(
  source: ValidationStationArtifactsSource,
): ResolvedArtifacts;
export function useResolvedArtifacts(
  source: ValidationStationArtifactsSource,
): ResolvedArtifacts {
  const { sdk, artifacts: provided, documentId } = source;
  const { data, processedDocument } = selectPayload(
    source.data,
    source.processedDocument,
  );
  const resolvedDocumentId =
    documentId ?? data?.DocumentId ?? processedDocument?.metadata?.traceId;
  // The outcome is tagged with the document it belongs to, so another
  // document shows the loading state instead of the previous one while its
  // fetch is in flight. By content rather than payload identity: a caller
  // passing an inline payload would otherwise never see its own fetch land.
  // A Flow run's documents share a trace id, so theirs adds the span id.
  const outcomeKey = processedDocument
    ? `${resolvedDocumentId}|${processedDocument.metadata?.spanId}`
    : resolvedDocumentId;
  const [outcome, setOutcome] = useState<{
    key: string | undefined;
    artifacts: ValidationStationArtifacts | null;
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
    const pending: Promise<ValidationStationArtifacts> = data
      ? fetchBucketArtifacts(new BucketService(sdkRef.current!), data)
      : fetchProcessedDocumentArtifacts(sdkRef.current!, processedDocument!);

    pending
      .then((artifacts) => {
        if (!cancelled) {
          setOutcome({
            key: outcomeKey,
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
            key: outcomeKey,
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
  }, [shouldFetch, data, processedDocument, outcomeKey]);

  if (provided) {
    return {
      artifacts: provided,
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

  const current = outcome?.key === outcomeKey ? outcome : null;
  return {
    artifacts: current?.artifacts ?? null,
    error: current?.error ?? null,
    documentId: resolvedDocumentId,
  };
}
