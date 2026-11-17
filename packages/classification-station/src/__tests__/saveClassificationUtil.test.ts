/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  saveClassificationAsDraft,
  submitClassification,
} from "../saveClassificationUtil";

const mockUploadFile = vi.fn();

vi.mock("@uipath/uipath-typescript/buckets", () => ({
  BucketService: class {
    uploadFile(args: unknown) {
      return mockUploadFile(args);
    }
  },
}));

const zipped: Record<string, Uint8Array>[] = [];

vi.mock("fflate", () => ({
  strToU8: (s: string) => new TextEncoder().encode(s),
  zipSync: (files: Record<string, Uint8Array>) => {
    zipped.push(files);
    return new Uint8Array([1, 2, 3]);
  },
}));

const sdk = {} as any;
const data = {
  BucketId: 100,
  FolderId: 42,
  DocumentId: "doc-1",
  ValidatedClassificationResultsPath: "results/validated.zip",
} as any;

const classification = {
  Classifications: [{ DocumentId: "doc-1", DocumentTypeId: "invoice" }],
} as any;

const decode = (files: Record<string, Uint8Array>) =>
  Object.fromEntries(
    Object.entries(files).map(([name, bytes]) => [
      name,
      JSON.parse(new TextDecoder().decode(bytes)),
    ]),
  );

beforeEach(() => {
  vi.clearAllMocks();
  zipped.length = 0;
  mockUploadFile.mockResolvedValue({ success: true, statusCode: 201 });
});

describe.each([
  ["submitClassification", submitClassification],
  ["saveClassificationAsDraft", saveClassificationAsDraft],
])("%s", (_name, save) => {
  it("writes the bare Classifications array to the validated path, as the cloud element does", async () => {
    const result = await save(sdk, data, {
      documentId: "doc-1",
      classification,
      automaticClassificationResults: null,
    });

    expect(result).toEqual({ success: true });
    expect(decode(zipped[0])).toEqual({
      "validated.json": classification.Classifications,
    });
    expect(mockUploadFile).toHaveBeenCalledWith(
      expect.objectContaining({
        bucketId: 100,
        path: "results/validated.zip",
        folderId: 42,
      }),
    );
  });

  it("reports a failed upload instead of throwing", async () => {
    mockUploadFile.mockResolvedValue({ success: false, statusCode: 403 });
    const result = await save(sdk, data, {
      documentId: "doc-1",
      classification,
      automaticClassificationResults: null,
    });
    expect(result).toEqual({
      success: false,
      error: "Bucket upload failed with status 403",
    });
  });

  it("reports a descriptor without a validated path", async () => {
    const result = await save(
      sdk,
      { ...data, ValidatedClassificationResultsPath: "" },
      {
        documentId: "doc-1",
        classification,
        automaticClassificationResults: null,
      },
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ValidatedClassificationResultsPath/);
    expect(mockUploadFile).not.toHaveBeenCalled();
  });
});
