/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Shared helpers for the Integration Service sample pages
 * (Connectors browser + Slack message sender).
 */
import { ConnectionState } from "@uipath/uipath-typescript/is-connections";
import type {
  ElementActivity,
  ElementMethodDefinition,
  ElementObjectMetadataResponse,
} from "@uipath/uipath-typescript/is-elements";
import type { ExecuteMethod } from "@uipath/uipath-typescript/is-execution";

export const HTTP_METHODS: ExecuteMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
];

/** Resolve the HTTP method + parameter schema for a curated activity. */
export function resolveMethod(
  meta: ElementObjectMetadataResponse | null,
  activity: ElementActivity | null,
): { verb: ExecuteMethod; def?: ElementMethodDefinition } {
  const methods = meta?.metadata?.method ?? {};
  let def: ElementMethodDefinition | undefined;

  if (activity?.methodName && methods[activity.methodName]) {
    def = methods[activity.methodName];
  } else if (activity?.operation) {
    def = Object.values(methods).find(
      (m) => m.operation?.toLowerCase() === activity.operation?.toLowerCase(),
    );
  }
  if (!def) {
    def = Object.values(methods)[0];
  }

  const raw = (def?.method || activity?.methodName || "GET").toUpperCase();
  const verb = (
    HTTP_METHODS.includes(raw as ExecuteMethod) ? raw : "GET"
  ) as ExecuteMethod;
  return { verb, def };
}

/** Coerce a string form value to the parameter's declared primitive type. */
export function coerce(value: string, dataType?: string): unknown {
  const dt = (dataType ?? "string").toLowerCase();
  if (dt === "integer" || dt === "number" || dt === "long" || dt === "double") {
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  }
  if (dt === "boolean") return value === "true";
  return value;
}

/** A single writable body field derived from object metadata `fields`. */
export interface BodyField {
  name: string;
  displayName: string;
  dataType?: string;
  description?: string;
  required: boolean;
}

/**
 * Build the request-body form from an object's field schema.
 *
 * For a write verb (POST/PATCH/PUT) we keep a field when its per-verb method
 * block opts it into the request and it is not hidden from the UX:
 *   fields[].method[VERB].request === true && fields[].design.isHidden !== true
 * A field is required when fields[].method[VERB].required === true.
 */
export function bodyFieldsFor(
  meta: ElementObjectMetadataResponse | null,
  verb: ExecuteMethod,
): BodyField[] {
  if (!meta?.fields) return [];
  // `fields` is keyed by field name: fields[fieldName].method[VERB] / .design.
  return Object.entries(meta.fields as Record<string, any>)
    .map(([name, f]) => {
      // The verb may not have its own block (e.g. PUT often reuses POST).
      const block =
        f?.method?.[verb] ?? (verb === "PUT" ? f?.method?.POST : undefined);
      return { name, f, block };
    })
    .filter(
      ({ f, block }) => block?.request === true && f?.design?.isHidden !== true,
    )
    .map(({ name, f, block }) => ({
      name: String(f.name ?? name),
      displayName: String(f.displayName || f.name || name),
      dataType: f.dataType ?? f.type,
      description: f.description,
      required: block?.required === true,
    }));
}

/** Map a connection lifecycle state to a status dot color. */
export function stateColor(state?: ConnectionState): string {
  switch (state) {
    case ConnectionState.Enabled:
      return "var(--teal-600)";
    case ConnectionState.Expired:
      return "var(--pumpkin-600)";
    case ConnectionState.Disabled:
    case ConnectionState.Failed:
      return "#c62828";
    default:
      return "var(--text-secondary)";
  }
}
