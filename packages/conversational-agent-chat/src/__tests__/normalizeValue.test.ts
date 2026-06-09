import { describe, it, expect } from "vitest";
import { normalizeValue } from "../utils/normalizeValue";

describe("normalizeValue", () => {
  it("formats a Date as a datetime-local value (no trailing Z)", () => {
    // Local June 3 2026, 09:07.
    expect(normalizeValue(new Date(2026, 5, 3, 9, 7))).toBe("2026-06-03T09:07");
  });

  it("never emits an ISO string a native datetime-local input would reject", () => {
    const out = normalizeValue(new Date()) as string;
    expect(out).not.toMatch(/Z$/);
    expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it("recurses into objects and arrays", () => {
    const d = new Date(2026, 0, 1, 0, 0);
    expect(normalizeValue({ a: d, b: [d, "x"], c: 3 })).toEqual({
      a: "2026-01-01T00:00",
      b: ["2026-01-01T00:00", "x"],
      c: 3,
    });
  });

  it("passes through primitives", () => {
    expect(normalizeValue("hello")).toBe("hello");
    expect(normalizeValue(42)).toBe(42);
    expect(normalizeValue(null)).toBe(null);
  });
});
