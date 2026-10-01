import type { InputSchema, InputSchemaProperty } from "./types";

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  Object.getPrototypeOf(value) === Object.prototype;

// `0` and `false` count as content.
const hasContent = (value: unknown): boolean => {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  if (isPlainObject(value)) return Object.values(value).some(hasContent);
  return true;
};

/**
 * Drops empty optional fields (`null`, `""`, `[]`, objects without content).
 * Optional objects are judged as a whole, so their blank required children are
 * dropped too. Required fields are always kept.
 */
export const omitEmptyOptionalValues = (
  data: Record<string, unknown>,
  schema: InputSchema | InputSchemaProperty,
): Record<string, unknown> => {
  const required = new Set(schema.required ?? []);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (!required.has(key) && !hasContent(value)) continue;
    result[key] = isPlainObject(value)
      ? omitEmptyOptionalValues(value, schema.properties?.[key] ?? {})
      : value;
  }
  return result;
};
