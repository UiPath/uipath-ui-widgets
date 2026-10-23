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
  label?: string;
  whys?: readonly string[];
  idFor?: (fieldId: string) => string;
}

export interface ReasonCaptureResult<S extends ReasonCaptureSchema> {
  schema: S;
  added: ReasonCaptureField[];
}

const capturesReason = (field: ReasonCaptureField) =>
  field.direction !== "input" &&
  field.controlType !== undefined &&
  CAPTURE_CONTROLS.has(field.controlType);

export function withReasonCapture<S extends ReasonCaptureSchema>(
  schema: S,
  options: ReasonCaptureOptions = {},
): ReasonCaptureResult<S> {
  const {
    label = "Why? (optional)",
    whys = REASON_CAPTURE_WHYS,
    idFor = (fieldId: string) => `why_${fieldId}`,
  } = options;

  const reasonFieldFor = (field: ReasonCaptureField): ReasonCaptureField => {
    const id = idFor(field.id);
    return {
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
  };

  const pairs = schema.fields.map((field) => ({
    field,
    reasonField: capturesReason(field) ? reasonFieldFor(field) : undefined,
  }));
  const fields = pairs.flatMap(({ field, reasonField }) =>
    reasonField ? [field, reasonField] : [field],
  );
  const added = pairs.flatMap(({ reasonField }) =>
    reasonField ? [reasonField] : [],
  );

  return { schema: { ...schema, fields }, added };
}
