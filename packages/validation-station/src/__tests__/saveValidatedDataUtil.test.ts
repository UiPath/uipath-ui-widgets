/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveValidatedData } from "../saveValidatedDataUtil";

const mockUploadFile = vi.fn();
const MockBucketService = vi.fn(() => ({ uploadFile: mockUploadFile }));

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: function (...args: any[]) {
    return MockBucketService(...args);
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

describe("saveValidatedData", () => {
  describe("validation", () => {
    it("returns error when BucketId is missing", async () => {
      const result = await saveValidatedData(
        makeSdk(),
        makeData({ BucketId: undefined }),
        42,
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("BucketId");
    });

    it("returns error when folderId is 0/missing", async () => {
      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        0,
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("FolderId");
    });

    it("returns error when ValidatedExtractionResultsPath is missing", async () => {
      const result = await saveValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: undefined }),
        42,
        makeRequest(),
      );
      expect(result.success).toBe(false);
      expect(result.error).toContain("ValidatedExtractionResultsPath");
    });

    it("does not call fetch or upload when validation fails", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch");
      await saveValidatedData(
        makeSdk(),
        makeData({ BucketId: undefined }),
        42,
        makeRequest(),
      );
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });
  });

  describe("happy path", () => {
    it("calls ProcessExtractedData with correct URL, headers, and body", async () => {
      const processed = { processed: true };
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(processed), { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(makeSdk(), makeData(), 42, makeRequest());

      const fetchCall = (globalThis.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe(
        "https://cloud.uipath.com/myorg/mytenant/orchestrator_/doc-understanding/DocumentModule/ProcessExtractedData",
      );
      expect(fetchCall[1].method).toBe("POST");
      expect(fetchCall[1].headers).toEqual({
        "Content-Type": "application/json",
        "X-UIPATH-OrganizationUnitId": "42",
        Authorization: "Bearer test-token",
      });
      expect(JSON.parse(fetchCall[1].body)).toEqual({
        AutomaticExtractedResults: { auto: 1 },
        ValidatedExtractedResults: { validated: 2 },
        Taxonomy: { tax: 3 },
      });
    });

    it("strips trailing slashes from baseUrl when building service URL", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(
        makeSdk({
          config: {
            baseUrl: "https://cloud.uipath.com///",
            orgName: "org",
            tenantName: "tenant",
          },
          getToken: () => "tk",
        }),
        makeData(),
        42,
        makeRequest(),
      );

      const fetchCall = (globalThis.fetch as any).mock.calls[0];
      expect(fetchCall[0]).toBe(
        "https://cloud.uipath.com/org/tenant/orchestrator_/doc-understanding/DocumentModule/ProcessExtractedData",
      );
    });

    it("uploads result to bucket with correct args and returns success", async () => {
      const processed = { processed: true };
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(JSON.stringify(processed), { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
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
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: "a/b/c/output.zip" }),
        42,
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output.json"]);
    });

    it("keeps non-.zip basename as-is", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(
        makeSdk(),
        makeData({ ValidatedExtractionResultsPath: "results/output.bin" }),
        42,
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output.bin"]);
    });

    it("uses documentId-prefixed fallback when path has no basename and DocumentId is set", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(
        makeSdk(),
        makeData({
          ValidatedExtractionResultsPath: "results/",
          DocumentId: "doc-xyz",
        }),
        42,
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["doc-xyz/output_results.json"]);
    });

    it("uses plain default fallback when path has no basename and DocumentId is missing", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: true });

      await saveValidatedData(
        makeSdk(),
        makeData({
          ValidatedExtractionResultsPath: "results/",
          DocumentId: undefined,
        }),
        42,
        makeRequest(),
      );

      expect(Object.keys(zipCalls[0])).toEqual(["output_results.json"]);
    });
  });

  describe("error paths", () => {
    it("returns error when ProcessExtractedData responds non-OK", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("server boom", { status: 500 }),
      );

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("ProcessExtractedData failed (500)");
      expect(result.error).toContain("server boom");
      expect(mockUploadFile).not.toHaveBeenCalled();
    });

    it("returns error when fetch rejects", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue(
        new Error("network down"),
      );

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("network down");
    });

    it("returns error when bucket upload reports failure", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockResolvedValue({ success: false, statusCode: 403 });

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Bucket upload failed with status 403");
    });

    it("returns error when bucket upload throws", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response("{}", { status: 200 }),
      );
      mockUploadFile.mockRejectedValue(new Error("bucket exploded"));

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("bucket exploded");
    });

    it("stringifies non-Error rejections", async () => {
      vi.spyOn(globalThis, "fetch").mockRejectedValue("string error");

      const result = await saveValidatedData(
        makeSdk(),
        makeData(),
        42,
        makeRequest(),
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("string error");
    });
  });
});
