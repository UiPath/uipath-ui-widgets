import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "../../components/SettingsDialog";
import { initI18n } from "../../i18n";

beforeAll(() => {
  initI18n();
});

const makeAgent = () =>
  ({
    user: {
      getSettings: vi.fn().mockResolvedValue({
        userId: "u1",
        name: "Test User",
        email: "user@example.com",
        role: "",
        department: "",
        company: "",
        country: "",
        timezone: "",
        createdTime: "2026-01-01T00:00:00Z",
        updatedTime: "2026-01-01T00:00:00Z",
      }),
      updateSettings: vi.fn(),
    },
  }) as unknown as ConversationalAgent;

describe("SettingsDialog", () => {
  it("renders the profile section heading", async () => {
    render(
      <SettingsDialog
        profileResetKey="test"
        conversationalAgent={makeAgent()}
        onClose={vi.fn()}
      />,
    );
    const trigger = screen.getByRole("button", {
      name: /profile information/i,
    });
    expect(trigger).toBeInTheDocument();
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument(),
    );
  });
});
