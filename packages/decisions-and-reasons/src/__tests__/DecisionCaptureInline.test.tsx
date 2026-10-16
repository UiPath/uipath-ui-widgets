import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCaptureInline } from "../DecisionCaptureInline";
import { DecisionModel, DecisionSource } from "../models";

const baseModel: DecisionModel = {
  taskId: "t1",
  title: "Claim review",
  agentRecommendedOutcome: "Approve",
  confidenceScore: 80,
  outcomes: [{ name: "Approve" }, { name: "Deny" }],
  fields: [
    { key: "refund", label: "Refund amount", type: "number", value: 100 },
  ],
  evidence: [
    {
      id: "e1",
      title: "Reason one",
      supports: "Approve",
      relevance: "high",
      verdict: "Approve",
    },
  ],
  rationaleSuggestion: "Within the warranty window",
};

function sourceWith(model: DecisionModel): DecisionSource {
  return { getDecision: vi.fn().mockResolvedValue(model) };
}

describe("DecisionCaptureInline", () => {
  it("renders the recommendation and confidence on one line, collapsed by default", async () => {
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    expect(await screen.findByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.queryByText("Reason one")).not.toBeInTheDocument();
  });

  it("expands the values, reasons, rationale, instruction and outcomes in place on click", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("Reason one")).toBeInTheDocument();
    expect(screen.getByLabelText("Refund amount")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Why is this the right decision?"),
    ).toHaveValue("Within the warranty window");
    expect(
      screen.getByLabelText("What should the agent do next time?"),
    ).toHaveValue("");
    expect(screen.getByRole("button", { name: /^Deny/ })).toBeInTheDocument();
  });

  it("completes with the clicked outcome name and the unchanged task data", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(
      <DecisionCaptureInline
        taskId="t1"
        source={sourceWith(baseModel)}
        onComplete={onComplete}
      />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(
      screen.getByRole("button", { name: /^Approve.*Recommended/ }),
    );

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete).toHaveBeenCalledWith("Approve", {
      refund: 100,
      evidence: baseModel.evidence,
      rationaleText: "Within the warranty window",
      instructionText: "",
    });
  });

  it("disables a non-recommended outcome until an instruction is written", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByRole("button", { name: /^Deny/ })).toBeDisabled();

    await user.type(
      screen.getByLabelText("What should the agent do next time?"),
      "Deny when the receipt is missing",
    );
    expect(screen.getByRole("button", { name: /^Deny/ })).toBeEnabled();
  });
});
