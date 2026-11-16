import { BucketService } from "@uipath/uipath-typescript/buckets";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { unzipSync } from "fflate";
import type {
  DocumentViewerContentData,
  DvDocumentArtifacts,
} from "./types.js";

/**
 * The folder every bucket call is scoped to. `FolderKey` wins when both are
 * set, matching the server's own precedence.
 */
export function folderScope(
  data: Pick<DocumentViewerContentData, "FolderId" | "FolderKey">,
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
 * Fetches what the viewer renders from the storage bucket paths on a task's
 * `ContentValidationData` (or `CsContentValidationData`), ready to pass as the
 * `artifacts` prop: the DOM always, the original and the text when their paths
 * are set. The imperative counterpart of `useDvDocumentArtifacts`.
 *
 * @throws if `data` lacks the bucket, the folder, or the DOM path.
 */
export async function fetchDvDocumentArtifacts(
  sdk: UiPath,
  data: DocumentViewerContentData,
): Promise<DvDocumentArtifacts> {
  return fetchBucketArtifacts(new BucketService(sdk), data);
}

export async function fetchBucketArtifacts(
  bucketService: BucketService,
  data: DocumentViewerContentData,
): Promise<DvDocumentArtifacts> {
  const { BucketId, DocumentObjectModelPath, EncodedDocumentPath, TextPath } =
    data;
  const scope = folderScope(data);
  if (!BucketId || !scope || !DocumentObjectModelPath) {
    throw new Error(
      "The content data is missing required bucket fields (BucketId, DocumentObjectModelPath, or FolderId / FolderKey).",
    );
  }

  const readText = async (path: string) =>
    fetchAndUnzip(
      (await bucketService.getReadUri({ bucketId: BucketId, path, ...scope }))
        .uri,
    );

  const [dom, original, text] = await Promise.all([
    readText(DocumentObjectModelPath).then(
      (json) => JSON.parse(json) as DuFramework.DocumentEntity,
    ),
    EncodedDocumentPath ? readText(EncodedDocumentPath) : undefined,
    TextPath ? readText(TextPath) : undefined,
  ]);

  return { dom, original, text };
}
