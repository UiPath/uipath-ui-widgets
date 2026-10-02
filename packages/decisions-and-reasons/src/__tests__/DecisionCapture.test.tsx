import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCapture } from "../DecisionCapture";
import { DecisionModel, DecisionSource } from "../models";

const baseModel: DecisionModel = {
  taskId: "t1",
  proposedOutcome: "Approve",
  proposalConfidence: 80,
  outcomes: [
    { name: "Approve", description: "Refund the claim." },
    { name: "Deny" },
  ],
  evidence: [
    {
      id: "e1",
      title: "Reason one",
      description: "desc one",
      supports: "Approve",
      weight: "High",
    },
    {
      id: "e2",
      title: "Reason two",
      supports: "Deny",
      weight: "Medium",
      extra: { kept: true },
    },
  ],
  rationaleOptions: ["Within warranty", "Known defect"],
  instructionOptions: ["Deny when the receipt is missing."],
};

function sourceWith(model: DecisionModel): DecisionSource {
  return { getDecision: vi.fn().mockResolvedValue(model) };
}

async function renderCapture(
  model: DecisionModel = baseModel,
  onComplete = vi.fn(),
) {
  const user = userEvent.setup();
  render(
    <DecisionCapture
      taskId="t1"
      source={sourceWith(model)}
      onComplete={onComplete}
    />,
  );
  await screen.findByText("Reason one");
  return { user, onComplete };
}

async function setWeight(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
  weight: string,
) {
  await user.click(
    screen.getByRole("button", { name: new RegExp(`^Weight of ${title}`) }),
  );
  await user.click(await screen.findByRole("menuitem", { name: weight }));
}

describe("DecisionCapture", () => {
  it("renders one card per outcome with the proposed one badged and nothing pre-selected", async () => {
    await renderCapture();

    expect(screen.getByText("Proposed · 80%")).toBeInTheDocument();
    expect(screen.getByText("No decision selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Approve/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: /^Deny$/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("agrees with the proposal in one click and returns every reason untouched", async () => {
    const { user, onComplete } = await renderCapture();

    await user.click(screen.getByRole("button", { name: /^Agree · Approve/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const [outcome, data] = onComplete.mock.calls[0];
    expect(outcome).toBe("Approve");
    expect(data).toStrictEqual({
      evidence: baseModel.evidence,
      rationale: [],
      instructionText: "",
      instructionScope: "this-task",
    });
    expect(screen.getByText("Approve recorded")).toBeInTheDocument();
  });

  it("marks a picked proposal As proposed and a different one Override with the proposed value under it", async () => {
    const { user } = await renderCapture();

    await user.click(screen.getByRole("button", { name: /^Approve/ }));
    expect(screen.getByText("As proposed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Deny$/ }));
    expect(screen.getByText("Override")).toBeInTheDocument();
    expect(screen.getByText("Proposed: Approve")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^Record decision/ }),
    ).toBeDisabled();
  });

  it("names what is missing and enables Record decision once all of it is picked", async () => {
    const { user, onComplete } = await renderCapture();

    await user.click(screen.getByRole("button", { name: /^Deny$/ }));
    expect(
      screen.getByText("Missing: a rationale chip, a lesson."),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Within warranty" }));
    await user.click(
      screen.getByRole("button", { name: /^Deny when the receipt/ }),
    );
    const record = screen.getByRole("button", { name: /^Record decision/ });
    expect(record).toBeEnabled();

    await user.click(record);
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][0]).toBe("Deny");
    expect(onComplete.mock.calls[0][1]).toMatchObject({
      rationale: ["Within warranty"],
      instructionText: "Deny when the receipt is missing.",
      instructionScope: "this-task",
    });
  });

  it("reveals Why is it not relevant inline, requires a why, and records weight and why on the item only", async () => {
    const { user, onComplete } = await renderCapture();

    await setWeight(user, "Reason one", "Not relevant");
    expect(screen.getByText("Why is it not relevant?")).toBeInTheDocument();
    expect(screen.getByText("Proposed: High")).toBeInTheDocument();
    expect(
      screen.getByText(/a why for 1 not relevant reason/),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Outdated" }));
    expect(
      screen.getAllByText("Not relevant · Outdated").length,
    ).toBeGreaterThan(1);

    await user.click(screen.getByRole("button", { name: /^Approve/ }));
    await user.click(screen.getByRole("button", { name: "Known defect" }));
    await user.click(
      screen.getByRole("button", { name: /^Deny when the receipt/ }),
    );
    await user.click(screen.getByRole("button", { name: /^Record decision/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    const data = onComplete.mock.calls[0][1];
    expect(data.evidence[0]).toStrictEqual({
      ...baseModel.evidence![0],
      weight: "Not relevant",
      notRelevantWhy: "Outdated",
    });
    expect(data.evidence[1]).toBe(baseModel.evidence![1]);
  });

  it("opens a note for Other and returns it as notRelevantNote", async () => {
    const { user, onComplete } = await renderCapture();

    await setWeight(user, "Reason two", "Not relevant");
    await user.click(screen.getByRole("radio", { name: "Other" }));
    await user.type(
      screen.getByLabelText("What is off about Reason two"),
      "Contradicts the invoice",
    );
    await user.click(screen.getByRole("button", { name: /^Approve/ }));
    await user.click(screen.getByRole("button", { name: "Known defect" }));
    await user.click(
      screen.getByRole("button", { name: /^Deny when the receipt/ }),
    );
    await user.click(screen.getByRole("button", { name: /^Record decision/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][1].evidence[1]).toMatchObject({
      weight: "Not relevant",
      notRelevantWhy: "Other",
      notRelevantNote: "Contradicts the invoice",
      extra: { kept: true },
    });
  });

  it("lists each change in the What changed rail and returns an item to the proposal when reverted", async () => {
    const { user } = await renderCapture();
    expect(
      screen.getByText(/as the process proposed them/),
    ).toBeInTheDocument();

    await setWeight(user, "Reason one", "Low");
    expect(screen.getByText("Reason")).toBeInTheDocument();
    expect(screen.getByText("Proposed: High")).toBeInTheDocument();

    await setWeight(user, "Reason one", "High");
    expect(
      screen.getByText(/as the process proposed them/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Proposed:/)).not.toBeInTheDocument();
  });

  it("adds an own rationale chip as picked", async () => {
    const { user } = await renderCapture();

    await user.type(screen.getByLabelText("Add your own"), "Seen this before");
    await user.click(screen.getByRole("button", { name: "Add" }));

    expect(
      screen.getByRole("button", { name: "Seen this before" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("returns the lesson scope the reviewer chose", async () => {
    const { user, onComplete } = await renderCapture();

    await user.click(screen.getByRole("button", { name: /^Deny$/ }));
    await user.click(screen.getByRole("button", { name: "Within warranty" }));
    await user.click(
      screen.getByRole("button", { name: /^Deny when the receipt/ }),
    );
    await user.click(screen.getByRole("radio", { name: "All tasks" }));
    await user.click(screen.getByRole("button", { name: /^Record decision/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][1]).toMatchObject({
      instructionScope: "all-tasks",
    });
  });

  it("renders empty states and completes without an evidence key when the task sent no reasons", async () => {
    const onComplete = vi.fn();
    const user = userEvent.setup();
    render(
      <DecisionCapture
        taskId="t1"
        source={sourceWith({
          taskId: "t1",
          proposedOutcome: "Approve",
          outcomes: [{ name: "Approve" }, { name: "Deny" }],
        })}
        onComplete={onComplete}
      />,
    );

    expect(
      await screen.findByText("No reasons were sent with this task."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Agree · Approve/ }));

    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    expect(onComplete.mock.calls[0][1]).toStrictEqual({
      rationale: [],
      instructionText: "",
      instructionScope: "this-task",
    });
  });

  it("shows saved values read-only for a completed task and never completes", async () => {
    const onComplete = vi.fn();
    render(
      <DecisionCapture
        taskId="t1"
        source={sourceWith({
          ...baseModel,
          completedOutcome: "Deny",
          rationale: ["Within warranty"],
        })}
        onComplete={onComplete}
      />,
    );

    expect(await screen.findByText("Deny recorded")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Filed/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^Deny$/ })).toBeDisabled();
    expect(onComplete).not.toHaveBeenCalled();
  });
});
