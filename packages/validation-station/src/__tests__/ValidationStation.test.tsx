/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { ValidationStation } from "../ValidationStation";

vi.mock("../useWcReady", () => ({
  useWcReady: () => true,
}));

const mockUseSubcomponentArtifacts = vi.fn();

vi.mock("../useResolvedArtifacts", () => ({
  useResolvedArtifacts: (...args: any[]) =>
    mockUseSubcomponentArtifacts(...args),
}));

const mockSubmitValidatedData = vi.fn();
const mockSaveValidatedDataAsDraft = vi.fn();

vi.mock("../saveValidatedDataUtil", () => ({
  submitValidatedData: (...args: any[]) => mockSubmitValidatedData(...args),
  saveValidatedDataAsDraft: (...args: any[]) =>
    mockSaveValidatedDataAsDraft(...args),
}));

const mockArtifacts = {
  taxonomy: { fields: [] },
  extractionResult: { results: [] },
  dom: { pages: [] },
  text: undefined,
  customizationInfo: undefined,
  original: undefined,
};

const baseProps: any = {
  sdk: {},
  data: {
    DocumentId: "doc-123",
    FolderId: 42,
  },
};

/** Mirrors the real hook's resolution rules. */
const resolved = (source: any = {}, overrides: any = {}) => ({
  artifacts: mockArtifacts,
  error: null,
  documentId: source.documentId ?? source.data?.DocumentId,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSubcomponentArtifacts.mockImplementation((source: any) =>
    resolved(source),
  );
});

describe("ValidationStation", () => {
  it("renders the standalone web component element once the WC is ready", async () => {
    const { container } = render(<ValidationStation {...baseProps} />);
    await waitFor(() => {
      expect(
        container.querySelector(
          "ui-du-validation-station-standalone-wc-element",
        ),
      ).toBeInTheDocument();
    });
  });

  it("passes props to the web component", async () => {
    const { container } = render(
      <ValidationStation
        {...baseProps}
        theme="dark"
        language="fr"
        save={{ validate: true }}
      />,
    );

    await waitFor(() => {
      expect(
        container.querySelector(
          "ui-du-validation-station-standalone-wc-element",
        ),
      ).toBeInTheDocument();
    });
  });

  it("renders error when artifact resolution returns an error", async () => {
    mockUseSubcomponentArtifacts.mockImplementation((source: any) =>
      resolved(source, { artifacts: null, error: "Something went wrong" }),
    );

    // `await act` flushes the WC-ready promise the mount effect subscribes to,
    // so the trailing setWcReady state update happens inside act (no warning).
    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ValidationStation {...baseProps} />));
    });
    expect(container.textContent).toContain(
      "Failed to load document artifacts",
    );
  });

  it("renders loading state when artifacts are null", async () => {
    mockUseSubcomponentArtifacts.mockImplementation((source: any) =>
      resolved(source, { artifacts: null }),
    );

    let container!: HTMLElement;
    await act(async () => {
      ({ container } = render(<ValidationStation {...baseProps} />));
    });
    expect(container.textContent).toContain("Loading...");
  });

  describe("event wiring", () => {
    const waitForWc = async (container: HTMLElement) =>
      await waitFor(() => {
        const el = container.querySelector(
          "ui-du-validation-station-standalone-wc-element",
        );
        if (!el) throw new Error("WC element not mounted");
        return el;
      });

    it("persists a submit itself and emits the request plus the outcome", async () => {
      mockSubmitValidatedData.mockResolvedValue({ success: true });
      const onSubmit = vi.fn();
      const { container } = render(
        <ValidationStation {...baseProps} onSubmit={onSubmit} />,
      );
      const el = await waitForWc(container);

      const detail = { documentId: "doc-123", validatedData: { v: 1 } };
      el.dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

      await waitFor(() => {
        expect(mockSubmitValidatedData).toHaveBeenCalledWith(
          baseProps.sdk,
          baseProps.data,
          detail,
        );
      });
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(detail, { success: true });
      });
    });

    it("persists a draft itself and emits the request plus the outcome", async () => {
      mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });
      const onSaveAsDraft = vi.fn();
      const { container } = render(
        <ValidationStation {...baseProps} onSaveAsDraft={onSaveAsDraft} />,
      );
      const el = await waitForWc(container);

      const detail = { documentId: "doc-123", validatedData: { d: 2 } };
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataAsDraftRequest", { detail }),
      );

      await waitFor(() => {
        expect(mockSaveValidatedDataAsDraft).toHaveBeenCalledWith(
          baseProps.sdk,
          baseProps.data,
          detail,
        );
      });
      await waitFor(() => {
        expect(onSaveAsDraft).toHaveBeenCalledWith(detail, { success: true });
      });
    });

    it("emits the exception request untouched, and never persists it", async () => {
      const onReportException = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          onReportException={onReportException}
        />,
      );
      const el = await waitForWc(container);

      const detail = {
        documentId: "doc-xyz",
        exceptionReport: { Reason: "missing page" },
      };
      el.dispatchEvent(
        new CustomEvent("saveExceptionReportRequest", { detail }),
      );

      expect(onReportException).toHaveBeenCalledWith(detail);
      expect(mockSubmitValidatedData).not.toHaveBeenCalled();
    });

    it("does not throw when callbacks are not provided", async () => {
      mockSubmitValidatedData.mockResolvedValue({ success: true });
      mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });

      const { container } = render(<ValidationStation {...baseProps} />);
      const el = await waitForWc(container);

      // None of these should throw despite no callbacks being wired.
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataRequest", {
          detail: { documentId: "d", validatedData: {} },
        }),
      );
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataAsDraftRequest", {
          detail: { documentId: "d", validatedData: {} },
        }),
      );
      el.dispatchEvent(
        new CustomEvent("saveExceptionReportRequest", {
          detail: { documentId: "d", exceptionReport: {} },
        }),
      );

      await waitFor(() => {
        expect(mockSubmitValidatedData).toHaveBeenCalled();
        expect(mockSaveValidatedDataAsDraft).toHaveBeenCalled();
      });
    });
  });

  describe("pre-fetched artifacts (no sdk/data)", () => {
    const prefetchedProps: any = {
      artifacts: mockArtifacts,
      documentId: "doc-prefetched",
    };

    const waitForWc = async (container: HTMLElement) =>
      await waitFor(() => {
        const el = container.querySelector(
          "ui-du-validation-station-standalone-wc-element",
        );
        if (!el) throw new Error("WC element not mounted");
        return el;
      });

    it("renders the web component from artifacts passed in as props", async () => {
      const { container } = render(<ValidationStation {...prefetchedProps} />);

      await waitForWc(container);
      expect(mockUseSubcomponentArtifacts).toHaveBeenCalledWith(
        expect.objectContaining({
          artifacts: mockArtifacts,
          documentId: "doc-prefetched",
          sdk: undefined,
          data: undefined,
        }),
      );
    });

    it("emits the request with no outcome when it cannot persist", async () => {
      const onSubmit = vi.fn();
      const onSaveAsDraft = vi.fn();
      const { container } = render(
        <ValidationStation
          {...prefetchedProps}
          onSubmit={onSubmit}
          onSaveAsDraft={onSaveAsDraft}
        />,
      );
      const el = await waitForWc(container);

      const submitDetail = { documentId: "doc-prefetched", validatedData: {} };
      const draftDetail = { documentId: "doc-prefetched", validatedData: {} };
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataRequest", { detail: submitDetail }),
      );
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataAsDraftRequest", {
          detail: draftDetail,
        }),
      );

      // Same callbacks as self-fetching mode, minus the outcome the widget
      // cannot know — the write-back is the host's.
      expect(onSubmit).toHaveBeenCalledWith(submitDetail);
      expect(onSaveAsDraft).toHaveBeenCalledWith(draftDetail);
      expect(mockSubmitValidatedData).not.toHaveBeenCalled();
      expect(mockSaveValidatedDataAsDraft).not.toHaveBeenCalled();
    });

    it("does not throw when no callback is wired and it cannot persist", async () => {
      const { container } = render(<ValidationStation {...prefetchedProps} />);
      const el = await waitForWc(container);

      el.dispatchEvent(
        new CustomEvent("saveValidatedDataRequest", {
          detail: { documentId: "doc-prefetched", validatedData: {} },
        }),
      );

      expect(mockSubmitValidatedData).not.toHaveBeenCalled();
    });

    it("still reports exceptions to the host", async () => {
      const onReportException = vi.fn();
      const { container } = render(
        <ValidationStation
          {...prefetchedProps}
          onReportException={onReportException}
        />,
      );
      const el = await waitForWc(container);

      const detail = {
        documentId: "doc-prefetched",
        exceptionReport: { Reason: "blurry scan" },
      };
      el.dispatchEvent(
        new CustomEvent("saveExceptionReportRequest", { detail }),
      );

      expect(onReportException).toHaveBeenCalledWith(detail);
    });
  });
});
