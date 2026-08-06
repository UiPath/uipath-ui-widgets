/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBucketArtifacts } from "../useBucketArtifacts";

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

describe("useBucketArtifacts", () => {
  it("fetches artifacts on mount and returns them", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);

    const { result } = renderHook(() =>
      useBucketArtifacts(mockSdk, makeData(), 42),
    );

    expect(result.current.artifacts).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });

    expect(result.current.error).toBeNull();
    expect(mockFetchBucketArtifacts).toHaveBeenCalled();
  });

  it("uses folderId prop over data.FolderId", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);

    renderHook(() =>
      useBucketArtifacts(mockSdk, makeData({ FolderId: 10 }), 99),
    );

    await waitFor(() => {
      expect(mockFetchBucketArtifacts).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockFetchBucketArtifacts.mock.calls[0];
    expect(callArgs[2]).toBe(99);
  });

  it("falls back to data.FolderId when folderId prop is undefined", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);

    renderHook(() =>
      useBucketArtifacts(mockSdk, makeData({ FolderId: 55 }), undefined),
    );

    await waitFor(() => {
      expect(mockFetchBucketArtifacts).toHaveBeenCalledTimes(1);
    });

    const callArgs = mockFetchBucketArtifacts.mock.calls[0];
    expect(callArgs[2]).toBe(55);
  });

  it("returns error when folderId is missing from both prop and data", () => {
    const { result } = renderHook(() =>
      useBucketArtifacts(mockSdk, makeData({ FolderId: undefined }), undefined),
    );

    expect(result.current.error).toBe(
      "folderId of Storage bucket is required. Provide it as a prop or ensure data.FolderId is set.",
    );
    expect(result.current.artifacts).toBeNull();
    expect(mockFetchBucketArtifacts).not.toHaveBeenCalled();
  });

  it("returns error when fetchBucketArtifacts rejects", async () => {
    mockFetchBucketArtifacts.mockRejectedValue(new Error("Network failure"));

    const { result } = renderHook(() =>
      useBucketArtifacts(mockSdk, makeData(), 42),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("Network failure");
    });

    expect(result.current.artifacts).toBeNull();
  });

  it("handles non-Error rejection", async () => {
    mockFetchBucketArtifacts.mockRejectedValue("string error");

    const { result } = renderHook(() =>
      useBucketArtifacts(mockSdk, makeData(), 42),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("string error");
    });
  });

  it("does not re-fetch when re-rendered with same data and folderId", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(mockArtifacts);
    const data = makeData();

    const { result, rerender } = renderHook(() =>
      useBucketArtifacts(mockSdk, data, 42),
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
      useBucketArtifacts(mockSdk, data, 42),
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
