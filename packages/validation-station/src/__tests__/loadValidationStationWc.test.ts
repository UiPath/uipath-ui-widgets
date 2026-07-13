import { describe, it, expect, beforeAll, vi } from "vitest";

// The real WC bundle (Angular + zone.js) can't run under jsdom — stub the
// side-effect imports so the module's own code (the polyfill) executes.
vi.mock("@uipath/du-validation-station-wc/polyfills", () => ({}));
vi.mock("@uipath/du-validation-station-wc/main", () => ({}));
vi.mock("@uipath/du-validation-station-wc/styles.css", () => ({}));

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
});
