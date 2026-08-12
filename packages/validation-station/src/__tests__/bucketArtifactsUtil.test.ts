/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchBucketArtifacts,
  fetchDuDocumentArtifacts,
} from "../bucketArtifactsUtil";

// `fetchDuDocumentArtifacts` builds its own BucketService from the sdk; capture
// the instances so the tests can assert what it was constructed with.
const constructedWithSdks: unknown[] = [];

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: class {
    constructor(sdk: unknown) {
      constructedWithSdks.push(sdk);
    }
    getReadUri(args: unknown) {
      return mockGetReadUri(args);
    }
  },
}));

// Mock fflate to avoid jsdom binary data issues with Response.arrayBuffer()
vi.mock("fflate", () => ({
  unzipSync: (data: Uint8Array) => {
    // The test encodes the raw text as the fetch response body.
    // Decode it back and return as a single-file zip result.
    const text = new TextDecoder().decode(data);
    return { "file.txt": new TextEncoder().encode(text) };
  },
}));

const mockGetReadUri = vi.fn();
const mockBucketService = { getReadUri: mockGetReadUri } as any;

const mockData = {
  BucketId: 100,
  TaxonomyPath: "tax.zip",
  AutomaticExtractionResultsPath: "extraction.zip",
  DocumentObjectModelPath: "dom.zip",
  TextPath: "text.zip",
  CustomizationInfoPath: "custom.zip",
  EncodedDocumentPath: "original.zip",
} as any;

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  constructedWithSdks.length = 0;
});

describe("fetchBucketArtifacts", () => {
  it("fetches all 6 artifacts and returns them", async () => {
    const taxonomy = { fields: ["a"] };
    const extraction = { results: [1] };
    const dom = { pages: [2] };
    const text = "hello world";
    const customization = { info: true };
    const original = "base64pdf";

    let callIndex = 0;
    mockGetReadUri.mockImplementation(() => {
      callIndex++;
      return Promise.resolve({ uri: `https://example.com/file${callIndex}` });
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((input: any) => {
      const url = typeof input === "string" ? input : input.url;
      const contentMap: Record<string, string> = {
        "https://example.com/file1": JSON.stringify(taxonomy),
        "https://example.com/file2": JSON.stringify(extraction),
        "https://example.com/file3": JSON.stringify(dom),
        "https://example.com/file4": text,
        "https://example.com/file5": JSON.stringify(customization),
        "https://example.com/file6": original,
      };
      return Promise.resolve(new Response(contentMap[url]));
    });

    const result = await fetchBucketArtifacts(mockBucketService, mockData, 42);

    expect(result.taxonomy).toEqual(taxonomy);
    expect(result.extractionResult).toEqual(extraction);
    expect(result.dom).toEqual(dom);
    expect(result.text).toBe(text);
    expect(result.customizationInfo).toEqual(customization);
    expect(result.original).toBe(original);
  });

  it("calls getReadUri with correct bucketId, folderId, and paths", async () => {
    mockGetReadUri.mockResolvedValue({ uri: "https://example.com/f" });

    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response("{}")),
    );

    await fetchBucketArtifacts(mockBucketService, mockData, 55);

    expect(mockGetReadUri).toHaveBeenCalledTimes(6);
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "tax.zip",
    });
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "extraction.zip",
    });
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "dom.zip",
    });
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "text.zip",
    });
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "custom.zip",
    });
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 55,
      path: "original.zip",
    });
  });

  it("rejects when getReadUri fails", async () => {
    mockGetReadUri.mockRejectedValue(new Error("Unauthorized"));

    await expect(
      fetchBucketArtifacts(mockBucketService, mockData, 42),
    ).rejects.toThrow("Unauthorized");
  });

  it("rejects when fetch fails", async () => {
    mockGetReadUri.mockResolvedValue({ uri: "https://example.com/f" });
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    await expect(
      fetchBucketArtifacts(mockBucketService, mockData, 42),
    ).rejects.toThrow("Network error");
  });

  it("rejects when response contains invalid JSON for a JSON artifact", async () => {
    mockGetReadUri.mockResolvedValue({ uri: "https://example.com/f" });
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response("not json")),
    );

    await expect(
      fetchBucketArtifacts(mockBucketService, mockData, 42),
    ).rejects.toThrow();
  });

  it("throws when ContentValidationData is missing required fields", async () => {
    await expect(
      fetchBucketArtifacts(
        mockBucketService,
        { ...mockData, TaxonomyPath: undefined },
        42,
      ),
    ).rejects.toThrow(/missing required bucket artifact fields/);
  });

  it("falls back to automatic extraction when validated path fails", async () => {
    const automaticResult = { auto: true };
    const dataWithValidated = {
      ...mockData,
      ValidatedExtractionResultsPath: "validated.zip",
    };

    // getReadUri only fails for the validated extraction path.
    mockGetReadUri.mockImplementation(({ path }: { path: string }) => {
      if (path === "validated.zip") return Promise.reject(new Error("404"));
      return Promise.resolve({ uri: `https://example.com/${path}` });
    });

    vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
      const url = typeof input === "string" ? input : input.url;
      return Promise.resolve(
        new Response(
          url.endsWith("extraction.zip")
            ? JSON.stringify(automaticResult)
            : "{}",
        ),
      );
    });

    const result = await fetchBucketArtifacts(
      mockBucketService,
      dataWithValidated,
      42,
    );

    expect(result.extractionResult).toEqual(automaticResult);
  });

  it("uses validated extraction when present", async () => {
    const validatedResult = { validated: true };
    const dataWithValidated = {
      ...mockData,
      ValidatedExtractionResultsPath: "validated.zip",
    };

    mockGetReadUri.mockImplementation(({ path }: { path: string }) =>
      Promise.resolve({ uri: `https://example.com/${path}` }),
    );

    vi.spyOn(globalThis, "fetch").mockImplementation((input: any) => {
      const url = typeof input === "string" ? input : input.url;
      return Promise.resolve(
        new Response(
          url.endsWith("validated.zip")
            ? JSON.stringify(validatedResult)
            : "{}",
        ),
      );
    });

    const result = await fetchBucketArtifacts(
      mockBucketService,
      dataWithValidated,
      42,
    );

    expect(result.extractionResult).toEqual(validatedResult);
  });
});

describe("fetchDuDocumentArtifacts", () => {
  const mockSdk = { id: "sdk" } as any;

  /** Answers every getReadUri/fetch pair with an empty JSON artifact. */
  const stubBucketReads = () => {
    mockGetReadUri.mockResolvedValue({ uri: "https://example.com/f" });
    vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(new Response("{}")),
    );
  };

  it("builds a BucketService from the sdk and fetches with the given folder", async () => {
    stubBucketReads();

    await fetchDuDocumentArtifacts(mockSdk, mockData, 42);

    expect(constructedWithSdks).toEqual([mockSdk]);
    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 42,
      path: "tax.zip",
    });
  });

  it("falls back to data.FolderId when no folderId is passed", async () => {
    stubBucketReads();

    await fetchDuDocumentArtifacts(mockSdk, { ...mockData, FolderId: 77 });

    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 77,
      path: "tax.zip",
    });
  });

  it("prefers an explicit folderId over data.FolderId", async () => {
    stubBucketReads();

    await fetchDuDocumentArtifacts(mockSdk, { ...mockData, FolderId: 77 }, 42);

    expect(mockGetReadUri).toHaveBeenCalledWith({
      bucketId: 100,
      folderId: 42,
      path: "tax.zip",
    });
  });

  it("throws when neither a folderId nor data.FolderId resolves", async () => {
    await expect(fetchDuDocumentArtifacts(mockSdk, mockData)).rejects.toThrow(
      /folderId of Storage bucket is required/,
    );
    expect(mockGetReadUri).not.toHaveBeenCalled();
  });

  it("propagates the missing-paths guard from the underlying fetch", async () => {
    stubBucketReads();

    await expect(
      fetchDuDocumentArtifacts(
        mockSdk,
        { ...mockData, TaxonomyPath: undefined },
        42,
      ),
    ).rejects.toThrow(/missing required bucket artifact fields/);
  });
});
