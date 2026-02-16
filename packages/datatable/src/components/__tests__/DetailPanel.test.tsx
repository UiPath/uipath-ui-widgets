/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DetailPanel } from "../DetailPanel";
import { EntityGetResponse } from "@uipath/uipath-typescript";

// Mock AgGridReact
vi.mock("ag-grid-react", () => ({
  AgGridReact: ({ rowData, columnDefs }: any) => (
    <div data-testid="ag-grid-mock">
      <div data-testid="row-count">{rowData?.length || 0}</div>
      <div data-testid="column-count">{columnDefs?.length || 0}</div>
    </div>
  ),
}));

describe("DetailPanel", () => {
  const mockEntity: Partial<EntityGetResponse> = {
    fields: [
      {
        name: "Id",
        displayName: "ID",
        isSystemField: true,
      } as any,
      {
        name: "name",
        displayName: "Name",
        isSystemField: false,
        isForeignKey: false,
      } as any,
      {
        name: "category",
        displayName: "Category",
        isSystemField: false,
        isForeignKey: true,
      } as any,
      {
        name: "status",
        displayName: "Status",
        isSystemField: false,
        isForeignKey: false,
      } as any,
    ],
  };

  const mockRowData = [
    { Id: "row1", name: "Item 1", status: "Active" },
    { Id: "row2", name: "Item 2", status: "Inactive" },
  ];

  const defaultProps = {
    rowData: mockRowData,
    groupByFieldDisplayName: "Category",
    groupByFieldId: "cat-1",
    entity: mockEntity as EntityGetResponse,
  };

  it("should render the detail panel", () => {
    render(<DetailPanel {...defaultProps} />);

    expect(screen.getByTestId("ag-grid-mock")).toBeInTheDocument();
  });

  it("should pass correct row data to AgGrid", () => {
    render(<DetailPanel {...defaultProps} />);

    expect(screen.getByTestId("row-count")).toHaveTextContent("2");
  });

  it("should filter out system fields from columns", () => {
    render(<DetailPanel {...defaultProps} />);

    // Should have 2 columns (name, status) - excluding Id (system field) and Category (grouped by field)
    expect(screen.getByTestId("column-count")).toHaveTextContent("2");
  });

  it("should exclude the groupBy field from columns", () => {
    render(<DetailPanel {...defaultProps} groupByFieldDisplayName="Name" />);

    // Should have 2 columns (category, status) - excluding name (grouped by)
    expect(screen.getByTestId("column-count")).toHaveTextContent("2");
  });

  it("should handle empty row data", () => {
    render(<DetailPanel {...defaultProps} rowData={[]} />);

    expect(screen.getByTestId("row-count")).toHaveTextContent("0");
  });

  it("should handle undefined entity", () => {
    render(<DetailPanel {...defaultProps} entity={undefined} />);

    expect(screen.getByTestId("column-count")).toHaveTextContent("0");
  });

  it("should render with minimal props", () => {
    render(
      <DetailPanel
        rowData={[]}
        groupByFieldDisplayName=""
        groupByFieldId={undefined}
        entity={undefined}
      />,
    );

    expect(screen.getByTestId("ag-grid-mock")).toBeInTheDocument();
  });

  it("should have correct CSS class", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);

    expect(container.querySelector(".detail-panel")).toBeInTheDocument();
  });

  it("should update columns when entity changes", () => {
    const { rerender } = render(<DetailPanel {...defaultProps} />);

    const newEntity: Partial<EntityGetResponse> = {
      fields: [
        {
          name: "field1",
          displayName: "Field 1",
          isSystemField: false,
        } as any,
      ],
    };

    rerender(
      <DetailPanel {...defaultProps} entity={newEntity as EntityGetResponse} />,
    );

    expect(screen.getByTestId("column-count")).toHaveTextContent("1");
  });

  it("should update columns when groupByFieldDisplayName changes", () => {
    const { rerender } = render(
      <DetailPanel {...defaultProps} groupByFieldDisplayName="Category" />,
    );

    // Initially should have 2 columns (name, status)
    expect(screen.getByTestId("column-count")).toHaveTextContent("2");

    // Change groupBy to Status
    rerender(
      <DetailPanel {...defaultProps} groupByFieldDisplayName="Status" />,
    );

    // Should now have 2 columns (name, category)
    expect(screen.getByTestId("column-count")).toHaveTextContent("2");
  });
});
