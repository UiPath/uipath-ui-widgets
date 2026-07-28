import { createElement, type CSSProperties, type ReactElement } from "react";
import type { WcRefCallback } from "../bindWcEvents.js";
import type { BucketArtifacts } from "../types.js";

/**
 * Renders a standalone DU custom element by tag name with the given (typed)
 * JSX props and ref callback.
 *
 * Rendering by string tag (rather than a computed JSX component) keeps the
 * element out of React's component identity, so its inner Angular component is
 * not torn down and recreated on every parent render. `Props` is the web
 * component's JSX prop interface, so the caller's props object is fully
 * type-checked at construction.
 */
export function renderWcElement<Props extends object>(
  tag: string,
  props: Props,
  ref: WcRefCallback,
): ReactElement {
  return createElement(tag, { ...props, ref });
}

/**
 * Bridges React's `CSSProperties` to the `string | Record<string, string |
 * number>` shape the DU element JSX props declare for `style`. Safe: the two
 * shapes are structurally compatible at runtime (both plain string/number maps
 * keyed by CSS property); the cast only silences the nominal type difference.
 */
export function wcStyle(
  style?: CSSProperties,
): Record<string, string | number> | undefined {
  return style as unknown as Record<string, string | number> | undefined;
}

/**
 * Resolves the shared loading/error gate for a subcomponent wrapper. Returns a
 * discriminated result so the caller narrows `artifacts` to non-null without a
 * `!` assertion: render `fallback` when not ready, otherwise use `artifacts`.
 */
export type ArtifactsGate =
  | { ready: true; artifacts: BucketArtifacts }
  | { ready: false; fallback: ReactElement };

export function resolveArtifacts(
  error: string | null,
  wcReady: boolean,
  artifacts: BucketArtifacts | null,
): ArtifactsGate {
  if (error) {
    return {
      ready: false,
      fallback: createElement(
        "div",
        null,
        `Failed to load document artifacts: ${error}`,
      ),
    };
  }
  if (!artifacts || !wcReady) {
    return { ready: false, fallback: createElement("div", null, "Loading...") };
  }
  return { ready: true, artifacts };
}
