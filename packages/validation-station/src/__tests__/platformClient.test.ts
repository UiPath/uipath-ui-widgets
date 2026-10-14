/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PlatformCallError } from "../processedDocument/errors";
import { createPlatformClient } from "../processedDocument/platformClient";

const tracesGetById = vi.fn();
const tracesCtor = vi.fn();
vi.mock("@uipath/uipath-typescript/traces", () => ({
  Traces: class {
    getById = tracesGetById;
    constructor(sdk: unknown) {
      tracesCtor(sdk);
    }
  },
}));

const makeSdk = (token?: string) =>
  ({
    config: {
      baseUrl: "https://cloud.uipath.com/",
      orgName: "myorg",
      tenantName: "mytenant",
    },
    getToken: () => token,
  }) as any;
const authedSdk = () => makeSdk("test-token");

const anchor = { traceId: "trace-1", spanId: "span-1", folderKey: "folder-1" };

const fetchMock = vi.fn();

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    arrayBuffer: async () => new ArrayBuffer(0),
  }) as Response;

beforeEach(() => {
  fetchMock.mockReset();
  tracesGetById.mockReset();
  tracesCtor.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const lastCall = () => {
  const [url, init] = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
  return { url: String(url), init: init as RequestInit | undefined };
};

describe("createPlatformClient", () => {
  describe("authorization", () => {
    it("sends the SDK's bearer token and the folder key", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await createPlatformClient(authedSdk()).findFeedback(anchor);

      expect(lastCall().init?.headers).toEqual({
        Authorization: "Bearer test-token",
        "x-uipath-folderkey": "folder-1",
      });
    });

    it("reads the token on every call, so a refreshed one is used", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));
      let token = "first";
      const sdk = { ...authedSdk(), getToken: () => token };
      const client = createPlatformClient(sdk);

      await client.findFeedback(anchor);
      token = "second";
      await client.findFeedback(anchor);

      expect((lastCall().init?.headers as any).Authorization).toBe(
        "Bearer second",
      );
    });

    // A host-delegated token is only fetched, and refreshed, by the SDK's own
    // calls: getToken() is empty before the first one and once it expires.
    it("has the SDK fetch a token through the trace when none is loaded", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));
      let token: string | undefined;
      tracesGetById.mockImplementation(async () => {
        token = "fetched";
        return [];
      });
      const sdk = { ...makeSdk(), getToken: () => token };

      await createPlatformClient(sdk).findFeedback(anchor);

      expect(tracesGetById).toHaveBeenCalledWith("trace-1", { pageSize: 1 });
      expect((lastCall().init?.headers as any).Authorization).toBe(
        "Bearer fetched",
      );
    });

    it("does not touch the trace while a token is loaded", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await createPlatformClient(authedSdk()).findFeedback(anchor);

      expect(tracesGetById).not.toHaveBeenCalled();
    });

    it("refuses to call when the SDK still has no token", async () => {
      tracesGetById.mockResolvedValue([]);

      await expect(
        createPlatformClient(makeSdk()).findFeedback(anchor),
      ).rejects.toThrow("The SDK is not authenticated.");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rejects on a non-OK response, naming the status", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, 403));

      await expect(
        createPlatformClient(authedSdk()).findFeedback(anchor),
      ).rejects.toThrow("failed with status 403");
    });

    // A failed load's message is sent to telemetry, so it names the operation
    // and status only: no URL (trace, span and folder ids, document paths) and
    // none of the service's response. That stays on `detail`, bounded, for the
    // host to diagnose a rejected payload (e.g. a size limit) with.
    it("keeps the URL and the service's response out of the message", async () => {
      const message = `metadata is too long ${"x".repeat(1000)}`;
      fetchMock.mockResolvedValue(jsonResponse({ message }, 400));

      const error = await createPlatformClient(authedSdk())
        .createFeedback(anchor, { isPositive: true, metadata: "{}" })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(PlatformCallError);
      expect((error as PlatformCallError).message).toBe(
        "Creating the review failed with status 400",
      );
      expect((error as PlatformCallError).status).toBe(400);
      expect((error as PlatformCallError).detail).toContain(
        "metadata is too long",
      );
      expect((error as PlatformCallError).detail.length).toBeLessThanOrEqual(
        300,
      );
    });

    it.each([
      ["looking up the saved review", (c: any) => c.findFeedback(anchor)],
      [
        "reading an artifact's link",
        (c: any) =>
          c.getEcsReadUri(
            { bucketId: "bucket-guid", fileName: "doc-1/a.pdf" },
            anchor,
          ),
      ],
    ])(
      "leaves ids and paths out of the message when %s fails",
      async (_n, call) => {
        fetchMock.mockResolvedValue(jsonResponse({ message: "nope" }, 404));

        const error = (await call(createPlatformClient(authedSdk())).catch(
          (e: unknown) => e,
        )) as Error;

        expect(error.message).toMatch(/failed with status 404$/);
        for (const leak of [
          "trace-1",
          "span-1",
          "folder-1",
          "doc-1",
          "bucket-guid",
          "http",
          "nope",
        ]) {
          expect(error.message).not.toContain(leak);
        }
      },
    );
  });

  describe("getSpans", () => {
    // The spans come through the SDK's public Traces service.
    it("reads the trace through the SDK's Traces service, not a raw fetch", async () => {
      tracesGetById.mockResolvedValue([]);
      const sdk = authedSdk();

      await createPlatformClient(sdk).getSpans("trace-1");

      expect(tracesCtor).toHaveBeenCalledWith(sdk);
      expect(tracesGetById).toHaveBeenCalledWith("trace-1");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("keeps only the span fields the resolver reads", async () => {
      tracesGetById.mockResolvedValue([
        {
          id: "s1",
          spanType: "idpDigitization",
          attributes: '{"digitizationArtifacts":[]}',
          attachments: [
            {
              id: "bucket-1",
              fileName: "d",
              provider: "LLMOps",
              mimeType: "x",
              direction: "Out",
            },
          ],
          status: "Ok",
        },
        { id: "s2", spanType: null, attributes: {}, attachments: null },
      ]);

      const spans = await createPlatformClient(authedSdk()).getSpans("trace-1");

      // Attributes pass through untouched: the resolver reads a string or an object.
      expect(spans).toEqual([
        {
          id: "s1",
          spanType: "idpDigitization",
          attributes: '{"digitizationArtifacts":[]}',
          attachments: [{ id: "bucket-1", fileName: "d" }],
        },
        { id: "s2", spanType: null, attributes: {}, attachments: null },
      ]);
    });

    it("propagates a failed Traces call", async () => {
      tracesGetById.mockRejectedValue(new Error("403"));

      await expect(
        createPlatformClient(authedSdk()).getSpans("trace-1"),
      ).rejects.toThrow("403");
    });
  });

  it("asks ECS for a read URI with the path escaped", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ uri: "https://signed/dom" }));

    const uri = await createPlatformClient(authedSdk()).getEcsReadUri(
      { bucketId: "bucket-guid", fileName: "doc-1/dom.json.gz" },
      anchor,
    );

    expect(uri).toBe("https://signed/dom");
    expect(lastCall().url).toBe(
      "https://cloud.uipath.com/myorg/mytenant/ecs_/v2.0/Buckets/bucket-guid/GetReadUri(path='doc-1%2Fdom.json.gz')",
    );
  });

  it("doubles a quote in the path, which would otherwise end the OData literal", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ uri: "https://signed/x" }));

    await createPlatformClient(authedSdk()).getEcsReadUri(
      { bucketId: "bucket-guid", fileName: "doc-1/o'brien.pdf" },
      anchor,
    );

    expect(lastCall().url).toContain(
      `GetReadUri(path='${encodeURIComponent("doc-1/o''brien.pdf")}')`,
    );
  });

  it.each([["../admin"], [".."], ["a/b"], ["x?y=1"]])(
    "refuses a bucket id that is not a single safe segment: %s",
    async (bucketId) => {
      await expect(
        createPlatformClient(authedSdk()).getEcsReadUri(
          { bucketId, fileName: "doc-1/dom.json.gz" },
          anchor,
        ),
      ).rejects.toThrow("Refusing an unexpected bucket id");
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("reads a pre-signed URI without sending the token", async () => {
    const bytes = new ArrayBuffer(4);
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => bytes,
    });

    const result =
      await createPlatformClient(authedSdk()).readBytes("https://signed/dom");

    expect(result).toBe(bytes);
    expect(fetchMock).toHaveBeenCalledWith("https://signed/dom");
  });

  describe("findFeedback", () => {
    it("queries the span's idpExtraction records", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      await createPlatformClient(authedSdk()).findFeedback(anchor);

      const url = new URL(lastCall().url);
      expect(url.origin + url.pathname).toBe(
        "https://cloud.uipath.com/myorg/mytenant/llmopstenant_/api/Feedback",
      );
      expect(Object.fromEntries(url.searchParams)).toEqual({
        traceId: "trace-1",
        spanId: "span-1",
        folderKey: "folder-1",
        feedbackType: "idpExtraction",
      });
    });

    it("returns the newest record by timestamp, not by position", async () => {
      fetchMock.mockResolvedValue(
        jsonResponse([
          { id: "old", metadata: "a", createdAt: "2026-09-01T00:00:00Z" },
          { id: "new", metadata: "b", createdAt: "2026-09-03T00:00:00Z" },
          { id: "mid", metadata: "c", createdAt: "2026-09-02T00:00:00Z" },
        ]),
      );

      const record =
        await createPlatformClient(authedSdk()).findFeedback(anchor);

      expect(record).toEqual({ id: "new", metadata: "b" });
    });

    it("returns null when the span holds no record", async () => {
      fetchMock.mockResolvedValue(jsonResponse([]));

      expect(
        await createPlatformClient(authedSdk()).findFeedback(anchor),
      ).toBeNull();
    });
  });

  // The public Feedback route.
  it("creates a record anchored to the span", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "fb-1" }));

    const id = await createPlatformClient(authedSdk()).createFeedback(anchor, {
      isPositive: true,
      metadata: "{}",
    });

    expect(id).toBe("fb-1");
    const { url, init } = lastCall();
    expect(url).toBe(
      "https://cloud.uipath.com/myorg/mytenant/llmopstenant_/api/Feedback",
    );
    expect(init?.method).toBe("POST");
    expect((init?.headers as any)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init?.body as string)).toEqual({
      traceId: "trace-1",
      spanId: "span-1",
      feedbackType: "idpExtraction",
      isPositive: true,
      metadata: "{}",
      comment: null,
    });
  });

  it("refuses to edit a record whose id is not a single safe segment", async () => {
    await expect(
      createPlatformClient(authedSdk()).editFeedback(anchor, "..", {
        isPositive: true,
      }),
    ).rejects.toThrow("Refusing an unexpected feedback id");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("edits a record in place, sending every field", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "fb-1" }));

    await createPlatformClient(authedSdk()).editFeedback(anchor, "fb-1", {
      isPositive: false,
      comment: "wrong document",
    });

    const { url, init } = lastCall();
    expect(url).toBe(
      "https://cloud.uipath.com/myorg/mytenant/llmopstenant_/api/Feedback/fb-1",
    );
    expect(JSON.parse(init?.body as string)).toEqual({
      feedbackType: "idpExtraction",
      isPositive: false,
      metadata: null,
      comment: "wrong document",
    });
  });
});
