import { useEffect, useState } from "react";
import { waitForWcElementReady } from "./loadValidationStationWc.js";

/**
 * Returns `true` once the custom element for `tag` has been defined by the
 * browser's element registry. All standalone DU elements come from the same
 * bundle loaded by `configureValidationStationWc`, so this waits for that load
 * and then for the requested tag to upgrade.
 *
 * Stays `false` if the bundle fails to load — the load error itself surfaces on
 * the promise returned by `configureValidationStationWc`, which is where the
 * host app should handle it.
 */
export function useWcReady(tag: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    waitForWcElementReady(tag).then(
      () => {
        if (!cancelled) setReady(true);
      },
      (error: unknown) => {
        // Logged, not thrown: a rejection here would surface as an unhandled
        // promise rejection from inside an effect.
        console.error(
          `[validation-station] web component failed to load; <${tag}> will not render.`,
          error,
        );
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tag]);

  return ready;
}
