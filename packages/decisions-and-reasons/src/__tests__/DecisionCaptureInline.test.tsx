import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCaptureInline } from "../DecisionCaptureInline";
import { DecisionModel, DecisionSource } from "../models";

const baseModel: DecisionModel = {
  taskId: "t1",
  title: "Claim review",
  isAgentRecommended: true,
  severity: "positive",
  confidenceScore: 80,
  evidence: [
    {
      id: "e1",
      title: "Reason one",
      description: "",
      tags: [],
      supports: "approve",
      relevance: "high",
      decision: "approve",
    },
  ],
  amount: { total: 100, refund: 100, paidByCustomer: 0, ceiling: 200 },
  rationale: { text: "", version: "v1", lastEditedAt: null },
  resolutionOptions: [
    { id: "approve", label: "Approve", description: "" },
    { id: "deny", label: "Deny", description: "" },
  ],
  agentRecommendedResolutionId: "approve",
};

function sourceWith(model: DecisionModel): DecisionSource {
  return { getDecision: vi.fn().mockResolvedValue(model) };
}

describe("DecisionCaptureInline", () => {
  it("renders the recommendation and confidence on one line, collapsed by default", async () => {
    render(
      <DecisionCaptureInline
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
      />,
    );

    expect(await screen.findByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.queryByText("Reason one")).not.toBeInTheDocument();
  });

  it("expands the evidence and resolution choice in place on click", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCaptureInline
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
      />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("Reason one")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Approve/ })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Deny/ })).toBeInTheDocument();
  });

  it("calls onSubmitted once a resolution is picked and submitted", async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    render(
      <DecisionCaptureInline
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
        onSubmitted={onSubmitted}
      />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(screen.getByRole("radio", { name: /Deny/ }));
    await user.click(screen.getByRole("button", { name: /Submit/ }));

    expect(onSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({ taskId: "t1", selectedResolutionId: "deny" }),
    );
  });
});
