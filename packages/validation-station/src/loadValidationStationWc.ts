import {
  loadValidationStationWebComponent,
  type LoadWebComponentOptions,
} from "@uipath/du-utils";

/**
 * Configuration for {@link configureValidationStationWc} — the deployment URL
 * plus every option the underlying loader accepts (currently `includeFonts`:
 * inject the web component's `fonts.css` as a light-DOM stylesheet, needed
 * unless the host already loads Apollo fonts and Material Icons globally).
 */
export interface ValidationStationWcConfig extends LoadWebComponentOptions {
  /**
   * Base URL the web component's build artifacts (`polyfills.js`, `main.js`,
   * `styles.css`, `fonts.css`) are served from — e.g. `/du-vs-wc` when the
   * contents of `@uipath/du-validation-station-wc` are hosted from the app's
   * own static assets.
   *
   * Treat this as trusted application configuration: the loader injects
   * `<script type="module" src>` from it, so whoever controls this URL executes
   * script in your app's origin. Pass a literal or a build-time value — never
   * one derived from `location`, a query parameter, or any other user input.
   */
  deploymentUrl: string;
}

let loadPromise: Promise<void> | null = null;
let loadFailed = false;
let warnedUnconfigured = false;

/**
 * zone.js — loaded by the web component's `polyfills.js` — replaces the global
 * `Promise` with `ZoneAwarePromise`, which lacks `Promise.try()`. The web
 * component calls it at render time rather than at module init, so restoring it
 * once the bundle has loaded is early enough. Remove when the web component
 * upgrades zone.js.
 */
function restorePromiseTry(): void {
  if (typeof Promise.try === "function") return;
  Promise.try = <T, U extends unknown[]>(
    fn: (...args: U) => T | PromiseLike<T>,
    ...args: U
  ) => new Promise<T>((resolve) => resolve(fn(...args))) as Promise<Awaited<T>>;
}

/**
 * Loads the Validation Station web component from `deploymentUrl` and registers
 * every custom element in {@link DU_WC_TAGS}. Call this once at app startup,
 * before rendering any component from this package.
 *
 * Loading is per-page and idempotent: while a load is pending or has succeeded,
 * repeat calls return that same promise without re-injecting scripts, so a later
 * call with a different `deploymentUrl` has no effect. Calling it again *after* a
 * failure starts a fresh attempt.
 *
 * The returned promise is the error channel for load failures (a bad URL, a 404,
 * an offline network). The rejection is retained, so components waiting via
 * {@link waitForWcElementReady} observe the same error rather than waiting
 * forever.
 */
export function configureValidationStationWc(
  config: ValidationStationWcConfig,
): Promise<void> {
  if (loadPromise && !loadFailed) return loadPromise;

  const { deploymentUrl, ...options } = config;

  loadFailed = false;
  loadPromise = loadValidationStationWebComponent(
    document,
    deploymentUrl,
    options,
  )
    .then(restorePromiseTry)
    .catch((error: unknown) => {
      // Flag rather than clear: `waitForWcElementReady` must still see this
      // rejection (clearing it would look indistinguishable from "never
      // configured" and hang every waiter), while a later configure call is
      // still free to start a new attempt.
      loadFailed = true;
      throw error;
    });
  return loadPromise;
}

export const VALIDATION_STATION_TAG =
  "ui-du-validation-station-standalone-wc-element";

/**
 * Custom-element tag names for every standalone DU web component registered by
 * {@link configureValidationStationWc}. Each has a `-persistent-element` sibling
 * (see {@link convertToPersistentTag}) that survives portal detachment via
 * `forceDestroy()`.
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

/**
 * Resolves once `tag` has been registered in the browser's custom-element
 * registry — i.e. after {@link configureValidationStationWc}'s scripts have run.
 *
 * The loader resolves on the bundle's `load` event, which is before Angular
 * Elements has defined the elements, so both waits are needed.
 */
export async function waitForWcElementReady(tag: string): Promise<void> {
  // No custom-element registry off the main thread / during SSR — resolve to a
  // no-op so this never touches `window` on the server.
  if (typeof window === "undefined") return;

  if (loadPromise) {
    await loadPromise;
  } else if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    // Not fatal: the host page may have loaded the same bundle by other means
    // (the loader caches on `window`, and hosts like Action Center preload it).
    // Fall through to `whenDefined` so that case still works.
    console.error(
      "[validation-station] configureValidationStationWc({ deploymentUrl }) has not " +
        "been called. Waiting in case the host page loaded the web component another way.",
    );
  }

  await window.customElements.whenDefined(tag);
}
