import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DecisionCaptureCodedActionApp } from "../DecisionCaptureCodedActionApp";
import { FIXTURE_CLAIM } from "../claim-review-fixture";

const BASE = 1_760_000_000_000;

describe("DecisionCaptureCodedActionApp outputs", () => {
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
      <DecisionCaptureCodedActionApp
        data={FIXTURE_CLAIM}
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

    expect({
      onChange: onChange.mock.calls.map(([payload]) => payload),
      onComplete: onComplete.mock.calls,
    }).toMatchSnapshot();
  });

  it("returns the same payload for an untouched recommended decision", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <DecisionCaptureCodedActionApp
        data={FIXTURE_CLAIM}
        onComplete={onComplete}
      />,
    );

    now += 12_000;
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    expect(onComplete.mock.calls).toMatchSnapshot();
  });
});
