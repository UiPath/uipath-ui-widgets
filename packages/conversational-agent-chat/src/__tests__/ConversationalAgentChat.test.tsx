/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ConversationalAgentChat } from "../ConversationalAgentChat";
import { UiPath } from "@uipath/uipath-typescript/core";

// Mock @uipath/apollo-react
vi.mock("@uipath/apollo-react/core/fonts/font.css", () => ({}));

const createMockChatService = () => ({
  on: vi.fn(),
  open: vi.fn(),
  sendResponse: vi.fn(),
  setAttachmentsLoading: vi.fn(),
  setError: vi.fn(),
  setHistory: vi.fn(),
  setConversation: vi.fn(),
  stopResponse: vi.fn(),
  clearError: vi.fn(),
  appendOlderHistoryItems: vi.fn(),
});

let mockChatService = createMockChatService();

vi.mock("@uipath/apollo-react/material/components", () => ({
  ApChat: ({ chatServiceInstance }: any) => (
    <div data-testid="ap-chat">
      {chatServiceInstance ? "Chat Loaded" : "Loading..."}
    </div>
  ),
  AutopilotChatMode: {
    Embedded: "embedded",
  },
  AutopilotChatEvent: {
    NewChat: "newChat",
    Request: "request",
    SetAttachments: "setAttachments",
    OpenConversation: "openConversation",
    DeleteConversation: "deleteConversation",
    HistoryLoadMore: "historyLoadMore",
  },
  AutopilotChatService: {
    Instantiate: vi.fn(() => mockChatService),
  },
}));

// Store handlers for testing
let exchangeErrorHandler: any = null;
let messageStartHandler: any = null;
let contentPartStartHandler: any = null;
let toolCallStartHandler: any = null;
let chunkHandler: any = null;
let contentPartEndHandler: any = null;
let toolCallEndHandler: any = null;

// Prevent lint errors for handler variables that are assigned inside mocks
void contentPartStartHandler;
void toolCallStartHandler;

// Imperative message builder mock
let mockMessageBuilder: any = {
  sendContentPart: vi.fn().mockResolvedValue(undefined),
  startContentPart: vi.fn().mockReturnValue({
    sendContentPartEnd: vi.fn(),
  }),
  sendMessageEnd: vi.fn(),
};

vi.mock("@uipath/uipath-typescript/conversational-agent", () => {
  const mockConversations = [
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
  ];
  const mockExch = [
    {
      exchangeId: "exc-1",
      createdTime: "2024-01-01T10:00:00Z",
      messages: [
        {
          messageId: "msg-1",
          role: "user",
          createdTime: "2024-01-01T10:00:00Z",
          contentParts: [],
        },
        {
          messageId: "msg-2",
          role: "assistant",
          createdTime: "2024-01-01T10:00:01Z",
          contentParts: [],
        },
      ],
    },
  ];

  return {
    ConversationalAgent: class {
      getById = vi.fn().mockResolvedValue({
        name: "Test Agent",
        appearance: {
          welcomeTitle: "Welcome to Test Agent",
          welcomeDescription: "This is a test agent",
          startingPrompts: [
            { displayPrompt: "Test Prompt", actualPrompt: "test" },
          ],
        },
      });

      conversations = {
        create: vi.fn().mockResolvedValue({ id: "conv-123" }),
        getAll: vi.fn().mockResolvedValue({
          items: mockConversations,
          nextCursor: { value: "cursor-1" },
          hasNextPage: true,
        }),
        getById: vi.fn().mockResolvedValue({
          exchanges: {
            getAll: vi.fn().mockResolvedValue({ items: mockExch }),
          },
        }),
        uploadAttachment: vi.fn().mockResolvedValue({
          uri: "file://test.txt",
          name: "test.txt",
          mimeType: "text/plain",
        }),
        deleteById: vi.fn().mockResolvedValue(undefined),
        startSession: vi.fn().mockImplementation(() => {
          const sessionHelper = {
            onSessionStarted: vi.fn((callback: any) => {
              setTimeout(callback, 0);
              return sessionHelper;
            }),
            startExchange: vi.fn(() => ({
              onErrorStart: vi.fn((handler: any) => {
                exchangeErrorHandler = handler;
              }),
              onMessageStart: vi.fn((handler: any) => {
                messageStartHandler = handler;
              }),
              onExchangeEnd: vi.fn(),
              startMessage: vi.fn(() => mockMessageBuilder),
            })),
          };
          return sessionHelper;
        }),
      };
    },
    SortOrder: { Descending: "descending", Ascending: "ascending" },
  };
});

describe("ConversationalAgentChat", () => {
  let mockSdk: Partial<UiPath>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSdk = {} as any;
    mockChatService = createMockChatService();
    mockMessageBuilder = {
      sendContentPart: vi.fn().mockResolvedValue(undefined),
      startContentPart: vi.fn().mockReturnValue({
        sendContentPartEnd: vi.fn(),
      }),
      sendMessageEnd: vi.fn(),
    };
    exchangeErrorHandler = null;
    messageStartHandler = null;
    contentPartStartHandler = null;
    toolCallStartHandler = null;
    chunkHandler = null;
    contentPartEndHandler = null;
    toolCallEndHandler = null;
  });

  const defaultProps = {
    sdk: mockSdk as UiPath,
    agentId: 1,
    folderId: 100,
  };

  it("should render loading state initially", () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should initialize and render ApChat component", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should fetch agent details on mount", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should instantiate AutopilotChatService with correct config", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              mode: "embedded",
              paginatedHistory: true,
              firstRunExperience: expect.objectContaining({
                title: "Welcome to Test Agent",
                description: "This is a test agent",
              }),
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it("should handle agent without custom appearance", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should register event handlers on chat service", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should have correct CSS class", () => {
    const { container } = render(<ConversationalAgentChat {...defaultProps} />);

    const chatContainer = container.querySelector(
      ".uipath-conversational-agent-chat",
    );
    expect(chatContainer).toBeInTheDocument();
  });

  it("should set up disabled features correctly", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              disabledFeatures: {
                fullScreen: true,
                preview: true,
                close: true,
              },
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it("should configure override labels", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              overrideLabels: {
                title: "Test Agent",
                footerDisclaimer:
                  "Agent can make mistakes. Please double check the responses.",
              },
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it("should map starting prompts correctly", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              firstRunExperience: expect.objectContaining({
                suggestions: [{ label: "Test Prompt", prompt: "test" }],
              }),
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it("should render with correct locale and theme", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should only initialize once", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
  });

  it("should handle different agent IDs", async () => {
    const { rerender } = render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    rerender(<ConversationalAgentChat {...defaultProps} agentId={2} />);

    expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
  });

  it("should create ConversationalAgent with provided SDK", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it("should enable paginatedHistory in config", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              paginatedHistory: true,
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  describe("onClickOpenConversation", () => {
    it("should register OpenConversation event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should fetch exchanges when opening a conversation", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];

      await onClickOpenConversation?.("conv-1");

      expect(mockChatService.setConversation).toHaveBeenCalled();
    });

    it("should call stopResponse and clearError when opening a conversation", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];

      await onClickOpenConversation?.("conv-1");

      expect(mockChatService.stopResponse).toHaveBeenCalled();
      expect(mockChatService.clearError).toHaveBeenCalled();
    });

    it("should set conversation messages after fetching exchanges", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];

      await onClickOpenConversation?.("conv-1");

      expect(mockChatService.setConversation).toHaveBeenCalled();
    });

    it("should not proceed if conversation is not found", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];

      mockChatService.setConversation.mockClear();

      await onClickOpenConversation?.("non-existent-conv");

      expect(mockChatService.setConversation).not.toHaveBeenCalled();
    });

    it("should load conversation history on init", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.setHistory).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );
    });

    it("should pass done flag to setHistory based on hasNextPage", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.setHistory).toHaveBeenCalledWith(
            expect.any(Array),
            false,
          );
        },
        { timeout: 3000 },
      );
    });
  });

  describe("onNewChat", () => {
    it("should register NewChat event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "newChat",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should reset conversation state when new chat is triggered", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "newChat",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const newChatCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "newChat",
      );
      const onNewChat = newChatCall?.[1];

      // Trigger new chat - should not throw
      onNewChat?.();
    });
  });

  describe("onSendMessage", () => {
    it("should register Request event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should send message when request event is triggered", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Hello", attachments: [] });

      // Verify sendContentPart was called with the text content
      await waitFor(() => {
        expect(mockMessageBuilder.sendContentPart).toHaveBeenCalledWith({
          mimeType: "text/plain",
          data: "Hello",
        });
      });
    });

    it("should call sendMessageEnd after sending content", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Hello", attachments: [] });

      await waitFor(() => {
        expect(mockMessageBuilder.sendMessageEnd).toHaveBeenCalled();
      });
    });

    it("should send message with attachments", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      const mockAttachment = {
        name: "test.txt",
        type: "text/plain",
        content: { text: "test content", binary: null, base64: null },
      };

      await onSendMessage?.({
        content: "Hello with attachment",
        attachments: [mockAttachment],
      });
    });
  });

  describe("onSetAttachments", () => {
    it("should register SetAttachments event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should handle empty attachments", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      await onSetAttachments?.({ added: [] });

      expect(mockChatService.setAttachmentsLoading).not.toHaveBeenCalled();
    });

    it("should upload new attachments", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      const mockAttachment = {
        name: "test.txt",
        type: "text/plain",
        content: { text: null, binary: [116, 101, 115, 116], base64: null },
      };

      await onSetAttachments?.({ added: [mockAttachment] });

      expect(mockChatService.setAttachmentsLoading).toHaveBeenCalled();
    });

    it("should skip already uploaded attachments", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      const mockAttachment = {
        name: "test.txt",
        type: "text/plain",
        content: { text: null, binary: [116, 101, 115, 116], base64: null },
      };

      // Upload attachment first time
      await onSetAttachments?.({ added: [mockAttachment] });

      mockChatService.setAttachmentsLoading.mockClear();

      // Try to upload same attachment again
      await onSetAttachments?.({ added: [mockAttachment] });

      // Should not try to upload again (already exists)
      expect(mockChatService.setAttachmentsLoading).not.toHaveBeenCalled();
    });

    it("should handle multiple attachments in batches", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      const mockAttachments = [
        {
          name: "test1.txt",
          type: "text/plain",
          content: { text: null, binary: [49], base64: null },
        },
        {
          name: "test2.txt",
          type: "text/plain",
          content: { text: null, binary: [50], base64: null },
        },
        {
          name: "test3.txt",
          type: "text/plain",
          content: { text: null, binary: [51], base64: null },
        },
        {
          name: "test4.txt",
          type: "text/plain",
          content: { text: null, binary: [52], base64: null },
        },
      ];

      // Trigger with multiple attachments (should be processed in batches of 3)
      await onSetAttachments?.({ added: mockAttachments });

      expect(mockChatService.setAttachmentsLoading).toHaveBeenCalled();
    });

    it("should handle failed attachment uploads", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      // Attachment with no content will fail to convert
      const invalidAttachment = {
        name: "invalid.txt",
        type: "text/plain",
        content: { text: null, binary: null, base64: null },
      };

      await onSetAttachments?.({ added: [invalidAttachment] });

      // setError should be called for failed uploads
      expect(mockChatService.setError).toHaveBeenCalledWith(
        "Failed to upload attachments. Please try again.",
      );
    });
  });

  describe("setupExchangeHandlers", () => {
    it("should handle exchange errors", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      // Trigger send message to set up exchange handlers
      await onSendMessage?.({ content: "Test message", attachments: [] });

      // Trigger error handler
      if (exchangeErrorHandler) {
        exchangeErrorHandler({ message: "Test error" });
        expect(consoleSpy).toHaveBeenCalledWith("[Events] Exchange error:", {
          message: "Test error",
        });
      }

      consoleSpy.mockRestore();
    });

    it("should handle assistant messages with text content", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      // Trigger send message to set up exchange handlers
      await onSendMessage?.({ content: "Test message", attachments: [] });

      // Simulate assistant message
      if (messageStartHandler) {
        const mockContentPart = {
          startEvent: { mimeType: "text/plain" },
          onChunk: vi.fn((handler: any) => {
            chunkHandler = handler;
          }),
          onContentPartEnd: vi.fn((handler: any) => {
            contentPartEndHandler = handler;
          }),
        };
        const mockMessage = {
          messageId: "msg-1",
          startEvent: {
            role: "assistant",
            timestamp: "2024-01-01T10:00:00Z",
          },
          onContentPartStart: vi.fn((handler: any) => {
            contentPartStartHandler = handler;
            handler(mockContentPart);
          }),
          onToolCallStart: vi.fn((handler: any) => {
            toolCallStartHandler = handler;
          }),
        };
        messageStartHandler(mockMessage);

        // Simulate chunk received
        if (chunkHandler) {
          chunkHandler({ data: "Hello " });
          chunkHandler({ data: "World!" });
        }

        // Simulate content part end
        if (contentPartEndHandler) {
          contentPartEndHandler();
        }

        expect(mockChatService.sendResponse).toHaveBeenCalled();
      }
    });

    it("should handle tool calls", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Test message", attachments: [] });

      if (messageStartHandler) {
        const mockToolCall = {
          toolCallId: "tool-1",
          startEvent: { toolName: "search", input: { query: "test" } },
          onToolCallEnd: vi.fn((handler: any) => {
            toolCallEndHandler = handler;
          }),
        };
        const mockMessage = {
          messageId: "msg-1",
          startEvent: {
            role: "assistant",
            timestamp: "2024-01-01T10:00:00Z",
          },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn((handler: any) => {
            toolCallStartHandler = handler;
            handler(mockToolCall);
          }),
        };
        messageStartHandler(mockMessage);

        // Simulate tool call end
        if (toolCallEndHandler) {
          toolCallEndHandler({ output: "Search results", isError: false });
        }

        expect(mockChatService.sendResponse).toHaveBeenCalled();
      }
    });

    it("should handle tool calls without input", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Test", attachments: [] });

      if (messageStartHandler) {
        const mockToolCall = {
          toolCallId: "tool-2",
          startEvent: { toolName: "ping", input: null },
          onToolCallEnd: vi.fn(),
        };
        const mockMessage = {
          messageId: "msg-1",
          startEvent: {
            role: "assistant",
            timestamp: "2024-01-01T10:00:00Z",
          },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn((handler: any) => handler(mockToolCall)),
        };
        messageStartHandler(mockMessage);
      }
    });

    it("should ignore non-assistant messages", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Test", attachments: [] });

      mockChatService.sendResponse.mockClear();

      if (messageStartHandler) {
        const mockMessage = {
          messageId: "msg-1",
          startEvent: { role: "user", timestamp: "2024-01-01T10:00:00Z" },
          onContentPartStart: vi.fn(),
          onToolCallStart: vi.fn(),
        };
        messageStartHandler(mockMessage);

        // sendResponse should not be called for user messages
        expect(mockChatService.sendResponse).not.toHaveBeenCalled();
      }
    });

    it("should ignore non-text content parts", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({ content: "Test", attachments: [] });

      mockChatService.sendResponse.mockClear();

      if (messageStartHandler) {
        const mockContentPart = {
          startEvent: { mimeType: "image/png" },
          onChunk: vi.fn(),
          onContentPartEnd: vi.fn(),
        };
        const mockMessage = {
          messageId: "msg-1",
          startEvent: {
            role: "assistant",
            timestamp: "2024-01-01T10:00:00Z",
          },
          onContentPartStart: vi.fn((handler: any) => handler(mockContentPart)),
          onToolCallStart: vi.fn(),
        };
        messageStartHandler(mockMessage);

        // sendResponse should not be called for non-text content
        expect(mockChatService.sendResponse).not.toHaveBeenCalled();
      }
    });
  });

  describe("onSendMessage with attachments", () => {
    it("should send message with previously uploaded attachments", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "setAttachments",
            expect.any(Function),
          );
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      // First upload an attachment
      const setAttachmentsCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "setAttachments",
      );
      const onSetAttachments = setAttachmentsCall?.[1];

      const mockAttachment = {
        name: "doc.txt",
        type: "text/plain",
        content: { text: null, binary: [100, 111, 99], base64: null },
      };

      await onSetAttachments?.({ added: [mockAttachment] });

      // Now send a message with that attachment
      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      await onSendMessage?.({
        content: "Check this file",
        attachments: [mockAttachment],
      });

      // Verify sendContentPart was called with text content
      await waitFor(() => {
        expect(mockMessageBuilder.sendContentPart).toHaveBeenCalledWith({
          mimeType: "text/plain",
          data: "Check this file",
        });
      });

      // Verify startContentPart was called for the attachment
      expect(mockMessageBuilder.startContentPart).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "test.txt",
          mimeType: "text/plain",
          externalValue: { uri: "file://test.txt" },
        }),
      );

      // Verify sendMessageEnd was called
      expect(mockMessageBuilder.sendMessageEnd).toHaveBeenCalled();
    });

    it("should skip attachments that were not uploaded", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      // Try to send with an attachment that was never uploaded
      const unknownAttachment = {
        name: "unknown.txt",
        type: "text/plain",
        content: { text: null, binary: [1, 2, 3], base64: null },
      };

      await onSendMessage?.({
        content: "With unknown attachment",
        attachments: [unknownAttachment],
      });

      await waitFor(() => {
        expect(mockMessageBuilder.sendContentPart).toHaveBeenCalledWith({
          mimeType: "text/plain",
          data: "With unknown attachment",
        });
      });

      // startContentPart should not be called for unknown attachment
      expect(mockMessageBuilder.startContentPart).not.toHaveBeenCalled();

      // sendMessageEnd should still be called
      expect(mockMessageBuilder.sendMessageEnd).toHaveBeenCalled();
    });
  });

  describe("session reuse", () => {
    it("should reuse existing session on subsequent messages", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];

      // Send first message - creates session
      await onSendMessage?.({ content: "First message", attachments: [] });

      // Send second message - should reuse session
      await onSendMessage?.({ content: "Second message", attachments: [] });

      // Both messages should work (no error thrown)
    });
  });

  describe("onClickDeleteConversation", () => {
    it("should register DeleteConversation event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "deleteConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should delete conversation and update history", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "deleteConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const deleteConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "deleteConversation",
      );
      const onClickDeleteConversation = deleteConversationCall?.[1];

      mockChatService.setHistory.mockClear();

      await onClickDeleteConversation?.("conv-1");

      // setHistory should be called to update the list
      expect(mockChatService.setHistory).toHaveBeenCalled();
    });

    it("should reset current conversation if deleted conversation is active", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
          expect(mockChatService.on).toHaveBeenCalledWith(
            "deleteConversation",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      // First open a conversation to set it as current
      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];
      await onClickOpenConversation?.("conv-1");

      // Now delete that active conversation
      const deleteConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "deleteConversation",
      );
      const onClickDeleteConversation = deleteConversationCall?.[1];
      await onClickDeleteConversation?.("conv-1");

      // After deleting active conversation, sending a new message should
      // create a new conversation (no error thrown)
      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];
      await onSendMessage?.({
        content: "New message after delete",
        attachments: [],
      });
    });
  });

  describe("onHistoryLoadMore", () => {
    it("should register HistoryLoadMore event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "historyLoadMore",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should load more conversations when triggered", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "historyLoadMore",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );

      const historyLoadMoreCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "historyLoadMore",
      );
      const onHistoryLoadMore = historyLoadMoreCall?.[1];

      await onHistoryLoadMore?.();

      expect(mockChatService.appendOlderHistoryItems).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should show error message when initialization fails", async () => {
      const { ConversationalAgent } =
        await import("@uipath/uipath-typescript/conversational-agent");
      const mockInstance = new ConversationalAgent({} as any);
      mockInstance.getById = vi
        .fn()
        .mockRejectedValue(new Error("Network error"));

      vi.spyOn(mockInstance, "getById").mockRejectedValue(
        new Error("Network error"),
      );

      render(<ConversationalAgentChat {...defaultProps} />);

      // Should show loading initially then error after rejection
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("should show reload button when error occurs", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should not show chat when error is present", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Chat should be visible when no error
      expect(screen.queryByText("Reload")).not.toBeInTheDocument();
    });
  });
});
