import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCapture } from "../DecisionCapture";
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
      description: "desc one",
      tags: [],
      supports: "approve",
      relevance: "high",
      decision: "approve",
    },
    {
      id: "e2",
      title: "Reason two",
      description: "",
      tags: [],
      supports: "approve",
      relevance: "medium",
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

describe("DecisionCapture", () => {
  it("renders the recommendation, confidence and evidence once loaded", async () => {
    render(
      <DecisionCapture
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
      />,
    );

    expect(
      (await screen.findAllByText("Agent recommended")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.getByText("Reason one")).toBeInTheDocument();
    expect(screen.getByText("Reason two")).toBeInTheDocument();
  });

  it("disables Submit until a resolution is selected", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCapture
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
      />,
    );

    await screen.findByText("Reason one");
    expect(screen.getByRole("button", { name: /Submit/ })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: /Approve/ }));
    expect(screen.getByRole("button", { name: /Submit/ })).toBeEnabled();
  });

  it("calls onSubmitted with the selected resolution and evidence", async () => {
    const user = userEvent.setup();
    const onSubmitted = vi.fn();
    render(
      <DecisionCapture
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
        onSubmitted={onSubmitted}
      />,
    );

    await screen.findByText("Reason one");
    await user.click(screen.getByRole("radio", { name: /Deny/ }));
    await user.click(screen.getByRole("button", { name: /Submit/ }));

    await waitFor(() => expect(onSubmitted).toHaveBeenCalledTimes(1));
    expect(onSubmitted.mock.calls[0][0]).toMatchObject({
      taskId: "t1",
      selectedResolutionId: "deny",
      capturedBy: "human:tester",
    });
  });

  it("does not render the amount card when the task has no amount", async () => {
    const noAmountModel: DecisionModel = {
      ...baseModel,
      amount: { total: 0, refund: 0, paidByCustomer: 0, ceiling: 0 },
    };
    render(
      <DecisionCapture
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(noAmountModel)}
      />,
    );

    await screen.findByText("Reason one");
    expect(screen.queryByText("Amount")).not.toBeInTheDocument();
  });

  it("hides the Signals tab when showSignals is false", async () => {
    render(
      <DecisionCapture
        taskId="t1"
        capturedBy="human:tester"
        source={sourceWith(baseModel)}
        showSignals={false}
      />,
    );

    await screen.findByText("Reason one");
    expect(
      screen.queryByRole("tab", { name: "Signals" }),
    ).not.toBeInTheDocument();
  });
});
