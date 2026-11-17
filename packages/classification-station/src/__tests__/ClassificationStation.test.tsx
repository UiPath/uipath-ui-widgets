/* eslint-disable @typescript-eslint/no-explicit-any */
import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClassificationStation } from "../ClassificationStation";

const TAG = "ui-du-classification-station-standalone-wc-element";

const mockWcReady = vi.fn<(tag: string) => boolean>(() => true);
vi.mock("../useWcReady", () => ({
  useWcReady: (tag: string) => mockWcReady(tag),
}));

const mockUseResolvedArtifacts = vi.fn();
vi.mock("../useResolvedArtifacts", () => ({
  useResolvedArtifacts: (...args: any[]) => mockUseResolvedArtifacts(...args),
}));

const mockSubmitClassification = vi.fn();
const mockSaveClassificationAsDraft = vi.fn();
vi.mock("../saveClassificationUtil", () => ({
  submitClassification: (...args: any[]) => mockSubmitClassification(...args),
  saveClassificationAsDraft: (...args: any[]) =>
    mockSaveClassificationAsDraft(...args),
}));

const mockTrackTelemetry = vi.fn();
vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: (...args: any[]) => mockTrackTelemetry(...args),
}));

// The element's inputs. The stub records each assignment, as an upgraded
// element would take it: as a property, in order.
const INPUTS = [
  "documentId",
  "dom",
  "text",
  "original",
  "docTypes",
  "classificationResults",
  "customizationInfo",
  "theme",
  "language",
  "isReadonly",
  "enableSaveAsDraft",
  "pdfSettings",
  "pageUris",
  "enableTokenFeatures",
  "allowNotClassifiedGroups",
  "supportNotClassifiedGroups",
  "disableShortcutsPanel",
  "showCreateNewDocTypeOption",
  "customNotClassifiedLabel",
  "documentViewerOptions",
];

class StubElement extends HTMLElement {
  assigned: string[] = [];
  values: Record<string, unknown> = {};
}
for (const key of INPUTS) {
  Object.defineProperty(StubElement.prototype, key, {
    get(this: StubElement) {
      return this.values[key];
    },
    set(this: StubElement, value: unknown) {
      this.assigned.push(key);
      this.values[key] = value;
    },
  });
}
for (const tag of [TAG, TAG.replace(/-element$/, "-persistent-element")]) {
  if (!customElements.get(tag)) {
    customElements.define(tag, class extends StubElement {});
  }
}

const mockArtifacts = {
  docTypes: [{ DocumentTypeId: "invoice" }],
  classificationResults: null,
  dom: { Pages: [] },
  text: "text",
  original: "data:application/pdf;base64,AAA",
  customizationInfo: { FeatureCustomization: null },
};

const sdk = {} as any;
const data = { DocumentId: "doc-123", FolderId: 42 } as any;

const request = {
  documentId: "doc-123",
  classification: { Classifications: [] },
  automaticClassificationResults: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockWcReady.mockReturnValue(true);
  mockUseResolvedArtifacts.mockImplementation((source: any) => ({
    artifacts: mockArtifacts,
    error: null,
    documentId: source.documentId ?? source.data?.DocumentId,
  }));
});

const element = (container: HTMLElement) => container.querySelector(TAG) as any;

function dispatch(el: HTMLElement, type: string, detail?: unknown) {
  act(() => {
    el.dispatchEvent(new CustomEvent(type, { detail }));
  });
}

describe("ClassificationStation", () => {
  it("hands the element its artifacts and defaults as properties", () => {
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    const el = element(container);
    expect(el).not.toBeNull();
    expect(el.docTypes).toBe(mockArtifacts.docTypes);
    expect(el.dom).toBe(mockArtifacts.dom);
    expect(el.text).toBe("text");
    expect(el.original).toBe(mockArtifacts.original);
    expect(el.customizationInfo).toBe(mockArtifacts.customizationInfo);
    expect(el.documentId).toBe("doc-123");
    expect(el.theme).toBe("light");
    expect(el.language).toBe("en");
    expect(el.isReadonly).toBe(false);
    expect(el.enableSaveAsDraft).toBe(true);
  });

  it("passes a null classification through: it means an unclassified file", () => {
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    const el = element(container);
    expect(el.assigned).toContain("classificationResults");
    expect(el.classificationResults).toBeNull();
  });

  it("leaves unset inputs unassigned so the element keeps its own defaults", () => {
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    const el = element(container);
    expect(el.assigned).not.toContain("enableTokenFeatures");
    expect(el.assigned).not.toContain("allowNotClassifiedGroups");
  });

  it("assigns documentId last, so the station mounts once with its data", () => {
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    const { assigned } = element(container);
    expect(assigned.at(-1)).toBe("documentId");
    expect(assigned.filter((k: string) => k === "documentId")).toHaveLength(1);
  });

  it("forwards the configuration inputs", () => {
    const documentViewerOptions = { disableSelection: true };
    const { container } = render(
      <ClassificationStation
        artifacts={mockArtifacts}
        documentId="doc-9"
        theme="future-dark"
        isReadonly
        enableSaveAsDraft={false}
        enableTokenFeatures={false}
        supportNotClassifiedGroups
        customNotClassifiedLabel="Other"
        documentViewerOptions={documentViewerOptions}
      />,
    );
    const el = element(container);
    expect(el.theme).toBe("future-dark");
    expect(el.isReadonly).toBe(true);
    expect(el.enableSaveAsDraft).toBe(false);
    expect(el.enableTokenFeatures).toBe(false);
    expect(el.supportNotClassifiedGroups).toBe(true);
    expect(el.customNotClassifiedLabel).toBe("Other");
    expect(el.documentViewerOptions).toBe(documentViewerOptions);
    expect(el.documentId).toBe("doc-9");
  });

  it("renders the persistent variant and force-destroys it on unmount", () => {
    const { container, unmount } = render(
      <ClassificationStation sdk={sdk} data={data} persistent />,
    );
    const el = element(container) ?? container.firstElementChild;
    expect(el.tagName.toLowerCase()).toBe(
      "ui-du-classification-station-standalone-wc-persistent-element",
    );
    expect(mockWcReady).toHaveBeenCalledWith(
      "ui-du-classification-station-standalone-wc-persistent-element",
    );
    el.forceDestroy = vi.fn();
    unmount();
    expect(el.forceDestroy).toHaveBeenCalledTimes(1);
  });

  it("shows the loading state until the element is defined", () => {
    mockWcReady.mockReturnValue(false);
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    expect(element(container)).toBeNull();
    expect(container.textContent).toBe("Loading...");
  });

  it("shows the fetch error", () => {
    mockUseResolvedArtifacts.mockReturnValue({
      artifacts: null,
      error: "boom",
      documentId: undefined,
    });
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} />,
    );
    expect(container.textContent).toBe(
      "Failed to load document artifacts: boom",
    );
  });

  it.each([
    ["dirty", "onDirtyChange", true],
    ["hasChanges", "onHasChangesChange", true],
    [
      "splitClassifications",
      "onSplitClassifications",
      { split: [{ documentTypeId: "invoice", pageRange: "1-3" }] },
    ],
    ["createNewDocType", "onCreateNewDocType", undefined],
  ])("reports %s through %s", (event, prop, detail) => {
    const handler = vi.fn();
    const { container } = render(
      <ClassificationStation sdk={sdk} data={data} {...{ [prop]: handler }} />,
    );
    dispatch(element(container), event, detail);
    // A CustomEvent without a detail carries null.
    expect(handler).toHaveBeenCalledWith(detail ?? null);
  });

  describe("save flows", () => {
    it("persists a submit itself given sdk + data, and passes the outcome", async () => {
      mockSubmitClassification.mockResolvedValue({ success: true });
      const onSubmit = vi.fn();
      const { container } = render(
        <ClassificationStation sdk={sdk} data={data} onSubmit={onSubmit} />,
      );
      dispatch(element(container), "saveClassificationRequest", request);

      await waitFor(() =>
        expect(onSubmit).toHaveBeenCalledWith(request, { success: true }),
      );
      expect(mockSubmitClassification).toHaveBeenCalledWith(sdk, data, request);
      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "ClassificationStation.Submit",
        "ClassificationStation.Success",
      );
    });

    it("tracks a failed submit as an error", async () => {
      mockSubmitClassification.mockResolvedValue({
        success: false,
        error: "403",
      });
      const onSubmit = vi.fn();
      const { container } = render(
        <ClassificationStation sdk={sdk} data={data} onSubmit={onSubmit} />,
      );
      dispatch(element(container), "saveClassificationRequest", request);
      await waitFor(() => expect(onSubmit).toHaveBeenCalled());
      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "ClassificationStation.Submit",
        "ClassificationStation.Error",
      );
    });

    it("persists a draft itself given sdk + data", async () => {
      mockSaveClassificationAsDraft.mockResolvedValue({ success: true });
      const onSaveAsDraft = vi.fn();
      const { container } = render(
        <ClassificationStation
          sdk={sdk}
          data={data}
          onSaveAsDraft={onSaveAsDraft}
        />,
      );
      dispatch(element(container), "saveClassificationAsDraftRequest", request);
      await waitFor(() =>
        expect(onSaveAsDraft).toHaveBeenCalledWith(request, { success: true }),
      );
    });

    it("hands the request to the host, with no outcome, in pre-fetched mode", () => {
      const onSubmit = vi.fn();
      const onSaveAsDraft = vi.fn();
      const { container } = render(
        <ClassificationStation
          artifacts={mockArtifacts}
          onSubmit={onSubmit}
          onSaveAsDraft={onSaveAsDraft}
        />,
      );
      dispatch(element(container), "saveClassificationRequest", request);
      dispatch(element(container), "saveClassificationAsDraftRequest", request);

      expect(onSubmit).toHaveBeenCalledWith(request);
      expect(onSaveAsDraft).toHaveBeenCalledWith(request);
      expect(mockSubmitClassification).not.toHaveBeenCalled();
      expect(mockSaveClassificationAsDraft).not.toHaveBeenCalled();
    });

    it("does not persist when data names no folder", () => {
      const onSubmit = vi.fn();
      const { container } = render(
        <ClassificationStation
          sdk={sdk}
          data={{ DocumentId: "doc-123" } as any}
          onSubmit={onSubmit}
        />,
      );
      dispatch(element(container), "saveClassificationRequest", request);
      expect(onSubmit).toHaveBeenCalledWith(request);
      expect(mockSubmitClassification).not.toHaveBeenCalled();
    });

    it("always leaves an exception report to the host", () => {
      const onReportException = vi.fn();
      const exception = {
        documentId: "doc-123",
        exceptionReport: { DocumentId: "doc-123", Reason: "Unreadable" },
      };
      const { container } = render(
        <ClassificationStation
          sdk={sdk}
          data={data}
          onReportException={onReportException}
        />,
      );
      dispatch(element(container), "saveExceptionReportRequest", exception);
      expect(onReportException).toHaveBeenCalledWith(exception);
      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "ClassificationStation.ExceptionRequest",
        "ClassificationStation.Success",
      );
    });

    it("dispatches to the latest handler without rebinding", () => {
      const first = vi.fn();
      const second = vi.fn();
      const { container, rerender } = render(
        <ClassificationStation artifacts={mockArtifacts} onSubmit={first} />,
      );
      rerender(
        <ClassificationStation artifacts={mockArtifacts} onSubmit={second} />,
      );
      dispatch(element(container), "saveClassificationRequest", request);
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledWith(request);
    });
  });
});
