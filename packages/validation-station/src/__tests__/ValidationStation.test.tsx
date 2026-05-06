/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ValidationStation } from "../ValidationStation";

const mockLoadValidationStationWebComponent = vi.fn();

vi.mock("@uipath/du-shared-util-mfe", () => ({
  loadValidationStationWebComponent: (...args: any[]) =>
    mockLoadValidationStationWebComponent(...args),
}));

beforeEach(() => {
  mockLoadValidationStationWebComponent.mockResolvedValue(undefined);
});

const mockUseBucketArtifacts = vi.fn();

vi.mock("../useBucketArtifacts", () => ({
  useBucketArtifacts: (...args: any[]) => mockUseBucketArtifacts(...args),
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
  it("loads the validation station web component on mount with the default asset URL", async () => {
    render(<ValidationStation {...baseProps} />);
    await waitFor(() => {
      expect(mockLoadValidationStationWebComponent).toHaveBeenCalledWith(
        document,
        "node_modules/@uipath/du-validation-station-wc",
      );
    });
  });

  it("loads the validation station web component from a custom wcAssetsUrl", async () => {
    render(<ValidationStation {...baseProps} wcAssetsUrl="/assets/vs-wc" />);
    await waitFor(() => {
      expect(mockLoadValidationStationWebComponent).toHaveBeenCalledWith(
        document,
        "/assets/vs-wc",
      );
    });
  });

  it("renders an error when the web component fails to load", async () => {
    mockLoadValidationStationWebComponent.mockRejectedValueOnce(
      new Error("script load failed"),
    );

    const { container } = render(<ValidationStation {...baseProps} />);
    await waitFor(() => {
      expect(container.textContent).toContain(
        "Failed to load validation station",
      );
      expect(container.textContent).toContain("script load failed");
    });
  });

  it("renders the standalone web component element", () => {
    const { container } = render(<ValidationStation {...baseProps} />);
    expect(
      container.querySelector("ui-du-validation-station-standalone-wc-element"),
    ).toBeInTheDocument();
  });

  it("renders the web component as root element", () => {
    const { container } = render(<ValidationStation {...baseProps} />);
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
    expect(root?.tagName.toLowerCase()).toBe(
      "ui-du-validation-station-standalone-wc-element",
    );
  });

  it("passes props to the web component", () => {
    const { container } = render(
      <ValidationStation
        {...baseProps}
        theme="dark"
        language="fr"
        enableSaveAsDraft={true}
        save={{ validate: true }}
      />,
    );

    const el = container.querySelector(
      "ui-du-validation-station-standalone-wc-element",
    );
    expect(el).toBeInTheDocument();
  });

  it("renders error when useBucketArtifacts returns error", () => {
    mockUseBucketArtifacts.mockReturnValue({
      artifacts: null,
      error: "Something went wrong",
    });

    const { container } = render(<ValidationStation {...baseProps} />);
    expect(container.textContent).toContain(
      "Failed to load document artifacts",
    );
  });

  it("renders loading state when artifacts are null", () => {
    mockUseBucketArtifacts.mockReturnValue({
      artifacts: null,
      error: null,
    });

    const { container } = render(<ValidationStation {...baseProps} />);
    expect(container.textContent).toContain("Loading...");
  });
});
