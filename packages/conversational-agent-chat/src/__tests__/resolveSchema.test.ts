import { describe, it, expect } from "vitest";
import { resolveSchema } from "../components/AgentSchemaForm/resolveSchema";

describe("resolveSchema", () => {
  it("terminates on a self-referential $ref instead of overflowing", () => {
    const schema = {
      type: "object",
      $defs: {
        Node: {
          type: "object",
          properties: {
            value: { type: "string" },
            child: { $ref: "#/$defs/Node" },
          },
        },
      },
      properties: { root: { $ref: "#/$defs/Node" } },
    };

    const resolved = resolveSchema(schema);
    // The recursive `child` collapses to an opaque object; siblings still resolve.
    expect(resolved.properties?.root?.properties?.child).toEqual({
      type: "object",
    });
    expect(resolved.properties?.root?.properties?.value).toEqual({
      type: "string",
    });
  });

  it("terminates on mutual recursion between two $defs", () => {
    const schema = {
      type: "object",
      $defs: {
        A: { type: "object", properties: { b: { $ref: "#/$defs/B" } } },
        B: { type: "object", properties: { a: { $ref: "#/$defs/A" } } },
      },
      properties: { start: { $ref: "#/$defs/A" } },
    };
    expect(() => resolveSchema(schema)).not.toThrow();
  });

  it("still resolves a non-cyclic $ref reused across siblings", () => {
    const schema = {
      type: "object",
      $defs: { Name: { type: "string" } },
      properties: {
        first: { $ref: "#/$defs/Name" },
        last: { $ref: "#/$defs/Name" },
      },
    };
    const resolved = resolveSchema(schema);
    expect(resolved.properties?.first).toEqual({ type: "string" });
    expect(resolved.properties?.last).toEqual({ type: "string" });
  });

  it("returns an empty schema for non-object input", () => {
    expect(resolveSchema(null)).toEqual({});
    expect(resolveSchema("nope")).toEqual({});
    expect(resolveSchema(42)).toEqual({});
  });

  it("carries over top-level type and required", () => {
    const resolved = resolveSchema({
      type: "object",
      required: ["a"],
      properties: { a: { type: "string" } },
    });
    expect(resolved.type).toBe("object");
    expect(resolved.required).toEqual(["a"]);
  });

  it("extracts the non-null type from a nullable anyOf", () => {
    const resolved = resolveSchema({
      type: "object",
      properties: {
        nickname: { anyOf: [{ type: "string" }, { type: "null" }] },
      },
    });
    expect(resolved.properties?.nickname).toEqual({ type: "string" });
  });

  it("treats an all-const anyOf as an enum and preserves titles", () => {
    const resolved = resolveSchema({
      type: "object",
      properties: {
        priority: {
          title: "Priority",
          anyOf: [
            { const: "high", title: "High" },
            { const: "normal" },
            { type: "null" },
          ],
        },
      },
    });
    expect(resolved.properties?.priority).toEqual({
      type: "string",
      enum: ["high", "normal"],
      oneOf: [{ const: "high", title: "High" }, { const: "normal" }],
      title: "Priority",
    });
  });

  it("carries title/description/default down onto a resolved composite", () => {
    const resolved = resolveSchema({
      type: "object",
      properties: {
        note: {
          title: "Note",
          description: "Optional note",
          default: "hi",
          anyOf: [{ type: "string" }, { type: "null" }],
        },
      },
    });
    expect(resolved.properties?.note).toMatchObject({
      type: "string",
      title: "Note",
      description: "Optional note",
      default: "hi",
    });
  });

  it("resolves a $ref nested inside a nullable anyOf", () => {
    const resolved = resolveSchema({
      type: "object",
      $defs: {
        Addr: { type: "object", properties: { zip: { type: "string" } } },
      },
      properties: {
        home: { anyOf: [{ $ref: "#/$defs/Addr" }, { type: "null" }] },
      },
    });
    expect(resolved.properties?.home?.properties?.zip).toEqual({
      type: "string",
    });
  });

  it("collapses a self-referential $ref inside anyOf to an opaque object", () => {
    const resolved = resolveSchema({
      type: "object",
      $defs: {
        Node: {
          type: "object",
          properties: {
            next: { anyOf: [{ $ref: "#/$defs/Node" }, { type: "null" }] },
          },
        },
      },
      properties: { root: { $ref: "#/$defs/Node" } },
    });
    expect(resolved.properties?.root?.properties?.next).toEqual({
      type: "object",
    });
  });

  it("recursively resolves array item schemas via $ref", () => {
    const resolved = resolveSchema({
      type: "object",
      $defs: { Tag: { type: "string" } },
      properties: {
        tags: { type: "array", items: { $ref: "#/$defs/Tag" } },
      },
    });
    expect(resolved.properties?.tags?.items).toEqual({ type: "string" });
  });

  it("supports the `definitions` alias for `$defs`", () => {
    const resolved = resolveSchema({
      type: "object",
      definitions: { Name: { type: "string" } },
      properties: { first: { $ref: "#/definitions/Name" } },
    });
    expect(resolved.properties?.first).toEqual({ type: "string" });
  });
});
