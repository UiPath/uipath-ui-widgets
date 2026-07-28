import { useEffect, useState } from "react";
import { waitForWcElementReady } from "./loadValidationStationWc.js";

/**
 * Returns `true` once the custom element for `tag` has been defined by the
 * browser's element registry. All standalone DU elements are registered by the
 * same `main` import (side-effect of importing `loadValidationStationWc`), so
 * this only waits for the requested tag to upgrade.
 */
export function useWcReady(tag: string): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    waitForWcElementReady(tag).then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [tag]);

  return ready;
}
