export const REASON_CAPTURE_WHYS = ["Wrong", "Outdated", "Other"] as const;

export const CAPTURE_CONTROLS = new Set(["dropdown", "radioGroup", "checkbox"]);

export interface ReasonCaptureField {
  id: string;
  direction: string;
  controlType?: string;
  defaultValue?: string | string[];
  [extra: string]: unknown;
}

export interface ReasonCaptureSchema {
  fields: ReasonCaptureField[];
  [extra: string]: unknown;
}

export interface ReasonCaptureOptions {
  /** Label of each added field. Defaults to "Why? (optional)". */
  label?: string;
  /** Options of each added dropdown. Defaults to Wrong, Outdated, Other. */
  whys?: readonly string[];
  /** Replaces the default id, `why_<fieldId>`. */
  idFor?: (fieldId: string) => string;
}

export interface ReasonCaptureResult<S extends ReasonCaptureSchema> {
  schema: S;
  /** The fields that were added, in schema order. */
  added: ReasonCaptureField[];
}

/**
 * Adds one optional "Why?" dropdown under every select field of a QuickForm schema.
 * The field is hidden by a rule until the value differs from the field's defaultValue,
 * is never required, and is skipped for input-direction fields and non-select controls.
 */
export function withReasonCapture<S extends ReasonCaptureSchema>(
  schema: S,
  options: ReasonCaptureOptions = {},
): ReasonCaptureResult<S> {
  const label = options.label ?? "Why? (optional)";
  const whys = options.whys ?? REASON_CAPTURE_WHYS;
  const idFor = options.idFor ?? ((fieldId: string) => `why_${fieldId}`);
  const added: ReasonCaptureField[] = [];

  const fields = schema.fields.flatMap((field) => {
    if (
      field.direction === "input" ||
      !CAPTURE_CONTROLS.has(String(field.controlType))
    ) {
      return [field];
    }

    const id = idFor(field.id);
    const why: ReasonCaptureField = {
      id,
      type: "string",
      label,
      direction: "output",
      controlType: "dropdown",
      options: whys.map((value) => ({
        id: `${id}-${value}`,
        value,
        label: value,
      })),
      rules: [
        {
          id: `rule_${id}`,
          conditions: [{ when: field.id, isNot: field.defaultValue }],
          effects: { visible: true },
        },
      ],
    };
    added.push(why);
    return [field, why];
  });

  return { schema: { ...schema, fields }, added };
}
