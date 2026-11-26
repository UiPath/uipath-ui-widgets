import { createElement, type CSSProperties, type ReactElement } from "react";
import type { WcRefCallback } from "./bindWcEvents.js";
import { WcHost } from "./WcHost.js";

/**
 * Renders a custom element by tag name with the given (typed) JSX props and
 * ref callback, on React 18 or 19 (see {@link WcHost}).
 *
 * Rendering by string tag (rather than a computed JSX component) keeps the
 * element out of React's component identity, so its inner Angular component is
 * not torn down and recreated on every parent render. `WcHost` is a single
 * module-level component, so it does not change that.
 *
 * Unset (`undefined`) props are left out rather than assigned, so an input the
 * host did not pass keeps the element's own default (`enableTokenFeatures`
 * defaults to `true`, for one). `null` is kept: it is a value.
 */
export function renderWcElement<Props extends object>(
  tag: string,
  props: Props,
  ref: WcRefCallback,
): ReactElement {
  const defined = Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  );
  return createElement(WcHost, { tag, props: defined, elementRef: ref });
}

/**
 * Bridges React's `CSSProperties` to the `string | Record<string, string |
 * number>` shape the element JSX props declare for `style`. The two are
 * structurally the same plain map at runtime; the cast only silences the
 * nominal difference.
 */
export function wcStyle(
  style?: CSSProperties,
): Record<string, string | number> | undefined {
  return style as unknown as Record<string, string | number> | undefined;
}

/** What to render while the artifacts or the element are not ready. */
export function loadingFallback(error: string | null): ReactElement {
  return error
    ? createElement("div", null, `Failed to load document artifacts: ${error}`)
    : createElement("div", null, "Loading...");
}
