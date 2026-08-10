import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import * as pdfjs from "pdfjs-dist";

import PdfJsViewer from "../components/PdfJsViewer";
import { initI18n } from "../i18n";

// Mock the pdf.js engine (and its worker module) so no real PDF parsing runs.
vi.mock("pdfjs-dist", () => ({
  GlobalWorkerOptions: { workerSrc: "" },
  getDocument: vi.fn(),
}));
vi.mock("pdfjs-dist/build/pdf.worker.min.mjs", () => ({ default: {} }));

const makePage = () => ({
  getViewport: () => ({ width: 600, height: 800 }),
  render: () => ({ promise: Promise.resolve() }),
});
const makeDoc = (numPages = 3) => ({
  numPages,
  getPage: vi.fn(() => Promise.resolve(makePage())),
  destroy: vi.fn(),
});

const pdfFile = () => {
  const f = new File(["%PDF-"], "doc.pdf", { type: "application/pdf" });
  f.arrayBuffer = vi.fn().mockResolvedValue(new ArrayBuffer(8));
  return f;
};

beforeAll(() => {
  initI18n();
});

beforeEach(() => {
  // jsdom stubs: canvas 2d context, scrollIntoView, and synchronous rAF.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({}) as never);
  Element.prototype.scrollIntoView = vi.fn();
  vi.spyOn(global, "requestAnimationFrame").mockImplementation((cb: never) => {
    (cb as (t: number) => void)(0);
    return 0;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("PdfJsViewer", () => {
  it("renders one canvas per page and scrolls to the cited page", async () => {
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve(makeDoc(3)),
    } as never);

    const { container } = render(
      <PdfJsViewer file={pdfFile()} pageNumber={2} />,
    );

    await waitFor(() =>
      expect(container.querySelectorAll("canvas")).toHaveLength(3),
    );
    // The scroll happens at the end of an async render chain, so it can land
    // several ticks after the canvases mount — poll instead of asserting once.
    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
  });

  it("renders visible pages on scroll without throwing", async () => {
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.resolve(makeDoc(2)),
    } as never);

    const { container } = render(<PdfJsViewer file={pdfFile()} />);
    await waitFor(() =>
      expect(container.querySelectorAll("canvas").length).toBeGreaterThan(0),
    );

    const scroller = container.querySelector("div")!;
    fireEvent.scroll(scroller);
    expect(scroller).toBeInTheDocument();
  });

  it("shows an error message when the PDF fails to load", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(pdfjs.getDocument).mockReturnValue({
      promise: Promise.reject(new Error("boom")),
    } as never);

    render(<PdfJsViewer file={pdfFile()} />);

    expect(
      await screen.findByText("Failed to load file preview."),
    ).toBeInTheDocument();
  });
});
