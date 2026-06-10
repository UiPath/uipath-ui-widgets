import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { InputsSection } from "../components/SettingsDialog/InputsSection";
import type { InputSchema } from "../components/AgentSchemaForm/types";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const schema: InputSchema = {
  type: "object",
  properties: { topic: { type: "string", title: "Topic" } },
};

describe("InputsSection", () => {
  it("applies the inputs and notifies onApplied on success", async () => {
    const user = userEvent.setup();
    const onApplyInputs = vi.fn().mockResolvedValue(undefined);
    const onApplied = vi.fn();
    render(
      <InputsSection
        inputSchema={schema}
        initialValues={{ topic: "weather" }}
        onApplyInputs={onApplyInputs}
        onApplied={onApplied}
      />,
    );

    await user.click(screen.getByText("Apply changes"));

    await waitFor(() =>
      expect(onApplyInputs).toHaveBeenCalledWith(
        expect.objectContaining({ topic: "weather" }),
      ),
    );
    expect(onApplied).toHaveBeenCalledTimes(1);
  });

  it("surfaces an inline error when apply fails", async () => {
    const user = userEvent.setup();
    const onApplyInputs = vi.fn().mockRejectedValue(new Error("boom"));
    const onApplied = vi.fn();
    render(
      <InputsSection
        inputSchema={schema}
        initialValues={{ topic: "weather" }}
        onApplyInputs={onApplyInputs}
        onApplied={onApplied}
      />,
    );

    await user.click(screen.getByText("Apply changes"));

    expect(await screen.findByText(/boom/)).toBeInTheDocument();
    expect(onApplied).not.toHaveBeenCalled();
  });
});
