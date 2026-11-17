import type {
  IClassificationResultDTO,
  IClassifierResultDTO,
  ICustomizationInfoDTO,
} from "@uipath/du-classification-station-wc";
import type { CsContentValidationData } from "@uipath/du-utils";
import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { unzipSync } from "fflate";
import type { CsDocumentArtifacts } from "./types.js";

/**
 * The folder every bucket call is scoped to. `FolderKey` wins when both are
 * set, matching the server's own precedence.
 */
export function folderScope(
  data: Pick<CsContentValidationData, "FolderId" | "FolderKey">,
): { folderKey: string } | { folderId: number } | undefined {
  if (data.FolderKey) return { folderKey: data.FolderKey };
  if (data.FolderId) return { folderId: data.FolderId };
  return undefined;
}

/** Fetch a URI, unzip the first file in the archive, and return the raw text. */
async function fetchAndUnzip(uri: string): Promise<string> {
  const res = await fetch(uri);
  if (!res.ok) {
    throw new Error(`Bucket read failed with status ${res.status}`);
  }
  const files = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const firstFile = Object.values(files)[0];
  if (!firstFile) throw new Error("Bucket archive is empty");
  return new TextDecoder().decode(firstFile);
}

/**
 * Fetches a file's artifacts from the storage bucket paths on a
 * classification task's `CsContentValidationData`, ready to pass as the
 * `artifacts` prop. The imperative counterpart of `useCsDocumentArtifacts`.
 *
 * Reads what the cloud Classification Station reads: the taxonomy (for its
 * `DocumentTypes`), the DOM, the text, the original, the customization (when
 * `CustomizationInfoPath` is set), and the validated classification — falling
 * back to the automatic one until the reviewer has saved one.
 *
 * @throws if `data` is missing any of the bucket fields the artifacts are read
 * from — the bucket, the paths, or the folder they live in.
 */
export async function fetchCsDocumentArtifacts(
  sdk: UiPath,
  data: CsContentValidationData,
): Promise<CsDocumentArtifacts> {
  return fetchBucketArtifacts(new BucketService(sdk), data);
}

export async function fetchBucketArtifacts(
  bucketService: BucketService,
  data: CsContentValidationData,
): Promise<CsDocumentArtifacts> {
  const {
    BucketId,
    TextPath,
    TaxonomyPath,
    EncodedDocumentPath,
    CustomizationInfoPath,
    DocumentObjectModelPath,
    AutomaticClassificationResultsPath,
    ValidatedClassificationResultsPath,
  } = data;
  const scope = folderScope(data);
  if (
    !BucketId ||
    !scope ||
    !TextPath ||
    !TaxonomyPath ||
    !EncodedDocumentPath ||
    !DocumentObjectModelPath ||
    !AutomaticClassificationResultsPath
  ) {
    throw new Error(
      "CsContentValidationData is missing required bucket fields (BucketId, artifact paths, or FolderId / FolderKey).",
    );
  }

  const readUri = async (path: string) =>
    (await bucketService.getReadUri({ bucketId: BucketId, path, ...scope }))
      .uri;
  const readText = async (path: string) => fetchAndUnzip(await readUri(path));
  const readJson = async (path: string): Promise<unknown> =>
    JSON.parse(await readText(path));

  // The bucket stores a bare array of results; the element takes it wrapped.
  const readClassification = async (
    path: string,
  ): Promise<IClassifierResultDTO> => ({
    Classifications: ((await readJson(path)) ??
      []) as IClassificationResultDTO[],
  });

  /**
   * The validated classification once the reviewer has saved one, else the
   * automatic one — the cloud element's order. Any failure reading the
   * validated file (typically: not written yet) falls back.
   */
  const readClassificationResults = async () => {
    if (ValidatedClassificationResultsPath) {
      try {
        return await readClassification(ValidatedClassificationResultsPath);
      } catch {
        // Not saved yet — review the automatic one.
      }
    }
    return readClassification(AutomaticClassificationResultsPath);
  };

  const [
    taxonomy,
    classificationResults,
    dom,
    text,
    customizationInfo,
    original,
  ] = await Promise.all([
    readJson(TaxonomyPath),
    readClassificationResults(),
    readJson(DocumentObjectModelPath),
    readText(TextPath),
    CustomizationInfoPath
      ? readJson(CustomizationInfoPath)
      : { FeatureCustomization: null },
    readText(EncodedDocumentPath),
  ]);

  return {
    docTypes:
      (taxonomy as DuFramework.DocumentTaxonomy | null)?.DocumentTypes ?? [],
    classificationResults,
    dom: dom as DuFramework.DocumentEntity,
    text,
    customizationInfo: customizationInfo as ICustomizationInfoDTO,
    original,
  };
}
