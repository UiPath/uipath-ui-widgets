/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ChoiceSetSingleCellEditor,
  ChoiceSetSingleCellEditorProps,
} from "../ChoiceSetSingleCellEditor";

// Mock DOM methods for Radix UI Select
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.releasePointerCapture = vi.fn();

const mockChoiceSetValues = [
  {
    id: "cs-val-1",
    name: "high",
    displayName: "High",
    numberId: 1,
    createdTime: "",
    updatedTime: "",
  },
  {
    id: "cs-val-2",
    name: "medium",
    displayName: "Medium",
    numberId: 2,
    createdTime: "",
    updatedTime: "",
  },
  {
    id: "cs-val-3",
    name: "low",
    displayName: "Low",
    numberId: 3,
    createdTime: "",
    updatedTime: "",
  },
];

// Mock useChoiceSetCache
vi.mock("@uipath/datatable/hooks/useChoiceSetCache", () => ({
  useChoiceSetCache: () => ({
    getValues: vi.fn().mockResolvedValue(mockChoiceSetValues),
    clearCache: vi.fn(),
  }),
}));

describe("ChoiceSetSingleCellEditor", () => {
  const mockField = {
    name: "priority",
    choiceSetId: "cs-1",
    fieldDisplayType: "ChoiceSetSingle",
  } as any;

  const mockEntityRecord = {
    Id: "row1",
    priority: 2,
  };

  const defaultProps: ChoiceSetSingleCellEditorProps = {
    choiceSetService: {} as any,
    field: mockField,
    entityRecord: mockEntityRecord,
    onValueChange: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render select element", () => {
    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should load and display choice set options", async () => {
    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument();
  });

  it('should show "None" option', async () => {
    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();
  });

  it("should render correct number of options", async () => {
    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    // 1 "None" + 3 choice set values
    expect(options).toHaveLength(4);
  });

  it("should set initial selected value from entity record numberId", async () => {
    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    const trigger = screen.getByRole("combobox");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // numberId 2 maps to "Medium"
    expect(trigger).toHaveTextContent("Medium");
  });

  it("should call onValueChange with numberId when selection changes", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoiceSetSingleCellEditor
        {...defaultProps}
        onValueChange={onValueChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const option = screen.getByRole("option", { name: "Low" });
    await user.click(option);

    expect(onValueChange).toHaveBeenCalledWith(3);
  });

  it('should call onValueChange with null when "None" is selected', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ChoiceSetSingleCellEditor
        {...defaultProps}
        onValueChange={onValueChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const noneOption = screen.getByRole("option", { name: "None" });
    await user.click(noneOption);

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("should handle entity record without initial value", async () => {
    const propsWithoutValue = {
      ...defaultProps,
      entityRecord: { Id: "row1", priority: null },
    };

    render(<ChoiceSetSingleCellEditor {...propsWithoutValue} />);

    await waitFor(() => {
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveTextContent("None");
    });
  });

  it("should handle missing choiceSetId", () => {
    const fieldWithoutChoiceSetId = {
      ...mockField,
      choiceSetId: undefined,
      referenceChoiceSet: undefined,
    };

    render(
      <ChoiceSetSingleCellEditor
        {...defaultProps}
        field={fieldWithoutChoiceSetId}
      />,
    );

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should update selected value state on change", async () => {
    const user = userEvent.setup();

    render(<ChoiceSetSingleCellEditor {...defaultProps} />);

    const trigger = screen.getByRole("combobox");

    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const option = screen.getByRole("option", { name: "High" });
    await user.click(option);

    await waitFor(() => {
      expect(trigger).toHaveTextContent("High");
    });
  });
});
