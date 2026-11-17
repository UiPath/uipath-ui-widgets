/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchBucketArtifacts,
  fetchCsDocumentArtifacts,
  folderScope,
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

const mockData = {
  BucketId: 100,
  FolderId: 42,
  DocumentId: "doc-1",
  TaxonomyPath: "tax.zip",
  AutomaticClassificationResultsPath: "auto.zip",
  ValidatedClassificationResultsPath: "validated.zip",
  DocumentObjectModelPath: "dom.zip",
  TextPath: "text.zip",
  CustomizationInfoPath: "custom.zip",
  EncodedDocumentPath: "original.zip",
} as any;

const docTypes = [{ DocumentTypeId: "invoice", Name: "Invoice" }];
const automatic = [{ DocumentId: "doc-1", DocumentTypeId: "invoice" }];
const validated = [{ DocumentId: "doc-1", DocumentTypeId: "receipt" }];

/** Serves each bucket path; a path missing from `files` 404s. */
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

const allFiles = () => ({
  "tax.zip": JSON.stringify({ DocumentTypes: docTypes }),
  "auto.zip": JSON.stringify(automatic),
  "validated.zip": JSON.stringify(validated),
  "dom.zip": JSON.stringify({ Pages: [] }),
  "text.zip": "hello",
  "custom.zip": JSON.stringify({
    FeatureCustomization: { EnablePageReordering: true },
  }),
  "original.zip": "data:application/pdf;base64,AAA",
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  constructedWithSdks.length = 0;
});

describe("fetchBucketArtifacts", () => {
  it("reads every artifact and takes the taxonomy's document types", async () => {
    serve(allFiles());
    const result = await fetchBucketArtifacts(mockBucketService, mockData);

    expect(result).toEqual({
      docTypes,
      classificationResults: { Classifications: validated },
      dom: { Pages: [] },
      text: "hello",
      customizationInfo: {
        FeatureCustomization: { EnablePageReordering: true },
      },
      original: "data:application/pdf;base64,AAA",
    });
  });

  it("scopes every read to the folder, FolderKey winning over FolderId", async () => {
    serve(allFiles());
    await fetchBucketArtifacts(mockBucketService, {
      ...mockData,
      FolderKey: "fk",
    });
    for (const [args] of mockGetReadUri.mock.calls) {
      expect(args).toMatchObject({ bucketId: 100, folderKey: "fk" });
      expect(args).not.toHaveProperty("folderId");
    }
  });

  it("falls back to the automatic classification until one is validated", async () => {
    const files: Record<string, string> = allFiles();
    delete files["validated.zip"];
    serve(files);
    const result = await fetchBucketArtifacts(mockBucketService, mockData);
    expect(result.classificationResults).toEqual({
      Classifications: automatic,
    });
  });

  it("reads the automatic classification when no validated path is set", async () => {
    serve(allFiles());
    const result = await fetchBucketArtifacts(mockBucketService, {
      ...mockData,
      ValidatedClassificationResultsPath: "",
    });
    expect(result.classificationResults).toEqual({
      Classifications: automatic,
    });
  });

  it("fails when neither classification can be read", async () => {
    const files: Record<string, string> = allFiles();
    delete files["validated.zip"];
    delete files["auto.zip"];
    serve(files);
    await expect(
      fetchBucketArtifacts(mockBucketService, mockData),
    ).rejects.toThrow("404");
  });

  it("defaults the customization to every flag off without a path", async () => {
    serve(allFiles());
    const result = await fetchBucketArtifacts(mockBucketService, {
      ...mockData,
      CustomizationInfoPath: "",
    });
    expect(result.customizationInfo).toEqual({ FeatureCustomization: null });
    expect(
      mockGetReadUri.mock.calls.some(([a]) => a.path === "custom.zip"),
    ).toBe(false);
  });

  it.each([
    ["BucketId", { BucketId: 0 }],
    ["a folder", { FolderId: undefined }],
    ["TaxonomyPath", { TaxonomyPath: "" }],
    [
      "AutomaticClassificationResultsPath",
      { AutomaticClassificationResultsPath: "" },
    ],
  ])("throws before any read without %s", async (_name, override) => {
    await expect(
      fetchBucketArtifacts(mockBucketService, { ...mockData, ...override }),
    ).rejects.toThrow("missing required bucket fields");
    expect(mockGetReadUri).not.toHaveBeenCalled();
  });
});

describe("fetchCsDocumentArtifacts", () => {
  it("builds its BucketService from the sdk", async () => {
    serve(allFiles());
    const sdk = { tag: "sdk" } as any;
    await fetchCsDocumentArtifacts(sdk, mockData);
    expect(constructedWithSdks).toEqual([sdk]);
  });
});

describe("folderScope", () => {
  it("prefers FolderKey, then FolderId, else nothing", () => {
    expect(folderScope({ FolderKey: "k", FolderId: 1 })).toEqual({
      folderKey: "k",
    });
    expect(folderScope({ FolderId: 1 })).toEqual({ folderId: 1 });
    expect(folderScope({})).toBeUndefined();
  });
});
