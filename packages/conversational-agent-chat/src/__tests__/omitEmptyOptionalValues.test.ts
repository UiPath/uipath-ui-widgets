import { describe, expect, it } from "vitest";

import { omitEmptyOptionalValues } from "../components/AgentSchemaForm/omitEmptyOptionalValues";
import type { InputSchema } from "../components/AgentSchemaForm/types";

describe("omitEmptyOptionalValues", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
    ["an empty array", []],
    ["an empty object", {}],
  ])("drops an optional field holding %s", (_label, value) => {
    expect(omitEmptyOptionalValues({ note: value }, {})).toEqual({});
  });

  it("keeps falsy values that are real answers", () => {
    const data = { count: 0, enabled: false, tags: ["a"], name: "x" };
    expect(omitEmptyOptionalValues(data, {})).toEqual(data);
  });

  it("keeps required fields even when empty", () => {
    const schema: InputSchema = {
      required: ["config", "label"],
      properties: {
        config: { type: "object", properties: {} },
        label: { type: "string" },
      },
    };
    expect(omitEmptyOptionalValues({ config: {}, label: "" }, schema)).toEqual({
      config: {},
      label: "",
    });
  });

  it("drops an untouched optional object pre-initialized to {}", () => {
    const schema: InputSchema = {
      required: ["name"],
      properties: {
        name: { type: "string" },
        address: {
          type: "object",
          properties: { city: { type: "string" } },
        },
      },
    };
    expect(
      omitEmptyOptionalValues({ name: "Alice", address: {} }, schema),
    ).toEqual({ name: "Alice" });
  });

  it("prunes nested optional fields and drops an object left empty", () => {
    const schema: InputSchema = {
      properties: {
        address: {
          type: "object",
          properties: {
            city: { type: "string" },
            zip: { type: "string" },
          },
        },
      },
    };
    expect(
      omitEmptyOptionalValues({ address: { city: "", zip: null } }, schema),
    ).toEqual({});
    expect(
      omitEmptyOptionalValues({ address: { city: "Paris", zip: "" } }, schema),
    ).toEqual({ address: { city: "Paris" } });
  });

  describe("optional object with a nested required list", () => {
    const schema: InputSchema = {
      properties: {
        address: {
          type: "object",
          required: ["city"],
          properties: {
            city: { type: "string" },
            zip: { type: "string" },
          },
        },
      },
    };

    it("omits the object when it has no content", () => {
      expect(
        omitEmptyOptionalValues({ address: { city: "", zip: "" } }, schema),
      ).toEqual({});
      expect(
        omitEmptyOptionalValues({ address: { city: "" } }, schema),
      ).toEqual({});
    });

    it("keeps the nested required child once the object has content", () => {
      expect(
        omitEmptyOptionalValues(
          { address: { city: "Paris", zip: "" } },
          schema,
        ),
      ).toEqual({ address: { city: "Paris" } });
      expect(
        omitEmptyOptionalValues(
          { address: { city: "", zip: "75001" } },
          schema,
        ),
      ).toEqual({ address: { city: "", zip: "75001" } });
    });

    it("judges deeply nested optional objects by their content", () => {
      const deep: InputSchema = {
        properties: {
          outer: {
            type: "object",
            properties: {
              inner: {
                type: "object",
                required: ["id"],
                properties: { id: { type: "string" } },
              },
            },
          },
        },
      };
      expect(
        omitEmptyOptionalValues({ outer: { inner: { id: "" } } }, deep),
      ).toEqual({});
      expect(
        omitEmptyOptionalValues({ outer: { inner: { id: "x" } } }, deep),
      ).toEqual({ outer: { inner: { id: "x" } } });
    });
  });

  it("treats an object holding only 0 or false as content", () => {
    expect(
      omitEmptyOptionalValues({ settings: { retries: 0, verbose: false } }, {}),
    ).toEqual({ settings: { retries: 0, verbose: false } });
  });

  it("keeps a required object whose optional children were all pruned", () => {
    const schema: InputSchema = {
      required: ["address"],
      properties: {
        address: {
          type: "object",
          properties: { city: { type: "string" } },
        },
      },
    };
    expect(omitEmptyOptionalValues({ address: { city: "" } }, schema)).toEqual({
      address: {},
    });
  });

  it("does not mutate the input", () => {
    const data = { name: "Alice", note: "", address: { city: "" } };
    const snapshot = structuredClone(data);
    omitEmptyOptionalValues(data, {});
    expect(data).toEqual(snapshot);
  });
});
