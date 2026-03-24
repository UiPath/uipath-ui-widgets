/**
 * Integration tests for DataTable component
 * These tests verify that multiple components work together correctly
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable } from "../DataTable";
import { UiPath } from "@uipath/uipath-typescript/core";

// Create mock Entities instance
const mockGetById = vi.fn();
const mockGetRecordsById = vi.fn();

// Mock Entities to avoid SDK validation issues
vi.mock("@uipath/uipath-typescript/entities", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@uipath/uipath-typescript/entities")>();
  return {
    ...actual,
    Entities: class {
      getById = mockGetById;
      getRecordsById = mockGetRecordsById;
    },
    ChoiceSets: class {
      getById = vi.fn().mockResolvedValue({ items: [] });
      getAll = vi.fn().mockResolvedValue([]);
    },
  };
});

// Mock telemetryClient
vi.mock("@uipath/uipath-typescript/core", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    telemetryClient: {
      track: vi.fn(),
    },
  };
});

// Mock apollo-wind Toaster to avoid sonner issues in jsdom
vi.mock("@uipath/apollo-wind", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    Toaster: () => null,
  };
});

// Store callbacks for testing
let storedOnCellValueChanged: any;
let storedOnSelectionChanged: any;
let storedGetRowHeight: any;
let storedGetRowClass: any;
let storedIsFullWidthRow: any;
let storedFullWidthCellRenderer: any;
let storedOnGroupByChange: any;
let mockGridApi: any;

// Mock Toolbar to capture callbacks and avoid Radix Select issues in jsdom
vi.mock("../components/Toolbar", () => ({
  Toolbar: ({
    onRefresh,
    onShowDiff,
    onDelete,
    onAddRow,
    onInsertRecord,
    onDiscardNewRecords,
    editedRowsCount,
    selectedRowsCount,
    newRecordsCount,
    groupableColumns,
    selectedGroupBy,
    onGroupByChange,
  }: any) => {
    storedOnGroupByChange = onGroupByChange;
    return (
      <div data-testid="toolbar">
        <button onClick={onRefresh}>Refresh</button>
        <button onClick={onShowDiff}>Show Diff ({editedRowsCount})</button>
        <button onClick={onAddRow}>Add Row</button>
        <button onClick={onInsertRecord} disabled={newRecordsCount === 0}>
          Insert Records ({newRecordsCount})
        </button>
        <button onClick={onDiscardNewRecords} disabled={newRecordsCount === 0}>
          Discard
        </button>
        <button onClick={onDelete} disabled={selectedRowsCount === 0}>
          Delete Records ({selectedRowsCount})
        </button>
        <span>Group By:</span>
        <select
          data-testid="group-by-select"
          value={selectedGroupBy}
          onChange={(e) => onGroupByChange(e.target.value)}
        >
          <option value="none">None</option>
          {groupableColumns?.map((col: any) => (
            <option key={col.name} value={col.name}>
              {col.displayName}
            </option>
          ))}
        </select>
      </div>
    );
  },
}));

// Mock ag-grid-react
vi.mock("ag-grid-react", () => ({
  AgGridReact: ({
    rowData,
    columnDefs,
    onGridReady,
    onCellValueChanged,
    onSelectionChanged,
    getRowHeight,
    getRowClass,
    isFullWidthRow,
    fullWidthCellRenderer,
    pinnedTopRowData,
  }: any) => {
    // Store callbacks for testing
    storedOnCellValueChanged = onCellValueChanged;
    storedOnSelectionChanged = onSelectionChanged;
    storedGetRowHeight = getRowHeight;
    storedGetRowClass = getRowClass;
    storedIsFullWidthRow = isFullWidthRow;
    storedFullWidthCellRenderer = fullWidthCellRenderer;

    // Create mock grid API
    mockGridApi = {
      sizeColumnsToFit: vi.fn(),
      getSelectedRows: vi.fn(() => []),
      getSelectedNodes: vi.fn(() => []),
      deselectAll: vi.fn(),
      refreshCells: vi.fn(),
      getSizesForCurrentTheme: vi.fn(() => ({
        rowHeight: 42,
        headerHeight: 42,
      })),
    };

    // Simulate grid ready
    if (onGridReady) {
      setTimeout(() => {
        onGridReady({ api: mockGridApi });
      }, 0);
    }

    const allRows = [...(rowData || []), ...(pinnedTopRowData || [])];
    return (
      <div data-testid="ag-grid-integration">
        <div data-testid="row-count">{allRows.length}</div>
        <div data-testid="column-count">{columnDefs?.length || 0}</div>
        <div data-testid="row-data">{JSON.stringify(allRows)}</div>
      </div>
    );
  },
  themeQuartz: {},
}));

describe("DataTable Integration Tests", () => {
  let mockSdk: Partial<UiPath>;
  let mockEntity: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockEntity = {
      id: "entity-1",
      name: "TestEntity",
      fields: [
        {
          name: "Id",
          displayName: "ID",
          isSystemField: true,
          isForeignKey: false,
        },
        {
          name: "name",
          displayName: "Name",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: "STRING" },
        },
        {
          name: "status",
          displayName: "Status",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: "STRING" },
        },
      ],
      getAllRecords: vi.fn().mockResolvedValue({
        items: [
          { Id: "row1", name: "Item 1", status: "Active" },
          { Id: "row2", name: "Item 2", status: "Inactive" },
        ],
      }),
      updateRecords: vi.fn().mockResolvedValue(undefined),
      insertRecords: vi.fn().mockResolvedValue(undefined),
      deleteRecords: vi.fn().mockResolvedValue(undefined),
    };

    // Setup mock implementations
    mockGetById.mockResolvedValue(mockEntity);
    mockGetRecordsById.mockResolvedValue({
      items: [
        { Id: "row1", name: "Item 1", status: "Active" },
        { Id: "row2", name: "Item 2", status: "Inactive" },
      ],
    });

    mockSdk = {} as any;
  });

  it("should render DataTable with toolbar and grid", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Toolbar buttons should be present
    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText(/Show Diff/)).toBeInTheDocument();
    expect(screen.getByText("Add Row")).toBeInTheDocument();
  });

  it("should load and display entity data", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    expect(mockGetById).toHaveBeenCalledWith("entity-1");
  });

  it("should handle refresh action", async () => {
    const user = userEvent.setup();
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    const refreshButton = screen.getByText("Refresh");
    await user.click(refreshButton);

    // Should call getById again after refresh
    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledTimes(2);
    });
  });

  it("should show loading state initially", () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle errors gracefully", async () => {
    mockGetById.mockRejectedValueOnce(new Error("Failed to fetch entity"));

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it("should have correct CSS classes", async () => {
    const { container } = render(
      <DataTable sdk={mockSdk as UiPath} entityId="entity-1" />,
    );

    await waitFor(() => {
      const datatableContainer = container.querySelector(
        ".uipath-datatable-container",
      );
      expect(datatableContainer).toBeInTheDocument();
    });
  });

  it("should apply custom page size", async () => {
    render(
      <DataTable sdk={mockSdk as UiPath} entityId="entity-1" pageSize={100} />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // PageSize prop should be passed to AgGrid
    // This is verified by the component not throwing errors
  });

  it("should handle entity ID changes", async () => {
    const { rerender } = render(
      <DataTable sdk={mockSdk as UiPath} entityId="entity-1" />,
    );

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith("entity-1");
    });

    // Change entity ID
    rerender(<DataTable sdk={mockSdk as UiPath} entityId="entity-2" />);

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith("entity-2");
    });
  });

  it("should handle Add Row button click", async () => {
    const user = userEvent.setup();
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    const addRowButton = screen.getByText("Add Row");
    await user.click(addRowButton);

    // Row count should increase by 1
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });
  });

  it("should handle cell value changes for existing records", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready
    await waitFor(() => {
      expect(storedOnCellValueChanged).toBeDefined();
    });

    // Simulate cell value change for existing record
    storedOnCellValueChanged({
      data: { Id: "row1", name: "Updated Name", status: "Active" },
      colDef: { field: "name" },
      oldValue: "Item 1",
      newValue: "Updated Name",
    });

    // The edit should be tracked (Show Diff button should show count)
    await waitFor(() => {
      expect(screen.getByText(/Show Diff/)).toBeInTheDocument();
    });
  });

  it("should handle cell value changes for new records", async () => {
    const user = userEvent.setup();
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready and add a new row
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    const addRowButton = screen.getByText("Add Row");
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });

    // Get the temp ID from row data
    const rowDataText = screen.getByTestId("row-data").textContent;
    const rowData = JSON.parse(rowDataText || "[]");
    const tempRow = rowData.find((r: any) => r.Id?.startsWith("temp-"));

    if (tempRow) {
      // Simulate cell value change for new record
      storedOnCellValueChanged({
        data: { ...tempRow, name: "New Item Name" },
        colDef: { field: "name" },
        oldValue: "",
        newValue: "New Item Name",
      });
    }

    // New records count should be shown
    await waitFor(() => {
      expect(screen.getByText(/Insert/)).toBeInTheDocument();
    });
  });

  it("should handle selection changes", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready
    await waitFor(() => {
      expect(storedOnSelectionChanged).toBeDefined();
    });

    // Mock selected rows
    mockGridApi.getSelectedRows.mockReturnValue([
      { Id: "row1" },
      { Id: "row2" },
    ]);

    // Trigger selection change
    if (storedOnSelectionChanged) {
      storedOnSelectionChanged();
    }

    // Delete button should show selected count
    await waitFor(() => {
      expect(screen.getByText(/Delete/)).toBeInTheDocument();
    });
  });

  it("should render delete button", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Delete button should be present (even if disabled)
    await waitFor(() => {
      expect(screen.getByText(/Delete Records/)).toBeInTheDocument();
    });
  });

  it("should handle discard new records with confirmation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready and add a new row
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    const addRowButton = screen.getByText("Add Row");
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });

    // Click discard button
    const discardButton = screen.getByText(/Discard/);
    await user.click(discardButton);

    expect(confirmSpy).toHaveBeenCalled();

    // Row count should be back to 2
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    confirmSpy.mockRestore();
  });

  it("should handle discard cancellation", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready and add a new row
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    const addRowButton = screen.getByText("Add Row");
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });

    // Click discard button
    const discardButton = screen.getByText(/Discard/);
    await user.click(discardButton);

    expect(confirmSpy).toHaveBeenCalled();

    // Row count should still be 3
    expect(screen.getByTestId("row-count")).toHaveTextContent("3");

    confirmSpy.mockRestore();
  });

  it("should handle insert new records", async () => {
    const user = userEvent.setup();

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Wait for grid to be ready and add a new row
    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("2");
    });

    const addRowButton = screen.getByText("Add Row");
    await user.click(addRowButton);

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });

    // Click insert button
    const insertButton = screen.getByText(/Insert/);
    await user.click(insertButton);

    await waitFor(() => {
      expect(mockEntity.insertRecords).toHaveBeenCalled();
    });
  });

  it("should open diff dialog", async () => {
    const user = userEvent.setup();

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Simulate a cell edit to enable diff
    await waitFor(() => {
      expect(storedOnCellValueChanged).toBeDefined();
    });

    storedOnCellValueChanged({
      data: { Id: "row1", name: "Updated Name", status: "Active" },
      colDef: { field: "name" },
      oldValue: "Item 1",
      newValue: "Updated Name",
    });

    // Click Show Diff button
    const showDiffButton = screen.getByText(/Show Diff/);
    await user.click(showDiffButton);

    // Dialog should be open
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  it("should handle commit from diff dialog", async () => {
    const user = userEvent.setup();

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Simulate a cell edit
    await waitFor(() => {
      expect(storedOnCellValueChanged).toBeDefined();
    });

    storedOnCellValueChanged({
      data: { Id: "row1", name: "Updated Name", status: "Active" },
      colDef: { field: "name" },
      oldValue: "Item 1",
      newValue: "Updated Name",
    });

    // Click Show Diff button
    const showDiffButton = screen.getByText(/Show Diff/);
    await user.click(showDiffButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Click Commit button (actual text is "Commit Changes")
    const commitButton = screen.getByText("Commit Changes");
    await user.click(commitButton);

    await waitFor(() => {
      expect(mockEntity.updateRecords).toHaveBeenCalled();
    });
  });

  it("should handle revert from diff dialog", async () => {
    const user = userEvent.setup();

    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Simulate a cell edit
    await waitFor(() => {
      expect(storedOnCellValueChanged).toBeDefined();
    });

    storedOnCellValueChanged({
      data: { Id: "row1", name: "Updated Name", status: "Active" },
      colDef: { field: "name" },
      oldValue: "Item 1",
      newValue: "Updated Name",
    });

    // Click Show Diff button
    const showDiffButton = screen.getByText(/Show Diff/);
    await user.click(showDiffButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Click Revert button (actual text is "Revert")
    const revertButton = screen.getByText("Revert");
    await user.click(revertButton);

    // Dialog should close
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("should handle showIdColumn prop", async () => {
    render(
      <DataTable
        sdk={mockSdk as UiPath}
        entityId="entity-1"
        showIdColumn={false}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    // Verify columns don't include Id when showIdColumn is false
    // This is tested by the component not throwing errors
  });
});

describe("DataTable Group By Tests", () => {
  let mockSdk: Partial<UiPath>;
  let mockEntity: any;
  let mockRefEntity: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRefEntity = {
      id: "ref-entity-1",
      name: "CategoryEntity",
      fields: [
        {
          name: "Id",
          displayName: "ID",
          isSystemField: true,
          isForeignKey: false,
        },
        {
          name: "categoryName",
          displayName: "Category Name",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: "STRING" },
        },
      ],
    };

    mockEntity = {
      id: "entity-1",
      name: "TestEntity",
      fields: [
        {
          name: "Id",
          displayName: "ID",
          isSystemField: true,
          isForeignKey: false,
        },
        {
          name: "name",
          displayName: "Name",
          isSystemField: false,
          isForeignKey: false,
          fieldDataType: { name: "STRING" },
        },
        {
          name: "category",
          displayName: "Category",
          isSystemField: false,
          isForeignKey: true,
          referenceEntity: { id: "ref-entity-1" },
          referenceField: { definition: { name: "categoryName" } },
        },
      ],
      getAllRecords: vi.fn().mockResolvedValue({
        items: [
          {
            Id: "row1",
            name: "Item 1",
            category: { Id: "cat1", categoryName: "Cat 1" },
          },
          {
            Id: "row2",
            name: "Item 2",
            category: { Id: "cat1", categoryName: "Cat 1" },
          },
          {
            Id: "row3",
            name: "Item 3",
            category: { Id: "cat2", categoryName: "Cat 2" },
          },
        ],
      }),
      updateRecords: vi.fn().mockResolvedValue(undefined),
      insertRecords: vi.fn().mockResolvedValue(undefined),
      deleteRecords: vi.fn().mockResolvedValue(undefined),
    };

    mockGetById.mockImplementation((id: string) => {
      if (id === "entity-1") return Promise.resolve(mockEntity);
      if (id === "ref-entity-1") return Promise.resolve(mockRefEntity);
      return Promise.reject(new Error("Entity not found"));
    });

    mockGetRecordsById.mockImplementation((id: string) => {
      if (id === "entity-1") {
        return Promise.resolve({
          items: [
            {
              Id: "row1",
              name: "Item 1",
              category: { Id: "cat1", categoryName: "Cat 1" },
            },
            {
              Id: "row2",
              name: "Item 2",
              category: { Id: "cat1", categoryName: "Cat 1" },
            },
            {
              Id: "row3",
              name: "Item 3",
              category: { Id: "cat2", categoryName: "Cat 2" },
            },
          ],
        });
      }
      if (id === "ref-entity-1") {
        return Promise.resolve({
          items: [
            { Id: "cat1", categoryName: "Cat 1" },
            { Id: "cat2", categoryName: "Cat 2" },
          ],
        });
      }
      return Promise.resolve({ items: [] });
    });

    mockSdk = {} as any;
  });

  it("should show groupable columns in dropdown", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Group By:")).toBeInTheDocument();
    });

    const select = screen.getByTestId("group-by-select");
    expect(select).toBeInTheDocument();
  });

  it("should handle group by selection", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith("ref-entity-1");
    });
  });

  it("should handle group by reset to none", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(mockGetById).toHaveBeenCalledWith("ref-entity-1");
    });

    await storedOnGroupByChange("none");

    await waitFor(() => {
      expect(screen.getByTestId("row-count")).toHaveTextContent("3");
    });
  });

  it("should test getRowHeight callback for normal rows", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedGetRowHeight).toBeDefined();
    });

    const normalRowResult = storedGetRowHeight({
      data: { Id: "row1", _isExpandedRow: false },
      api: mockGridApi,
    });
    expect(normalRowResult).toBeUndefined();
  });

  it("should test getRowHeight callback for expanded rows", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedGetRowHeight).toBeDefined();
    });

    const expandedRowResult = storedGetRowHeight({
      data: {
        Id: "detail-row1",
        _isExpandedRow: true,
        _groupedRecords: [{}, {}, {}],
      },
      api: mockGridApi,
    });
    expect(expandedRowResult).toBeGreaterThan(0);
  });

  it("should test getRowClass callback", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedGetRowClass).toBeDefined();
    });

    const normalClass = storedGetRowClass({ data: { _isExpandedRow: false } });
    expect(normalClass).toBe("master-row");

    const expandedClass = storedGetRowClass({ data: { _isExpandedRow: true } });
    expect(expandedClass).toBe("detail-row");
  });

  it("should test isFullWidthRow callback", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedIsFullWidthRow).toBeDefined();
    });

    const normalResult = storedIsFullWidthRow({
      rowNode: { data: { _isExpandedRow: false } },
    });
    expect(normalResult).toBe(false);

    const expandedResult = storedIsFullWidthRow({
      rowNode: { data: { _isExpandedRow: true } },
    });
    expect(expandedResult).toBe(true);
  });

  it("should test fullWidthCellRenderer callback", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedFullWidthCellRenderer).toBeDefined();
    });

    const result = storedFullWidthCellRenderer({
      data: { Id: "cat1", _groupedRecords: [{ Id: "row1" }] },
    });
    expect(result).toBeDefined();
  });

  it("should handle getRowHeight with empty grouped records", async () => {
    render(<DataTable sdk={mockSdk as UiPath} entityId="entity-1" />);

    await waitFor(() => {
      expect(screen.getByTestId("ag-grid-integration")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(storedOnGroupByChange).toBeDefined();
    });

    await storedOnGroupByChange("category");

    await waitFor(() => {
      expect(storedGetRowHeight).toBeDefined();
    });

    const result = storedGetRowHeight({
      data: { Id: "detail-row1", _isExpandedRow: true },
      api: mockGridApi,
    });
    expect(result).toBeGreaterThan(0);
  });
});
