/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, waitFor } from "@testing-library/react";
import { ConversationalAgentChat } from "../ConversationalAgentChat";
import type { UiPath } from "@uipath/uipath-typescript/core";

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
  AutopilotChatPreHookAction: {
    NewChat: "new-chat",
    ToggleSettings: "toggle-settings",
    CitationClick: "citation-click",
  },
  AutopilotChatService: {
    Instantiate: vi.fn(() => ({
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
      setAllowedAttachments: vi.fn(),
      toggleSettings: vi.fn(),
    })),
  },
}));

vi.mock("../utils/telemetryUtils", () => ({ trackTelemetry: vi.fn() }));

// The panel body is irrelevant here — these tests cover the mount/unmount
// plumbing between Apollo's container and the widget's React root.
vi.mock("../components/SettingsDialog", () => ({
  SettingsDialog: () => <div data-testid="settings-body">Settings</div>,
}));

vi.mock("@uipath/uipath-typescript/conversational-agent", () => ({
  ConversationalAgent: class {
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
      updateById: vi.fn(),
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

/**
 * Apollo's `AutopilotChatSettings` effect, reproduced verbatim in shape:
 * it wipes the container on EVERY settings toggle — including close, where it
 * returns without ever calling the renderer back.
 * See apollo-react/material/components/ap-chat/components/settings/chat-settings.
 */
function apolloToggleSettings(
  container: HTMLElement,
  settingsRenderer: (el: HTMLElement) => void,
  settingsOpen: boolean,
) {
  container.innerHTML = "";
  if (!settingsOpen) return;
  settingsRenderer(container);
}

describe("ConversationalAgentChat — Apollo settings renderer plumbing", () => {
  let mockSdk: UiPath;
  let container: HTMLDivElement;
  let consoleError: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSdk = {} as UiPath;
    container = document.createElement("div");
    container.className = "chat-settings-content";
    document.body.appendChild(container);
    // React logs caught render/commit errors; assertions cover the failure.
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
    container.remove();
  });

  const getSettingsRenderer = async () => {
    const { AutopilotChatService } =
      await import("@uipath/apollo-react/material/components");
    let renderer: ((el: HTMLElement) => void) | undefined;
    await waitFor(() => {
      const call = (AutopilotChatService.Instantiate as any).mock.calls.at(-1);
      renderer = call?.[0]?.config?.settingsRenderer;
      expect(renderer).toBeTypeOf("function");
    });
    return renderer!;
  };

  it("re-renders the settings panel after it was closed and reopened", async () => {
    render(
      <ConversationalAgentChat sdk={mockSdk} agentId={1} folderId={100} />,
    );
    const settingsRenderer = await getSettingsRenderer();

    // Open.
    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, true);
    });
    expect(
      container.querySelector("[data-testid='settings-body']"),
    ).not.toBeNull();

    // Close — Apollo detaches the widget's root DOM without telling the widget.
    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, false);
    });

    // Reopen — must not throw NotFoundError from removeChild.
    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, true);
    });
    expect(
      container.querySelector("[data-testid='settings-body']"),
    ).not.toBeNull();
  });

  it("unmounts cleanly when the widget is torn down while settings are still open", async () => {
    const { unmount } = render(
      <ConversationalAgentChat sdk={mockSdk} agentId={1} folderId={100} />,
    );
    const settingsRenderer = await getSettingsRenderer();

    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, true);
    });

    expect(() => unmount()).not.toThrow();
  });

  it("unmounts cleanly when the widget is torn down after settings were closed", async () => {
    const { unmount } = render(
      <ConversationalAgentChat sdk={mockSdk} agentId={1} folderId={100} />,
    );
    const settingsRenderer = await getSettingsRenderer();

    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, true);
    });
    await act(async () => {
      apolloToggleSettings(container, settingsRenderer, false);
    });

    expect(() => unmount()).not.toThrow();
  });
});
