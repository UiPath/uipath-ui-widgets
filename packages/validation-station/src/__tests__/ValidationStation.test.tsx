/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { ValidationStation } from "../ValidationStation";

vi.mock("../loadValidationStationWc", () => ({
  waitForWcElementReady: () => Promise.resolve(),
  VALIDATION_STATION_TAG: "ui-du-validation-station-standalone-wc-element",
}));

const mockUseBucketArtifacts = vi.fn();

vi.mock("../useBucketArtifacts", () => ({
  useBucketArtifacts: (...args: any[]) => mockUseBucketArtifacts(...args),
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
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockUseBucketArtifacts.mockReturnValue({
    artifacts: mockArtifacts,
    error: null,
  });
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

  it("renders error when useBucketArtifacts returns error", async () => {
    mockUseBucketArtifacts.mockReturnValue({
      artifacts: null,
      error: "Something went wrong",
    });

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
    mockUseBucketArtifacts.mockReturnValue({
      artifacts: null,
      error: null,
    });

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

    it("forwards saveValidatedDataRequest to submitValidatedData and onSubmitComplete", async () => {
      mockSubmitValidatedData.mockResolvedValue({ success: true });
      const onSubmitComplete = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          folderId={42}
          onSubmitComplete={onSubmitComplete}
        />,
      );
      const el = await waitForWc(container);

      const detail = { documentId: "doc-123", validatedData: { v: 1 } };
      el.dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

      await waitFor(() => {
        expect(mockSubmitValidatedData).toHaveBeenCalledWith(
          baseProps.sdk,
          baseProps.data,
          42,
          detail,
        );
      });
      await waitFor(() => {
        expect(onSubmitComplete).toHaveBeenCalledWith({ success: true });
      });
    });

    it("forwards saveValidatedDataAsDraftRequest to saveValidatedDataAsDraft and onSaveAsDraftComplete", async () => {
      mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });
      const onSaveAsDraftComplete = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          folderId={42}
          onSaveAsDraftComplete={onSaveAsDraftComplete}
        />,
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
          42,
          detail,
        );
      });
      await waitFor(() => {
        expect(onSaveAsDraftComplete).toHaveBeenCalledWith({ success: true });
      });
    });

    it("extracts documentId + reason from saveExceptionReportRequest and calls onReportExceptionComplete", async () => {
      const onReportExceptionComplete = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          folderId={42}
          onReportExceptionComplete={onReportExceptionComplete}
        />,
      );
      const el = await waitForWc(container);

      el.dispatchEvent(
        new CustomEvent("saveExceptionReportRequest", {
          detail: {
            documentId: "doc-xyz",
            exceptionReport: { Reason: "missing page" },
          },
        }),
      );

      expect(onReportExceptionComplete).toHaveBeenCalledWith(
        "doc-xyz",
        "missing page",
      );
    });

    it("falls back to empty reason when the exception DTO has no Reason field", async () => {
      const onReportExceptionComplete = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          folderId={42}
          onReportExceptionComplete={onReportExceptionComplete}
        />,
      );
      const el = await waitForWc(container);

      el.dispatchEvent(
        new CustomEvent("saveExceptionReportRequest", {
          detail: { documentId: "doc-abc", exceptionReport: null },
        }),
      );

      expect(onReportExceptionComplete).toHaveBeenCalledWith("doc-abc", "");
    });

    it("does not throw when callbacks are not provided", async () => {
      mockSubmitValidatedData.mockResolvedValue({ success: true });
      mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });

      const { container } = render(
        <ValidationStation {...baseProps} folderId={42} />,
      );
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
});
