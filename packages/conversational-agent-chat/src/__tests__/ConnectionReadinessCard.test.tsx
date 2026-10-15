import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// ConnectionState is a string enum; replicate values inline to avoid SDK
// module resolution issues in the vitest/jsdom environment.
enum ConnectionState {
  Enabled = "Enabled",
  Expired = "Expired",
  Disabled = "Disabled",
  Failed = "Failed",
}
import { initI18n } from "../i18n";
import {
  ConnectionReadinessCard,
  type ConnectorReadiness,
} from "../components/ConnectionReadinessCard";

beforeAll(() => {
  initI18n();
});

const makeConnector = (
  overrides: Partial<ConnectorReadiness> = {},
): ConnectorReadiness => ({
  connectorKey: "google-drive",
  connectorName: "Google Drive",
  connectorImage: "https://example.com/drive.png",
  isConfigurable: true,
  currentConnectionId: null,
  currentConnectionName: null,
  ...overrides,
});

const makeAgent = (): {
  agent: ConversationalAgent;
  mocks: Record<string, ReturnType<typeof vi.fn>>;
} => {
  const getAvailableConnections = vi.fn().mockResolvedValue([]);
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
  const updateConnectionSelections = vi.fn().mockResolvedValue([]);

  const agent = {
    getAvailableConnections,
    getConnectionAuthUrl,
    getConnectionSessionStatus,
    updateConnectionSelections,
  } as unknown as ConversationalAgent;

  return {
    agent,
    mocks: {
      getAvailableConnections,
      getConnectionAuthUrl,
      getConnectionSessionStatus,
      updateConnectionSelections,
    },
  };
};

describe("ConnectionReadinessCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- Setup card (unconnected connectors, no broken) ---

  it("renders setup card when connectors need initial setup", async () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
      }),
      makeConnector({
        connectorKey: "salesforce",
        connectorName: "Salesforce",
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    expect(screen.getByText("Google Drive")).toBeInTheDocument();
    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    // Both should have Connect buttons
    const connectButtons = screen.getAllByText("Connect");
    expect(connectButtons).toHaveLength(2);
  });

  it("shows mixed title with remaining count when partially connected", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Enabled,
      }),
      makeConnector({
        connectorKey: "salesforce",
        connectorName: "Salesforce",
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // 1 of 2 still needed
    expect(screen.getByText(/1 of 2/)).toBeInTheDocument();
  });

  // --- Broken card (expired/failed connections) ---

  it("renders broken card with reconnect for expired connections", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Expired,
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    expect(screen.getByText("Google Drive")).toBeInTheDocument();
    expect(screen.getByText("Reconnect")).toBeInTheDocument();
  });

  it("shows healthy connections alongside broken ones", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Expired,
      }),
      makeConnector({
        connectorKey: "salesforce",
        connectorName: "Salesforce",
        currentConnectionId: "conn-2",
        currentConnectionName: "admin@sf.com",
        currentConnectionState: ConnectionState.Enabled,
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // Both should be visible — broken with Reconnect, healthy without
    expect(screen.getByText("Google Drive")).toBeInTheDocument();
    expect(screen.getByText("Salesforce")).toBeInTheDocument();
    expect(screen.getByText("Reconnect")).toBeInTheDocument();
  });

  // --- Collapsed bar ---

  it("returns null when all connectors are connected", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Enabled,
      }),
    ];

    const { container } = render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("calls onAllConnected when all connectors become connected", () => {
    const { agent } = makeAgent();
    const onAllConnected = vi.fn();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Enabled,
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
        onAllConnected={onAllConnected}
      />,
    );

    expect(onAllConnected).toHaveBeenCalled();
  });

  it("shows collapsed bar with count when defaultCollapsed and has broken", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Expired,
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
        defaultCollapsed
      />,
    );

    // Should show collapsed bar with "Show" button
    expect(screen.getByText("Show")).toBeInTheDocument();

    // Clicking Show expands the card
    await user.click(screen.getByText("Show"));
    expect(screen.getByText("Reconnect")).toBeInTheDocument();
  });

  it("counts unconnected + broken in collapsed bar", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Expired,
      }),
      makeConnector({
        connectorKey: "salesforce",
        connectorName: "Salesforce",
        // unconnected — no currentConnectionId
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
        defaultCollapsed
      />,
    );

    // neededCount = unconnected(1) + broken(1) = 2
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  // --- Non-configurable connectors ---

  it("excludes non-configurable connectors from broken/unconnected", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "shared-service",
        connectorName: "Shared Service",
        isConfigurable: false,
        currentConnectionId: "conn-1",
        currentConnectionName: "admin",
        currentConnectionState: ConnectionState.Expired,
      }),
    ];

    const { container } = render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // Non-configurable expired connector should not trigger the card
    expect(container.innerHTML).toBe("");
  });

  // --- Hide/Show toggle ---

  it("hides expanded card when Hide is clicked", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    expect(screen.getByText("Connect")).toBeInTheDocument();

    await user.click(screen.getByText("Hide"));

    // Should now be collapsed bar (unconnected count = 1)
    expect(screen.getByText("Show")).toBeInTheDocument();
    expect(screen.queryByText("Connect")).not.toBeInTheDocument();
  });

  // --- Localized state text ---

  it("uses localized status text for broken connections", () => {
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        currentConnectionId: "conn-1",
        currentConnectionName: "john@example.com",
        currentConnectionState: ConnectionState.Expired,
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    // Should show localized "Expired" not the raw enum
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/Expired/)).toBeInTheDocument();
  });

  // --- Open settings ---

  it("shows open settings link when onOpenSettings is provided", () => {
    const { agent } = makeAgent();
    const onOpenSettings = vi.fn();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
      }),
    ];

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
        onOpenSettings={onOpenSettings}
      />,
    );

    const settingsLink = screen.getByText("Open connections");
    expect(settingsLink).toBeInTheDocument();
  });

  // --- OAuth connect ---

  it("shows spinner when connecting", async () => {
    const user = userEvent.setup();
    const { agent } = makeAgent();
    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
      }),
    ];

    // Mock window.open
    const windowOpen = vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    await user.click(screen.getByText("Connect"));

    await waitFor(() => {
      expect(screen.getByText("Waiting for sign-in...")).toBeInTheDocument();
    });

    expect(windowOpen).toHaveBeenCalledWith(
      "https://auth.example.com",
      "_blank",
      "noopener,noreferrer,width=600,height=700",
    );

    windowOpen.mockRestore();
  });

  // --- OAuth save filters non-configurable ---

  it("filters non-configurable connectors from OAuth save payload", async () => {
    const user = userEvent.setup();
    const { agent, mocks } = makeAgent();

    mocks.getConnectionSessionStatus.mockResolvedValue({
      status: "success",
      connectionId: "new-conn-1",
      expiresTime: Date.now() + 300_000,
    });
    mocks.updateConnectionSelections.mockResolvedValue([]);

    const connectors = [
      makeConnector({
        connectorKey: "google-drive",
        connectorName: "Google Drive",
        isConfigurable: true,
      }),
      makeConnector({
        connectorKey: "shared-service",
        connectorName: "Shared Service",
        isConfigurable: false,
        currentConnectionId: "admin-conn",
        currentConnectionName: "admin",
        currentConnectionState: ConnectionState.Enabled,
      }),
    ];

    vi.spyOn(window, "open").mockImplementation(() => null);

    render(
      <ConnectionReadinessCard
        connectors={connectors}
        conversationalAgent={agent}
        agentId={1}
        folderId={2}
      />,
    );

    await user.click(screen.getByText("Connect"));

    // Wait for polling to fire and process success
    await waitFor(() => {
      expect(mocks.updateConnectionSelections).toHaveBeenCalled();
    });

    const call = mocks.updateConnectionSelections.mock.calls[0];
    const selections = call[2].selections;
    // Should only include configurable connectors
    const keys = selections.map(
      (s: { connectorKey: string }) => s.connectorKey,
    );
    expect(keys).not.toContain("shared-service");
    expect(keys).toContain("google-drive");

    vi.spyOn(window, "open").mockRestore();
  });
});
