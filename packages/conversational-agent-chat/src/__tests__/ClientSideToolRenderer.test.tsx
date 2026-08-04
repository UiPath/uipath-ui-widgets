import type { AutopilotChatMessage } from "@uipath/apollo-react/material/components";
import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import {
  createClientSideToolRenderer,
  resolveClientSideToolLabels,
} from "../components/ClientSideToolRenderer";
import { initI18n } from "../i18n";

beforeAll(() => {
  initI18n();
});

const makeMessage = (
  metaOverrides: Record<string, unknown> = {},
): AutopilotChatMessage =>
  ({
    id: "test-msg",
    meta: {
      toolName: "create_plan",
      inputSchema: { type: "object", properties: {} },
      defaultValues: {},
      isCompleted: false,
      onSubmit: vi.fn(),
      onCancel: vi.fn(),
      ...metaOverrides,
    },
  }) as unknown as AutopilotChatMessage;

describe("resolveClientSideToolLabels", () => {
  it("returns default labels when no overrides are provided", () => {
    const labels = resolveClientSideToolLabels();
    expect(labels.submit).toBeTruthy();
    expect(labels.cancel).toBeTruthy();
    expect(labels.description).toBeTruthy();
  });

  it("applies overrides", () => {
    const labels = resolveClientSideToolLabels({ submit: "Go" });
    expect(labels.submit).toBe("Go");
  });
});

describe("createClientSideToolRenderer", () => {
  let container: HTMLElement;

  beforeAll(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    // Clear container content between tests
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  });

  it("renders the widget into the container", async () => {
    const renderer = createClientSideToolRenderer();
    renderer.render(container, makeMessage());
    await vi.waitFor(() => {
      expect(container.querySelector("button")).not.toBeNull();
    });
  });

  it("does not re-render if the container already has a root", () => {
    const renderer = createClientSideToolRenderer();
    const message = makeMessage();
    renderer.render(container, message);
    // Second render should be a no-op (no error thrown)
    renderer.render(container, message);
  });

  it("skips rendering when message has no meta", () => {
    const renderer = createClientSideToolRenderer();
    const message = { id: "no-meta" } as unknown as AutopilotChatMessage;
    renderer.render(container, message);
    expect(container.childNodes.length).toBe(0);
  });

  it("unmounts the root when isCompleted is true", async () => {
    const renderer = createClientSideToolRenderer();
    renderer.render(container, makeMessage());
    await vi.waitFor(() => {
      expect(container.querySelector("button")).not.toBeNull();
    });

    renderer.render(container, makeMessage({ isCompleted: true }));
    await vi.waitFor(() => {
      expect(container.querySelector("button")).toBeNull();
    });
  });

  it("unmountAll clears all roots", async () => {
    const renderer = createClientSideToolRenderer();
    renderer.render(container, makeMessage());
    await vi.waitFor(() => {
      expect(container.querySelector("button")).not.toBeNull();
    });
    renderer.unmountAll();
    await vi.waitFor(() => {
      expect(container.querySelector("button")).toBeNull();
    });
  });

  it("calls meta.onSubmit when the widget submit is triggered", async () => {
    const onSubmit = vi.fn();
    const renderer = createClientSideToolRenderer();
    renderer.render(
      container,
      makeMessage({
        onSubmit,
        inputSchema: {
          type: "object",
          properties: { name: { type: "string", title: "Name" } },
        },
        defaultValues: { name: "test" },
      }),
    );
    await vi.waitFor(() => {
      expect(container.querySelector("button")).not.toBeNull();
    });
    const buttons = container.querySelectorAll("button");
    const submitBtn = buttons[buttons.length - 1];
    submitBtn.click();
    await vi.waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });
  });

  it("calls meta.onCancel when the widget cancel is triggered", async () => {
    const onCancel = vi.fn();
    const renderer = createClientSideToolRenderer();
    renderer.render(container, makeMessage({ onCancel }));
    await vi.waitFor(() => {
      expect(container.querySelector("button")).not.toBeNull();
    });
    const buttons = container.querySelectorAll("button");
    const cancelBtn = buttons[0];
    cancelBtn.click();
    await vi.waitFor(() => {
      expect(onCancel).toHaveBeenCalled();
    });
  });
});
