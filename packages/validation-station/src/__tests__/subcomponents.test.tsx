/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";

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

const mockSubmitValidatedData = vi.fn();
const mockSaveValidatedDataAsDraft = vi.fn();
vi.mock("../saveValidatedDataUtil", () => ({
  submitValidatedData: (...args: any[]) => mockSubmitValidatedData(...args),
  saveValidatedDataAsDraft: (...args: any[]) =>
    mockSaveValidatedDataAsDraft(...args),
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
    canPersist: false,
    resolvedFolderId: undefined,
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

  beforeEach(() => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ canPersist: true, resolvedFolderId: 42 }),
    );
  });

  it("forwards saveValidatedDataRequest to submitValidatedData and onSubmitComplete", async () => {
    mockSubmitValidatedData.mockResolvedValue({ success: true });
    const onSubmitComplete = vi.fn();
    const onSaveValidatedDataRequest = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        folderId={42}
        onSubmitComplete={onSubmitComplete}
        onSaveValidatedDataRequest={onSaveValidatedDataRequest}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    const detail = { documentId: "doc-123", validatedData: { v: 1 } };
    el.dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

    expect(onSaveValidatedDataRequest).toHaveBeenCalledWith(detail);
    await waitFor(() =>
      expect(mockSubmitValidatedData).toHaveBeenCalledWith(
        sdk,
        data,
        42,
        detail,
      ),
    );
    await waitFor(() =>
      expect(onSubmitComplete).toHaveBeenCalledWith({ success: true }),
    );
  });

  it("forwards a failed submit result verbatim to onSubmitComplete", async () => {
    // The wrapper must surface failures too — it resolves with the result
    // object, it does not swallow or reinterpret a { success: false }.
    const failure = { success: false, error: "save rejected" };
    mockSubmitValidatedData.mockResolvedValue(failure);
    const onSubmitComplete = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        folderId={42}
        onSubmitComplete={onSubmitComplete}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    el.dispatchEvent(
      new CustomEvent("saveValidatedDataRequest", {
        detail: { documentId: "doc-123", validatedData: {} },
      }),
    );

    await waitFor(() => expect(onSubmitComplete).toHaveBeenCalledWith(failure));
  });

  it("forwards saveValidatedDataAsDraftRequest to saveValidatedDataAsDraft", async () => {
    mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });
    const onSaveAsDraftComplete = vi.fn();
    const onSaveValidatedDataAsDraftRequest = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        folderId={42}
        onSaveAsDraftComplete={onSaveAsDraftComplete}
        onSaveValidatedDataAsDraftRequest={onSaveValidatedDataAsDraftRequest}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    const detail = { documentId: "doc-123", validatedData: { d: 2 } };
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataAsDraftRequest", { detail }),
    );

    // Raw request callback fires synchronously before the SDK round-trip.
    expect(onSaveValidatedDataAsDraftRequest).toHaveBeenCalledWith(detail);
    await waitFor(() =>
      expect(mockSaveValidatedDataAsDraft).toHaveBeenCalledWith(
        sdk,
        data,
        42,
        detail,
      ),
    );
    await waitFor(() =>
      expect(onSaveAsDraftComplete).toHaveBeenCalledWith({ success: true }),
    );
  });

  it("extracts documentId + reason from saveExceptionReportRequest", () => {
    const onReportExceptionComplete = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        folderId={42}
        onReportExceptionComplete={onReportExceptionComplete}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

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
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        folderId={42}
        onReportExceptionComplete={onReportExceptionComplete}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    el.dispatchEvent(
      new CustomEvent("saveExceptionReportRequest", {
        detail: { documentId: "doc-abc", exceptionReport: null },
      }),
    );

    expect(onReportExceptionComplete).toHaveBeenCalledWith("doc-abc", "");
  });

  it("does not persist when canPersist is false, but still fires the raw request callbacks", () => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ canPersist: false, resolvedFolderId: undefined }),
    );
    const onSaveValidatedDataRequest = vi.fn();
    const onSaveValidatedDataAsDraftRequest = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        instanceId="i1"
        onSaveValidatedDataRequest={onSaveValidatedDataRequest}
        onSaveValidatedDataAsDraftRequest={onSaveValidatedDataAsDraftRequest}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    const submitDetail = { documentId: "d", validatedData: { s: 1 } };
    const draftDetail = { documentId: "d", validatedData: { d: 1 } };
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataRequest", { detail: submitDetail }),
    );
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataAsDraftRequest", {
        detail: draftDetail,
      }),
    );

    // No SDK round-trip without a persist context...
    expect(mockSubmitValidatedData).not.toHaveBeenCalled();
    expect(mockSaveValidatedDataAsDraft).not.toHaveBeenCalled();
    // ...but the raw events are forwarded so the host can drive persistence itself.
    expect(onSaveValidatedDataRequest).toHaveBeenCalledWith(submitDetail);
    expect(onSaveValidatedDataAsDraftRequest).toHaveBeenCalledWith(draftDetail);
  });
});
