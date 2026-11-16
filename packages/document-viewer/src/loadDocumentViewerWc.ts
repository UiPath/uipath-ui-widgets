import {
  loadWebComponent,
  type LoadWebComponentOptions,
  type ResolveBaseUrl,
} from "@uipath/du-utils";
import { getAppBase } from "@uipath/uipath-typescript";
import { joinDeploymentUrl } from "./urlUtil.js";

/**
 * The name the document viewer bundle registers itself under — its theme and
 * assets are keyed on it. `@uipath/du-utils` `1.0.0-rc.3` exports the
 * Validation and Classification Station names only, so it is spelled out here.
 */
export const DOCUMENT_VIEWER_APP_NAME = "du-dv-wc";

/**
 * Configuration for {@link configureDocumentViewerWc} — the deployment URL
 * plus every option the underlying loader accepts (currently `includeFonts`:
 * inject the web component's `fonts.css`, which carries Material Icons, as a
 * light-DOM stylesheet — needed unless the host already loads them).
 */
export interface DocumentViewerWcConfig extends LoadWebComponentOptions {
  /**
   * Base URL the web component's build artifacts (`polyfills.js`, `main.js`,
   * `styles.css`, `fonts.css`, plus `du-assets/` and `media/`) are served from
   * — e.g. `/du-dv-wc` when the contents of `@uipath/du-document-viewer-wc`
   * are hosted from the app's own static assets. Accepts a resolver
   * (`() => string | Promise<string>`), called lazily, at most once per load.
   *
   * Defaults to `du-dv-wc` joined onto {@link getAppBase}, which resolves to
   * `/du-dv-wc` for a plain host and to the deployed app's own base path for a
   * UiPath Coded App.
   *
   * Treat this as trusted application configuration: the loader injects
   * `<script type="module" src>` from it, so whoever controls this URL executes
   * script in your app's origin. Never derive it from `location`, a query
   * parameter, or any other user input.
   */
  deploymentUrl?: string | ResolveBaseUrl;
}

let loadPromise: Promise<void> | null = null;
let loadFailed = false;
let warnedUnconfigured = false;

/**
 * Loads the document viewer web component from `deploymentUrl` (or its
 * default — see {@link DocumentViewerWcConfig.deploymentUrl}) and registers its
 * custom elements. Call this once at app startup, before rendering
 * `DocumentViewer`. Every argument is optional.
 *
 * Loading is per-page and idempotent: while a load is pending or has
 * succeeded, repeat calls return that same promise, so a later call with a
 * different `deploymentUrl` has no effect. Calling it again *after* a failure
 * starts a fresh attempt. The returned promise is the error channel for load
 * failures.
 */
export function configureDocumentViewerWc(
  config: DocumentViewerWcConfig = {},
): Promise<void> {
  if (loadPromise && !loadFailed) return loadPromise;

  const {
    deploymentUrl = joinDeploymentUrl(getAppBase(), DOCUMENT_VIEWER_APP_NAME),
    ...options
  } = config;

  loadFailed = false;
  loadPromise = loadWebComponent(
    DOCUMENT_VIEWER_APP_NAME,
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

/** The document viewer element. */
export const DOCUMENT_VIEWER_TAG = "ui-du-document-viewer-wc-element";

/** Maps a base element tag to its persistent (`forceDestroy()`-capable) variant. */
export function convertToPersistentTag(tag: string): string {
  return tag.replace(/-element$/, "-persistent-element");
}

/**
 * Resolves once `tag` has been registered in the browser's custom-element
 * registry — i.e. after {@link configureDocumentViewerWc}'s scripts have run.
 * The loader resolves on the bundle's `load` event, before Angular Elements
 * defines the elements, so both waits are needed.
 */
export async function waitForWcElementReady(tag: string): Promise<void> {
  // No custom-element registry during SSR.
  if (typeof window === "undefined") return;

  if (loadPromise) {
    await loadPromise;
  } else if (!warnedUnconfigured) {
    warnedUnconfigured = true;
    // Not fatal: the host page may have loaded the bundle by other means.
    console.error(
      "[document-viewer] configureDocumentViewerWc({ deploymentUrl }) has not " +
        "been called. Waiting in case the host page loaded the web component another way.",
    );
  }

  await window.customElements.whenDefined(tag);
}
