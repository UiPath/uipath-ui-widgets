import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DOCUMENT_VIEWER_TAG,
  convertToPersistentTag,
} from "../loadDocumentViewerWc";

const mockLoadWc =
  vi.fn<
    (
      appName: string,
      doc: Document,
      url: string | (() => string | Promise<string>),
      options?: { includeFonts?: boolean },
    ) => Promise<void>
  >();

vi.mock("@uipath/du-utils", () => ({
  loadWebComponent: (...args: Parameters<typeof mockLoadWc>) =>
    mockLoadWc(...args),
}));

const mockGetAppBase = vi.fn<() => string>();

vi.mock("@uipath/uipath-typescript", () => ({
  getAppBase: () => mockGetAppBase(),
}));

/** The module caches its load promise, so each test takes a fresh instance. */
async function freshModule() {
  vi.resetModules();
  return import("../loadDocumentViewerWc");
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadWc.mockResolvedValue(undefined);
  mockGetAppBase.mockReturnValue("/");
});

describe("configureDocumentViewerWc", () => {
  it("loads the document viewer bundle from du-dv-wc next to the app base by default", async () => {
    const { configureDocumentViewerWc } = await freshModule();
    await configureDocumentViewerWc();
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-dv-wc",
      document,
      "/du-dv-wc",
      {},
    );
  });

  it("joins the default onto a Coded App base path", async () => {
    mockGetAppBase.mockReturnValue("/org/apps/my-app/");
    const { configureDocumentViewerWc } = await freshModule();
    await configureDocumentViewerWc();
    expect(mockLoadWc.mock.calls[0][2]).toBe("/org/apps/my-app/du-dv-wc");
  });

  it("passes an explicit deploymentUrl and the loader options through", async () => {
    const { configureDocumentViewerWc } = await freshModule();
    await configureDocumentViewerWc({
      deploymentUrl: "https://cdn.example/dv",
      includeFonts: true,
    });
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-dv-wc",
      document,
      "https://cdn.example/dv",
      { includeFonts: true },
    );
  });

  it("loads once while a load is pending or has succeeded", async () => {
    const { configureDocumentViewerWc } = await freshModule();
    const first = configureDocumentViewerWc();
    const second = configureDocumentViewerWc({ deploymentUrl: "/x" });
    expect(second).toBe(first);
    await first;
    expect(mockLoadWc).toHaveBeenCalledTimes(1);
  });

  it("retries after a failed load, and waiters see the failure", async () => {
    mockLoadWc.mockRejectedValueOnce(new Error("404"));
    const { configureDocumentViewerWc, waitForWcElementReady } =
      await freshModule();
    await expect(configureDocumentViewerWc()).rejects.toThrow("404");
    await expect(waitForWcElementReady(DOCUMENT_VIEWER_TAG)).rejects.toThrow(
      "404",
    );

    await configureDocumentViewerWc();
    expect(mockLoadWc).toHaveBeenCalledTimes(2);
  });
});

describe("waitForWcElementReady", () => {
  it("warns once when the loader was never configured, then waits for the tag", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const whenDefined = vi
      .spyOn(window.customElements, "whenDefined")
      .mockResolvedValue(class extends HTMLElement {});
    const { waitForWcElementReady } = await freshModule();

    await waitForWcElementReady("a-tag");
    await waitForWcElementReady("a-tag");

    expect(error).toHaveBeenCalledTimes(1);
    expect(whenDefined).toHaveBeenCalledWith("a-tag");
    error.mockRestore();
    whenDefined.mockRestore();
  });
});

describe("convertToPersistentTag", () => {
  it("maps the element to its persistent variant", () => {
    expect(convertToPersistentTag(DOCUMENT_VIEWER_TAG)).toBe(
      "ui-du-document-viewer-wc-persistent-element",
    );
  });
});
