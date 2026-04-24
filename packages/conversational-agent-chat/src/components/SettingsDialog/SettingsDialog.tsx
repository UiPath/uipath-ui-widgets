import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  SvgIcon,
} from "@mui/material";
import { createTheme, type Theme, ThemeProvider } from "@mui/material/styles";
import {
  apolloMaterialUiThemeDark,
  apolloMaterialUiThemeDarkHC,
  apolloMaterialUiThemeLight,
  apolloMaterialUiThemeLightHC,
} from "@uipath/apollo-react/material/theme";
import type { ConversationalAgent } from "@uipath/uipath-typescript/conversational-agent";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { ConversationalAgentChatTheme } from "../../types";
import { ProfileSection } from "./ProfileSection";

// Apollo publishes its MUI themes against v5, but the widget runs on MUI v7
// (peer dep). A v5 theme object can't be handed to v7's ThemeProvider — v7
// components call helpers like `theme.alpha()` that v5 doesn't expose the same
// way. The palette _values_ are plain data, though, so we re-hydrate them into
// a fresh v7 theme via `createTheme`. That keeps Apollo's brand colors without
// dragging in the v5 helper shape.
//
// Why v7 instead of matching Apollo's v5:
//   - React 19 (our peer dep) requires MUI v6+; v5 isn't an option.
//   - Host apps are moving to v6/v7. Shipping v5 would force bundle duplication
//     or host downgrades.
//   - Apollo is the outlier here; when it ships v6+/v7-compatible themes, this
//     helper becomes a one-line swap to pass-through.
//
// Inferred type intentionally — Apollo's Theme is typed against v5 and won't
// assign to v7's Theme type, but we only read palette/typography/shape data
// from it, never hand it to a v7 consumer directly.
const APOLLO_V5_THEMES = {
  light: apolloMaterialUiThemeLight,
  "light-hc": apolloMaterialUiThemeLightHC,
  dark: apolloMaterialUiThemeDark,
  "dark-hc": apolloMaterialUiThemeDarkHC,
} as const;

const toMuiV7Theme = (appTheme: ConversationalAgentChatTheme): Theme => {
  const { palette: p, typography, shape } = APOLLO_V5_THEMES[appTheme];
  return createTheme({
    palette: {
      mode: p.mode,
      primary: p.primary,
      secondary: p.secondary,
      error: p.error,
      warning: p.warning,
      info: p.info,
      success: p.success,
      background: p.background,
      text: p.text,
      divider: p.divider,
      action: p.action,
      grey: p.grey,
      common: p.common,
    },
    typography: { fontFamily: typography.fontFamily },
    shape: { borderRadius: shape.borderRadius },
  });
};

const ExpandMoreIcon = () => (
  <SvgIcon viewBox="0 0 24 24">
    <path
      d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6z"
      fill="currentColor"
    />
  </SvgIcon>
);

export interface SettingsDialogProps {
  conversationalAgent: ConversationalAgent;
  theme: ConversationalAgentChatTheme;
  onClose: () => void;
}

/**
 * Settings content rendered inline into Apollo's settings panel via
 * `AutopilotChatService`'s `settingsRenderer` config. Apollo owns the panel
 * chrome (header, back/close, backdrop); this component just fills the body.
 */
export const SettingsDialog = ({
  conversationalAgent,
  onClose,
}: SettingsDialogProps) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2 }}>
      <Accordion defaultExpanded disableGutters elevation={0} square>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          {t("profile_information_title")}
        </AccordionSummary>
        <AccordionDetails>
          <ProfileSection
            conversationalAgent={conversationalAgent}
            onSaved={onClose}
          />
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

/**
 * Wraps {@link SettingsDialog} with the MUI theme.
 *
 * Required when mounted via `createRoot` into Apollo's settings container —
 * a new React root doesn't inherit context from the enclosing tree, so theme
 * must be re-provided here.
 */
export const SettingsDialogWithProviders = (props: SettingsDialogProps) => {
  const muiTheme = useMemo(() => toMuiV7Theme(props.theme), [props.theme]);
  return (
    <ThemeProvider theme={muiTheme}>
      <SettingsDialog {...props} />
    </ThemeProvider>
  );
};
