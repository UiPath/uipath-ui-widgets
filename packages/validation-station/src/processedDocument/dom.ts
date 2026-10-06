import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";
import { refuse } from "./payload.js";

const toPascalCase = (key: string): string =>
  key.charAt(0).toUpperCase() + key.slice(1);

// Safe to rename every key: nothing in a DOM is a keyed map (its metadata
// travels as `{ Key, Value }` pairs), so no key is data.
const withPascalCaseKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withPascalCaseKeys);
  if (value == null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      toPascalCase(key),
      withPascalCaseKeys(nested),
    ]),
  );
};

// Refused rather than passed on: the web component walks every level unguarded,
// so a partial model would surface as a TypeError.
const isDigitizedDocument = (dom: unknown): boolean => {
  const pages = (dom as { Pages?: unknown } | null)?.Pages;
  return (
    Array.isArray(pages) &&
    pages.every(
      (page) =>
        Array.isArray(page?.Size) &&
        Array.isArray(page?.Sections) &&
        page.Sections.every(
          (section: { WordGroups?: unknown }) =>
            Array.isArray(section?.WordGroups) &&
            section.WordGroups.every(
              (group: { Words?: unknown }) =>
                Array.isArray(group?.Words) &&
                group.Words.every((word: { Box?: unknown }) =>
                  Array.isArray(word?.Box),
                ),
            ),
        ),
    )
  );
};

/**
 * The pipeline serializes the DOM with camelCase keys; the DU contracts are
 * PascalCase. An artifact that already arrives PascalCase passes through.
 */
export function parseDigitizedDocument(
  json: string,
): DuFramework.DocumentEntity {
  let parsed: unknown;
  try {
    parsed = withPascalCaseKeys(JSON.parse(json));
  } catch {
    refuse("the resolved document object model could not be read");
  }
  if (!isDigitizedDocument(parsed)) {
    refuse("the resolved document object model is not a digitized document");
  }
  return parsed as DuFramework.DocumentEntity;
}
