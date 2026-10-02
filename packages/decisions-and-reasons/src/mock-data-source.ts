import { DecisionModel, DecisionSource } from "./models";

/** Fixture decision used by the widget's own default source, and by stories/demos. */
export const FIXTURE_DECISION: DecisionModel = {
  taskId: "task-fixture-1",
  title: "Warranty claim review",
  taskTitle: "Warranty claim review",
  taskType: "WarrantyClaim",
  priority: "High",
  isAgentRecommended: true,
  severity: "positive",
  confidenceScore: 87,
  evidence: [
    {
      id: "evidence-1",
      title: "Purchase within warranty window",
      description:
        "Invoice dated 2026-02-14, 7 months before the claim date; warranty covers 12 months.",
      tags: ["Fieldlink", "WT-9"],
      supports: "approve",
      relevance: "high",
      decision: "approve",
    },
    {
      id: "evidence-2",
      title: "Reported defect matches known issue",
      description:
        "Compressor failure matches batch recall 2026-Q1 for this model.",
      tags: ["Parts $3,980.00"],
      supports: "approve",
      relevance: "high",
      decision: "approve",
    },
    {
      id: "evidence-3",
      title: "Prior claim on the same unit",
      description: "One earlier claim six months ago for an unrelated part.",
      tags: [],
      supports: "deny",
      relevance: "low",
      decision: "approve",
    },
  ],
  amount: {
    total: 3980,
    refund: 3980,
    paidByCustomer: 0,
    ceiling: 5000,
    breakdown: [{ label: "Parts", value: 3980 }],
  },
  rationale: {
    text: "",
    version: "v1",
    lastEditedAt: null,
  },
  resolutionOptions: [
    {
      id: "approve-full",
      label: "Approve full refund",
      description: "Refund the full claimed amount.",
    },
    {
      id: "approve-partial",
      label: "Approve partial refund",
      description: "Refund parts only, exclude labor.",
    },
    {
      id: "deny",
      label: "Deny claim",
      description: "Claim does not meet warranty terms.",
    },
  ],
  agentRecommendedResolutionId: "approve-full",
};

/** Fixture source: resolves the same decision for any taskId after a short delay, like a real fetch. */
export class MockDecisionSource implements DecisionSource {
  constructor(private readonly model: DecisionModel = FIXTURE_DECISION) {}

  async getDecision(taskId: string): Promise<DecisionModel> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { ...this.model, taskId };
  }
}
