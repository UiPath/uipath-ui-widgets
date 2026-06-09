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
});
