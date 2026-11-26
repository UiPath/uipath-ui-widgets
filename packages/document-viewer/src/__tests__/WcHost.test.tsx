/* eslint-disable @typescript-eslint/no-explicit-any */
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Take WcHost's React 18 path on the workspace's React 19: it branches on
// React's `version`, read once at import. `npm run test:react18` runs the same
// path on a real React 18.
vi.mock("react", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react")>()),
  version: "18.3.1",
}));

const { WcHost } = await import("../WcHost");

const TAG = "wc-host-test-element";
const OTHER_TAG = "wc-host-test-other-element";

class Recorder extends HTMLElement {
  assigned: Array<[string, unknown]> = [];
}
for (const key of ["dom", "options", "documentId", "theme"]) {
  Object.defineProperty(Recorder.prototype, key, {
    get(this: any) {
      return this[`_${key}`];
    },
    set(this: any, value: unknown) {
      this.assigned.push([key, value]);
      this[`_${key}`] = value;
    },
  });
}
for (const tag of [TAG, OTHER_TAG]) {
  if (!customElements.get(tag))
    customElements.define(tag, class extends Recorder {});
}

const host = (
  tag: string,
  props: Record<string, unknown>,
  elementRef = vi.fn(),
) => <WcHost tag={tag} props={props} elementRef={elementRef} />;

describe("WcHost on React 18", () => {
  it("assigns inputs as properties in key order, keeping className, style and dashed names on the tag", () => {
    const dom = { Pages: [] };
    const { container } = render(
      host(TAG, {
        className: "c",
        style: { height: "10px" },
        "instance-id": "i1",
        dom,
        theme: "dark",
        documentId: "d1",
      }),
    );
    const el = container.querySelector(TAG) as Recorder;

    expect(el.assigned).toEqual([
      ["dom", dom],
      ["theme", "dark"],
      ["documentId", "d1"],
    ]);
    expect(el.getAttribute("class")).toBe("c");
    expect(el.style.height).toBe("10px");
    expect(el.getAttribute("instance-id")).toBe("i1");
    expect(el.hasAttribute("dom")).toBe(false);
  });

  it("re-assigns only changed inputs, and resets a removed one to undefined", () => {
    const dom = { Pages: [] };
    const { container, rerender } = render(host(TAG, { dom, theme: "dark" }));
    const el = container.querySelector(TAG) as Recorder;
    el.assigned = [];

    const options = { a: 1 };
    rerender(host(TAG, { dom, options }));

    expect(el.assigned).toEqual([
      ["options", options],
      ["theme", undefined],
    ]);
  });

  it("assigns every input afresh to a new element when the tag changes", () => {
    const dom = { Pages: [] };
    const { container, rerender } = render(host(TAG, { dom }));
    rerender(host(OTHER_TAG, { dom }));
    const el = container.querySelector(OTHER_TAG) as Recorder;

    expect(el.assigned).toEqual([["dom", dom]]);
  });

  it("hands the element, then null on unmount, to the element ref", () => {
    const elementRef = vi.fn();
    const { container, unmount } = render(host(TAG, {}, elementRef));
    const el = container.querySelector(TAG);

    expect(elementRef).toHaveBeenLastCalledWith(el);
    unmount();
    expect(elementRef).toHaveBeenLastCalledWith(null);
  });
});
