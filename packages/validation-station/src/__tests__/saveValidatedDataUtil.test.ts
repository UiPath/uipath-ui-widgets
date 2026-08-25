/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  saveValidatedDataAsDraft,
  submitValidatedData,
} from "../saveValidatedDataUtil";

const mockUploadFile = vi.fn();
const MockBucketService = vi.fn(() => ({ uploadFile: mockUploadFile }));

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  // The SUT constructs `new BucketService(sdk)`; the constructor args are not
  // asserted, so the mock ignores them and just yields the uploadFile spy.
  BucketService: function () {
    return MockBucketService();
  },
}));

const mockProcessExtractedData = vi.fn();
const MockOrchestratorDuModule = vi.fn(() => ({
  processExtractedData: mockProcessExtractedData,
}));

vi.mock("@uipath/uipath-typescript/orchestrator-du-module", () => ({
  OrchestratorDuModule: function () {
    return MockOrchestratorDuModule();
  },
}));

// Capture what gets zipped so we can assert on the inner filename.
const zipCalls: Array<Record<string, Uint8Array>> = [];
vi.mock("fflate", () => ({
  strToU8: (s: string) => new TextEncoder().encode(s),
  zipSync: (files: Record<string, Uint8Array>) => {
    zipCalls.push(files);
    return new Uint8Array([0x50, 0x4b]); // dummy zip bytes
  },
}));

const makeSdk = (overrides: Record<string, any> = {}) =>
  ({
    config: {
      baseUrl: "https://cloud.uipath.com/",
      orgName: "myorg",
      tenantName: "mytenant",
    },
    getToken: () => "test-token",
    ...overrides,
  }) as any;

const makeData = (overrides: Record<string, any> = {}) =>
  ({
    BucketId: 100,
    FolderId: 42,
    ValidatedExtractionResultsPath: "results/output.zip",
    DocumentId: "doc-abc",
    ...overrides,
  }) as any;

const makeRequest = (overrides: Record<string, any> = {}) =>
  ({
    automaticExtractionResult: { auto: 1 },
    validatedData: { validated: 2 },
    taxonomy: { tax: 3 },
    ...overrides,
  }) as any;

beforeEach(() => {
  vi.clearAllMocks();
  zipCalls.length = 0;
});

describe("submitValidatedData", () => {
  describe("validation", () => {
    it("returns error when BucketId is missing", async () => {
      const result = await submitValidatedData(
        makeSdk(),
        makeData({ BucketId: undefined }),
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("BucketId");
    });

    it("returns error when ValidatedExtractionResultsPath is missing", async () => {
      const result = await submitValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: undefined }),
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("ValidatedExtractionResultsPath");
    });

    it("returns error when data names no folder", async () => {
      const result = await submitValidatedData(
        makeSdk(),
        makeData({ FolderId: undefined, FolderKey: undefined }),
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("FolderId / FolderKey");
    });

    it("does not call SDK or upload when validation fails", async () => {
      await submitValidatedData(
        makeSdk(),
        makeData({ BucketId: undefined }),
        makeRequest(),
      );
      expect(mockProcessExtractedData).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });
  });

  describe("folder scoping", () => {
    it("scopes both the SDK call and the upload by FolderKey when set", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({ FolderId: undefined, FolderKey: "folder-key-1" }),
        makeRequest(),
      );

      expect(mockProcessExtractedData).toHaveBeenCalledWith(expect.anything(), {
        folderKey: "folder-key-1",
      });
      const uploadArg = mockUploadFile.mock.calls[0][0];
      expect(uploadArg.folderKey).toBe("folder-key-1");
      expect(uploadArg.folderId).toBeUndefined();
    });

    it("prefers FolderKey over FolderId when data carries both", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({ FolderId: 42, FolderKey: "folder-key-1" }),
        makeRequest(),
      );

      expect(mockProcessExtractedData).toHaveBeenCalledWith(expect.anything(), {
        folderKey: "folder-key-1",
      });
      expect(mockUploadFile.mock.calls[0][0].folderId).toBeUndefined();
    });
  });

  describe("happy path", () => {
    it("forwards the merged payload to DocumentUnderstanding.processExtractedData", async () => {
      mockProcessExtractedData.mockResolvedValue({ processed: true });
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(makeSdk(), makeData(), makeRequest());

      expect(mockProcessExtractedData).toHaveBeenCalledTimes(1);
      expect(mockProcessExtractedData).toHaveBeenCalledWith(
        {
          AutomaticExtractedResults: { auto: 1 },
          ValidatedExtractedResults: { validated: 2 },
          Taxonomy: { tax: 3 },
        },
        { folderId: 42 },
      );
    });

    it("uploads the SDK's processed result to the bucket and returns success", async () => {
      mockProcessExtractedData.mockResolvedValue({ processed: true });
      mockUploadFile.mockResolvedValue({ success: true });

      const result = await submitValidatedData(
        makeSdk(),
        makeData(),
        makeRequest(),
      );

      expect(result).toEqual({ success: true });
      expect(mockUploadFile).toHaveBeenCalledTimes(1);
      const uploadArg = mockUploadFile.mock.calls[0][0];
      expect(uploadArg.bucketId).toBe(100);
      expect(uploadArg.folderId).toBe(42);
      expect(uploadArg.path).toBe("results/output.zip");
      expect(uploadArg.content).toBeInstanceOf(Blob);
      expect(uploadArg.content.type).toBe("application/zip");
    });
  });

  describe("inner filename inside zip", () => {
    it("derives inner filename from path basename with .json extension", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: "a/b/c/output.zip" }),
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output.json"]);
    });

    it("keeps non-.zip basename as-is", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: "results/output.bin" }),
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output.bin"]);
    });

    it("uses documentId-prefixed fallback when path has no basename and DocumentId is set", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({
          ValidatedExtractionResultsPath: "results/",
          DocumentId: "doc-xyz",
        }),
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["doc-xyz/output_results.json"]);
    });

    it("uses plain default fallback when path has no basename and DocumentId is missing", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: true });

      await submitValidatedData(
        makeSdk(),
        makeData({
          ValidatedExtractionResultsPath: "results/",
          DocumentId: undefined,
        }),
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output_results.json"]);
    });
  });

  describe("error paths", () => {
    it("returns error when DocumentUnderstanding.processExtractedData rejects", async () => {
      mockProcessExtractedData.mockRejectedValue(
        new Error("ProcessExtractedData failed (500): server boom"),
      );

      const result = await submitValidatedData(
        makeSdk(),
        makeData(),
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("ProcessExtractedData failed (500)");
      expect(result.error).toContain("server boom");
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    it("returns error when bucket upload reports failure", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockResolvedValue({ success: false, statusCode: 403 });

      const result = await submitValidatedData(
        makeSdk(),
        makeData(),
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Bucket upload failed with status 403");
    });

    it("returns error when bucket upload throws", async () => {
      mockProcessExtractedData.mockResolvedValue({});
      mockUploadFile.mockRejectedValue(new Error("bucket exploded"));

      const result = await submitValidatedData(
        makeSdk(),
        makeData(),
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("bucket exploded");
    });

    it("stringifies non-Error rejections", async () => {
      mockProcessExtractedData.mockRejectedValue("string error");

      const result = await submitValidatedData(
        makeSdk(),
        makeData(),
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("string error");
    });
  });
});

describe("saveValidatedDataAsDraft", () => {
  const makeDraftRequest = (overrides: Record<string, any> = {}) =>
    ({
      documentId: "doc-abc",
      validatedData: { draft: 1 },
      ...overrides,
    }) as any;

  it("returns error when BucketId is missing", async () => {
    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData({ BucketId: undefined }),
      makeDraftRequest(),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("BucketId");
  });

  it("returns error when ValidatedExtractionResultsPath is missing", async () => {
    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData({ ValidatedExtractionResultsPath: undefined }),
      makeDraftRequest(),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("ValidatedExtractionResultsPath");
  });

  it("returns error when data names no folder", async () => {
    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData({ FolderId: undefined, FolderKey: undefined }),
      makeDraftRequest(),
    );
    expect(result.success).toBe(false);
    expect(result.error).toContain("FolderId / FolderKey");
  });

  it("scopes the upload by FolderKey when set", async () => {
    mockUploadFile.mockResolvedValue({ success: true });

    await saveValidatedDataAsDraft(
      makeSdk(),
      makeData({ FolderId: undefined, FolderKey: "folder-key-1" }),
      makeDraftRequest(),
    );

    const uploadArg = mockUploadFile.mock.calls[0][0];
    expect(uploadArg.folderKey).toBe("folder-key-1");
    expect(uploadArg.folderId).toBeUndefined();
  });

  it("does NOT call processExtractedData — draft skips the SDK", async () => {
    mockUploadFile.mockResolvedValue({ success: true });
    await saveValidatedDataAsDraft(makeSdk(), makeData(), makeDraftRequest());
    expect(mockProcessExtractedData).not.toHaveBeenCalled();
  });

  it("uploads raw validatedData to the bucket and returns success", async () => {
    mockUploadFile.mockResolvedValue({ success: true });

    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData(),
      makeDraftRequest({ validatedData: { hello: "world" } }),
    );

    expect(result).toEqual({ success: true });
    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    const uploadArg = mockUploadFile.mock.calls[0][0];
    expect(uploadArg.bucketId).toBe(100);
    expect(uploadArg.folderId).toBe(42);
    expect(uploadArg.path).toBe("results/output.zip");
    expect(uploadArg.content).toBeInstanceOf(Blob);
    // The raw validatedData should have been the payload that got zipped.
    const zipped = zipCalls[zipCalls.length - 1];
    const innerBytes = Object.values(zipped)[0];
    const innerJson = JSON.parse(new TextDecoder().decode(innerBytes));
    expect(innerJson).toEqual({ hello: "world" });
  });

  it("returns error when the bucket upload reports failure", async () => {
    mockUploadFile.mockResolvedValue({ success: false, statusCode: 403 });

    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData(),
      makeDraftRequest(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("Bucket upload failed with status 403");
  });

  it("returns error when the bucket upload throws", async () => {
    mockUploadFile.mockRejectedValue(new Error("boom"));

    const result = await saveValidatedDataAsDraft(
      makeSdk(),
      makeData(),
      makeDraftRequest(),
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("boom");
  });
});
