import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
// Pure constants and a pure function — unaffected by the module-scope load cache
// the other tests reset, so they are read from a single static import.
import {
  convertToPersistentTag,
  DU_WC_TAGS,
  VALIDATION_STATION_TAG,
} from "../loadValidationStationWc";

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
  vsAppName: "du-vs-wc",
}));

const mockGetAppBase = vi.fn<() => string>();

vi.mock("@uipath/uipath-typescript", () => ({
  getAppBase: () => mockGetAppBase(),
}));

type Mod = typeof import("../loadValidationStationWc");

/**
 * The module caches its load promise in module scope, so every test needs a
 * fresh instance to exercise the first-call path.
 */
async function freshModule(): Promise<Mod> {
  vi.resetModules();
  return import("../loadValidationStationWc");
}

const originalPromiseTry = Promise.try;

beforeEach(() => {
  vi.clearAllMocks();
  mockLoadWc.mockResolvedValue(undefined);
  // No `uipath:app-base` meta tag in this environment — matches a plain host.
  mockGetAppBase.mockReturnValue("/");
});

afterEach(() => {
  vi.restoreAllMocks();
  if (originalPromiseTry) Promise.try = originalPromiseTry;
  else Reflect.deleteProperty(Promise, "try");
});

describe("configureValidationStationWc", () => {
  it("loads the web component from the configured deployment URL", async () => {
    const mod = await freshModule();

    await mod.configureValidationStationWc({
      deploymentUrl: "/du-vs-wc",
      includeFonts: true,
    });

    expect(mockLoadWc).toHaveBeenCalledTimes(1);
    expect(mockLoadWc).toHaveBeenCalledWith("du-vs-wc", document, "/du-vs-wc", {
      includeFonts: true,
    });
  });

  it("forwards no options when only a deployment URL is given", async () => {
    const mod = await freshModule();

    await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });

    // deploymentUrl is consumed here, not passed through as a loader option.
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-vs-wc",
      document,
      "/du-vs-wc",
      {},
    );
  });

  it("defaults deploymentUrl to du-vs-wc joined onto getAppBase() when omitted", async () => {
    mockGetAppBase.mockReturnValue("/");
    const mod = await freshModule();

    await mod.configureValidationStationWc();

    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-vs-wc",
      document,
      "/du-vs-wc",
      {},
    );
  });

  it("defaults to the coded app's own base path when getAppBase() returns one", async () => {
    mockGetAppBase.mockReturnValue("/org/apps_/some-app/public");
    const mod = await freshModule();

    await mod.configureValidationStationWc({ includeFonts: true });

    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-vs-wc",
      document,
      "/org/apps_/some-app/public/du-vs-wc",
      { includeFonts: true },
    );
  });

  it("accepts a resolver function for deploymentUrl and forwards it unresolved", async () => {
    const mod = await freshModule();
    const resolver = () => "/resolved-at-load-time";

    await mod.configureValidationStationWc({ deploymentUrl: resolver });

    // Resolving it is the underlying loader's job, not ours — see its own tests.
    expect(mockLoadWc).toHaveBeenCalledWith("du-vs-wc", document, resolver, {});
  });

  it("loads once — a repeat call returns the same promise and does not re-inject", async () => {
    const mod = await freshModule();

    const first = mod.configureValidationStationWc({ deploymentUrl: "/a" });
    const second = mod.configureValidationStationWc({ deploymentUrl: "/b" });

    expect(second).toBe(first);
    await first;
    expect(mockLoadWc).toHaveBeenCalledTimes(1);
    // Documents the consequence of the load-once cache: the second URL is ignored.
    expect(mockLoadWc).toHaveBeenCalledWith(
      "du-vs-wc",
      document,
      "/a",
      expect.anything(),
    );
  });

  it("starts a fresh attempt when called again after a failure", async () => {
    const mod = await freshModule();
    mockLoadWc.mockRejectedValueOnce(new Error("404"));

    await expect(
      mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" }),
    ).rejects.toThrow("404");

    mockLoadWc.mockResolvedValueOnce(undefined);
    await expect(
      mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" }),
    ).resolves.toBeUndefined();
    expect(mockLoadWc).toHaveBeenCalledTimes(2);
  });

  describe("Promise.try polyfill", () => {
    // zone.js (shipped in the WC's polyfills.js) swaps in a ZoneAwarePromise
    // without Promise.try; the module restores it once the bundle has loaded.
    beforeEach(() => {
      Reflect.deleteProperty(Promise, "try");
    });

    it("is not applied before the web component loads", async () => {
      await freshModule();
      expect(Promise.try).toBeUndefined();
    });

    describe("once loaded", () => {
      // The polyfill is installed on the global, so these read `Promise.try`
      // directly rather than going back through the module.
      beforeEach(async () => {
        const mod = await freshModule();
        await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      });

      it("is restored once the load resolves", () => {
        expect(typeof Promise.try).toBe("function");
      });

      it("resolves with the callback's return value", async () => {
        await expect(Promise.try(() => 42)).resolves.toBe(42);
      });

      it("unwraps a returned promise", async () => {
        await expect(Promise.try(() => Promise.resolve("ok"))).resolves.toBe(
          "ok",
        );
      });

      it("rejects when the callback throws synchronously", async () => {
        await expect(
          Promise.try(() => {
            throw new Error("boom");
          }),
        ).rejects.toThrow("boom");
      });

      it("forwards extra arguments to the callback", async () => {
        await expect(
          Promise.try((a: number, b: number) => a + b, 2, 3),
        ).resolves.toBe(5);
      });
    });
  });
});

describe("tag names", () => {
  it("exposes the standalone tag names", () => {
    // Lock the exact tag contract — these strings are the DOM element names the
    // browser registers, so a typo here silently renders an unknown element.
    expect(DU_WC_TAGS).toEqual({
      validationStation: "ui-du-validation-station-standalone-wc-element",
      documentViewer: "ui-du-document-viewer-standalone-wc-element",
      compactFieldsForm: "ui-du-compact-fields-form-standalone-wc-element",
      compactTableEditor: "ui-du-compact-table-editor-standalone-wc-element",
      compactBusinessRules:
        "ui-du-compact-business-rules-standalone-wc-element",
      compactDocTypeField: "ui-du-compact-doc-type-field-standalone-wc-element",
    });
    expect(DU_WC_TAGS.validationStation).toBe(VALIDATION_STATION_TAG);
  });

  describe("convertToPersistentTag", () => {
    it("swaps the -element suffix for the persistent variant", () => {
      expect(convertToPersistentTag(VALIDATION_STATION_TAG)).toBe(
        "ui-du-validation-station-standalone-wc-persistent-element",
      );
      expect(convertToPersistentTag(DU_WC_TAGS.documentViewer)).toBe(
        "ui-du-document-viewer-standalone-wc-persistent-element",
      );
    });

    it("rewrites only the final -element, not an earlier occurrence", () => {
      expect(convertToPersistentTag("ui-element-foo-element")).toBe(
        "ui-element-foo-persistent-element",
      );
    });

    it("only rewrites a trailing -element suffix", () => {
      expect(convertToPersistentTag("ui-element-wrapper")).toBe(
        "ui-element-wrapper",
      );
    });
  });
});

describe("waitForWcElementReady", () => {
  it("waits for the load, then for the browser to define the element", async () => {
    const mod = await freshModule();
    let resolveLoad!: () => void;
    mockLoadWc.mockReturnValueOnce(
      new Promise<void>((r) => {
        resolveLoad = r;
      }),
    );
    const whenDefined = vi
      .spyOn(window.customElements, "whenDefined")
      .mockResolvedValue(undefined as unknown as CustomElementConstructor);

    void mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
    const ready = mod.waitForWcElementReady("some-tag");

    // The element registry must not be consulted until the bundle has loaded.
    await Promise.resolve();
    expect(whenDefined).not.toHaveBeenCalled();

    resolveLoad();
    await expect(ready).resolves.toBeUndefined();
    expect(whenDefined).toHaveBeenCalledWith("some-tag");
  });

  it("rejects with the load error instead of waiting forever", async () => {
    const mod = await freshModule();
    mockLoadWc.mockRejectedValueOnce(new Error("offline"));
    // Would resolve if consulted — proves the rejection comes from the load, and
    // that a failed load is not mistaken for "never configured" (which would
    // fall through to the registry and hang on an element that never upgrades).
    const whenDefined = vi
      .spyOn(window.customElements, "whenDefined")
      .mockResolvedValue(undefined as unknown as CustomElementConstructor);

    await expect(
      mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" }),
    ).rejects.toThrow("offline");
    await expect(mod.waitForWcElementReady("some-tag")).rejects.toThrow(
      "offline",
    );
    expect(whenDefined).not.toHaveBeenCalled();
  });

  it("warns once but still waits when configure was never called", async () => {
    const mod = await freshModule();
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const whenDefined = vi
      .spyOn(window.customElements, "whenDefined")
      .mockResolvedValue(undefined as unknown as CustomElementConstructor);

    await mod.waitForWcElementReady("some-tag");
    await mod.waitForWcElementReady("other-tag");

    // Falls through to the registry so a host that loaded the bundle by other
    // means still works.
    expect(whenDefined).toHaveBeenCalledTimes(2);
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toContain(
      "configureValidationStationWc",
    );
    expect(mockLoadWc).not.toHaveBeenCalled();
  });

  it("resolves to a no-op when there is no window (SSR)", async () => {
    const mod = await freshModule();
    vi.stubGlobal("window", undefined);
    try {
      await expect(
        mod.waitForWcElementReady("some-tag"),
      ).resolves.toBeUndefined();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
