/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import {
  ChoiceSetMultipleCellEditor,
  ChoiceSetMultipleCellEditorProps,
} from "../ChoiceSetMultipleCellEditor";

const mockChoiceSetValues = [
  {
    id: "cs-val-1",
    name: "red",
    displayName: "Red",
    numberId: 1,
    createdTime: "",
    updatedTime: "",
  },
  {
    id: "cs-val-2",
    name: "green",
    displayName: "Green",
    numberId: 2,
    createdTime: "",
    updatedTime: "",
  },
  {
    id: "cs-val-3",
    name: "blue",
    displayName: "Blue",
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

// Mock apollo-wind MultiSelect since it uses Popover/Command which are complex in jsdom
vi.mock("@uipath/apollo-wind", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    MultiSelect: ({
      options,
      selected,
      onChange,
      placeholder,
      disabled,
    }: any) => (
      <div data-testid="multi-select">
        <span data-testid="multi-select-placeholder">{placeholder}</span>
        <span data-testid="multi-select-selected">
          {JSON.stringify(selected)}
        </span>
        <span data-testid="multi-select-disabled">{String(!!disabled)}</span>
        <ul data-testid="multi-select-options">
          {options.map((opt: any) => (
            <li
              key={opt.value}
              data-testid={`option-${opt.value}`}
              onClick={() => {
                const isSelected = selected.includes(opt.value);
                const newSelected = isSelected
                  ? selected.filter((s: string) => s !== opt.value)
                  : [...selected, opt.value];
                onChange(newSelected);
              }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      </div>
    ),
  };
});

describe("ChoiceSetMultipleCellEditor", () => {
  const mockField = {
    name: "tags",
    choiceSetId: "cs-2",
    fieldDisplayType: "ChoiceSetMultiple",
  } as any;

  const mockEntityRecord = {
    Id: "row1",
    tags: [1, 3],
  };

  const defaultProps: ChoiceSetMultipleCellEditorProps = {
    choiceSetService: {} as any,
    field: mockField,
    entityRecord: mockEntityRecord,
    onValueChange: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render multi-select component", () => {
    render(<ChoiceSetMultipleCellEditor {...defaultProps} />);

    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
  });

  it("should set initial selected values from entity record numberIds", () => {
    render(<ChoiceSetMultipleCellEditor {...defaultProps} />);

    const selected = screen.getByTestId("multi-select-selected");
    // numberIds [1, 3] should be converted to strings ["1", "3"]
    expect(selected).toHaveTextContent('["1","3"]');
  });

  it("should load and display choice set options", async () => {
    render(<ChoiceSetMultipleCellEditor {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("option-1")).toBeInTheDocument();
      expect(screen.getByTestId("option-2")).toBeInTheDocument();
      expect(screen.getByTestId("option-3")).toBeInTheDocument();
    });

    expect(screen.getByText("Red")).toBeInTheDocument();
    expect(screen.getByText("Green")).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("should call onValueChange with numberIds when selection changes", async () => {
    const onValueChange = vi.fn();

    render(
      <ChoiceSetMultipleCellEditor
        {...defaultProps}
        onValueChange={onValueChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("option-2")).toBeInTheDocument();
    });

    // Click "Green" (numberId 2) to add it to selection
    screen.getByTestId("option-2").click();

    expect(onValueChange).toHaveBeenCalledWith([1, 3, 2]);
  });

  it("should call onValueChange to remove a value when toggled off", async () => {
    const onValueChange = vi.fn();

    render(
      <ChoiceSetMultipleCellEditor
        {...defaultProps}
        onValueChange={onValueChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("option-1")).toBeInTheDocument();
    });

    // Click "Red" (numberId 1) to remove it from selection [1, 3]
    screen.getByTestId("option-1").click();

    expect(onValueChange).toHaveBeenCalledWith([3]);
  });

  it("should handle entity record without initial value", () => {
    const propsWithoutValue = {
      ...defaultProps,
      entityRecord: { Id: "row1", tags: null },
    };

    render(<ChoiceSetMultipleCellEditor {...propsWithoutValue} />);

    const selected = screen.getByTestId("multi-select-selected");
    expect(selected).toHaveTextContent("[]");
  });

  it("should handle empty array as initial value", () => {
    const propsWithEmptyArray = {
      ...defaultProps,
      entityRecord: { Id: "row1", tags: [] },
    };

    render(<ChoiceSetMultipleCellEditor {...propsWithEmptyArray} />);

    const selected = screen.getByTestId("multi-select-selected");
    expect(selected).toHaveTextContent("[]");
  });

  it("should show placeholder text", () => {
    render(<ChoiceSetMultipleCellEditor {...defaultProps} />);

    expect(screen.getByTestId("multi-select-placeholder")).toHaveTextContent(
      "Select values...",
    );
  });

  it("should handle missing choiceSetId", () => {
    const fieldWithoutChoiceSetId = {
      ...mockField,
      choiceSetId: undefined,
      referenceChoiceSet: undefined,
    };

    render(
      <ChoiceSetMultipleCellEditor
        {...defaultProps}
        field={fieldWithoutChoiceSetId}
      />,
    );

    expect(screen.getByTestId("multi-select")).toBeInTheDocument();
  });
});
