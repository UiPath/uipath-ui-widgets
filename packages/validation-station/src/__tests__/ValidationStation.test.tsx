/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { ValidationStation } from "../ValidationStation";

vi.mock("../loadValidationStationWc", () => ({
  validationStationWcReady: Promise.resolve(),
  VALIDATION_STATION_TAG: "ui-du-validation-station-standalone-wc-element",
}));

const mockUseBucketArtifacts = vi.fn();

vi.mock("../useBucketArtifacts", () => ({
  useBucketArtifacts: (...args: any[]) => mockUseBucketArtifacts(...args),
}));

// Mocked so the tests can assert the widget never persists — the helpers stay
// in the package as opt-in host API, but the widget must not call them.
const mockSubmitToOrchestrator = vi.fn();
const mockSaveDraftToOrchestrator = vi.fn();

vi.mock("../orchestratorPersistence", () => ({
  submitValidatedDataToOrchestrator: (...args: any[]) =>
    mockSubmitToOrchestrator(...args),
  saveValidatedDataAsDraftToOrchestrator: (...args: any[]) =>
    mockSaveDraftToOrchestrator(...args),
}));

const mockTrackTelemetry = vi.fn();

vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: (...args: any[]) => mockTrackTelemetry(...args),
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
    it("forwards saveValidatedDataRequest to the host and tracks the emit", async () => {
      const onSaveValidatedDataRequest = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          onSaveValidatedDataRequest={onSaveValidatedDataRequest}
        />,
      );
      const el = await waitForWc(container);

      const detail = { documentId: "doc-123", validatedData: { v: 1 } };
      el.dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

      expect(onSaveValidatedDataRequest).toHaveBeenCalledWith(detail);
      // The widget persists nothing — the host owns the write.
      expect(mockSubmitToOrchestrator).not.toHaveBeenCalled();
      // Telemetry marks the emit, not an outcome the widget cannot know.
      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "ValidationStation.Submit",
        "ValidationStation.Success",
      );
    });

    it("forwards saveValidatedDataAsDraftRequest to the host", async () => {
      const onSaveValidatedDataAsDraftRequest = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
          onSaveValidatedDataAsDraftRequest={onSaveValidatedDataAsDraftRequest}
        />,
      );
      const el = await waitForWc(container);

      const detail = { documentId: "doc-123", validatedData: { d: 2 } };
      el.dispatchEvent(
        new CustomEvent("saveValidatedDataAsDraftRequest", { detail }),
      );

      expect(onSaveValidatedDataAsDraftRequest).toHaveBeenCalledWith(detail);
      expect(mockSaveDraftToOrchestrator).not.toHaveBeenCalled();
    });

    it("extracts documentId + reason from saveExceptionReportRequest and calls onReportExceptionComplete", async () => {
      const onReportExceptionComplete = vi.fn();
      const { container } = render(
        <ValidationStation
          {...baseProps}
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
      const { container } = render(<ValidationStation {...baseProps} />);
      const el = await waitForWc(container);

      expect(() => {
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
      }).not.toThrow();
    });
  });
});
