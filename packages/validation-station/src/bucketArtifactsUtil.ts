import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import { unzipSync } from "fflate";
import type { DuDocumentArtifacts } from "./types.js";

/** Fetch a URI, unzip the first file in the archive, and return the raw text. */
async function fetchAndUnzip(uri: string): Promise<string> {
  const res = await fetch(uri);
  const buf = await res.arrayBuffer();
  const files = unzipSync(new Uint8Array(buf));
  const firstFile = Object.values(files)[0];
  return new TextDecoder().decode(firstFile);
}

async function fetchAndUnzipJson(uri: string): Promise<unknown> {
  const text = await fetchAndUnzip(uri);
  return JSON.parse(text);
}

/**
 * Fetches a document's artifacts from the storage bucket paths on
 * `ContentValidationData`, ready to pass as the `artifacts` prop. The
 * imperative counterpart of `useDuDocumentArtifacts`.
 *
 * @throws if `data` is missing any of the bucket fields the artifacts are read
 * from — the bucket, the paths, or the folder they live in.
 */
export async function fetchDuDocumentArtifacts(
  sdk: UiPath,
  data: DuFramework.ContentValidationData,
): Promise<DuDocumentArtifacts> {
  return fetchBucketArtifacts(new BucketService(sdk), data);
}

export async function fetchBucketArtifacts(
  bucketService: BucketService,
  data: DuFramework.ContentValidationData,
): Promise<DuDocumentArtifacts> {
  const {
    BucketId,
    FolderId,
    FolderKey,
    TextPath,
    TaxonomyPath,
    EncodedDocumentPath,
    CustomizationInfoPath,
    DocumentObjectModelPath,
    AutomaticExtractionResultsPath,
    ValidatedExtractionResultsPath,
  } = data;
  // The folder every bucket call is scoped to. FolderKey wins when both are
  // set, matching the server's own precedence.
  const scope = FolderKey
    ? { folderKey: FolderKey }
    : FolderId
      ? { folderId: FolderId }
      : undefined;
  if (
    !BucketId ||
    !scope ||
    !TextPath ||
    !TaxonomyPath ||
    !EncodedDocumentPath ||
    !CustomizationInfoPath ||
    !DocumentObjectModelPath ||
    !AutomaticExtractionResultsPath
  ) {
    throw new Error(
      "ContentValidationData is missing required bucket fields (BucketId, artifact paths, or FolderId / FolderKey).",
    );
  }

  const readUri = async (path: string) =>
    (await bucketService.getReadUri({ bucketId: BucketId, path, ...scope }))
      .uri;
  const readJson = async (path: string) =>
    fetchAndUnzipJson(await readUri(path));
  const readText = async (path: string) => fetchAndUnzip(await readUri(path));

  /** The validated result once the reviewer has saved one, else the automatic one. */
  const readExtractionResult = async () => {
    if (ValidatedExtractionResultsPath) {
      try {
        return await readJson(ValidatedExtractionResultsPath);
      } catch {
        // Validated result not saved yet — fall through to automatic.
      }
    }
    return readJson(AutomaticExtractionResultsPath);
  };

  const [taxonomy, extractionResult, dom, text, customizationInfo, original] =
    await Promise.all([
      readJson(TaxonomyPath),
      readExtractionResult(),
      readJson(DocumentObjectModelPath),
      readText(TextPath),
      readJson(CustomizationInfoPath),
      readText(EncodedDocumentPath),
    ]);

  return {
    taxonomy: taxonomy as DuFramework.DocumentTaxonomy,
    extractionResult: extractionResult as DuFramework.ExtractionResult,
    dom: dom as DuFramework.DocumentEntity,
    text,
    customizationInfo,
    original,
  };
}
