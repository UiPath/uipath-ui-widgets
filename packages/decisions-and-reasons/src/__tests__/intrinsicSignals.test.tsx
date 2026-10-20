import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DecisionCaptureCodedActionApp } from "../DecisionCaptureCodedActionApp";
import { FIXTURE_CLAIM } from "../claim-review-fixture";

describe("intrinsic signals markup", () => {
  it("marks the outcomes, the recommendation and the weight menu items inside the root", async () => {
    const { container } = render(
      <DecisionCaptureCodedActionApp
        data={FIXTURE_CLAIM}
        onComplete={vi.fn()}
      />,
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
