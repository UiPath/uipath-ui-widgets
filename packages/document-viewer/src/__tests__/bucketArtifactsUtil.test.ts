/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchBucketArtifacts,
  fetchDvDocumentArtifacts,
} from "../bucketArtifactsUtil";

const constructedWithSdks: unknown[] = [];
const mockGetReadUri = vi.fn();

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

// The fetch body is the archive's only file, so "unzipping" decodes it back.
vi.mock("fflate", () => ({
  unzipSync: (data: Uint8Array) => ({ "file.json": data }),
}));

const mockBucketService = { getReadUri: mockGetReadUri } as any;

// A Validation Station descriptor: the viewer reads three of its paths.
const mockData = {
  BucketId: 100,
  FolderId: 42,
  DocumentId: "doc-1",
  DocumentObjectModelPath: "dom.zip",
  EncodedDocumentPath: "original.zip",
  TextPath: "text.zip",
  TaxonomyPath: "tax.zip",
  AutomaticExtractionResultsPath: "auto.zip",
} as any;

function serve(files: Record<string, string>) {
  mockGetReadUri.mockImplementation(async ({ path }: any) => ({
    uri: `https://blob/${path}`,
  }));
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input: any) => {
    const path = String(input).replace("https://blob/", "");
    return path in files
      ? new Response(files[path])
      : new Response("missing", { status: 404 });
  });
}

const files = {
  "dom.zip": JSON.stringify({ Pages: [1] }),
  "original.zip": "data:application/pdf;base64,AAA",
  "text.zip": "hello",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  constructedWithSdks.length = 0;
});

describe("fetchBucketArtifacts", () => {
  it("reads the DOM, the original and the text, and nothing else", async () => {
    serve(files);
    const result = await fetchBucketArtifacts(mockBucketService, mockData);

    expect(result).toEqual({
      dom: { Pages: [1] },
      original: "data:application/pdf;base64,AAA",
      text: "hello",
    });
    expect(mockGetReadUri.mock.calls.map(([a]) => a.path).sort()).toEqual([
      "dom.zip",
      "original.zip",
      "text.zip",
    ]);
  });

  it("skips the original and the text when their paths are unset", async () => {
    serve(files);
    const result = await fetchBucketArtifacts(mockBucketService, {
      ...mockData,
      EncodedDocumentPath: null,
      TextPath: "",
    });
    expect(result).toEqual({
      dom: { Pages: [1] },
      original: undefined,
      text: undefined,
    });
    expect(mockGetReadUri).toHaveBeenCalledTimes(1);
  });

  it("scopes reads to FolderKey over FolderId", async () => {
    serve(files);
    await fetchBucketArtifacts(mockBucketService, {
      ...mockData,
      FolderKey: "fk",
    });
    for (const [args] of mockGetReadUri.mock.calls) {
      expect(args).toMatchObject({ bucketId: 100, folderKey: "fk" });
      expect(args).not.toHaveProperty("folderId");
    }
  });

  it("fails when the DOM read 404s", async () => {
    serve({ "original.zip": files["original.zip"], "text.zip": "t" });
    await expect(
      fetchBucketArtifacts(mockBucketService, mockData),
    ).rejects.toThrow("404");
  });

  it.each([
    ["BucketId", { BucketId: 0 }],
    ["a folder", { FolderId: undefined }],
    ["DocumentObjectModelPath", { DocumentObjectModelPath: "" }],
  ])("throws before any read without %s", async (_name, override) => {
    await expect(
      fetchBucketArtifacts(mockBucketService, { ...mockData, ...override }),
    ).rejects.toThrow("missing required bucket fields");
    expect(mockGetReadUri).not.toHaveBeenCalled();
  });
});

describe("fetchDvDocumentArtifacts", () => {
  it("builds its BucketService from the sdk", async () => {
    serve(files);
    const sdk = { tag: "sdk" } as any;
    await fetchDvDocumentArtifacts(sdk, mockData);
    expect(constructedWithSdks).toEqual([sdk]);
  });
});
