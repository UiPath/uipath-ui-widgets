import {
  useCallback,
  useLayoutEffect,
  useRef,
  version,
  type ElementType,
  type ReactElement,
} from "react";
import type { WcElement, WcRefCallback } from "./bindWcEvents.js";

/**
 * React 19 assigns a custom element's props as element properties; React 18
 * assigns them as attributes, which turns every object input (`dom`,
 * `options`, the references) into the string `"[object Object]"`.
 */
const REACT_SETS_PROPERTIES = Number.parseInt(version, 10) >= 19;

/**
 * Props that stay on the rendered tag under every React version: `className`,
 * `style`, and dashed names, which are attributes by design (`instance-id`).
 * React 18 maps `style` on custom elements but not `className`, which it
 * would write as a `classname` attribute, so it is passed as `class` there.
 */
function isAttributeProp(key: string): boolean {
  return key === "className" || key === "style" || key.includes("-");
}

/**
 * The inputs last assigned to each element, keyed by the element itself, so a
 * ref that detaches and re-attaches to the same element (a new `elementRef`)
 * does not re-assign unchanged inputs.
 */
const assignedInputs = new WeakMap<Element, Record<string, unknown>>();

export interface WcHostProps {
  tag: string;
  props: Record<string, unknown>;
  elementRef: WcRefCallback;
}

/**
 * Renders a custom element so that its inputs arrive as properties on React
 * 18 and 19.
 *
 * On React 19 every prop goes on the tag, and React assigns it as a property
 * before the element connects. On React 18 only the attribute props go on the
 * tag; the rest are assigned as properties in a layout effect, in the order of
 * `props`' keys, after the element connects and before the browser paints.
 * Only values that changed since the last commit are assigned, and a prop the
 * host stops passing goes back to `undefined`, as React 19 does.
 */
export function WcHost({ tag, props, elementRef }: WcHostProps): ReactElement {
  const elementState = useRef<WcElement | null>(null);

  const ref = useCallback(
    (el: WcElement | null) => {
      elementState.current = el;
      elementRef(el);
    },
    [elementRef],
  );

  useLayoutEffect(() => {
    if (REACT_SETS_PROPERTIES) return;
    const el = elementState.current;
    if (!el) return;
    let assigned = assignedInputs.get(el);
    if (!assigned) {
      assigned = {};
      assignedInputs.set(el, assigned);
    }
    const target = el as unknown as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      if (isAttributeProp(key) || assigned[key] === value) continue;
      target[key] = value;
      assigned[key] = value;
    }
    for (const key of Object.keys(assigned)) {
      if (!(key in props)) {
        target[key] = undefined;
        delete assigned[key];
      }
    }
  });

  // The tag is a custom element name, which JSX cannot type statically.
  const Tag = tag as unknown as ElementType;
  if (REACT_SETS_PROPERTIES) return <Tag {...props} ref={ref} />;
  const attributes = Object.fromEntries(
    Object.entries(props)
      .filter(([key]) => isAttributeProp(key))
      .map(([key, value]) => [key === "className" ? "class" : key, value]),
  );
  return <Tag {...attributes} ref={ref} />;
}
