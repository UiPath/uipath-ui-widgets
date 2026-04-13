import { describe, it, expect, beforeAll } from "vitest";
import { initI18n } from "../i18n";
import i18next from "i18next";

beforeAll(() => {
  initI18n();
});

describe("i18n", () => {
  describe("t() translation", () => {
    it("should return English translations by default", () => {
      const t = i18next.getFixedT("en");
      expect(t("loading")).toBe("Loading...");
      expect(t("cancel")).toBe("Cancel");
    });

    it("should return key names for keys locale", () => {
      const t = i18next.getFixedT("keys");
      expect(t("loading")).toBe("loading");
      expect(t("cancel")).toBe("cancel");
    });

    it("should interpolate values", () => {
      const t = i18next.getFixedT("en");
      expect(t("error_send_message", { errorMessage: "timeout" })).toBe(
        "Failed to send message: timeout",
      );
    });

    it("should have react-sdk translations for all locales", () => {
      const locales = [
        "en",
        "es",
        "de",
        "fr",
        "ja",
        "ko",
        "pt",
        "pt-BR",
        "es-MX",
        "ru",
        "tr",
        "zh-CN",
        "zh-TW",
      ];
      // Keys that exist in react-sdk locale files (professionally translated)
      const reactSdkKeys = [
        "disclaimer_message",
        "chat_input_placeholder",
        "feedback_title",
        "feedback_optional",
      ];

      for (const locale of locales) {
        const t = i18next.getFixedT(locale);
        for (const key of reactSdkKeys) {
          const value = t(key);
          expect(value, `${locale}.${key} should be defined`).toBeTruthy();
          expect(value, `${locale}.${key} should not return the key`).not.toBe(
            key,
          );
        }
      }
    });

    it("should have English translations for new SDK keys", () => {
      const t = i18next.getFixedT("en");
      const newKeys = [
        "error_generic",
        "error_send_message",
        "error_upload_attachments",
        "error_initialize_chat",
        "error_load_history",
        "error_open_conversation",
        "loading",
        "reload",
        "new_chat",
        "feedback_placeholder",
        "cancel",
        "submit",
      ];

      for (const key of newKeys) {
        const value = t(key);
        expect(value, `en.${key} should be defined`).toBeTruthy();
        expect(value, `en.${key} should not return the key`).not.toBe(key);
      }
    });

    it("should fall back to English for unsupported locale", () => {
      const t = i18next.getFixedT("xx");
      expect(t("loading")).toBe("Loading...");
    });
  });
});
