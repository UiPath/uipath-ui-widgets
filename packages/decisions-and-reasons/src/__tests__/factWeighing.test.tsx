import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FactWeighing } from "../components/FactWeighing/FactWeighing";
import { FIXTURE_FACTS } from "../fixtures/factWeighing";
import { groupFacts, missingItems } from "../components/FactWeighing/facts";

describe("fact weighing helpers", () => {
  it("lists what is still needed", () => {
    expect(missingItems(null, 0)).toEqual(["a decision", "a reason"]);
    expect(missingItems("Decline", 1)).toEqual([]);
  });

  it("groups facts in order", () => {
    expect(groupFacts(FIXTURE_FACTS.items).map((g) => g.group)).toEqual([
      "Order",
      "Account",
      "Payment",
      "Device and address",
    ]);
  });
});

describe("FactWeighing outputs", () => {
  it("lists every fact in one list without tabs", () => {
    render(<FactWeighing {...FIXTURE_FACTS} onComplete={vi.fn()} />);
    expect(screen.queryByRole("tab")).toBeNull();
    expect(screen.getByText("Promo code")).toBeVisible();
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
      screen.getByText("Still needed: a decision, a reason"),
    ).toBeVisible();

    await user.click(
      screen.getByRole("radio", { name: "Promo code: Leans fraud" }),
    );
    await user.click(
      screen.getByRole("radio", { name: /^Order total: Leans legitimate/ }),
    );
    await user.click(screen.getByRole("button", { name: /^Decline/ }));
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Pick a reason" }));
    await user.click(
      await screen.findByRole("menuitem", {
        name: "Promo abuse or reseller ring",
      }),
    );
    expect(submit).toBeEnabled();
    await user.type(
      screen.getByLabelText("Your reason, in your own words"),
      "Reseller pattern",
    );
    await user.click(submit);

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Decline");
    expect(payload.reviewerId).toBe("reviewer-1");
    expect(payload.rationale).toEqual({ text: "Reseller pattern" });
    expect(
      payload.reasons.map((reason: { title: string }) => reason.title),
    ).toEqual(["Promo abuse or reseller ring"]);
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
