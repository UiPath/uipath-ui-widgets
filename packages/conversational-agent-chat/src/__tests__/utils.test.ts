/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import {
  createFileKey,
  normalizeInput,
  convertAttachmentToFile,
  getConversationHistoryDisplayItems,
  mapExchangesToChatMessages,
} from "../utils";
import {
  AutopilotChatFileInfo,
  AutopilotChatRole,
} from "@uipath/apollo-react/ap-chat";
import { MessageWidget } from "../types";

describe("utils", () => {
  describe("createFileKey", () => {
    it("should create a key from binary content", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          binary: new Uint8Array([1, 2, 3, 4, 5]),
        },
      } as any;

      const key = createFileKey(attachment);
      expect(key).toBe("test.txt-5-text/plain");
    });

    it("should create a key from text content", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          text: "hello world",
        },
      } as any;

      const key = createFileKey(attachment);
      expect(key).toBe("test.txt-11-text/plain");
    });

    it("should create a key with 0 size when no content", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {},
      } as any;

      const key = createFileKey(attachment);
      expect(key).toBe("test.txt-0-text/plain");
    });

    it("should create unique keys for different files", () => {
      const attachment1: AutopilotChatFileInfo = {
        name: "file1.txt",
        type: "text/plain",
        content: { text: "content1" },
      } as any;

      const attachment2: AutopilotChatFileInfo = {
        name: "file2.txt",
        type: "text/plain",
        content: { text: "content2" },
      } as any;

      const key1 = createFileKey(attachment1);
      const key2 = createFileKey(attachment2);

      expect(key1).not.toBe(key2);
    });
  });

  describe("normalizeInput", () => {
    it("should return null/undefined as is", () => {
      expect(normalizeInput(null)).toBe(null);
      expect(normalizeInput(undefined)).toBe(undefined);
    });

    it("should return primitives as is", () => {
      expect(normalizeInput("string")).toBe("string");
      expect(normalizeInput(123)).toBe(123);
      expect(normalizeInput(true)).toBe(true);
    });

    it("should convert Date to ISO string", () => {
      const date = new Date("2024-01-01T12:00:00.000Z");
      expect(normalizeInput(date)).toBe("2024-01-01T12:00:00.000Z");
    });

    it("should normalize nested objects", () => {
      const input = {
        name: "test",
        date: new Date("2024-01-01T12:00:00.000Z"),
        nested: {
          value: 123,
          date: new Date("2024-01-02T12:00:00.000Z"),
        },
      };

      const result = normalizeInput(input);
      expect(result).toEqual({
        name: "test",
        date: "2024-01-01T12:00:00.000Z",
        nested: {
          value: 123,
          date: "2024-01-02T12:00:00.000Z",
        },
      });
    });

    it("should normalize arrays", () => {
      const input = [
        "string",
        123,
        new Date("2024-01-01T12:00:00.000Z"),
        { date: new Date("2024-01-02T12:00:00.000Z") },
      ];

      const result = normalizeInput(input);
      expect(result).toEqual([
        "string",
        123,
        "2024-01-01T12:00:00.000Z",
        { date: "2024-01-02T12:00:00.000Z" },
      ]);
    });

    it("should handle complex nested structures", () => {
      const input = {
        array: [
          { date: new Date("2024-01-01T12:00:00.000Z") },
          { nested: { date: new Date("2024-01-02T12:00:00.000Z") } },
        ],
        object: {
          dates: [
            new Date("2024-01-03T12:00:00.000Z"),
            new Date("2024-01-04T12:00:00.000Z"),
          ],
        },
      };

      const result = normalizeInput(input);
      expect(result).toEqual({
        array: [
          { date: "2024-01-01T12:00:00.000Z" },
          { nested: { date: "2024-01-02T12:00:00.000Z" } },
        ],
        object: {
          dates: ["2024-01-03T12:00:00.000Z", "2024-01-04T12:00:00.000Z"],
        },
      });
    });
  });

  describe("convertAttachmentToFile", () => {
    it("should convert binary content to File", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          binary: new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
        },
      } as any;

      const file = convertAttachmentToFile(attachment);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.txt");
      expect(file.type).toBe("text/plain");
    });

    it("should convert base64 content to File", () => {
      const base64Content = btoa("Hello World");
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          base64: base64Content,
        },
      } as any;

      const file = convertAttachmentToFile(attachment);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.txt");
      expect(file.type).toBe("text/plain");
      expect(file.size).toBeGreaterThan(0);
    });

    it("should handle base64 with data URL prefix", () => {
      const base64Content = "data:text/plain;base64," + btoa("Hello World");
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          base64: base64Content,
        },
      } as any;

      const file = convertAttachmentToFile(attachment);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.txt");
      expect(file.size).toBeGreaterThan(0);
    });

    it("should handle base64 with whitespace", () => {
      const base64Content = btoa("Hello World")
        .match(/.{1,4}/g)!
        .join("\n");
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {
          base64: base64Content,
        },
      } as any;

      const file = convertAttachmentToFile(attachment);

      expect(file).toBeInstanceOf(File);
      expect(file.size).toBeGreaterThan(0);
    });

    it("should handle image base64", () => {
      // Simple 1x1 red pixel PNG
      const base64Image =
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==";
      const attachment: AutopilotChatFileInfo = {
        name: "test.png",
        type: "image/png",
        content: {
          base64: base64Image,
        },
      } as any;

      const file = convertAttachmentToFile(attachment);

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.png");
      expect(file.type).toBe("image/png");
    });

    it("should throw error when no content", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test.txt",
        type: "text/plain",
        content: {},
      } as any;

      expect(() => convertAttachmentToFile(attachment)).toThrow(
        "No content found for attachment: test.txt",
      );
    });

    it("should preserve file name with special characters", () => {
      const attachment: AutopilotChatFileInfo = {
        name: "test file (1).txt",
        type: "text/plain",
        content: {
          binary: new Uint8Array([72, 101, 108, 108, 111]),
        },
      } as any;

      const file = convertAttachmentToFile(attachment);
      expect(file.name).toBe("test file (1).txt");
    });

    it("should handle different file types", () => {
      const types = [
        "application/pdf",
        "image/jpeg",
        "application/json",
        "video/mp4",
      ];

      types.forEach((type) => {
        const attachment: AutopilotChatFileInfo = {
          name: `test.${type.split("/")[1]}`,
          type,
          content: {
            binary: new Uint8Array([1, 2, 3]),
          },
        } as any;

        const file = convertAttachmentToFile(attachment);
        expect(file.type).toBe(type);
      });
    });
  });

  describe("getConversationHistoryDisplayItems", () => {
    it("should map conversations to display items", () => {
      const conversations = [
        {
          id: "conv-1",
          label: "First Chat",
          lastActivityTime: "2024-01-01T10:00:00Z",
        },
        {
          id: "conv-2",
          label: "Second Chat",
          lastActivityTime: "2024-01-02T10:00:00Z",
        },
      ] as any;

      const result = getConversationHistoryDisplayItems(conversations);

      expect(result).toEqual([
        {
          id: "conv-1",
          name: "First Chat",
          timestamp: "2024-01-01T10:00:00.000Z",
        },
        {
          id: "conv-2",
          name: "Second Chat",
          timestamp: "2024-01-02T10:00:00.000Z",
        },
      ]);
    });

    it("should use default name when label is missing", () => {
      const conversations = [
        {
          id: "conv-1",
          label: null,
          lastActivityTime: "2024-01-01T10:00:00Z",
        },
        {
          id: "conv-2",
          label: "",
          lastActivityTime: "2024-01-02T10:00:00Z",
        },
      ] as any;

      const result = getConversationHistoryDisplayItems(conversations);

      expect(result[0].name).toBe("New chat");
      expect(result[1].name).toBe("New chat");
    });

    it("should handle empty conversations array", () => {
      const result = getConversationHistoryDisplayItems([]);
      expect(result).toEqual([]);
    });

    it("should preserve conversation ID as string", () => {
      const conversations = [
        {
          id: "abc-123",
          label: "Test",
          lastActivityTime: "2024-01-01T10:00:00Z",
        },
      ] as any;

      const result = getConversationHistoryDisplayItems(conversations);
      expect(result[0].id).toBe("abc-123");
    });
  });

  describe("mapExchangesToChatMessages", () => {
    it("should map exchanges to chat messages", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "user",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "text/plain",
                  data: { inline: "Hello" },
                  citations: [],
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("msg-1");
      expect(result[0].role).toBe(AutopilotChatRole.User);
      expect(result[0].widget).toBe(MessageWidget.Human);
      expect(result[0].groupId).toBe("exc-1-user");
    });

    it("should map assistant messages correctly", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "text/plain",
                  data: { inline: "Hi there!" },
                  citations: [],
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].role).toBe(AutopilotChatRole.Assistant);
      expect(result[0].widget).toBe(MessageWidget.AI);
      expect(result[0].groupId).toBe("exc-1-assistant");
    });

    it("should include tool calls as separate messages", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdTime: "2024-01-01T10:00:00Z",
              contentParts: [],
              toolCalls: [
                {
                  toolCallId: "tc-1",
                  name: "search",
                  input: { query: "test" },
                  createdTime: "2024-01-01T10:00:01Z",
                  result: {
                    output: "Found results",
                    timestamp: "2024-01-01T10:00:02Z",
                    isError: false,
                  },
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result).toHaveLength(2);
      expect(result[1].id).toBe("tc-1");
      expect(result[1].content).toBe("Performing search");
      expect(result[1].widget).toBe(MessageWidget.ApolloAgentsToolCall);
      expect(result[1].meta).toEqual({
        toolName: "search",
        input: { query: "test" },
        startTime: "2024-01-01T10:00:01Z",
        output: "Found results",
        endTime: "2024-01-01T10:00:02Z",
        isError: false,
        exchangeId: "exc-1",
      });
      expect(result[1].created_at).toBe("2024-01-01T10:00:01Z");
    });

    it("should handle multiple exchanges", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "user",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [],
            },
            {
              messageId: "msg-2",
              role: "assistant",
              createdAt: "2024-01-01T10:00:01Z",
              contentParts: [],
            },
          ],
        },
        {
          exchangeId: "exc-2",
          messages: [
            {
              messageId: "msg-3",
              role: "user",
              createdAt: "2024-01-01T10:00:02Z",
              contentParts: [],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe("msg-1");
      expect(result[1].id).toBe("msg-2");
      expect(result[2].id).toBe("msg-3");
    });

    it("should include feedback when present", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          feedbackRating: "positive",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].feedback).toEqual({ isPositive: true });
    });

    it("should handle negative feedback", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          feedbackRating: "negative",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].feedback).toEqual({ isPositive: false });
    });

    it("should not include feedback when not present", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].feedback).toBeUndefined();
    });

    it("should handle empty exchanges array", () => {
      const result = mapExchangesToChatMessages([]);
      expect(result).toEqual([]);
    });

    it("should set toCopy from content parts", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdTime: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "text/plain",
                  data: { inline: "Hello " },
                  citations: [],
                  createdTime: "2024-01-01T10:00:00Z",
                },
                {
                  contentPartId: "cp-2",
                  mimeType: "text/plain",
                  data: { inline: "World" },
                  citations: [],
                  createdTime: "2024-01-01T10:00:00Z",
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].toCopy).toBe("Hello World");
    });

    it("should handle content parts with citations", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdTime: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "text/plain",
                  data: { inline: "Check this source for more info." },
                  citations: [
                    {
                      offset: 11,
                      length: 6,
                      sources: [
                        {
                          number: 1,
                          title: "Wikipedia",
                          url: "https://wikipedia.org",
                        },
                      ],
                    },
                  ],
                  createdTime: "2024-01-01T10:00:00Z",
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].contentParts).toHaveLength(3);
      expect(result[0].contentParts![0].text).toBe("Check this ");
      expect(result[0].contentParts![1].text).toBe("source");
      expect(result[0].contentParts![1].citations).toEqual([
        {
          id: 1,
          title: "Wikipedia",
          url: "https://wikipedia.org",
          download_url: "",
          page_number: 0,
        },
      ]);
      expect(result[0].contentParts![2].text).toBe(" for more info.");
    });

    it("should handle attachments (external values)", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "user",
              createdTime: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "application/pdf",
                  name: "document.pdf",
                  data: { uri: "https://example.com/doc.pdf", byteCount: 1024 },
                  citations: [],
                  createdTime: "2024-01-01T10:00:00Z",
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].attachments).toHaveLength(1);
      expect(result[0].attachments![0]).toEqual({
        name: "document.pdf",
        type: "application/pdf",
        size: 1024,
        lastModified: 0,
        content: { text: null, binary: null, base64: null },
      });
    });

    it("should handle completed content parts", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "text/plain",
                  data: "Completed response",
                  citations: [],
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].contentParts![0].text).toBe("Completed response");
    });

    it("should ignore non-text content parts for inline content", () => {
      const exchanges = [
        {
          exchangeId: "exc-1",
          messages: [
            {
              messageId: "msg-1",
              role: "assistant",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [
                {
                  contentPartId: "cp-1",
                  mimeType: "image/png",
                  data: { inline: "binary-data" },
                  citations: [],
                },
              ],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].contentParts).toHaveLength(0);
    });

    it("should include exchangeId in meta", () => {
      const exchanges = [
        {
          exchangeId: "exc-123",
          messages: [
            {
              messageId: "msg-1",
              role: "user",
              createdAt: "2024-01-01T10:00:00Z",
              contentParts: [],
            },
          ],
        },
      ] as any;

      const result = mapExchangesToChatMessages(exchanges);

      expect(result[0].meta).toEqual({ exchangeId: "exc-123" });
    });
  });
});
