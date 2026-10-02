import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCapture } from "../DecisionCapture";
import { DecisionModel, DecisionSource } from "../models";

const baseModel: DecisionModel = {
  taskId: "t1",
  title: "Claim review",
  agentRecommendedOutcome: "Approve",
  confidenceScore: 80,
  outcomes: [{ name: "Approve" }, { name: "Deny" }],
  fields: [
    {
      key: "priority",
      label: "Priority",
      type: "select",
      value: "High",
      options: ["High", "Normal", "Low"],
    },
    { key: "refund", label: "Refund amount", type: "number", value: 100 },
  ],
  evidence: [
    {
      id: "e1",
      title: "Reason one",
      description: "desc one",
      tags: ["tag-a"],
      supports: "Approve",
      relevance: "high",
      verdict: "Approve",
    },
    {
      id: "e2",
      title: "Reason two",
      supports: "Deny",
      relevance: "medium",
      verdict: "Approve",
    },
  ],
  rationaleSuggestion: "Within the warranty window",
};

function sourceWith(model: DecisionModel): DecisionSource {
  return { getDecision: vi.fn().mockResolvedValue(model) };
}

function renderCapture(onComplete = vi.fn(), model: DecisionModel = baseModel) {
  render(
    <DecisionCapture
      taskId="t1"
      source={sourceWith(model)}
      onComplete={onComplete}
    />,
  );
  return onComplete;
}

describe("DecisionCapture", () => {
  it("renders the recommendation, confidence, fields and reasons once loaded", async () => {
    renderCapture();

    expect(
      (await screen.findAllByText("Agent recommended")).length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByText("80%").length).toBeGreaterThan(0);
    expect(screen.getByText("Reason one")).toBeInTheDocument();
    expect(screen.getByText("Reason two")).toBeInTheDocument();
    expect(screen.getByLabelText("Refund amount")).toHaveValue(100);
  });

  it("labels the rationale and instruction fields and prefills only the rationale", async () => {
    renderCapture();

    await screen.findByText("Reason one");
    expect(
      screen.getByLabelText("Why is this the right decision?"),
    ).toHaveValue("Within the warranty window");
    expect(
      screen.getByLabelText("What should the agent do next time?"),
    ).toHaveValue("");
  });

  it("badges the recommended outcome with its confidence and never pre-selects it", async () => {
    renderCapture();

    await screen.findByText("Reason one");
    expect(
      screen.getByRole("button", { name: /^Approve.*Recommended · 80%/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Deny/ })).not.toHaveTextContent(
      "Recommended",
    );
    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
  });

  it("disables every outcome until the rationale is non-empty", async () => {
    const user = userEvent.setup();
    renderCapture(vi.fn(), { ...baseModel, rationaleSuggestion: undefined });

    await screen.findByText("Reason one");
    expect(screen.getByRole("button", { name: /^Approve/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Deny/ })).toBeDisabled();

    await user.type(
      screen.getByLabelText("Why is this the right decision?"),
      "Because",
    );
    expect(screen.getByRole("button", { name: /^Approve/ })).toBeEnabled();
  });

  it("completes the recommended outcome with every proposed value unchanged and no added keys", async () => {
    const user = userEvent.setup();
    const onComplete = renderCapture();

    await screen.findByText("Reason one");
    await user.click(screen.getByRole("button", { name: /^Approve/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const [outcome, data] = onComplete.mock.calls[0];
    expect(outcome).toBe("Approve");
    expect(data).toStrictEqual({
      priority: "High",
      refund: 100,
      evidence: baseModel.evidence,
      rationaleText: "Within the warranty window",
      instructionText: "",
    });
  });

  it("requires an instruction to choose an outcome other than the recommendation", async () => {
    const user = userEvent.setup();
    const onComplete = renderCapture();

    await screen.findByText("Reason one");
    expect(screen.getByRole("button", { name: /^Approve/ })).toBeEnabled();
    expect(screen.getByRole("button", { name: /^Deny/ })).toBeDisabled();

    await user.type(
      screen.getByLabelText("What should the agent do next time?"),
      "Deny when the receipt is missing",
    );
    await user.click(screen.getByRole("button", { name: /^Deny/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toBe("Deny");
    expect(onComplete.mock.calls[0][1]).toMatchObject({
      instructionText: "Deny when the receipt is missing",
    });
  });

  it("shows the agent's value under a changed field and then requires an instruction", async () => {
    const user = userEvent.setup();
    const onComplete = renderCapture();

    await screen.findByText("Reason one");
    expect(screen.queryByText(/Agent proposed/)).not.toBeInTheDocument();

    const refund = screen.getByLabelText("Refund amount");
    await user.clear(refund);
    await user.type(refund, "80");

    expect(screen.getByText("Agent proposed: 100")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Approve/ })).toBeDisabled();

    await user.type(
      screen.getByLabelText("What should the agent do next time?"),
      "Refund parts only",
    );
    await user.click(screen.getByRole("button", { name: /^Approve/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][1]).toMatchObject({ refund: 80 });
  });

  it("hides the use-case fields section when the task has none", async () => {
    renderCapture(vi.fn(), { ...baseModel, fields: [] });

    await screen.findByText("Reason one");
    expect(screen.queryByLabelText("Refund amount")).not.toBeInTheDocument();
  });
});
