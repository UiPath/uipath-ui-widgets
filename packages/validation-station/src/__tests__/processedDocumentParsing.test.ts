/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { parseDigitizedDocument } from "../processedDocument/dom";
import { validateProcessedDocument } from "../processedDocument/payload";
import { parseReview } from "../processedDocument/review";
import { resolveDocumentArtifacts } from "../processedDocument/spans";

const makeProcessedDocument = (overrides: Record<string, any> = {}) =>
  ({
    version: "1.0",
    type: "Extraction",
    taxonomy: { type: "object", properties: { Invoice: {} }, $defs: {} },
    result: { output: { Invoice: [] }, attribution: {} },
    metadata: {
      pipelineRunId: "run-1",
      traceId: "trace-1",
      spanId: "span-1",
      folderKey: "folder-1",
    },
    ...overrides,
  }) as any;

describe("validateProcessedDocument", () => {
  it("unwraps an extraction into its taxonomy, result and span anchor", () => {
    const pd = makeProcessedDocument();

    expect(validateProcessedDocument(pd)).toEqual({
      taxonomy: pd.taxonomy,
      extraction: pd.result,
      anchor: { traceId: "trace-1", spanId: "span-1", folderKey: "folder-1" },
    });
  });

  it.each([
    [{ type: "Classification" }, "type is not Extraction"],
    [
      { taxonomy: { Fields: [] } },
      "taxonomy declares neither properties nor $defs",
    ],
    [{ taxonomy: null }, "taxonomy declares neither properties nor $defs"],
    [
      { result: { ResultsDocument: {} } },
      "result declares neither output nor attribution",
    ],
    [{ metadata: undefined }, "metadata.traceId is empty"],
    [
      { metadata: { traceId: "t", spanId: "", folderKey: "f" } },
      "metadata.spanId is empty",
    ],
    [
      { metadata: { traceId: "t", spanId: "s", folderKey: "" } },
      "metadata.folderKey is empty",
    ],
  ])("refuses %j, naming the missing piece", (overrides, reason) => {
    expect(() =>
      validateProcessedDocument(makeProcessedDocument(overrides)),
    ).toThrow(`Cannot validate this ProcessedDocument: ${reason}.`);
  });
});

const digitizationSpan = (
  artifacts: unknown,
  attachments: unknown[] = [
    { id: "bucket-pdf", fileName: "doc-1/normalized.pdf" },
    { id: "bucket-dom", fileName: "doc-1/dom.json.gz" },
    { id: "bucket-text", fileName: "doc-1/text.txt.gz" },
  ],
) => ({
  id: "span-d",
  spanType: "idpDigitization",
  attributes: JSON.stringify({ digitizationArtifacts: artifacts }),
  attachments: attachments,
});

const fullArtifact = {
  documentId: "doc-1",
  normalizedPdfAttachmentId: "doc-1/normalized.pdf",
  domAttachmentId: "doc-1/dom.json.gz",
  textAttachmentId: "doc-1/text.txt.gz",
};

describe("resolveDocumentArtifacts", () => {
  it("pairs each artifact path with the bucket its attachment names", () => {
    const spans = [
      {
        id: "span-e",
        spanType: "idpExtraction",
        attributes: null,
        attachments: [],
      },
      digitizationSpan([fullArtifact]),
    ] as any;

    expect(resolveDocumentArtifacts(spans)).toEqual({
      document: { bucketId: "bucket-pdf", fileName: "doc-1/normalized.pdf" },
      dom: { bucketId: "bucket-dom", fileName: "doc-1/dom.json.gz" },
      text: { bucketId: "bucket-text", fileName: "doc-1/text.txt.gz" },
    });
  });

  it("does not need the pipeline's own document id", () => {
    const spans = [
      digitizationSpan([{ ...fullArtifact, documentId: undefined }]),
    ] as any;

    expect(resolveDocumentArtifacts(spans).dom).toEqual({
      bucketId: "bucket-dom",
      fileName: "doc-1/dom.json.gz",
    });
  });

  it("resolves without OCR text, which a document can be validated without", () => {
    const spans = [
      digitizationSpan([{ ...fullArtifact, textAttachmentId: undefined }]),
    ] as any;

    expect(resolveDocumentArtifacts(spans).text).toBeNull();
  });

  // The service sends a JSON string, but the SDK types attributes as an object.
  it("reads attributes that arrive as an object as well as a string", () => {
    const span = digitizationSpan([fullArtifact]);
    const spans = [
      { ...span, attributes: { digitizationArtifacts: [fullArtifact] } },
    ] as any;

    expect(resolveDocumentArtifacts(spans).dom).toEqual({
      bucketId: "bucket-dom",
      fileName: "doc-1/dom.json.gz",
    });
  });

  it.each([
    ["no digitization span", [], "the trace carries no idpDigitization span"],
    [
      "unreadable attributes",
      [{ ...digitizationSpan([]), attributes: "{not json" }],
      "the idpDigitization span carries no readable attributes",
    ],
    [
      "no artifacts",
      [digitizationSpan([])],
      "the idpDigitization span declares no digitizationArtifacts",
    ],
    [
      "several digitization spans",
      [digitizationSpan([fullArtifact]), digitizationSpan([fullArtifact])],
      "the trace carries 2 idpDigitization spans, so the document cannot be matched to this extraction",
    ],
    [
      "several documents",
      [digitizationSpan([fullArtifact, fullArtifact])],
      "the run digitized 2 documents, and only one can be validated",
    ],
    [
      "no PDF attachment",
      [
        digitizationSpan(
          [fullArtifact],
          [{ id: "b", fileName: "doc-1/dom.json.gz" }],
        ),
      ],
      "the run produced no document artifact",
    ],
    [
      "no DOM attachment",
      [
        digitizationSpan(
          [fullArtifact],
          [{ id: "b", fileName: "doc-1/normalized.pdf" }],
        ),
      ],
      "the run produced no dom artifact",
    ],
  ])("refuses a trace with %s", (_name, spans, reason) => {
    expect(() => resolveDocumentArtifacts(spans as any)).toThrow(reason);
  });
});

describe("parseDigitizedDocument", () => {
  const camelCaseDom = {
    documentId: "doc-1",
    pages: [
      {
        size: [612, 792],
        sections: [
          { wordGroups: [{ words: [{ text: "Total", box: [1, 2, 3, 4] }] }] },
        ],
      },
    ],
    metadata: [{ key: "a", value: "b" }],
  };

  it("renames every key to PascalCase, leaving values alone", () => {
    expect(parseDigitizedDocument(JSON.stringify(camelCaseDom))).toEqual({
      DocumentId: "doc-1",
      Pages: [
        {
          Size: [612, 792],
          Sections: [
            { WordGroups: [{ Words: [{ Text: "Total", Box: [1, 2, 3, 4] }] }] },
          ],
        },
      ],
      Metadata: [{ Key: "a", Value: "b" }],
    });
  });

  it("passes an already PascalCase model through unchanged", () => {
    const pascal = parseDigitizedDocument(JSON.stringify(camelCaseDom));

    expect(parseDigitizedDocument(JSON.stringify(pascal))).toEqual(pascal);
  });

  it("refuses text that is not JSON", () => {
    expect(() => parseDigitizedDocument("{nope")).toThrow(
      "the resolved document object model could not be read",
    );
  });

  it("refuses a partial model the web component would trip over", () => {
    const partial = {
      pages: [{ size: [1, 1], sections: [{ wordGroups: [{}] }] }],
    };

    expect(() => parseDigitizedDocument(JSON.stringify(partial))).toThrow(
      "the resolved document object model is not a digitized document",
    );
  });
});

describe("parseReview", () => {
  const extraction = { output: { a: 1 }, attribution: {} };

  it.each([[true], [false]])(
    "returns the extraction of a recorded review (draft: %s)",
    (draft) => {
      expect(parseReview(JSON.stringify({ draft, extraction }))).toEqual(
        extraction,
      );
    },
  );

  it.each([
    ["unparseable metadata", "{nope"],
    ["a bare extraction, not a review", JSON.stringify(extraction)],
    ["a review without a draft flag", JSON.stringify({ extraction })],
    [
      "a review whose draft flag is not a boolean",
      JSON.stringify({ draft: "true", extraction }),
    ],
    ["a review without an extraction", JSON.stringify({ draft: true })],
    [
      "a review holding a UiPath extraction result",
      JSON.stringify({ draft: false, extraction: { ResultsDocument: {} } }),
    ],
    ["a non-object", "42"],
  ])("returns null for %s", (_name, metadata) => {
    expect(parseReview(metadata)).toBeNull();
  });
});
