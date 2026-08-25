import type {
  IVsSaveValidatedDataAsDraftRequest,
  IVsSaveValidatedDataRequest,
} from "@uipath/du-validation-station-wc";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { type DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { OrchestratorDuModule } from "@uipath/uipath-typescript/orchestrator-du-module";
import { strToU8, zipSync } from "fflate";

export interface SaveValidatedDataResult {
  success: boolean;
  error?: string;
}

/**
 * Where a validated result is written, as described by `data`: the bucket, the
 * path, and the folder both are scoped to. Throws when a piece is missing, so
 * the two save flows report it through their own `SaveValidatedDataResult`.
 */
function bucketTarget(data: DuFramework.ContentValidationData) {
  const {
    BucketId,
    ValidatedExtractionResultsPath,
    DocumentId,
    FolderId,
    FolderKey,
  } = data;
  // FolderKey wins when both are set, matching the server's own precedence.
  const scope = FolderKey
    ? { folderKey: FolderKey }
    : FolderId
      ? { folderId: FolderId }
      : undefined;
  if (!BucketId || !ValidatedExtractionResultsPath || !scope) {
    throw new Error(
      "ContentValidationData is missing BucketId, ValidatedExtractionResultsPath, or a folder (FolderId / FolderKey).",
    );
  }
  return {
    bucketId: BucketId,
    path: ValidatedExtractionResultsPath,
    scope,
    documentId: DocumentId,
  };
}

async function uploadResultToBucket(
  bucketService: BucketService,
  { bucketId, path, scope, documentId }: ReturnType<typeof bucketTarget>,
  payload: unknown,
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
  const zipped = zipSync({ [fileName]: strToU8(JSON.stringify(payload)) });
  const blob = new Blob([new Uint8Array(zipped)], { type: "application/zip" });
  const result = await bucketService.uploadFile({
    bucketId,
    path,
    content: blob,
    ...scope,
  });
  if (!result.success) {
    throw new Error(`Bucket upload failed with status ${result.statusCode}`);
  }
}

export async function submitValidatedData(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  request: IVsSaveValidatedDataRequest,
): Promise<SaveValidatedDataResult> {
  try {
    const target = bucketTarget(data);
    const du = new OrchestratorDuModule(sdk);
    const processedResult = await du.processExtractedData(
      {
        AutomaticExtractedResults:
          request.automaticExtractionResult as DuFramework.ExtractionResult,
        ValidatedExtractedResults:
          request.validatedData as DuFramework.ExtractionResult,
        Taxonomy: request.taxonomy as DuFramework.DocumentTaxonomy,
      },
      target.scope,
    );
    await uploadResultToBucket(new BucketService(sdk), target, processedResult);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function saveValidatedDataAsDraft(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
  request: IVsSaveValidatedDataAsDraftRequest,
): Promise<SaveValidatedDataResult> {
  try {
    await uploadResultToBucket(
      new BucketService(sdk),
      bucketTarget(data),
      request.validatedData,
    );
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
