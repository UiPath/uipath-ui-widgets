import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CellWithExpandButton } from "../CellWithExpandButton";

describe("CellWithExpandButton", () => {
  const defaultProps = {
    cellName: "Test Cell",
    cellId: "cell-1",
    isExpanded: false,
    onToggleExpand: vi.fn(),
  };

  it("should render cell name", () => {
    render(<CellWithExpandButton {...defaultProps} />);

    expect(screen.getByText("Test Cell")).toBeInTheDocument();
  });

  it("should render expand button with correct aria-label when collapsed", () => {
    render(<CellWithExpandButton {...defaultProps} />);

    const button = screen.getByRole("button", { name: "Expand" });
    expect(button).toBeInTheDocument();
  });

  it("should render expand button with correct aria-label when expanded", () => {
    render(<CellWithExpandButton {...defaultProps} isExpanded={true} />);

    const button = screen.getByRole("button", { name: "Collapse" });
    expect(button).toBeInTheDocument();
  });

  it("should call onToggleExpand with cellId when button is clicked", async () => {
    const onToggleExpand = vi.fn();
    const user = userEvent.setup();

    render(
      <CellWithExpandButton
        {...defaultProps}
        onToggleExpand={onToggleExpand}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onToggleExpand).toHaveBeenCalledWith("cell-1");
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("should stop event propagation when button is clicked", async () => {
    const onToggleExpand = vi.fn();
    const onDivClick = vi.fn();
    const user = userEvent.setup();

    render(
      <div onClick={onDivClick}>
        <CellWithExpandButton
          {...defaultProps}
          onToggleExpand={onToggleExpand}
        />
      </div>,
    );

    const button = screen.getByRole("button");
    await user.click(button);

    expect(onToggleExpand).toHaveBeenCalledTimes(1);
    // Parent div click should not be triggered due to stopPropagation
    expect(onDivClick).not.toHaveBeenCalled();
  });

  it("should render SVG icon", () => {
    const { container } = render(<CellWithExpandButton {...defaultProps} />);

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("width", "16");
    expect(svg).toHaveAttribute("height", "16");
  });

  it("should handle multiple clicks", async () => {
    const onToggleExpand = vi.fn();
    const user = userEvent.setup();

    render(
      <CellWithExpandButton
        {...defaultProps}
        onToggleExpand={onToggleExpand}
      />,
    );

    const button = screen.getByRole("button");
    await user.click(button);
    await user.click(button);
    await user.click(button);

    expect(onToggleExpand).toHaveBeenCalledTimes(3);
  });

  it("should render with different cell names", () => {
    const { rerender } = render(
      <CellWithExpandButton {...defaultProps} cellName="First Name" />,
    );
    expect(screen.getByText("First Name")).toBeInTheDocument();

    rerender(<CellWithExpandButton {...defaultProps} cellName="Second Name" />);
    expect(screen.getByText("Second Name")).toBeInTheDocument();
  });

  it("should handle empty cell name", () => {
    render(<CellWithExpandButton {...defaultProps} cellName="" />);

    // The button should still be rendered even with empty cell name
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });
});
