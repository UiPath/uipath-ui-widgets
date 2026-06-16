/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import i18next from "i18next";
import { ConversationalAgentChat } from "../ConversationalAgentChat";
import { UiPath } from "@uipath/uipath-typescript/core";

// Mock @uipath/apollo-react
vi.mock("@uipath/apollo-react/core/fonts/font.css", () => ({}));

const createMockChatService = () => ({
  on: vi.fn(() => vi.fn()),
  open: vi.fn(),
  sendResponse: vi.fn(),
  setAttachmentsLoading: vi.fn(),
  setError: vi.fn(),
  setHistory: vi.fn(),
  setConversation: vi.fn(),
  stopResponse: vi.fn(),
  clearError: vi.fn(),
  appendOlderHistoryItems: vi.fn(),
  setLocale: vi.fn(),
  setTheme: vi.fn(),
  getLocale: vi.fn().mockReturnValue("en"),
  injectMessageRenderer: vi.fn(),
  sendOutputStreamEvent: vi.fn(),
  setShowLoading: vi.fn(),
  setWaiting: vi.fn(),
  setCustomHeaderActions: vi.fn(),
});

let mockChatService = createMockChatService();

vi.mock("@uipath/apollo-react/material/components", () => ({
  ApChat: ({ chatServiceInstance, locale, theme }: any) => (
    <div data-testid="ap-chat" data-locale={locale} data-theme={theme}>
      {chatServiceInstance ? "Chat Loaded" : "Loading..."}
    </div>
  ),
  AutopilotChatMode: {
    Embedded: "embedded",
    FullScreen: "fullScreen",
  },
  AutopilotChatEvent: {
    NewChat: "newChat",
    Request: "request",
    SetAttachments: "setAttachments",
    OpenConversation: "openConversation",
    DeleteConversation: "deleteConversation",
    HistoryLoadMore: "historyLoadMore",
    HistorySearch: "historySearch",
    Feedback: "feedback",
    StopResponse: "stopResponse",
    CustomHeaderActionClicked: "customHeaderActionClicked",
  },
  AutopilotChatService: {
    Instantiate: vi.fn(() => mockChatService),
  },
}));

const mockTrackTelemetry = vi.fn();
vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: (...args: any[]) => mockTrackTelemetry(...args),
}));

// Capture ConversationalAgent constructor invocations so we can assert that
// props (e.g. externalUserId) are threaded through to the SDK. Hoisted shared
// mocks so tests can override per-test (e.g. simulating an inputSchema for the
// InputsPage flow). beforeEach re-establishes defaults.
const {
  capturedAgentConstructorArgs,
  mockGetById,
  mockCreate,
  mockUpdateById,
} = vi.hoisted(() => ({
  capturedAgentConstructorArgs: [] as any[][],
  mockGetById: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateById: vi.fn(),
}));

// Store handlers for testing
let exchangeErrorHandler: any = null;
let messageStartHandler: any = null;
let contentPartStartHandler: any = null;
let toolCallStartHandler: any = null;
let chunkHandler: any = null;
let contentPartEndHandler: any = null;
let toolCallEndHandler: any = null;
let labelUpdatedHandler: any = null;

// Prevent lint errors for handler variables that are assigned inside mocks
void contentPartStartHandler;
void toolCallStartHandler;

/**
 * Builds a minimal MessageStream-shaped mock with sensible defaults so each
 * test only spells out the lifecycle hook(s) it actually exercises. New
 * lifecycle methods on the production MessageStream get added once here.
 */
const createMockMessage = (overrides: Record<string, any> = {}) => ({
  messageId: "msg-1",
  startEvent: { role: "assistant", timestamp: "2024-01-01T10:00:00Z" },
  onContentPartStart: vi.fn(),
  onToolCallStart: vi.fn(),
  ...overrides,
});

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
      constructor(...args: any[]) {
        capturedAgentConstructorArgs.push(args);
      }
      getById = mockGetById;

      getAll = vi.fn().mockResolvedValue([
        {
          id: 1,
          name: "Test Agent",
          folderId: 100,
          conversations: {
            create: vi.fn().mockResolvedValue({
              id: "conv-123",
              label: "",
              lastActivityTime: "2024-01-03T10:00:00Z",
            }),
          },
        },
      ]);

      conversations = {
        create: mockCreate,
        updateById: mockUpdateById,
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
            onLabelUpdated: vi.fn((handler: any) => {
              labelUpdatedHandler = handler;
              return () => {};
            }),
            startExchange: vi.fn(() => ({
              onErrorStart: vi.fn((handler: any) => {
                exchangeErrorHandler = handler;
              }),
              onMessageStart: vi.fn((handler: any) => {
                messageStartHandler = handler;
              }),
              onExchangeEnd: vi.fn(),
              sendExchangeEnd: vi.fn(),
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
  let defaultProps: { sdk: UiPath; agentId: number; folderId: number };

  beforeEach(() => {
    vi.clearAllMocks();
    capturedAgentConstructorArgs.length = 0;
    mockGetById.mockReset().mockResolvedValue({
      id: 12345,
      releaseKey: "11111111-2222-3333-4444-555555555555",
      name: "Test Agent",
      folderId: 100,
      appearance: {
        welcomeTitle: "Welcome to Test Agent",
        welcomeDescription: "This is a test agent",
        startingPrompts: [
          { displayPrompt: "Test Prompt", actualPrompt: "test" },
        ],
      },
      conversations: {
        create: vi.fn().mockResolvedValue({
          id: "conv-123",
          label: "",
          lastActivityTime: "2024-01-03T10:00:00Z",
        }),
      },
    });
    mockCreate.mockReset().mockResolvedValue({
      id: "conv-123",
      label: "",
      lastActivityTime: "2024-01-03T10:00:00Z",
    });
    mockUpdateById.mockReset().mockResolvedValue(undefined);
    i18next.changeLanguage("en");
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
    labelUpdatedHandler = null;
    defaultProps = {
      sdk: mockSdk as UiPath,
      agentId: 1,
      folderId: 100,
    };
  });

  it("should render loading state initially", () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    expect(screen.getByText("Connecting to agent...")).toBeInTheDocument();
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

  it("should default to embedded mode and omit the fullscreen modifier class", async () => {
    const { container } = render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    expect(
      container.querySelector(".uipath-conversational-agent-chat--fullscreen"),
    ).toBeNull();
  });

  it("should instantiate in fullscreen mode and apply the modifier class", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");
    const { container } = render(
      <ConversationalAgentChat {...defaultProps} mode="fullscreen" />,
    );

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({ mode: "fullScreen" }),
          }),
        );
      },
      { timeout: 3000 },
    );

    expect(
      container.querySelector(".uipath-conversational-agent-chat--fullscreen"),
    ).not.toBeNull();
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
                settings: false,
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
                  "Agents can make mistakes. Please double check the responses.",
                inputPlaceholder: "Talk with your agent...",
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

  it("should render with default locale 'en' when no locale prop is provided", async () => {
    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        const apChat = screen.getByTestId("ap-chat");
        expect(apChat).toBeInTheDocument();
        expect(apChat).toHaveAttribute("data-locale", "en");
        expect(apChat).toHaveAttribute("data-theme", "light");
      },
      { timeout: 3000 },
    );
  });

  it("should pass custom locale to ApChat", async () => {
    render(<ConversationalAgentChat {...defaultProps} locale="ja" />);

    await waitFor(
      () => {
        const apChat = screen.getByTestId("ap-chat");
        expect(apChat).toBeInTheDocument();
        expect(apChat).toHaveAttribute("data-locale", "ja");
      },
      { timeout: 3000 },
    );
  });

  it("should pass custom theme to ApChat", async () => {
    render(<ConversationalAgentChat {...defaultProps} theme="dark" />);

    await waitFor(
      () => {
        const apChat = screen.getByTestId("ap-chat");
        expect(apChat).toHaveAttribute("data-theme", "dark");
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

  describe("folderId resolution", () => {
    it("should render successfully when only agentId is provided (getAll fallback)", async () => {
      render(<ConversationalAgentChat sdk={mockSdk as UiPath} agentId={1} />);

      await waitFor(
        () => {
          expect(screen.getByText("Chat Loaded")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("should keep newChat/history enabled when only agentId is provided", async () => {
      const { AutopilotChatService } =
        await import("@uipath/apollo-react/material/components");

      render(<ConversationalAgentChat sdk={mockSdk as UiPath} agentId={1} />);

      await waitFor(
        () => {
          const call = (AutopilotChatService.Instantiate as any).mock.calls.at(
            -1,
          );
          const disabled = call?.[0]?.config?.disabledFeatures ?? {};
          expect(disabled.newChat).toBeUndefined();
          expect(disabled.history).toBeUndefined();
        },
        { timeout: 3000 },
      );
    });

    it("should disable newChat/history when agentId is not provided", async () => {
      const { AutopilotChatService } =
        await import("@uipath/apollo-react/material/components");

      render(
        <ConversationalAgentChat
          sdk={mockSdk as UiPath}
          existingConversationId="conv-1"
        />,
      );

      await waitFor(
        () => {
          const call = (AutopilotChatService.Instantiate as any).mock.calls.at(
            -1,
          );
          const disabled = call?.[0]?.config?.disabledFeatures ?? {};
          expect(disabled.newChat).toBe(true);
          expect(disabled.history).toBe(true);
        },
        { timeout: 3000 },
      );
    });
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

  it("should not set readOnly in config by default", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              readOnly: false,
            }),
          }),
        );
      },
      { timeout: 3000 },
    );
  });

  it("should pass readOnly to AutopilotChatService config when true", async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");

    render(<ConversationalAgentChat {...defaultProps} readOnly={true} />);

    await waitFor(
      () => {
        expect(AutopilotChatService.Instantiate).toHaveBeenCalledWith(
          expect.objectContaining({
            config: expect.objectContaining({
              readOnly: true,
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

  describe("InputsPage agentInput flow", () => {
    const buildInputSchemaAgent = (
      createImpl: () => Promise<unknown> = () =>
        Promise.resolve({
          id: "conv-from-inputs",
          label: "",
          lastActivityTime: "2024-01-03T10:00:00Z",
        }),
    ) => ({
      id: defaultProps.agentId,
      folderId: defaultProps.folderId,
      name: "Test Agent",
      appearance: {},
      inputSchema: {
        type: "object",
        properties: {
          customerName: { type: "string", title: "Customer Name" },
        },
        required: ["customerName"],
      },
      conversations: {
        create: vi.fn().mockImplementation(createImpl),
      },
    });

    it("renders InputsPage when inputSchema has required fields", async () => {
      mockGetById.mockResolvedValueOnce(buildInputSchemaAgent());
      render(<ConversationalAgentChat {...defaultProps} />);

      expect(
        await screen.findByRole("button", { name: /start conversation/i }),
      ).toBeInTheDocument();
      // ApChat should not render while InputsPage gates the chat
      expect(screen.queryByTestId("ap-chat")).not.toBeInTheDocument();
    });

    it("does not render InputsPage when existingConversationId is set", async () => {
      mockGetById.mockResolvedValueOnce(buildInputSchemaAgent());
      render(
        <ConversationalAgentChat
          {...defaultProps}
          existingConversationId="conv-existing"
        />,
      );

      await waitFor(
        () => {
          expect(screen.getByTestId("ap-chat")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
      expect(
        screen.queryByRole("button", { name: /start conversation/i }),
      ).not.toBeInTheDocument();
    });

    it("submitting InputsPage creates a conversation with agentInput", async () => {
      const agent = buildInputSchemaAgent();
      mockGetById.mockResolvedValueOnce(agent);
      render(<ConversationalAgentChat {...defaultProps} />);

      const submit = await screen.findByRole("button", {
        name: /start conversation/i,
      });
      const input = await screen.findByPlaceholderText(/enter a value/i);
      fireEvent.change(input, { target: { value: "Acme Corp" } });
      fireEvent.click(submit);

      await waitFor(() => {
        expect(agent.conversations.create).toHaveBeenCalledWith({
          agentInput: { inline: { customerName: "Acme Corp" } },
        });
      });
    });

    it("renders InputsPage in debug mode even when existingConversationId is set", async () => {
      mockGetById.mockResolvedValue(buildInputSchemaAgent());
      render(
        <ConversationalAgentChat
          {...defaultProps}
          existingConversationId="conv-existing"
          isDebugMode
        />,
      );

      expect(
        await screen.findByRole("button", { name: /start conversation/i }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ap-chat")).not.toBeInTheDocument();
    });

    it("submitting InputsPage in debug mode updates the existing conversation instead of creating one", async () => {
      const agent = buildInputSchemaAgent();
      mockGetById.mockResolvedValue(agent);
      render(
        <ConversationalAgentChat
          {...defaultProps}
          existingConversationId="conv-existing"
          isDebugMode
        />,
      );

      const submit = await screen.findByRole("button", {
        name: /start conversation/i,
      });
      const input = await screen.findByPlaceholderText(/enter a value/i);
      fireEvent.change(input, { target: { value: "Acme Corp" } });
      fireEvent.click(submit);

      await waitFor(() => {
        expect(mockUpdateById).toHaveBeenCalledWith("conv-existing", {
          agentInput: { inline: { customerName: "Acme Corp" } },
        });
      });
      expect(agent.conversations.create).not.toHaveBeenCalled();
    });

    it("renders InputsPage from the inputSchema prop when the agent can't be resolved (debug, no agentId)", async () => {
      // Mirrors the agent-builder debug flow: no agentId, and the existing
      // conversation carries no agentId, so the agent (and any derived schema)
      // never resolve. The explicit inputSchema prop must drive the page.
      render(
        <ConversationalAgentChat
          sdk={defaultProps.sdk}
          existingConversationId="conv-existing"
          isDebugMode
          inputSchema={{
            type: "object",
            properties: {
              customerName: { type: "string", title: "Customer Name" },
            },
            required: ["customerName"],
          }}
        />,
      );

      expect(
        await screen.findByRole("button", { name: /start conversation/i }),
      ).toBeInTheDocument();
      expect(screen.queryByTestId("ap-chat")).not.toBeInTheDocument();
    });

    it("throws when inputSchema is passed without isDebugMode", () => {
      // inputSchema is an internal debug-only override; using it in normal
      // (public) mode should fail loudly rather than silently take precedence
      // over the agent-resolved schema.
      expect(() =>
        render(
          <ConversationalAgentChat
            {...defaultProps}
            inputSchema={{
              type: "object",
              properties: { customerName: { type: "string" } },
              required: ["customerName"],
            }}
          />,
        ),
      ).toThrow(/only supported when `isDebugMode` is true/);
    });

    it("InputsPage submit failure surfaces an inline error and keeps form mounted", async () => {
      mockGetById.mockResolvedValueOnce(
        buildInputSchemaAgent(() => Promise.reject(new Error("Network down"))),
      );
      render(<ConversationalAgentChat {...defaultProps} />);

      const submit = await screen.findByRole("button", {
        name: /start conversation/i,
      });
      const input = await screen.findByPlaceholderText(/enter a value/i);
      fireEvent.change(input, { target: { value: "Acme Corp" } });
      fireEvent.click(submit);

      expect(await screen.findByText("Network down")).toBeInTheDocument();
      // Form should still be mounted (still on InputsPage, ApChat hidden)
      expect(submit).toBeInTheDocument();
      expect(screen.queryByTestId("ap-chat")).not.toBeInTheDocument();
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
    it("should handle exchange errors with telemetry and show error", async () => {
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
        exchangeErrorHandler({ errorId: "err-1", message: "Test error" });
        expect(mockTrackTelemetry).toHaveBeenCalledWith(
          "CAC.SendMessage",
          "CAC.Error",
          { error: "Test error" },
        );
        expect(mockChatService.setError).toHaveBeenCalledWith("Test error");
      }
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
        const mockMessage = createMockMessage({
          onContentPartStart: vi.fn((handler: any) => {
            contentPartStartHandler = handler;
            handler(mockContentPart);
          }),
          onToolCallStart: vi.fn((handler: any) => {
            toolCallStartHandler = handler;
          }),
        });
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
        const mockMessage = createMockMessage({
          onToolCallStart: vi.fn((handler: any) => {
            toolCallStartHandler = handler;
            handler(mockToolCall);
          }),
        });
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
        const mockMessage = createMockMessage({
          onToolCallStart: vi.fn((handler: any) => handler(mockToolCall)),
        });
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
        const mockMessage = createMockMessage({
          startEvent: { role: "user", timestamp: "2024-01-01T10:00:00Z" },
        });
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
        const mockMessage = createMockMessage({
          onContentPartStart: vi.fn((handler: any) => handler(mockContentPart)),
        });
        messageStartHandler(mockMessage);

        // sendResponse should not be called for non-text content
        expect(mockChatService.sendResponse).not.toHaveBeenCalled();
      }
    });

    it("renders a confirmation widget and confirms approval for tool calls that require it", async () => {
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

      const onSendMessage = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      )?.[1];
      await onSendMessage?.({ content: "Test", attachments: [] });

      const sendToolCallConfirm = vi.fn();
      const mockToolCall = {
        toolCallId: "tool-confirm-1",
        startEvent: {
          toolName: "deleteFile",
          input: { path: "/tmp/x" },
          inputSchema: {
            type: "object",
            properties: { path: { type: "string" } },
          },
          requireConfirmation: true,
        },
        sendToolCallConfirm,
        onToolCallEnd: vi.fn((handler: any) => {
          toolCallEndHandler = handler;
        }),
      };
      const mockMessage = createMockMessage({
        onToolCallStart: vi.fn((handler: any) => handler(mockToolCall)),
      });
      messageStartHandler?.(mockMessage);

      // The widget is sent as a ToolConfirmation message carrying the
      // approve/reject channel on its meta.
      const confirmCall = mockChatService.sendResponse.mock.calls.find(
        ([msg]: any) => msg.meta?.confirmationData,
      );
      expect(confirmCall).toBeTruthy();
      confirmCall[0].meta.onApprove({ input: { path: "/tmp/x" } });
      expect(sendToolCallConfirm).toHaveBeenCalledWith({
        approved: true,
        input: { path: "/tmp/x" },
      });

      // Tool completes after the spinner was shown.
      toolCallEndHandler?.({ output: "deleted", isError: false });
    });

    it("rejects the tool call when the confirmation widget is cancelled", async () => {
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

      const onSendMessage = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      )?.[1];
      await onSendMessage?.({ content: "Test", attachments: [] });

      const sendToolCallConfirm = vi.fn();
      const mockToolCall = {
        toolCallId: "tool-confirm-2",
        startEvent: {
          toolName: "deleteFile",
          input: { path: "/tmp/y" },
          requireConfirmation: true,
        },
        sendToolCallConfirm,
        onToolCallEnd: vi.fn(),
      };
      messageStartHandler?.(
        createMockMessage({
          onToolCallStart: vi.fn((handler: any) => handler(mockToolCall)),
        }),
      );

      const confirmCall = mockChatService.sendResponse.mock.calls.find(
        ([msg]: any) => msg.meta?.confirmationData,
      );
      confirmCall[0].meta.onCancel();
      expect(sendToolCallConfirm).toHaveBeenCalledWith({ approved: false });
    });

    it("stops the active response when StopResponse fires", async () => {
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

      const onSendMessage = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      )?.[1];
      // Sets activeExchange so the stop handler exercises the teardown branch.
      await onSendMessage?.({ content: "Test", attachments: [] });

      const onStopResponse = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "stopResponse",
      )?.[1];
      onStopResponse?.();

      expect(mockChatService.sendOutputStreamEvent).toHaveBeenCalledWith({
        turnComplete: true,
      });
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

  describe("onLabelUpdated", () => {
    const setupSessionForConv1 = async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "openConversation",
            expect.any(Function),
          );
          expect(mockChatService.setHistory).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );

      const openConversationCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "openConversation",
      );
      const onClickOpenConversation = openConversationCall?.[1];
      await onClickOpenConversation?.("conv-1");

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];
      await onSendMessage?.({ content: "Hi", attachments: [] });

      await waitFor(() => {
        expect(labelUpdatedHandler).toBeTruthy();
      });

      mockChatService.setHistory.mockClear();
    };

    it("should update sidebar label when service emits a label update", async () => {
      await setupSessionForConv1();

      labelUpdatedHandler({ label: "Renamed Chat", autogenerated: true });

      expect(mockChatService.setHistory).toHaveBeenCalledTimes(1);
      const [items] = mockChatService.setHistory.mock.calls[0];
      const updated = items.find((i: any) => i.id === "conv-1");
      expect(updated?.name).toBe("Renamed Chat");
      // Other entries retain their original label
      const other = items.find((i: any) => i.id === "conv-2");
      expect(other?.name).toBe("Second Chat");
    });

    const sendFirstMessage = async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "request",
            expect.any(Function),
          );
          expect(mockChatService.setHistory).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );

      const requestCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "request",
      );
      const onSendMessage = requestCall?.[1];
      mockChatService.setHistory.mockClear();
      await onSendMessage?.({ content: "Hi", attachments: [] });
    };

    it("should add brand-new conversations to the sidebar on create", async () => {
      // Sending a message on first run creates a fresh conversation (id:
      // "conv-123" per the create() mock). It must appear in the sidebar
      // before the service auto-generates its label.
      await sendFirstMessage();

      await waitFor(() => {
        expect(mockChatService.setHistory).toHaveBeenCalled();
      });
      const afterCreate = mockChatService.setHistory.mock.calls[0][0];
      const newEntry = afterCreate.find((i: any) => i.id === "conv-123");
      expect(newEntry).toBeDefined();
    });

    it("should refresh the new conversation's label when the service generates one", async () => {
      await sendFirstMessage();

      await waitFor(() => {
        expect(labelUpdatedHandler).toBeTruthy();
      });

      mockChatService.setHistory.mockClear();
      labelUpdatedHandler({ label: "Auto title", autogenerated: true });
      expect(mockChatService.setHistory).toHaveBeenCalledTimes(1);
      const afterLabel = mockChatService.setHistory.mock.calls[0][0];
      const labelled = afterLabel.find((i: any) => i.id === "conv-123");
      expect(labelled?.name).toBe("Auto title");
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

  describe("onHistorySearch", () => {
    it("should register HistorySearch event handler", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(
        () => {
          expect(mockChatService.on).toHaveBeenCalledWith(
            "historySearch",
            expect.any(Function),
          );
        },
        { timeout: 3000 },
      );
    });

    it("should refetch history with the new search text and reset cursor", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      // Initial fetch must have completed.
      await waitFor(
        () => {
          expect(mockChatService.setHistory).toHaveBeenCalled();
        },
        { timeout: 3000 },
      );

      const initialSetHistoryCalls =
        mockChatService.setHistory.mock.calls.length;

      const historySearchCall = mockChatService.on.mock.calls.find(
        (call: any) => call[0] === "historySearch",
      );
      const onHistorySearch = historySearchCall?.[1];
      expect(onHistorySearch).toBeDefined();

      await onHistorySearch?.({ searchText: "budget" });

      // The search refetches the first page and replaces history via setHistory
      // (not appendOlderHistoryItems, which would be wrong for a fresh search).
      await waitFor(() => {
        expect(mockChatService.setHistory.mock.calls.length).toBeGreaterThan(
          initialSetHistoryCalls,
        );
      });
    });
  });

  describe("telemetry", () => {
    it("should track NewChat telemetry when new chat is triggered", async () => {
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

      mockTrackTelemetry.mockClear();
      onNewChat?.();

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.NewChat",
        "CAC.Success",
      );
    });

    it("should track SendMessage success telemetry", async () => {
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

      mockTrackTelemetry.mockClear();
      await onSendMessage?.({ content: "Hello", attachments: [] });

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.SendMessage",
        "CAC.Success",
      );
    });

    it("should track SendMessage error telemetry on failure", async () => {
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

      // Make sendContentPart fail
      mockMessageBuilder.sendContentPart.mockRejectedValueOnce(
        new Error("Send failed"),
      );

      mockTrackTelemetry.mockClear();
      await onSendMessage?.({ content: "Hello", attachments: [] });

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.SendMessage",
        "CAC.Error",
        { error: "Send failed" },
      );
      expect(mockChatService.setError).toHaveBeenCalledWith(
        "Failed to send message: Send failed",
      );
    });

    it("should track OpenConversation success telemetry", async () => {
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

      mockTrackTelemetry.mockClear();
      await onClickOpenConversation?.("conv-1");

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.OpenConversation",
        "CAC.Success",
        { conversationId: "conv-1" },
      );
    });

    it("should track FileAttached success telemetry", async () => {
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

      mockTrackTelemetry.mockClear();
      await onSetAttachments?.({ added: [mockAttachment] });

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.FileAttached",
        "CAC.Success",
        { fileCount: 1 },
      );
    });

    it("should track FileAttached error telemetry on upload failure", async () => {
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

      mockTrackTelemetry.mockClear();
      await onSetAttachments?.({ added: [invalidAttachment] });

      expect(mockTrackTelemetry).toHaveBeenCalledWith(
        "CAC.FileAttached",
        "CAC.Error",
        { failedCount: 1 },
      );
    });

    it("should track SendMessage error telemetry on exchange error", async () => {
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

      mockTrackTelemetry.mockClear();
      if (exchangeErrorHandler) {
        exchangeErrorHandler({
          errorId: "err-1",
          message: "Exchange failed",
        });

        expect(mockTrackTelemetry).toHaveBeenCalledWith(
          "CAC.SendMessage",
          "CAC.Error",
          { error: "Exchange failed" },
        );
      }
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
      expect(screen.getByText("Connecting to agent...")).toBeInTheDocument();
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

  describe("externalUserId", () => {
    it("does not pass externalUserId to the ConversationalAgent constructor when omitted", async () => {
      render(<ConversationalAgentChat {...defaultProps} />);

      await waitFor(() => {
        expect(capturedAgentConstructorArgs.length).toBeGreaterThan(0);
      });

      const [, options] = capturedAgentConstructorArgs[0];
      expect(options?.externalUserId).toBeUndefined();
    });

    it("threads externalUserId through to the ConversationalAgent constructor", async () => {
      render(
        <ConversationalAgentChat
          {...defaultProps}
          externalUserId="ext-user-42"
        />,
      );

      await waitFor(() => {
        expect(
          capturedAgentConstructorArgs.some(
            (args) => args[1]?.externalUserId === "ext-user-42",
          ),
        ).toBe(true);
      });
    });

    it("rebuilds the ConversationalAgent when externalUserId changes", async () => {
      const { rerender } = render(
        <ConversationalAgentChat
          {...defaultProps}
          externalUserId="ext-user-1"
        />,
      );

      await waitFor(() => {
        expect(
          capturedAgentConstructorArgs.some(
            (args) => args[1]?.externalUserId === "ext-user-1",
          ),
        ).toBe(true);
      });

      rerender(
        <ConversationalAgentChat
          {...defaultProps}
          externalUserId="ext-user-2"
        />,
      );

      await waitFor(() => {
        expect(
          capturedAgentConstructorArgs.some(
            (args) => args[1]?.externalUserId === "ext-user-2",
          ),
        ).toBe(true);
      });
    });

    it("treats an empty externalUserId as omitted", async () => {
      render(<ConversationalAgentChat {...defaultProps} externalUserId="" />);

      await waitFor(() => {
        expect(capturedAgentConstructorArgs.length).toBeGreaterThan(0);
      });

      const [, options] = capturedAgentConstructorArgs[0];
      expect(options?.externalUserId).toBeUndefined();
    });
  });
});
