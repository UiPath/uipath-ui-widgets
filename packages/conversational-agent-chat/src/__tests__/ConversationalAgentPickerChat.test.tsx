/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UiPath } from "@uipath/uipath-typescript/core";
import { ConversationalAgentPickerChat } from "../ConversationalAgentPickerChat";

vi.mock("@uipath/apollo-react/core/fonts/font.css", () => ({}));

const mockTrackTelemetry = vi.fn();
vi.mock("../utils/telemetryUtils", () => ({
  trackTelemetry: (...args: any[]) => mockTrackTelemetry(...args),
}));

// Every render of the inner chat pushes its props here, so prop-forwarding
// assertions can read what the picker actually handed down. The mock also
// exposes a Send button that fires `onUserMessageSent`, which is a callback
// rather than a value and so cannot be asserted from the recorded props alone.
const innerChatProps: any[] = [];

const latestInnerChatProps = () => innerChatProps[innerChatProps.length - 1];

vi.mock("../ConversationalAgentChat", () => ({
  ConversationalAgentChat: (props: any) => {
    innerChatProps.push(props);
    return (
      <div
        data-testid="inner-chat"
        data-agent-id={props.agentId}
        data-folder-id={props.folderId}
      >
        Chat for agent {props.agentId}
        <button
          type="button"
          onClick={() => props.onUserMessageSent?.({ content: "hello there" })}
        >
          Send
        </button>
      </div>
    );
  },
}));

const SAMPLE_AGENTS = [
  { id: 101, name: "Sales Agent", description: "Handles sales", folderId: 1 },
  {
    id: 102,
    name: "Support Agent",
    description: "Customer support help",
    folderId: 1,
  },
  {
    id: 103,
    name: "Billing Agent",
    description: "Invoices and payments",
    folderId: 2,
  },
];

let getAllMock = vi.fn();

vi.mock("@uipath/uipath-typescript/conversational-agent", () => ({
  ConversationalAgent: class {
    getAll = (...args: any[]) => getAllMock(...args);
  },
}));

const ORG = "testorg";
const TENANT = "testtenant";

const createMockSdk = (): UiPath =>
  ({
    config: { orgName: ORG, tenantName: TENANT },
  }) as unknown as UiPath;

const favoritesStorageKey = (orgName = ORG, tenantName = TENANT) =>
  `uipath-ui-widgets.conv-agent-favorites:${encodeURIComponent(orgName)}:${encodeURIComponent(tenantName)}`;

const seedFavorites = (keys: string[]) => {
  window.localStorage.setItem(favoritesStorageKey(), JSON.stringify(keys));
};

const readFavorites = (): string[] => {
  const raw = window.localStorage.getItem(favoritesStorageKey());
  return raw ? JSON.parse(raw) : [];
};

describe("ConversationalAgentPickerChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    innerChatProps.length = 0;
    getAllMock = vi.fn().mockResolvedValue(SAMPLE_AGENTS);
  });

  const selectSalesAgent = async () => {
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByText("Sales Agent"));
    await screen.findByTestId("inner-chat");
  };

  const renderPicker = (props: Partial<any> = {}) =>
    render(<ConversationalAgentPickerChat sdk={createMockSdk()} {...props} />);

  it("renders loading state before fetch resolves", () => {
    getAllMock = vi.fn(() => new Promise(() => {})); // never resolves
    renderPicker();
    expect(screen.getByText("Loading agents...")).toBeInTheDocument();
  });

  it("renders agents after a successful fetch", async () => {
    renderPicker();
    await waitFor(() => {
      expect(screen.getByText("Sales Agent")).toBeInTheDocument();
    });
    expect(screen.getByText("Support Agent")).toBeInTheDocument();
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.getByText("Handles sales")).toBeInTheDocument();
  });

  it("renders error and Reload button on fetch failure", async () => {
    getAllMock = vi.fn().mockRejectedValue(new Error("Network down"));
    renderPicker();
    await waitFor(() => {
      expect(screen.getByText("Network down")).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });

  it("Reload button triggers a refetch", async () => {
    getAllMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network down"))
      .mockResolvedValue(SAMPLE_AGENTS);
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Network down")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByRole("button", { name: "Reload" }));
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    expect(getAllMock).toHaveBeenCalledTimes(2);
  });

  it("renders 'No agents available.' when fetch returns []", async () => {
    getAllMock = vi.fn().mockResolvedValue([]);
    renderPicker();
    await waitFor(() => {
      expect(screen.getByText("No agents available.")).toBeInTheDocument();
    });
  });

  it("filters agents by search query (name match)", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Search agents..."),
      "billing",
    );
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.queryByText("Sales Agent")).not.toBeInTheDocument();
    expect(screen.queryByText("Support Agent")).not.toBeInTheDocument();
  });

  it("filters agents by search query (description match)", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Search agents..."),
      "invoices",
    );
    expect(screen.getByText("Billing Agent")).toBeInTheDocument();
    expect(screen.queryByText("Sales Agent")).not.toBeInTheDocument();
  });

  it("shows 'No agents match your search.' when nothing matches", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.type(
      screen.getByPlaceholderText("Search agents..."),
      "nonexistent",
    );
    expect(
      screen.getByText("No agents match your search."),
    ).toBeInTheDocument();
  });

  it("renders the chat with correct IDs when an agent is selected", async () => {
    const onAgentSelected = vi.fn();
    renderPicker({ onAgentSelected });
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByText("Sales Agent"));
    const chat = await screen.findByTestId("inner-chat");
    expect(chat).toHaveAttribute("data-agent-id", "101");
    expect(chat).toHaveAttribute("data-folder-id", "1");
    expect(onAgentSelected).toHaveBeenCalledWith(SAMPLE_AGENTS[0]);
  });

  it("Back button returns to the picker from a selected agent", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByText("Sales Agent"));
    await screen.findByTestId("inner-chat");
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.queryByTestId("inner-chat")).not.toBeInTheDocument();
    expect(screen.getByText("Sales Agent")).toBeInTheDocument();
  });

  it("renders pre-seeded favorites in the Favorites section", async () => {
    seedFavorites(["1-101"]); // folderId-id for Sales Agent
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("All Agents")).toBeInTheDocument();
  });

  it("toggling a favorite persists to localStorage", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    const stars = screen.getAllByLabelText("Add to favorites");
    expect(stars).toHaveLength(SAMPLE_AGENTS.length);
    await userEvent.click(stars[0]); // Sales Agent is first in SAMPLE_AGENTS
    expect(readFavorites()).toEqual(["1-101"]);
  });

  it("fires SelectAgent telemetry with agent IDs on selection", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    await userEvent.click(screen.getByText("Sales Agent"));
    expect(mockTrackTelemetry).toHaveBeenCalledWith(
      "CAC.SelectAgent",
      "CAC.Success",
      { agentId: 101, folderId: 1 },
    );
  });

  it("fires LoadAgents telemetry on successful fetch", async () => {
    renderPicker();
    await waitFor(() =>
      expect(screen.getByText("Sales Agent")).toBeInTheDocument(),
    );
    expect(mockTrackTelemetry).toHaveBeenCalledWith(
      "CAC.LoadAgents",
      "CAC.Success",
      { agentCount: 3 },
    );
  });

  it("forwards surfaceName and surfaceVersion to the inner chat", async () => {
    renderPicker({
      surfaceName: "teams_agent_chat",
      surfaceVersion: "2.0.1",
    });
    await selectSalesAgent();

    expect(latestInnerChatProps()).toMatchObject({
      surfaceName: "teams_agent_chat",
      surfaceVersion: "2.0.1",
    });
  });

  it("forwards surfaceName alone when surfaceVersion is omitted", async () => {
    renderPicker({ surfaceName: "teams_agent_chat" });
    await selectSalesAgent();

    expect(latestInnerChatProps()).toMatchObject({
      surfaceName: "teams_agent_chat",
      surfaceVersion: undefined,
    });
  });

  it("leaves the surface props undefined on the inner chat when the host omits them", async () => {
    renderPicker();
    await selectSalesAgent();

    const props = latestInnerChatProps();
    expect(props.surfaceName).toBeUndefined();
    expect(props.surfaceVersion).toBeUndefined();
    expect(props.onUserMessageSent).toBeUndefined();
  });

  it("forwards onUserMessageSent and invokes it when a message is sent", async () => {
    const onUserMessageSent = vi.fn();
    renderPicker({ onUserMessageSent });
    await selectSalesAgent();

    expect(latestInnerChatProps().onUserMessageSent).toBe(onUserMessageSent);
    expect(onUserMessageSent).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onUserMessageSent).toHaveBeenCalledWith({ content: "hello there" });
  });
});
