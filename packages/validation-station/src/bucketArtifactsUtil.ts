import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import type { BucketService } from "@uipath/uipath-typescript/buckets";
import { unzipSync } from "fflate";
import type { BucketArtifacts } from "./types.js";

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

/** Get URI then immediately fetch + unzip as JSON. */
async function fetchArtifactJson(
  bucketService: BucketService,
  bucketId: number,
  folderId: number,
  path: string,
): Promise<unknown> {
  const r = await bucketService.getReadUri({ bucketId, folderId, path });
  return fetchAndUnzipJson(r.uri);
}

/**
 * Fetch the validated extraction result if it exists in the bucket, otherwise
 * fall back to the automatic extraction result.
 */
async function fetchExtractionResult(
  bucketService: BucketService,
  bucketId: number,
  folderId: number,
  validatedPath: string | null | undefined,
  automaticPath: string,
): Promise<unknown> {
  if (validatedPath) {
    try {
      return await fetchArtifactJson(
        bucketService,
        bucketId,
        folderId,
        validatedPath,
      );
    } catch {
      // Validated result not saved yet — fall through to automatic.
    }
  }
  return fetchArtifactJson(bucketService, bucketId, folderId, automaticPath);
}

/** Get URI then immediately fetch + unzip as text. */
async function fetchArtifactText(
  bucketService: BucketService,
  bucketId: number,
  folderId: number,
  path: string,
): Promise<string> {
  const r = await bucketService.getReadUri({ bucketId, folderId, path });
  return await fetchAndUnzip(r.uri);
}

export async function fetchBucketArtifacts(
  bucketService: BucketService,
  data: DuFramework.ContentValidationData,
  folderId: number,
): Promise<BucketArtifacts> {
  const {
    BucketId,
    TextPath,
    TaxonomyPath,
    EncodedDocumentPath,
    CustomizationInfoPath,
    DocumentObjectModelPath,
    AutomaticExtractionResultsPath,
    ValidatedExtractionResultsPath,
  } = data;
  if (
    !BucketId ||
    !TextPath ||
    !TaxonomyPath ||
    !EncodedDocumentPath ||
    !CustomizationInfoPath ||
    !DocumentObjectModelPath ||
    !AutomaticExtractionResultsPath
  ) {
    throw new Error(
      "ContentValidationData is missing required bucket artifact fields.",
    );
  }

  const [taxonomy, extractionResult, dom, text, customizationInfo, original] =
    await Promise.all([
      fetchArtifactJson(bucketService, BucketId, folderId, TaxonomyPath),
      fetchExtractionResult(
        bucketService,
        BucketId,
        folderId,
        ValidatedExtractionResultsPath,
        AutomaticExtractionResultsPath,
      ),
      fetchArtifactJson(
        bucketService,
        BucketId,
        folderId,
        DocumentObjectModelPath,
      ),
      fetchArtifactText(bucketService, BucketId, folderId, TextPath),
      fetchArtifactJson(
        bucketService,
        BucketId,
        folderId,
        CustomizationInfoPath,
      ),
      fetchArtifactText(bucketService, BucketId, folderId, EncodedDocumentPath),
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
