import {
  csAppName,
  loadWebComponent,
  type LoadWebComponentOptions,
  type ResolveBaseUrl,
} from "@uipath/du-utils";
import { getAppBase } from "@uipath/uipath-typescript";
import { joinDeploymentUrl } from "./urlUtil.js";

/**
 * Configuration for {@link configureClassificationStationWc} — the deployment
 * URL plus every option the underlying loader accepts (currently
 * `includeFonts`: inject the web component's `fonts.css` as a light-DOM
 * stylesheet, needed unless the host already loads Material Icons globally). A
 * base served from the npm package carries Material Icons only, not the Apollo
 * text fonts — see the README's "Fonts".
 */
export interface ClassificationStationWcConfig extends LoadWebComponentOptions {
  /**
   * Base URL the web component's build artifacts (`polyfills.js`, `main.js`,
   * `styles.css`, `fonts.css`, plus `du-assets/` and `media/`) are served from
   * — e.g. `/du-cs-wc` when the contents of
   * `@uipath/du-classification-station-wc` are hosted from the app's own static
   * assets. Accepts a resolver (`() => string | Promise<string>`) for cases
   * where the URL isn't known synchronously — it's called lazily, at most once
   * per load.
   *
   * Defaults to `du-cs-wc` joined onto {@link getAppBase}, which resolves to
   * `/du-cs-wc` for a plain host and to the deployed app's own base path for a
   * UiPath Coded App. Pass an explicit `deploymentUrl` only when the web
   * component is hosted somewhere that default doesn't reach.
   *
   * Treat this as trusted application configuration: the loader injects
   * `<script type="module" src>` from it, so whoever controls this URL executes
   * script in your app's origin. Pass a literal, a build-time value, or a
   * resolver derived from one of those — never one derived from `location`, a
   * query parameter, or any other user input.
   */
  deploymentUrl?: string | ResolveBaseUrl;
}

let loadPromise: Promise<void> | null = null;
let loadFailed = false;
let warnedUnconfigured = false;

/**
 * Loads the Classification Station web component from `deploymentUrl` (or its
 * default — see {@link ClassificationStationWcConfig.deploymentUrl}) and
 * registers its custom elements. Call this once at app startup, before
 * rendering `ClassificationStation`. Every argument is optional.
 *
 * Loading is per-page and idempotent: while a load is pending or has succeeded,
 * repeat calls return that same promise without re-injecting scripts, so a
 * later call with a different `deploymentUrl` has no effect. Calling it again
 * *after* a failure starts a fresh attempt.
 *
 * The returned promise is the error channel for load failures (a bad URL, a
 * 404, an offline network). The rejection is retained, so components waiting
 * via {@link waitForWcElementReady} observe the same error rather than waiting
 * forever.
 */
export function configureClassificationStationWc(
  config: ClassificationStationWcConfig = {},
): Promise<void> {
  if (loadPromise && !loadFailed) return loadPromise;

  const {
    deploymentUrl = joinDeploymentUrl(getAppBase(), csAppName),
    ...options
  } = config;

  loadFailed = false;
  loadPromise = loadWebComponent(
    csAppName,
    document,
    deploymentUrl,
    options,
  ).catch((error: unknown) => {
    // Flag rather than clear: `waitForWcElementReady` must still see this
    // rejection, while a later configure call is free to start a new attempt.
    loadFailed = true;
    throw error;
  });
  return loadPromise;
}

/** The standalone Classification Station element — it makes no HTTP calls. */
export const CLASSIFICATION_STATION_TAG =
  "ui-du-classification-station-standalone-wc-element";

/** Maps a base element tag to its persistent (`forceDestroy()`-capable) variant. */
export function convertToPersistentTag(tag: string): string {
  return tag.replace(/-element$/, "-persistent-element");
}

/**
 * Resolves once `tag` has been registered in the browser's custom-element
 * registry — i.e. after {@link configureClassificationStationWc}'s scripts
 * have run.
 *
 * The loader resolves on the bundle's `load` event, which is before Angular
 * Elements has defined the elements, so both waits are needed.
 */
export async function waitForWcElementReady(tag: string): Promise<void> {
  // No custom-element registry during SSR — resolve to a no-op so this never
  // touches `window` on the server. Reached through `useWcReady` during React
  // rendering, so the framework decides when it runs.
  if (typeof window === "undefined") return;

  if (loadPromise) {
    await loadPromise;
  } else if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    // Not fatal: the host page may have loaded the same bundle by other means
    // (the loader caches on `window`). Fall through to `whenDefined` so that
    // case still works.
    console.error(
      "[classification-station] configureClassificationStationWc({ deploymentUrl }) has not " +
        "been called. Waiting in case the host page loaded the web component another way.",
    );
  }

  await window.customElements.whenDefined(tag);
}
