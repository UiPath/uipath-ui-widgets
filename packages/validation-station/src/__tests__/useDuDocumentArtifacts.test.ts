/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useDuDocumentArtifacts } from "../useDuDocumentArtifacts";

const mockFetchBucketArtifacts = vi.fn();

vi.mock("../bucketArtifactsUtil", () => ({
  fetchBucketArtifacts: (...args: any[]) => mockFetchBucketArtifacts(...args),
}));

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: vi.fn(),
}));

const mockSdk = {} as any;

const makeData = (overrides: Record<string, any> = {}) =>
  ({
    DocumentId: "doc-1",
    BucketId: 100,
    FolderId: 42,
    ...overrides,
  }) as any;

const mockArtifacts = {
  taxonomy: { fields: [] },
  extractionResult: { results: [] },
  dom: { pages: [] },
  text: "hello",
  customizationInfo: {},
  original: "base64data",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useDuDocumentArtifacts", () => {
  it("fetches artifacts on mount and returns them", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);

    const { result } = renderHook(() =>
      useDuDocumentArtifacts(mockSdk, makeData()),
    );

    expect(result.current.artifacts).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });

    expect(result.current.error).toBeNull();
    expect(mockFetchBucketArtifacts).toHaveBeenCalled();
  });

  it("hands the whole payload to the fetch — the folder travels on it", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);
    const data = makeData({ FolderId: 55 });

    renderHook(() => useDuDocumentArtifacts(mockSdk, data));

    await waitFor(() => {
      expect(mockFetchBucketArtifacts).toHaveBeenCalledTimes(1);
    });

    expect(mockFetchBucketArtifacts.mock.calls[0][1]).toBe(data);
  });

  it("fetches when data carries only a FolderKey", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);

    const { result } = renderHook(() =>
      useDuDocumentArtifacts(
        mockSdk,
        makeData({ FolderId: undefined, FolderKey: "folder-key-1" }),
      ),
    );

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });
    expect(result.current.error).toBeNull();
  });

  it("returns error when data carries neither FolderId nor FolderKey", () => {
    const { result } = renderHook(() =>
      useDuDocumentArtifacts(
        mockSdk,
        makeData({ FolderId: undefined, FolderKey: undefined }),
      ),
    );

    expect(result.current.error).toBe(
      "ContentValidationData must carry FolderId or FolderKey (the storage bucket's folder).",
    );
    expect(result.current.artifacts).toBeNull();
    expect(mockFetchBucketArtifacts).not.toHaveBeenCalled();
  });

  it("returns error when fetchBucketArtifacts rejects", async () => {
    mockFetchBucketArtifacts.mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() =>
      useDuDocumentArtifacts(mockSdk, makeData()),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Network failure");
    });

    expect(result.current.artifacts).toBeNull();
  });

  it("handles non-Error rejection", async () => {
    mockFetchBucketArtifacts.mockRejectedValue("string error");

    const { result } = renderHook(() =>
      useDuDocumentArtifacts(mockSdk, makeData()),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("string error");
    });
  });

  it("does not re-fetch when re-rendered with the same data", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);
    const data = makeData();

    const { result, rerender } = renderHook(() =>
      useDuDocumentArtifacts(mockSdk, data),
    );

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });

    rerender();

    expect(mockFetchBucketArtifacts).toHaveBeenCalledTimes(1);
  });

  it("re-fetches when data changes", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);
    let data = makeData({ DocumentId: "doc-1" });

    const { result, rerender } = renderHook(() =>
      useDuDocumentArtifacts(mockSdk, data),
    );

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });

    data = makeData({ DocumentId: "doc-2" });
    rerender();

    await waitFor(() => {
      expect(mockFetchBucketArtifacts).toHaveBeenCalledTimes(2);
    });
  });
});
