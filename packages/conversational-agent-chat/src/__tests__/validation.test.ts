import { describe, it, expect } from "vitest";
import {
  isFieldEmpty,
  collectRequiredErrors,
} from "../components/AgentSchemaForm/inputs/validation";
import type { InputSchemaProperty } from "../components/AgentSchemaForm/types";

describe("isFieldEmpty", () => {
  it("treats null, undefined and empty string as empty", () => {
    expect(isFieldEmpty(null)).toBe(true);
    expect(isFieldEmpty(undefined)).toBe(true);
    expect(isFieldEmpty("")).toBe(true);
  });

  it("treats an empty array as empty but a non-empty one as filled", () => {
    expect(isFieldEmpty([])).toBe(true);
    expect(isFieldEmpty(["a"])).toBe(false);
  });

  it("treats other primitives as filled", () => {
    expect(isFieldEmpty(0)).toBe(false);
    expect(isFieldEmpty(false)).toBe(false);
    expect(isFieldEmpty("x")).toBe(false);
  });
});

describe("collectRequiredErrors", () => {
  it("no-ops for non-object props", () => {
    const errors: Record<string, boolean> = {};
    collectRequiredErrors(
      "x",
      { type: "string" } as InputSchemaProperty,
      "p",
      errors,
    );
    expect(errors).toEqual({});
  });

  it("no-ops for an object with no properties", () => {
    const errors: Record<string, boolean> = {};
    collectRequiredErrors(
      {},
      { type: "object", properties: {} } as InputSchemaProperty,
      "p",
      errors,
    );
    expect(errors).toEqual({});
  });

  it("flags a missing required leaf and marks the parent prefix", () => {
    const errors: Record<string, boolean> = {};
    const prop = {
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
    } as unknown as InputSchemaProperty;

    collectRequiredErrors({}, prop, "user", errors);

    expect(errors["user.name"]).toBe(true);
    expect(errors["user"]).toBe(true);
  });

  it("does not flag a required leaf that has a value", () => {
    const errors: Record<string, boolean> = {};
    const prop = {
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
    } as unknown as InputSchemaProperty;

    collectRequiredErrors({ name: "Ada" }, prop, "user", errors);

    expect(errors).toEqual({});
  });

  it("treats a null value as an empty object and still recurses", () => {
    const errors: Record<string, boolean> = {};
    const prop = {
      type: "object",
      required: ["id"],
      properties: { id: { type: "string" } },
    } as unknown as InputSchemaProperty;

    collectRequiredErrors(null, prop, "p", errors);

    expect(errors["p.id"]).toBe(true);
  });

  it("bubbles a nested error up through intermediate (non-required) objects", () => {
    const errors: Record<string, boolean> = {};
    const prop = {
      type: "object",
      properties: {
        address: {
          type: "object",
          required: ["zip"],
          properties: { zip: { type: "string" } },
        },
      },
    } as unknown as InputSchemaProperty;

    collectRequiredErrors({ address: {} }, prop, "form", errors);

    expect(errors["form.address.zip"]).toBe(true);
    // intermediate object and root both marked so the path stays highlighted
    expect(errors["form.address"]).toBe(true);
    expect(errors["form"]).toBe(true);
  });

  it("ignores nested objects that declare no properties", () => {
    const errors: Record<string, boolean> = {};
    const prop = {
      type: "object",
      properties: {
        meta: { type: "object", properties: {} },
      },
    } as unknown as InputSchemaProperty;

    collectRequiredErrors({ meta: {} }, prop, "form", errors);

    expect(errors).toEqual({});
  });
});
