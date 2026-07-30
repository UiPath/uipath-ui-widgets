import { UiPath } from "@uipath/uipath-typescript/core";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import { Entities } from "@uipath/uipath-typescript/entities";
import { useEffect, useState } from "react";
import { PdfViewerSource } from "../types";

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
 * Stable identity key for a source so consumers passing inline object
 * literals (a new object every render) don't retrigger fetches.
 * Blob identity is tracked separately via the object reference.
 */
export function getSourceKey(source: PdfViewerSource): string {
  switch (source.type) {
    case "bucket":
      return `bucket:${source.bucketId}:${source.folderId}:${source.path}`;
    case "entity":
      return `entity:${source.entityId}:${source.recordId}:${source.fieldName}`;
    case "url":
      return `url:${source.url}`;
    case "blob":
      return "blob";
  }
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
  switch (source.type) {
    case "url":
      // react-pdf downloads URL sources itself; nothing to fetch here.
      return { url: source.url };

    case "blob": {
      const { data } = source;
      return {
        blob: asPdfBlob(data instanceof Blob ? data : new Blob([data])),
      };
    }

    case "bucket": {
      if (!sdk) {
        throw new Error(
          "An initialized UiPath SDK instance (`sdk` prop) is required for 'bucket' sources.",
        );
      }
      // Buckets are two-step: get a pre-signed read URI, then download it.
      const buckets = new BucketService(sdk);
      const access = await buckets.getReadUri(source.bucketId, source.path, {
        folderId: source.folderId,
      });
      const response = await fetch(access.uri, { headers: access.headers });
      if (!response.ok) {
        throw new Error(
          `Failed to download "${source.path}" from the storage bucket (HTTP ${response.status}).`,
        );
      }
      return { blob: asPdfBlob(await response.blob()) };
    }

    case "entity": {
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
  }
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
  const blobIdentity = source.type === "blob" ? source.data : null;

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
