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
      expect(t("loading")).toBe("Connecting to agent...");
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

    it("should have shared translations bundled for English", () => {
      // Only `en` (plus the `keys` debug pseudo-locale) ships real resources
      // today. Asserting other locales here would pass on i18next's English
      // fallback and give a false sense of coverage — add them back as the
      // localization team delivers resource files.
      const t = i18next.getFixedT("en");
      const sharedKeys = ["disclaimer_message", "chat_input_placeholder"];

      for (const key of sharedKeys) {
        const value = t(key);
        expect(value, `en.${key} should be defined`).toBeTruthy();
        expect(value, `en.${key} should not return the key`).not.toBe(key);
      }
    });

    it("should have English translations for new SDK keys", () => {
      const t = i18next.getFixedT("en");
      const newKeys = [
        "error_generic",
        "error_send_message",
        "error_session_start_timeout",
        "error_upload_attachments",
        "error_initialize_chat",
        "error_load_history",
        "error_open_conversation",
        "error_missing_conversation_params",
        "loading",
        "reload",
        "new_chat",
        "feedback_placeholder",
        "feedback_title_required",
        "cancel",
        "submit",
        "tool_confirmation_required",
        "tool_confirmation_confirm",
        "tool_confirmation_status_cancelled",
        "tool_confirmation_status_confirmed",
        "inputs_page_submit_error",
        "inputs_page_intro",
        "inputs_page_starting",
        "inputs_page_start_conversation",
        "agent_schema_show_more",
        "agent_schema_show_less",
        "agent_schema_remove_chip",
        "agent_schema_error_json_object",
        "agent_schema_error_json_syntax",
        "agent_schema_boolean_true",
        "agent_schema_boolean_false",
        "agent_schema_select_placeholder",
        "agent_schema_number_placeholder",
        "agent_schema_text_placeholder",
        "add_to_evaluation_set",
        "add_to_evaluation_set_named",
      ];

      for (const key of newKeys) {
        const value = t(key);
        expect(value, `en.${key} should be defined`).toBeTruthy();
        expect(value, `en.${key} should not return the key`).not.toBe(key);
      }
    });

    it("should fall back to English for unsupported locale", () => {
      const t = i18next.getFixedT("xx");
      expect(t("loading")).toBe("Connecting to agent...");
    });
  });
});
