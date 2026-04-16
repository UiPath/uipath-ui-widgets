import { createRoot, type Root } from "react-dom/client";
import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import { ToolConfirmation } from "./ToolConfirmation";

const roots = new WeakMap<HTMLElement, Root>();

export function renderToolConfirmation(
  container: HTMLElement,
  message: AutopilotChatMessage,
): void {
  const meta = message.meta;
  if (!meta?.confirmationData) return;

  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }

  root.render(
    <ToolConfirmation
      confirmationData={meta.confirmationData}
      isCompleted={meta.isCompleted}
      wasRejected={meta.wasRejected}
      onApprove={meta.onApprove}
      onCancel={meta.onCancel}
    />,
  );
}
