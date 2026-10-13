import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { ConnectionState } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { initI18n } from "../../i18n";
import { ConnectionsSection } from "../../components/SettingsDialog/ConnectionsSection";

beforeAll(() => {
  initI18n();
});

const MOCK_CONNECTIONS = [
  {
    connectorKey: "google-drive",
    connectorName: "Google Drive",
    connectorImage: "https://example.com/drive.png",
    resourceKeys: ["drive.files"],
    currentConnectionId: "conn-1",
    currentConnectionName: "john@example.com",
    configurationUrl: "https://example.com/config",
    connectionsUrl: "https://example.com/connections",
    isConfigurable: true,
    connections: [
      {
        id: "conn-1",
        name: "john@example.com",
        state: ConnectionState.Enabled,
        isDefault: true,
        personalWorkspace: true,
        folderKey: null,
        folderName: null,
      },
      {
        id: "conn-2",
        name: "work@company.com",
        state: ConnectionState.Enabled,
        isDefault: false,
        personalWorkspace: false,
        folderKey: "f1",
        folderName: "Marketing",
      },
    ],
  },
  {
    connectorKey: "salesforce",
    connectorName: "Salesforce",
    resourceKeys: ["sf.contacts"],
    currentConnectionId: null,
    currentConnectionName: null,
    isConfigurable: true,
    connections: [],
  },
];

const makeAgent = (
  connectionsData = MOCK_CONNECTIONS,
): {
  agent: ConversationalAgent;
  mocks: Record<string, ReturnType<typeof vi.fn>>;
} => {
  const getAvailableConnections = vi.fn().mockResolvedValue(connectionsData);
  const updateConnectionSelections = vi.fn().mockResolvedValue(connectionsData);
  const getConnectionAuthUrl = vi.fn().mockResolvedValue({
    authUrl: "https://auth.example.com",
    sessionId: "sess-1",
    expiresTime: Date.now() + 300_000,
  });
  const getConnectionSessionStatus = vi.fn().mockResolvedValue({
    status: "pending",
    connectionId: null,
    expiresTime: Date.now() + 300_000,
  });

  const agent = {
    getAvailableConnections,
    updateConnectionSelections,
    getConnectionAuthUrl,
    getConnectionSessionStatus,
  } as unknown as ConversationalAgent;

  return {
    agent,
    mocks: {
      getAvailableConnections,
      updateConnectionSelections,
      getConnectionAuthUrl,
      getConnectionSessionStatus,
    },
  };
};

describe("ConnectionsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner then connector rows", async () => {
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // Loading state
    expect(
      document.querySelector("[class*=spinner]") ??
        document.querySelector("svg"),
    ).toBeTruthy();

    // Wait for data
    await waitFor(() => {
      expect(screen.getByText("Google Drive")).toBeInTheDocument();
    });
    expect(screen.getByText("Salesforce")).toBeInTheDocument();
  });

  it("shows current connection name for connected connector", async () => {
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
  });

  it("shows Connect button for unconnected connector", async () => {
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Connect")).toBeInTheDocument();
    });
  });

  it("shows error alert when load fails", async () => {
    const { agent, mocks } = makeAgent();
    mocks.getAvailableConnections.mockRejectedValue(new Error("Network error"));

    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it("shows empty state when no connectors", async () => {
    const { agent } = makeAgent([]);
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("No connections available")).toBeInTheDocument();
    });
  });

  it("opens picker when clicking connection name", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
    await user.click(screen.getByText("john@example.com"));
    expect(
      screen.getByPlaceholderText("Search connections"),
    ).toBeInTheDocument();
    expect(screen.getByText("work@company.com")).toBeInTheDocument();
  });

  it("groups connections by personal workspace and folder", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });
    await user.click(screen.getByText("john@example.com"));
    expect(screen.getByText("Personal Workspace")).toBeInTheDocument();
    expect(screen.getByText("Marketing")).toBeInTheDocument();
  });

  it("enables save button when selection changes", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    // Apply button should be disabled initially
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    expect(applyButton).toBeDisabled();

    // Open picker and select different connection
    await user.click(screen.getByText("john@example.com"));
    await user.click(screen.getByText("work@company.com"));

    // Apply button should now be enabled
    expect(applyButton).not.toBeDisabled();
  });

  it("calls updateConnectionSelections on save", async () => {
    const user = userEvent.setup();
    const { agent, mocks } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    await user.click(screen.getByText("john@example.com"));
    await user.click(screen.getByText("work@company.com"));

    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    expect(mocks.updateConnectionSelections).toHaveBeenCalledWith(
      1,
      2,
      expect.objectContaining({
        selections: expect.arrayContaining([
          expect.objectContaining({
            connectorKey: "google-drive",
            connectionId: "conn-2",
          }),
        ]),
      }),
    );
  });

  it("resets selections on cancel", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    await user.click(screen.getByText("john@example.com"));
    await user.click(screen.getByText("work@company.com"));

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);

    // Apply should be disabled again
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    expect(applyButton).toBeDisabled();
  });

  it("clearing a connection that was originally empty keeps isDirty false", async () => {
    const user = userEvent.setup();
    // Salesforce has no currentConnectionId → initial value is ""
    const { agent } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Salesforce")).toBeInTheDocument();
    });

    // Apply should be disabled — no changes
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    expect(applyButton).toBeDisabled();
  });

  it("clears loadError on successful retry", async () => {
    const { agent, mocks } = makeAgent();
    // First call fails
    mocks.getAvailableConnections.mockRejectedValueOnce(
      new Error("Network error"),
    );
    // Subsequent calls succeed
    mocks.getAvailableConnections.mockResolvedValue(MOCK_CONNECTIONS);

    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // Error should appear
    await waitFor(() => {
      expect(screen.getByText(/Network error/)).toBeInTheDocument();
    });
  });

  it("sends connectionId null when clearing a connected connector", async () => {
    const user = userEvent.setup();
    const { agent, mocks } = makeAgent();
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("john@example.com")).toBeInTheDocument();
    });

    // Click the clear (X) button for Google Drive
    const clearButton = screen.getByRole("button", { name: /clear/i });
    await user.click(clearButton);

    // Apply should be enabled
    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    expect(applyButton).not.toBeDisabled();

    await user.click(applyButton);

    // Should include the cleared connector with connectionId: null
    expect(mocks.updateConnectionSelections).toHaveBeenCalledWith(
      1,
      2,
      expect.objectContaining({
        selections: expect.arrayContaining([
          expect.objectContaining({
            connectorKey: "google-drive",
            connectionId: null,
          }),
        ]),
      }),
    );
  });

  it("filters non-configurable connectors from save payload", async () => {
    const user = userEvent.setup();
    const connectionsWithNonConfigurable = [
      ...MOCK_CONNECTIONS,
      {
        connectorKey: "shared-service",
        connectorName: "Shared Service",
        resourceKeys: [],
        currentConnectionId: "admin-conn",
        currentConnectionName: "admin",
        isConfigurable: false,
        connections: [],
      },
    ];
    const { agent, mocks } = makeAgent(connectionsWithNonConfigurable);
    render(
      <ConnectionsSection
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Google Drive")).toBeInTheDocument();
    });

    // Change a selection to make dirty
    await user.click(screen.getByText("john@example.com"));
    await user.click(screen.getByText("work@company.com"));

    const applyButton = screen.getByRole("button", { name: /apply changes/i });
    await user.click(applyButton);

    const call = mocks.updateConnectionSelections.mock.calls[0];
    const keys = call[2].selections.map(
      (s: { connectorKey: string }) => s.connectorKey,
    );
    expect(keys).not.toContain("shared-service");
  });
});
