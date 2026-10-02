import { DecisionModel, DecisionSource } from "./models";

/** Fixture decision used by the widget's own default source, and by stories/demos. */
export const FIXTURE_DECISION: DecisionModel = {
  taskId: "task-fixture-1",
  proposedOutcome: "Route",
  proposalConfidence: 82,
  outcomes: [
    {
      name: "Answer",
      description: "Reply in the thread with an answer or a docs link.",
    },
    {
      name: "Route",
      description: "Send it to the owning team's queue.",
    },
    {
      name: "Close",
      description: "Nothing to act on. Close without a reply.",
    },
  ],
  evidence: [
    {
      id: "r1",
      title: "Packaging team owns the topic",
      description:
        "The linked thread is in #packaging-help, which the Packaging team owns.",
      supports: "Route",
      weight: "High",
    },
    {
      id: "r2",
      title: "The post is only a cross-post link",
      description:
        "The body is one link to another channel, with no text of its own.",
      supports: "Close",
      weight: "Medium",
    },
    {
      id: "r3",
      title: "No question is asked",
      description: "There is no question or request in the post.",
      supports: "Close",
      weight: "Low",
    },
    {
      id: "r4",
      title: "A docs page covers stuck uploads",
      description:
        '"Publishing packages › Upload troubleshooting" covers the 99% stall.',
      supports: "Answer",
      weight: "Medium",
    },
  ],
  rationaleOptions: [
    "Link-only cross-post",
    "No question to answer",
    "Discussion is already happening elsewhere",
    "Owner team is already in the thread",
    "Docs already cover it",
  ],
  instructionOptions: [
    "When a post in a help channel is only a link to another channel, close it instead of routing it.",
    "Stop treating a cross-post as a request for the owning team unless the post adds its own question.",
  ],
};

/** Fixture source: resolves the same decision for any taskId after a short delay, like a real fetch. */
export class MockDecisionSource implements DecisionSource {
  constructor(private readonly model: DecisionModel = FIXTURE_DECISION) {}

  async getDecision(taskId: string): Promise<DecisionModel> {
    await new Promise((resolve) => setTimeout(resolve, 0));
    return { ...this.model, taskId };
  }
}
