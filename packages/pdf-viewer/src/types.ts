import { UiPath } from "@uipath/uipath-typescript/core";

/**
 * The kind of source a {@link PdfViewerSource} describes, derived from the
 * fields present on it. Used for telemetry; consumers never set it.
 */
export enum PdfViewerSourceType {
  Bucket = "bucket",
  Entity = "entity",
  Url = "url",
  Blob = "blob",
}

/**
 * Where the PDF lives. The widget selects the adapter from the fields you
 * pass — `bucketId` → storage bucket, `entityId` → Data Fabric entity,
 * `url` → direct URL, `data` → pre-fetched bytes.
 *
 * Field names mirror the SDK signatures they map to (the SDK's preferred
 * positional forms — the single-options-object overloads are deprecated):
 * - bucket → `Buckets.getReadUri(bucketId, path, { folderId | folderKey | folderPath })`
 * - entity → `Entities.downloadAttachment(entityId, recordId, fieldName)`
 * - url / blob → escape hatches for custom data stores (no SDK required)
 */
export type PdfViewerSource =
  | {
      /** Orchestrator Storage Bucket ID */
      bucketId: number;
      /**
       * Folder containing the bucket. Provide exactly one of `folderId`,
       * `folderKey`, or `folderPath` (mirrors the SDK's folder-scoping
       * options). Modern Orchestrator / coded apps usually have the GUID
       * `folderKey` rather than the numeric `folderId`.
       */
      folderId?: number;
      /** Folder key (GUID) — alternative to `folderId`. */
      folderKey?: string;
      /** Slash-delimited folder path, e.g. "Shared/Finance" — alternative to `folderId`. */
      folderPath?: string;
      /** Path of the file inside the bucket, e.g. "invoices/inv-0714.pdf" */
      path: string;
    }
  | {
      /** Data Fabric entity ID */
      entityId: string;
      /** Record (row) ID within the entity */
      recordId: string;
      /** Name of the file-type field holding the attachment */
      fieldName: string;
    }
  | {
      /** Direct URL to the PDF (must be same-origin or CORS-accessible) */
      url: string;
    }
  | {
      /** Pre-fetched PDF content */
      data: Blob | ArrayBuffer;
    };

/** Per-feature toolbar toggles. All default to true. */
export interface PdfViewerToolbarOptions {
  /** Prev/next buttons and page number input */
  pagination?: boolean;
  /** Zoom in/out, percentage readout, and fit-to-width */
  zoom?: boolean;
  /** 90° clockwise rotation */
  rotate?: boolean;
  /** Download button */
  download?: boolean;
}

export interface PdfViewerProps {
  /** Where the PDF lives (bucket, entity, url, or blob) */
  source: PdfViewerSource;
  /**
   * Initialized UiPath SDK instance. Required for `bucket` and `entity`
   * sources; unused for `url`/`blob` sources.
   */
  sdk?: UiPath;
  /**
   * Per-feature toolbar toggles (all default to true). Disable all four to
   * hide the toolbar entirely.
   */
  toolbar?: PdfViewerToolbarOptions;
  /** File name shown in the toolbar and used for downloads */
  fileName?: string;
  /** Max height of the document canvas (default 640). The canvas scrolls internally. */
  maxHeight?: number | string;
  /** Called when the document loads successfully */
  onLoadSuccess?: (info: { numPages: number }) => void;
  /** Called when fetching or rendering the document fails */
  onLoadError?: (error: Error) => void;
}

export enum TelemetryService {
  LoadDocument = "PDFV.LoadDocument",
  DownloadFile = "PDFV.DownloadFile",
}

export enum TelemetryStatus {
  Usage = "PDFV.Usage",
  Error = "PDFV.Error",
}
