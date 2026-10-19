import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { createConnectionReadinessRenderer } from "../components/ConnectionReadinessRenderer";
import { initI18n } from "../i18n";

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = () => {};
  initI18n();
});

const makeConnector = (overrides: Record<string, unknown> = {}) => ({
  connectorKey: "google-drive",
  connectorName: "Google Drive",
  isConfigurable: true,
  currentConnectionId: null,
  currentConnectionName: null,
  ...overrides,
});

const makeMessage = (
  metaOverrides: Record<string, unknown> = {},
): AutopilotChatMessage =>
  ({
    id: "readiness-card",
    meta: {
      connectors: [makeConnector()],
      agentId: 1,
      folderId: 2,
      defaultCollapsed: false,
      ...metaOverrides,
    },
  }) as unknown as AutopilotChatMessage;

const makeContext = () => ({
  conversationalAgent: {
    getAvailableConnections: vi.fn().mockResolvedValue([]),
    getConnectionAuthUrl: vi.fn(),
    getConnectionSessionStatus: vi.fn(),
    updateConnectionSelections: vi.fn(),
  } as unknown as ConversationalAgent,
  onAllConnected: vi.fn(),
  onOpenSettings: vi.fn(),
  onConnectionsChanged: vi.fn(),
});

describe("createConnectionReadinessRenderer", () => {
  let container: HTMLElement;

  beforeAll(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  });

  it("renders the card into the container", async () => {
    const renderer = createConnectionReadinessRenderer();
    renderer.render(container, makeMessage(), makeContext());
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Google Drive");
    });
  });

  it("skips rendering when connectors array is empty", () => {
    const renderer = createConnectionReadinessRenderer();
    renderer.render(container, makeMessage({ connectors: [] }), makeContext());
    expect(container.childNodes.length).toBe(0);
  });

  it("reuses the root on subsequent renders", async () => {
    const renderer = createConnectionReadinessRenderer();
    const ctx = makeContext();
    renderer.render(container, makeMessage(), ctx);
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Google Drive");
    });
    // Second render should not throw
    renderer.render(container, makeMessage(), ctx);
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Google Drive");
    });
  });

  it("unmountAll clears all roots", async () => {
    const renderer = createConnectionReadinessRenderer();
    renderer.render(container, makeMessage(), makeContext());
    await vi.waitFor(() => {
      expect(container.textContent).toContain("Google Drive");
    });
    renderer.unmountAll();
    await vi.waitFor(() => {
      expect(container.textContent).toBe("");
    });
  });
});
