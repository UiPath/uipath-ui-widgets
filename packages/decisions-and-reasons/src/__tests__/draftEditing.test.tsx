import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DraftEditing } from "../components/DraftEditing/DraftEditing";
import { FIXTURE_DRAFT } from "../fixtures/draftEditing";

const BASE = 1_760_000_000_000;

const field = (payload: { fields: { id: string }[] }, id: string) =>
  payload.fields.find((f) => f.id === id);

afterEach(() => {
  vi.restoreAllMocks();
});

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  const onChange = vi.fn();
  render(
    <DraftEditing
      {...FIXTURE_DRAFT}
      onComplete={onComplete}
      onChange={onChange}
      {...props}
    />,
  );
  return { onComplete, onChange, user: userEvent.setup() };
}

describe("DraftEditing", () => {
  it("shows the draft as kept with nothing selected and Complete disabled", () => {
    setup();

    expect(screen.getByLabelText("Reply")).toHaveValue(
      FIXTURE_DRAFT.fields[0].value,
    );
    expect(screen.getByText("Kept")).toBeInTheDocument();
    expect(screen.getByText("No outcome selected")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete" })).toBeDisabled();
    expect(screen.queryByText("Original draft")).not.toBeInTheDocument();
  });

  it("sends the untouched draft as the model's value", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Send/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Send" }));

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Send");
    expect(payload.changes).toEqual([]);
    expect(field(payload, "reply")).toMatchObject({
      byDecision: { Send: FIXTURE_DRAFT.fields[0].value },
      value: FIXTURE_DRAFT.fields[0].value,
      setBy: "model",
    });
    expect(
      payload.record.find((r: { part: string }) => r.part === "Field: Reply"),
    ).toMatchObject({ howMuch: "Untouched", source: "Support reply agent v1" });
  });

  it("marks a small edit as lightly edited, keeps the original and records the reason", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const { onChange, onComplete, user } = setup();

    now += 5000;
    await user.type(
      screen.getByLabelText("Reply"),
      " Thanks for your patience.",
    );
    await user.tab();

    expect(screen.getAllByText("Lightly edited").length).toBeGreaterThan(0);
    expect(screen.getByText("Original draft")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Missing a step" }));
    await user.click(screen.getByRole("button", { name: /^Send/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Send" }));

    const [, payload] = onComplete.mock.calls[0];
    expect(field(payload, "reply")).toMatchObject({
      byDecision: { Send: FIXTURE_DRAFT.fields[0].value },
      value: `${FIXTURE_DRAFT.fields[0].value} Thanks for your patience.`,
      setBy: "reviewer",
    });
    expect(payload.changes).toHaveLength(1);
    expect(payload.changes[0]).toMatch(
      /^Field · Reply: .* \(Lightly edited\)$/,
    );
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-reply"),
    ).toMatchObject({ title: "Missing a step", added: true });
    expect(payload.timeOnTaskSeconds).toBe(5);
    const steps = payload.changeLog.map((e: { what: string }) => e.what);
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatch(/^Field: Reply, .*\.\.\. → .*\.\.\.$/);
    expect(steps.slice(1)).toEqual([
      "Why: Reply, Missing a step",
      "Decision: Send",
    ]);
    expect(onChange).toHaveBeenCalled();
  });

  it("marks a replaced text as rewritten", async () => {
    const { onComplete, user } = setup();

    await user.clear(screen.getByLabelText("Reply"));
    await user.type(
      screen.getByLabelText("Reply"),
      "Use Reports, then Export.",
    );
    await user.tab();

    expect(screen.getAllByText("Rewritten").length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: /^Send/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Send" }));

    expect(onComplete.mock.calls[0][1].changes[0]).toMatch(/\(Rewritten\)$/);
  });

  it("holds Reject until a reason is picked and records the outcome change", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: /^Reject/ }));
    expect(
      screen.getByRole("button", { name: "Complete as Reject" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Pick a reason for this outcome."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Off topic" }));
    await user.click(
      screen.getByRole("button", { name: "Complete as Reject" }),
    );

    const [outcome, payload] = onComplete.mock.calls[0];
    expect(outcome).toBe("Reject");
    expect(payload.changes).toEqual(["Decision: Send → Reject (Rejected)"]);
    expect(
      payload.reasons.find((r: { id: string }) => r.id === "why-outcome"),
    ).toMatchObject({ title: "Off topic", supports: "Reject" });
  });

  it("renders the saved outcome read-only and never completes", () => {
    setup({ readOnly: true, saved: { outcome: "Revise" } });

    expect(screen.getByText("Completed as Revise")).toBeInTheDocument();
    expect(screen.getByLabelText("Reply")).toBeDisabled();
  });

  it("lets the host override a field and render beside an aside", () => {
    const { container } = render(
      <DraftEditing
        {...FIXTURE_DRAFT}
        onComplete={vi.fn()}
        aside={<div>Customer thread</div>}
        renderField={(f) => <p>Custom {f.label}</p>}
      />,
    );

    expect(screen.getByText("Customer thread")).toBeInTheDocument();
    expect(screen.getByText("Custom Reply")).toBeInTheDocument();
    expect(container.querySelector("textarea")).toBeNull();
  });
});
