import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ToolCallConfirmationValue } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  ToolConfirmation,
  type ToolConfirmationLabels,
} from "../components/ToolConfirmation";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const labels: ToolConfirmationLabels = {
  cancel: "Cancel",
  confirm: "Confirm",
  statusCancelled: "Cancelled",
  statusConfirmed: "Confirmed",
};

const confirmationData = {
  toolName: "send_email",
  inputSchema: {
    type: "object",
    required: ["to"],
    properties: { to: { type: "string", title: "To" } },
  },
  inputValue: { to: "a@b.com" },
} as unknown as ToolCallConfirmationValue;

describe("ToolConfirmation — completed state", () => {
  it("shows the confirmed status when not rejected", () => {
    render(
      <ToolConfirmation
        confirmationData={confirmationData}
        isCompleted
        labels={labels}
        onApprove={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("send_email")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
    expect(screen.queryByText("Cancel")).not.toBeInTheDocument();
  });

  it("shows the cancelled status when rejected", () => {
    render(
      <ToolConfirmation
        confirmationData={confirmationData}
        isCompleted
        wasRejected
        labels={labels}
        onApprove={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });
});

describe("ToolConfirmation — active state", () => {
  it("renders the form pre-filled with the incoming input value", () => {
    render(
      <ToolConfirmation
        confirmationData={confirmationData}
        isCompleted={false}
        labels={labels}
        onApprove={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("a@b.com");
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });

  it("approves with the submitted form data when Confirm is clicked", async () => {
    const user = userEvent.setup();
    const onApprove = vi.fn();
    render(
      <ToolConfirmation
        confirmationData={confirmationData}
        isCompleted={false}
        labels={labels}
        onApprove={onApprove}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(onApprove).toHaveBeenCalledWith({
        input: expect.objectContaining({ to: "a@b.com" }),
      }),
    );
  });

  it("invokes onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ToolConfirmation
        confirmationData={confirmationData}
        isCompleted={false}
        labels={labels}
        onApprove={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
