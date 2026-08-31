/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, waitFor } from "@testing-library/react";
import type {
  IValidationStationStandaloneWcEventMap,
  IVsWcSaveRequestEventMap,
} from "@uipath/du-validation-station-wc";
import type { ValidationStationEventProps } from "../types";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  convertToPersistentTag,
  VALIDATION_STATION_TAG,
} from "../loadValidationStationWc";
import { ValidationStation } from "../ValidationStation";

vi.mock("../useWcReady", () => ({ useWcReady: () => true }));

const mockUseResolvedArtifacts = vi.fn();
vi.mock("../useResolvedArtifacts", () => ({
  useResolvedArtifacts: (...args: any[]) => mockUseResolvedArtifacts(...args),
}));

const mockArtifacts = {
  taxonomy: { fields: [] },
  extractionResult: {
    DocumentId: "doc-123",
    ResultsDocument: { DocumentTypeId: "invoice", Fields: [] },
  },
  dom: { pages: [] },
  text: undefined,
  customizationInfo: undefined,
  original: undefined,
};

const baseProps: any = {
  sdk: {},
  data: { DocumentId: "doc-123", FolderId: 42 },
};

const TAG = VALIDATION_STATION_TAG;

/**
 * A stand-in for the real Angular element, defined so the `options` assertions
 * below can read what the widget actually passed.
 *
 * React only assigns a prop as a *property* when it already exists on the
 * element (`"options" in el`); otherwise it stringifies it into an attribute.
 * The real element declares its inputs as properties, so declaring `options`
 * here reproduces production behaviour rather than jsdom's fallback.
 */
if (!customElements.get(TAG)) {
  customElements.define(
    TAG,
    class extends HTMLElement {
      options: unknown = undefined;
    },
  );
}

const waitForWc = async (container: HTMLElement) =>
  await waitFor(() => {
    const el = container.querySelector(TAG);
    if (!el) throw new Error("WC element not mounted");
    return el;
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockUseResolvedArtifacts.mockImplementation((source: any) => ({
    artifacts: mockArtifacts,
    error: null,
    documentId: source.documentId ?? source.data?.DocumentId,
  }));
});

/**
 * Every state event the element emits, mapped to the prop that must receive it.
 *
 * Typed as a `Record` over the web component's own event-map keys, so adding an
 * event to `IValidationStationStandaloneWcEventMap` and forgetting to expose it
 * fails to compile here — the suite cannot go green while a row is missing.
 */
const STATE_EVENTS: Record<
  keyof Omit<
    IValidationStationStandaloneWcEventMap,
    keyof IVsWcSaveRequestEventMap
  >,
  { prop: keyof ValidationStationEventProps; detail: unknown }
> = {
  loaded: { prop: "onLoaded", detail: true },
  dirty: { prop: "onDirtyChange", detail: true },
  isValid: { prop: "onIsValidChange", detail: false },
  documentTypeChanged: { prop: "onDocumentTypeChanged", detail: "receipt" },
  extractionResultChanged: {
    prop: "onExtractionResultChanged",
    detail: { DocumentId: "doc-123", ResultsDocument: { Fields: ["edited"] } },
  },
  fieldValueSelected: {
    prop: "onFieldValueSelected",
    detail: { Field: { FieldName: "Total" }, FieldValueIndex: 0 },
  },
  fieldValueChanged: {
    prop: "onFieldValueChanged",
    detail: { Field: { FieldName: "Total" }, FieldValueIndex: 1 },
  },
  businessRulesEvaluated: {
    prop: "onBusinessRulesEvaluated",
    detail: [{ FieldId: "f1", IsValid: false }],
  },
  saveResult: { prop: "onSaveResult", detail: { success: true } },
  setFieldValueByPathResult: {
    prop: "onSetFieldValueByPathResult",
    detail: { success: false, error: "Document is not ready" },
  },
  selectAndFocusFieldValueByPathResult: {
    prop: "onSelectAndFocusFieldValueByPathResult",
    detail: { success: true },
  },
  deleteFieldValueByPathResult: {
    prop: "onDeleteFieldValueByPathResult",
    detail: { success: true },
  },
  fieldsPanelWidthChanged: { prop: "onFieldsPanelWidthChanged", detail: 420 },
  fieldsPanelSideChanged: { prop: "onFieldsPanelSideChanged", detail: "right" },
};

const STATE_EVENT_CASES = Object.entries(STATE_EVENTS).map(
  ([event, expectation]) => ({ event, ...expectation }),
);

describe("ValidationStation state outputs", () => {
  it.each(STATE_EVENT_CASES)(
    "forwards `$event` to `$prop`",
    async ({ event, prop, detail }) => {
      const handler = vi.fn();
      const { container } = render(
        <ValidationStation {...baseProps} {...{ [prop]: handler }} />,
      );
      const el = await waitForWc(container);

      el.dispatchEvent(new CustomEvent(event, { detail }));

      expect(handler).toHaveBeenCalledExactlyOnceWith(detail);
    },
  );

  it("binds a callback that was undefined on the first render", async () => {
    // Guards the stable-shape map `bindWcEvents` requires of its callers.
    const handler = vi.fn();
    const { container, rerender } = render(
      <ValidationStation {...baseProps} />,
    );
    const el = await waitForWc(container);

    rerender(<ValidationStation {...baseProps} onDirtyChange={handler} />);
    el.dispatchEvent(new CustomEvent("dirty", { detail: true }));

    expect(handler).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("keeps forwarding to the latest callback after a re-render", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { container, rerender } = render(
      <ValidationStation {...baseProps} onDirtyChange={first} />,
    );
    const el = await waitForWc(container);

    rerender(<ValidationStation {...baseProps} onDirtyChange={second} />);
    el.dispatchEvent(new CustomEvent("dirty", { detail: true }));

    expect(second).toHaveBeenCalledExactlyOnceWith(true);
    expect(first).not.toHaveBeenCalled();
  });
});

describe("persistent variant", () => {
  it("renders the base element by default", async () => {
    const { container } = render(<ValidationStation {...baseProps} />);
    await waitForWc(container);

    expect(
      container.querySelector(convertToPersistentTag(TAG)),
    ).not.toBeInTheDocument();
  });

  it("renders the persistent element when asked", async () => {
    const { container } = render(
      <ValidationStation {...baseProps} persistent />,
    );

    // The persistent element is what survives portal detachment, so the widget
    // has to render that tag rather than the base one.
    await waitFor(() => {
      expect(
        container.querySelector(convertToPersistentTag(TAG)),
      ).toBeInTheDocument();
    });
    expect(container.querySelector(TAG)).not.toBeInTheDocument();
  });
});

describe("options pass-through", () => {
  const optionsOf = (container: HTMLElement) =>
    (container.querySelector(TAG) as any).options;

  it("hands the element the host's options object as given", async () => {
    const options = { hideSubmitButton: true, emitDtoStateChanges: true };
    const { container } = render(
      <ValidationStation {...baseProps} options={options} />,
    );
    await waitForWc(container);

    // No merging, no defaults: `emitDtoStateChanges` gates
    // `extractionResultChanged`, and choosing it is the host's call.
    expect(optionsOf(container)).toBe(options);
  });

  it("leaves emitDtoStateChanges unset when the host omits it", async () => {
    const { container } = render(
      <ValidationStation {...baseProps} options={{ hideSubmitButton: true }} />,
    );
    await waitForWc(container);

    expect(optionsOf(container)).not.toHaveProperty("emitDtoStateChanges");
  });

  it("passes no options at all when the host passes none", async () => {
    const { container } = render(<ValidationStation {...baseProps} />);
    await waitForWc(container);

    expect(optionsOf(container)).toBeUndefined();
  });
});
