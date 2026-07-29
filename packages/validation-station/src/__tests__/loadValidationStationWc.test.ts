import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadWc =
  vi.fn<
    (
      doc: Document,
      url: string,
      options?: { includeFonts?: boolean },
    ) => Promise<void>
  >();

vi.mock("@uipath/du-utils", () => ({
  loadValidationStationWebComponent: (...args: Parameters<typeof mockLoadWc>) =>
    mockLoadWc(...args),
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
    expect(mockLoadWc).toHaveBeenCalledWith(document, "/du-vs-wc", {
      includeFonts: true,
    });
  });

  it("passes includeFonts as undefined when omitted", async () => {
    const mod = await freshModule();

    await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });

    expect(mockLoadWc).toHaveBeenCalledWith(document, "/du-vs-wc", {
      includeFonts: undefined,
    });
  });

  it("loads once — a repeat call returns the same promise and does not re-inject", async () => {
    const mod = await freshModule();

    const first = mod.configureValidationStationWc({ deploymentUrl: "/a" });
    const second = mod.configureValidationStationWc({ deploymentUrl: "/b" });

    expect(second).toBe(first);
    await first;
    expect(mockLoadWc).toHaveBeenCalledTimes(1);
    // Documents the consequence of the load-once cache: the second URL is ignored.
    expect(mockLoadWc).toHaveBeenCalledWith(document, "/a", expect.anything());
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

    it("is restored once the load resolves", async () => {
      const mod = await freshModule();
      await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      expect(typeof Promise.try).toBe("function");
    });

    it("resolves with the callback's return value", async () => {
      const mod = await freshModule();
      await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      await expect(Promise.try(() => 42)).resolves.toBe(42);
    });

    it("unwraps a returned promise", async () => {
      const mod = await freshModule();
      await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      await expect(Promise.try(() => Promise.resolve("ok"))).resolves.toBe(
        "ok",
      );
    });

    it("rejects when the callback throws synchronously", async () => {
      const mod = await freshModule();
      await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      await expect(
        Promise.try(() => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");
    });

    it("forwards extra arguments to the callback", async () => {
      const mod = await freshModule();
      await mod.configureValidationStationWc({ deploymentUrl: "/du-vs-wc" });
      await expect(
        Promise.try((a: number, b: number) => a + b, 2, 3),
      ).resolves.toBe(5);
    });
  });
});

describe("tag names", () => {
  it("exposes the standalone tag names", async () => {
    const mod = await freshModule();
    // Lock the exact tag contract — these strings are the DOM element names the
    // browser registers, so a typo here silently renders an unknown element.
    expect(mod.DU_WC_TAGS).toEqual({
      validationStation: "ui-du-validation-station-standalone-wc-element",
      documentViewer: "ui-du-document-viewer-standalone-wc-element",
      compactFieldsForm: "ui-du-compact-fields-form-standalone-wc-element",
      compactTableEditor: "ui-du-compact-table-editor-standalone-wc-element",
      compactBusinessRules:
        "ui-du-compact-business-rules-standalone-wc-element",
      compactDocTypeField: "ui-du-compact-doc-type-field-standalone-wc-element",
    });
    expect(mod.DU_WC_TAGS.validationStation).toBe(mod.VALIDATION_STATION_TAG);
  });

  describe("convertToPersistentTag", () => {
    it("swaps the -element suffix for the persistent variant", async () => {
      const mod = await freshModule();
      expect(mod.convertToPersistentTag(mod.VALIDATION_STATION_TAG)).toBe(
        "ui-du-validation-station-standalone-wc-persistent-element",
      );
      expect(mod.convertToPersistentTag(mod.DU_WC_TAGS.documentViewer)).toBe(
        "ui-du-document-viewer-standalone-wc-persistent-element",
      );
    });

    it("rewrites only the final -element, not an earlier occurrence", async () => {
      const mod = await freshModule();
      expect(mod.convertToPersistentTag("ui-element-foo-element")).toBe(
        "ui-element-foo-persistent-element",
      );
    });

    it("only rewrites a trailing -element suffix", async () => {
      const mod = await freshModule();
      expect(mod.convertToPersistentTag("ui-element-wrapper")).toBe(
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
