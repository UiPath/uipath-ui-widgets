import { useCallback, useEffect, useRef } from "react";

/** A web-component element that may expose the persistent-variant teardown. */
export type WcElement = HTMLElement & { forceDestroy?: () => void };

/** React ref-callback shape for a standalone DU element. */
export type WcRefCallback = (el: WcElement | null) => void;

type WcHandlers<EventMap> = {
  [K in keyof EventMap]?: (detail: EventMap[K]) => void;
};

/**
 * Attaches one `CustomEvent` listener per handler key. Each listener dispatches
 * to the **latest** handler via `getHandlers()`, so changing handler identities
 * between renders never requires re-binding. Returns a cleanup that removes them.
 *
 * The key set is captured once at attach time — callers pass a stable-shape map
 * (all event keys present, values possibly `undefined`), so this covers every
 * event; an entry that is `undefined` at dispatch time is simply a no-op.
 */
function bindWcEvents<EventMap>(
  el: HTMLElement,
  getHandlers: () => WcHandlers<EventMap>,
): () => void {
  const cleanups: Array<() => void> = [];

  for (const type of Object.keys(getHandlers())) {
    const listener: EventListener = (event) => {
      const handler = (
        getHandlers() as Record<string, ((detail: unknown) => void) | undefined>
      )[type];
      if (typeof handler === "function") {
        handler((event as CustomEvent<unknown>).detail);
      }
    };
    el.addEventListener(type, listener);
    cleanups.push(() => el.removeEventListener(type, listener));
  }

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

/**
 * Returns a **stable** React `ref` callback for a standalone DU element. It binds
 * the event handlers once on attach (dispatching to the latest handler set on
 * every event, so changing handler identities between renders does not re-bind)
 * and, on detach, removes them and — when `persistent` — calls `forceDestroy()`
 * to tear down the inner Angular component.
 *
 * Detach is handled on the `null` call rather than through a returned cleanup:
 * React 18 ignores a ref callback's return value, and React 19 still calls a
 * ref callback with `null` when it returns nothing, so this works on both.
 *
 * The callback identity changes only when `persistent` changes, so React does
 * not detach/re-attach — and never force-destroys a persistent element — on an
 * ordinary re-render. (A fresh callback each render, as a plain factory would
 * produce, would rebind every listener and destroy persistent elements on every
 * parent state change.)
 */
export function useWcRef<EventMap>(
  handlers: WcHandlers<EventMap>,
  persistent = false,
): WcRefCallback {
  const handlersRef = useRef(handlers);
  // Keep the latest handlers reachable to the bound listeners without changing
  // the ref-callback identity (updated post-commit, before any event fires).
  useEffect(() => {
    handlersRef.current = handlers;
  });

  // The teardown for the element currently attached, run on the next call.
  const detachRef = useRef<(() => void) | null>(null);

  return useCallback<WcRefCallback>(
    (el) => {
      detachRef.current?.();
      detachRef.current = null;
      if (!el) return;
      const unbind = bindWcEvents<EventMap>(el, () => handlersRef.current);
      detachRef.current = () => {
        unbind();
        if (persistent) el.forceDestroy?.();
      };
    },
    [persistent],
  );
}
