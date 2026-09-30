/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, expectTypeOf, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { ProcessedDocument } from "../processedDocument/types";
import type {
  DuDocumentArtifacts,
  DuFrameworkDocumentArtifacts,
} from "../types";
import { useResolvedArtifacts } from "../useResolvedArtifacts";

const mockFetchBucketArtifacts = vi.fn();
vi.mock("../bucketArtifactsUtil", () => ({
  fetchBucketArtifacts: (...args: any[]) => mockFetchBucketArtifacts(...args),
}));

// The hook must run the exported fetch hosts use, not an HTTP path of its own.
const mockFetchProcessedDocumentArtifacts = vi.fn();
vi.mock("../processedDocument/artifacts", () => ({
  fetchProcessedDocumentArtifacts: (...args: any[]) =>
    mockFetchProcessedDocumentArtifacts(...args),
}));

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: vi.fn(),
}));

const sdk = { id: "sdk" } as any;
const processedDocument = {
  type: "Extraction",
  metadata: { traceId: "trace-1", spanId: "span-1", folderKey: "folder-1" },
} as any;
const data = { DocumentId: "doc-1", BucketId: 100, FolderId: 42 } as any;
const ixpArtifacts = {
  taxonomy: { properties: {} },
  extractionResult: { output: {}, attribution: {} },
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchProcessedDocumentArtifacts.mockResolvedValue(ixpArtifacts);
  mockFetchBucketArtifacts.mockResolvedValue({ bucket: true });
});

describe("useResolvedArtifacts with a processedDocument", () => {
  it("fetches through fetchProcessedDocumentArtifacts, keyed by the trace id", async () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, processedDocument }),
    );

    await waitFor(() => expect(result.current.artifacts).toBe(ixpArtifacts));
    expect(mockFetchProcessedDocumentArtifacts).toHaveBeenCalledWith(
      sdk,
      processedDocument,
    );
    expect(result.current.documentId).toBe("trace-1");
    expect(result.current.error).toBeNull();
  });

  it("shows the loading state, not the previous document, while the next one loads", async () => {
    const next = {
      ...processedDocument,
      metadata: { ...processedDocument.metadata, traceId: "trace-2" },
    };
    let resolveNext!: (artifacts: unknown) => void;
    const { result, rerender } = renderHook(
      ({ pd }) => useResolvedArtifacts({ sdk, processedDocument: pd }),
      { initialProps: { pd: processedDocument } },
    );
    await waitFor(() => expect(result.current.artifacts).toBe(ixpArtifacts));

    mockFetchProcessedDocumentArtifacts.mockReturnValue(
      new Promise((resolve) => (resolveNext = resolve)),
    );
    rerender({ pd: next });

    expect(result.current.documentId).toBe("trace-2");
    expect(result.current.artifacts).toBeNull();

    const nextArtifacts = { ...ixpArtifacts };
    resolveNext(nextArtifacts);
    await waitFor(() => expect(result.current.artifacts).toBe(nextArtifacts));
  });

  it("keeps showing a document re-rendered with an inline payload", async () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({
        sdk,
        processedDocument: { ...processedDocument },
      }),
    );

    await waitFor(() => expect(result.current.artifacts).toBe(ixpArtifacts));
  });

  it("prefers an explicit documentId", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, processedDocument, documentId: "mine" }),
    );

    expect(result.current.documentId).toBe("mine");
  });

  it("lets data win when both payloads are set", async () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, data, processedDocument }),
    );

    await waitFor(() =>
      expect(result.current.artifacts).toEqual({ bucket: true }),
    );
    expect(mockFetchProcessedDocumentArtifacts).not.toHaveBeenCalled();
    expect(result.current.documentId).toBe("doc-1");
  });

  it("surfaces a refused payload as the error", async () => {
    mockFetchProcessedDocumentArtifacts.mockRejectedValue(
      new Error(
        "Cannot validate this ProcessedDocument: metadata.spanId is empty.",
      ),
    );

    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, processedDocument }),
    );

    await waitFor(() =>
      expect(result.current.error).toBe(
        "Cannot validate this ProcessedDocument: metadata.spanId is empty.",
      ),
    );
    expect(result.current.artifacts).toBeNull();
  });

  it("does not fetch without an sdk, and says what is missing", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ processedDocument }),
    );

    expect(mockFetchProcessedDocumentArtifacts).not.toHaveBeenCalled();
    expect(result.current.error).toBe(
      "No data source provided. Pass `artifacts` (pre-fetched), or `sdk` + `data` or `sdk` + `processedDocument` (to fetch).",
    );
  });

  it("does not fetch when artifacts are supplied", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, processedDocument, artifacts: ixpArtifacts }),
    );

    expect(mockFetchProcessedDocumentArtifacts).not.toHaveBeenCalled();
    expect(result.current.artifacts).toBe(ixpArtifacts);
  });
});

// Checked by `tsc`. A bucket source must stay typed as the UiPath
// representation, or hosts reading `artifacts.taxonomy` break.
describe("useResolvedArtifacts result type", () => {
  it("is the UiPath representation for a bucket source", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({
        sdk,
        data: data as DuFramework.ContentValidationData,
      }),
    );

    expectTypeOf(
      result.current.artifacts,
    ).toEqualTypeOf<DuFrameworkDocumentArtifacts | null>();
  });

  it("is either representation for a processedDocument source", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({
        sdk,
        processedDocument: processedDocument as ProcessedDocument,
      }),
    );

    expectTypeOf(
      result.current.artifacts,
    ).toEqualTypeOf<DuDocumentArtifacts | null>();
  });
});
