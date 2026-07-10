import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";

// The real WC bundle (Angular + zone.js) can't run under jsdom — stub the
// side-effect imports so the module's own code (the polyfill) executes.
vi.mock("@uipath/du-validation-station-wc/polyfills", () => ({}));
vi.mock("@uipath/du-validation-station-wc/main", () => ({}));
vi.mock("@uipath/du-validation-station-wc/styles.css", () => ({}));
vi.mock("@uipath/du-validation-station-wc/fonts.css", () => ({}));

describe("loadValidationStationWc", () => {
  let mod: typeof import("../loadValidationStationWc");

  beforeAll(async () => {
    // Simulate zone.js's ZoneAwarePromise, which lacks Promise.try, so the
    // polyfill branch runs regardless of the Node version's native support.
    Reflect.deleteProperty(Promise, "try");
    mod = await import("../loadValidationStationWc");
  });

  it("restores Promise.try after import", () => {
    expect(typeof Promise.try).toBe("function");
  });

  it("resolves with the callback's return value", async () => {
    await expect(Promise.try(() => 42)).resolves.toBe(42);
  });

  it("unwraps a returned promise", async () => {
    await expect(Promise.try(() => Promise.resolve("ok"))).resolves.toBe("ok");
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

  it("exposes the WC tag and a readiness promise", () => {
    expect(mod.VALIDATION_STATION_TAG).toBe(
      "ui-du-validation-station-standalone-wc-element",
    );
    expect(mod.validationStationWcReady).toBeInstanceOf(Promise);
  });

  it("exposes the standalone tag names", () => {
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
    it("swaps the -element suffix for the persistent variant", () => {
      expect(mod.convertToPersistentTag(mod.VALIDATION_STATION_TAG)).toBe(
        "ui-du-validation-station-standalone-wc-persistent-element",
      );
      expect(mod.convertToPersistentTag(mod.DU_WC_TAGS.documentViewer)).toBe(
        "ui-du-document-viewer-standalone-wc-persistent-element",
      );
    });

    it("rewrites only the final -element, not an earlier occurrence", () => {
      expect(mod.convertToPersistentTag("ui-element-foo-element")).toBe(
        "ui-element-foo-persistent-element",
      );
    });

    it("only rewrites a trailing -element suffix", () => {
      expect(mod.convertToPersistentTag("ui-element-wrapper")).toBe(
        "ui-element-wrapper",
      );
    });
  });

  describe("waitForWcElementReady", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it("resolves once the browser defines the element", async () => {
      const whenDefined = vi
        .spyOn(window.customElements, "whenDefined")
        .mockResolvedValue(undefined as unknown as CustomElementConstructor);

      await expect(
        mod.waitForWcElementReady("some-tag"),
      ).resolves.toBeUndefined();
      expect(whenDefined).toHaveBeenCalledWith("some-tag");
    });

    it("resolves to a no-op when there is no window (SSR)", async () => {
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
});
