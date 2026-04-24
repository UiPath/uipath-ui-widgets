import { render, screen, waitFor } from "@testing-library/react";
import {
  apolloMaterialUiThemeDark,
  apolloMaterialUiThemeDarkHC,
  apolloMaterialUiThemeLight,
  apolloMaterialUiThemeLightHC,
} from "@uipath/apollo-react/material/theme";
import type { Theme } from "@mui/material/styles";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsDialogWithProviders } from "../../components/SettingsDialog";
import { initI18n } from "../../i18n";
import type { ConversationalAgentChatTheme } from "../../types";

vi.mock("@mui/material/styles", async () => {
  const actual = await vi.importActual<typeof import("@mui/material/styles")>(
    "@mui/material/styles",
  );
  return { ...actual, createTheme: vi.fn(actual.createTheme) };
});

const { createTheme: mockedCreateTheme } = await import("@mui/material/styles");

beforeAll(() => {
  initI18n();
});

beforeEach(() => {
  vi.clearAllMocks();
});

const makeAgent = () =>
  ({
    user: {
      getSettings: vi.fn().mockResolvedValue({
        userId: "u1",
        name: "Test User",
        email: "test@email.com",
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

describe("SettingsDialogWithProviders", () => {
  it("renders the profile accordion with ProfileSection inside", async () => {
    render(
      <SettingsDialogWithProviders
        conversationalAgent={makeAgent()}
        theme="light"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/profile information/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByDisplayValue("Test User")).toBeInTheDocument(),
    );
  });

  it.each<[ConversationalAgentChatTheme, Theme]>([
    ["light", apolloMaterialUiThemeLight],
    ["light-hc", apolloMaterialUiThemeLightHC],
    ["dark", apolloMaterialUiThemeDark],
    ["dark-hc", apolloMaterialUiThemeDarkHC],
  ])(
    "ports Apollo palette into the MUI v7 theme for %s",
    async (appTheme, apolloSource) => {
      render(
        <SettingsDialogWithProviders
          conversationalAgent={makeAgent()}
          theme={appTheme}
          onClose={vi.fn()}
        />,
      );
      expect(mockedCreateTheme).toHaveBeenCalledWith(
        expect.objectContaining({
          palette: expect.objectContaining({
            mode: apolloSource.palette.mode,
            // Spot-check that Apollo's brand tokens flow through — not just `mode`.
            // If this breaks, the palette port is leaving colors on the table.
            background: apolloSource.palette.background,
            primary: apolloSource.palette.primary,
          }),
        }),
      );
      // Let ProfileSection's async load settle so act() warnings don't leak
      // between tests (the wrapper test doesn't care about loaded state).
      await waitFor(() =>
        expect(screen.getByDisplayValue("Test User")).toBeInTheDocument(),
      );
    },
  );
});
