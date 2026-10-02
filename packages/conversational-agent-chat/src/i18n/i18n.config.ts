import i18next, { type i18n as I18nInstance } from "i18next";

// Locale JSON lives in lower-case folders (as the localization pipeline writes
// them), but is registered under the BCP-47 casing Apollo's SupportedLocale and
// the portal use (e.g. `zh-CN`), so the `locale` prop can be forwarded verbatim.
import de from "./locales/de/index.json";
import en from "./locales/en/index.json";
import es from "./locales/es/index.json";
import esMX from "./locales/es-mx/index.json";
import fr from "./locales/fr/index.json";
import ja from "./locales/ja/index.json";
import keys from "./locales/keys/index.json";
import ko from "./locales/ko/index.json";
import pt from "./locales/pt/index.json";
import ptBR from "./locales/pt-br/index.json";
import ro from "./locales/ro/index.json";
import tr from "./locales/tr/index.json";
import zhCN from "./locales/zh-cn/index.json";
import zhTW from "./locales/zh-tw/index.json";

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
        de: { translation: de },
        es: { translation: es },
        "es-MX": { translation: esMX },
        fr: { translation: fr },
        ja: { translation: ja },
        ko: { translation: ko },
        pt: { translation: pt },
        "pt-BR": { translation: ptBR },
        ro: { translation: ro },
        tr: { translation: tr },
        "zh-CN": { translation: zhCN },
        "zh-TW": { translation: zhTW },
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
