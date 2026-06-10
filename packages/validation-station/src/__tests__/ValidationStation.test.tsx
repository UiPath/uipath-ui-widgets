/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { ValidationStation } from "../ValidationStation";

vi.mock("../loadValidationStationWc", () => ({
  validationStationWcReady: Promise.resolve(),
  VALIDATION_STATION_TAG: "ui-du-validation-station-standalone-wc-element",
}));

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
        enableSaveAsDraft={true}
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
