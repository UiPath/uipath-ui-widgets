import { useEffect, useState } from "react";
import { waitForWcElementReady } from "./loadValidationStationWc.js";

export interface WcReadyState {
  /** `true` once the custom element for `tag` has upgraded. */
  ready: boolean;
  /**
   * Message if the WC bundle failed to load; `null` while pending or on success.
   * Surfaced so callers can render the failure instead of spinning forever.
   */
  error: string | null;
}

/**
 * Tracks readiness of the standalone DU element `tag`. Triggers the (idempotent)
 * runtime WC-bundle load via {@link waitForWcElementReady} and flips `ready` once
 * the requested tag is defined in the browser's element registry. If the bundle
 * fails to load, `error` holds the reason so the caller can show it.
 */
export function useWcReady(tag: string): WcReadyState {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    waitForWcElementReady(tag).then(
      () => {
        if (!cancelled) setReady(true);
      },
      (e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tag]);

  return { ready, error };
}
