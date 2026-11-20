/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, expectTypeOf, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import type { ProcessedDocument } from "../processedDocument/types";
import type { IxpDocumentArtifacts } from "../types";
import { useProcessedDocumentArtifacts } from "../useProcessedDocumentArtifacts";

const mockFetchProcessedDocumentArtifacts = vi.fn();

vi.mock("../processedDocument/artifacts", () => ({
  fetchProcessedDocumentArtifacts: (...args: any[]) =>
    mockFetchProcessedDocumentArtifacts(...args),
}));

const mockSdk = {} as any;

const processedDocument = {
  type: "Extraction",
  metadata: { traceId: "trace-1", spanId: "span-1", folderKey: "f-1" },
} as unknown as ProcessedDocument;

const mockArtifacts = {
  taxonomy: { properties: {} },
  extractionResult: { output: {}, attribution: {} },
  dom: { pages: [] },
  text: "hello",
  customizationInfo: undefined,
  original: "data:application/pdf;base64,AAAA",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("useProcessedDocumentArtifacts", () => {
  it("fetches through the producing run and returns the artifacts", async () => {
    mockFetchProcessedDocumentArtifacts.mockResolvedValue(mockArtifacts);

    const { result } = renderHook(() =>
      useProcessedDocumentArtifacts(mockSdk, processedDocument),
    );

    expect(result.current.artifacts).toBeNull();
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.artifacts).toEqual(mockArtifacts);
    });
    expect(result.current.error).toBeNull();
    expect(mockFetchProcessedDocumentArtifacts).toHaveBeenCalledExactlyOnceWith(
      mockSdk,
      processedDocument,
    );
  });

  it("returns the error when the fetch rejects", async () => {
    mockFetchProcessedDocumentArtifacts.mockRejectedValue(
      new Error("trace not found"),
    );

    const { result } = renderHook(() =>
      useProcessedDocumentArtifacts(mockSdk, processedDocument),
    );

    await waitFor(() => {
      expect(result.current.error).toBe("trace not found");
    });
    expect(result.current.artifacts).toBeNull();
  });

  it("types the artifacts as the IXP representation", () => {
    mockFetchProcessedDocumentArtifacts.mockResolvedValue(mockArtifacts);
    const { result } = renderHook(() =>
      useProcessedDocumentArtifacts(mockSdk, processedDocument),
    );

    expectTypeOf(
      result.current.artifacts,
    ).toEqualTypeOf<IxpDocumentArtifacts | null>();
  });
});
