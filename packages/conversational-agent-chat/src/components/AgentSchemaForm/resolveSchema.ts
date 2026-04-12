import type { InputSchema, InputSchemaProperty } from "./types";

/**
 * Resolves a JSON Schema with $ref/$defs and anyOf nullable patterns
 * into the flat InputSchema format that AgentSchemaForm understands.
 *
 * Handles two patterns from tool interrupt schemas:
 * 1. `$ref: "#/$defs/TypeName"` — inlines the referenced definition
 * 2. `anyOf: [{type: "string"}, {type: "null"}]` — extracts the non-null type
 */

type RawSchema = Record<string, unknown>;

function getDefs(root: RawSchema): Record<string, RawSchema> {
  return (root.$defs ?? root.definitions ?? {}) as Record<string, RawSchema>;
}

function resolveRef(
  ref: string,
  defs: Record<string, RawSchema>,
): RawSchema | undefined {
  // Only handle local refs like "#/$defs/TypeName"
  const match = ref.match(/^#\/(?:\$defs|definitions)\/(.+)$/);
  if (!match) return undefined;
  return defs[match[1]];
}

/**
 * Given an `anyOf` array, extracts the non-null type if this is a simple
 * nullable pattern like `anyOf: [{type: "string"}, {type: "null"}]`.
 *
 * Also handles `anyOf` with `$ref` entries like:
 * `anyOf: [{$ref: "#/$defs/Foo"}, {type: "null"}]`
 *
 * Also handles `anyOf` with `const` entries (enum-like):
 * `anyOf: [{const: "high"}, {const: "normal"}, {type: "null"}]`
 */
function resolveAnyOf(
  anyOf: RawSchema[],
  defs: Record<string, RawSchema>,
): InputSchemaProperty | undefined {
  const nonNull = anyOf.filter((s) => s.type !== "null");

  // All const values = enum pattern (preserve titles for display labels)
  if (nonNull.length > 0 && nonNull.every((s) => "const" in s)) {
    return {
      type: "string",
      enum: nonNull.map((s) => s.const) as unknown[],
      oneOf: nonNull.map((s) => {
        const entry: { const: string; title?: string } = {
          const: s.const as string,
        };
        if (s.title) entry.title = s.title as string;
        return entry;
      }),
    };
  }

  if (nonNull.length === 1) {
    const schema = nonNull[0];
    // Could be a $ref — strip auto-generated def title
    if (schema.$ref) {
      const resolved = resolveRef(schema.$ref as string, defs);
      if (resolved) {
        const withoutTitle = { ...resolved };
        delete withoutTitle.title;
        return resolveProperty(withoutTitle, defs);
      }
    }
    return resolveProperty(schema, defs);
  }

  return undefined;
}

function resolveProperty(
  raw: RawSchema,
  defs: Record<string, RawSchema>,
): InputSchemaProperty {
  // Resolve $ref at property level
  if (raw.$ref) {
    const resolved = resolveRef(raw.$ref as string, defs);
    if (resolved) {
      // Strip auto-generated title from $defs (e.g. "DynamicType_1")
      // and merge sibling properties from the $ref site
      const resolvedWithoutTitle = { ...resolved };
      delete resolvedWithoutTitle.title;
      const rest = { ...raw };
      delete rest.$ref;
      return resolveProperty({ ...resolvedWithoutTitle, ...rest }, defs);
    }
  }

  // Handle anyOf/oneOf nullable and enum patterns
  const compositeArray = (raw.anyOf ?? raw.oneOf) as RawSchema[] | undefined;
  if (Array.isArray(compositeArray)) {
    const resolved = resolveAnyOf(compositeArray, defs);
    if (resolved) {
      // Carry over title, description, default from the parent
      const overrides: InputSchemaProperty = {};
      if (raw.title) overrides.title = raw.title as string;
      if (raw.description) overrides.description = raw.description as string;
      if ("default" in raw) overrides.default = raw.default as unknown;
      return { ...resolved, ...overrides };
    }
  }

  const result: InputSchemaProperty = {};

  if (raw.type) result.type = raw.type as string;
  if (raw.format) result.format = raw.format as string;
  if (raw.title) result.title = raw.title as string;
  if (raw.description) result.description = raw.description as string;
  if ("default" in raw) result.default = raw.default as unknown;
  if (raw.enum) result.enum = raw.enum as unknown[];
  if (raw.minimum !== undefined) result.minimum = raw.minimum as number;
  if (raw.maximum !== undefined) result.maximum = raw.maximum as number;
  if (raw.required) result.required = raw.required as string[];

  // Recursively resolve nested object properties
  if (raw.properties) {
    const props = raw.properties as Record<string, RawSchema>;
    result.properties = {};
    for (const [key, prop] of Object.entries(props)) {
      result.properties[key] = resolveProperty(prop, defs);
    }
  }

  // Recursively resolve array items
  if (raw.items) {
    result.items = resolveProperty(raw.items as RawSchema, defs);
  }

  return result;
}

/**
 * Resolves a full JSON Schema (potentially with $defs, $ref, anyOf)
 * into a flat InputSchema that AgentSchemaForm can render.
 */
export function resolveSchema(raw: unknown): InputSchema {
  if (!raw || typeof raw !== "object") return {};

  const schema = raw as RawSchema;
  const defs = getDefs(schema);

  const result: InputSchema = {};
  if (schema.type) result.type = schema.type as string;
  if (schema.required) result.required = schema.required as string[];

  if (schema.properties) {
    const props = schema.properties as Record<string, RawSchema>;
    result.properties = {};
    for (const [key, prop] of Object.entries(props)) {
      result.properties[key] = resolveProperty(prop, defs);
    }
  }

  return result;
}
