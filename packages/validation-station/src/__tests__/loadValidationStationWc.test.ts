import { describe, it, expect, vi } from "vitest";

// The loader no longer statically imports the WC bundle — it loads it at a
// runtime-computed URL inside ensureValidationStationWcLoaded — so there are no
// bare `@uipath/du-validation-station-wc/*` imports to stub here. These tests
// cover the pure surface (tags + convertToPersistentTag) and the config/guard
// logic. The actual bundle load resolves a real served URL, which can't run
// under jsdom; that path is exercised by the sample apps (integration), not here.

// Fresh module instance per test so the module-level config / loadPromise
// singletons reset between cases.
async function freshLoader() {
  vi.resetModules();
  return import("../loadValidationStationWc");
}

describe("loadValidationStationWc", () => {
  describe("tag contract", () => {
    it("exposes the validation-station tag", async () => {
      const mod = await freshLoader();
      expect(mod.VALIDATION_STATION_TAG).toBe(
        "ui-du-validation-station-standalone-wc-element",
      );
    });

    it("exposes the standalone tag names", async () => {
      const mod = await freshLoader();
      // Lock the exact tag contract — these strings are the DOM element names the
      // browser registers, so a typo here silently renders an unknown element.
      expect(mod.DU_WC_TAGS).toEqual({
        validationStation: "ui-du-validation-station-standalone-wc-element",
        documentViewer: "ui-du-document-viewer-standalone-wc-element",
        compactFieldsForm: "ui-du-compact-fields-form-standalone-wc-element",
        compactTableEditor: "ui-du-compact-table-editor-standalone-wc-element",
        compactBusinessRules:
          "ui-du-compact-business-rules-standalone-wc-element",
        compactDocTypeField:
          "ui-du-compact-doc-type-field-standalone-wc-element",
      });
      expect(mod.DU_WC_TAGS.validationStation).toBe(mod.VALIDATION_STATION_TAG);
    });
  });

  describe("convertToPersistentTag", () => {
    it("swaps the -element suffix for the persistent variant", async () => {
      const mod = await freshLoader();
      expect(mod.convertToPersistentTag(mod.VALIDATION_STATION_TAG)).toBe(
        "ui-du-validation-station-standalone-wc-persistent-element",
      );
      expect(mod.convertToPersistentTag(mod.DU_WC_TAGS.documentViewer)).toBe(
        "ui-du-document-viewer-standalone-wc-persistent-element",
      );
    });

    it("rewrites only the final -element, not an earlier occurrence", async () => {
      const mod = await freshLoader();
      expect(mod.convertToPersistentTag("ui-element-foo-element")).toBe(
        "ui-element-foo-persistent-element",
      );
    });

    it("only rewrites a trailing -element suffix", async () => {
      const mod = await freshLoader();
      expect(mod.convertToPersistentTag("ui-element-wrapper")).toBe(
        "ui-element-wrapper",
      );
    });
  });

  describe("ensureValidationStationWcLoaded", () => {
    it("loads from the default path (DU_VS_WC_BASE) when unconfigured", async () => {
      const mod = await freshLoader();
      // No configure call → defaults to DU_VS_WC_BASE. The bundle isn't served
      // under jsdom, so the load rejects — but with the descriptive loader error
      // resolved against the default path, proving no config call is required.
      const err = await mod.ensureValidationStationWcLoaded().then(
        () => null,
        (e: unknown) => e as Error,
      );
      expect(err?.message).toMatch(/failed to load the WC bundle/i);
      expect(err?.message).toMatch(/du-vs-wc/);
    });

    it("resolves to a no-op when there is no window (SSR)", async () => {
      const mod = await freshLoader();
      vi.stubGlobal("window", undefined);
      try {
        await expect(
          mod.ensureValidationStationWcLoaded(),
        ).resolves.toBeUndefined();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("normalizes a baseUrl without a trailing slash", async () => {
      const mod = await freshLoader();
      mod.configureValidationStationWc({ baseUrl: "/du-vs-wc-noslash" });
      const err = await mod.ensureValidationStationWcLoaded().then(
        () => null,
        (e: unknown) => e as Error,
      );
      // Base is treated as a directory, so files resolve *under* it (trailing
      // slash) rather than replacing the last segment.
      expect(err?.message).toMatch(/du-vs-wc-noslash\//);
    });

    it("does not memoize a failed load — a later call retries", async () => {
      const mod = await freshLoader();
      const p1 = mod.ensureValidationStationWcLoaded();
      await p1.then(
        () => null,
        () => null,
      ); // let it reject
      await Promise.resolve(); // flush the reset .catch
      const p2 = mod.ensureValidationStationWcLoaded();
      // A fresh attempt, not the previously-rejected promise replayed.
      expect(p2).not.toBe(p1);
      await p2.then(
        () => null,
        () => null,
      );
    });
  });

  describe("configureValidationStationWc", () => {
    it("loads from a custom baseUrl once configured", async () => {
      const mod = await freshLoader();
      mod.configureValidationStationWc({ baseUrl: "/custom-wc/" });
      // Still can't fetch under jsdom, but the descriptive load error now
      // references the configured path, proving the override took effect.
      const err = await mod.ensureValidationStationWcLoaded().then(
        () => null,
        (e: unknown) => e as Error,
      );
      expect(err?.message).toMatch(/failed to load the WC bundle/i);
      expect(err?.message).toMatch(/custom-wc/);
    });
  });

  describe("waitForWcElementReady", () => {
    it("resolves to a no-op when there is no window (SSR)", async () => {
      const mod = await freshLoader();
      vi.stubGlobal("window", undefined);
      try {
        await expect(
          mod.waitForWcElementReady("some-tag"),
        ).resolves.toBeUndefined();
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it("propagates the load error (it triggers the load first)", async () => {
      const mod = await freshLoader();
      await expect(mod.waitForWcElementReady("some-tag")).rejects.toThrow(
        /failed to load the WC bundle/i,
      );
    });
  });
});
