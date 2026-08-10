import { useTranslation } from "react-i18next";

import { getI18n } from "./i18n.config";

/**
 * `useTranslation` bound to the widget's own i18next instance.
 *
 * Use this instead of a bare `useTranslation()` anywhere in the widget. A bare
 * call resolves against react-i18next's global default instance, which belongs
 * to the host when the host owns i18next (Studio Web) — and the widget's
 * catalog isn't registered there, so every string renders as its raw key.
 *
 * Binding the instance here rather than relying on an `<I18nextProvider>` also
 * keeps the widget's separate React roots (settings dialog, tool confirmation)
 * working, since those inherit no context from the tree above them.
 */
export const useWidgetTranslation = () =>
  useTranslation(undefined, { i18n: getI18n() });
