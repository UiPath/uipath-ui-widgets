import type {
  IClassifierResultDTO,
  ICsSaveClassificationAsDraftRequest,
  ICsSaveClassificationRequest,
} from "@uipath/du-classification-station-wc";
import type { CsContentValidationData } from "@uipath/du-utils";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { strToU8, zipSync } from "fflate";
import { folderScope } from "./bucketArtifactsUtil.js";

export interface SaveClassificationResult {
  success: boolean;
  error?: string;
}

/**
 * Where a validated classification is written, as described by `data`. Throws
 * when a piece is missing, so the save flows report it through their own
 * {@link SaveClassificationResult}.
 */
function bucketTarget(data: CsContentValidationData) {
  const { BucketId, ValidatedClassificationResultsPath, DocumentId } = data;
  const scope = folderScope(data);
  if (!BucketId || !ValidatedClassificationResultsPath || !scope) {
    throw new Error(
      "CsContentValidationData is missing BucketId, ValidatedClassificationResultsPath, or a folder (FolderId / FolderKey).",
    );
  }
  return {
    bucketId: BucketId,
    path: ValidatedClassificationResultsPath,
    scope,
    documentId: DocumentId,
  };
}

/**
 * Writes `classification` to `ValidatedClassificationResultsPath` the way the
 * cloud Classification Station does — the bare `Classifications` array, as a
 * .zip holding one JSON file — so either reopens what the other saved.
 */
async function uploadClassification(
  sdk: UiPath,
  data: CsContentValidationData,
  classification: IClassifierResultDTO,
): Promise<SaveClassificationResult> {
  try {
    const { bucketId, path, scope, documentId } = bucketTarget(data);
    // The inner filename follows the upload path's basename
    // ("results/output.zip" → "output.json"); a path without one falls back to
    // a documentId-scoped name. The reader takes the archive's first file.
    const basename = path.split("/").pop() ?? "";
    const fileName = basename
      ? basename.replace(/\.zip$/i, ".json")
      : documentId
        ? `${documentId}/output_results.json`
        : "output_results.json";
    const zipped = zipSync({
      [fileName]: strToU8(JSON.stringify(classification.Classifications)),
    });
    const result = await new BucketService(sdk).uploadFile({
      bucketId,
      path,
      content: new Blob([new Uint8Array(zipped)], { type: "application/zip" }),
      ...scope,
    });
    if (!result.success) {
      throw new Error(`Bucket upload failed with status ${result.statusCode}`);
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * The submit flow: writes the reviewed classification to
 * `ValidatedClassificationResultsPath`. It writes the same file a draft does —
 * what makes a submit final is the host completing the Action Center task.
 */
export function submitClassification(
  sdk: UiPath,
  data: CsContentValidationData,
  request: ICsSaveClassificationRequest,
): Promise<SaveClassificationResult> {
  return uploadClassification(sdk, data, request.classification);
}

/** The draft flow: the next load reopens on what it writes. */
export function saveClassificationAsDraft(
  sdk: UiPath,
  data: CsContentValidationData,
  request: ICsSaveClassificationAsDraftRequest,
): Promise<SaveClassificationResult> {
  return uploadClassification(sdk, data, request.classification);
}
