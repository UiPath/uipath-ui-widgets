import type { ContentValidationData } from "@uipath/du-shared-util-mfe";
import type { BucketService } from "@uipath/uipath-typescript/buckets";
import { unzipSync } from "fflate";
import type { BucketArtifacts } from "./types";

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
  data: ContentValidationData,
  folderId: number,
): Promise<BucketArtifacts> {
  const { BucketId: bucketId } = data;

  const [taxonomy, extractionResult, dom, text, customizationInfo, original] =
    await Promise.all([
      fetchArtifactJson(bucketService, bucketId, folderId, data.TaxonomyPath),
      fetchArtifactJson(
        bucketService,
        bucketId,
        folderId,
        data.AutomaticExtractionResultsPath,
      ),
      fetchArtifactJson(
        bucketService,
        bucketId,
        folderId,
        data.DocumentObjectModelPath,
      ),
      fetchArtifactText(bucketService, bucketId, folderId, data.TextPath),
      fetchArtifactJson(
        bucketService,
        bucketId,
        folderId,
        data.CustomizationInfoPath,
      ),
      fetchArtifactText(
        bucketService,
        bucketId,
        folderId,
        data.EncodedDocumentPath,
      ),
    ]);

  return { taxonomy, extractionResult, dom, text, customizationInfo, original };
}
