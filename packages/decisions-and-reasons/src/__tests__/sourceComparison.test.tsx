import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SourceComparison } from "../components/SourceComparison/SourceComparison";
import {
  FIXTURE_COMPARISON,
  FIXTURE_COMPARISON_QC,
} from "../fixtures/sourceComparison";

const field = (payload: { fields: { id: string }[] }, id: string) =>
  payload.fields.find((f) => f.id === id);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SourceComparison outputs", () => {
  const verdict = (card: HTMLElement, name: string) =>
    within(card).getByRole("radio", { name });

  it("holds Complete until every field has a verdict and returns the corrections", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <SourceComparison {...FIXTURE_COMPARISON} onComplete={onComplete} />,
    );

    await user.click(screen.getByRole("button", { name: /^Complete review/ }));
    expect(
      screen.getByRole("button", { name: "Complete as Complete review" }),
    ).toBeDisabled();
    expect(screen.getByText("6 fields still to review.")).toBeInTheDocument();

    const cards = screen.getAllByTestId("field-card");
    for (const [i, card] of cards.entries()) {
      if (i === 1) continue;
      await user.click(verdict(card, "Correct"));
    }
    await user.click(verdict(cards[1], "System value wrong"));
    expect(
      screen.getByText("Add the corrected value for Handling fee."),
    ).toBeInTheDocument();
    const corrected = screen.getByLabelText("Corrected system value");
    await user.clear(corrected);
    await user.type(corrected, "$1.85 per unit");
    await user.tab();
    await user.click(
      within(cards[1]).getByRole("button", {
        name: "System record out of date",
      }),
    );
    await user.click(
      screen.getByRole("button", { name: "Complete as Complete review" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Complete");
    expect(field(payload, "handling-fee:verdict")).toMatchObject({
      byDecision: { Complete: "Needs review" },
      value: "System value wrong",
      setBy: "reviewer",
    });
    expect(field(payload, "handling-fee:system")).toMatchObject({
      byDecision: { Complete: "$1.95 per unit" },
      value: "$1.85 per unit",
      setBy: "reviewer",
    });
    expect(field(payload, "handling-fee:contract")).toBeUndefined();
    expect(field(payload, "rebate-rate:verdict")).toMatchObject({
      byDecision: { Complete: "Correct" },
      value: "Correct",
      setBy: "model",
    });
    expect(payload.changes).toEqual([
      "Field · Handling fee: Needs review → System value wrong (Changed)",
      "Field · Handling fee · system value: $1.95 per unit → $1.85 per unit (Changed)",
      "Field · Annual price increase cap: Needs review → Correct (Changed)",
      "Field · Renewal notice period: Needs review → Correct (Changed)",
    ]);
    expect(
      payload.reasons.find(
        (r: { id: string }) => r.id === "why-handling-fee:verdict",
      ),
    ).toMatchObject({ title: "System record out of date" });
  });

  it("lets Reject through without coverage once a reason is picked", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <SourceComparison {...FIXTURE_COMPARISON} onComplete={onComplete} />,
    );

    await user.click(screen.getByRole("button", { name: /^Reject/ }));
    expect(
      screen.getByRole("button", { name: "Complete as Reject" }),
    ).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Unreadable source" }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Reject" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Reject");
    expect(payload.changes).toEqual([
      "Decision: Complete review → Reject (Rejected)",
    ]);
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-outcome"),
    ).toMatchObject({ title: "Unreadable source", supports: "Reject" });
  });

  it("starts the audit lane from the reviewer's verdicts and records a dispute", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <SourceComparison {...FIXTURE_COMPARISON_QC} onComplete={onComplete} />,
    );

    const cards = screen.getAllByTestId("field-card");
    for (const [i, card] of cards.entries()) {
      if (i === 2) continue;
      await user.click(
        within(card).getByRole("button", { name: "Concur with reviewer" }),
      );
    }
    await user.click(verdict(cards[2], "Extraction wrong"));
    const corrected = screen.getByLabelText("Corrected contract value");
    await user.clear(corrected);
    await user.type(corrected, "3% per year");
    await user.tab();
    await user.click(screen.getByRole("button", { name: /^Complete audit/ }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Complete audit" }),
    );

    const [, payload] = onComplete.mock.calls[0];
    expect(field(payload, "price-cap:verdict")).toMatchObject({
      byDecision: { Complete: "Correct" },
      value: "Extraction wrong",
      setBy: "reviewer",
    });
    expect(field(payload, "price-cap:contract")).toMatchObject({
      byDecision: { Complete: "4% per year" },
      value: "3% per year",
    });
    expect(field(payload, "handling-fee:verdict")).toMatchObject({
      byDecision: { Complete: "System value wrong" },
      value: "System value wrong",
      setBy: "model",
    });
    expect(payload.record[0]).toMatchObject({
      source: "First-stage reviewer",
    });
  });
});
