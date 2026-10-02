import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCaptureInline } from "../DecisionCaptureInline";
import { DecisionModel, DecisionSource } from "../models";

const baseModel: DecisionModel = {
  taskId: "t1",
  proposedOutcome: "Approve",
  proposalConfidence: 80,
  outcomes: [{ name: "Approve" }, { name: "Deny" }],
  evidence: [
    {
      id: "e1",
      title: "Reason one",
      supports: "Approve",
      weight: "High",
    },
  ],
  rationaleOptions: ["Within warranty"],
  instructionOptions: ["Deny when the receipt is missing."],
};

function sourceWith(model: DecisionModel): DecisionSource {
  return { getDecision: vi.fn().mockResolvedValue(model) };
}

describe("DecisionCaptureInline", () => {
  it("renders the proposal and confidence on one line, collapsed by default", async () => {
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    expect(await screen.findByText("Approve")).toBeInTheDocument();
    expect(screen.getByText("80%")).toBeInTheDocument();
    expect(screen.queryByText("Reason one")).not.toBeInTheDocument();
  });

  it("expands the decision, reasons, rationale and action button in place on click", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));

    expect(screen.getByText("Reason one")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Within warranty" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Agree · Approve/ }),
    ).toBeInTheDocument();
  });

  it("agrees in one click with the unchanged task data", async () => {
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
    await user.click(screen.getByRole("button", { name: /^Agree · Approve/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete).toHaveBeenCalledWith("Approve", {
      evidence: baseModel.evidence,
      rationale: [],
      instructionText: "",
      instructionScope: "this-task",
    });
  });

  it("disables Record decision after an override until a rationale chip and a lesson are picked", async () => {
    const user = userEvent.setup();
    render(
      <DecisionCaptureInline taskId="t1" source={sourceWith(baseModel)} />,
    );

    await screen.findByText("Approve");
    await user.click(screen.getByRole("button", { expanded: false }));
    await user.click(screen.getByRole("button", { name: /^Deny$/ }));
    expect(
      screen.getByRole("button", { name: /^Record decision/ }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Within warranty" }));
    await user.click(
      screen.getByRole("button", { name: /^Deny when the receipt/ }),
    );
    expect(
      screen.getByRole("button", { name: /^Record decision/ }),
    ).toBeEnabled();
  });
});
