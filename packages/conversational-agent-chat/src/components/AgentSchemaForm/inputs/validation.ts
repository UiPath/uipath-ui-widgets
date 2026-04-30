import type { InputSchemaProperty } from "../types";

/**
 * Returns true if a field value should be considered empty for required validation.
 */
export const isFieldEmpty = (value: unknown): boolean => {
  if (value == null || value === "") return true;
  return Array.isArray(value) && value.length === 0;
};

/**
 * Recursively collects dot-notation paths for empty required fields within an object.
 */
export const collectRequiredErrors = (
  value: unknown,
  prop: InputSchemaProperty,
  prefix: string,
  errors: Record<string, boolean>,
): void => {
  if (prop.type !== "object") return;
  const nestedProps = prop.properties as
    | Record<string, InputSchemaProperty>
    | undefined;
  if (!nestedProps || Object.keys(nestedProps).length === 0) return;

  const objectValue = (
    value === undefined || value === null ? {} : value
  ) as Record<string, unknown>;
  const required = (prop.required as string[] | undefined) ?? [];

  for (const [key, nestedProp] of Object.entries(nestedProps)) {
    const fullPath = `${prefix}.${key}`;
    const nestedValue = objectValue[key];

    if (required.includes(key) && isFieldEmpty(nestedValue)) {
      errors[fullPath] = true;
      errors[prefix] = true;
    }

    if (nestedProp?.type === "object") {
      const nestedHasProps =
        nestedProp.properties !== null &&
        nestedProp.properties !== undefined &&
        Object.keys(nestedProp.properties as object).length > 0;
      if (nestedHasProps) {
        collectRequiredErrors(nestedValue, nestedProp, fullPath, errors);
        if (Object.keys(errors).some((k) => k.startsWith(`${fullPath}.`))) {
          errors[fullPath] = true;
          errors[prefix] = true;
        }
      }
    }
  }
};
