// Polyfills (zone.js, etc.) MUST load before main, or the Angular Element
// inside `main` will not bootstrap. Kept in its own module so import sorters
// can't reorder the side-effect imports relative to each other.
import "@uipath/du-validation-station-wc/polyfills";
import "@uipath/du-validation-station-wc/main";
import "@uipath/du-validation-station-wc/styles.css";

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

export const validationStationWcReady: Promise<void> =
  typeof window === "undefined"
    ? Promise.resolve()
    : window.customElements.whenDefined(VALIDATION_STATION_TAG).then(() => {});
