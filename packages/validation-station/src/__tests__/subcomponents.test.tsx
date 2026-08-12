/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import type { UiPath } from "@uipath/uipath-typescript/core";
import type { DuFramework } from "@uipath/uipath-typescript/document-understanding";

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
vi.mock("../useResolvedArtifacts", () => ({
  useResolvedArtifacts: (...args: any[]) =>
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
  // `sdk` + `data` naming a folder is what makes the form persist for itself.
  const data = { DocumentId: "doc-123", FolderId: 42 } as any;

  const submitDetail = { documentId: "doc-123", validatedData: { s: 1 } };
  const draftDetail = { documentId: "doc-123", validatedData: { d: 2 } };

  /** Fires both save flows at a freshly rendered form and returns their spies. */
  function dispatchSaves(props: {
    sdk?: UiPath;
    data?: DuFramework.ContentValidationData;
  }) {
    const onSubmit = vi.fn();
    const onSaveAsDraft = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={props.sdk}
        data={props.data}
        onSubmit={onSubmit}
        onSaveAsDraft={onSaveAsDraft}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataRequest", { detail: submitDetail }),
    );
    el.dispatchEvent(
      new CustomEvent("saveValidatedDataAsDraftRequest", {
        detail: draftDetail,
      }),
    );
    return { onSubmit, onSaveAsDraft };
  }

  // `canPersist` in saveHandlers — an sdk, a payload, and a folder named on that
  // payload — decides whether the widget writes back itself. Both tables below
  // drive every shape of that decision, so no folder form can quietly stop being
  // recognised.

  it.each<{ shape: string; data: DuFramework.ContentValidationData }>([
    { shape: "FolderId", data: { DocumentId: "doc-123", FolderId: 42 } },
    {
      shape: "FolderKey",
      data: { DocumentId: "doc-123", FolderKey: "folder-key-1" },
    },
    {
      shape: "FolderId + FolderKey",
      data: { DocumentId: "doc-123", FolderId: 42, FolderKey: "key" },
    },
  ])("$shape → persists itself", async ({ data: payload }) => {
    mockSubmitValidatedData.mockResolvedValue({ success: true });
    mockSaveValidatedDataAsDraft.mockResolvedValue({ success: true });

    const { onSubmit, onSaveAsDraft } = dispatchSaves({ sdk, data: payload });

    await waitFor(() =>
      expect(mockSubmitValidatedData).toHaveBeenCalledWith(
        sdk,
        payload,
        submitDetail,
      ),
    );
    await waitFor(() =>
      expect(mockSaveValidatedDataAsDraft).toHaveBeenCalledWith(
        sdk,
        payload,
        draftDetail,
      ),
    );
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(submitDetail, { success: true }),
    );
    await waitFor(() =>
      expect(onSaveAsDraft).toHaveBeenCalledWith(draftDetail, {
        success: true,
      }),
    );
  });

  it.each<{
    shape: string;
    sdk?: UiPath;
    data?: DuFramework.ContentValidationData;
  }>([
    {
      shape: "no folder on the payload",
      sdk,
      data: { DocumentId: "doc-123" },
    },
    { shape: "no sdk or data at all" },
  ])("$shape → hands the save back", (row) => {
    const { onSubmit, onSaveAsDraft } = dispatchSaves(row);

    // Nowhere to write, so both flows emit the raw request — no SDK round-trip,
    // and no outcome for the host to misread as "already saved".
    expect(mockSubmitValidatedData).not.toHaveBeenCalled();
    expect(mockSaveValidatedDataAsDraft).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledWith(submitDetail);
    expect(onSaveAsDraft).toHaveBeenCalledWith(draftDetail);
  });

  it("forwards a failed submit result verbatim to onSubmit", async () => {
    // The wrapper must surface failures too — it resolves with the result
    // object, it does not swallow or reinterpret a { success: false }.
    const failure = { success: false, error: "save rejected" };
    mockSubmitValidatedData.mockResolvedValue(failure);
    const onSubmit = vi.fn();
    const { container } = render(
      <CompactFieldsForm sdk={sdk} data={data} onSubmit={onSubmit} />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    el.dispatchEvent(
      new CustomEvent("saveValidatedDataRequest", {
        detail: { documentId: "doc-123", validatedData: {} },
      }),
    );

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.anything(), failure),
    );
  });

  it("emits the exception request untouched", () => {
    const onReportException = vi.fn();
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        onReportException={onReportException}
      />,
    );
    const el = container.querySelector(
      "ui-du-compact-fields-form-standalone-wc-element",
    )!;

    const detail = {
      documentId: "doc-xyz",
      exceptionReport: { Reason: "missing page" },
    };
    el.dispatchEvent(new CustomEvent("saveExceptionReportRequest", { detail }));

    expect(onReportException).toHaveBeenCalledWith(detail);
  });
});
