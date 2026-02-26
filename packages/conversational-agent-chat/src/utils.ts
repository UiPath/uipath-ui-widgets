/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AutopilotChatFileInfo,
  AutopilotChatMessage,
  AutopilotChatRole,
  ContentPart,
} from "@uipath/apollo-react/ap-chat";
import {
  CompletedContentPart,
  ContentPartHelper,
  ExchangeGetResponse,
  RawConversationGetResponse,
} from "@uipath/uipath-typescript/conversational-agent";
import { MessageWidget } from "./types";

export const createFileKey = (attachment: AutopilotChatFileInfo) => {
  const name = attachment.name;
  const size =
    attachment.content.binary?.length || attachment.content.text?.length || 0;
  const type = attachment.type;
  return `${name}-${size}-${type}`;
};

export const normalizeInput = (obj: any): any => {
  if (!obj) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(normalizeInput);
  const normalized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    normalized[key] = normalizeInput(value);
  }
  return normalized;
};

export const convertAttachmentToFile = (
  attachment: AutopilotChatFileInfo,
): File => {
  let blob: BlobPart;

  if (attachment.content.binary) {
    blob = new Uint8Array(attachment.content.binary);
  } else if (attachment.content.base64) {
    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = attachment.content.base64.startsWith("data:")
      ? attachment.content.base64.split(",")[1]
      : attachment.content.base64;

    // Remove any whitespace
    const cleanBase64 = base64Data.replace(/\s/g, "");
    const binary = atob(cleanBase64);
    const bytes = new Uint8Array(
      Array.from(binary, (char) => char.charCodeAt(0)),
    );
    blob = new Blob([bytes], { type: attachment.type });
  } else {
    throw new Error(`No content found for attachment: ${attachment.name}`);
  }

  return new File([blob], attachment.name, { type: attachment.type });
};

export const getConversationHistoryDisplayItems = (
  conversations: RawConversationGetResponse[],
) => {
  return conversations.map((conversation) => {
    return {
      id: conversation.id,
      name: conversation.label || `New chat`,
      timestamp: new Date(conversation.lastActivityTime).toISOString(),
    };
  });
};

const isCompletedContentPart = (
  cp: ContentPartHelper | CompletedContentPart,
): cp is CompletedContentPart => !("createdTime" in cp);

const isExternalValue = (
  data: any,
): data is { uri: string; byteCount?: number } =>
  data && typeof data === "object" && "uri" in data;

const getContentPartData = (
  cp: ContentPartHelper | CompletedContentPart,
): string => {
  if (isCompletedContentPart(cp)) {
    if (cp.externalValue)
      throw new Error(
        `Expected inline value but got external. (ContentPartId: ${cp.contentPartId})`,
      );
    return cp.data;
  }
  if (isExternalValue(cp.data))
    throw new Error(
      `Expected inline value but got external. (ContentPartId: ${cp.contentPartId})`,
    );
  return cp.data?.inline || "";
};

const mapCitationSource = (source: any) => ({
  id: source.number,
  title: source.title,
  url: source.url || "",
  download_url: source.downloadUrl || "",
  page_number: source.pageNumber ? parseInt(source.pageNumber) : 0,
});

const mapTextContentPartToChatContentParts = (
  cp: ContentPartHelper | CompletedContentPart,
): ContentPart[] => {
  const data = getContentPartData(cp);
  const citations = [...(cp.citations || [])].sort(
    (a: any, b: any) => a.offset - b.offset,
  );
  if (!citations.length) return [{ text: data }];

  const parts: ContentPart[] = [];
  let offset = 0;
  for (const c of citations) {
    if (c.offset > offset)
      parts.push({ text: data.substring(offset, c.offset) });
    parts.push({
      text: data.substring(c.offset, c.offset + c.length),
      citations: c.sources?.map(mapCitationSource),
    });
    offset = c.offset + c.length;
  }
  if (offset < data.length) parts.push({ text: data.substring(offset) });
  return parts;
};

const mapContentPartToChatContentParts = (
  cp: ContentPartHelper | CompletedContentPart,
): ContentPart[] =>
  cp.mimeType.startsWith("text/")
    ? mapTextContentPartToChatContentParts(cp)
    : [];

const getByteCount = (
  cp: ContentPartHelper | CompletedContentPart,
): number | null => {
  if (isCompletedContentPart(cp)) return cp.externalValue?.byteCount ?? null;
  return isExternalValue(cp.data) ? (cp.data.byteCount ?? 0) : null;
};

const mapContentPartsToChatAttachments = (
  contentParts: (ContentPartHelper | CompletedContentPart)[],
) => {
  const nonAttachmentContentParts: (
    | ContentPartHelper
    | CompletedContentPart
  )[] = [];
  const chatAttachments: AutopilotChatFileInfo[] = [];

  for (const cp of contentParts) {
    const byteCount = getByteCount(cp);
    if (byteCount === null) {
      nonAttachmentContentParts.push(cp);
      continue;
    }
    chatAttachments.push({
      name: cp.name ?? `${cp.mimeType} file`,
      type: cp.mimeType,
      size: byteCount,
      lastModified: 0,
      content: { text: null, binary: null, base64: null },
    });
  }
  return { nonAttachmentContentParts, chatAttachments };
};

const mapContentPartsToChatContentPartsAndAttachments = (
  contentParts: (ContentPartHelper | CompletedContentPart)[],
) => {
  const { chatAttachments, nonAttachmentContentParts } =
    mapContentPartsToChatAttachments(contentParts);
  return {
    chatAttachments,
    chatContentParts: nonAttachmentContentParts.flatMap(
      mapContentPartToChatContentParts,
    ),
  };
};

export const mapExchangesToChatMessages = (
  exchanges: ExchangeGetResponse[],
): AutopilotChatMessage[] =>
  exchanges.flatMap((exchange) =>
    exchange.messages.flatMap((message) => {
      const { chatAttachments, chatContentParts } =
        mapContentPartsToChatContentPartsAndAttachments(
          message.contentParts || [],
        );
      const role =
        message.role === "user"
          ? AutopilotChatRole.User
          : AutopilotChatRole.Assistant;

      const mainMessage: AutopilotChatMessage = {
        id: message.messageId,
        groupId: `${exchange.exchangeId}-${role}`,
        content: "",
        contentParts: chatContentParts,
        attachments: chatAttachments,
        created_at: message.createdTime,
        role,
        widget:
          message.role === "user" ? MessageWidget.Human : MessageWidget.AI,
        ...(exchange.feedbackRating && {
          feedback: { isPositive: exchange.feedbackRating === "positive" },
        }),
        toCopy: chatContentParts.map((part) => part.text).join(""),
        meta: { exchangeId: exchange.exchangeId },
      };

      const toolCallMessages = (message.toolCalls || []).map((toolCall) => ({
        id: toolCall.toolCallId,
        groupId: `${exchange.exchangeId}-${AutopilotChatRole.Assistant}`,
        content: `Performing ${toolCall.name}`,
        created_at: toolCall.createdTime,
        role: AutopilotChatRole.Assistant,
        widget: MessageWidget.ApolloAgentsToolCall,
        meta: {
          toolName: toolCall.name,
          input: toolCall.input,
          startTime: toolCall.createdTime,
          output: toolCall.result?.output,
          endTime: toolCall.result?.timestamp,
          isError: toolCall.result?.isError,
          exchangeId: exchange.exchangeId,
        },
      }));

      return [mainMessage, ...toolCallMessages];
    }),
  );
