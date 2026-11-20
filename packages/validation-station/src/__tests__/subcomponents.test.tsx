/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, expectTypeOf, vi, beforeEach } from "vitest";
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

const mockSubmitProcessedDocument = vi.fn();
const mockSaveProcessedDocumentAsDraft = vi.fn();
const mockReportProcessedDocumentException = vi.fn();
vi.mock("../processedDocument/save", () => ({
  submitProcessedDocument: (...args: any[]) =>
    mockSubmitProcessedDocument(...args),
  saveProcessedDocumentAsDraft: (...args: any[]) =>
    mockSaveProcessedDocumentAsDraft(...args),
  reportProcessedDocumentException: (...args: any[]) =>
    mockReportProcessedDocumentException(...args),
}));

import type { ProcessedDocument } from "../processedDocument/types";
import type { IxpDocumentArtifacts } from "../types";
import type {
  CompactBusinessRulesProps,
  CompactDocTypeFieldProps,
  CompactFieldsFormProps,
  CompactTableEditorProps,
  DocumentViewerProps,
} from "../subcomponents/types";
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

// React assigns an object prop as a property only when the element already
// declares one (otherwise it stringifies it into an attribute), so stand in for
// the real elements' artifact inputs on the three IXP-capable tags. Defined
// once, for the whole file: every test on these tags renders onto these stubs.
for (const base of [
  "ui-du-compact-fields-form-standalone-wc-element",
  "ui-du-compact-table-editor-standalone-wc-element",
  "ui-du-document-viewer-standalone-wc-element",
]) {
  for (const t of [base, base.replace(/-element$/, "-persistent-element")]) {
    if (!customElements.get(t)) {
      customElements.define(
        t,
        class extends HTMLElement {
          taxonomy: unknown = undefined;
          extractionResult: unknown = undefined;
          predictedExtractionResult: unknown = undefined;
          dom: unknown = undefined;
          document: unknown = undefined;
        },
      );
    }
  }
}

/** An IXP document's artifacts, as a Flow run or a host fetch hands them. */
const ixpArtifacts = {
  taxonomy: {
    type: "object",
    properties: { Invoice: { type: "object", properties: {} } },
  },
  extractionResult: { output: {}, attribution: {}, confirmations: [] },
  predictedExtractionResult: { output: {}, attribution: {} },
  dom: { pages: [] },
  text: "invoice text",
  customizationInfo: undefined,
  original: "data:application/pdf;base64,AAAA",
} as unknown as IxpDocumentArtifacts;

const processedDocument = {
  type: "Extraction",
  metadata: { traceId: "trace-1", spanId: "span-1", folderKey: "f-1" },
} as unknown as ProcessedDocument;

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

describe.each([
  {
    name: "CompactFieldsForm",
    Component: CompactFieldsForm as React.FC<any>,
    tag: "ui-du-compact-fields-form-standalone-wc-element",
  },
  {
    name: "CompactTableEditor",
    Component: CompactTableEditor as React.FC<any>,
    tag: "ui-du-compact-table-editor-standalone-wc-element",
  },
  {
    name: "CompactBusinessRules",
    Component: CompactBusinessRules as React.FC<any>,
    tag: "ui-du-compact-business-rules-standalone-wc-element",
  },
])("$name message bus", ({ Component, tag }) => {
  it("forwards `ui-du-vs-wc-message` to onWcMessage", async () => {
    const onWcMessage = vi.fn();
    const { container } = render(<Component onWcMessage={onWcMessage} />);
    const el = container.querySelector(tag)!;
    const detail = { type: "indicator-overlay-hide", instanceId: 2 };

    await waitFor(() => {
      el.dispatchEvent(new CustomEvent("ui-du-vs-wc-message", { detail }));
      expect(onWcMessage).toHaveBeenCalledWith(detail);
    });
  });
});

describe("CompactFieldsForm save wiring", () => {
  const sdk = {} as any;
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

// The three subcomponents sharing the extraction store with `ValidationStation`.
const storeCases = cases.filter(({ name }) =>
  ["CompactFieldsForm", "CompactTableEditor", "CompactBusinessRules"].includes(
    name,
  ),
);

describe.each(storeCases)("$name message bus", ({ Component, tag }) => {
  it("forwards `ui-du-vs-wc-message` to onWcMessage", () => {
    const onWcMessage = vi.fn();
    const { container } = render(<Component onWcMessage={onWcMessage} />);
    const el = container.querySelector(tag)!;

    const detail = { type: "indicator-overlay-hide", instanceId: 7 };
    el.dispatchEvent(new CustomEvent("ui-du-vs-wc-message", { detail }));

    expect(onWcMessage).toHaveBeenCalledExactlyOnceWith(detail);
  });
});

describe.each(
  cases.filter(({ name }) =>
    ["CompactFieldsForm", "CompactTableEditor"].includes(name),
  ),
)("$name prediction", ({ Component, tag }) => {
  it("hands the element the artifacts' predictedExtractionResult", () => {
    const predictedExtractionResult = { predicted: true };
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({
        artifacts: { ...mockArtifacts, predictedExtractionResult },
      }),
    );
    const { container } = render(<Component />);

    expect(
      (container.querySelector(tag) as any).predictedExtractionResult,
    ).toBe(predictedExtractionResult);
  });
});

const ixpCases = cases.filter(({ name }) =>
  ["CompactFieldsForm", "CompactTableEditor", "DocumentViewer"].includes(name),
);

describe.each(ixpCases)("$name with an IXP document", ({ Component, tag }) => {
  it("hands the IXP artifacts to the element unchanged", () => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ artifacts: ixpArtifacts }),
    );
    const { container } = render(<Component artifacts={ixpArtifacts} />);
    const el = container.querySelector(tag) as any;

    expect(el.taxonomy).toBe(ixpArtifacts.taxonomy);
    expect(el.extractionResult).toBe(ixpArtifacts.extractionResult);
  });

  it("hands the processedDocument to artifact resolution", () => {
    const sdk = { id: "sdk" } as any;
    render(<Component sdk={sdk} processedDocument={processedDocument} />);

    expect(mockUseSubcomponentArtifacts).toHaveBeenCalledWith(
      expect.objectContaining({ sdk, processedDocument }),
    );
  });
});

describe.each(ixpCases.filter(({ name }) => name !== "DocumentViewer"))(
  "$name IXP prediction and events",
  ({ Component, tag }) => {
    it("hands the element the IXP prediction", () => {
      mockUseSubcomponentArtifacts.mockReturnValue(
        readyState({ artifacts: ixpArtifacts }),
      );
      const { container } = render(<Component artifacts={ixpArtifacts} />);

      expect(
        (container.querySelector(tag) as any).predictedExtractionResult,
      ).toBe(ixpArtifacts.predictedExtractionResult);
    });

    it("reports an IXP extractionResultChanged as given", () => {
      const onExtractionResultChanged = vi.fn();
      const { container } = render(
        <Component
          artifacts={ixpArtifacts}
          onExtractionResultChanged={onExtractionResultChanged}
        />,
      );
      const changed = { output: { total: 1 }, attribution: {} };
      container
        .querySelector(tag)!
        .dispatchEvent(
          new CustomEvent("extractionResultChanged", { detail: changed }),
        );

      expect(onExtractionResultChanged).toHaveBeenCalledExactlyOnceWith(
        changed,
      );
    });
  },
);

describe("DocumentViewer IXP document inputs", () => {
  it("hands the element the document's pages, text and file", () => {
    mockUseSubcomponentArtifacts.mockReturnValue(
      readyState({ artifacts: ixpArtifacts }),
    );
    const { container } = render(<DocumentViewer artifacts={ixpArtifacts} />);
    const el = container.querySelector(
      "ui-du-document-viewer-standalone-wc-element",
    ) as any;

    expect(el.dom).toBe(ixpArtifacts.dom);
    expect(el.document).toBe(ixpArtifacts.original);
    expect(el.getAttribute("text")).toBe(ixpArtifacts.text);
  });
});

describe("CompactFieldsForm save wiring for a Flow document", () => {
  const sdk = { id: "sdk" } as any;

  it.each([
    ["saveValidatedDataRequest", "onSubmit", () => mockSubmitProcessedDocument],
    [
      "saveValidatedDataAsDraftRequest",
      "onSaveAsDraft",
      () => mockSaveProcessedDocumentAsDraft,
    ],
    [
      "saveExceptionReportRequest",
      "onReportException",
      () => mockReportProcessedDocumentException,
    ],
  ])(
    "persists `%s` through the run and emits the outcome",
    async (event, prop, getMock) => {
      const outcome = { success: false, error: "status 500" };
      getMock().mockResolvedValue(outcome);
      const callback = vi.fn();
      const { container } = render(
        <CompactFieldsForm
          sdk={sdk}
          processedDocument={processedDocument}
          {...{ [prop]: callback }}
        />,
      );
      const detail = { documentId: "trace-1", validatedData: { output: {} } };
      container
        .querySelector("ui-du-compact-fields-form-standalone-wc-element")!
        .dispatchEvent(new CustomEvent(event, { detail }));

      await waitFor(() =>
        expect(callback).toHaveBeenCalledWith(detail, outcome),
      );
      expect(getMock()).toHaveBeenCalledExactlyOnceWith(
        sdk,
        processedDocument,
        detail,
      );
      expect(mockSubmitValidatedData).not.toHaveBeenCalled();
      expect(mockSaveValidatedDataAsDraft).not.toHaveBeenCalled();
    },
  );

  it("persists through ContentValidationData when both payloads are set", async () => {
    mockSubmitValidatedData.mockResolvedValue({ success: true });
    const data = { DocumentId: "doc-123", FolderId: 42 } as any;
    const { container } = render(
      <CompactFieldsForm
        sdk={sdk}
        data={data}
        processedDocument={processedDocument}
      />,
    );
    const detail = { documentId: "doc-123", validatedData: {} };
    container
      .querySelector("ui-du-compact-fields-form-standalone-wc-element")!
      .dispatchEvent(new CustomEvent("saveValidatedDataRequest", { detail }));

    await waitFor(() =>
      expect(mockSubmitValidatedData).toHaveBeenCalledWith(sdk, data, detail),
    );
    expect(mockSubmitProcessedDocument).not.toHaveBeenCalled();
  });
});

describe("artifact representation per wrapper (types)", () => {
  it("lets only the IXP-capable wrappers take IXP artifacts", () => {
    const ixp = { artifacts: ixpArtifacts };
    expectTypeOf(ixp).toExtend<CompactFieldsFormProps>();
    expectTypeOf(ixp).toExtend<CompactTableEditorProps>();
    expectTypeOf(ixp).toExtend<DocumentViewerProps>();
    expectTypeOf(ixp).not.toExtend<CompactBusinessRulesProps>();
    expectTypeOf(ixp).not.toExtend<CompactDocTypeFieldProps>();
  });
});
