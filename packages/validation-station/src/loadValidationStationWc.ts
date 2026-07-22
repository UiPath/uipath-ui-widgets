// ─────────────────────────────────────────────────────────────────────────────
// Loads the prebuilt DU Validation Station web component at runtime.
//
// `@uipath/du-validation-station-wc` is build output rather than a library:
// main.js + ~300 minified chunks + polyfills.js (zone.js) + styles.css +
// fonts.css + a sibling `du-assets/` folder that main.js locates at runtime via
// `new URL('./du-assets/', import.meta.url)`.
//
// Because of that shape, we load it through a RUNTIME-COMPUTED URL rather than a
// static/bare import. `new URL(file, base).href` isn't resolvable at build time,
// so the consumer's bundler leaves it alone — it stays a genuine runtime import
// of a native ES module served from its own URL, and main.js sees a real
// `import.meta.url`, so `du-assets/` resolves as its sibling. This keeps the WC
// out of the consumer's build graph and makes it a type-only dependency of this
// package (only `import type` references remain).
//
// The consumer serves the bundle; by default the widget loads it from
// `DU_VS_WC_BASE` (the same path the `validationStationAssets()` Vite plugin
// serves it under), so no configuration is needed for the common setup. Call
// `configureValidationStationWc({ baseUrl })` only to override that path.
// ─────────────────────────────────────────────────────────────────────────────

import { DU_VS_WC_BASE } from "./constants.js";

export const VALIDATION_STATION_TAG =
  "ui-du-validation-station-standalone-wc-element";

/**
 * Custom-element tag names for every standalone DU web component registered by
 * the bundle. Each has a `-persistent-element` sibling (see
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

// ─── Configuration ───────────────────────────────────────────────────────────

export interface ValidationStationWcConfig {
  /**
   * Where the WC bundle is served from, resolved against `document.baseURI`.
   * `main.js`, `polyfills.js`, `styles.css`, `fonts.css`, `du-assets/` and
   * `media/` must all sit directly under this path. Defaults to
   * {@link DU_VS_WC_BASE} — the path the `validationStationAssets()` Vite plugin
   * serves under — so you only need to set it to use a different path.
   */
  baseUrl?: string;
  /**
   * Inject `fonts.css` (Apollo fonts + Material Icons) as a light-DOM `<link>`.
   * `@font-face` is ignored inside the shadow root, so it must load at the
   * document level. Leave `true` unless the host page already provides them.
   */
  loadFonts?: boolean;
}

// Defaults to DU_VS_WC_BASE so the common setup (validationStationAssets() Vite
// plugin with its default path) needs no configuration at all.
let config: { baseUrl: string; loadFonts: boolean } = {
  baseUrl: DU_VS_WC_BASE,
  loadFonts: true,
};

/**
 * Override where the WC bundle is served from (defaults to {@link DU_VS_WC_BASE})
 * or opt out of font injection. Optional — call once, before the first
 * `<ValidationStation>` / subcomponent mounts, only if you serve the bundle
 * somewhere other than the `validationStationAssets()` Vite plugin's default path.
 */
export function configureValidationStationWc(
  next: ValidationStationWcConfig,
): void {
  config = { ...config, ...next };
}

// ─── Loader ──────────────────────────────────────────────────────────────────

// Module-level singleton: the bundle registers its custom elements as a global
// side effect, so it must run exactly once regardless of how many components ask.
let loadPromise: Promise<void> | undefined;

/**
 * Idempotently loads the WC bundle from the configured `baseUrl`. Safe to call
 * from every component mount — the first call wins, the rest await it.
 */
export function ensureValidationStationWcLoaded(): Promise<void> {
  // No DOM / custom-element registry off the main thread or during SSR.
  if (typeof window === "undefined") return Promise.resolve();
  if (loadPromise) return loadPromise;

  const base = new URL(config.baseUrl, document.baseURI);
  const url = (file: string): string => new URL(file, base).href;

  loadPromise = (async () => {
    // Stylesheets as light-DOM <link>s (must precede the element so first paint
    // is styled; @font-face only takes effect in the light DOM).
    injectStylesheetOnce(url("styles.css"), "du-vs-wc-styles");
    if (config.loadFonts) {
      injectStylesheetOnce(url("fonts.css"), "du-vs-wc-fonts");
    }

    // Runtime-computed URLs => opaque to static analysis => never bundled.
    // polyfills (zone.js) BEFORE main (Angular bootstrap needs Zone present).
    try {
      await import(
        /* @vite-ignore */ /* webpackIgnore: true */ url("polyfills.js")
      );
      await import(/* @vite-ignore */ /* webpackIgnore: true */ url("main.js"));
    } catch (cause) {
      // Attach `cause` as a property rather than via the Error options bag: the
      // package targets ES2020, whose Error type has no `cause` constructor arg.
      const error = new Error(
        `Validation Station: failed to load the WC bundle from "${base.href}". ` +
          "Make sure the bundle is served there — add the validationStationAssets() " +
          'Vite plugin (or run "uipath-vs-wc copy-assets"), and if you serve it under ' +
          "a different path, pass a matching baseUrl to configureValidationStationWc().",
      );
      (error as Error & { cause?: unknown }).cause = cause;
      throw error;
    }

    // zone.js (loaded above) replaces Promise with ZoneAwarePromise which lacks
    // Promise.try(); the WC calls it at render time. Restore it now that zone is
    // present. Remove when the WC upgrades zone.js.
    if (typeof Promise.try !== "function") {
      Promise.try = <T, U extends unknown[]>(
        fn: (...args: U) => T | PromiseLike<T>,
        ...args: U
      ) =>
        new Promise<T>((resolve) => resolve(fn(...args))) as Promise<
          Awaited<T>
        >;
    }
  })();

  return loadPromise;
}

/**
 * Resolves once the WC bundle is loaded and the custom element for `tag` has
 * upgraded. This is the single entry point every component gates on, so calling
 * it also triggers the (idempotent) load.
 */
export async function waitForWcElementReady(tag: string): Promise<void> {
  if (typeof window === "undefined") return;
  await ensureValidationStationWcLoaded();
  await window.customElements.whenDefined(tag);
}

function injectStylesheetOnce(href: string, id: string): void {
  if (document.getElementById(id)) {
    return;
  }
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
