/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createPlatformClient } from "../processedDocument/platformClient";

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
    arrayBuffer: async () => new ArrayBuffer(0),
  }) as Response;

beforeEach(() => {
  fetchMock.mockReset();
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

      await createPlatformClient(authedSdk()).getSpans("trace-1", "folder-1");

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

      await client.getSpans("trace-1", "folder-1");
      token = "second";
      await client.getSpans("trace-1", "folder-1");

      expect((lastCall().init?.headers as any).Authorization).toBe(
        "Bearer second",
      );
    });

    it("refuses to call without a token", async () => {
      await expect(
        createPlatformClient(makeSdk()).getSpans("t", "f"),
      ).rejects.toThrow("The SDK is not authenticated.");
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it("rejects on a non-OK response, naming the status", async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, 403));

      await expect(
        createPlatformClient(authedSdk()).getSpans("trace-1", "folder-1"),
      ).rejects.toThrow("failed with status 403");
    });
  });

  it("reads the spans of the trace from the LLM Ops service", async () => {
    const spans = [{ Id: "s1" }];
    fetchMock.mockResolvedValue(jsonResponse(spans));

    const result = await createPlatformClient(authedSdk()).getSpans(
      "trace-1",
      "folder-1",
    );

    expect(result).toBe(spans);
    expect(lastCall().url).toBe(
      "https://cloud.uipath.com/myorg/mytenant/llmopstenant_/api/traces/v2/spans?traceId=trace-1",
    );
  });

  it("asks ECS for a read URI with the path escaped", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ uri: "https://signed/dom" }));

    const uri = await createPlatformClient(authedSdk()).getEcsReadUri(
      { bucketId: "bucket-guid", fileName: "doc-1/dom.json.gz" },
      "folder-1",
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
      "folder-1",
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
          "folder-1",
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

  it("creates a record anchored to the span", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: "fb-1" }));

    const id = await createPlatformClient(authedSdk()).createFeedback(anchor, {
      isPositive: true,
      metadata: "{}",
    });

    expect(id).toBe("fb-1");
    const { url, init } = lastCall();
    expect(url).toBe(
      "https://cloud.uipath.com/myorg/mytenant/llmopstenant_/api/Feedback/v3/feedback",
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
