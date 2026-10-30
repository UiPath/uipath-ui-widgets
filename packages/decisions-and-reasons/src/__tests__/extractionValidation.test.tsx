import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExtractionValidation } from "../components/ExtractionValidation/ExtractionValidation";
import { DocumentReasonRow } from "../components/shared/DocumentReasonRow";
import { FIXTURE_EXTRACTION } from "../fixtures/extractionValidation";

const field = (payload: { fields: { id: string }[] }, id: string) =>
  payload.fields.find((f) => f.id === id);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ExtractionValidation outputs", () => {
  it("returns the corrected value with its reason and the low-confidence reasons", async () => {
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <ExtractionValidation {...FIXTURE_EXTRACTION} onComplete={onComplete} />,
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
      "Field · Total: 4,236.00 → 4,236.50 (Changed)",
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
      <ExtractionValidation {...FIXTURE_EXTRACTION} onComplete={onComplete} />,
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

describe("DocumentReasonRow", () => {
  it("offers the four reasons for the edited field and marks the row optional", () => {
    render(
      <DocumentReasonRow
        fieldLabel="PO number"
        reason={null}
        onReasonChange={vi.fn()}
      />,
    );

    expect(screen.getByText("PO number: why? Optional.")).toBeInTheDocument();
    for (const name of [
      "Extraction misread",
      "Not in the document",
      "Rule doesn't fit",
      "Other",
    ]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("picks a reason and clears it on a second tap", async () => {
    const onReasonChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <DocumentReasonRow
        fieldLabel="PO number"
        reason={null}
        onReasonChange={onReasonChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Extraction misread" }),
    );
    expect(onReasonChange).toHaveBeenLastCalledWith("Extraction misread");

    rerender(
      <DocumentReasonRow
        fieldLabel="PO number"
        reason="Extraction misread"
        onReasonChange={onReasonChange}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: "Extraction misread" }),
    );
    expect(onReasonChange).toHaveBeenLastCalledWith(null);
  });

  it("opens one short note only for Other", async () => {
    const onNoteChange = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <DocumentReasonRow
        fieldLabel="PO number"
        reason="Rule doesn't fit"
        onReasonChange={vi.fn()}
      />,
    );
    expect(
      screen.queryByPlaceholderText("A few words"),
    ).not.toBeInTheDocument();

    rerender(
      <DocumentReasonRow
        fieldLabel="PO number"
        reason="Other"
        onReasonChange={vi.fn()}
        onNoteChange={onNoteChange}
      />,
    );
    await user.type(screen.getByPlaceholderText("A few words"), "x");
    expect(onNoteChange).toHaveBeenCalledWith("x");
  });
});
