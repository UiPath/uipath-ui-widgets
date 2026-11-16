import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CLASSIFICATION_STATION_TAG,
  convertToPersistentTag,
} from "../loadClassificationStationWc";

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
  csAppName: "du-cs-wc",
}));

const mockGetAppBase = vi.fn<() => string>();

vi.mock("@uipath/uipath-typescript", () => ({
  getAppBase: () => mockGetAppBase(),
}));

/** The module caches its load promise, so each test takes a fresh instance. */
async function freshModule() {
  vi.resetModules();
  return import("../loadClassificationStationWc");
}

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadWc.mockResolvedValue(undefined);
  mockGetAppBase.mockReturnValue("/");
});

describe("configureClassificationStationWc", () => {
  it("loads the CS bundle from du-cs-wc next to the app base by default", async () => {
    const { configureClassificationStationWc } = await freshModule();
    await configureClassificationStationWc();
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-cs-wc",
      document,
      "/du-cs-wc",
      {},
    );
  });

  it("joins the default onto a Coded App base path", async () => {
    mockGetAppBase.mockReturnValue("/org/apps/my-app/");
    const { configureClassificationStationWc } = await freshModule();
    await configureClassificationStationWc();
    expect(mockLoadWc.mock.calls[0][2]).toBe("/org/apps/my-app/du-cs-wc");
  });

  it("passes an explicit deploymentUrl and the loader options through", async () => {
    const { configureClassificationStationWc } = await freshModule();
    await configureClassificationStationWc({
      deploymentUrl: "https://cdn.example/cs",
      includeFonts: true,
    });
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-cs-wc",
      document,
      "https://cdn.example/cs",
      { includeFonts: true },
    );
  });

  it("loads once while a load is pending or has succeeded", async () => {
    const { configureClassificationStationWc } = await freshModule();
    const first = configureClassificationStationWc();
    const second = configureClassificationStationWc({ deploymentUrl: "/x" });
    expect(second).toBe(first);
    await first;
    expect(mockLoadWc).toHaveBeenCalledTimes(1);
  });

  it("retries after a failed load, and waiters see the failure", async () => {
    mockLoadWc.mockRejectedValueOnce(new Error("404"));
    const { configureClassificationStationWc, waitForWcElementReady } =
      await freshModule();
    await expect(configureClassificationStationWc()).rejects.toThrow("404");
    await expect(
      waitForWcElementReady(CLASSIFICATION_STATION_TAG),
    ).rejects.toThrow("404");

    await configureClassificationStationWc();
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
    expect(convertToPersistentTag(CLASSIFICATION_STATION_TAG)).toBe(
      "ui-du-classification-station-standalone-wc-persistent-element",
    );
  });
});
