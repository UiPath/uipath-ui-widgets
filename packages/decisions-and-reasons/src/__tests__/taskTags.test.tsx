import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CaseAssessment } from "../components/CaseAssessment/CaseAssessment";
import { FIXTURE_CASE } from "../fixtures/caseAssessment";

const TAGS = ["Water damage", "Repeat claimant"];

function setup(props = {}) {
  const onComplete = vi.fn().mockResolvedValue(undefined);
  render(
    <CaseAssessment
      {...FIXTURE_CASE}
      taskTags={TAGS}
      onComplete={onComplete}
      {...props}
    />,
  );
  return { onComplete, user: userEvent.setup() };
}

describe("task tags", () => {
  it("is absent unless task tags are supplied", () => {
    render(<CaseAssessment {...FIXTURE_CASE} onComplete={vi.fn()} />);

    expect(screen.queryByText("Task tags")).not.toBeInTheDocument();
  });

  it("returns the tapped tags and the custom tag in the payload and the change log", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: "Water damage" }));
    await user.type(screen.getByLabelText("New task tag"), "Fire risk");
    await user.click(screen.getByRole("button", { name: "Add tag" }));
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    const [, payload] = onComplete.mock.calls[0];
    expect(payload.taskTags).toEqual(["Water damage", "Fire risk"]);
    expect(
      payload.changeLog.map((entry: { what: string }) => entry.what),
    ).toEqual([
      "Task tag added: Water damage",
      "Task tag added: Fire risk",
      "Decision: Deny",
    ]);
  });

  it("removes a tag when it is tapped again, including a custom one", async () => {
    const { onComplete, user } = setup();

    await user.click(screen.getByRole("button", { name: "Water damage" }));
    await user.click(screen.getByRole("button", { name: "Water damage" }));
    await user.type(screen.getByLabelText("New task tag"), "Fire risk");
    await user.keyboard("{Enter}");
    await user.click(screen.getByRole("button", { name: "Fire risk" }));
    await user.click(screen.getByRole("button", { name: /^Deny/ }));
    await user.click(screen.getByRole("button", { name: "Complete as Deny" }));

    expect(onComplete.mock.calls[0][1].taskTags).toEqual([]);
    expect(
      screen.queryByRole("button", { name: "Fire risk" }),
    ).not.toBeInTheDocument();
  });

  it("shows the saved tags read-only", () => {
    setup({
      readOnly: true,
      saved: { outcome: "ApprovePartial", tags: ["Water damage"] },
    });

    expect(
      screen.getByRole("button", { name: "Water damage" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByLabelText("New task tag")).not.toBeInTheDocument();
  });
});
