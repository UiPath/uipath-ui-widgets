import { configureValidationStationWc } from "@uipath/ui-widgets-validation-station";

/**
 * Loads the Validation Station web component the first time a page that
 * renders it actually mounts, rather than eagerly at app startup — most
 * widgets in this sample app never touch DU, so there's no reason to fetch
 * the WC bundle for them. Safe to call from every such page's mount effect:
 * `configureValidationStationWc` itself is idempotent and caches its promise.
 */
export function loadValidationStationWcOnDemand(): void {
  configureValidationStationWc({
    deploymentUrl: "/du-vs-wc",
    // This app ships only Roboto (via @fontsource), not Apollo fonts or
    // Material Icons — without these, icon glyphs in the component render as
    // empty boxes.
    includeFonts: true,
  }).catch((error: unknown) => {
    console.error(
      "Failed to load the Validation Station web component:",
      error,
    );
  });
}
