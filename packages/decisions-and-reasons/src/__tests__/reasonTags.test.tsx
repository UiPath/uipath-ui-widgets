import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseAssessment } from "../components/CaseAssessment/CaseAssessment";
import { FIXTURE_CASE } from "../fixtures/caseAssessment";

const DEFAULTS = ["Manufacturing defect", "Installer error"];
const OWN_REASON = "Customer dispute";

type Entry = { what: string };
type Reason = { title: string };

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  render(
    <CaseAssessment
      {...FIXTURE_CASE}
      defaultReasons={DEFAULTS}
      onComplete={onComplete}
      {...props}
    />,
  );
  return { onComplete, user: userEvent.setup() };
}

describe("reason tags", () => {
  it("keeps the add reason form unless default reasons are supplied", () => {
    render(<CaseAssessment {...FIXTURE_CASE} onComplete={vi.fn()} />);

    expect(screen.getByText("+ Add a reason")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Pick a reason" }),
    ).not.toBeInTheDocument();
  });

  it("returns a picked default and a typed other reason in the payload and the change log", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: "Pick a reason" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Installer error" }),
    );
    await user.click(screen.getByRole("button", { name: "Pick a reason" }));
    await user.click(await screen.findByRole("menuitem", { name: "Other" }));
    await user.type(screen.getByLabelText("Other reason"), OWN_REASON);
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [, payload] = onComplete.mock.calls[0];
    const titles = payload.reasons.map((reason: Reason) => reason.title);
    expect(titles.slice(-2)).toEqual(["Installer error", OWN_REASON]);
    const added = payload.changeLog
      .map((entry: Entry) => entry.what)
      .filter((what: string) => what.startsWith("Reason added"));
    expect(added).toEqual([
      "Reason added: Installer error, supports Deny",
      `Reason added: ${OWN_REASON}, supports Deny`,
    ]);
  });

  it("removes a picked reason from its chip", async () => {
    const { user } = setup();

    await user.click(screen.getByRole("button", { name: "Pick a reason" }));
    await user.click(
      await screen.findByRole("menuitem", { name: "Installer error" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Remove Installer error" }),
    );

    expect(
      screen.queryByRole("button", { name: "Remove Installer error" }),
    ).not.toBeInTheDocument();
  });
});
