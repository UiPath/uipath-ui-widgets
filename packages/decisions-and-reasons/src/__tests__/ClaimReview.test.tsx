import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ClaimReview } from "../ClaimReview";
import { FIXTURE_CLAIM } from "../claim-review-fixture";

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  const onChange = vi.fn();
  render(
    <ClaimReview
      data={FIXTURE_CLAIM}
      onComplete={onComplete}
      onChange={onChange}
      {...props}
    />,
  );
  return { onComplete, onChange, user: userEvent.setup() };
}

describe("ClaimReview", () => {
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
    expect(screen.getAllByRole("textbox")[0]).toHaveValue("5000");

    await user.clear(screen.getAllByRole("textbox")[0]);
    await user.type(screen.getAllByRole("textbox")[0], "4800");
    await user.tab();
    await user.click(screen.getByRole("button", { name: /^Deny/ }));

    expect(screen.getAllByRole("textbox")[0]).toHaveValue("4800");
    expect(screen.getByText("Proposed: 0")).toBeInTheDocument();
  });

  it("never blocks Complete on the optional why for a Not relevant reason", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getAllByRole("button", { name: /High/ })[1]);
    await user.click(screen.getByRole("button", { name: /Not relevant/ }));

    expect(screen.getByText("Why is it not relevant?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [, payload] = onComplete.mock.calls[0];
    const reason = payload.reasons.find((r: { id: string }) => r.id === "r2");
    expect(reason.weight).toBe("Not relevant");
    expect(reason).not.toHaveProperty("notRelevantWhy");
  });

  it("composes the rationale from the weighted reasons and the decision", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: /^Approve in full/ }));

    expect(
      screen.getByText(
        /Decided by: A manufacturing defect caused the seal failure/,
      ),
    ).toBeInTheDocument();
  });

  it("records how much each part changed and whether it was looked at", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getAllByRole("button", { name: /High/ })[0]);
    await user.click(screen.getAllByRole("button", { name: /^Low/ })[0]);
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

  it("keeps the record drawer closed until it is opened", async () => {
    const { user } = setup();

    expect(screen.queryByText("How much it changed")).not.toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /What gets recorded/ }),
    );
    expect(screen.getByText("How much it changed")).toBeInTheDocument();
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
