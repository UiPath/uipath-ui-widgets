import { createRoot, type Root } from "react-dom/client";
import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import { getI18n } from "../i18n";
import {
  ToolConfirmation,
  type ToolConfirmationLabels,
} from "./ToolConfirmation";
import { PortalContainerProvider } from "@uipath/apollo-wind";

// The widget's own instance, created on first use — never the shared default
// one, which a host may already own. Safe when this module is imported directly
// (i.e. without first importing ConversationalAgentChat).
const i18n = getI18n();

/** Resolves labels for a separate React root (tool confirmation widget). Prefer passing overrides from the chat component where `useTranslation` runs. */
export function resolveToolConfirmationLabels(
  overrides?: Partial<ToolConfirmationLabels>,
): ToolConfirmationLabels {
  return {
    cancel: overrides?.cancel ?? i18n.t("cancel"),
    confirm: overrides?.confirm ?? i18n.t("tool_confirmation_confirm"),
    statusCancelled:
      overrides?.statusCancelled ??
      i18n.t("tool_confirmation_status_cancelled"),
    statusConfirmed:
      overrides?.statusConfirmed ??
      i18n.t("tool_confirmation_status_confirmed"),
  };
}

export interface ToolConfirmationRenderer {
  render(
    container: HTMLElement,
    message: AutopilotChatMessage,
    labelOverrides?: Partial<ToolConfirmationLabels>,
  ): void;
  unmountAll(): void;
}

/**
 * Creates a per-instance renderer for tool confirmation widgets. Each
 * `<ConversationalAgentChat>` instance owns its own renderer so that
 * unmounting one instance never tears down another's React roots.
 */
export function createToolConfirmationRenderer(): ToolConfirmationRenderer {
  // Tracks every React root we create for tool-confirmation rendering so the
  // widget can unmount them on its own teardown. Without this, React keeps
  // internal state for each container until GC and may warn about reusing a
  // container with a new tree.
  const roots = new Map<HTMLElement, Root>();

  return {
    render(container, message, labelOverrides) {
      const meta = message.meta;
      if (!meta?.confirmationData) return;

      let root = roots.get(container);
      if (!root) {
        root = createRoot(container);
        roots.set(container, root);
      }

      const labels = resolveToolConfirmationLabels(labelOverrides);

      root.render(
        <PortalContainerProvider>
          <ToolConfirmation
            confirmationData={meta.confirmationData}
            isCompleted={meta.isCompleted}
            wasRejected={meta.wasRejected}
            labels={labels}
            onApprove={meta.onApprove}
            onCancel={meta.onCancel}
          />
        </PortalContainerProvider>,
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
