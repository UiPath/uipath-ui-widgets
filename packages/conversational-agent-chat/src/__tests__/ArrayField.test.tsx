import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AgentSchemaField } from "../components/AgentSchemaForm/AgentSchemaField";
import type { InputSchemaProperty } from "../components/AgentSchemaForm/types";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const arrayProp = {
  type: "array",
  description: "Tags to attach",
} as unknown as InputSchemaProperty;

/** Controlled wrapper so chip edits persist across re-renders. */
const Harness = ({
  initial = [],
  onChange,
}: {
  initial?: string[];
  onChange?: (v: unknown) => void;
}) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <AgentSchemaField
      prop={arrayProp}
      fieldKey="tags"
      value={value}
      onChange={(v) => {
        setValue(v as string[]);
        onChange?.(v);
      }}
    />
  );
};

describe("ArrayField", () => {
  it("renders existing chips and the field description", () => {
    render(<Harness initial={["alpha", "beta"]} />);
    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("Tags to attach")).toBeInTheDocument();
  });

  it("adds a chip on Enter and clears the input", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await user.type(input, "gamma{Enter}");
    expect(screen.getByText("gamma")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("adds a chip on blur", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await user.type(input, "delta");
    await user.tab();
    expect(screen.getByText("delta")).toBeInTheDocument();
  });

  it("does not add a chip for whitespace-only input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "   {Enter}");
    // the `if (trimmed)` guard skips onChange entirely; input just clears
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
  });

  it("removes a chip via its remove button", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["keep", "drop"]} />);
    await user.click(screen.getByLabelText("Remove drop"));
    expect(screen.queryByText("drop")).not.toBeInTheDocument();
    expect(screen.getByText("keep")).toBeInTheDocument();
  });

  it("removes the last chip on Backspace when the input is empty", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["one", "two"]} />);
    const input = screen.getByRole("textbox");
    input.focus();
    await user.keyboard("{Backspace}");
    expect(screen.queryByText("two")).not.toBeInTheDocument();
    expect(screen.getByText("one")).toBeInTheDocument();
  });
});
