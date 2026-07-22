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
  // State is stamped with the tag it describes, so a tag change is detected in
  // render (below) rather than via a synchronous reset in the effect.
  const [state, setState] = useState<WcReadyState & { tag: string }>({
    tag,
    ready: false,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    waitForWcElementReady(tag).then(
      () => {
        if (!cancelled) setState({ tag, ready: true, error: null });
      },
      (e: unknown) => {
        if (!cancelled) {
          setState({
            tag,
            ready: false,
            error: e instanceof Error ? e.message : String(e),
          });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [tag]);

  // If `tag` changed since the last settled result, that result is stale — report
  // pending until the new tag's load settles, so we never show the old readiness.
  if (state.tag !== tag) {
    return { ready: false, error: null };
  }
  return { ready: state.ready, error: state.error };
}
