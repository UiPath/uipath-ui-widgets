import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { initI18n } from "../../i18n";
import { ProfileSection } from "../../components/SettingsDialog/ProfileSection";

beforeAll(() => {
  initI18n();
});

const makeAgent = (overrides: Record<string, unknown> = {}) => {
  const getSettings = vi.fn().mockResolvedValue({
    userId: "u1",
    name: "Test User",
    email: "user@example.com",
    role: null,
    department: null,
    company: "Test Company",
    country: "US",
    timezone: "America/Los_Angeles",
    createdTime: "2026-01-01T00:00:00Z",
    updatedTime: "2026-01-01T00:00:00Z",
    ...overrides,
  });
  const updateSettings = vi.fn().mockImplementation(async (patch) => ({
    ...(await getSettings()),
    ...patch,
  }));
  return {
    agent: {
      user: { getSettings, updateSettings },
    } as unknown as ConversationalAgent,
    getSettings,
    updateSettings,
  };
};

describe("ProfileSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and renders profile fields", async () => {
    const { agent } = makeAgent();
    render(<ProfileSection conversationalAgent={agent} />);
    expect(await screen.findByDisplayValue("Test User")).toBeInTheDocument();
    expect(screen.getByDisplayValue("user@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Company")).toBeInTheDocument();
  });

  it("disables save until a field is edited", async () => {
    const { agent } = makeAgent();
    render(<ProfileSection conversationalAgent={agent} />);
    const save = await screen.findByRole("button", { name: /save changes/i });
    expect(save).toBeDisabled();
  });

  it("saves edited fields and calls onSaved", async () => {
    const { agent, updateSettings } = makeAgent();
    const onSaved = vi.fn();
    render(<ProfileSection conversationalAgent={agent} onSaved={onSaved} />);
    const nameInput = await screen.findByDisplayValue("Test User");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Name");
    const save = screen.getByRole("button", { name: /save changes/i });
    await userEvent.click(save);
    await waitFor(() => expect(updateSettings).toHaveBeenCalled());
    expect(updateSettings.mock.calls[0][0]).toMatchObject({
      name: "Updated Name",
    });
    expect(onSaved).toHaveBeenCalled();
  });

  it("shows load error when getSettings rejects", async () => {
    const getSettings = vi.fn().mockRejectedValue(new Error("boom"));
    const agent = {
      user: { getSettings, updateSettings: vi.fn() },
    } as unknown as ConversationalAgent;
    render(<ProfileSection conversationalAgent={agent} />);
    expect(
      await screen.findByText(/failed to load profile/i),
    ).toBeInTheDocument();
  });

  it("only sends changed fields on save (PATCH semantics)", async () => {
    const { agent, updateSettings } = makeAgent();
    render(<ProfileSection conversationalAgent={agent} />);
    const nameInput = await screen.findByDisplayValue("Test User");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Updated Name");
    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i }),
    );
    await waitFor(() => expect(updateSettings).toHaveBeenCalled());
    expect(updateSettings.mock.calls[0][0]).toEqual({ name: "Updated Name" });
  });

  it("disables save when email is invalid", async () => {
    const { agent } = makeAgent();
    render(<ProfileSection conversationalAgent={agent} />);
    const emailInput = await screen.findByDisplayValue("user@example.com");
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "not-an-email");
    expect(
      screen.getByRole("button", { name: /save changes/i }),
    ).toBeDisabled();
    expect(
      screen.getByText(/enter a valid email address/i),
    ).toBeInTheDocument();
  });
});
