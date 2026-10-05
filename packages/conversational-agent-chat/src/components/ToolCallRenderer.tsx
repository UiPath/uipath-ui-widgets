import { createRoot, type Root } from "react-dom/client";
import {
  ApToolCall,
  type AutopilotChatMessage,
  type SupportedLocale,
} from "@uipath/apollo-react/material/components";

// ApChat's built-in tool call renderer creates a new component type on every
// render, so each update to the message remounts ApToolCall and resets its
// expanded state. Rendering it into a root we own, re-rendered in place per
// container, keeps the same component instance (and its state) across updates
// — e.g. the trace-polling updates in FullTrace mode.
export interface ToolCallRenderer {
  render(
    container: HTMLElement,
    message: AutopilotChatMessage,
    locale: SupportedLocale,
  ): void;
  unmountAll(): void;
}

export function createToolCallRenderer(): ToolCallRenderer {
  const roots = new Map<HTMLElement, Root>();

  return {
    render(container, message, locale) {
      const meta = message.meta;
      if (!meta) return;
      if (!meta.span && !meta.input && !meta.toolName) return;

      // Drop roots whose message box has left the DOM (conversation switched,
      // chat cleared) so they don't accumulate for the widget's lifetime.
      for (const [el, root] of roots) {
        if (el !== container && !el.isConnected) {
          root.unmount();
          roots.delete(el);
        }
      }

      let root = roots.get(container);
      if (!root) {
        root = createRoot(container);
        roots.set(container, root);
      }

      root.render(
        <ApToolCall
          span={meta.span}
          toolName={meta.toolName}
          input={meta.input}
          output={meta.output}
          isError={meta.isError}
          startTime={meta.startTime}
          endTime={meta.endTime}
          displayMode={meta.displayMode}
          locale={locale}
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
