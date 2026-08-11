import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  ClientSideTool,
  type ClientSideToolLabels,
} from "../components/ClientSideTool";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const labels: ClientSideToolLabels = {
  submit: "Submit",
  cancel: "Cancel",
  description: "Fill in the fields below and submit to continue.",
};

const inputSchema = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
  },
};

describe("ClientSideTool", () => {
  it("renders the tool name and description", () => {
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        labels={labels}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("lookup_user")).toBeInTheDocument();
    expect(
      screen.getByText("Fill in the fields below and submit to continue."),
    ).toBeInTheDocument();
  });

  it("renders the form with default values", () => {
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        defaultValues={{ name: "Alice" }}
        labels={labels}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("Alice");
  });

  it("calls onSubmit with form data when Submit is clicked", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        defaultValues={{ name: "Alice" }}
        labels={labels}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByText("Submit"));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Alice" }),
      ),
    );
  });

  it("calls onCancel when Cancel is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        labels={labels}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />,
    );
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("disables buttons after submit", async () => {
    const user = userEvent.setup();
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        defaultValues={{ name: "Alice" }}
        labels={labels}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByText("Submit"));
    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeDisabled();
      expect(screen.getByText("Cancel")).toBeDisabled();
    });
  });

  it("disables buttons after cancel", async () => {
    const user = userEvent.setup();
    render(
      <ClientSideTool
        toolName="lookup_user"
        inputSchema={inputSchema}
        labels={labels}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    await user.click(screen.getByText("Cancel"));
    await waitFor(() => {
      expect(screen.getByText("Submit")).toBeDisabled();
      expect(screen.getByText("Cancel")).toBeDisabled();
    });
  });
});
