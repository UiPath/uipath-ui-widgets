import type {
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { type DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { strToU8, zipSync } from "fflate";

/**
 * Opt-in Orchestrator persistence helpers for the validation-station save flows.
 *
 * The widgets do **not** call these: they emit `onSaveValidatedDataRequest` /
 * `onSaveValidatedDataAsDraftRequest` and the host decides what to persist and
 * when (e.g. save, then complete the Orchestrator task). These functions
 * implement the standard write — the Orchestrator DU module's
 * `ProcessExtractedData` (submit only) plus the zipped upload to the
 * Orchestrator storage bucket at `ValidatedExtractionResultsPath` — so hosts
 * that want the standard behaviour don't have to rebuild it.
 */
export interface SaveValidatedDataResult {
  success: boolean;
  error?: string;
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
  const fileName = basename
    ? basename.replace(/\.zip$/i, ".json")
    : fallbackFileName;
  const zipped = zipSync({ [fileName]: strToU8(JSON.stringify(data)) });
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

export async function submitValidatedDataToOrchestrator(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number,
  request: IVsSaveValidatedDataRequest,
): Promise<SaveValidatedDataResult> {
  const { BucketId, ValidatedExtractionResultsPath, DocumentId } = data;
  if (!BucketId || !ValidatedExtractionResultsPath) {
    return {
      success: false,
      error:
        "ContentValidationData is missing BucketId or ValidatedExtractionResultsPath.",
    };
  }
  try {
    const du = new OrchestratorDuModule(sdk);
    const processedResult = await du.processExtractedData(
      {
        AutomaticExtractedResults:
          request.automaticExtractionResult as DuFramework.ExtractionResult,
        ValidatedExtractedResults:
          request.validatedData as DuFramework.ExtractionResult,
        Taxonomy: request.taxonomy as DuFramework.DocumentTaxonomy,
      },
      { folderId },
    );
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

export async function saveValidatedDataAsDraftToOrchestrator(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  folderId: number,
  request: IVsSaveValidatedDataAsDraftRequest,
): Promise<SaveValidatedDataResult> {
  const { BucketId, ValidatedExtractionResultsPath, DocumentId } = data;
  if (!BucketId || !ValidatedExtractionResultsPath) {
    return {
      success: false,
      error:
        "ContentValidationData is missing BucketId or ValidatedExtractionResultsPath.",
    };
  }
  try {
    await uploadResultToBucket(
      new BucketService(sdk),
      BucketId,
      folderId,
      ValidatedExtractionResultsPath,
      request.validatedData,
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
