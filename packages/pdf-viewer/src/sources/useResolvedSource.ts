import { UiPath } from "@uipath/uipath-typescript/core";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import { Entities } from "@uipath/uipath-typescript/entities";
import { useEffect, useState } from "react";
import { PdfViewerSource, PdfViewerSourceType } from "../types";

const PDF_MIME_TYPE = "application/pdf";

/**
 * The resolver's output: either bytes we fetched (blob) or an address
 * react-pdf should download itself (url). Exactly one is set.
 */
export interface ResolvedFile {
  blob?: Blob;
  url?: string;
}

export interface ResolvedSourceState {
  /** The resolved file, or null while resolving / after an error */
  file: ResolvedFile | null;
  /** True while an adapter fetch is in flight */
  isResolving: boolean;
  /** Fetch error, if any (react-pdf render errors are handled separately) */
  error: Error | null;
}

/**
 * Infers the source kind from the fields present — the `type` field is
 * optional on {@link PdfViewerSource}, so the presence of `bucketId`,
 * `entityId`, `url`, or `data` is what actually selects the adapter.
 *
 * Every kind is a positive field check; a shape matching none of them (only
 * possible from untyped JS) is reported as `"unknown"` rather than guessed.
 * This function runs during render, so it never throws — `resolveSource`
 * rejects unrecognized sources with a descriptive error instead.
 */
export function getSourceType(
  source: PdfViewerSource,
): PdfViewerSourceType | "unknown" {
  if ("bucketId" in source) return PdfViewerSourceType.Bucket;
  if ("entityId" in source) return PdfViewerSourceType.Entity;
  if ("url" in source) return PdfViewerSourceType.Url;
  if ("data" in source) return PdfViewerSourceType.Blob;
  return "unknown";
}

/**
 * Stable identity key for a source so consumers passing inline object
 * literals (a new object every render) don't retrigger fetches.
 * Blob identity is tracked separately via the object reference.
 */
export function getSourceKey(source: PdfViewerSource): string {
  if ("bucketId" in source) {
    return `bucket:${source.bucketId}:${source.folderId ?? source.folderKey ?? source.folderPath ?? ""}:${source.path}`;
  }
  if ("entityId" in source) {
    return `entity:${source.entityId}:${source.recordId}:${source.fieldName}`;
  }
  if ("url" in source) {
    return `url:${source.url}`;
  }
  if ("data" in source) {
    return "blob";
  }
  return "unknown";
}

/** Ensure the blob carries the PDF MIME type (some APIs return untyped octet streams). */
function asPdfBlob(blob: Blob): Blob {
  return blob.type === PDF_MIME_TYPE
    ? blob
    : new Blob([blob], { type: PDF_MIME_TYPE });
}

async function resolveSource(
  source: PdfViewerSource,
  sdk: UiPath | undefined,
): Promise<ResolvedFile> {
  // The source kind is selected by which fields are present — the `type`
  // field is optional and purely informational (see PdfViewerSource).
  if ("url" in source) {
    // react-pdf downloads URL sources itself; nothing to fetch here.
    return { url: source.url };
  }

  if ("data" in source) {
    const { data } = source;
    return {
      blob: asPdfBlob(data instanceof Blob ? data : new Blob([data])),
    };
  }

  if ("bucketId" in source) {
    if (!sdk) {
      throw new Error(
        "An initialized UiPath SDK instance (`sdk` prop) is required for 'bucket' sources.",
      );
    }
    if (
      source.folderId === undefined &&
      !source.folderKey &&
      !source.folderPath
    ) {
      throw new Error(
        "A 'bucket' source requires one of folderId, folderKey, or folderPath.",
      );
    }
    // Buckets are two-step: get a pre-signed read URI, then download it.
    // Pass whichever folder identifier the caller provided (the SDK's
    // getReadUri accepts folderId / folderKey / folderPath).
    // Note: the positional call below is the SDK's PREFERRED overload
    // (available since the ^1.4.1 peer floor); the single-options-object
    // form some older widgets use is marked @deprecated in the SDK.
    const buckets = new BucketService(sdk);
    const access = await buckets.getReadUri(source.bucketId, source.path, {
      folderId: source.folderId,
      folderKey: source.folderKey,
      folderPath: source.folderPath,
    });
    const response = await fetch(access.uri, { headers: access.headers });
    if (!response.ok) {
      throw new Error(
        `Failed to download "${source.path}" from the storage bucket (HTTP ${response.status}).`,
      );
    }
    return { blob: asPdfBlob(await response.blob()) };
  }

  if ("entityId" in source) {
    if (!sdk) {
      throw new Error(
        "An initialized UiPath SDK instance (`sdk` prop) is required for 'entity' sources.",
      );
    }
    const entities = new Entities(sdk);
    const blob = await entities.downloadAttachment(
      source.entityId,
      source.recordId,
      source.fieldName,
    );
    return { blob: asPdfBlob(blob) };
  }

  // Unreachable for TypeScript callers; guards plain-JS misuse with a clear
  // message (surfaces on the widget's error card instead of crashing).
  throw new Error(
    "Unrecognized source: provide bucketId + path (storage bucket), entityId + recordId + fieldName (Data Fabric), url, or data (Blob/ArrayBuffer).",
  );
}

/**
 * Resolves a {@link PdfViewerSource} to a renderable file.
 * Re-resolves when the source meaningfully changes (see getSourceKey),
 * the sdk changes, or `retryKey` is bumped (the Retry button).
 */
export function useResolvedSource(
  source: PdfViewerSource,
  sdk: UiPath | undefined,
  retryKey: number,
): ResolvedSourceState {
  const [state, setState] = useState<ResolvedSourceState>({
    file: null,
    isResolving: true,
    error: null,
  });

  const sourceKey = getSourceKey(source);
  const blobIdentity = "data" in source ? source.data : null;

  useEffect(() => {
    let cancelled = false;
    setState({ file: null, isResolving: true, error: null });

    resolveSource(source, sdk)
      .then((file) => {
        if (!cancelled) setState({ file, isResolving: false, error: null });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setState({
            file: null,
            isResolving: false,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        }
      });

    return () => {
      cancelled = true;
    };
    // sourceKey/blobIdentity capture every meaningful field of `source`;
    // depending on `source` itself would refetch on every inline literal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey, blobIdentity, sdk, retryKey]);

  return state;
}
