// Polyfills (zone.js, etc.) MUST load before main, or the Angular Element
// inside `main` will not bootstrap. Kept in its own module so import sorters
// can't reorder the side-effect imports relative to each other.
import "@uipath/du-validation-station-wc/polyfills";
import "@uipath/du-validation-station-wc/main";
import "@uipath/du-validation-station-wc/styles.css";
// Apollo fonts + Material Icons are shipped as a separate, opt-in stylesheet
// (their @font-face rules must apply in the light DOM — they're ignored inside
// the WC's shadow root). Without this, text falls back to system fonts and
// icon glyphs render as empty boxes.
import "@uipath/du-validation-station-wc/fonts.css";

// zone.js (loaded above) replaces Promise with ZoneAwarePromise which lacks
// Promise.try(). The WC calls it at render time, not module init, so restoring
// it here (after imports) is early enough. Remove when the WC upgrades zone.js.
if (typeof Promise.try !== "function") {
  Promise.try = <T, U extends unknown[]>(
    fn: (...args: U) => T | PromiseLike<T>,
    ...args: U
  ) => new Promise<T>((resolve) => resolve(fn(...args))) as Promise<Awaited<T>>;
}

export const VALIDATION_STATION_TAG =
  "ui-du-validation-station-standalone-wc-element";

/**
 * Custom-element tag names for every standalone DU web component registered by
 * the `main` import above. Each has a `-persistent-element` sibling (see
 * {@link convertToPersistentTag}) that survives portal detachment via `forceDestroy()`.
 */
export const DU_WC_TAGS = {
  validationStation: VALIDATION_STATION_TAG,
  documentViewer: "ui-du-document-viewer-standalone-wc-element",
  compactFieldsForm: "ui-du-compact-fields-form-standalone-wc-element",
  compactTableEditor: "ui-du-compact-table-editor-standalone-wc-element",
  compactBusinessRules: "ui-du-compact-business-rules-standalone-wc-element",
  compactDocTypeField: "ui-du-compact-doc-type-field-standalone-wc-element",
} as const;

/** Maps a base element tag to its persistent (`forceDestroy()`-capable) variant. */
export function convertToPersistentTag(tag: string): string {
  return tag.replace(/-element$/, "-persistent-element");
}

export async function waitForWcElementReady(tag: string): Promise<void> {
  // No custom-element registry off the main thread / during SSR — resolve to a
  // no-op so importing this module (and the `validationStationWcReady` const
  // below, evaluated at import time) never touches `window` on the server.
  if (typeof window === "undefined") return;
  await window.customElements.whenDefined(tag);
}

export const validationStationWcReady: Promise<void> = waitForWcElementReady(
  VALIDATION_STATION_TAG,
);
