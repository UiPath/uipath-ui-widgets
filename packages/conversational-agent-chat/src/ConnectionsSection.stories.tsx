import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { ConnectionsSection } from "./components/SettingsDialog/ConnectionsSection";
import { ConnectionReadinessCard } from "./components/ConnectionReadinessCard";
import type { ConnectorReadiness } from "./components/ConnectionReadinessCard";
import { initI18n } from "./i18n";
import "./ConversationalAgentChat.scss";

// Initialize i18n so translations work in stories
initI18n();

// ─── Mock data ───

const MOCK_CONNECTIONS = [
  {
    connectorKey: "google-drive",
    connectorName: "Google Drive",
    connectorImage:
      "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
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
        state: "Enabled" as const,
        isDefault: true,
        personalWorkspace: true,
        folderKey: null,
        folderName: null,
      },
      {
        id: "conn-2",
        name: "work@company.com",
        state: "Enabled" as const,
        isDefault: false,
        personalWorkspace: false,
        folderKey: "f1",
        folderName: "Marketing",
      },
      {
        id: "conn-3",
        name: "shared@team.com",
        state: "Expired" as const,
        isDefault: false,
        personalWorkspace: false,
        folderKey: "f2",
        folderName: "Engineering",
      },
    ],
  },
  {
    connectorKey: "salesforce",
    connectorName: "Salesforce",
    connectorImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png",
    resourceKeys: ["sf.contacts"],
    currentConnectionId: null,
    currentConnectionName: null,
    isConfigurable: true,
    connections: [
      {
        id: "conn-4",
        name: "admin@salesforce.com",
        state: "Enabled" as const,
        isDefault: false,
        personalWorkspace: true,
        folderKey: null,
        folderName: null,
      },
    ],
  },
  {
    connectorKey: "outlook",
    connectorName: "Outlook",
    resourceKeys: ["outlook.mail"],
    currentConnectionId: "conn-5",
    currentConnectionName: "shared-outlook@company.com",
    isConfigurable: false,
    connections: [],
  },
];

const createMockAgent = (connections = MOCK_CONNECTIONS, delay = 300) => {
  return {
    getAvailableConnections: () =>
      new Promise((resolve) =>
        setTimeout(() => resolve([...connections]), delay),
      ),
    updateConnectionSelections: (
      _a: number,
      _f: number,
      payload: {
        selections: Array<{
          connectorKey: string;
          connectionId: string | null;
        }>;
      },
    ) =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve(
              connections.map((c) => {
                const sel = payload.selections.find(
                  (s: { connectorKey: string }) =>
                    s.connectorKey === c.connectorKey,
                );
                return sel
                  ? {
                      ...c,
                      currentConnectionId: sel.connectionId,
                      currentConnectionName:
                        c.connections.find(
                          (conn: { id: string }) =>
                            conn.id === sel.connectionId,
                        )?.name ?? null,
                    }
                  : c;
              }),
            ),
          delay,
        ),
      ),
    getConnectionAuthUrl: () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              authUrl: "https://accounts.google.com/o/oauth2/v2/auth?fake=1",
              sessionId: "session-" + Date.now(),
              expiresTime: Date.now() + 300_000,
            }),
          200,
        ),
      ),
    getConnectionSessionStatus: () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              status: "pending",
              connectionId: null,
              expiresTime: Date.now() + 300_000,
            }),
          200,
        ),
      ),
  } as unknown as ConversationalAgent;
};

// ─── ConnectionsSection stories ───

const sectionMeta = {
  title: "Components/ConnectionsSection",
  component: ConnectionsSection,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Settings panel section for managing personal OAuth connections per connector binding.",
      },
    },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 400,
          padding: 16,
          background: "var(--background)",
          borderRadius: 8,
          border: "1px solid var(--border)",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ConnectionsSection>;

export default sectionMeta;
type SectionStory = StoryObj<typeof sectionMeta>;

export const Default: SectionStory = {
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2,
  },
};

export const Empty: SectionStory = {
  args: {
    conversationalAgent: createMockAgent([]),
    agentId: 1,
    folderId: 2,
  },
};

export const LoadError: SectionStory = {
  args: {
    conversationalAgent: {
      getAvailableConnections: () =>
        Promise.reject(new Error("Failed to fetch connections")),
    } as unknown as ConversationalAgent,
    agentId: 1,
    folderId: 2,
  },
};

// ─── ConnectionReadinessCard stories ───

const READINESS_UNCONNECTED: ConnectorReadiness[] = [
  {
    connectorKey: "google-drive",
    connectorName: "Google Drive",
    connectorImage:
      "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    isConfigurable: true,
    currentConnectionId: null,
    currentConnectionName: null,
  },
  {
    connectorKey: "salesforce",
    connectorName: "Salesforce",
    connectorImage:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Salesforce.com_logo.svg/100px-Salesforce.com_logo.svg.png",
    isConfigurable: true,
    currentConnectionId: null,
    currentConnectionName: null,
  },
];

const READINESS_BROKEN: ConnectorReadiness[] = [
  {
    connectorKey: "google-drive",
    connectorName: "Google Drive",
    connectorImage:
      "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    isConfigurable: true,
    currentConnectionId: "conn-1",
    currentConnectionName: "john@example.com",
    currentConnectionState: "Expired",
  },
  {
    connectorKey: "salesforce",
    connectorName: "Salesforce",
    isConfigurable: true,
    currentConnectionId: "conn-2",
    currentConnectionName: "admin@sf.com",
    currentConnectionState: "Failed",
  },
];

const READINESS_MIXED: ConnectorReadiness[] = [
  {
    connectorKey: "google-drive",
    connectorName: "Google Drive",
    connectorImage:
      "https://www.gstatic.com/images/branding/product/1x/drive_2020q4_48dp.png",
    isConfigurable: true,
    currentConnectionId: "conn-1",
    currentConnectionName: "john@example.com",
    currentConnectionState: "Enabled",
  },
  {
    connectorKey: "salesforce",
    connectorName: "Salesforce",
    isConfigurable: true,
    currentConnectionId: null,
    currentConnectionName: null,
  },
];

export const ReadinessSetupNeeded: SectionStory = {
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2,
  },
  render: () => (
    <div style={{ width: 450 }}>
      <ConnectionReadinessCard
        connectors={READINESS_UNCONNECTED}
        conversationalAgent={createMockAgent()}
        agentId={1}
        folderId={2}
        onOpenSettings={() => alert("Open settings clicked")}
      />
    </div>
  ),
};

export const ReadinessBroken: SectionStory = {
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2,
  },
  render: () => (
    <div style={{ width: 450 }}>
      <ConnectionReadinessCard
        connectors={READINESS_BROKEN}
        conversationalAgent={createMockAgent()}
        agentId={1}
        folderId={2}
        onOpenSettings={() => alert("Open settings clicked")}
      />
    </div>
  ),
};

export const ReadinessMixed: SectionStory = {
  args: {
    conversationalAgent: createMockAgent(),
    agentId: 1,
    folderId: 2,
  },
  render: () => (
    <div style={{ width: 450 }}>
      <ConnectionReadinessCard
        connectors={READINESS_MIXED}
        conversationalAgent={createMockAgent()}
        agentId={1}
        folderId={2}
        onOpenSettings={() => alert("Open settings clicked")}
      />
    </div>
  ),
};
