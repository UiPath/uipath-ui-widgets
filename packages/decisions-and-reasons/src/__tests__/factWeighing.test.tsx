import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FactWeighing } from "../components/FactWeighing/FactWeighing";
import { FIXTURE_FACTS } from "../fixtures/factWeighing";
import { groupFacts, missingItems, toggleTag } from "../utils/factWeighing";

describe("fact weighing helpers", () => {
  it("lists what is still needed", () => {
    expect(missingItems(null, { tags: [], text: " " })).toEqual([
      "a decision",
      "a reason tag",
      "a rationale",
    ]);
    expect(missingItems("Decline", { tags: ["x"], text: "y" })).toEqual([]);
  });

  it("toggles tags and groups facts in order", () => {
    expect(toggleTag(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleTag(["a", "b"], "a")).toEqual(["b"]);
    expect(groupFacts(FIXTURE_FACTS.items).map((g) => g.group)).toEqual([
      "Order",
      "Account",
      "Payment",
      "Device and address",
    ]);
  });
});

describe("FactWeighing outputs", () => {
  it("filters to the facts the agent cited", async () => {
    const user = userEvent.setup();
    render(<FactWeighing {...FIXTURE_FACTS} onComplete={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "All facts (11)" })).toBeVisible();
    await user.click(screen.getByRole("tab", { name: "Agent cited (7)" }));
    expect(screen.queryByText("Promo code")).toBeNull();
    expect(screen.getByText("Order total")).toBeVisible();
  });

  it("returns each fact's weight beside the agent's read", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <FactWeighing
        {...FIXTURE_FACTS}
        reviewerId="reviewer-1"
        onComplete={onComplete}
      />,
    );

    const submit = screen.getByRole("button", { name: "Submit" });
    expect(submit).toBeDisabled();
    expect(
      screen.getByText("Still needed: a decision, a reason tag, a rationale"),
    ).toBeVisible();

    await user.click(
      screen.getByRole("radio", { name: "Promo code: Leans fraud" }),
    );
    await user.click(
      screen.getByRole("radio", { name: /^Order total: Leans legitimate/ }),
    );
    await user.click(screen.getByRole("button", { name: /^Decline/ }));
    await user.click(
      screen.getByRole("button", { name: "Promo abuse or reseller ring" }),
    );
    expect(submit).toBeDisabled();
    await user.type(
      screen.getByLabelText("Your reason, in your own words"),
      "Reseller pattern",
    );
    expect(submit).toBeEnabled();
    await user.click(submit);

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Decline");
    expect(payload.reviewerId).toBe("reviewer-1");
    expect(payload.rationale).toEqual({
      tags: ["Promo abuse or reseller ring"],
      text: "Reseller pattern",
    });
    const fact = (id: string) =>
      payload.facts.find((f: { id: string }) => f.id === id);
    expect(fact("promo-code")).toMatchObject({
      agentRead: "",
      weight: "Leans fraud",
      setBy: "reviewer",
    });
    expect(fact("order-total")).toMatchObject({
      agentRead: "Leans fraud",
      weight: "Leans legitimate",
      setBy: "reviewer",
    });
    expect(fact("account-age")).toMatchObject({
      agentRead: "Strongly fraud",
      weight: "Strongly fraud",
      setBy: "model",
    });
  });
});
