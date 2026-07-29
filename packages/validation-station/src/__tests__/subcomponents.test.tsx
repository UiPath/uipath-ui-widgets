/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// ── Mocks ──────────────────────────────────────────────────────────────────
// Avoid the heavy Angular-bundle side effects of the real module; keep the tag
// map + the real convertToPersistentTag logic so useWcElement picks the correct variant.
vi.mock("../loadValidationStationWc", () => ({
  DU_WC_TAGS: {
    validationStation: "ui-du-validation-station-standalone-wc-element",
    documentViewer: "ui-du-document-viewer-standalone-wc-element",
    compactFieldsForm: "ui-du-compact-fields-form-standalone-wc-element",
    compactTableEditor: "ui-du-compact-table-editor-standalone-wc-element",
    compactBusinessRules: "ui-du-compact-business-rules-standalone-wc-element",
    compactDocTypeField: "ui-du-compact-doc-type-field-standalone-wc-element",
  },
  convertToPersistentTag: (tag: string) =>
    tag.replace(/-element$/, "-persistent-element"),
}));

const mockUseSubcomponentArtifacts = vi.fn();
vi.mock("../useSubcomponentArtifacts", () => ({
  useSubcomponentArtifacts: (...args: any[]) =>
    mockUseSubcomponentArtifacts(...args),
}));

vi.mock("../useWcReady", () => ({
  useWcReady: () => true,
}));

const mockSubmitToOrchestrator = vi.fn();
const mockSaveDraftToOrchestrator = vi.fn();
vi.mock("../orchestratorPersistence", () => ({
  submitValidatedDataToOrchestrator: (...args: any[]) =>
    mockSubmitToOrchestrator(...args),
  saveValidatedDataAsDraftToOrchestrator: (...args: any[]) =>
    mockSaveDraftToOrchestrator(...args),
}));

import { CompactBusinessRules } from "../subcomponents/CompactBusinessRules";
import { CompactDocTypeField } from "../subcomponents/CompactDocTypeField";
import { CompactFieldsForm } from "../subcomponents/CompactFieldsForm";
import { CompactTableEditor } from "../subcomponents/CompactTableEditor";
import { DocumentViewer } from "../subcomponents/DocumentViewer";

const mockArtifacts = {
  taxonomy: { fields: [] },
  extractionResult: { results: [] },
  dom: { pages: [] },
  text: undefined,
  customizationInfo: undefined,
  original: undefined,
};

function readyState(overrides: Record<string, any> = {}) {
  return {
    artifacts: mockArtifacts,
    error: null,
    documentId: "doc-123",
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockUseSubcomponentArtifacts.mockReturnValue(readyState());
});

const cases: Array<{
  name: string;
  Component: React.FC<any>;
  tag: string;
}> = [
  {
    name: "DocumentViewer",
    Component: DocumentViewer,
    tag: "ui-du-document-viewer-standalone-wc-element",
  },
  {
    name: "CompactFieldsForm",
    Component: CompactFieldsForm,
    tag: "ui-du-compact-fields-form-standalone-wc-element",
  },
  {
    name: "CompactTableEditor",
    Component: CompactTableEditor,
    tag: "ui-du-compact-table-editor-standalone-wc-element",
  },
  {
    name: "CompactBusinessRules",
    Component: CompactBusinessRules,
    tag: "ui-du-compact-business-rules-standalone-wc-element",
  },
  {
    name: "CompactDocTypeField",
    Component: CompactDocTypeField,
    tag: "ui-du-compact-doc-type-field-standalone-wc-element",
  },
];

describe.each(cases)("$name", ({ Component, tag }) => {
  it("renders the standalone element when artifacts are ready", () => {
    const { container } = render(<Component instanceId="i1" />);
    expect(container.querySelector(tag)).toBeInTheDocument();
  });

  it("forwards common + resolved props onto the element", () => {
    const { container } = render(<Component instanceId="i1" theme="dark" />);
    const el = container.querySelector(tag)!;
    // instanceId → kebab attribute; theme passes through; documentId comes from
    // the resolved artifacts state, not the caller — proves the wiring end to end.
    expect(el.getAttribute("instance-id")).toBe("i1");
    expect(el.getAttribute("theme")).toBe("dark");
    expect(el.getAttribute("documentid")).toBe("doc-123");
  });

  it("renders the persistent variant when persistent is set", () => {
    const { container } = render(<Component instanceId="i1" persistent />);
    expect(
      container.querySelector(tag.replace(/-element$/, "-persistent-element")),
    ).toBeInTheDocument();
  });

  it("renders the error fallback when the artifacts hook reports an error", () => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ artifacts: null, error: "kaboom" }),
    );
    const { container } = render(<Component instanceId="i1" />);
    expect(container.textContent).toContain(
      "Failed to load document artifacts: kaboom",
    );
    expect(container.querySelector(tag)).not.toBeInTheDocument();
  });

  it("renders the loading fallback when artifacts are null", () => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ artifacts: null }),
    );
    const { container } = render(<Component instanceId="i1" />);
    expect(container.textContent).toContain("Loading...");
  });
});

describe("CompactFieldsForm save wiring", () => {
  const sdk = {} as any;
  const data = { DocumentId: "doc-123", FolderId: 42 } as any;

  const renderForm = (props: Record<string, unknown>) => {
    const { container } = render(
      <CompactFieldsForm sdk={sdk} data={data} {...props} />,
    );
    return container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;
  };

  it("forwards saveValidatedDataRequest to the host without persisting", () => {
    const onSaveValidatedDataRequest = vi.fn();
    const el = renderForm({ onSaveValidatedDataRequest });

    const detail = { documentId: "doc-123", validatedData: { v: 1 } };
    el.dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

    expect(onSaveValidatedDataRequest).toHaveBeenCalledWith(detail);
    // The wrapper owns no persistence — the host decides what to write.
    expect(mockSubmitToOrchestrator).not.toHaveBeenCalled();
  });

  it("forwards saveValidatedDataAsDraftRequest to the host without persisting", () => {
    const onSaveValidatedDataAsDraftRequest = vi.fn();
    const el = renderForm({ onSaveValidatedDataAsDraftRequest });

    const detail = { documentId: "doc-123", validatedData: { d: 2 } };
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataAsDraftRequest", { detail }),
    );

    expect(onSaveValidatedDataAsDraftRequest).toHaveBeenCalledWith(detail);
    expect(mockSaveDraftToOrchestrator).not.toHaveBeenCalled();
  });

  it("extracts documentId + reason from saveExceptionReportRequest", () => {
    const onReportExceptionComplete = vi.fn();
    const el = renderForm({ onReportExceptionComplete });

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

  it("falls back to empty reason when the exception DTO has no Reason", () => {
    const onReportExceptionComplete = vi.fn();
    const el = renderForm({ onReportExceptionComplete });

    el.dispatchEvent(
      new CustomEvent("saveExceptionReportRequest", {
        detail: { documentId: "doc-abc", exceptionReport: null },
      }),
    );

    expect(onReportExceptionComplete).toHaveBeenCalledWith("doc-abc", "");
  });

  it("does not throw when no save callbacks are wired", () => {
    const el = renderForm({});

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
