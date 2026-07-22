/**
 * Default URL path the DU Validation Station web-component bundle is served
 * under. Shared by the two ends that must agree, so the served path and the
 * loaded path can't drift:
 *   - the `validationStationAssets()` Vite plugin (`basePath` default),
 *   - the widget's runtime loader (`configureValidationStationWc({ baseUrl })` default).
 *
 * The `uipath-vs-wc copy-assets` CLI defaults to `public/du-vs-wc`, which most
 * frameworks serve at this same path.
 */
export const DU_VS_WC_BASE = "/du-vs-wc/";
