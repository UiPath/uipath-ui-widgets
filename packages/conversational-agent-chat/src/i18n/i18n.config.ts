import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/index.json";
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
        keys: { translation: keys },
      },
    },
    // Callback forces synchronous init when resources are bundled
    () => {},
  );
};
