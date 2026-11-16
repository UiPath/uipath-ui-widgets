import { configureClassificationStationWc } from "@uipath/ui-widgets-classification-station";
import { configureDocumentViewerWc } from "@uipath/ui-widgets-document-viewer";
import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

/*
 * Each DU web component is loaded the first time a page that renders it
 * actually mounts, rather than eagerly at app startup — most widgets in this
 * sample app never touch DU, so there's no reason to fetch the bundles for
 * them. Safe to call from every such page's mount effect: each `configure…Wc`
 * is idempotent and caches its promise. The bundles are staged into `public/`
 * by `npm run stage-du-wc`.
 */

export function loadValidationStationWcOnDemand(): void {
  configureValidationStationWc({
    deploymentUrl: "/du-vs-wc",
    includeFonts: true,
  }).catch((error: unknown) => {
    console.error(
      "Failed to load the Validation Station web component:",
      error,
    );
  });
}

export function loadClassificationStationWcOnDemand(): void {
  configureClassificationStationWc({
    deploymentUrl: "/du-cs-wc",
    includeFonts: true,
  }).catch((error: unknown) => {
    console.error(
      "Failed to load the Classification Station web component:",
      error,
    );
  });
}

export function loadDocumentViewerWcOnDemand(): void {
  configureDocumentViewerWc({
    deploymentUrl: "/du-dv-wc",
    includeFonts: true,
  }).catch((error: unknown) => {
    console.error("Failed to load the document viewer web component:", error);
  });
}
