import { DecisionModel, DecisionSource } from "./models";

/** Fixture decision used by the widget's own default source, and by stories/demos. */
export const FIXTURE_DECISION: DecisionModel = {
  taskId: "task-fixture-1",
  title: "Warranty claim review",
  agentRecommendedOutcome: "Approve",
  confidenceScore: 87,
  outcomes: [
    { name: "Approve", description: "Refund the full claimed amount." },
    {
      name: "Approve partial",
      description: "Refund parts only, exclude labor.",
    },
    { name: "Deny", description: "Claim does not meet warranty terms." },
  ],
  fields: [
    {
      key: "priority",
      label: "Priority",
      type: "select",
      value: "High",
      options: ["High", "Normal", "Low"],
    },
    { key: "refund", label: "Refund amount", type: "number", value: 3980 },
  ],
  evidence: [
    {
      id: "evidence-1",
      title: "Purchase within warranty window",
      description:
        "Invoice dated 2026-02-14, 7 months before the claim date; warranty covers 12 months.",
      tags: ["Fieldlink", "WT-9"],
      supports: "Approve",
      relevance: "high",
      verdict: "Approve",
    },
    {
      id: "evidence-2",
      title: "Reported defect matches known issue",
      description:
        "Compressor failure matches batch recall 2026-Q1 for this model.",
      tags: ["Parts $3,980.00"],
      supports: "Approve",
      relevance: "high",
      verdict: "Approve",
    },
    {
      id: "evidence-3",
      title: "Prior claim on the same unit",
      description: "One earlier claim six months ago for an unrelated part.",
      tags: [],
      supports: "Deny",
      relevance: "low",
      verdict: "Approve",
    },
  ],
  instructionPlaceholder:
    "Route claims under $500 with a receipt straight to Approve",
};

/** Fixture source: resolves the same decision for any taskId after a short delay, like a real fetch. */
export class MockDecisionSource implements DecisionSource {
  constructor(private readonly model: DecisionModel = FIXTURE_DECISION) {}

  async getDecision(taskId: string): Promise<DecisionModel> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { ...this.model, taskId };
  }
}
