import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DocumentReasonRow } from "../DocumentReasonRow";

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
