/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DocumentViewer } from "../DocumentViewer";

const TAG = "ui-du-document-viewer-wc-element";
const PERSISTENT_TAG = "ui-du-document-viewer-wc-persistent-element";

const mockWcReady = vi.fn<(tag: string) => boolean>(() => true);
vi.mock("../useWcReady", () => ({
  useWcReady: (tag: string) => mockWcReady(tag),
}));

const mockUseResolvedArtifacts = vi.fn();
vi.mock("../useResolvedArtifacts", () => ({
  useResolvedArtifacts: (...args: any[]) => mockUseResolvedArtifacts(...args),
}));

// The element's inputs. The stub records each assignment, as an upgraded
// element would take it: as a property.
const INPUTS = [
  "theme",
  "language",
  "options",
  "dom",
  "document",
  "text",
  "highlightReference",
  "passiveReferences",
  "outlineReference",
  "goToPage",
];

class StubElement extends HTMLElement {
  assigned: string[] = [];
  values: Record<string, unknown> = {};
}
for (const key of INPUTS) {
  Object.defineProperty(StubElement.prototype, key, {
    get(this: StubElement) {
      return this.values[key];
    },
    set(this: StubElement, value: unknown) {
      this.assigned.push(key);
      this.values[key] = value;
    },
  });
}
for (const tag of [TAG, PERSISTENT_TAG]) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends StubElement {});
  }
}

const artifacts = {
  dom: { Pages: [] } as any,
  original: "data:application/pdf;base64,AAA",
  text: "hello",
};
const reference = { TextStartIndex: 0, TextLength: 5, Tokens: [] } as any;

beforeEach(() => {
  vi.clearAllMocks();
  mockWcReady.mockReturnValue(true);
  mockUseResolvedArtifacts.mockReturnValue({ artifacts, error: null });
});

const element = (container: HTMLElement) =>
  (container.querySelector(TAG) ??
    container.querySelector(PERSISTENT_TAG)) as any;

function dispatch(el: HTMLElement, type: string, detail?: unknown) {
  act(() => {
    el.dispatchEvent(new CustomEvent(type, { detail }));
  });
}

describe("DocumentViewer", () => {
  it("hands the element the document, the original as `document`, and defaults", () => {
    const { container } = render(<DocumentViewer artifacts={artifacts} />);
    const el = element(container);
    expect(el.dom).toBe(artifacts.dom);
    expect(el.document).toBe(artifacts.original);
    expect(el.text).toBe("hello");
    expect(el.theme).toBe("light");
    expect(el.language).toBe("en");
  });

  it("forwards the options and the reference commands", () => {
    const options = { disableSelection: true };
    const goToPage = { target: 2 };
    const { container } = render(
      <DocumentViewer
        artifacts={artifacts}
        theme="future-light"
        options={options}
        highlightReference={reference}
        passiveReferences={[reference]}
        outlineReference={null}
        goToPage={goToPage}
      />,
    );
    const el = element(container);
    expect(el.theme).toBe("future-light");
    expect(el.options).toBe(options);
    expect(el.highlightReference).toBe(reference);
    expect(el.passiveReferences).toEqual([reference]);
    expect(el.goToPage).toBe(goToPage);
    // `null` clears the outline, so it is assigned rather than dropped.
    expect(el.assigned).toContain("outlineReference");
    expect(el.outlineReference).toBeNull();
  });

  it("leaves unset inputs unassigned", () => {
    const { container } = render(<DocumentViewer artifacts={artifacts} />);
    const el = element(container);
    expect(el.assigned).not.toContain("highlightReference");
    expect(el.assigned).not.toContain("goToPage");
    expect(el.assigned).not.toContain("options");
  });

  it("updates the highlight without remounting the element", () => {
    const { container, rerender } = render(
      <DocumentViewer artifacts={artifacts} highlightReference={null} />,
    );
    const el = element(container);
    rerender(
      <DocumentViewer artifacts={artifacts} highlightReference={reference} />,
    );
    expect(element(container)).toBe(el);
    expect(el.highlightReference).toBe(reference);
  });

  it("renders the persistent variant and force-destroys it on unmount", () => {
    const { container, unmount } = render(
      <DocumentViewer artifacts={artifacts} persistent />,
    );
    const el = element(container);
    expect(el.tagName.toLowerCase()).toBe(PERSISTENT_TAG);
    expect(mockWcReady).toHaveBeenCalledWith(PERSISTENT_TAG);
    el.forceDestroy = vi.fn();
    unmount();
    expect(el.forceDestroy).toHaveBeenCalledTimes(1);
  });

  it("shows the loading state until the element is defined", () => {
    mockWcReady.mockReturnValue(false);
    const { container } = render(<DocumentViewer artifacts={artifacts} />);
    expect(element(container)).toBeNull();
    expect(container.textContent).toBe("Loading...");
  });

  it("shows the fetch error", () => {
    mockUseResolvedArtifacts.mockReturnValue({
      artifacts: null,
      error: "boom",
    });
    const { container } = render(<DocumentViewer artifacts={artifacts} />);
    expect(container.textContent).toBe(
      "Failed to load document artifacts: boom",
    );
  });

  it.each([
    ["ready", "onReady", true],
    ["pageCountChange", "onPageCountChange", 4],
    ["currentPageChange", "onCurrentPageChange", 2],
    ["textModeChange", "onTextModeChange", true],
    ["goToPageResult", "onGoToPageResult", { success: true, pageNumber: 2 }],
    ["referenceSelect", "onReferenceSelect", { text: "Total", reference }],
    ["switchPanelSides", "onSwitchPanelSides", undefined],
  ])("reports %s through %s", (event, prop, detail) => {
    const handler = vi.fn();
    const { container } = render(
      <DocumentViewer artifacts={artifacts} {...{ [prop]: handler }} />,
    );
    dispatch(element(container), event, detail);
    // A CustomEvent without a detail carries null.
    expect(handler).toHaveBeenCalledWith(detail ?? null);
  });
});
