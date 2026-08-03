import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import FilePreviewer from "../components/FilePreviewer";
import { initI18n } from "../i18n";

// Stub the pdf.js canvas viewer so these tests stay off the pdfjs stack; the
// usePdfJs=true branch is verified by asserting this stub renders.
vi.mock("../components/PdfJsViewer", () => ({
  default: ({ pageNumber }: { pageNumber?: number }) => (
    <div data-testid="pdfjs-viewer" data-page={String(pageNumber)} />
  ),
}));

beforeAll(() => {
  initI18n();
});

beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:mock-url");
  URL.revokeObjectURL = vi.fn();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
    configurable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const pdf = () => new File(["%PDF-"], "doc.pdf", { type: "application/pdf" });
const png = () =>
  new File([new Uint8Array([1])], "img.png", { type: "image/png" });
const txt = () => {
  const f = new File(["hello world"], "notes.txt", { type: "text/plain" });
  f.text = vi.fn().mockResolvedValue("hello world");
  return f;
};

describe("FilePreviewer", () => {
  it("shows the not-supported message and no buttons when file is null", () => {
    render(<FilePreviewer file={null} />);
    expect(
      screen.getByText("Preview is not supported for this file type."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders an image via <img> with a blob URL", () => {
    render(<FilePreviewer file={png()} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "blob:mock-url");
    expect(img).toHaveAttribute("alt", "File preview");
  });

  it("falls back to the not-supported message when the image fails to load", () => {
    render(<FilePreviewer file={png()} />);
    fireEvent.error(screen.getByRole("img"));
    expect(
      screen.getByText("Preview is not supported for this file type."),
    ).toBeInTheDocument();
  });

  it("renders a PDF via PdfJsViewer when usePdfJs is true", () => {
    render(<FilePreviewer file={pdf()} usePdfJs pageNumber={4} />);
    expect(screen.getByTestId("pdfjs-viewer")).toHaveAttribute(
      "data-page",
      "4",
    );
  });

  it("renders a PDF via <iframe> with the page anchor when usePdfJs is false", () => {
    render(<FilePreviewer file={pdf()} iframeParams="#page=3" />);
    expect(screen.getByTitle("File content")).toHaveAttribute(
      "src",
      "blob:mock-url#page=3",
    );
  });

  it("renders text inline via <pre> when usePdfJs is true", async () => {
    render(<FilePreviewer file={txt()} usePdfJs />);
    expect(await screen.findByText("hello world")).toBeInTheDocument();
  });

  it("renders text via <iframe> when usePdfJs is false", () => {
    render(<FilePreviewer file={txt()} />);
    expect(screen.getByTitle("File content")).toHaveAttribute(
      "src",
      "blob:mock-url",
    );
  });

  it("shows fallback for unsupported types but still renders action buttons", () => {
    render(
      <FilePreviewer
        file={new File(["x"], "a.bin", { type: "application/octet-stream" })}
      />,
    );
    expect(
      screen.getByText("Preview is not supported for this file type."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download" }),
    ).toBeInTheDocument();
  });

  it("downloads the file when Download is clicked", () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    render(<FilePreviewer file={pdf()} />);
    fireEvent.click(screen.getByRole("button", { name: "Download" }));
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it("copies a blob link when Copy link is clicked", async () => {
    render(<FilePreviewer file={pdf()} />);
    fireEvent.click(screen.getByRole("button", { name: /Copy link/ }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "blob:mock-url",
      ),
    );
  });
});
