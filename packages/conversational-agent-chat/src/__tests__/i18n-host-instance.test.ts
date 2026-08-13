import { describe, it, expect, beforeAll } from "vitest";
import i18next from "i18next";
import { getI18n as getReactI18nDefault } from "react-i18next";
import { initReactI18next } from "react-i18next";

import { getI18n } from "../i18n";

/**
 * Reproduces the Studio Web / flow-workbench integration.
 *
 * A host that owns i18next initializes the shared default instance before the
 * widget module is imported. The widget must still resolve its own catalog, and
 * must not take over react-i18next's global default instance in the process —
 * doing either to the other host breaks that host's translations.
 *
 * This lives in its own file because vitest isolates module state per file, so
 * the host can win the init race here without affecting the rest of the suite.
 */
describe("widget i18n vs. a host-owned i18next", () => {
  // Imported below rather than at the top of the file so the host wins the init
  // race first, as it does in production. Pulling in the renderer drags in React
  // and the widget tree, which costs seconds under parallel load — hence the
  // import lives in the hook, clear of the 5s per-test timeout.
  let resolveClientSideToolLabels: typeof import("../components/ClientSideToolRenderer").resolveClientSideToolLabels;

  beforeAll(async () => {
    // The host gets there first, exactly as studio's i18n.config.ts does.
    await i18next.use(initReactI18next).init({
      lng: "en",
      fallbackLng: "en",
      defaultNS: "host",
      ns: ["host"],
      resources: { en: { host: { host_probe_key: "HOST STRING" } } },
    });

    ({ resolveClientSideToolLabels } =
      await import("../components/ClientSideToolRenderer"));
  }, 30_000);

  it("keeps the host's instance as react-i18next's default", () => {
    const before = getReactI18nDefault();
    getI18n();
    expect(getReactI18nDefault()).toBe(before);
  });

  it("does not initialize on the host's shared default instance", () => {
    expect(i18next.isInitialized).toBe(true);
    expect(getI18n()).not.toBe(i18next);
  });

  it("resolves its own strings even though the host won the init race", () => {
    const t = getI18n().getFixedT(null, null);
    expect(t("chat_input_placeholder")).toBe("Talk with your agent...");
    expect(t("disclaimer_message")).toBe(
      "Agents can make mistakes. Please double check the responses.",
    );
  });

  it("leaves the host's own catalog intact", () => {
    expect(i18next.getFixedT(null, "host")("host_probe_key")).toBe(
      "HOST STRING",
    );
  });

  it("reuses one instance across calls", () => {
    expect(getI18n()).toBe(getI18n());
  });

  // Imperative renderers mount their own React roots, so they resolve labels
  // through a bare `t()` rather than a hook. Reaching for the shared default
  // instance there yields `undefined` labels — blank buttons in the widget —
  // whenever the widget owns its catalog privately, as it does here.
  it("resolves client-side tool labels off the widget's own instance", () => {
    expect(resolveClientSideToolLabels()).toEqual({
      submit: "Submit",
      cancel: "Cancel",
      description: "Fill in the fields below and submit to continue.",
    });
  });
});
