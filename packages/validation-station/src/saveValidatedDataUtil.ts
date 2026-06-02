import type { IVsSaveValidatedDataRequest } from "@uipath/du-validation-station-wc";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { strToU8, zipSync } from "fflate";

const FOLDER_ID = "X-UIPATH-OrganizationUnitId";
const PROCESS_EXTRACTED_DATA_PATH =
  "orchestrator_/doc-understanding/DocumentModule/ProcessExtractedData";

export interface SaveValidatedDataResult {
  success: boolean;
  error?: string;
}

function buildServiceUrl(sdk: UiPath, path: string): string {
  const { baseUrl, orgName, tenantName } = sdk.config;
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}/${orgName}/${tenantName}/${path}`;
}

async function processExtractedData(
  sdk: UiPath,
  folderId: number,
  payload: {
    AutomaticExtractedResults: unknown;
    ValidatedExtractedResults: unknown;
    Taxonomy: unknown;
  },
): Promise<unknown> {
  const url = buildServiceUrl(sdk, PROCESS_EXTRACTED_DATA_PATH);
  const token = sdk.getToken();
  const headers = {
    "Content-Type": "application/json",
    [FOLDER_ID]: folderId.toString(),
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `ProcessExtractedData failed (${response.status}): ${body}`,
    );
  }
  return response.json();
}

async function uploadResultToBucket(
  bucketService: BucketService,
  bucketId: number,
  folderId: number,
  path: string,
  data: unknown,
  documentId?: string,
): Promise<void> {
  // The bucket stores a .zip containing a single JSON file. The inner
  // filename is derived from the upload path's basename (e.g.
  // "results/output.zip" → "output.json"). If the path has no basename
  // (e.g. "results/"), fall back to a documentId-scoped name so concurrent
  // saves for different documents don't collide on the same inner key.
  const fallbackFileName = documentId
    ? `${documentId}/output_results.json`
    : "output_results.json";
  const basename = path.split("/").pop() ?? "";
  const innerFileName = basename
    ? basename.replace(/\.zip$/i, ".json")
    : fallbackFileName;
  const zipped = zipSync({ [innerFileName]: strToU8(JSON.stringify(data)) });
  const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  const result = await bucketService.uploadFile({
    bucketId,
    folderId,
    path,
    content: blob,
  });
  if (!result.success) {
    throw new Error(`Bucket upload failed with status ${result.statusCode}`);
  }
}

export async function saveValidatedData(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number,
  request: IVsSaveValidatedDataRequest,
): Promise<SaveValidatedDataResult> {
  const { BucketId, ValidatedExtractionResultsPath, DocumentId } = data;
  if (!BucketId || !folderId || !ValidatedExtractionResultsPath) {
    return {
      success: false,
      error:
        "ContentValidationData is missing BucketId, FolderId, or ValidatedExtractionResultsPath.",
    };
  }
  try {
    const processedResult = await processExtractedData(sdk, folderId, {
      AutomaticExtractedResults: request.automaticExtractionResult,
      ValidatedExtractedResults: request.validatedData,
      Taxonomy: request.taxonomy,
    });
    await uploadResultToBucket(
      new BucketService(sdk),
      BucketId,
      folderId,
      ValidatedExtractionResultsPath,
      processedResult,
      DocumentId,
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
