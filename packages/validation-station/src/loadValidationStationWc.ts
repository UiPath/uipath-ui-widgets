// Polyfills (zone.js, etc.) MUST load before main, or the Angular Element
// inside `main` will not bootstrap. Kept in its own module so import sorters
// can't reorder the side-effect imports relative to each other.
import "@uipath/du-validation-station-wc/polyfills";
import "./promise-try-polyfill.js";
import "@uipath/du-validation-station-wc/main";
import "@uipath/du-validation-station-wc/styles.css";

export const VALIDATION_STATION_TAG =
  "ui-du-validation-station-standalone-wc-element";

export const validationStationWcReady: Promise<void> =
  typeof window === "undefined"
    ? Promise.resolve()
    : window.customElements.whenDefined(VALIDATION_STATION_TAG).then(() => {});
