/**
 * JSON Schema types as used by UiPath Conversational Agent APIs.
 *
 * These mirror the subset of JSON Schema that the agent inputSchema and tool-call interrupt inputSchema
 * actually produce.
 */

export interface EnumOption {
  const: string;
  title?: string;
}

/**
 * Adding a new JSON Schema keyword? Update this interface AND add handling in resolveSchema.ts so it
 * gets normalized properly.
 */
export interface InputSchemaProperty {
  type?: string;
  format?: string;
  enum?: unknown[];
  // Preserves display labels for enum options from oneOf/anyOf const patterns
  oneOf?: EnumOption[];
  minimum?: number;
  maximum?: number;
  title?: string;
  description?: string;
  default?: unknown;
  properties?: Record<string, InputSchemaProperty>;
  required?: string[];
  items?: InputSchemaProperty;
}

export interface InputSchema {
  type?: string;
  required?: string[];
  properties?: Record<string, InputSchemaProperty>;
}
