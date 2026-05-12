import { render, screen, waitFor } from "@testing-library/react";
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
    expect(screen.getByText(/profile information/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument(),
    );
  });
});
