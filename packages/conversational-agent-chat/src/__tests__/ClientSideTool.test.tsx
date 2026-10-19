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

  describe("optional fields and empty values", () => {
    const mixedSchema = {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", title: "Name" },
        nickname: { type: "string", title: "Nickname" },
        age: { type: "integer", title: "Age" },
      },
    };

    it("hides optional fields behind Show more when some fields are required", async () => {
      const user = userEvent.setup();
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={mixedSchema}
          labels={labels}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.queryByText("Nickname")).not.toBeInTheDocument();
      await user.click(screen.getByText("Show more"));
      expect(screen.getByText("Nickname")).toBeInTheDocument();
    });

    it("shows every field when none are required", () => {
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={inputSchema}
          labels={labels}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.queryByText("Show more")).not.toBeInTheDocument();
    });

    it("omits untouched and blank fields from the submitted output", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={mixedSchema}
          defaultValues={{ nickname: null, age: "" }}
          labels={labels}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );
      await user.type(screen.getByRole("textbox"), "Alice");
      await user.click(screen.getByText("Submit"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" }),
      );
    });

    it("omits an untouched optional object instead of sending {}", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={{
            type: "object",
            required: ["name"],
            properties: {
              name: { type: "string", title: "Name" },
              address: {
                type: "object",
                title: "Address",
                properties: { city: { type: "string", title: "City" } },
              },
            },
          }}
          defaultValues={{ name: "Alice" }}
          labels={labels}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );
      await user.click(screen.getByText("Submit"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ name: "Alice" }),
      );
    });

    it("omits an optional object whose required child was typed then cleared", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={{
            type: "object",
            properties: {
              address: {
                type: "object",
                title: "Address",
                required: ["city"],
                properties: { city: { type: "string", title: "City" } },
              },
            },
          }}
          labels={labels}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );
      const city = screen.getByRole("textbox");
      await user.type(city, "Paris");
      await user.clear(city);
      await user.click(screen.getByText("Submit"));
      await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({}));
    });

    it("keeps 0 and false as real answers", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={{
            type: "object",
            properties: {
              count: { type: "integer", title: "Count" },
              enabled: { type: "boolean", title: "Enabled" },
            },
          }}
          defaultValues={{ count: 0, enabled: false }}
          labels={labels}
          onSubmit={onSubmit}
          onCancel={vi.fn()}
        />,
      );
      await user.click(screen.getByText("Submit"));
      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith({ count: 0, enabled: false }),
      );
    });

    it("reads required fields through $ref schemas", () => {
      render(
        <ClientSideTool
          toolName="lookup_user"
          inputSchema={{
            type: "object",
            required: ["name"],
            properties: {
              name: { $ref: "#/$defs/Name" },
              nickname: { type: "string", title: "Nickname" },
            },
            $defs: { Name: { type: "string", title: "Name" } },
          }}
          labels={labels}
          onSubmit={vi.fn()}
          onCancel={vi.fn()}
        />,
      );
      expect(screen.getByText("Show more")).toBeInTheDocument();
      expect(screen.queryByText("Nickname")).not.toBeInTheDocument();
    });
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
