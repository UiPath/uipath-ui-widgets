/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DateTimeCellRenderer } from "../DateTimeCellRenderer";

// Capture the onValueChange callback
let capturedOnValueChange: ((date: Date | undefined) => void) | undefined;

vi.mock("@uipath/apollo-wind", () => ({
  DateTimePicker: ({ value, onValueChange, className }: any) => {
    capturedOnValueChange = onValueChange;
    return (
      <input
        data-testid="date-time-picker"
        className={className}
        value={value ? value.toISOString() : ""}
        onChange={() => {}}
      />
    );
  },
}));

describe("DateTimeCellRenderer", () => {
  const mockSetDataValue = vi.fn();

  const createProps = (fieldName: string, dataValue?: string) =>
    ({
      fieldName,
      data: dataValue ? { [fieldName]: dataValue } : {},
      node: { setDataValue: mockSetDataValue },
    }) as any;

  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnValueChange = undefined;
  });

  it("should render the DateTimePicker", () => {
    render(<DateTimeCellRenderer {...createProps("startDate")} />);

    expect(screen.getByTestId("date-time-picker")).toBeInTheDocument();
  });

  it("should initialize with the current value as a Date", () => {
    const isoDate = "2024-06-15T10:30:00.000Z";
    render(<DateTimeCellRenderer {...createProps("startDate", isoDate)} />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toHaveValue(new Date(isoDate).toISOString());
  });

  it("should initialize with undefined when no value exists", () => {
    render(<DateTimeCellRenderer {...createProps("startDate")} />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toHaveValue("");
  });

  it("should call setDataValue with ISO string when date is selected", () => {
    render(<DateTimeCellRenderer {...createProps("startDate")} />);

    const newDate = new Date("2024-07-20T14:00:00.000Z");
    capturedOnValueChange!(newDate);

    expect(mockSetDataValue).toHaveBeenCalledWith(
      "startDate",
      newDate.toISOString(),
      "dateTimePicker",
    );
  });

  it("should call setDataValue with null when date is cleared", () => {
    const isoDate = "2024-06-15T10:30:00.000Z";
    render(<DateTimeCellRenderer {...createProps("startDate", isoDate)} />);

    capturedOnValueChange!(undefined);

    expect(mockSetDataValue).toHaveBeenCalledWith(
      "startDate",
      null,
      "dateTimePicker",
    );
  });

  it("should use the correct fieldName from props", () => {
    render(<DateTimeCellRenderer {...createProps("dueDate")} />);

    const newDate = new Date("2024-08-01T00:00:00.000Z");
    capturedOnValueChange!(newDate);

    expect(mockSetDataValue).toHaveBeenCalledWith(
      "dueDate",
      newDate.toISOString(),
      "dateTimePicker",
    );
  });

  it("should handle undefined data gracefully", () => {
    const props = {
      fieldName: "startDate",
      data: undefined,
      node: { setDataValue: mockSetDataValue },
    } as any;

    render(<DateTimeCellRenderer {...props} />);

    const picker = screen.getByTestId("date-time-picker");
    expect(picker).toHaveValue("");
  });
});
