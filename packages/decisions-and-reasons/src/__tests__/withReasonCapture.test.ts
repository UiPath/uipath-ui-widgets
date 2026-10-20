import { describe, expect, it } from "vitest";
import { withReasonCapture } from "../reviewModel";

const schema = {
  type: "hitl-schema",
  fields: [
    {
      id: "ticket",
      direction: "input",
      controlType: "textarea",
      defaultValue: "text",
    },
    {
      id: "category",
      direction: "inOut",
      controlType: "dropdown",
      defaultValue: "Network",
    },
    {
      id: "priority",
      direction: "inOut",
      controlType: "radioGroup",
      defaultValue: "P2",
    },
    { id: "notes", direction: "output", controlType: "textarea" },
    {
      id: "urgent",
      direction: "inOut",
      controlType: "checkbox",
      defaultValue: "true",
    },
  ],
  outcomes: [{ id: "confirm", name: "Confirm triage" }],
};

describe("withReasonCapture", () => {
  it("adds one optional Why dropdown under each select field", () => {
    const { schema: out, added } = withReasonCapture(schema);

    expect(out.fields.map((f) => f.id)).toEqual([
      "ticket",
      "category",
      "why_category",
      "priority",
      "why_priority",
      "notes",
      "urgent",
      "why_urgent",
    ]);
    expect(added.map((f) => f.id)).toEqual([
      "why_category",
      "why_priority",
      "why_urgent",
    ]);
  });

  it("shows each Why only when the value differs from the field's default", () => {
    const { added } = withReasonCapture(schema);
    const why = added[0] as {
      rules: { conditions: unknown[]; effects: unknown }[];
    };

    expect(why.rules[0].conditions).toEqual([
      { when: "category", isNot: "Network" },
    ]);
    expect(why.rules[0].effects).toEqual({ visible: true });
  });

  it("never requires the Why and offers Wrong, Outdated and Other", () => {
    const { added } = withReasonCapture(schema);
    const why = added[0] as {
      required?: boolean;
      direction: string;
      options: { value: string }[];
    };

    expect(why.required).toBeUndefined();
    expect(why.direction).toBe("output");
    expect(why.options.map((o) => o.value)).toEqual([
      "Wrong",
      "Outdated",
      "Other",
    ]);
  });

  it("skips input fields and non-select controls, and keeps the rest of the schema", () => {
    const { schema: out } = withReasonCapture(schema);

    expect(out.fields.some((f) => f.id === "why_ticket")).toBe(false);
    expect(out.fields.some((f) => f.id === "why_notes")).toBe(false);
    expect(out.outcomes).toEqual(schema.outcomes);
    expect(schema.fields).toHaveLength(5);
  });

  it("honours a custom label, options and id", () => {
    const { added } = withReasonCapture(schema, {
      label: "Reason",
      whys: ["Rule"],
      idFor: (id) => `reason_${id}`,
    });

    expect(added[0]).toMatchObject({ id: "reason_category", label: "Reason" });
  });
});
