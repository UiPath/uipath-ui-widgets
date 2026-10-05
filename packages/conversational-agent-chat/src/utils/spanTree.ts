import type {
  ITreeNode,
  TSpan,
} from "@uipath/apollo-react/material/components";
import type { SpanGetResponse } from "@uipath/uipath-typescript/traces";

function parseSpanAttributes(span: SpanGetResponse): Record<string, unknown> {
  if (typeof span.attributes === "string") {
    try {
      return JSON.parse(span.attributes);
    } catch {
      return {};
    }
  }
  return (span.attributes as Record<string, unknown> | undefined) ?? {};
}

function mapSpanStatus(status: SpanGetResponse["status"]): TSpan["status"] {
  switch (status) {
    case "Ok":
      return "ok";
    case "Error":
      return "error";
    default:
      return "unset";
  }
}

// Groups spans by their parentId (children sorted by start time),
function indexSpansByParent(
  spans: SpanGetResponse[],
): Map<string, SpanGetResponse[]> {
  const childrenByParent = new Map<string, SpanGetResponse[]>();
  for (const span of spans) {
    if (!span.parentId) continue;
    const siblings = childrenByParent.get(span.parentId);
    if (siblings) siblings.push(span);
    else childrenByParent.set(span.parentId, [span]);
  }
  for (const siblings of childrenByParent.values()) {
    siblings.sort((a, b) => a.startTime.localeCompare(b.startTime));
  }
  return childrenByParent;
}

// Maps each runtime "toolCall" span by its callId, which equals the
// toolCallId on the matching "conversationToolCall" span.
function indexRuntimeToolCallSpans(
  spans: SpanGetResponse[],
): Map<string, SpanGetResponse> {
  const byCallId = new Map<string, SpanGetResponse>();
  for (const span of spans) {
    if (span.spanType !== "toolCall") continue;
    const attributes = parseSpanAttributes(span);
    const callId = attributes.callId ?? attributes.call_id;
    if (typeof callId === "string") byCallId.set(callId, span);
  }
  return byCallId;
}

// Builds the tree under `span` in the ITreeNode<TSpan> shape
function toToolCallSpanNode(
  span: SpanGetResponse,
  childrenByParent: Map<string, SpanGetResponse[]>,
): ITreeNode<TSpan> {
  return {
    key: span.id,
    name: span.name ?? "",
    data: {
      id: span.id,
      name: span.name ?? undefined,
      type: span.spanType ?? undefined,
      status: mapSpanStatus(span.status),
      startTime: span.startTime,
      endTime: span.endTime ?? undefined,
      attributes: parseSpanAttributes(span),
    },
    children: (childrenByParent.get(span.id) ?? []).map((child) =>
      toToolCallSpanNode(child, childrenByParent),
    ),
  };
}

export interface ToolCallTrace {
  toolCallId: string;
  attributes: Record<string, unknown>;
  startTime: string;
  endTime: string | null;
  spanNode: ITreeNode<TSpan>;
}

// Finds every tool call in the trace and builds its span tree.
export function getToolCallTraces(spans: SpanGetResponse[]): ToolCallTrace[] {
  const childrenByParent = indexSpansByParent(spans);
  const runtimeToolCallSpans = indexRuntimeToolCallSpans(spans);
  const traces: ToolCallTrace[] = [];

  for (const span of spans) {
    if (span.spanType !== "conversationToolCall") continue;

    const attributes = parseSpanAttributes(span);
    const toolCallId = attributes.toolCallId;
    if (typeof toolCallId !== "string") continue;

    // Root the tree at the runtime tool call span once it exists; until then
    // fall back to the conversation span on its own.
    const runtimeSpan = runtimeToolCallSpans.get(toolCallId);
    traces.push({
      toolCallId,
      attributes,
      startTime: span.startTime,
      endTime: span.endTime,
      spanNode: runtimeSpan
        ? toToolCallSpanNode(runtimeSpan, childrenByParent)
        : toToolCallSpanNode(span, new Map()),
    });
  }
  return traces;
}

// Builds the tool call widget's meta from the trace, keeping the
// message's existing values for anything the trace doesn't have.
export function mergeToolCallTraceMeta(
  trace: ToolCallTrace,
  // AutopilotChatMessage.meta is typed `any` upstream.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  existingMeta: Record<string, any> | undefined,
  displayMode: string | undefined,
) {
  const { attributes } = trace;
  return {
    ...existingMeta,
    toolName:
      typeof attributes.toolName === "string"
        ? attributes.toolName
        : (existingMeta?.toolName as string | undefined),
    input: attributes.input ?? existingMeta?.input,
    startTime: trace.startTime,
    output: attributes.output ?? existingMeta?.output,
    endTime: trace.endTime ?? existingMeta?.endTime,
    isError: attributes.isError ?? existingMeta?.isError,
    displayMode,
    span: trace.spanNode,
  };
}
