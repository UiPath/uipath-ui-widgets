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

const Harness = ({
  prop,
  initial,
  onChange,
}: {
  prop: InputSchemaProperty;
  initial?: unknown;
  onChange?: (v: unknown) => void;
}) => {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <AgentSchemaField
      prop={prop}
      fieldKey="config"
      value={value}
      onChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    />
  );
};

describe("ObjectField — nested (typed properties)", () => {
  const nestedProp = {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", title: "Name" },
      count: { type: "integer", title: "Count" },
    },
  } as unknown as InputSchemaProperty;

  it("renders nested field labels expanded by default", () => {
    render(<Harness prop={nestedProp} initial={{}} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Count")).toBeInTheDocument();
  });

  it("propagates a nested edit into the parent object value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness prop={nestedProp} initial={{}} onChange={onChange} />);
    const nameInput = screen.getAllByRole("textbox")[0];
    await user.type(nameInput, "Ada");
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: "Ada" }),
    );
  });

  it("collapses and re-expands the nested group", async () => {
    const user = userEvent.setup();
    render(<Harness prop={nestedProp} initial={{}} />);
    const toggle = screen.getAllByRole("button")[0];
    await user.click(toggle);
    expect(screen.queryByText("Name")).not.toBeInTheDocument();
    await user.click(toggle);
    expect(screen.getByText("Name")).toBeInTheDocument();
  });
});

describe("ObjectField — JSON fallback (no properties)", () => {
  const jsonProp = {
    type: "object",
    description: "Freeform JSON",
  } as unknown as InputSchemaProperty;

  it("seeds the textarea with pretty-printed initial value", () => {
    render(<Harness prop={jsonProp} initial={{ a: 1 }} />);
    expect(screen.getByRole("textbox")).toHaveValue('{\n  "a": 1\n}');
  });

  it("defaults to an empty object literal when no value is given", () => {
    render(<Harness prop={jsonProp} />);
    expect(screen.getByRole("textbox")).toHaveValue("{}");
  });

  it("parses valid JSON and emits the object", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness prop={jsonProp} onChange={onChange} />);
    const ta = screen.getByRole("textbox");
    await user.clear(ta);
    await user.type(ta, '{{"x":5}');
    expect(onChange).toHaveBeenLastCalledWith({ x: 5 });
    expect(screen.queryByText("Invalid JSON syntax")).not.toBeInTheDocument();
  });

  it("shows a syntax error and emits undefined for malformed JSON", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness prop={jsonProp} onChange={onChange} />);
    const ta = screen.getByRole("textbox");
    await user.clear(ta);
    await user.type(ta, "{{not json");
    expect(screen.getByText("Invalid JSON syntax")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("rejects a non-object JSON value (e.g. an array)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness prop={jsonProp} onChange={onChange} />);
    const ta = screen.getByRole("textbox");
    await user.clear(ta);
    // `[` is a special char in userEvent's keyboard syntax; double it to type a literal
    await user.type(ta, "[[1,2]");
    expect(screen.getByText("Value must be a JSON object")).toBeInTheDocument();
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});
