import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import de from "./locales/de/index.json";
import en from "./locales/en/index.json";
import es from "./locales/es/index.json";
import esMX from "./locales/es-mx/index.json";
import fr from "./locales/fr/index.json";
import ja from "./locales/ja/index.json";
import ko from "./locales/ko/index.json";
import pt from "./locales/pt/index.json";
import ptBR from "./locales/pt-br/index.json";
import ru from "./locales/ru/index.json";
import tr from "./locales/tr/index.json";
import zhCN from "./locales/zh-cn/index.json";
import zhTW from "./locales/zh-tw/index.json";
import keys from "./locales/keys/index.json";

// Initialize i18next with bundled resources. Passing a callback to init()
// forces synchronous initialization so getFixedT() works immediately.
export const initI18n = () => {
  if (i18next.isInitialized) return;
  i18next.use(initReactI18next).init(
    {
      lng: "en",
      fallbackLng: "en",
      interpolation: {
        escapeValue: false,
      },
      resources: {
        en: { translation: en },
        es: { translation: es },
        de: { translation: de },
        fr: { translation: fr },
        ja: { translation: ja },
        ko: { translation: ko },
        pt: { translation: pt },
        "pt-BR": { translation: ptBR },
        "es-MX": { translation: esMX },
        ru: { translation: ru },
        tr: { translation: tr },
        "zh-CN": { translation: zhCN },
        "zh-TW": { translation: zhTW },
        keys: { translation: keys },
      },
    },
    // Callback forces synchronous init when resources are bundled
    () => {},
  );
};
