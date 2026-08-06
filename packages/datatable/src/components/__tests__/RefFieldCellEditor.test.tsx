/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  RefFieldCellEditor,
  RefFieldCellEditorProps,
} from "../RefFieldCellEditor";
import { UiPath } from "@uipath/uipath-typescript/core";

// Mock DOM methods for Radix UI Select
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.releasePointerCapture = vi.fn();

// Mock useEntityRecordsCache
vi.mock("@uipath/datatable/hooks/useEntityRecordsCache", () => ({
  useEntityRecordsCache: () => ({
    getRecords: vi.fn().mockResolvedValue([
      { Id: "ref1", name: "Reference 1" },
      { Id: "ref2", name: "Reference 2" },
      { Id: "ref3", name: "Reference 3" },
    ]),
    clearCache: vi.fn(),
  }),
}));

describe("RefFieldCellEditor", () => {
  const mockField = {
    name: "category",
    referenceEntity: { id: "entity-1" },
    referenceField: { definition: { name: "name" } },
  } as any;

  const mockEntityRecord = {
    Id: "row1",
    category: { Id: "ref1", name: "Reference 1" },
  };

  const defaultProps: RefFieldCellEditorProps = {
    sdk: {} as UiPath,
    field: mockField,
    entityRecord: mockEntityRecord,
    onValueChange: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render select element", () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should show loading state initially", () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should load and display reference options", async () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Check that options are rendered
    expect(
      screen.getByRole("option", { name: "Reference 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Reference 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Reference 3" }),
    ).toBeInTheDocument();
  });

  it('should show "None" option when options are loaded', async () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();
  });

  it("should set initial selected value from entity record", async () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Get the trigger first before dropdown opens
    const trigger = screen.getByRole("combobox");

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // The trigger should display the selected value
    expect(trigger).toHaveTextContent("Reference 1");
  });

  it("should call onValueChange when selection changes", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RefFieldCellEditor {...defaultProps} onValueChange={onValueChange} />,
    );

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const option = screen.getByRole("option", { name: "Reference 2" });
    await user.click(option);

    expect(onValueChange).toHaveBeenCalledWith({
      Id: "ref2",
      name: "Reference 2",
    });
  });

  it('should call onValueChange with null when "None" is selected', async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();

    render(
      <RefFieldCellEditor {...defaultProps} onValueChange={onValueChange} />,
    );

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const noneOption = screen.getByRole("option", { name: "None" });
    await user.click(noneOption);

    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it("should disable select while loading", () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("should enable select after options are loaded", async () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Get the trigger first
    const trigger = screen.getByRole("combobox");

    // Wait for dropdown to auto-open, which happens when loading completes
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    expect(trigger).not.toBeDisabled();
  });

  it("should handle entity record without initial value", async () => {
    const propsWithoutValue = {
      ...defaultProps,
      entityRecord: { Id: "row1", category: null },
    };

    render(<RefFieldCellEditor {...propsWithoutValue} />);

    await waitFor(() => {
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      expect(select.value).toBe("");
    });
  });

  it("should render with Select component", () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Verify the Select trigger is rendered
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render correct number of options", async () => {
    render(<RefFieldCellEditor {...defaultProps} />);

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const options = screen.getAllByRole("option");
    // 1 "None" option + 3 reference options
    expect(options).toHaveLength(4);
  });

  it("should update selected value state on change", async () => {
    const user = userEvent.setup();

    render(<RefFieldCellEditor {...defaultProps} />);

    // Get the trigger first
    const trigger = screen.getByRole("combobox");

    // Wait for dropdown to auto-open after loading
    await waitFor(() => {
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    const option = screen.getByRole("option", { name: "Reference 3" });
    await user.click(option);

    // After selection, trigger should show the selected value
    await waitFor(() => {
      expect(trigger).toHaveTextContent("Reference 3");
    });
  });

  it("should handle missing reference entity id", async () => {
    const fieldWithoutRefEntity = {
      ...mockField,
      referenceEntity: undefined,
    };

    render(
      <RefFieldCellEditor {...defaultProps} field={fieldWithoutRefEntity} />,
    );

    // Should still render without crashing
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should handle missing reference field name", async () => {
    const fieldWithoutRefField = {
      ...mockField,
      referenceField: undefined,
    };

    render(
      <RefFieldCellEditor {...defaultProps} field={fieldWithoutRefField} />,
    );

    // Should still render without crashing
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
