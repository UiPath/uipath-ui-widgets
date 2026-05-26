/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { ConversationalAgentChat } from "../ConversationalAgentChat";
import type { UiPath } from "@uipath/uipath-typescript/core";

const conversationalAgentCtorCalls: any[] = [];

vi.mock("@uipath/apollo-react/core/fonts/font.css", () => ({}));

vi.mock("@uipath/apollo-react/material/components", () => ({
  ApChat: () => <div data-testid="ap-chat" />,
  AutopilotChatMode: { Embedded: "embedded" },
  AutopilotChatEvent: {
    NewChat: "newChat",
    Request: "request",
    SetAttachments: "setAttachments",
    OpenConversation: "openConversation",
    DeleteConversation: "deleteConversation",
    HistoryLoadMore: "historyLoadMore",
    Feedback: "feedback",
  },
  AutopilotChatService: {
    Instantiate: vi.fn(() => ({
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
      setLocale: vi.fn(),
      setTheme: vi.fn(),
      getLocale: vi.fn().mockReturnValue("en"),
    })),
  },
}));

vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: vi.fn(),
}));

vi.mock("@uipath/uipath-typescript/conversational-agent", () => ({
  ConversationalAgent: class {
    constructor(...args: any[]) {
      conversationalAgentCtorCalls.push(args);
    }
    getById = vi.fn().mockResolvedValue({
      name: "Test Agent",
      appearance: {
        welcomeTitle: "Welcome",
        welcomeDescription: "Hi",
        startingPrompts: [],
      },
    });
    conversations = {
      create: vi.fn().mockResolvedValue({ id: "conv-1" }),
      getAll: vi.fn().mockResolvedValue({
        items: [],
        nextCursor: undefined,
        hasNextPage: false,
      }),
      getById: vi.fn(),
      uploadAttachment: vi.fn(),
      deleteById: vi.fn(),
      startSession: vi.fn().mockImplementation(() => ({
        onSessionStarted: vi.fn(() => ({ startExchange: vi.fn() })),
        startExchange: vi.fn(),
      })),
    };
  },
  SortOrder: { Descending: "descending", Ascending: "ascending" },
}));

describe("ConversationalAgentChat — surface prop forwarding", () => {
  // The widget constructs the chat's own agentService synchronously during the
  // first render (call [0]); the shared agent cache may construct an additional
  // resolver instance on a cold cache (call [1]). The cache is keyed by the sdk
  // instance, so a fresh sdk per test keeps construction counts deterministic.
  let mockSdk: UiPath;
  let baseProps: { sdk: UiPath; agentId: number; folderId: number };

  beforeEach(() => {
    conversationalAgentCtorCalls.length = 0;
    vi.clearAllMocks();
    mockSdk = {} as UiPath;
    baseProps = { sdk: mockSdk, agentId: 1, folderId: 100 };
  });

  it("constructs ConversationalAgent with { surfaceName, surfaceVersion: undefined } when only surfaceName prop is set", () => {
    render(
      <ConversationalAgentChat
        {...baseProps}
        surfaceName="agent_builder_frontend"
      />,
    );

    expect(conversationalAgentCtorCalls.length).toBeGreaterThanOrEqual(1);
    const [sdkArg, optionsArg] = conversationalAgentCtorCalls[0];
    expect(sdkArg).toBe(mockSdk);
    expect(optionsArg).toEqual({
      surfaceName: "agent_builder_frontend",
      surfaceVersion: undefined,
    });
  });

  it("constructs ConversationalAgent with both surfaceName and surfaceVersion when provided", () => {
    render(
      <ConversationalAgentChat
        {...baseProps}
        surfaceName="uipath_instance_management"
        surfaceVersion="1.2.3"
      />,
    );

    expect(conversationalAgentCtorCalls.length).toBeGreaterThanOrEqual(1);
    const [, optionsArg] = conversationalAgentCtorCalls[0];
    expect(optionsArg).toEqual({
      surfaceName: "uipath_instance_management",
      surfaceVersion: "1.2.3",
    });
  });

  it("constructs ConversationalAgent with undefined surface fields when props are omitted", () => {
    render(<ConversationalAgentChat {...baseProps} />);

    expect(conversationalAgentCtorCalls.length).toBeGreaterThanOrEqual(1);
    const [, optionsArg] = conversationalAgentCtorCalls[0];
    expect(optionsArg).toEqual({
      surfaceName: undefined,
      surfaceVersion: undefined,
    });
  });
});
