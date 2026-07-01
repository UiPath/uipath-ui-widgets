import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AgentSchemaField } from "../components/AgentSchemaForm/AgentSchemaField";
import type { InputSchemaProperty } from "../components/AgentSchemaForm/types";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const renderField = (prop: InputSchemaProperty, value?: unknown) => {
  const onChange = vi.fn();
  render(
    <AgentSchemaField
      prop={prop}
      fieldKey="field"
      value={value}
      onChange={onChange}
    />,
  );
  return { onChange };
};

describe("AgentSchemaField — boolean", () => {
  it("renders True/False radios and emits a boolean on select", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({
      type: "boolean",
    } as InputSchemaProperty);
    await user.click(screen.getByText("True"));
    expect(onChange).toHaveBeenLastCalledWith(true);
  });
});

describe("AgentSchemaField — date/time", () => {
  it("renders a date input for format: date", () => {
    renderField({
      type: "string",
      format: "date",
    } as InputSchemaProperty);
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it("renders a datetime-local input for format: date-time", () => {
    renderField({
      type: "string",
      format: "date-time",
    } as InputSchemaProperty);
    expect(
      document.querySelector('input[type="datetime-local"]'),
    ).toBeInTheDocument();
  });

  it("renders a time input for format: time", () => {
    renderField({
      type: "string",
      format: "time",
    } as InputSchemaProperty);
    expect(document.querySelector('input[type="time"]')).toBeInTheDocument();
  });

  it("infers a date input from an ISO date value when no format is given", () => {
    renderField({ type: "string" } as InputSchemaProperty, "2026-06-09");
    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();
  });

  it("emits the raw value on date change", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({
      type: "string",
      format: "date",
    } as InputSchemaProperty);
    const input = document.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    await user.type(input, "2026-06-09");
    expect(onChange).toHaveBeenCalledWith("2026-06-09");
  });
});

describe("AgentSchemaField — enum", () => {
  it("renders a select with the placeholder for an enum prop", () => {
    renderField({
      type: "string",
      enum: ["high", "normal"],
      oneOf: [{ const: "high", title: "High" }],
    } as unknown as InputSchemaProperty);
    expect(screen.getByText("Select an option...")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});

describe("AgentSchemaField — numeric", () => {
  it("renders a number input with placeholder and coerces to Number", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({
      type: "integer",
    } as InputSchemaProperty);
    const input = screen.getByPlaceholderText("Enter a number...");
    expect(input).toHaveAttribute("type", "number");
    // uncontrolled harness resets value between keystrokes, so type one digit
    await user.type(input, "7");
    expect(onChange).toHaveBeenLastCalledWith(7);
  });

  it("allows decimals on a number field (step='any')", () => {
    renderField({ type: "number" } as InputSchemaProperty);
    const input = screen.getByPlaceholderText("Enter a number...");
    expect(input).toHaveAttribute("step", "any");
    expect(input).toHaveAttribute("inputmode", "decimal");
  });

  it("restricts an integer field to whole numbers (step=1)", () => {
    renderField({ type: "integer" } as InputSchemaProperty);
    const input = screen.getByPlaceholderText("Enter a number...");
    expect(input).toHaveAttribute("step", "1");
    expect(input).toHaveAttribute("inputmode", "numeric");
  });

  it("emits undefined when a numeric field is cleared", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField(
      { type: "number" } as InputSchemaProperty,
      7,
    );
    const input = screen.getByPlaceholderText("Enter a number...");
    await user.clear(input);
    expect(onChange).toHaveBeenLastCalledWith(undefined);
  });
});

describe("AgentSchemaField — plain string", () => {
  it("renders a text input and emits the typed value", async () => {
    const user = userEvent.setup();
    const { onChange } = renderField({ type: "string" } as InputSchemaProperty);
    const input = screen.getByPlaceholderText("Enter a value...");
    expect(input).toHaveAttribute("type", "text");
    await user.type(input, "x");
    expect(onChange).toHaveBeenLastCalledWith("x");
  });
});
