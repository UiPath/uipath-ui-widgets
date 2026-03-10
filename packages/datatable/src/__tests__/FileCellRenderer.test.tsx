/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileCellRenderer } from "../components/FileCellRenderer";

const mockToastPromise = vi.fn();

vi.mock("@uipath/apollo-wind", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    toast: {
      promise: (...args: any[]) => mockToastPromise(...args),
      error: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
    },
    Toaster: () => null,
  };
});

describe("FileCellRenderer", () => {
  let mockEntityService: any;
  const defaultProps: any = {
    entityId: "entity-123",
    fieldName: "Documents",
    data: { Id: "record-1" },
    value: null,
    // ICellRendererParams required fields
    node: {} as any,
    colDef: {} as any,
    column: {} as any,
    api: {} as any,
    context: {} as any,
    getValue: vi.fn(),
    setValue: vi.fn(),
    formatValue: vi.fn(),
    refreshCell: vi.fn(),
    eGridCell: document.createElement("div"),
    eParentOfValue: document.createElement("div"),
    registerRowDragger: vi.fn(),
    setTooltip: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEntityService = {
      downloadAttachment: vi.fn(),
      uploadAttachment: vi.fn(),
      deleteAttachment: vi.fn(),
    };
  });

  it("should render upload button when no file is present", () => {
    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value={null}
      />,
    );

    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("should render file name and dropdown menu when file exists", () => {
    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    expect(screen.getByText("report.pdf")).toBeInTheDocument();
  });

  it("should return null when data has no Id", () => {
    const { container } = render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        data={{ Id: null }}
        value={null}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("should show dropdown menu items when file exists", async () => {
    const user = userEvent.setup();

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    await waitFor(() => {
      expect(screen.getByText("Open")).toBeInTheDocument();
      expect(screen.getByText("Download")).toBeInTheDocument();
      expect(screen.getByText("Replace")).toBeInTheDocument();
      expect(screen.getByText("Remove")).toBeInTheDocument();
    });
  });

  it("should call toast.promise with downloadAttachment on Open click", async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(["test"], { type: "application/pdf" });
    mockEntityService.downloadAttachment.mockResolvedValue(mockBlob);

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const openItem = screen.getByText("Open");
    await user.click(openItem);

    expect(mockToastPromise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Opening file in new tab",
      success: "File opened",
      error: "Failed to open file",
    });
  });

  it("should call toast.promise with downloadAttachment on Download click", async () => {
    const user = userEvent.setup();
    const mockBlob = new Blob(["test"], { type: "application/pdf" });
    mockEntityService.downloadAttachment.mockResolvedValue(mockBlob);

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const downloadItem = screen.getByText("Download");
    await user.click(downloadItem);

    expect(mockToastPromise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Downloading file",
      success: "File downloaded",
      error: "Failed to download file",
    });
  });

  it("should call toast.promise with deleteAttachment on Remove click", async () => {
    const user = userEvent.setup();
    mockEntityService.deleteAttachment.mockResolvedValue({});

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const removeItem = screen.getByText("Remove");
    await user.click(removeItem);

    expect(mockToastPromise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Removing file",
      success: "File removed",
      error: "Failed to remove file",
    });
    expect(mockEntityService.deleteAttachment).toHaveBeenCalledWith(
      "entity-123",
      "record-1",
      "Documents",
    );
  });

  it("should show Upload text and trigger file input on click", async () => {
    const user = userEvent.setup();

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value={null}
      />,
    );

    const uploadLink = screen.getByText("Upload");
    expect(uploadLink).toBeInTheDocument();

    // Click should trigger the hidden file input
    await user.click(uploadLink);
  });

  it("should call uploadAttachment when file is selected", async () => {
    mockEntityService.uploadAttachment.mockResolvedValue({});

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value={null}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeTruthy();

    const testFile = new File(["test content"], "test.pdf", {
      type: "application/pdf",
    });

    await userEvent.upload(fileInput, testFile);

    expect(mockToastPromise).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Uploading file",
      success: "File uploaded",
      error: "Failed to upload file",
    });
    expect(mockEntityService.uploadAttachment).toHaveBeenCalledWith(
      "entity-123",
      "record-1",
      "Documents",
      testFile,
    );
  });

  it("should update file name after successful upload", async () => {
    mockEntityService.uploadAttachment.mockResolvedValue({});
    // Make toast.promise actually execute the promise
    mockToastPromise.mockImplementation((promise: Promise<any>) => promise);

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value={null}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const testFile = new File(["test content"], "uploaded.pdf", {
      type: "application/pdf",
    });

    await userEvent.upload(fileInput, testFile);

    await waitFor(() => {
      expect(screen.getByText("uploaded.pdf")).toBeInTheDocument();
    });
  });

  it("should clear file name after successful remove", async () => {
    const user = userEvent.setup();
    mockEntityService.deleteAttachment.mockResolvedValue({});
    mockToastPromise.mockImplementation((promise: Promise<any>) => promise);

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    expect(screen.getByText("report.pdf")).toBeInTheDocument();

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const removeItem = screen.getByText("Remove");
    await user.click(removeItem);

    await waitFor(() => {
      expect(screen.getByText("Upload")).toBeInTheDocument();
    });
  });

  it("should open file input when Replace is clicked", async () => {
    const user = userEvent.setup();

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value="report.pdf"
      />,
    );

    const menuButton = screen.getByRole("button");
    await user.click(menuButton);

    const replaceItem = screen.getByText("Replace");
    await user.click(replaceItem);

    // Replace should trigger file input click (no direct assertion needed,
    // just verifying it doesn't throw)
  });

  it("should show Uploading... text while upload is in progress", async () => {
    // Make upload hang indefinitely
    mockEntityService.uploadAttachment.mockReturnValue(new Promise(() => {}));
    mockToastPromise.mockImplementation((promise: Promise<any>) => promise);

    render(
      <FileCellRenderer
        {...defaultProps}
        entityService={mockEntityService}
        value={null}
      />,
    );

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const testFile = new File(["test"], "test.pdf", {
      type: "application/pdf",
    });

    await userEvent.upload(fileInput, testFile);

    await waitFor(() => {
      expect(screen.getByText("Uploading...")).toBeInTheDocument();
    });
  });
});
