/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useResolvedArtifacts } from "../useResolvedArtifacts";

const mockFetchBucketArtifacts = vi.fn();

vi.mock("../bucketArtifactsUtil", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../bucketArtifactsUtil")>()),
  fetchBucketArtifacts: (...args: any[]) => mockFetchBucketArtifacts(...args),
}));

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: class {},
}));

const mockTrackTelemetry = vi.fn();
vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: (...args: any[]) => mockTrackTelemetry(...args),
}));

const sdk = {} as any;
const data = { DocumentId: "doc-1", FolderId: 42 } as any;
const artifacts = { docTypes: [] } as any;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useResolvedArtifacts", () => {
  it("returns pre-fetched artifacts without fetching", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ artifacts, documentId: "d" }),
    );
    expect(result.current).toEqual({
      artifacts,
      error: null,
      documentId: "d",
    });
    expect(mockFetchBucketArtifacts).not.toHaveBeenCalled();
  });

  it("does not fetch when artifacts come with sdk + data", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, data, artifacts }),
    );
    expect(result.current.artifacts).toBe(artifacts);
    expect(result.current.documentId).toBe("doc-1");
    expect(mockFetchBucketArtifacts).not.toHaveBeenCalled();
  });

  it("fetches from sdk + data and tracks the load", async () => {
    mockFetchBucketArtifacts.mockResolvedValue(artifacts);
    const { result } = renderHook(() => useResolvedArtifacts({ sdk, data }));

    expect(result.current.artifacts).toBeNull();
    await waitFor(() => expect(result.current.artifacts).toBe(artifacts));
    expect(mockFetchBucketArtifacts.mock.calls[0][1]).toBe(data);
    expect(mockTrackTelemetry).toHaveBeenCalledWith(
      "ClassificationStation.Load",
      "ClassificationStation.Success",
    );
  });

  it("surfaces a failed fetch", async () => {
    mockFetchBucketArtifacts.mockRejectedValue(new Error("nope"));
    const { result } = renderHook(() => useResolvedArtifacts({ sdk, data }));
    await waitFor(() => expect(result.current.error).toBe("nope"));
    expect(mockTrackTelemetry).toHaveBeenCalledWith(
      "ClassificationStation.Load",
      "ClassificationStation.Error",
      { error: "nope" },
    );
  });

  it("asks for a data source when given none", () => {
    const { result } = renderHook(() => useResolvedArtifacts({}));
    expect(result.current.error).toMatch(/No data source provided/);
  });

  it("refuses a descriptor without a folder, without fetching", () => {
    const { result } = renderHook(() =>
      useResolvedArtifacts({ sdk, data: { DocumentId: "doc-1" } as any }),
    );
    expect(result.current.error).toMatch(/FolderId or FolderKey/);
    expect(mockFetchBucketArtifacts).not.toHaveBeenCalled();
  });

  it("shows the loading state for another document while its fetch runs", async () => {
    mockFetchBucketArtifacts.mockResolvedValueOnce(artifacts);
    const { result, rerender } = renderHook(
      ({ d }) => useResolvedArtifacts({ sdk, data: d }),
      { initialProps: { d: data } },
    );
    await waitFor(() => expect(result.current.artifacts).toBe(artifacts));

    mockFetchBucketArtifacts.mockReturnValueOnce(new Promise(() => {}));
    rerender({ d: { ...data, DocumentId: "doc-2" } });
    expect(result.current.artifacts).toBeNull();
    expect(result.current.documentId).toBe("doc-2");
  });
});
