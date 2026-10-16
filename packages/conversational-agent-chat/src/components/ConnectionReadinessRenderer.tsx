import { createRoot, type Root } from "react-dom/client";
import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import {
  ConnectionReadinessCard,
  type ConnectorReadiness,
} from "./ConnectionReadinessCard";

export interface ConnectionReadinessRenderer {
  render(
    container: HTMLElement,
    message: AutopilotChatMessage,
    context: {
      conversationalAgent: ConversationalAgent;
      onAllConnected: () => void;
      onOpenSettings: () => void;
    },
  ): void;
  unmountAll(): void;
}

/**
 * Creates a per-instance renderer for connection readiness cards. Each
 * `<ConversationalAgentChat>` instance owns its own renderer so that
 * unmounting one instance never tears down another's React roots.
 */
export function createConnectionReadinessRenderer(): ConnectionReadinessRenderer {
  const roots = new Map<HTMLElement, Root>();

  return {
    render(container, message, context) {
      const meta = message?.meta ?? {};
      const connectors: ConnectorReadiness[] = meta.connectors ?? [];
      if (connectors.length === 0) return;

      let root = roots.get(container);
      if (!root) {
        root = createRoot(container);
        roots.set(container, root);
      }

      root.render(
        <ConnectionReadinessCard
          connectors={connectors}
          conversationalAgent={context.conversationalAgent}
          agentId={meta.agentId}
          folderId={meta.folderId}
          onAllConnected={context.onAllConnected}
          onOpenSettings={context.onOpenSettings}
          defaultCollapsed={meta.defaultCollapsed}
        />,
      );
    },
    unmountAll() {
      for (const root of roots.values()) {
        root.unmount();
      }
      roots.clear();
    },
  };
}
