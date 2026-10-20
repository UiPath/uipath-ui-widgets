import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCaptureCodedActionApp } from "../DecisionCaptureCodedActionApp";
import { FIXTURE_CLAIM } from "../claim-review-fixture";

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  const onChange = vi.fn();
  render(
    <DecisionCaptureCodedActionApp
      data={FIXTURE_CLAIM}
      onComplete={onComplete}
      onChange={onChange}
      {...props}
    />,
  );
  return { onComplete, onChange, user: userEvent.setup() };
}

describe("DecisionCaptureCodedActionApp", () => {
  it("opens with nothing selected and Complete disabled", () => {
    setup();

    expect(screen.getByText("No decision selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled();
    expect(screen.getAllByText("Recommended").length).toBeGreaterThan(0);
  });

  it("completes as the recommended decision with the final details of that decision", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [decision, payload] = onComplete.mock.calls[0];
    expect(decision).toBe("Deny");
    expect(payload.fields.map((f: { value: string }) => f.value)[0]).toBe("0");
    expect(payload.decidingReasons).toEqual(["r2"]);
  });

  it("re-fills the final details when the decision changes and keeps an edited value", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    expect(screen.getByLabelText("Approved amount")).toHaveValue("5000");

    await user.clear(screen.getByLabelText("Approved amount"));
    await user.type(screen.getByLabelText("Approved amount"), "4800");
    await user.tab();
    await user.click(screen.getByRole("button", { name: /^Deny/ }));

    expect(screen.getByLabelText("Approved amount")).toHaveValue("4800");
    expect(screen.getByText("Proposed: 0")).toBeInTheDocument();
  });

  it("never blocks Complete on the optional why for a Not relevant reason", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getAllByRole("button", { name: /High/ })[1]);
    await user.click(screen.getByRole("menuitem", { name: /Not relevant/ }));

    expect(screen.getByText("Why is it not relevant?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [, payload] = onComplete.mock.calls[0];
    const reason = payload.reasons.find((r: { id: string }) => r.id === "r2");
    expect(reason.weight).toBe("Not relevant");
    expect(reason).not.toHaveProperty("notRelevantWhy");
  });

  it("has no separate rationale section and returns generated rationale text", async () => {
    const { onComplete, user } = setup();

    expect(screen.queryByText("Rationale")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Add a note")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^Approve in full/ }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Approve in full" }),
    );

    const [, payload] = onComplete.mock.calls[0];
    expect(payload.rationaleText).toMatch(
      /Decided by: A manufacturing defect caused the seal failure/,
    );
  });

  it("adds a reviewer reason at High, records it as Added and lets it be removed", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: "+ Add a reason" }));
    await user.type(
      screen.getByPlaceholderText("One line: what is the reason"),
      "Clean claims history",
    );
    await user.click(screen.getByRole("button", { name: "Add reason" }));

    expect(screen.getByText("Clean claims history")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("Clean claims history")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "+ Add a reason" }));
    await user.type(
      screen.getByPlaceholderText("One line: what is the reason"),
      "Clean claims history",
    );
    await user.click(screen.getByRole("button", { name: "Add reason" }));
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [, payload] = onComplete.mock.calls[0];
    const added = payload.reasons.find(
      (r: { title: string }) => r.title === "Clean claims history",
    );
    expect(added).toMatchObject({
      added: true,
      weight: "High",
      source: "Reviewer",
    });
    expect(payload.decidingReasons).toContain(added.id);
    expect(
      payload.record.find((r: { part: string }) =>
        r.part.startsWith("Reason: Clean"),
      ),
    ).toMatchObject({ howMuch: "Added", source: "Reviewer", lookedAt: true });
    expect(
      payload.record.find((r: { part: string }) => r.part === "Rationale"),
    ).toBeUndefined();
  });

  it("records how much each part changed and whether it was looked at", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    await user.click(screen.getByRole("menuitem", { name: /^Low/ }));
    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Approve partial" }),
    );

    const [, payload] = onComplete.mock.calls[0];
    const row = (part: string) =>
      payload.record.find((r: { part: string }) => r.part.startsWith(part));
    expect(row("Decision")).toMatchObject({
      howMuch: "Rejected",
      lookedAt: true,
    });
    expect(row("Reason: A manufacturing")).toMatchObject({
      howMuch: "Rewritten",
      lookedAt: true,
    });
    expect(row("Reason: No earlier")).toMatchObject({
      howMuch: "Untouched",
      lookedAt: false,
    });
    expect(payload.changeLog.length).toBeGreaterThan(1);
    expect(payload).toHaveProperty("timeOnTaskSeconds");
  });

  it("does not render the record drawer by default but still returns the record", async () => {
    const { onComplete, user } = setup();

    expect(
      screen.queryByRole("button", { name: /What gets recorded/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    expect(onComplete.mock.calls[0][1].record.length).toBeGreaterThan(0);
  });

  it("shows the record drawer closed until it is opened when showRecord is set", async () => {
    const { user } = setup({ showRecord: true });

    expect(screen.queryByText("How much it changed")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /What gets recorded/ }),
    );
    expect(screen.getByText("How much it changed")).toBeInTheDocument();
  });

  it("offers Next time once the decision differs and returns its scope and conditions", async () => {
    const { onComplete, user } = setup();

    expect(screen.queryByText("Next time")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    await user.click(screen.getByRole("button", { name: /^When a covered/ }));
    await user.click(screen.getByRole("button", { name: /have a lab report/ }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Approve partial" }),
    );

    const [, payload] = onComplete.mock.calls[0];
    expect(payload).toMatchObject({
      nextTimeId: "l1",
      nextTimeScope: "similar-claims",
      nextTimeConditions: [
        "are above the plan ceiling",
        "have two causes",
        "have a lab report",
      ],
    });
  });

  it("returns the all-claims scope without conditions when Always is picked", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    await user.click(screen.getByRole("button", { name: /^When a covered/ }));
    await user.click(screen.getByRole("radio", { name: "Always" }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Approve partial" }),
    );

    expect(onComplete.mock.calls[0][1]).toMatchObject({
      nextTimeScope: "all-claims",
      nextTimeConditions: [],
    });
  });

  it("shows an inline error and stays open when onComplete rejects", async () => {
    const { onComplete, user } = setup();
    onComplete.mockRejectedValueOnce(new Error("Service unavailable"));

    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    expect(await screen.findByText("Service unavailable")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Complete as Deny" }),
    ).toBeEnabled();
    expect(screen.queryByText("Completed as Deny")).not.toBeInTheDocument();
  });

  it("lists the order of changes and what the reviewer looked at in the record drawer", async () => {
    const { user } = setup({ showRecord: true, reviewerId: "reviewer-1" });

    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    await user.click(screen.getByRole("menuitem", { name: /^Low/ }));
    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    await user.click(screen.getByRole("button", { name: /^When a covered/ }));
    await user.click(screen.getByRole("radio", { name: "Always" }));
    await user.click(
      screen.getByRole("button", { name: /What gets recorded/ }),
    );

    expect(screen.getByText("reviewer-1")).toBeInTheDocument();
    const order = screen.getByText(/Reason weight:/).closest("ol");
    expect(order).toHaveTextContent("Decision: Approve partial");
    expect(order).toHaveTextContent("Next time picked:");
    expect(order).toHaveTextContent("Scope: Always");
    expect(
      screen.getByRole("row", { name: /Reason: A manufacturing/ }),
    ).toHaveTextContent("Rewritten");
  });

  it("renders the saved decision read-only and never completes", () => {
    setup({
      readOnly: true,
      data: { ...FIXTURE_CLAIM, decision: "ApprovePartial" },
    });

    expect(
      screen.getByText("Completed as Approve partial"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Complete as/ }),
    ).not.toBeInTheDocument();
  });
});
