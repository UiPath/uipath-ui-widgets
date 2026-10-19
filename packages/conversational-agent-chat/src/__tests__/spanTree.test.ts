import type { SpanGetResponse } from "@uipath/uipath-typescript/traces";
import { describe, expect, it } from "vitest";
import { getToolCallTraces, mergeToolCallTraceMeta } from "../utils/spanTree";

const makeSpan = (
  overrides: Partial<Omit<SpanGetResponse, "attributes">> & {
    id: string;
    attributes?: Record<string, unknown> | string;
  },
): SpanGetResponse =>
  ({
    parentId: null,
    name: overrides.id,
    startTime: "2026-01-01T00:00:00.000Z",
    endTime: null,
    attributes: {},
    status: "Ok",
    source: null,
    spanType: null,
    ...overrides,
  }) as unknown as SpanGetResponse;

// Mirrors a real trace: the conversation service's "conversationToolCall"
// span and the agent runtime's "toolCall" span, linked only by the call id.
const conversationToolCallSpan = makeSpan({
  id: "conv-tool-span",
  parentId: "agent-message-span",
  name: "Tool call",
  spanType: "conversationToolCall",
  startTime: "2026-01-01T00:00:01.000Z",
  endTime: "2026-01-01T00:00:05.000Z",
  attributes: {
    toolCallId: "tool-1",
    toolName: "Web_Search",
    input: { query: "dolphins" },
    output: { results: [] },
    isError: false,
  },
});

const runtimeToolCallSpan = makeSpan({
  id: "runtime-tool-span",
  parentId: "agent-run-span",
  name: "Tool call - Web_Search",
  spanType: "toolCall",
  startTime: "2026-01-01T00:00:02.000Z",
  attributes: { callId: "tool-1" },
});

describe("getToolCallTraces", () => {
  it("roots the tree at the runtime tool call span with its children sorted by start time", () => {
    const traces = getToolCallTraces([
      conversationToolCallSpan,
      runtimeToolCallSpan,
      makeSpan({
        id: "after-hook",
        parentId: "runtime-tool-span",
        name: "uipath_governance.hook.AFTER_TOOL",
        spanType: "governance",
        startTime: "2026-01-01T00:00:04.000Z",
      }),
      makeSpan({
        id: "integration",
        parentId: "runtime-tool-span",
        name: "Web Search",
        spanType: "integrationTool",
        startTime: "2026-01-01T00:00:03.000Z",
        status: "Error" as SpanGetResponse["status"],
      }),
      makeSpan({
        id: "nested",
        parentId: "integration",
        name: "HTTP request",
        startTime: "2026-01-01T00:00:03.500Z",
      }),
    ]);

    expect(traces).toHaveLength(1);
    const [trace] = traces;
    expect(trace.toolCallId).toBe("tool-1");
    expect(trace.startTime).toBe("2026-01-01T00:00:01.000Z");
    expect(trace.endTime).toBe("2026-01-01T00:00:05.000Z");
    expect(trace.attributes.toolName).toBe("Web_Search");

    const root = trace.spanNode;
    expect(root.key).toBe("runtime-tool-span");
    expect(root.name).toBe("Tool call - Web_Search");
    expect(root.data.type).toBe("toolCall");
    expect(root.children?.map((c) => c.name)).toEqual([
      "Web Search",
      "uipath_governance.hook.AFTER_TOOL",
    ]);

    const integration = root.children![0];
    expect(integration.data.status).toBe("error");
    expect(integration.children?.map((c) => c.name)).toEqual(["HTTP request"]);
  });

  it("falls back to the conversation span alone until the runtime span arrives", () => {
    const [trace] = getToolCallTraces([conversationToolCallSpan]);

    expect(trace.spanNode.key).toBe("conv-tool-span");
    expect(trace.spanNode.children).toEqual([]);
  });

  it("matches runtime spans by the snake_case call_id attribute", () => {
    const [trace] = getToolCallTraces([
      conversationToolCallSpan,
      makeSpan({
        id: "runtime-snake",
        spanType: "toolCall",
        attributes: { call_id: "tool-1" },
      }),
    ]);

    expect(trace.spanNode.key).toBe("runtime-snake");
  });

  it("parses JSON string attributes and treats invalid JSON as empty", () => {
    const traces = getToolCallTraces([
      makeSpan({
        id: "conv-string",
        spanType: "conversationToolCall",
        attributes: JSON.stringify({ toolCallId: "tool-2", toolName: "x" }),
      }),
      makeSpan({
        id: "conv-invalid",
        spanType: "conversationToolCall",
        attributes: "{not json",
      }),
    ]);

    expect(traces).toHaveLength(1);
    expect(traces[0].toolCallId).toBe("tool-2");
    expect(traces[0].attributes.toolName).toBe("x");
  });

  it("skips conversation tool call spans without a string toolCallId", () => {
    expect(
      getToolCallTraces([
        makeSpan({ id: "a", spanType: "conversationToolCall" }),
        makeSpan({
          id: "b",
          spanType: "conversationToolCall",
          attributes: { toolCallId: 42 },
        }),
      ]),
    ).toEqual([]);
  });

  it("maps span statuses to the tree's ok / error / unset values", () => {
    const statusOf = (status: string) =>
      getToolCallTraces([
        makeSpan({
          id: "conv",
          spanType: "conversationToolCall",
          status: status as SpanGetResponse["status"],
          attributes: { toolCallId: "t" },
        }),
      ])[0].spanNode.data.status;

    expect(statusOf("Ok")).toBe("ok");
    expect(statusOf("Error")).toBe("error");
    expect(statusOf("Running")).toBe("unset");
  });
});

describe("mergeToolCallTraceMeta", () => {
  const [trace] = getToolCallTraces([
    conversationToolCallSpan,
    runtimeToolCallSpan,
  ]);

  it("prefers the trace's values and attaches the span tree and display mode", () => {
    const meta = mergeToolCallTraceMeta(
      trace,
      {
        toolName: "old",
        input: { old: true },
        exchangeId: "exc-1",
      },
      "FullTrace",
    );

    expect(meta).toEqual({
      exchangeId: "exc-1",
      toolName: "Web_Search",
      input: { query: "dolphins" },
      startTime: "2026-01-01T00:00:01.000Z",
      output: { results: [] },
      endTime: "2026-01-01T00:00:05.000Z",
      isError: false,
      displayMode: "FullTrace",
      span: trace.spanNode,
    });
  });

  it("keeps the message's values for anything the trace doesn't have yet", () => {
    const [pendingTrace] = getToolCallTraces([
      makeSpan({
        id: "conv-pending",
        spanType: "conversationToolCall",
        startTime: "2026-01-01T00:00:01.000Z",
        attributes: { toolCallId: "tool-3", toolName: 7 },
      }),
    ]);

    const meta = mergeToolCallTraceMeta(
      pendingTrace,
      {
        toolName: "search",
        input: { q: "a" },
        output: "done",
        endTime: "2026-01-01T00:00:09.000Z",
        isError: true,
      },
      "FullTrace",
    );

    expect(meta).toMatchObject({
      toolName: "search",
      input: { q: "a" },
      output: "done",
      endTime: "2026-01-01T00:00:09.000Z",
      isError: true,
    });
  });

  it("works without existing meta", () => {
    const meta = mergeToolCallTraceMeta(trace, undefined, undefined);

    expect(meta.toolName).toBe("Web_Search");
    expect(meta.displayMode).toBeUndefined();
  });
});
