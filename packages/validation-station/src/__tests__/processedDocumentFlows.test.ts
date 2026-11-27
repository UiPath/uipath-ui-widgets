/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { gzipSync, strToU8 } from "fflate";

// The fetch and save functions are what the widgets and hosts share; the HTTP
// underneath is covered once, in platformClient.test.ts.
const client = {
  getSpans: vi.fn(),
  getEcsReadUri: vi.fn(),
  readBytes: vi.fn(),
  findFeedback: vi.fn(),
  createFeedback: vi.fn(),
  editFeedback: vi.fn(),
};
const constructedWithSdks: unknown[] = [];

vi.mock("../processedDocument/platformClient", () => ({
  createPlatformClient: (sdk: unknown) => {
    constructedWithSdks.push(sdk);
    return client;
  },
}));

import { fetchProcessedDocumentArtifacts } from "../processedDocument/artifacts";
import { PlatformCallError } from "../processedDocument/errors";
import {
  reportProcessedDocumentException,
  saveProcessedDocumentAsDraft,
  submitProcessedDocument,
} from "../processedDocument/save";

const sdk = { id: "sdk" } as any;
const anchor = { traceId: "trace-1", spanId: "span-1", folderKey: "folder-1" };

const payloadResult = { output: { Invoice: [{ Total: 1 }] }, attribution: {} };
const makeProcessedDocument = (overrides: Record<string, any> = {}) =>
  ({
    version: "1.0",
    type: "Extraction",
    taxonomy: { properties: { Invoice: {} }, $defs: {} },
    result: payloadResult,
    metadata: { pipelineRunId: "run-1", ...anchor },
    ...overrides,
  }) as any;

const dom = {
  pages: [
    {
      size: [1, 1],
      sections: [{ wordGroups: [{ words: [{ box: [0, 0, 1, 1] }] }] }],
    },
  ],
};
const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46]); // "%PDF"

const toBuffer = (bytes: Uint8Array): ArrayBuffer =>
  new Uint8Array(bytes).buffer as ArrayBuffer;

const spans = (withText = true) => [
  {
    id: "span-d",
    spanType: "idpDigitization",
    attributes: JSON.stringify({
      pipelineRunId: "run-1",
      digitizationArtifacts: [
        {
          documentId: "doc-1",
          normalizedPdfAttachmentId: "doc.pdf",
          domAttachmentId: "dom.json.gz",
          textAttachmentId: withText ? "text.txt.gz" : undefined,
        },
      ],
    }),
    attachments: [
      { id: "b-pdf", fileName: "doc.pdf" },
      { id: "b-dom", fileName: "dom.json.gz" },
      { id: "b-text", fileName: "text.txt.gz" },
    ],
  },
];

const contentByUri: Record<string, ArrayBuffer> = {
  "uri:doc.pdf": toBuffer(pdfBytes),
  "uri:dom.json.gz": toBuffer(gzipSync(strToU8(JSON.stringify(dom)))),
  "uri:text.txt.gz": toBuffer(gzipSync(strToU8("Invoice total 1"))),
};

beforeEach(() => {
  vi.clearAllMocks();
  constructedWithSdks.length = 0;
  client.getSpans.mockResolvedValue(spans());
  client.getEcsReadUri.mockImplementation(
    async (ref: { fileName: string }) => `uri:${ref.fileName}`,
  );
  client.readBytes.mockImplementation(async (uri: string) => contentByUri[uri]);
  client.findFeedback.mockResolvedValue(null);
  client.createFeedback.mockResolvedValue("fb-new");
  client.editFeedback.mockResolvedValue("fb-1");
});

describe("fetchProcessedDocumentArtifacts", () => {
  it("returns the payload's taxonomy and the artifacts its run produced", async () => {
    const pd = makeProcessedDocument();

    const artifacts = await fetchProcessedDocumentArtifacts(sdk, pd);

    expect(constructedWithSdks).toEqual([sdk]);
    expect(client.getSpans).toHaveBeenCalledWith("trace-1");
    expect(client.getEcsReadUri).toHaveBeenCalledWith(
      { bucketId: "b-dom", fileName: "dom.json.gz" },
      anchor,
    );
    expect(artifacts).toEqual({
      taxonomy: pd.taxonomy,
      extractionResult: payloadResult,
      dom: {
        Pages: [
          {
            Size: [1, 1],
            Sections: [{ WordGroups: [{ Words: [{ Box: [0, 0, 1, 1] }] }] }],
          },
        ],
      },
      text: "Invoice total 1",
      customizationInfo: {},
      original: `data:application/pdf;base64,${btoa("%PDF")}`,
    });
  });

  it.each([[true], [false]])(
    "opens on the result last saved against the span (draft: %s)",
    async (draft) => {
      const extraction = {
        output: { Invoice: [{ Total: 2 }] },
        attribution: {},
      };
      client.findFeedback.mockResolvedValue({
        id: "fb-1",
        metadata: JSON.stringify({
          ...makeProcessedDocument(),
          result: extraction,
          metadata: { ...makeProcessedDocument().metadata, hitl: { draft } },
        }),
      });

      const artifacts = await fetchProcessedDocumentArtifacts(
        sdk,
        makeProcessedDocument(),
      );

      expect(client.findFeedback).toHaveBeenCalledWith(anchor);
      expect(artifacts.extractionResult).toEqual(extraction);
    },
  );

  it.each([
    ["the record holds no result", { id: "fb-1" }],
    ["the recorded result is unreadable", { id: "fb-1", metadata: "{nope" }],
    [
      "the record holds a bare extraction, not a review",
      {
        id: "fb-1",
        metadata: JSON.stringify({ output: { Invoice: [] }, attribution: {} }),
      },
    ],
    [
      "the record is in the retired { draft, extraction } envelope",
      {
        id: "fb-1",
        metadata: JSON.stringify({
          draft: true,
          extraction: { output: { Invoice: [] }, attribution: {} },
        }),
      },
    ],
    [
      "the recorded document's result is not an IXP extraction",
      {
        id: "fb-1",
        metadata: JSON.stringify({
          ...makeProcessedDocument(),
          result: { ResultsDocument: {} },
        }),
      },
    ],
  ])("falls back to the payload's result when %s", async (_name, record) => {
    client.findFeedback.mockResolvedValue(record);

    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument(),
    );

    expect(artifacts.extractionResult).toBe(payloadResult);
  });

  it("reopens a draft with its confirmations", async () => {
    const reviewed = { ...payloadResult, confirmations: ["/Invoice/0/Total"] };
    client.findFeedback.mockResolvedValue({
      id: "fb-1",
      metadata: JSON.stringify({
        ...makeProcessedDocument(),
        result: reviewed,
      }),
    });

    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument(),
    );

    expect(artifacts.extractionResult).toEqual(reviewed);
  });

  it("opens with the payload's own confirmations when nothing was saved", async () => {
    const result = { ...payloadResult, confirmations: ["/Invoice/0/Total"] };

    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument({ result }),
    );

    expect(artifacts.extractionResult).toEqual(result);
  });

  it("drops the payload's confirmations when they are not a list of pointers", async () => {
    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument({
        result: { ...payloadResult, confirmations: "not-a-list" },
      }),
    );

    expect(artifacts.extractionResult).toEqual(payloadResult);
  });

  it("fails the load when the lookup fails, rather than hiding a draft", async () => {
    // Opening on the payload's result here would let the next save overwrite
    // the draft the lookup could not read.
    client.findFeedback.mockRejectedValue(new Error("failed with status 503"));

    await expect(
      fetchProcessedDocumentArtifacts(sdk, makeProcessedDocument()),
    ).rejects.toThrow("failed with status 503");
  });

  it("loads with empty text when the run produced none", async () => {
    client.getSpans.mockResolvedValue(spans(false));

    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument(),
    );

    expect(artifacts.text).toBe("");
  });

  it("loads with empty text when the run's text cannot be read", async () => {
    client.readBytes.mockImplementation(async (uri: string) => {
      if (uri === "uri:text.txt.gz") throw new Error("failed with status 404");
      return contentByUri[uri];
    });

    const artifacts = await fetchProcessedDocumentArtifacts(
      sdk,
      makeProcessedDocument(),
    );

    expect(artifacts.text).toBe("");
    expect(artifacts.original).toBeTruthy();
  });

  it("refuses an invalid payload before any call", async () => {
    await expect(
      fetchProcessedDocumentArtifacts(
        sdk,
        makeProcessedDocument({ type: "Classification" }),
      ),
    ).rejects.toThrow("type is not Extraction");
    expect(client.getSpans).not.toHaveBeenCalled();
  });

  // StrictMode mounts effects twice in development, and a host may remount
  // quickly: a load already under way is shared rather than sent again.
  describe("loads in flight", () => {
    it("shares one load between parallel calls for the same document", async () => {
      const pd = makeProcessedDocument();

      const [first, second] = await Promise.all([
        fetchProcessedDocumentArtifacts(sdk, pd),
        fetchProcessedDocumentArtifacts(sdk, pd),
      ]);

      expect(second).toBe(first);
      expect(client.getSpans).toHaveBeenCalledTimes(1);
      expect(client.getEcsReadUri).toHaveBeenCalledTimes(3);
      expect(client.findFeedback).toHaveBeenCalledTimes(1);
    });

    it("loads again once the earlier load has finished", async () => {
      const pd = makeProcessedDocument();

      await fetchProcessedDocumentArtifacts(sdk, pd);
      await fetchProcessedDocumentArtifacts(sdk, pd);

      expect(client.getSpans).toHaveBeenCalledTimes(2);
    });

    it("shares only the trace read between payloads on one SDK", async () => {
      const pd = makeProcessedDocument();

      const [first, second] = await Promise.all([
        fetchProcessedDocumentArtifacts(sdk, pd),
        fetchProcessedDocumentArtifacts(sdk, makeProcessedDocument()),
        fetchProcessedDocumentArtifacts({ id: "other-sdk" } as any, pd),
      ]);

      expect(second).not.toBe(first);
      expect(client.findFeedback).toHaveBeenCalledTimes(3);
      // The two payloads on one SDK still share their trace's read.
      expect(client.getSpans).toHaveBeenCalledTimes(2);
    });

    it("does not reuse a failed load", async () => {
      const pd = makeProcessedDocument();
      client.getSpans.mockRejectedValueOnce(new Error("503"));

      await expect(fetchProcessedDocumentArtifacts(sdk, pd)).rejects.toThrow(
        "503",
      );
      await expect(
        fetchProcessedDocumentArtifacts(sdk, pd),
      ).resolves.toBeDefined();
      expect(client.getSpans).toHaveBeenCalledTimes(2);
    });
  });

  // A Flow run that extracts several documents puts them all on one trace, and
  // a host may show them side by side.
  describe("trace reads in flight", () => {
    const secondRun = {
      id: "span-d-2",
      spanType: "idpDigitization",
      attributes: JSON.stringify({
        pipelineRunId: "run-2",
        digitizationArtifacts: [
          {
            normalizedPdfAttachmentId: "doc-2.pdf",
            domAttachmentId: "dom-2.json.gz",
          },
        ],
      }),
      attachments: [
        { id: "b-pdf-2", fileName: "doc-2.pdf" },
        { id: "b-dom-2", fileName: "dom-2.json.gz" },
      ],
    };
    const ofRun = (pipelineRunId: string) =>
      makeProcessedDocument({ metadata: { pipelineRunId, ...anchor } });

    const secondRunContent: Record<string, ArrayBuffer> = {
      "uri:doc-2.pdf": toBuffer(strToU8("%PDF-2")),
      "uri:dom-2.json.gz": toBuffer(
        gzipSync(
          strToU8(
            JSON.stringify({ pages: [{ ...dom.pages[0], size: [2, 2] }] }),
          ),
        ),
      ),
    };

    beforeEach(() => {
      client.getSpans.mockResolvedValue([...spans(), secondRun]);
      client.readBytes.mockImplementation(
        async (uri: string) => secondRunContent[uri] ?? contentByUri[uri],
      );
    });

    it("reads a trace once for the documents of its run loading together", async () => {
      const [first, second] = await Promise.all([
        fetchProcessedDocumentArtifacts(sdk, ofRun("run-1")),
        fetchProcessedDocumentArtifacts(sdk, ofRun("run-2")),
      ]);

      expect(client.getSpans).toHaveBeenCalledTimes(1);
      expect(first.original).toBe(
        `data:application/pdf;base64,${btoa("%PDF")}`,
      );
      expect(first.dom.Pages?.[0]?.Size).toEqual([1, 1]);
      expect(second.original).toBe(
        `data:application/pdf;base64,${btoa("%PDF-2")}`,
      );
      expect(second.dom.Pages?.[0]?.Size).toEqual([2, 2]);
    });

    it("matches the run whatever the case of its id", async () => {
      const artifacts = await fetchProcessedDocumentArtifacts(
        sdk,
        ofRun("RUN-2"),
      );

      expect(artifacts.dom.Pages?.[0]?.Size).toEqual([2, 2]);
    });

    it("reads the trace again once the earlier read has finished", async () => {
      const first = await fetchProcessedDocumentArtifacts(sdk, ofRun("run-1"));
      const second = await fetchProcessedDocumentArtifacts(sdk, ofRun("run-2"));

      expect(client.getSpans).toHaveBeenCalledTimes(2);
      expect(first.dom.Pages?.[0]?.Size).toEqual([1, 1]);
      expect(second.dom.Pages?.[0]?.Size).toEqual([2, 2]);
    });

    it("does not reuse a failed read", async () => {
      client.getSpans.mockRejectedValueOnce(new Error("503"));

      await expect(
        fetchProcessedDocumentArtifacts(sdk, ofRun("run-1")),
      ).rejects.toThrow("503");
      await expect(
        fetchProcessedDocumentArtifacts(sdk, ofRun("run-2")),
      ).resolves.toBeDefined();
      expect(client.getSpans).toHaveBeenCalledTimes(2);
    });

    it("refuses a document whose run did not digitize on the trace", async () => {
      await expect(
        fetchProcessedDocumentArtifacts(sdk, ofRun("run-3")),
      ).rejects.toThrow(
        "the trace carries no idpDigitization span for pipeline run run-3",
      );
    });
  });

  it("rejects when an artifact read fails", async () => {
    client.readBytes.mockRejectedValue(new Error("403"));

    await expect(
      fetchProcessedDocumentArtifacts(sdk, makeProcessedDocument()),
    ).rejects.toThrow("403");
  });
});

const validated = { output: { Invoice: [{ Total: 3 }] }, attribution: {} };

/**
 * The payload with its result replaced by the validated one and
 * `metadata.hitl.draft` set: what the Angular Validation Station records, so
 * either one reopens a review the other saved.
 */
const validatedDocument = (result: unknown, draft: boolean) => ({
  ...makeProcessedDocument(),
  result,
  metadata: { ...makeProcessedDocument().metadata, hitl: { draft } },
});

// A submit hands the host the document to complete the task with; a draft does not.
const outcome = (draft: boolean, extra: Record<string, unknown>) =>
  draft
    ? extra
    : { ...extra, processedDocument: validatedDocument(validated, false) };

describe.each([
  ["submitProcessedDocument", submitProcessedDocument, false],
  ["saveProcessedDocumentAsDraft", saveProcessedDocumentAsDraft, true],
] as const)("%s", (_name, save, draft) => {
  const request = { documentId: "trace-1", validatedData: validated } as any;
  const metadata = JSON.stringify(validatedDocument(validated, draft));

  it("creates the span's record when nobody has reviewed it yet", async () => {
    const result = await save(sdk, makeProcessedDocument(), request);

    expect(result).toEqual(outcome(draft, { success: true }));
    expect(client.createFeedback).toHaveBeenCalledWith(anchor, {
      isPositive: true,
      metadata,
    });
    expect(client.editFeedback).not.toHaveBeenCalled();
  });

  it("edits the span's newest record when there is one", async () => {
    client.findFeedback.mockResolvedValue({ id: "fb-1", metadata: "{}" });

    const result = await save(sdk, makeProcessedDocument(), request);

    expect(result).toEqual(outcome(draft, { success: true }));
    expect(client.editFeedback).toHaveBeenCalledWith(anchor, "fb-1", {
      isPositive: true,
      metadata,
    });
    expect(client.createFeedback).not.toHaveBeenCalled();
  });

  it("refuses a result that is not an IXP extraction", async () => {
    const result = await save(sdk, makeProcessedDocument(), {
      documentId: "trace-1",
      validatedData: { ResultsDocument: {} },
    } as any);

    expect(result.success).toBe(false);
    expect(result.error).toContain("not an IXP extraction");
    expect(client.findFeedback).not.toHaveBeenCalled();
  });

  it("refuses an invalid payload", async () => {
    const result = await save(
      sdk,
      makeProcessedDocument({
        metadata: { traceId: "t", spanId: "", folderKey: "f" },
      }),
      request,
    );

    // Nothing to complete the task with: the payload was never reviewable.
    expect(result).toEqual({
      success: false,
      error:
        "Cannot validate this ProcessedDocument: metadata.spanId is empty.",
    });
  });

  it("reports a failed write", async () => {
    client.createFeedback.mockRejectedValue(
      new Error("failed with status 500"),
    );

    const result = await save(sdk, makeProcessedDocument(), request);

    // A submit still hands back the document: the task completes regardless.
    expect(result).toEqual(
      outcome(draft, { success: false, error: "failed with status 500" }),
    );
  });

  // A save's result goes to the host, not telemetry, so it carries the
  // service's detail — what tells a rejected payload from a missing permission.
  it("reports a rejected write with the service's detail", async () => {
    client.createFeedback.mockRejectedValue(
      new PlatformCallError("Creating the review", 400, "metadata is too long"),
    );

    const result = await save(sdk, makeProcessedDocument(), request);

    expect(result).toEqual(
      outcome(draft, {
        success: false,
        error:
          "Creating the review failed with status 400: metadata is too long",
      }),
    );
  });

  it(
    draft
      ? "keeps the confirmations, so the draft reopens with them"
      : "drops the confirmations: a submit confirms every value",
    async () => {
      const reviewed = { ...validated, confirmations: ["/Invoice/0/Total"] };

      const result = await save(sdk, makeProcessedDocument(), {
        documentId: "trace-1",
        validatedData: reviewed,
      } as any);

      const written = JSON.parse(
        client.createFeedback.mock.calls[0][1].metadata,
      );
      expect(written.result).toEqual(draft ? reviewed : validated);
      if (!draft) expect(result.processedDocument).toEqual(written);
    },
  );
});

describe("concurrent saves", () => {
  it("run one at a time, so two quick saves create one record", async () => {
    // A record exists only once createFeedback has finished, as on the server.
    let created = false;
    client.findFeedback.mockImplementation(async () =>
      created ? { id: "fb-new" } : null,
    );
    client.createFeedback.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      created = true;
      return "fb-new";
    });
    const request = { documentId: "trace-1", validatedData: validated } as any;

    const results = await Promise.all([
      submitProcessedDocument(sdk, makeProcessedDocument(), request),
      saveProcessedDocumentAsDraft(sdk, makeProcessedDocument(), request),
    ]);

    expect(results.map((r) => r.success)).toEqual([true, true]);
    expect(client.createFeedback).toHaveBeenCalledTimes(1);
    expect(client.editFeedback).toHaveBeenCalledTimes(1);
  });

  it("keep running after a failed save", async () => {
    client.createFeedback.mockRejectedValueOnce(new Error("status 500"));
    const request = { documentId: "trace-1", validatedData: validated } as any;

    const [first, second] = await Promise.all([
      submitProcessedDocument(sdk, makeProcessedDocument(), request),
      submitProcessedDocument(sdk, makeProcessedDocument(), request),
    ]);

    expect(first).toMatchObject({ success: false, error: "status 500" });
    expect(second).toMatchObject({ success: true });
  });
});

describe("reportProcessedDocumentException", () => {
  it("records a negative review with the reviewer's reason", async () => {
    const result = await reportProcessedDocumentException(
      sdk,
      makeProcessedDocument(),
      { documentId: "trace-1", exceptionReport: { Reason: "wrong document" } },
    );

    expect(result).toEqual({ success: true });
    expect(client.createFeedback).toHaveBeenCalledWith(anchor, {
      isPositive: false,
      comment: "wrong document",
    });
  });

  it("replaces a saved draft", async () => {
    client.findFeedback.mockResolvedValue({ id: "fb-1", metadata: "{}" });

    await reportProcessedDocumentException(sdk, makeProcessedDocument(), {
      documentId: "trace-1",
      exceptionReport: { Reason: null },
    });

    expect(client.editFeedback).toHaveBeenCalledWith(anchor, "fb-1", {
      isPositive: false,
      comment: "",
    });
  });
});
