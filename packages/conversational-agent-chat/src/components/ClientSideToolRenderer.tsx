import { createRoot, type Root } from "react-dom/client";
import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import { PortalContainerProvider } from "@uipath/apollo-wind";
import i18next from "i18next";
import { initI18n } from "../i18n";
import {
  ClientSideTool,
  type ClientSideToolLabels,
} from "./ClientSideTool";

initI18n();

export function resolveClientSideToolLabels(
  overrides?: Partial<ClientSideToolLabels>,
): ClientSideToolLabels {
  return {
    submit: overrides?.submit ?? i18next.t("client_side_tool_submit", "Submit"),
    cancel: overrides?.cancel ?? i18next.t("cancel"),
    description:
      overrides?.description ??
      i18next.t(
        "client_side_tool_description",
        "Fill in the fields below and submit to continue.",
      ),
  };
}

export interface ClientSideToolRenderer {
  render(
    container: HTMLElement,
    message: AutopilotChatMessage,
    labelOverrides?: Partial<ClientSideToolLabels>,
  ): void;
  unmountAll(): void;
}

export function createClientSideToolRenderer(): ClientSideToolRenderer {
  const roots = new Map<HTMLElement, Root>();

  return {
    render(container, message, labelOverrides) {
      const meta = message.meta;
      if (!meta) return;

      if (meta.isCompleted) {
        const root = roots.get(container);
        if (root) {
          root.unmount();
          roots.delete(container);
        }
        return;
      }

      if (roots.has(container)) return;

      const root = createRoot(container);
      roots.set(container, root);

      const labels = resolveClientSideToolLabels(labelOverrides);

      root.render(
        <PortalContainerProvider>
          <ClientSideTool
            toolName={meta.toolName}
            inputSchema={meta.inputSchema}
            defaultValues={meta.defaultValues}
            labels={labels}
            onSubmit={(formData) => {
              meta.onSubmit?.(formData);
              root.unmount();
              roots.delete(container);
            }}
            onCancel={() => {
              meta.onCancel?.();
              root.unmount();
              roots.delete(container);
            }}
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
