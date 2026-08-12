import i18next, { type i18n as I18nInstance } from "i18next";

import en from "./locales/en/index.json";
import keys from "./locales/keys/index.json";

let instance: I18nInstance | undefined;

/**
 * The widget owns a private i18next instance instead of initializing the shared
 * default one.
 *
 * A host that owns i18next (Studio Web, flow-workbench) initializes the default
 * instance before this module loads. Initializing it ourselves would either be
 * skipped — leaving every string rendering as its raw key — or clobber the
 * host's configuration, depending on who won the race.
 *
 * Deliberately no `.use(initReactI18next)`: that plugin sets react-i18next's
 * global default instance, which would hijack the host's. Components read this
 * instance explicitly (`useTranslation(ns, { i18n })`) or through the
 * `<I18nextProvider>` the widget renders around its subtrees.
 */
export const getI18n = (): I18nInstance => {
  if (instance) return instance;

  const created = i18next.createInstance();
  created.init(
    {
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      resources: {
        en: { translation: en },
        keys: { translation: keys },
      },
    },
    // Callback forces synchronous init when resources are bundled
    () => {},
  );
  instance = created;

  return created;
};

/** Back-compat: eagerly create the instance at module load. */
export const initI18n = () => {
  getI18n();
};
