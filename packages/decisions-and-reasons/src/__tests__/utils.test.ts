import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReviewPart, ReviewSpec } from "../models/decision";
import { buildPayload } from "../utils/payload";
import { withReasonCapture } from "../utils/withReasonCapture";

const BASE = 1_760_000_000_000;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildPayload", () => {
  const spec: ReviewSpec = {
    recommended: "Confirm",
    proposedBy: "Agent",
    outcomes: [
      { id: "Confirm", label: "Confirm", description: "" },
      { id: "Reject", label: "Reject", description: "" },
    ],
    reasons: [
      {
        id: "r1",
        title: "Looks like a report",
        detail: "d",
        partId: "a",
        confidence: 90,
      },
    ],
  };
  const part = (over: Partial<ReviewPart>): ReviewPart => ({
    id: "a",
    label: "Category",
    kind: "classification",
    proposed: "Reporting",
    value: "Reporting",
    looked: false,
    why: null,
    note: "",
    ...over,
  });

  it("keeps the proposal as the model's and records an override as the reviewer's", () => {
    vi.spyOn(Date, "now").mockReturnValue(BASE + 5000);
    const payload = buildPayload({
      spec,
      parts: [
        part({}),
        part({
          id: "b",
          label: "Priority",
          proposed: "Normal",
          value: "High",
          looked: true,
          why: "Deadline is close",
        }),
      ],
      outcome: "Reject",
      outcomeWhy: { why: "Other", note: "Duplicate of an open ticket" },
      log: [],
      reviewerId: "reviewer-1",
      startedAt: BASE,
    });

    expect(payload.fields).toEqual([
      {
        id: "a",
        label: "Category",
        kind: "classification",
        byDecision: { Confirm: "Reporting" },
        value: "Reporting",
        setBy: "model",
      },
      {
        id: "b",
        label: "Priority",
        kind: "classification",
        byDecision: { Confirm: "Normal" },
        value: "High",
        setBy: "reviewer",
      },
    ]);
    expect(payload.changes).toEqual([
      "Decision: Confirm → Reject (Rejected)",
      "Field · Priority: Normal → High (Rewritten)",
    ]);
    expect(payload.record.map((r) => [r.part, r.source, r.howMuch])).toEqual([
      ["Decision", "Agent", "Rejected"],
      ["Field: Category", "Agent", "Untouched"],
      ["Field: Priority", "Reviewer", "Rewritten"],
    ]);
    expect(payload.reasons.map((r) => [r.id, r.weight, r.added])).toEqual([
      ["r1", "High", undefined],
      ["why-b", "High", true],
      ["why-outcome", "High", true],
    ]);
    expect(payload.reasons[0]).toMatchObject({
      proposedWeight: "High",
      sourceConfidence: 90,
    });
    expect(payload.reasons[2].title).toBe("Duplicate of an open ticket");
    expect(payload.timeOnTaskSeconds).toBe(5);
  });

  it("sets a model reason aside when its part is overridden", () => {
    const payload = buildPayload({
      spec,
      parts: [part({ value: "Access" })],
      outcome: "Confirm",
      outcomeWhy: { why: null, note: "" },
      log: [],
      reviewerId: "",
      startedAt: Date.now(),
    });

    expect(payload.reasons[0].weight).toBe("Not relevant");
    expect(payload.decidingReasons).toEqual([]);
    expect(payload.rationaleText).toBe("Confirm. Corrected: Category.");
  });

  it("returns no decision before an outcome is chosen", () => {
    const payload = buildPayload({
      spec,
      parts: [part({})],
      outcome: null,
      outcomeWhy: { why: null, note: "" },
      log: [],
      reviewerId: "",
      startedAt: Date.now(),
    });

    expect(payload.decision).toBeNull();
    expect(payload.rationaleText).toBe("");
    expect(payload.record[0]).toMatchObject({
      submitted: "—",
      howMuch: "Untouched",
    });
  });
});

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
