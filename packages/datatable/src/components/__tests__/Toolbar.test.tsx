import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toolbar } from "../Toolbar";

// Mock DOM methods for Radix UI Select
Element.prototype.scrollIntoView = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
Element.prototype.releasePointerCapture = vi.fn();

describe("Toolbar", () => {
  const defaultProps = {
    onRefresh: vi.fn(),
    onShowDiff: vi.fn(),
    onDelete: vi.fn(),
    onAddRow: vi.fn(),
    onInsertRecord: vi.fn(),
    onDiscardNewRecords: vi.fn(),
    editedRowsCount: 0,
    selectedRowsCount: 0,
    newRecordsCount: 0,
  };

  it("should render all basic buttons", () => {
    render(<Toolbar {...defaultProps} />);

    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText(/Show Diff/)).toBeInTheDocument();
    expect(screen.getByText("Add Row")).toBeInTheDocument();
    expect(screen.getByText(/Delete Records/)).toBeInTheDocument();
  });

  it("should call onRefresh when Refresh button is clicked", async () => {
    const onRefresh = vi.fn();
    const user = userEvent.setup();

    render(<Toolbar {...defaultProps} onRefresh={onRefresh} />);

    await user.click(screen.getByText("Refresh"));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("should disable Show Diff button when no edited rows", () => {
    render(<Toolbar {...defaultProps} editedRowsCount={0} />);

    const showDiffButton = screen.getByText(/Show Diff/);
    expect(showDiffButton).toBeDisabled();
  });

  it("should enable Show Diff button when there are edited rows", () => {
    render(<Toolbar {...defaultProps} editedRowsCount={3} />);

    const showDiffButton = screen.getByText(/Show Diff/);
    expect(showDiffButton).not.toBeDisabled();
  });

  it("should display edited rows count in Show Diff button", () => {
    render(<Toolbar {...defaultProps} editedRowsCount={5} />);

    expect(screen.getByText(/Show Diff \(5\)/)).toBeInTheDocument();
  });

  it("should call onShowDiff when Show Diff button is clicked", async () => {
    const onShowDiff = vi.fn();
    const user = userEvent.setup();

    render(
      <Toolbar {...defaultProps} editedRowsCount={2} onShowDiff={onShowDiff} />,
    );

    await user.click(screen.getByText(/Show Diff/));
    expect(onShowDiff).toHaveBeenCalledTimes(1);
  });

  it("should call onAddRow when Add Row button is clicked", async () => {
    const onAddRow = vi.fn();
    const user = userEvent.setup();

    render(<Toolbar {...defaultProps} onAddRow={onAddRow} />);

    await user.click(screen.getByText("Add Row"));
    expect(onAddRow).toHaveBeenCalledTimes(1);
  });

  it("should disable Delete Records button when no rows selected", () => {
    render(<Toolbar {...defaultProps} selectedRowsCount={0} />);

    const deleteButton = screen.getByText(/Delete Records/);
    expect(deleteButton).toBeDisabled();
  });

  it("should enable Delete Records button when rows are selected", () => {
    render(<Toolbar {...defaultProps} selectedRowsCount={2} />);

    const deleteButton = screen.getByText(/Delete Records/);
    expect(deleteButton).not.toBeDisabled();
  });

  it("should display selected rows count in Delete Records button", () => {
    render(<Toolbar {...defaultProps} selectedRowsCount={3} />);

    expect(screen.getByText(/Delete Records \(3\)/)).toBeInTheDocument();
  });

  it("should call onDelete when Delete Records button is clicked", async () => {
    const onDelete = vi.fn();
    const user = userEvent.setup();

    render(
      <Toolbar {...defaultProps} selectedRowsCount={2} onDelete={onDelete} />,
    );

    await user.click(screen.getByText(/Delete Records/));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should show Insert Records and Discard buttons when there are new records", () => {
    render(<Toolbar {...defaultProps} newRecordsCount={2} />);

    expect(screen.getByText(/Insert Records \(2\)/)).toBeInTheDocument();
    expect(screen.getByText("Discard")).toBeInTheDocument();
  });

  it("should not show Insert Records and Discard buttons when there are no new records", () => {
    render(<Toolbar {...defaultProps} newRecordsCount={0} />);

    expect(screen.queryByText(/Insert Records/)).not.toBeInTheDocument();
    expect(screen.queryByText("Discard")).not.toBeInTheDocument();
  });

  it("should call onInsertRecord when Insert Records button is clicked", async () => {
    const onInsertRecord = vi.fn();
    const user = userEvent.setup();

    render(
      <Toolbar
        {...defaultProps}
        newRecordsCount={2}
        onInsertRecord={onInsertRecord}
      />,
    );

    await user.click(screen.getByText(/Insert Records/));
    expect(onInsertRecord).toHaveBeenCalledTimes(1);
  });

  it("should call onDiscardNewRecords when Discard button is clicked", async () => {
    const onDiscardNewRecords = vi.fn();
    const user = userEvent.setup();

    render(
      <Toolbar
        {...defaultProps}
        newRecordsCount={2}
        onDiscardNewRecords={onDiscardNewRecords}
      />,
    );

    await user.click(screen.getByText("Discard"));
    expect(onDiscardNewRecords).toHaveBeenCalledTimes(1);
  });

  it("should render group by dropdown when groupable columns are provided", () => {
    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[
          { name: "category", displayName: "Category" },
          { name: "status", displayName: "Status" },
          { name: "priority", displayName: "Priority" },
        ]}
      />,
    );

    expect(screen.getByText("Group by")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should not render group by dropdown when no groupable columns", () => {
    render(<Toolbar {...defaultProps} groupableColumns={[]} />);

    expect(screen.queryByText("Group by")).not.toBeInTheDocument();
  });

  it("should render all groupable columns in dropdown", async () => {
    const user = userEvent.setup();
    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[
          { name: "category", displayName: "Category" },
          { name: "status", displayName: "Status" },
          { name: "priority", displayName: "Priority" },
        ]}
      />,
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    // Check that options are rendered
    expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Category" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Status" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Priority" }),
    ).toBeInTheDocument();
  });

  it("should call onGroupByChange when group by selection changes", async () => {
    const onGroupByChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[
          { name: "category", displayName: "Category" },
          { name: "status", displayName: "Status" },
        ]}
        onGroupByChange={onGroupByChange}
      />,
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const categoryOption = screen.getByRole("option", { name: "Category" });
    await user.click(categoryOption);

    expect(onGroupByChange).toHaveBeenCalledWith("category");
  });

  it("should display selected group by value", () => {
    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[
          { name: "category", displayName: "Category" },
          { name: "status", displayName: "Status" },
        ]}
        selectedGroupBy="category"
      />,
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Category");
  });

  it("should disable Add Row button when group by is selected", () => {
    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[{ name: "category", displayName: "Category" }]}
        selectedGroupBy="category"
      />,
    );

    const addButton = screen.getByText("Add Row");
    expect(addButton).toBeDisabled();
  });

  it("should enable Add Row button when group by is not selected", () => {
    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[{ name: "category", displayName: "Category" }]}
        selectedGroupBy=""
      />,
    );

    const addButton = screen.getByText("Add Row");
    expect(addButton).not.toBeDisabled();
  });

  it("should handle missing onGroupByChange prop gracefully", async () => {
    const user = userEvent.setup();

    render(
      <Toolbar
        {...defaultProps}
        groupableColumns={[{ name: "category", displayName: "Category" }]}
        onGroupByChange={undefined}
      />,
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const categoryOption = screen.getByRole("option", { name: "Category" });
    // Should not throw error
    await user.click(categoryOption);
  });

  it("should render all buttons with correct structure", () => {
    render(<Toolbar {...defaultProps} newRecordsCount={1} />);

    // Verify all buttons are rendered and are button elements
    expect(screen.getByText("Refresh")).toBeInTheDocument();
    expect(screen.getByText(/Show Diff/)).toBeInTheDocument();
    expect(screen.getByText("Add Row")).toBeInTheDocument();
    expect(screen.getByText(/Insert Records/)).toBeInTheDocument();
    expect(screen.getByText("Discard")).toBeInTheDocument();
    expect(screen.getByText(/Delete Records/)).toBeInTheDocument();
  });
});
