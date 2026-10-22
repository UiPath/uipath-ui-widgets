import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ContractFieldReviewCodedActionApp } from "../ContractFieldReviewCodedActionApp";
import { DocumentValidationCodedActionApp } from "../DocumentValidationCodedActionApp";
import { TicketTriageCodedActionApp } from "../TicketTriageCodedActionApp";
import { buildUseCasePayload } from "../reviewModel";
import {
  FIXTURE_CONTRACT,
  FIXTURE_CONTRACT_QC,
  FIXTURE_INVOICE,
  FIXTURE_TICKET,
} from "../use-case-fixtures";
import type { UseCasePart, UseCaseSpec } from "../types";

const BASE = 1_760_000_000_000;

const field = (payload: { fields: { id: string }[] }, id: string) =>
  payload.fields.find((f) => f.id === id);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("buildUseCasePayload", () => {
  const spec: UseCaseSpec = {
    recommended: "Confirm",
    proposedBy: "Agent",
    outcomes: [
      { id: "Confirm", label: "Confirm", description: "" },
      { id: "Reject", label: "Reject", description: "" },
    ],
    reasons: [
      {
        id: "r1",
        title: "Looks like a report",
        detail: "d",
        partId: "a",
        confidence: 90,
      },
    ],
  };
  const part = (over: Partial<UseCasePart>): UseCasePart => ({
    id: "a",
    label: "Category",
    kind: "classification",
    proposed: "Reporting",
    value: "Reporting",
    looked: false,
    why: null,
    note: "",
    ...over,
  });

  it("keeps the proposal as the model's and records an override as the reviewer's", () => {
    vi.spyOn(Date, "now").mockReturnValue(BASE + 5000);
    const payload = buildUseCasePayload({
      spec,
      parts: [
        part({}),
        part({
          id: "b",
          label: "Priority",
          proposed: "Normal",
          value: "High",
          looked: true,
          why: "Deadline is close",
        }),
      ],
      outcome: "Reject",
      outcomeWhy: { why: "Other", note: "Duplicate of an open ticket" },
      log: [],
      reviewerId: "reviewer-1",
      startedAt: BASE,
    });

    expect(payload.fields).toEqual([
      {
        id: "a",
        label: "Category",
        kind: "classification",
        byDecision: { Confirm: "Reporting" },
        value: "Reporting",
        setBy: "model",
      },
      {
        id: "b",
        label: "Priority",
        kind: "classification",
        byDecision: { Confirm: "Normal" },
        value: "High",
        setBy: "reviewer",
      },
    ]);
    expect(payload.changes).toEqual([
      "Decision: Confirm → Reject (Rejected)",
      "Field · Priority: Normal → High (Rewritten)",
    ]);
    expect(payload.record.map((r) => [r.part, r.source, r.howMuch])).toEqual([
      ["Decision", "Agent", "Rejected"],
      ["Field: Category", "Agent", "Untouched"],
      ["Field: Priority", "Reviewer", "Rewritten"],
    ]);
    expect(payload.reasons.map((r) => [r.id, r.weight, r.added])).toEqual([
      ["r1", "High", undefined],
      ["why-b", "High", true],
      ["why-outcome", "High", true],
    ]);
    expect(payload.reasons[0]).toMatchObject({
      proposedWeight: "High",
      sourceConfidence: 90,
    });
    expect(payload.reasons[2].title).toBe("Duplicate of an open ticket");
    expect(payload.timeOnTaskSeconds).toBe(5);
  });

  it("sets a model reason aside when its part is overridden", () => {
    const payload = buildUseCasePayload({
      spec,
      parts: [part({ value: "Access" })],
      outcome: "Confirm",
      outcomeWhy: { why: null, note: "" },
      log: [],
      reviewerId: "",
      startedAt: Date.now(),
    });

    expect(payload.reasons[0].weight).toBe("Not relevant");
    expect(payload.decidingReasons).toEqual([]);
    expect(payload.rationaleText).toBe("Confirm. Corrected: Category.");
  });

  it("returns no decision before an outcome is chosen", () => {
    const payload = buildUseCasePayload({
      spec,
      parts: [part({})],
      outcome: null,
      outcomeWhy: { why: null, note: "" },
      log: [],
      reviewerId: "",
      startedAt: Date.now(),
    });

    expect(payload.decision).toBeNull();
    expect(payload.rationaleText).toBe("");
    expect(payload.record[0]).toMatchObject({
      submitted: "—",
      howMuch: "Untouched",
    });
  });
});

describe("TicketTriageCodedActionApp outputs", () => {
  it("returns proposed and final values per classification", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const onChange = vi.fn();
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TicketTriageCodedActionApp
        data={FIXTURE_TICKET}
        reviewerId="reviewer-1"
        onChange={onChange}
        onComplete={onComplete}
      />,
    );

    expect(
      screen.getByRole("button", { name: /^Confirm Recommended/ }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: /Complete/ })).toBeDisabled();

    now += 4000;
    await user.click(screen.getByRole("button", { name: "Confirm Category" }));
    await user.click(screen.getByRole("button", { name: /^High$/ }));
    await user.click(screen.getByRole("button", { name: "Deadline is close" }));
    now += 6000;
    await user.click(
      screen.getByRole("button", { name: /^Confirm Recommended/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "Complete as Confirm" }),
    );

    expect(onComplete).toHaveBeenCalledTimes(1);
    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Confirm");
    expect(payload.decision).toBe("Confirm");
    expect(payload.reviewerId).toBe("reviewer-1");
    expect(payload.timeOnTaskSeconds).toBe(10);
    expect(field(payload, "category")).toMatchObject({
      byDecision: { Confirm: "Reporting" },
      value: "Reporting",
      setBy: "model",
    });
    expect(field(payload, "priority")).toMatchObject({
      byDecision: { Confirm: "Normal" },
      value: "High",
      setBy: "reviewer",
    });
    expect(payload.changes).toEqual([
      "Field · Priority: Normal → High (Rewritten)",
    ]);
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-priority"),
    ).toMatchObject({ title: "Deadline is close", added: true });
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "reason-priority"),
    ).toMatchObject({ weight: "Not relevant" });
    expect(payload.changeLog.map((e: { what: string }) => e.what)).toEqual([
      "Field: Priority, Normal → High",
      "Why: Priority, Deadline is close",
      "Decision: Confirm",
    ]);
    expect(onChange).toHaveBeenCalledTimes(3);
  });

  it("requires a reason chip only when Send back offers one, and keeps it optional", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TicketTriageCodedActionApp
        data={FIXTURE_TICKET}
        onComplete={onComplete}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Send back/ }));
    await user.click(screen.getByRole("button", { name: "Missing details" }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Send back" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("SendBack");
    expect(payload.changes).toEqual([
      "Decision: Confirm → Send back (Rejected)",
    ]);
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-outcome"),
    ).toMatchObject({ title: "Missing details", supports: "SendBack" });
  });
});

describe("DocumentValidationCodedActionApp outputs", () => {
  it("returns the corrected value with its reason and the low-confidence reasons", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <DocumentValidationCodedActionApp
        data={FIXTURE_INVOICE}
        onComplete={onComplete}
      />,
    );

    const total = screen.getByLabelText("Total");
    await user.clear(total);
    await user.type(total, "4,236.50");
    await user.tab();
    await user.click(
      screen.getByRole("button", { name: "Extraction misread" }),
    );
    await user.click(screen.getByRole("button", { name: "Confirm Due date" }));
    await user.click(screen.getByRole("button", { name: /^Validate/ }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Validate" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Validate");
    expect(payload.fields).toHaveLength(18);
    expect(field(payload, "header.total")).toMatchObject({
      byDecision: { Validate: "4,236.00" },
      value: "4,236.50",
      setBy: "reviewer",
    });
    expect(field(payload, "header.due-date")).toMatchObject({
      value: "2026-11-02",
      setBy: "model",
    });
    expect(payload.changes).toEqual([
      "Field · Total: 4,236.00 → 4,236.50 (Lightly edited)",
    ]);
    const lowTotal = payload.reasons.find(
      (r: { id: string }) => r.id === "low-header.total",
    );
    expect(lowTotal).toMatchObject({
      weight: "Not relevant",
      sourceConfidence: 68,
    });
    expect(
      payload.reasons.find(
        (r: { id: string }) => r.id === "low-header.due-date",
      ),
    ).toMatchObject({ weight: "High" });
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-header.total"),
    ).toMatchObject({ title: "Extraction misread", added: true });
  });

  it("records a rejection with its reason chip", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <DocumentValidationCodedActionApp
        data={FIXTURE_INVOICE}
        onComplete={onComplete}
      />,
    );

    await user.click(screen.getByRole("button", { name: /^Reject/ }));
    await user.click(screen.getByRole("button", { name: "Illegible scan" }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Reject" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Reject");
    expect(payload.changes).toEqual(["Decision: Validate → Reject (Rejected)"]);
    expect(payload.record[0]).toMatchObject({
      part: "Decision",
      proposed: "Validate",
      submitted: "Reject",
      source: "Document extractor v3",
    });
  });
});

describe("ContractFieldReviewCodedActionApp outputs", () => {
  const verdict = (card: HTMLElement, name: string) =>
    within(card).getByRole("radio", { name });

  it("holds Complete until every field has a verdict and returns the corrections", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ContractFieldReviewCodedActionApp
        data={FIXTURE_CONTRACT}
        onComplete={onComplete}
      />,
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
      screen.getByText("Add the corrected value for Dispensing fee."),
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
    expect(field(payload, "dispensing-fee:verdict")).toMatchObject({
      byDecision: { Complete: "Needs review" },
      value: "System value wrong",
      setBy: "reviewer",
    });
    expect(field(payload, "dispensing-fee:system")).toMatchObject({
      byDecision: { Complete: "$1.95 per unit" },
      value: "$1.85 per unit",
      setBy: "reviewer",
    });
    expect(field(payload, "dispensing-fee:contract")).toBeUndefined();
    expect(field(payload, "rebate-rate:verdict")).toMatchObject({
      byDecision: { Complete: "Correct" },
      value: "Correct",
      setBy: "model",
    });
    expect(payload.changes).toEqual([
      "Field · Dispensing fee: Needs review → System value wrong (Rewritten)",
      "Field · Dispensing fee · system value: $1.95 per unit → $1.85 per unit (Lightly edited)",
      "Field · Annual price increase cap: Needs review → Correct (Rewritten)",
      "Field · Renewal notice period: Needs review → Correct (Rewritten)",
    ]);
    expect(
      payload.reasons.find(
        (r: { id: string }) => r.id === "why-dispensing-fee:verdict",
      ),
    ).toMatchObject({ title: "System record out of date" });
  });

  it("lets Reject through without coverage once a reason is picked", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ContractFieldReviewCodedActionApp
        data={FIXTURE_CONTRACT}
        onComplete={onComplete}
      />,
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
      <ContractFieldReviewCodedActionApp
        data={FIXTURE_CONTRACT_QC}
        onComplete={onComplete}
      />,
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
    expect(field(payload, "dispensing-fee:verdict")).toMatchObject({
      byDecision: { Complete: "System value wrong" },
      value: "System value wrong",
      setBy: "model",
    });
    expect(payload.record[0]).toMatchObject({
      source: "First-stage reviewer",
    });
  });
});
