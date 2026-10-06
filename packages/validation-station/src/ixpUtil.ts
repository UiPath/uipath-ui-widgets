import type {
  IXPExtraction,
  IXPTaxonomy,
} from "@uipath/du-validation-station-wc";

/** A UiPath `DocumentTaxonomy` is PascalCase, so it never has `properties` or `$defs`. */
export const isIXPTaxonomy = (value: unknown): value is IXPTaxonomy =>
  typeof value === "object" &&
  value !== null &&
  ("properties" in value || "$defs" in value);

/** A UiPath `ExtractionResult` is PascalCase, so it never has `output` or `attribution`. */
export const isIXPExtraction = (value: unknown): value is IXPExtraction =>
  typeof value === "object" &&
  value !== null &&
  ("output" in value || "attribution" in value);
