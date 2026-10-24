import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TriageRouting } from "../components/TriageRouting/TriageRouting";
import { FIXTURE_TRIAGE } from "../fixtures/triageRouting";

const BASE = 1_760_000_000_000;

const field = (payload: { fields: { id: string }[] }, id: string) =>
  payload.fields.find((f) => f.id === id);

afterEach(() => {
  vi.restoreAllMocks();
});

describe("TriageRouting outputs", () => {
  it("returns proposed and final values per classification", async () => {
    let now = BASE;
    vi.spyOn(Date, "now").mockImplementation(() => now);
    const onChange = vi.fn();
    const onComplete = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(
      <TriageRouting
        {...FIXTURE_TRIAGE}
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
    render(<TriageRouting {...FIXTURE_TRIAGE} onComplete={onComplete} />);

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
