import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseAssessment } from "../components/CaseAssessment/CaseAssessment";
import { FIXTURE_CASE } from "../fixtures/caseAssessment";

const BASE = 1_760_000_000_000;

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  const onChange = vi.fn();
  render(
    <CaseAssessment
      {...FIXTURE_CASE}
      onComplete={onComplete}
      onChange={onChange}
      {...props}
    />,
  );
  return { onComplete, onChange, user: userEvent.setup() };
}

describe("CaseAssessment", () => {
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

    expect(
      screen.getByText("Why is it not relevant? Optional."),
    ).toBeInTheDocument();
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
      howMuch: "Changed",
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

  it("shows the record drawer closed until it is opened when show.record is set", async () => {
    const { user } = setup({ show: { record: true } });

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
    const { user } = setup({
      show: { record: true },
      reviewerId: "reviewer-1",
    });

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
    ).toHaveTextContent("Changed");
  });

  it("renders the saved decision read-only and never completes", () => {
    setup({
      readOnly: true,
      saved: { outcome: "ApprovePartial" },
    });

    expect(
      screen.getByText("Completed as Approve partial"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Complete as/ }),
    ).not.toBeInTheDocument();
  });
});

describe("intrinsic signals markup", () => {
  it("marks the outcomes, the recommendation and the weight menu items inside the root", async () => {
    const { container } = render(
      <CaseAssessment {...FIXTURE_CASE} onComplete={vi.fn()} />,
    );
    const user = userEvent.setup();

    expect(container.querySelectorAll("[data-signal-outcome]")).toHaveLength(3);
    expect(
      container.querySelectorAll("[data-signal-recommended]"),
    ).toHaveLength(1);
    expect(container.querySelector("[data-signal-evidence]")).not.toBeNull();
    expect(container.querySelector("[data-signal-add-factor]")).not.toBeNull();
    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    const item = screen.getAllByRole("menuitem")[0];
    expect(container).toContainElement(item);
    expect(item).toHaveAttribute("data-signal-field");
  });
});

describe("CaseAssessment outputs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the same onChange and onComplete payloads for a full review", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const tick = (seconds: number) => {
      now += seconds * 1000;
    };
    const onChange = vi.fn();
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <CaseAssessment
        {...FIXTURE_CASE}
        reviewerId="reviewer-1"
        onChange={onChange}
        onComplete={onComplete}
      />,
    );

    tick(3);
    await user.click(screen.getByRole("button", { name: /^Approve partial/ }));
    tick(4);
    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    await user.click(screen.getByRole("menuitem", { name: /^Low/ }));
    tick(5);
    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    await user.click(screen.getByRole("menuitem", { name: /Not relevant/ }));
    await user.click(screen.getByRole("button", { name: "Other" }));
    await user.type(
      screen.getByPlaceholderText("Say what is off about it"),
      "Photos are unclear",
    );
    tick(6);
    await user.click(screen.getByRole("button", { name: "+ Add a reason" }));
    await user.type(
      screen.getByPlaceholderText("One line: what is the reason"),
      "Clean claims history",
    );
    await user.click(screen.getByRole("button", { name: "Deny" }));
    await user.click(screen.getByRole("button", { name: "Add reason" }));
    tick(7);
    await user.clear(screen.getByLabelText("Approved amount"));
    await user.type(screen.getByLabelText("Approved amount"), "4800");
    await user.tab();
    await user.clear(screen.getByLabelText("Message to the customer"));
    await user.type(screen.getByLabelText("Message to the customer"), "Hello");
    await user.tab();
    tick(8);
    await user.click(screen.getByRole("button", { name: /^When a covered/ }));
    await user.click(screen.getByRole("button", { name: /have a lab report/ }));
    await user.click(screen.getByRole("radio", { name: "Always" }));
    await user.click(screen.getByRole("radio", { name: "Claims like this" }));
    tick(9);
    await user.click(
      screen.getByRole("button", { name: "Complete as Approve partial" }),
    );

    expect(onChange.mock.calls.length).toBeGreaterThan(0);
    expect(onChange.mock.calls[0][0]).toMatchObject({
      decision: "ApprovePartial",
      changes: [
        "Decision: Deny → Approve partial (Rejected · Counts for claims like this)",
      ],
      changeLog: [{ step: 1, what: "Decision: Approve partial" }],
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
    const [decision, payload] = onComplete.mock.calls[0];
    expect(decision).toBe("ApprovePartial");
    expect(payload).toMatchObject({
      decision: "ApprovePartial",
      decidingReasons: ["added-5-1760000018000"],
      rationaleText:
        "Approve partial. Decided by: Clean claims history. Set aside as not relevant: Water entered through an unsealed cable gland.",
      nextTimeId: "l1",
      nextTimeScope: "similar-claims",
      nextTimeText:
        "When a covered defect and an excluded cause occur together, approve the covered part.",
      nextTimeConditions: [
        "are above the plan ceiling",
        "have two causes",
        "have a lab report",
      ],
      reviewerId: "reviewer-1",
      timeOnTaskSeconds: 42,
      changes: [
        "Decision: Deny → Approve partial (Rejected · Counts for claims like this)",
        "Reason · Clean claims history: Added · High (Added)",
        "Reason · A manufacturing defect caused the seal failure: High → Low (Changed)",
        "Reason · Water entered through an unsealed cable gland: High → Not relevant · Photos are unclear (Rejected)",
        "Field · Approved amount: 0 → 4800 (Changed)",
        "Field · Message to the customer: We cannot approve this claim. The seal failure came from a m... → Hello (Changed)",
        "Next time: Applies to claims that are above the plan ceiling and have two causes and have a lab report (Kept)",
      ],
    });
    expect(payload.changeLog.map((e: { what: string }) => e.what)).toEqual([
      "Decision: Approve partial",
      "Reason weight: A manufacturing defect caused the seal failure, High → Low",
      "Reason weight: Water entered through an unsealed cable gland, High → Not relevant",
      "Why not relevant: Water entered through an unsealed cable gland, Other",
      "Reason added: Clean claims history, supports Deny",
      "Next time picked: When a covered defect and an excluded cause occur together, approve the covered part.",
      "Scope: Always",
      "Scope: Claims like this",
    ]);
    expect(
      payload.fields.map((f: { id: string; value: string }) => [f.id, f.value]),
    ).toEqual([
      ["approvedAmount", "4800"],
      ["goodwillAmount", "1500"],
      ["customerMessage", "Hello"],
    ]);
    expect(
      payload.reasons.map((r: { id: string; weight: string }) => [
        r.id,
        r.weight,
      ]),
    ).toEqual([
      ["r1", "Low"],
      ["r2", "Not relevant"],
      ["r3", "Medium"],
      ["r4", "Low"],
      ["added-5-1760000018000", "High"],
    ]);
    expect(payload.reasons[1]).toMatchObject({
      notRelevantWhy: "Other",
      notRelevantNote: "Photos are unclear",
    });
    expect(payload.reasons[4]).toMatchObject({
      added: true,
      source: "Reviewer",
    });
    expect(
      payload.record.map(
        (r: { part: string; howMuch: string; submitted: string }) => [
          r.part,
          r.howMuch,
          r.submitted,
        ],
      ),
    ).toEqual([
      ["Decision", "Rejected", "Approve partial"],
      [
        "Reason: A manufacturing defect caused the seal failure",
        "Changed",
        "Low",
      ],
      [
        "Reason: Water entered through an unsealed cable gland",
        "Rejected",
        "Not relevant · Photos are unclear",
      ],
      ["Reason: The claim is above the plan ceiling", "Untouched", "Medium"],
      ["Reason: No earlier claims in four years", "Untouched", "Low"],
      ["Reason: Clean claims history", "Added", "High"],
      ["Field: Approved amount", "Changed", "4800"],
      ["Field: Goodwill amount", "Changed", "1500"],
      ["Field: Message to the customer", "Changed", "Hello"],
      [
        "Next time",
        "Kept",
        "When a covered defect and an excluded cause occur together, approve the covered part.",
      ],
    ]);
  });

  it("returns the same payload for an untouched recommended decision", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<CaseAssessment {...FIXTURE_CASE} onComplete={onComplete} />);

    now += 12_000;
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [decision, payload] = onComplete.mock.calls[0];
    expect(decision).toBe("Deny");
    expect(payload).toMatchObject({
      decision: "Deny",
      changes: [],
      timeOnTaskSeconds: 12,
    });
    expect(payload.changeLog.map((e: { what: string }) => e.what)).toEqual([
      "Decision: Deny",
    ]);
    expect(
      payload.record.map((r: { part: string; howMuch: string }) => [
        r.part,
        r.howMuch,
      ]),
    ).toEqual([
      ["Decision", "Kept"],
      ["Reason: A manufacturing defect caused the seal failure", "Untouched"],
      ["Reason: Water entered through an unsealed cable gland", "Untouched"],
      ["Reason: The claim is above the plan ceiling", "Untouched"],
      ["Reason: No earlier claims in four years", "Untouched"],
      ["Field: Approved amount", "Untouched"],
      ["Field: Goodwill amount", "Untouched"],
      ["Field: Message to the customer", "Untouched"],
      ["Next time", "Untouched"],
    ]);
  });
});
