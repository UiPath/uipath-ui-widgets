/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createToolCallRenderer } from "../components/ToolCallRenderer";

const { apToolCallMounts } = vi.hoisted(() => ({
  apToolCallMounts: { count: 0 },
}));

vi.mock("@uipath/apollo-react/material/components", async () => {
  const { useEffect } = await import("react");
  return {
    ApToolCall: (props: any) => {
      useEffect(() => {
        apToolCallMounts.count += 1;
      }, []);
      return (
        <div
          data-testid="ap-tool-call"
          data-tool-name={props.toolName}
          data-display-mode={props.displayMode}
          data-locale={props.locale}
          data-span-key={props.span?.key}
          data-output={JSON.stringify(props.output)}
        />
      );
    },
  };
});

const makeMessage = (meta?: Record<string, unknown>): AutopilotChatMessage =>
  ({ id: "tool-1", meta }) as unknown as AutopilotChatMessage;

describe("createToolCallRenderer", () => {
  let container: HTMLElement;

  beforeEach(() => {
    apToolCallMounts.count = 0;
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  const renderInto = (
    renderer: ReturnType<typeof createToolCallRenderer>,
    target: HTMLElement,
    meta?: Record<string, unknown>,
    locale = "en",
  ) =>
    act(() => {
      renderer.render(target, makeMessage(meta), locale as any);
    });

  it("renders ApToolCall with the message meta and locale", () => {
    const renderer = createToolCallRenderer();
    renderInto(
      renderer,
      container,
      {
        toolName: "Web_Search",
        displayMode: "FullTrace",
        span: { key: "span-1", name: "Tool call", data: {} },
        output: { ok: true },
      },
      "de",
    );

    const el = container.querySelector('[data-testid="ap-tool-call"]');
    expect(el?.getAttribute("data-tool-name")).toBe("Web_Search");
    expect(el?.getAttribute("data-display-mode")).toBe("FullTrace");
    expect(el?.getAttribute("data-locale")).toBe("de");
    expect(el?.getAttribute("data-span-key")).toBe("span-1");
    expect(el?.getAttribute("data-output")).toBe('{"ok":true}');
    renderer.unmountAll();
  });

  it("renders nothing without meta or without span, input and toolName", () => {
    const renderer = createToolCallRenderer();
    renderInto(renderer, container, undefined);
    renderInto(renderer, container, { output: "x" });

    expect(container.querySelector('[data-testid="ap-tool-call"]')).toBeNull();
  });

  it("re-renders in place so ApToolCall keeps its state across updates", () => {
    const renderer = createToolCallRenderer();
    renderInto(renderer, container, { toolName: "search" });
    renderInto(renderer, container, { toolName: "search", output: "done" });

    expect(apToolCallMounts.count).toBe(1);
    expect(
      container
        .querySelector('[data-testid="ap-tool-call"]')
        ?.getAttribute("data-output"),
    ).toBe('"done"');
    renderer.unmountAll();
  });

  it("unmounts roots whose container has left the DOM", () => {
    const renderer = createToolCallRenderer();
    const detached = document.createElement("div");
    document.body.appendChild(detached);
    renderInto(renderer, detached, { toolName: "first" });
    detached.remove();

    renderInto(renderer, container, { toolName: "second" });

    expect(detached.innerHTML).toBe("");
    expect(container.innerHTML).not.toBe("");
    renderer.unmountAll();
  });

  it("unmountAll clears every rendered tool call", () => {
    const renderer = createToolCallRenderer();
    renderInto(renderer, container, { toolName: "search" });

    act(() => renderer.unmountAll());

    expect(container.innerHTML).toBe("");
  });
});
